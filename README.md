# Chrome AI Search Extension (search page with Bert)

Use google's [Bert](https://en.wikipedia.org/wiki/BERT_(language_model)) to search on a site

## Example

![example](.readme/example.gif)

## DEV Build & install

1. download mobileBert from tfhub [here](https://tfhub.dev/tensorflow/tfjs-model/mobilebert/1)
2. unpack model files into `public/model`
3. install npm dependencies `npm i`
4. build the project `npm run watch` (DEV) or `npm run build`(PROD)
5. open chrome and goto `chrome://extensions/` and load it (you must be in dev mode for this)

## Stack

[Preact](https://preactjs.com/) with [HTM](https://github.com/developit/htm) for frontend (Popup)
Tensorflow.js and [TF-qna](https://github.com/tensorflow/tfjs-models/tree/master/qna) (Backend)

## Contribution

This project was bootstrapped with [Chrome Extension CLI](https://github.com/dutiyesh/chrome-extension-cli)
All icons are from [Google Fonts](https://fonts.google.com/icons)
