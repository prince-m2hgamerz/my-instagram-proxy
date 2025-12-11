export interface DownloadResponse {
  status: 'success' | 'error';
  message?: string;
  data?: {
    video_url: string;
    thumbnail_url: string | null;
    thumbnail_base64: string | null;
    original_url: string;
  };
}