# scraping-pinterest-images

![gif1](https://qiita-image-store.s3.amazonaws.com/0/264910/301277c0-9504-5cb5-7e3d-55d73907cf2a.gif)

![gif2](https://qiita-image-store.s3.amazonaws.com/0/264910/cef39d4a-ee5c-22c0-efe9-2e28c1f75bb8.gif)

## Setup
```
yarn install

touch .env
```

### .env
Please set your Pinterest Email, and Password.
```env
email = example@gmail.com
password example123456
```


## Usage
```zsh
node index.js "search Keyword"
```

## Example

```zsh
node index.js "モンスターハンターダブルクロス"
```

## TODO

- scraping more images
- search result not exists case