
//import OXIPNGencode from "./app/codecs/oxipng/oxipngEncode.js";      // 无损的 OXIPNG 编码

import {wasmpngEncode} from "./app/codecs/wasmpng/wasmpng_RUN.js";    // 无损的 WASMPNG 编码
import {mozjpegEncode} from "./app/codecs/mozjpeg/mozjpeg_RUN.js";  

import { WorkerPool } from './workerPool.js';

const downloadButton = document.getElementById('downloadButton');
const canvas = document.getElementById('displayImg');
const inputImage = document.getElementById('inputImage');
const dropImage = document.getElementById('upload-area');
//const worker = await new Worker('./app/codecs/wasmpng/worker.js');


//建立任务池
const initialWorkerCount = 3;
const workerPool = new WorkerPool('./workerPool.js', initialWorkerCount);
//workerPool.addWorker('./app/codecs/wasmpng/worker.js','wasmpng');

//类型判断
const getFormatFromArrayBuffer = (buffer) => {
      const uint8 = new Uint8Array(buffer);
      if (
            uint8[0] === 0x89 &&
            uint8[1] === 0x50 &&
            uint8[2] === 0x4e &&
            uint8[3] === 0x47 &&
            uint8[4] === 0x0d &&
            uint8[5] === 0x0a &&
            uint8[6] === 0x1a &&
            uint8[7] === 0x0a
      ) {
            return 'png';
      }
      if (uint8[0] === 0xff && uint8[1] === 0xd8) {
            return 'jpeg';
      }
      return null;
}    

//       // 无损的 OXIPNG 编码
//       // const decodeImg = await decodeJPG(inputImage,options);
//       // const result = await OXIPNGencode(inputImage,options);
      
// }

//图片压缩功能
const compress = async (inputImage, options) => {
      //const compressedImage = await encodeJPG(inputImage, options);
      
      const arraybuffType = getFormatFromArrayBuffer(inputImage);

      if(arraybuffType == 'png'){
            const compressedImage = await wasmpngEncode(workerPool,inputImage);
            //const fileLength = compressedImage.byteLength / 8 / (1024 * 1024);
            //console.log(`压缩后 ${fileLength} MB`);
            //const resultDec = await decodePngWithLibpng(inputImage);
            return compressedImage;
      }else if(arraybuffType == 'jpeg'){
            //console.log(inputImage)
            const compressedImage = await mozjpegEncode(workerPool,inputImage);
            //console.log(compressedImage)
            //const fileLength = compressedImage.byteLength / 8 / (1024 * 1024);
            //console.log(`压缩后 ${fileLength} MB`);
            //const resultDec = await decode(inputImage);
            //console.log(resultDec);
            return compressedImage;
      }else{
            console.log("error");
      }
      

      //return compressedImage;
};

//拖拽上传功能
inputImage.addEventListener('dragover', (event) => {
      event.preventDefault();
      $(".custom-file-upload").css("background-color", "#fffffffa");
      $("#tips").text("Release to start compression.");
      //console.log("dragover")
});

inputImage.addEventListener('dragleave', (event) => {
      event.preventDefault();
      $(".custom-file-upload").css("background-color", "#ffffff7b");
      $("#tips").text("Drop your PNG or JPEG files here!");
      //console.log("dragover")
});

//打包文件功能
const compressAndDownload = async (results) => {

      const zip = new JSZip();

      for(const result of results){
            const arrayBuffer = await result[0].arrayBuffer();
            zip.file(result[1], arrayBuffer);
      }

      zip.generateAsync({ type: "blob" }).then(function (content) {
            const name = "COMPRESSED.zip";
            const url = URL.createObjectURL(content);

            $('#down_all').css('display', 'block');
            $('#downloadAllButton').attr('href',url);
            $('#downloadAllButton').attr('download',name);

            // $('#main-card').after(
            //             // '<div class="container p-1 m-0"><div class="row"><div class="col-6">'
            //             //       +name+
            //             //       '</div><div class="col text-end"></div><div class="col text-end"><a href="'
            //             //             +url+
            //             //             '" download="'
            //             //             +name+
            //             //             '">download</a></div></div></div>');
            //       '<div class="container-lg p-1 " id="down_all"><div class="p-1 container w-100"><div class="row w-100 g-1 justify-content-center"><div class="col-3 text-center"><button type="button" class="btn btn-dark"><a id="downloadButton" href="'
            //       +url+
            //       '" download="'
            //       +name+
            //       '">Download All</a></button></div></div></div></div>'
            // )
      });
      
}


