// @ts-nocheck
// import __process_shim from "process-es6"
// import { Buffer as __Buffer_shim } from "buffer-es6"
// TODO: import would be a smaller polyfill, but the code would cause us "init is already declared"
// const __process_shim = require('process-es6')
// const { Buffer: __Buffer_shim } = require('buffer-es6')
//
globalThis.global =
  typeof global !== "undefined"
    ? global
    : typeof self !== "undefined"
    ? self
    : typeof window !== "undefined"
    ? window
    : {};
// globalThis.process = __process_shim;
// globalThis.Buffer = __Buffer_shim;
globalThis.process = require("process-es6");
globalThis.Buffer = require("buffer-es6").Buffer;
globalThis.setImmediate = require('rollup-plugin-node-builtins/src/es6/timers').setImmediate
globalThis.clearImmediate = require('rollup-plugin-node-builtins/src/es6/timers').clearImmediate

// (() => {
//   globalThis.process = require("process-es6");
//   globalThis.Buffer = require("buffer-es6").Buffer;
// })();
