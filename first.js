/**
 * Copyright 2017 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const puppeteer = require('puppeteer');

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

(async() => {
    /*const browser = await puppeteer.launch();*/
    //用指定选项启动一个Chromium浏览器实例。
    const browser = await puppeteer.launch({
        // 若是手动下载的chromium需要指定chromium地址, 默认引用地址为 /项目目录/node_modules/puppeteer/.local-chromium/
        executablePath: './chromium/chrome.exe',
        //设置超时时间
        timeout: 0,
        /*//如果是访问https页面 此属性会忽略https错误
        /*ignoreHTTPSErrors: true,*/
        // 打开开发者工具, 当此值为true时, headless总为false
        /*devtools: false,*/
        // 关闭headless模式, 会打开浏览器
        headless: false //默认为true*/
    });
    const page = await browser.newPage();
    // 设置tab页的尺寸，puppeteer允许对每个tab页单独设置尺寸
    /*await page.setViewport({width:1920, height:600});*/
    /*await page.setViewport({
      width: 1380,
      height: 500
    });*/
    await page.goto('http://music.163.com/',{timeout:0});
    /*await page.screenshot({path: './img/music3.png'});*/
    // 由于页面数据是异步的，所以等待8秒，等待异步请求完毕，页面渲染完毕
    /*await page.waitFor(8000);*/
    await page.setJavaScriptEnabled(true);
    var response = await page.waitForNavigation({ waitUntil: "networkidle2",timeout:0 });
    let scrollEnable;
    let scrollStep = 500; //每次滚动的步长
    while (!scrollEnable) {
        scrollEnable = await page.evaluate((scrollStep) => {
            let scrollTop = document.scrollingElement.scrollTop;
            document.scrollingElement.scrollTop = scrollTop + scrollStep;
            console.log("qx",document.body.clientHeight > document.scrollingElement.scrollTop);
            return document.body.clientHeight > document.scrollingElement.scrollTop ? undefined : {
                width: document.documentElement.clientWidth,
                height : document.body.clientHeight
            }
        }, scrollStep);
        /*await sleep(10);*/
    }
    console.log(scrollEnable.width,scrollEnable.height);

    // 页面渲染完毕后，开始截图
    await page.screenshot({
        path: './img/music16.png',
        /*type: 'png',*/
        // quality: 100, 只对jpg有效
        /*fullPage: true,*/
        // 指定区域截图，clip和fullPage两者只能设置一个
        clip: {
            x: 0,
            y: 0,
            width: scrollEnable.width,
            height: scrollEnable.height
        }
    });
    await browser.close();
})();
