export type SupportedLanguage = 'en' | 'de' | 'fr' | 'it' | 'es';

export interface LanguageOption {
    code: SupportedLanguage;
    name: string;
    nativeName: string;
    flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
];
