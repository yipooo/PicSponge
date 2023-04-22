self.Module = {
    wasmBinaryFile: './dist/image_compressor.wasm',
    print: log,
    printErr: logError,
    onRuntimeInitialized: function () {
        // 在 WebAssembly 模块初始化完成后发送 'ready' 消息
        self.postMessage({ type: 'ready' });
    }
};

//console.log(`Worker ${self.id} started.`);

importScripts('./dist/image_compressor.js');

self.onmessage = e => {
    //console.log(e)
    switch (e.data.type) {
        case 'image':
            //console.log(e.data)
            processImage(e.data);
            break;
    }
};

function processImage(args) {
    //console.log("node")
    const { rgbData, width, height, fileSize, options } = args;
    try {
        //log(`Working...`);
        const buffer = Module._malloc(rgbData.byteLength);
        Module.HEAPU8.set(rgbData, buffer);
        if (rgbData.byteLength !== width * height * 4) {
            self.postMessage({ type: 'error', error: `Invalid data length: ${rgbData.byteLength}, expected ${width * height * 4}` });
            return;
        }
        const compressedSizePointer = Module._malloc(4);
        const { maxColors, dithering } = options;
        const result = Module._compress(width, height, maxColors, dithering, buffer, compressedSizePointer);
        if (result) {
            self.postMessage({ type: 'error', error: `Compression error: ${result}` });
        } else {
            const compressedSize = Module.getValue(compressedSizePointer, 'i32', false);
            const percentage = (compressedSize / fileSize * 100).toFixed(1);
            log(`Compressed: ${fileSize} -> ${compressedSize} bytes (${percentage}%)`);
            const compressed = new Uint8Array(compressedSize);
            compressed.set(Module.HEAPU8.subarray(buffer, buffer + compressedSize));
            self.postMessage({ type: 'result', result: compressed });
        }
        Module._free(buffer);
        Module._free(compressedSizePointer);
    } catch (e) {
        console.log("error");
        logError(e.toString());
    }
}

function log(msg) {
    console.log(msg);
    self.postMessage({ type: 'log', msg });
}

function logError(msg) {
    console.log(msg);
    self.postMessage({ type: 'logError', msg });
}


//self.postMessage({ type: 'ready' });

