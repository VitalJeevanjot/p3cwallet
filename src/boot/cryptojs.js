// import something here
var CryptoJS = require('crypto-js')
// "async" is optional
export default async ({ Vue }) => {
  // something to do
  Vue.prototype.$cryptojs = CryptoJS
}
