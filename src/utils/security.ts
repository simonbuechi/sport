/**
 * Validates and sanitizes URLs to prevent XSS via javascript: protocols.
 * Only allows http: and https: protocols.
 */
export const sanitizeUrl = (url: string | undefined): string => {
    if (!url) return '#';
    
    const trimmedUrl = url.trim();
    
    try {
        // Attempt to parse the URL
        const parsed = new URL(trimmedUrl);
        
        // Only allow web protocols
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
            return trimmedUrl;
        }
    } catch {
        // If it's a relative URL or not a full URL, we should decide if we want to allow it.
        // For external links in this app, we generally expect full URLs.
        // If the URL doesn't have a protocol, try adding https://
        if (!trimmedUrl.includes(':') && trimmedUrl.length > 0) {
            return `https://${trimmedUrl}`;
        }
    }
    
    return '#';
};

/**
 * Checks if a URL is valid and safe (http/https).
 */
export const isValidSafeUrl = (url: string): boolean => {
    if (!url) return false;
    try {
        const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
};
