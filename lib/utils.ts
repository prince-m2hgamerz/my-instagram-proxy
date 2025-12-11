import he from 'he';

// Validate if input is a real IG link
export const isValidInstagramUrl = (url: string): boolean => {
  const regex = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel|tv)\/([^/?#&]+).*/;
  return regex.test(url);
};

// Clean HTML entities (replaces PHP html_entity_decode)
export const decodeHtml = (str: string): string => {
  return he.decode(str);
};

// CORS Headers helper
export const getCorsHeaders = () => ({
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*', // Change '*' to your frontend domain in production
  'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
  'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
});
