# transl8-js [![](https://badge.fury.io/js/transl8.svg)](https://npmjs.org/package/transl8) [![](https://www.travis-ci.com/theAlexPatin/eslint-config-thealexpatin.svg?branch=master)](https://travis-ci.com/theAlexPatin/eslint-config-thealexpatin)

Instantly translates your locale files into multiple languages using [Google's Cloud Translation API](https://developers.google.com/apis-explorer/#p/translate/v3/).

## Installation

```
npm install -g transl8
```

## From the Command Line

**Usage**: `$ transl8 [options]`

| Options     | Description                                                                                                            |
| ----------- | ---------------------------------------------------------------------------------------------------------------------- |
| `--key`     | Google Cloud API Key. [Register one here](https://developers.google.com/apis-explorer/#p/translate/v3/) (**Required**) |
| `--infile`  | Your source locale file. `.js` and `.json` files are valid (**Required**)                                              |
| `--outdir`  | Output directory for translated files (_Default: `./output`_)                                                          |
| `--locales` | Target translation tags (**Required**)                                                                                 |
| `--verbose` | `1` or `true` for warnings, `2` for info, `3` for errors (_Default `false`_)                                           |

### Examples

- `transl8 --key $GOOGLE_API_KEY --locales fr es --infile ./en.json`
- `transl8 --key $GOOGLE_API_KEY --locales lv --outdir translations --infile ./en.js`

## Via Node Module

```javascript
const transl8 = require('transl8')

transl8({
  key: 'XXXXX',
  source: {
    hello: 'Hello World',
  },
  locales: ['fr', 'es'],
  verbose: false,
})
  .then(result => { ... })
```

**Result**

```json
{
  "fr": {
    "hello": "Bonjour le monde"
  },
  "es": {
    "hello": "Hola Mundo"
  }
}
```
