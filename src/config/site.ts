/**
 * Centralized Site & SEO Configuration for ToolNest
 * Single source of truth for the production host, branding, and core metadata.
 */

export const SITE_URL = 'https://YOUR-NEW-DOMAIN.com';
export const SITE_NAME = 'ToolNest';
export const SITE_TAGLINE = 'Everyday Tools. One Simple Place.';
export const SITE_DESCRIPTION =
  'ToolNest provides fast, free online utility tools for images, files, calculations, student tasks, and everyday productivity. 100% private in-browser tools with zero sign-up.';

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

/**
 * Returns a normalized, single-source-of-truth canonical URL.
 * Trailing slash is preserved for the homepage root ('/'), and omitted for all subpages.
 */
export function getCanonicalUrl(path: string = ''): string {
  const cleanPath = path.trim().replace(/^\/+|\/+$/g, '');
  if (!cleanPath) {
    return `${SITE_URL}/`;
  }
  return `${SITE_URL}/${cleanPath}`;
}
