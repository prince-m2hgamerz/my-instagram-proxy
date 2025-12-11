"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const constants_1 = require("../lib/constants");
const utils_1 = require("../lib/utils");
async function handler(req, res) {
    // 1. Handle CORS Preflight
    if (req.method === 'OPTIONS') {
        res.status(200).headers((0, utils_1.getCorsHeaders)()).end();
        return;
    }
    // 2. Validate Method
    if (req.method !== 'GET') {
        return res.status(405).json({ status: 'error', message: 'Method Not Allowed' });
    }
    const { url } = req.query;
    // 3. Validate Input
    if (!url || typeof url !== 'string' || !(0, utils_1.isValidInstagramUrl)(url)) {
        return res.status(400).headers((0, utils_1.getCorsHeaders)()).json({
            status: 'error',
            message: 'Invalid or missing Instagram URL',
        });
    }
    try {
        // 4. Prepare Upstream Request
        // We encode the URL exactly like the PHP script did
        const encodedUrl = encodeURIComponent(url);
        const targetUrl = `https://snapdownloader.com/tools/instagram-reels-downloader/download?url=${encodedUrl}`;
        // 5. Fetch Data (Native Fetch replaces cURL)
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'User-Agent': (0, constants_1.getRandomUserAgent)(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Referer': 'https://snapdownloader.com/',
            },
        });
        if (!response.ok) {
            throw new Error(`Upstream provider returned ${response.status}`);
        }
        const html = await response.text();
        // 6. Extraction Logic (Regex)
        // Using slightly more robust regex patterns than the PHP script
        const videoRegex = /<a[^>]+href="([^"]+\.mp4[^"]*)"[^>]*>/i;
        const thumbRegex = /<a[^>]+href="([^"]+\.jpg[^"]*)"[^>]*>/i;
        const base64Regex = /<img[^>]+src="data:image\/jpg;base64,([^"]+)"/i;
        const videoMatch = html.match(videoRegex);
        const thumbMatch = html.match(thumbRegex);
        const base64Match = html.match(base64Regex);
        if (!videoMatch || !videoMatch[1]) {
            return res.status(422).headers((0, utils_1.getCorsHeaders)()).json({
                status: 'error',
                message: 'Could not find video URL. The content might be private or the provider has changed.',
            });
        }
        // 7. Decode Entities
        const cleanVideoUrl = (0, utils_1.decodeHtml)(videoMatch[1]);
        const cleanThumbUrl = thumbMatch && thumbMatch[1] ? (0, utils_1.decodeHtml)(thumbMatch[1]) : null;
        const cleanBase64 = base64Match && base64Match[1]
            ? `data:image/jpg;base64,${base64Match[1]}`
            : null;
        // 8. Construct Response
        const apiResponse = {
            status: 'success',
            data: {
                video_url: cleanVideoUrl,
                thumbnail_url: cleanThumbUrl,
                thumbnail_base64: cleanBase64,
                original_url: url
            }
        };
        // 9. Send Response with Cache Headers
        // Cache for 1 hour (s-maxage=3600) to reduce load on the upstream
        res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
        Object.entries((0, utils_1.getCorsHeaders)()).forEach(([key, value]) => res.setHeader(key, value));
        return res.status(200).json(apiResponse);
    }
    catch (error) {
        console.error('Proxy Error:', error);
        return res.status(500).headers((0, utils_1.getCorsHeaders)()).json({
            status: 'error',
            message: 'Internal Server Error',
            debug: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
