const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

async function main(){
  const imagesJson = await fetchImagesJson();
  // TODO 消す
  // const imagesJson = await fetchImagesJsonLocal();
  const imagesInfo = extractionImageInfo(imagesJson);
  
  downloadImages(imagesInfo);
}

// TODO ローカルから読む時用
function fetchImagesJsonLocal() {
  return require(process.env.PWD + '/sample.json');
}

function extractionImageInfo(json) {
  var imagesInfo = [];

  Object.keys(json.pins).forEach((key) => {
    const imageObj = json.pins[key];
    imagesInfo.push({
      id: imageObj.id,
      description: imageObj.description,
      image_url: imageObj.images.orig.url,
      source_url: imageObj.link
    });
  });
  return imagesInfo;
}

function downloadImages(images) {
  const dir = process.env.PWD + '/img/';

  Object.keys(images).forEach(async (key) => {
    const res = await axios.get(images[key].image_url, {
      responseType: 'arraybuffer'
    });
    fs.writeFileSync(dir + images[key].id + '.jpg', new Buffer(res.data), 'binary');
  });
}

async function fetchImagesJson() {
  // TODO URLは引数から動的に生成できるようにする
  // 今は固定で女子高生 太ももの検索
  const URL = 'https://www.pinterest.jp/search/pins/?q=%E5%A5%B3%E5%AD%90%E9%AB%98%E7%94%9F%20%E5%A4%AA%E3%82%82%E3%82%82';

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(URL);

  await login(page);

  const imagesJson = await page.evaluate(() => {
    const json = document.querySelector('#initial-state').innerHTML;
    return JSON.parse(json);
  });

  browser.close();
  return imagesJson;
}

async function login(page) {
  // ログインモーダルを開く
  await page.click('.lightGrey');

  // 必要情報を入力
  await page.type('#email', process.env.email);
  await page.type('#password', process.env.password);

  // ログインする
  const loginSelector = 'body > div:nth-child(1) > div > div > div > div > div:nth-child(6) > div > div > div > div > div:nth-child(1) > div:nth-child(4) > div:nth-child(1) > form > div:nth-child(3) > button > div';
  await page.click(loginSelector);

  // JSONが更新されるまで待つ
  // TODO ここは無理やり待ってるけど多分Promiseでいい書き方がある
  await sleep(10000);
}

async function sleep(delay) {
  return new Promise(resolve => setTimeout(resolve, delay));
}

main();