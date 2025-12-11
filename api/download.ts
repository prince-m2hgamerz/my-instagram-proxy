import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRandomUserAgent } from '../lib/constants';
import { isValidInstagramUrl, decodeHtml, getCorsHeaders } from '../lib/utils';
import { DownloadResponse } from '../lib/types';

// Helper function to apply CORS headers (avoids repetition)
const applyCorsHeaders = (res: VercelResponse) => {
    Object.entries(getCorsHeaders()).forEach(([key, value]) => res.setHeader(key, value as string));
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // 1. Handle CORS Preflight
    if (req.method === 'OPTIONS') {
        applyCorsHeaders(res); // <-- FIX APPLIED HERE
        res.status(200).end();
        return;
    }

    // 2. Validate Method
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET, OPTIONS');
        // Apply CORS before sending 405 response
        applyCorsHeaders(res);
        return res.status(405).json({ status: 'error', message: 'Method Not Allowed' });
    }

    const { url } = req.query;

    // 3. Validate Input
    if (!url || typeof url !== 'string' || !isValidInstagramUrl(url)) {
        applyCorsHeaders(res); // <-- FIX APPLIED HERE (Line 23)
        return res.status(400).json({
            status: 'error',
            message: 'Invalid or missing Instagram URL',
        });
    }

    try {
        // 4. Prepare Upstream Request
        const encodedUrl = encodeURIComponent(url);
        const targetUrl = `https://snapdownloader.com/tools/instagram-reels-downloader/download?url=${encodedUrl}`;

        // 5. Fetch Data
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'User-Agent': getRandomUserAgent(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Referer': 'https://snapdownloader.com/',
            },
        });

        if (!response.ok) {
            throw new Error(`Upstream provider returned status: ${response.status}`);
        }

        const html = await response.text();

        // 6. Extraction Logic (Regex)
        const videoRegex = /<a[^>]+href="([^"]+\.mp4[^"]*)"[^>]*>/i;
        const thumbRegex = /<a[^>]+href="([^"]+\.jpg[^"]*)"[^>]*>/i;
        const base64Regex = /<img[^>]+src="data:image\/jpg;base64,([^"]+)"/i;

        const videoMatch = html.match(videoRegex);
        const thumbMatch = html.match(thumbRegex);
        const base64Match = html.match(base64Regex);

        if (!videoMatch || !videoMatch[1]) {
            applyCorsHeaders(res); // <-- FIX APPLIED HERE (Line 61)
            return res.status(422).json({
                status: 'error',
                message: 'Could not extract video URL. The content might be private or the provider has changed.',
            });
        }

        // 7. Decode Entities
        const cleanVideoUrl = decodeHtml(videoMatch[1]);
        const cleanThumbUrl = thumbMatch && thumbMatch[1] ? decodeHtml(thumbMatch[1]) : null;
        const cleanBase64 = base64Match && base64Match[1]
            ? `data:image/jpg;base64,${base64Match[1]}`
            : null;

        // 8. Construct Response
        const apiResponse: DownloadResponse = {
            status: 'success',
            data: {
                video_url: cleanVideoUrl,
                thumbnail_url: cleanThumbUrl,
                thumbnail_base64: cleanBase64,
                original_url: url
            }
        };

        // 9. Send Response with Cache Headers and CORS
        res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
        applyCorsHeaders(res); // <-- Consistent application of CORS headers
        
        return res.status(200).json(apiResponse);

    } catch (error: any) {
        console.error('Proxy Error:', error);

        applyCorsHeaders(res); // <-- FIX APPLIED HERE (Line 95)
        return res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
            debug: error.message
        });
    }
}