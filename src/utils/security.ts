const DANGEROUS_SCHEME_REGEX = /^(javascript|data|vbscript|file|blob):/i;
const EXPLICIT_SCHEME_REGEX = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//;

const normalizeHttpUrl = (rawUrl: string): string | null => {
    const trimmed = rawUrl.trim();
    if (!trimmed) return null;

    if (DANGEROUS_SCHEME_REGEX.test(trimmed)) {
        return null;
    }

    const candidate = EXPLICIT_SCHEME_REGEX.test(trimmed)
        ? trimmed
        : `https://${trimmed}`;

    try {
        const parsed = new URL(candidate);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return null;
        }
        if (!parsed.hostname.includes('.') && parsed.hostname !== 'localhost') {
            return null;
        }
        return EXPLICIT_SCHEME_REGEX.test(trimmed) ? trimmed : `https://${trimmed}`;
    } catch {
        return null;
    }
};

/**
 * Validates and sanitizes URLs to prevent XSS via javascript:/data: protocols.
 * Only allows http: and https: protocols.
 */
export const sanitizeUrl = (url: string | undefined): string => {
    if (!url) return '#';
    return normalizeHttpUrl(url) ?? '#';
};

/**
 * Checks if a URL is valid and safe (http/https).
 */
export const isValidSafeUrl = (url: string): boolean => {
    if (!url) return false;
    return normalizeHttpUrl(url) !== null;
};
