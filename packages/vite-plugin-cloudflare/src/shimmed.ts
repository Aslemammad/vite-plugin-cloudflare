// @ts-nocheck
import process from "process-es6"
import { Buffer } from "buffer-es6"

globalThis.global = (typeof global !== "undefined" ? global :
            typeof self !== "undefined" ? self :
            typeof window !== "undefined" ? window : {});
globalThis.process = process;
globalThis.Buffer = Buffer;
