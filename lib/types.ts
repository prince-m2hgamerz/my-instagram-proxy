// lib/types.ts

// --- NEW METADATA TYPE ---
export type DeveloperMetadata = {
    author: string;
    telegram_channel: string;
    developer_domain: string;
    contact_number: string;
};
// -------------------------

export type DownloadData = {
    video_url: string;
    thumbnail_url: string | null;
    thumbnail_base64: string | null;
    original_url: string;
    metadata?: DeveloperMetadata; // <--- ADD THIS LINE
};

export type DownloadResponse = {
    status: 'success' | 'error';
    message?: string;
    data?: DownloadData;
};

// ... (Ensure any other existing types are kept below this)