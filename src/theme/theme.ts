import { createTheme, alpha, type PaletteMode } from '@mui/material/styles';

declare module '@mui/material/Paper' {
    interface PaperPropsVariantOverrides {
        section: true;
        widget: true;
        subtle: true;
    }
}

// ==========================================
// CENTRAL DESIGN SYSTEM CONFIGURATION
// ==========================================

export const THEME_COLORS = {
    light: {
        primary: '#9123A6',     // Vibrant Amethyst Purple
        secondary: '#D7195F',   // Ruby / Deep Pink
        background: '#f4f7fb',  // Crisp Cool Off-White
        paper: '#FFFFFF',
        warning: '#f59e0b',
        error: '#dc2626',
        success: '#16a34a',
        info: '#0284c7',
    },
    dark: {
        primary: '#e03e7a',     // Accessible Luminous Ruby
        secondary: '#a844bd',   // Rich Purple
        background: '#0c1824',  // Deep Slate Navy
        paper: '#162736',       // Elevated Slate Card
        warning: '#fbbf24',
        error: '#ef4444',
        success: '#22c55e',
        info: '#38bdf8',
    }
};

export const getAppTheme = (mode: PaletteMode) => {
    const isDark = mode === 'dark';
    const paletteTokens = isDark ? THEME_COLORS.dark : THEME_COLORS.light;

    // Unified Surface Style for Cards and Elevated Papers
    const surfaceStyle = {
        borderRadius: 12,
        border: '1px solid',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(15, 23, 42, 0.08)',
        boxShadow: isDark
            ? '0 4px 20px rgba(0, 0, 0, 0.28)'
            : '0 2px 10px rgba(15, 23, 42, 0.04)',
        backgroundImage: 'none',
    };

    return createTheme({
        palette: {
            mode,
            primary: { main: paletteTokens.primary },
            secondary: { main: paletteTokens.secondary },
            warning: { main: paletteTokens.warning },
            error: { main: paletteTokens.error },
            success: { main: paletteTokens.success },
            info: { main: paletteTokens.info },
            background: {
                default: paletteTokens.background,
                paper: paletteTokens.paper,
            },
            divider: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.09)',
        },
        typography: {
            fontSize: 14,
            fontFamily: '"Inter", "Roboto", "Segoe UI", sans-serif',
            h1: { fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.2 },
            h2: { fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.25 },
            h3: { fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.015em', lineHeight: 1.25 },
            h4: {
                fontSize: '1.5rem',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                lineHeight: 1.25,
                '@media (max-width:600px)': {
                    fontSize: '1.3rem',
                },
            },
            h5: { fontSize: '1.125rem', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.35 },
            h6: { fontSize: '1rem', fontWeight: 500, lineHeight: 1.4 },
            subtitle1: { fontSize: '0.95rem', fontWeight: 500, lineHeight: 1.45 },
            subtitle2: { fontSize: '0.85rem', fontWeight: 500, lineHeight: 1.45 },
            body1: { fontSize: '0.925rem', fontWeight: 400, lineHeight: 1.55 },
            body2: { fontSize: '0.84rem', fontWeight: 400, lineHeight: 1.5 },
            caption: { fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.4 },
            button: { fontWeight: 500, letterSpacing: '0.01em', textTransform: 'none' },
        },
        shape: {
            borderRadius: 8,
        },
        components: {
            MuiAppBar: {
                defaultProps: {
                    elevation: 0,
                },
                styleOverrides: {
                    root: {
                        boxShadow: 'none',
                        border: 'none',
                        backgroundImage: 'none',
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        textTransform: 'none',
                        borderRadius: 8,
                        fontWeight: 500,
                    },
                },
                variants: [
                    {
                        props: { variant: 'contained', color: 'primary' },
                        style: ({ theme }) => ({
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            color: '#fff',
                            boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.28)}`,
                            transition: 'transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease',
                            '&:hover': {
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 10%, ${theme.palette.secondary.main} 100%)`,
                                transform: 'translateY(-1px)',
                                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.38)}`,
                            },
                            '&.Mui-disabled': {
                                background: theme.palette.action.disabledBackground,
                                color: theme.palette.action.disabled,
                                boxShadow: 'none',
                            },
                        }),
                    },
                ],
            },
            MuiIconButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                        padding: 8,
                    },
                    sizeSmall: {
                        padding: 6,
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        padding: 0,
                        ...surfaceStyle,
                    },
                },
            },
            MuiContainer: {
                defaultProps: { maxWidth: 'lg' },
                styleOverrides: {
                    root: {
                        paddingLeft: '16px',
                        paddingRight: '16px',
                        '@media (min-width: 600px)': {
                            paddingLeft: '24px',
                            paddingRight: '24px',
                        },
                    },
                },
            },
            MuiPaper: {
                variants: [
                    {
                        props: { variant: 'section' },
                        style: ({ theme }) => ({
                            padding: theme.spacing(3),
                            '@media (max-width: 600px)': {
                                padding: theme.spacing(2),
                            },
                            ...surfaceStyle,
                            backgroundColor: theme.palette.background.paper,
                            marginBottom: theme.spacing(3),
                        }),
                    },
                    {
                        props: { variant: 'widget' },
                        style: ({ theme }) => ({
                            padding: theme.spacing(2.5),
                            '@media (max-width: 600px)': {
                                padding: theme.spacing(2),
                            },
                            ...surfaceStyle,
                            height: '100%',
                            minHeight: 150,
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                        }),
                    },
                    {
                        props: { variant: 'subtle' },
                        style: ({ theme }) => ({
                            padding: theme.spacing(2),
                            borderRadius: 10,
                            border: '1px solid',
                            borderColor: theme.palette.divider,
                            backgroundColor: alpha(theme.palette.text.primary, isDark ? 0.03 : 0.02),
                            boxShadow: 'none',
                            backgroundImage: 'none',
                        }),
                    },
                ],
                styleOverrides: {
                    root: {
                        ...surfaceStyle,
                    },
                    outlined: {
                        ...surfaceStyle,
                        boxShadow: 'none',
                    },
                },
            },
            MuiAccordion: {
                defaultProps: {
                    elevation: 0,
                },
                styleOverrides: {
                    root: {
                        ...surfaceStyle,
                        boxShadow: 'none',
                        '&:before': {
                            display: 'none',
                        },
                        '&.Mui-expanded': {
                            margin: '0 0 16px 0',
                        },
                    },
                },
            },
            MuiTabs: {
                styleOverrides: {
                    root: {
                        minHeight: 44,
                    },
                    indicator: {
                        height: 3,
                        borderRadius: '3px 3px 0 0',
                    },
                },
            },
            MuiTab: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        textTransform: 'none',
                        fontWeight: 400,
                        minHeight: 44,
                        fontSize: '0.9rem',
                        borderRadius: '8px 8px 0 0',
                        transition: 'background-color 0.15s ease, color 0.15s ease',
                        '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        },
                        '&.Mui-selected': {
                            fontWeight: 600,
                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        },
                    }),
                },
            },
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        ...surfaceStyle,
                        borderRadius: 16,
                        '@media (max-width: 600px)': {
                            margin: 12,
                            width: 'calc(100% - 24px)',
                            maxHeight: 'calc(100% - 24px)',
                            borderRadius: 14,
                        },
                    },
                },
            },
            MuiDialogTitle: {
                styleOverrides: {
                    root: {
                        padding: '20px 24px 14px',
                        '@media (max-width: 600px)': {
                            padding: '16px 16px 12px',
                        },
                        fontWeight: 600,
                        fontSize: '1.15rem',
                    },
                },
            },
            MuiDialogContent: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        padding: theme.spacing(2, 3),
                        '@media (max-width: 600px)': {
                            padding: theme.spacing(1.5, 2),
                        },
                    }),
                },
            },
            MuiDialogActions: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        padding: theme.spacing(1.75, 3),
                        '@media (max-width: 600px)': {
                            padding: theme.spacing(1.5, 2),
                        },
                        backgroundColor: alpha(theme.palette.text.primary, isDark ? 0.03 : 0.02),
                        borderTop: `1px solid ${theme.palette.divider}`,
                    }),
                },
            },
            MuiChip: {
                styleOverrides: {
                    root: {
                        borderRadius: 999,
                        fontWeight: 400,
                    },
                    sizeSmall: {
                        fontSize: '0.75rem',
                        height: 24,
                    },
                },
                variants: [
                    {
                        props: { variant: 'outlined', color: 'primary' },
                        style: ({ theme }) => ({
                            backgroundColor: alpha(theme.palette.primary.main, isDark ? 0.12 : 0.06),
                            border: '1px solid',
                            borderColor: alpha(theme.palette.primary.main, isDark ? 0.35 : 0.22),
                            color: isDark ? theme.palette.primary.light : theme.palette.primary.main,
                            fontWeight: 500,
                        }),
                    },
                ],
            },
            MuiTableHead: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        backgroundColor: alpha(theme.palette.text.primary, isDark ? 0.04 : 0.025),
                        '& .MuiTableCell-head': {
                            fontWeight: 600,
                            color: theme.palette.text.secondary,
                            fontSize: '0.78rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.03em',
                        },
                    }),
                },
            },
            MuiAvatar: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                        color: '#fff',
                        fontWeight: 500,
                        border: `1px solid ${alpha('#ffffff', 0.14)}`,
                    }),
                    img: {
                        padding: '5px',
                        objectFit: 'contain',
                    },
                },
            },
            MuiFilledInput: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8,
                        '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        },
                        '&.Mui-focused': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        },
                        '&:before': {
                            borderBottomColor: alpha(theme.palette.primary.main, 0.2),
                        },
                    }),
                },
            },
            MuiInputBase: {
                styleOverrides: {
                    input: {
                        // Prevent iOS Safari forced page zoom when focusing inputs (< 16px)
                        '@media (max-width: 600px)': {
                            fontSize: '1rem',
                        },
                    },
                },
            },
            MuiTextField: {
                defaultProps: { variant: 'outlined', size: 'small' },
            },
            MuiFormControl: {
                defaultProps: { variant: 'outlined', size: 'small' },
            },
            MuiSelect: {
                defaultProps: { variant: 'outlined', size: 'small' },
            },
        },
    });
};
