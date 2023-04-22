import {defaultOptions as wasmOptions} from "./wasmpngMeta.js";

const decodePngWithLibpng = async (data) =>{

    const res  = await UPNG.decode(data);
    const w = res.width;
    const h = res.height;
    const rgba = await UPNG.toRGBA8(res)[0];

    const imageData = new ImageData(w, h);
    imageData.data.set(new Uint8ClampedArray(rgba));

    //console.log(imageData);

    //return { width: w, height: h, data: res.data };
    return { width: w, height: h, data: imageData.data };
}


const decodeJPG = async (inputImage) => {
    //const arraybuffType = getFormatFromArrayBuffer(inputImage);
    // if(arraybuffType == 'png'){
    //       const resultDec = await decodePngWithLibpng(inputImage);
    //       return resultDec;
    // }else if(arraybuffType == 'jpeg'){
    //       //console.log(inputImage)
    //       const resultDec = await decode(inputImage);
    //       //console.log(resultDec);
    //       return resultDec;
    // }else{
    //       console.log("error");
    // }
    // // const resultDec = await decode(inputImage);
    // // return resultDec;
    const resultDec = await decodePngWithLibpng(inputImage);
    return resultDec;
}


export const wasmpngEncode = async (workerPool,inputImage) => {
    return new Promise(async (resolve, reject) => {

        // const fileLength = inputImage.byteLength / 8 / (1024 * 1024);
        // console.log(`压缩前 ${fileLength} MB`);

        const decodeImg = await decodeJPG(inputImage);

        const onMessageCallback = (e) => {
            switch (e.data.type) {
                case 'result':
                    // const fileAfterLength = e.data.result.byteLength / 8 / (1024 * 1024);
                    // console.log(`压缩后 ${fileAfterLength} MB`);
                    workerPool.removeWorker(e.target.id);
                    resolve(e.data.result);
                    break;
            }
        };

        const currentTask = {
            type: 'image',
            width: decodeImg.width,
            height: decodeImg.height,
            rgbData: decodeImg.data,
            fileSize: inputImage.byteLength,
            options: wasmOptions,
        };
        
        workerPool.enqueueTask(currentTask, 'wasmpng',onMessageCallback);
        workerPool.addWorker('./app/codecs/wasmpng/worker.js','wasmpng','script');
    });
}
