"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sleep = sleep;

const _sleep = ms => new Promise(r => setTimeout(() => r(), ms)); //this is cool to read, so i left it here.


function sleep(ms) {
  return new Promise(r => setTimeout(() => r(), ms));
}
//# sourceMappingURL=helpers.function.js.map