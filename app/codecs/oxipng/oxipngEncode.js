import checkThreadsSupport from './oxipng-supports-wasm-threads.js';
async function initMT() {
    const { default: init, initThreadPool, optimise, } = await import('./pkg-parallel/squoosh_oxipng.js');
    await init();
    await initThreadPool(navigator.hardwareConcurrency);
    return optimise;
}
async function initST() {
    const { default: init, optimise } = await import('./pkg/squoosh_oxipng.js');
    await init();
    return optimise;
}
let wasmReady;
export default async function OXIPNGencode(data, options) {
    if (!wasmReady) {
        wasmReady = checkThreadsSupport().then((hasThreads) => hasThreads ? initMT() : initST());
    }
    const optimise = await wasmReady;
    //console.log(data)new Uint8Array(data)

    return optimise(new Uint8Array(data), options.level, options.interlace)
        .buffer;
}
