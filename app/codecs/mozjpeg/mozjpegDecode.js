/**
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import mozjpeg_node_dec from './mozjpeg_node_dec.js';
import { initEmscriptenModule } from './worker-utils.js';
let emscriptenModule;
export default async function decode(data) {
    if (!emscriptenModule) {
        emscriptenModule = initEmscriptenModule(mozjpeg_node_dec);
    }
    const module = await emscriptenModule;

    // for (const functionName in module) {
    //      console.log(functionName);
    // }
    //const resultView = module.encode(data.data, data.width, data.height, options);
    const resultView = module.decode(data);

    // wasm can’t run on SharedArrayBuffers, so we hard-cast to ArrayBuffer.
    return resultView;
}
