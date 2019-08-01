# str-webpack-plugin
> str-webpack-plugin

## Getting started
* make sure node and npm installed;

### Install
```
> npm install str-webpack-plugin --save
```

### Usage

##### webpack.config.js

```javascript
//webpack.config.js
var path = require('path');
var strPlugin = require('str-webpack-plugin');

module.exports = {
  ...
  plugins: [
    new strPlugin({
      src: path.resolve('./dist'),
      test: /\.js/g,
      replace: [{
          form: ["foo"],
          to: ["bar"],
      }]
    })
  ]
  ...
}
```