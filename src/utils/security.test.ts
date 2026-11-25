import { describe, it, expect } from 'vitest';
import { sanitizeUrl, isValidSafeUrl } from './security';

describe('security URL utilities', () => {
    it('accepts valid https and http URLs', () => {
        expect(isValidSafeUrl('https://youtube.com/watch?v=123')).toBe(true);
        expect(sanitizeUrl('https://youtube.com/watch?v=123')).toBe('https://youtube.com/watch?v=123');
        expect(isValidSafeUrl('http://localhost:3000/test')).toBe(true);
        expect(sanitizeUrl('http://localhost:3000/test')).toBe('http://localhost:3000/test');
    });

    it('consistently normalizes protocol-less URLs including ports', () => {
        expect(isValidSafeUrl('example.com/video')).toBe(true);
        expect(sanitizeUrl('example.com/video')).toBe('https://example.com/video');
        expect(isValidSafeUrl('example.com:8080/video')).toBe(true);
        expect(sanitizeUrl('example.com:8080/video')).toBe('https://example.com:8080/video');
    });

    it('rejects dangerous XSS protocols consistently', () => {
        expect(isValidSafeUrl('javascript:alert(1)')).toBe(false);
        expect(sanitizeUrl('javascript:alert(1)')).toBe('#');
        expect(isValidSafeUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
        expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('#');
        expect(isValidSafeUrl('vbscript:msgbox(1)')).toBe(false);
        expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('#');
        expect(isValidSafeUrl('ftp://files.example.com')).toBe(false);
        expect(sanitizeUrl('ftp://files.example.com')).toBe('#');
    });
});
