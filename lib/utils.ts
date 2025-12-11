import he from 'he';
import type { IncomingHttpHeaders } from 'http';

// Validate if input is a real IG link
export const isValidInstagramUrl = (url: string): boolean => {
  const regex = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel|tv)\/([^/?#&]+).*/;
  return regex.test(url);
};

// Clean HTML entities 
export const decodeHtml = (str: string): string => {
  return he.decode(str);
};

// CORS Headers helper
export const getCorsHeaders = (): IncomingHttpHeaders => ({
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*', // IMPORTANT: Change to your domain in production
  'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
  'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
});