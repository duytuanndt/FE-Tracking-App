/**
 * Cloudflare R2 Upload Service
 * Handles getting pre-signed URLs and uploading files directly to R2
 */

export interface PreSignedUrlRequest {
  productId: string;
  contentType: string;
  fileName: string;
}

export interface PreSignedUrlResponse {
  signedUrl: string;
  url?: string; // Final URL after upload (if provided by backend)
  // Optional key for the object path inside the assets bucket (e.g. games/abc.jpg)
  key?: string;
}

/**
 * Get a pre-signed URL from the backend API for uploading to Cloudflare R2
 */
export async function getPreSignedUrl(
  productId: string,
  contentType: string,
  fileName: string,
): Promise<PreSignedUrlResponse> {
  const response = await fetch(
    'https://dogtraining-api.fuentechsoft.com/api/v1/products/pre-signed-url',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        productId,
        contentType,
        fileName,
      } as PreSignedUrlRequest),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to get pre-signed URL: ${response.status} - ${errorText}`,
    );
  }

  const data = await response.json();
  return {
    signedUrl: data.signedUrl || data.signed_url || data.url,
    url: data.url || data.finalUrl || data.final_url,
    key: data.key,
  };
}

const DEFAULT_ASSETS_BASE_URL = 'https://dogstranslator-assets.foxcode.info/';

// Resolve the public assets base URL from env/config with a safe default.
function getAssetsBaseUrl(): string {
  // Prefer Vite-style env if available
  const viteEnv =
    typeof import.meta !== 'undefined' &&
    (import.meta as any).env &&
    (import.meta as any).env.VITE_ASSETS_BASE_URL;

  // Fallback to Node-style env if present
  const nodeEnv =
    typeof process !== 'undefined' &&
    (process as any).env &&
    (process as any).env.VITE_ASSETS_BASE_URL;

  const base = (viteEnv || nodeEnv || DEFAULT_ASSETS_BASE_URL) as string;

  // Ensure the base ends with a single slash
  return base.endsWith('/') ? base : `${base}/`;
}

/**
 * Upload a file directly to Cloudflare R2 using a pre-signed URL
 * Uses PUT method as recommended for R2 uploads
 */
export async function uploadToR2(
  signedUrl: string,
  file: File,
): Promise<string> {
  const uploadResponse = await fetch(signedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    throw new Error(
      `Failed to upload file to R2: ${uploadResponse.status} - ${errorText}`,
    );
  }

  // Extract the final URL from the signed URL (remove query parameters)
  // The signed URL format is typically: https://bucket.r2.cloudflarestorage.com/path?query
  // The final URL is the base URL without query params
  const url = new URL(signedUrl);
  url.search = ''; // Remove query parameters
  return url.toString();
}

/**
 * Upload a file to R2 with automatic pre-signed URL generation
 * This is a convenience function that combines getPreSignedUrl and uploadToR2
 */
export async function uploadFileToR2(
  productId: string,
  file: File,
): Promise<string> {
  // Get pre-signed URL
  // console.log('productId', productId);
  // console.log('file.type', file.type);
  // console.log('file.name', file.name);
  // console.log('file', file);
  const { signedUrl, url: finalUrl, key } = await getPreSignedUrl(
    productId,
    file.type,
    file.name,
  );

  // Upload file to R2
  const uploadedUrl = await uploadToR2(signedUrl, file);

  // If backend returned a key, construct the public CDN URL using the assets base
  if (key) {
    const base = getAssetsBaseUrl();
    const normalizedKey = key.startsWith('/') ? key.slice(1) : key;
    return `${base}${normalizedKey}`;
  }

  // Otherwise, prefer backend final URL if provided, then fall back to uploaded URL
  return finalUrl || uploadedUrl;
}
