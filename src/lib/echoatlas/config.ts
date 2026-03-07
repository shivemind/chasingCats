export const ECHOATLAS_API_URL =
  process.env.ECHOATLAS_API_URL || 'https://echo-atlas.com';

export const ECHOATLAS_API_KEY = process.env.ECHOATLAS_API_KEY || '';

export const ECHOATLAS_SITE_ID =
  process.env.ECHOATLAS_SITE_ID || 'chasing-cats';

export function echoatlasHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Source-Site': ECHOATLAS_SITE_ID,
  };
  if (ECHOATLAS_API_KEY) {
    headers['X-API-Key'] = ECHOATLAS_API_KEY;
  }
  return headers;
}
