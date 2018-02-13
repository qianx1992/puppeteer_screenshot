//延时函数
function sleep(delay) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                resolve(1)
            } catch (e) {
                reject(0)
            }
        }, delay)
    })
}

const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const dateTools = require('./util.js');
var log4js = require('log4js');
log4js.configure("./configure/log4js.json");
const logger = log4js.getLogger('screenshot_log');
const logmailer = log4js.getLogger('mailer');

 function screenshot(taskList) {
     if (taskList.length <= 0) {
         logger.info('There are not screenshot tasks today');
         return;
     }
     var resultList=[];
     return new Promise (function(resolve){
         puppeteer.launch({
             executablePath: './chromium/chrome.exe',
             ignoreHTTPSErrors: true,
             headless: false,
             slowMo: 250,
             timeout: 0
         }).then(async browser => {
             logger.info('The screenshot tasks are starting...');
             var page,parameters;

             for (var i = 0; i < taskList.length; i++) {
                 parameters = JSON.parse( taskList[i].parameters );
                 try{
                     page = await browser.newPage();
                     await page.setJavaScriptEnabled(true);
                     if (parameters.device != "computer") {
                         await page.emulate(devices[parameters.device]);
                     }
                     await page.setViewport(parameters.viewport);
                     await page.goto(parameters.url, {timeout: 0}); //防止页面太长，加载超时

                     //注入代码，慢慢把滚动条滑到最底部，保证所有的元素被全部加载
                     /* let scrollEnable = true;*/
                     let scrollStep = 500; //每次滚动的步长
                     var reslut={
                         scrollEnable:true,
                         actHeight:0
                     };
                     while (reslut.scrollEnable) {
                         reslut = await page.evaluate((scrollStep) => {
                             let scrollTop = document.scrollingElement.scrollTop;
                             document.scrollingElement.scrollTop = scrollTop + scrollStep;
                             return {
                                 actHeight:document.body.clientHeight,
                                 scrollEnable:document.body.clientHeight > document.scrollingElement.scrollTop + document.documentElement.clientHeight ? true : false
                             }
                         }, scrollStep);
                         await sleep(100);
                     }
                     let filename = fileconfig.inFilePath+ dateTools.getNowFormatDate(false) + "_ver"+ i + ".png";
                     //这里有个Puppeteer的bug一直没有解决，发现截图的高度最大只能是16384px， 超出部分被截掉了。
                     await page.screenshot({
                         path: filename,
                         clip: {
                             x: 0,
                             y: 0,
                             width: parameters.viewport.width,
                             height: reslut.actHeight
                         }
                     });
                     resultList.push(
                         {
                             _id : taskList[i]._id,
                             lastRunTime : dateTools.getNowFormatDate(true),
                             fileName: filename
                         });
                 }catch(err){
                     logger.error("this url("+parameters.url+"):"+err.message);
                     logmailer.info("this url("+parameters.url+"):"+err.message);
                 }finally {
                     await page.close();
                 }
             }
             await browser.close();
             logger.info('The screenshot tasks have finished today.');
             resolve(resultList);
         });
     });
 }
module.exports= screenshot;