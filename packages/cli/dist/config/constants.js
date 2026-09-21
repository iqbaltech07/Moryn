"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_API_URL = void 0;
exports.DEFAULT_API_URL = process.env.MORYN_API_URL || process.env.PIARDIFY_API_URL || "https://moryn.vercel.app";
