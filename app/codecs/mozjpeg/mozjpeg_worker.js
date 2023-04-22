import encode from "./mozjpegEncode.js";

self.Module = {
    //wasmBinaryFile: './mozjpeg_enc.wasm',
    print: log,
    printErr: logError,
    onRuntimeInitialized: function () {
        // 在 WebAssembly 模块初始化完成后发送 'ready' 消息
        console.log("onRuntimeInitialized");
        self.postMessage({ type: 'ready' });
    }
};
//console.log("mozjpeg_worker.js");
//importScripts('./mozjpegEncode.js');

self.onmessage = e => {
    switch (e.data.type) {
        case 'image':
            processImage(e.data);
            break;
    }
};

async function processImage (args) {
    const { rgbData, width, height, fileSize, options } = args;
    try {
        //console.log("beginEncode");
        const compressed = await encode(rgbData,width,height,options);

        const compressedSize = compressed.byteLength;
        const percentage = (compressedSize / fileSize * 100).toFixed(1);
        log(`Compressed: ${fileSize} -> ${compressedSize} bytes (${percentage}%)`);
        self.postMessage({ type: 'result', result: compressed });
        //console.log(result);
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

self.postMessage({ type: 'ready' });