//监听文件上传情况
inputImage.addEventListener('change', async (event) => {
      if (event.target.files.length === 0) {
            return;
      }
//const FileInputChane = (event) => {
      const files = event.target.files;
      const newFiles = [];
      const template = $('#item-template');
      const percentTemplate = $('#percent-template');

      for(const file of files){

            const item = template.clone().contents();

            item.find('#displayName').text(file.name);
            item.find('.listhead').attr('id', file.name);
            $('#main-card').append(item);
      }


      // for (const file of files) {
      //const file = event.target.files[0];
      const promises = Array.from(files).map(async (file) => {

            const readerImg = new FileReader();

            readerImg.readAsArrayBuffer(file);

            return new Promise((resolve, reject) => { // 存储每个promise
            readerImg.onload = () => {
                  //$('#main-card').append(item);

                  const inputImageU8 = readerImg.result;
                  const beforeLength = inputImageU8.byteLength / 1024;
                  
                  const blobFileO = new Blob([inputImageU8], { type: 'image/jpeg' });
                  //canvas.src = URL.createObjectURL(blobFileO);
                  const beforeSrc = URL.createObjectURL(blobFileO);

                  const outputImage = compress(inputImageU8).then((fileRender) => {
                        const blobFile = new Blob([fileRender], { type: 'image/jpeg' });
                        //console.log("BN",blobFile.name)
                        const afterLength = fileRender.byteLength / 1024;
                        const percentage = Math.round(1000-afterLength/beforeLength*1000)/10;
                        
                        //canvas.src = URL.createObjectURL(blobFile);
                        // downloadButton.href = URL.createObjectURL(blobFile);
                        // downloadButton.download = file.name;
                        // downloadButton.style.display = 'block';
                        const url = URL.createObjectURL(blobFile);
                        const name = file.name;
                        const displayName = name.slice(0,name.lastIndexOf(".")).slice(0,12)+'..'+name.substring(name.lastIndexOf(".")+1);
                        const percentNum = afterLength.toFixed(1)+'KB'+' | '+(percentage >= 0 ? '-' : '+') + Math.abs(percentage)

                        // $('#main-card').append(
                        //       '<div class="p-1 my-1 container list-item" data-link="'
                        //       +beforeSrc+
                        //       '"><div class="row w-100 g-1"><div class="col-4 d-flex align-items-center">'
                        //       +displayName+
                        //       '</div><div class="col-4 d-flex align-items-center text-center justify-content-center">'
                        //       +afterLength.toFixed(1)+'KB'+' | '+(percentage >= 0 ? '-' : '+') + Math.abs(percentage)+
                        //       '</div><div class="col-3 text-end campareBox"><button type="button" class="btn btn-dark"><a id="downloadButton" class="text-light">Compare</a></button></div><div class="col-1 text-end"><button type="button" class="btn btn-dark"><a id="downloadButton" class="text-light" href="'
                        //       +url+
                        //       '" download="'
                        //       +name+
                        //       '">Download</a></button></div></div></div>'
                        // )

                        // 在 item 中填充数据，例如：
                        const percentItem = percentTemplate.clone().contents();
                        percentItem.text(percentNum)

                        $('#' + name.replace(/\./g, '\\.')).parent().find('.downloadButton').attr('href', url);
                        $('#' + name.replace(/\./g, '\\.')).parent().find('.downloadButton').attr('download', name);
                        $('#' + name.replace(/\./g, '\\.')).parent().attr('data-link', beforeSrc);


                        $('#' + name.replace(/\./g, '\\.') + ' .progressHead').after(percentItem);
                        $('#' + name.replace(/\./g, '\\.') + ' .progressHead').remove();

                        
                        

                        
                        //newFiles.push(blobFile);
                        resolve([blobFile,name]);

                  }).catch((error) => {
                        reject(error); 
                        //console.error(error);
                  });

                  //promises.push(promise);
            };
            });
      })

      Promise.all(promises).then((results) => { // 等待所有promise完成后执行后续代码
            //console.log(results)
            const zipComp = compressAndDownload(results);
      }).catch((error) => {
            console.error(error);
      });
})


//图片对比功能
var lastAppendedElement;

