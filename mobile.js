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

(async() => {
    const browser = await puppeteer.launch({
        executablePath: './chromium/chrome.exe',
        headless: false,
        timeout:0
    });
    const page = await browser.newPage();
    await page.emulate(devices['iPhone 6']);
    await page.setViewport({width : 375, height : 667});
    /*await page.tracing.start({path: 'trace.json'});*/
    await page.goto('https://item.taobao.com/item.htm?spm=a21bo.2017.201876.43.3f9a0030Oaxhh8&scm=1007.12493.92624.100200300000005&id=523387189238&pvid=6da310d8-fc0b-4870-905b-d3764fa6e4d2',
        {timeout:0});
    let scrollEnable = true;
    let scrollStep = 500; //每次滚动的步长
    while (scrollEnable) {
        scrollEnable = await page.evaluate((scrollStep) => {
            let scrollTop = document.scrollingElement.scrollTop;
            document.scrollingElement.scrollTop = scrollTop + scrollStep;
            return document.body.clientHeight > document.scrollingElement.scrollTop + document.documentElement.clientHeight ? true : false;
        }, scrollStep);
        await sleep(100);
    }
    await page.screenshot({path: './img/mob10.png', fullPage: true});
    /*await page.tracing.stop();*/
    page.close();
    await browser.close();
})();