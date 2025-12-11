// api/download.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { DownloadResponse } from '../lib/types';
import he from 'he'; // Assuming you use 'he' for HTML entity decoding

// --- IMPORTANT: HARDCODED METADATA ---
// Set your desired values here. They will be included in every successful API response.
const DEVELOPER_METADATA = {
    author: "m2hgamerz",
    telegram_channel: "@m2hwebsolution",
    developer_domain: "https://m2hgamerz.com",
    contact_number: "+91-7678289728"
};
// ------------------------------------

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // 1. Set CORS and Cache Headers for the API
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600');

    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).end();
    }
    
    // 2. Extract URL from query parameters
    const url = req.query.url as string | undefined;

    if (!url) {
        const errorResponse: DownloadResponse = {
            status: 'error',
            message: 'Missing "url" query parameter. Example: /api/download?url=https://www.instagram.com/reel/...'
        };
        return res.status(400).json(errorResponse);
    }
    
    if (!url.includes('instagram.com')) {
        const errorResponse: DownloadResponse = {
            status: 'error',
            message: 'Invalid URL. Only Instagram URLs are supported.'
        };
        return res.status(400).json(errorResponse);
    }

    try {
        // 3. Fetch the Instagram page HTML
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorResponse: DownloadResponse = {
                status: 'error',
                message: `Failed to fetch Instagram page. Status: ${response.status}`
            };
            return res.status(response.status).json(errorResponse);
        }

        const html = await response.text();

        // 4. Regex to extract video URL (searching for 'video_url')
        const videoRegex = /"video_url":"([^"]*?)"/g;
        const videoMatch = videoRegex.exec(html);

        // 5. Regex to extract thumbnail URL (searching for 'og:image')
        const thumbRegex = /<meta property="og:image" content="([^"]*?)"/i;
        const thumbMatch = thumbRegex.exec(html);
        
        // 6. Regex to extract thumbnail base64 (for better preview, if available)
        // This is a common pattern, but may require adjustments based on actual IG source
        const base64Regex = /"base64":"([^"]*?)"/g;
        const base64Match = base64Regex.exec(html);

        if (!videoMatch || videoMatch.length < 2) {
            const errorResponse: DownloadResponse = {
                status: 'error',
                message: 'Video URL not found in the page source. This reel may be private or protected.'
            };
            return res.status(404).json(errorResponse);
        }

        // 7. Decode HTML Entities
        // The URL is usually escaped, use 'he' to decode
        const cleanVideoUrl = he.decode(videoMatch[1]);
        const cleanThumbUrl = thumbMatch && thumbMatch[1] ? he.decode(thumbMatch[1]) : null;
        const cleanBase64 = base64Match && base64Match[1] 
            ? `data:image/jpg;base64,${base64Match[1]}` 
            : null;


        // 8. Construct the final success response
        const successResponse: DownloadResponse = {
            status: 'success',
            data: {
                video_url: cleanVideoUrl,
                thumbnail_url: cleanThumbUrl,
                thumbnail_base64: cleanBase64,
                original_url: url,
                metadata: DEVELOPER_METADATA // Inject the hardcoded metadata
            }
        };

        // 9. Send the JSON response
        return res.status(200).json(successResponse);

    } catch (e) {
        console.error('API Error:', e);
        const errorResponse: DownloadResponse = {
            status: 'error',
            message: 'An internal error occurred while processing the request.'
        };
        return res.status(500).json(errorResponse);
    }
}