$('body').on('click', '.campareBox', function () {
      // 判断当前点击的按钮是否与上次点击的按钮相同
      var isSameButton = lastAppendedElement && $(this).parent().next().is(lastAppendedElement.prev());

      // 如果相同的按钮被点击，收起图片
      if (isSameButton) {
            lastAppendedElement.remove();
            lastAppendedElement = null;
            return;
      }

      // 移除上次添加的标签
      console.log('click compare')
      if (lastAppendedElement) {
          lastAppendedElement.remove();
      }

      // 获取新图片链接和旧图片链接
      var oldImageLink = $(this).parent().parent().parent().attr('data-link');
      var newImageLink = $(this).parent().next().find('a').attr('href');

      console.log(oldImageLink)
      console.log(newImageLink)

      // 在当前点击的div后面添加新标签，包含两个图片
      var newElement = $('<div class="box-container d-flex justify-content-center"><div class="box added" style="width: 100%; height: 300px; overflow: hidden;"><div class="images-container d-flex w-100 h-100"></div></div></div>');
      $(this).parent().next().after(newElement);

      // 添加图片到images-container div中
      var checkerboardImageUrl = './app/grid.jpg';

      var oldImage = $('<div class="image-wrapper w-50 h-100" style="background-image: url(' + checkerboardImageUrl + ');"><img src="' + oldImageLink + '" alt="旧图片" class="h-100" /></div>');
      var newImage = $('<div class="image-wrapper w-50 h-100" style="background-image: url(' + checkerboardImageUrl + ');"><img src="' + newImageLink + '" alt="新图片" class="h-100" /></div>');
      newElement.find('.images-container').append(oldImage).append(newImage);

      // 初始化panzoom插件
      var panzoomInstanceOld = Panzoom(oldImage.find('img')[0]);
      var panzoomInstanceNew = Panzoom(newImage.find('img')[0]);
      

      oldImage.find('img').data('panzoomInstance', panzoomInstanceOld);
      newImage.find('img').data('panzoomInstance', panzoomInstanceNew);

      // 监听鼠标滚轮事件，实现缩放功能
      newElement.find('.images-container').on('wheel', function (event) {

            event.preventDefault();
            event.stopPropagation();

            var currentZoomOld = panzoomInstanceOld.getScale();
            var currentZoomNew = panzoomInstanceNew.getScale();
            var zoomStep = 0.1;
            var minZoom = 0.5;
            var maxZoom = 5;

            var delta = event.originalEvent.deltaY;
            var zoomOut = delta > 0;

            // Calculate new zoom level based on current zoom level and zoom step
            var newZoomOld = zoomOut ? currentZoomOld * (1 - zoomStep) : currentZoomOld * (1 + zoomStep);
            var newZoomNew = zoomOut ? currentZoomNew * (1 - zoomStep) : currentZoomNew * (1 + zoomStep);

            // Clamp the new zoom levels to the min and max limits
            newZoomOld = Math.min(Math.max(newZoomOld, minZoom), maxZoom);
            newZoomNew = Math.min(Math.max(newZoomNew, minZoom), maxZoom);

            // Set the new zoom levels without triggering zoom event
            panzoomInstanceOld.zoom(newZoomOld, {silent: true});
            panzoomInstanceNew.zoom(newZoomNew, {silent: true});
      });

      // 将新旧图片的拖拽事件同步
      newElement.find('.images-container').on('down', function (event, panzoomInstance, transform) {
            console.log("down")
            panzoomInstanceOld.setOptions({disablePan: false});
            panzoomInstanceNew.setOptions({disablePan: false});
      });

      newElement.find('.images-container').on('move', function (event) {
            var targetInstance = $(event.target).data('panzoomInstance')
            if (targetInstance == panzoomInstanceOld) {
                  //panzoomInstanceNew.pan('pan', x, y, { animate: false });
                  // console.log(targetInstance.getPan().x)
                  panzoomInstanceNew.pan(targetInstance.getPan().x, targetInstance.getPan().y, {relative: false, animate: false});
            } else {
                  // console.log(targetInstance.getPan().x)
                  panzoomInstanceOld.pan(targetInstance.getPan().x, targetInstance.getPan().y, {relative: false, animate: false});
            }
      });

      newElement.find('.images-container').on('up', function (event, panzoomInstance, transform) {
            console.log("up")
            panzoomInstanceOld.setOptions({disablePan: true});
            panzoomInstanceNew.setOptions({disablePan: true});
      });

      
      lastAppendedElement = newElement;
});


//download按钮悬浮功能
const $stickyDiv = $(".sticky-div");

function checkStickyDivPosition() {
      const windowHeight = $(window).height();
      const stickyDivBottom = $stickyDiv[0].getBoundingClientRect().bottom;

      if (stickyDivBottom >= windowHeight) {
      $stickyDiv.css("position", "relative");
      } else {
      $stickyDiv.css("position", "-webkit-sticky");
      $stickyDiv.css("position", "sticky");
      }
}

$(window).on("scroll", checkStickyDivPosition);
$(window).on("resize", checkStickyDivPosition);

// Trigger the function when the dynamic div height changes
// You can call this function whenever the div height changes
checkStickyDivPosition();

