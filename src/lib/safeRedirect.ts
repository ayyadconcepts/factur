const ALLOWED_REDIRECTS = ['/dashboard/convert', '/dashboard/companies'];
const DEFAULT_REDIRECT = '/dashboard/convert';

/**
 * Pure function to validate and sanitize a redirect URL.
 * Prevents open-redirect vulnerabilities.
 */
export function safeRedirect(nextPath: string | null | undefined): string {
  if (!nextPath) return DEFAULT_REDIRECT;
  
  // Basic validation to prevent absolute URLs (e.g., https://evil.com or //evil.com)
  if (nextPath.startsWith('http://') || nextPath.startsWith('https://') || nextPath.startsWith('//')) {
    return DEFAULT_REDIRECT;
  }

  // Only allow explicitly whitelisted paths or internal dashboard paths for maximum security
  if (ALLOWED_REDIRECTS.includes(nextPath) || (nextPath.startsWith('/dashboard') && !nextPath.includes('\\'))) {
    return nextPath;
  }

  return DEFAULT_REDIRECT;
}
