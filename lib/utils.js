"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCorsHeaders = exports.decodeHtml = exports.isValidInstagramUrl = void 0;
const he_1 = __importDefault(require("he"));
// Validate if input is a real IG link
const isValidInstagramUrl = (url) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel|tv)\/([^/?#&]+).*/;
    return regex.test(url);
};
exports.isValidInstagramUrl = isValidInstagramUrl;
// Clean HTML entities (replaces PHP html_entity_decode)
const decodeHtml = (str) => {
    return he_1.default.decode(str);
};
exports.decodeHtml = decodeHtml;
// CORS Headers helper
const getCorsHeaders = () => ({
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': '*', // Change '*' to your frontend domain in production
    'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
    'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
});
exports.getCorsHeaders = getCorsHeaders;
