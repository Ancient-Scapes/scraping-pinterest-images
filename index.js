const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

async function main(searchKeyword){
  const imagesJson = await fetchImagesJson(searchKeyword);
  const imagesInfo = extractionImageInfo(imagesJson);
  downloadImages(imagesInfo, searchKeyword);
}

async function fetchImagesJson(searchKeyword) {
  const query = new URLSearchParams([['q', searchKeyword]]).toString();
  const URL = 'https://www.pinterest.jp/search/pins/?' + query;

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

function downloadImages(images, searchKeyword) {
  const imgDir = process.env.PWD + '/img';
  const dirSearchKeyword = imgDir + '/' + searchKeyword;

  // imgフォルダの作成
  if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir);
  // 検索キーワードのフォルダ作成
  if (!fs.existsSync(dirSearchKeyword)) fs.mkdirSync(dirSearchKeyword);

  Object.keys(images).forEach(async (key) => {
    const res = await axios.get(images[key].image_url, {
      responseType: 'arraybuffer'
    });
    const filename = images[key].description + '_' + images[key].id;
    const ext = '.jpg';
    fs.writeFileSync(dirSearchKeyword + '/' +  filename + ext, new Buffer(res.data), 'binary');
  });
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

main('女子高生 太もも');