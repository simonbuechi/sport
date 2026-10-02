import { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CheckIcon from '@mui/icons-material/Check';
import TranslateIcon from '@mui/icons-material/Translate';
import Typography from '@mui/material/Typography';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Box from '@mui/material/Box';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '../../i18n/types';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useAuth } from '../../context/AuthContext';

interface LanguageSelectorProps {
    variant?: 'icon' | 'select';
    size?: 'small' | 'medium';
}

export const LanguageSelector = ({ variant = 'icon', size = 'small' }: LanguageSelectorProps) => {
    const { i18n, t } = useTranslation();
    const { currentUser } = useAuth();
    const { profile, updateProfile } = useUserProfile();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const currentLang = (i18n.language || 'en').substring(0, 2) as SupportedLanguage;

    useEffect(() => {
        document.documentElement.lang = currentLang;
    }, [currentLang]);

    const handleLanguageChange = async (langCode: SupportedLanguage) => {
        await i18n.changeLanguage(langCode);

        if (currentUser && profile) {
            try {
                await updateProfile({
                    settings: {
                        ...profile.settings,
                        language: langCode,
                    }
                });
            } catch (err) {
                console.error('Failed to save language preference to profile', err);
            }
        }
    };

    if (variant === 'select') {
        return (
            <FormControl fullWidth size={size}>
                <InputLabel id="language-select-label">{t('profile.language')}</InputLabel>
                <Select
                    labelId="language-select-label"
                    id="language-select"
                    value={currentLang}
                    label={t('profile.language')}
                    onChange={(e: SelectChangeEvent) => {
                        void handleLanguageChange(e.target.value as SupportedLanguage);
                    }}
                >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                        <MenuItem key={lang.code} value={lang.code}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <span>{lang.flag}</span>
                                <span>{lang.nativeName}</span>
                                <Typography variant="caption" color="text.secondary">
                                    ({lang.name})
                                </Typography>
                            </Box>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        );
    }

    return (
        <>
            <Tooltip title={t('nav.language')}>
                <IconButton
                    color="inherit"
                    onClick={(e) => { setAnchorEl(e.currentTarget); }}
                    aria-label={t('nav.language')}
                    size={size}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        px: 1,
                    }}
                >
                    <TranslateIcon fontSize="small" />
                    <Typography
                        variant="caption"
                        sx={{
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            fontSize: '0.75rem',
                        }}
                    >
                        {currentLang.toUpperCase()}
                    </Typography>
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => { setAnchorEl(null); }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                {SUPPORTED_LANGUAGES.map((lang) => {
                    const isSelected = currentLang === lang.code;
                    return (
                        <MenuItem
                            key={lang.code}
                            selected={isSelected}
                            onClick={() => {
                                setAnchorEl(null);
                                void handleLanguageChange(lang.code);
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 28, fontSize: '1.1rem' }}>
                                {lang.flag}
                            </ListItemIcon>
                            <ListItemText
                                primary={lang.nativeName}
                                secondary={lang.name !== lang.nativeName ? lang.name : undefined}
                                slotProps={{
                                    primary: {
                                        sx: {
                                            fontWeight: isSelected ? 700 : 400,
                                            fontSize: '0.9rem',
                                        }
                                    }
                                }}
                            />
                            {isSelected && (
                                <ListItemIcon sx={{ minWidth: 24, justifyContent: 'flex-end' }}>
                                    <CheckIcon fontSize="small" color="primary" />
                                </ListItemIcon>
                            )}
                        </MenuItem>
                    );
                })}
            </Menu>
        </>
    );
};

export default LanguageSelector;
