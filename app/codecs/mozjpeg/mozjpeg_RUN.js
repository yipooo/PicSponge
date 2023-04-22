import {defaultOptions as mozjpegOptions} from "./mozjpegMeta.js";
//import encode from "./mozjpegEncode.js";
import decode from "./mozjpegDecode.js";

// const decodeJPG = async (inputImage) => {
//     //const arraybuffType = getFormatFromArrayBuffer(inputImage);
//     const resultDec = await decode(inputImage);
//     return resultDec;
// }

// const encodeJPG = async (inputImage) => {
//       const fileLength = inputImage.byteLength / 8 / (1024 * 1024);
//       console.log(`压缩前 ${fileLength} MB`);

//       const decodeImg = await decodeJPG(inputImage);
//       //console.log(decodeImg);
//       const result = await encode(decodeImg.data,decodeImg.width,decodeImg.height,mozjpegOptions);
//       return result;
// }

export const mozjpegEncode = async (workerPool,inputImage) => {
    // const fileLength = inputImage.byteLength / 8 / (1024 * 1024);
    // console.log(`压缩前 ${fileLength} MB`);
    return new Promise(async (resolve, reject) => {
        const decodeImg = await decode(inputImage);

        // const fileBeforeLength = inputImage.byteLength / 8 / (1024 * 1024);
        // console.log(`压缩前 ${fileBeforeLength} MB`);

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
            options: mozjpegOptions,
        };
        // const result = await encode(decodeImg.data,decodeImg.width,decodeImg.height,mozjpegOptions);
        //resolve(result);
        //console.log(currentTask)
        workerPool.enqueueTask(currentTask,'mozjpeg',onMessageCallback);
        workerPool.addWorker('./app/codecs/mozjpeg/mozjpeg_worker.js','mozjpeg','module');
    });
}

