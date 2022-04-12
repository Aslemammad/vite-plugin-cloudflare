// @ts-nocheck

globalThis.global =
  typeof global !== "undefined"
    ? global
    : typeof self !== "undefined"
    ? self
    : typeof window !== "undefined"
    ? window
    : {};
globalThis.process = require("process-es6");
globalThis.Buffer = require("buffer-es6").Buffer;
globalThis.setImmediate =
  require("rollup-plugin-node-builtins/src/es6/timers").setImmediate;
globalThis.clearImmediate =
  require("rollup-plugin-node-builtins/src/es6/timers").clearImmediate;

const xhr = require('./xhr.js')

globalThis.XMLHttpRequest = xhr.XMLHttpRequest;
globalThis.XMLHttpRequestUpload =
  xhr.XMLHttpRequestUpload;
globalThis.XMLHttpRequestEventTarget =
  xhr.XMLHttpRequestEventTarget;
globalThis.location = {}
