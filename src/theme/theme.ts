import { createTheme, type PaletteMode } from '@mui/material/styles';

declare module '@mui/material/Paper' {
    interface PaperPropsVariantOverrides {
        section: true;
        widget: true;
    }
}

// ==========================================
// CENTRAL THEME CONFIGURATION
// Modify these values to quickly change the app's look and feel
// ==========================================

export const THEME_COLORS = {
    light: {
        primary: '#9123A6',    // Vibrant Blue
        secondary: '#D7195F',  // Amber/Warm Orange
        background: '#f0f5f7ff', // Soft Off-white
        paper: '#FFFFFF',
        warning: '#fbc02d',    // Vibrant Yellow-Gold (less orange)
    },
    dark: {
        primary: '#D7195F',    // Light Blue
        secondary: '#9123A6',  // Light Amber
        background: '#0c1b27ff', // Slate Dark
        paper: '#1c3243ff',      // Slate Slightly Lighter
        warning: '#ffb300',      // Balanced Amber for Dark Mode
    }
};

export const getAppTheme = (mode: PaletteMode) => createTheme({
    palette: {
        mode,
        primary: {
            main: mode === 'dark' ? THEME_COLORS.dark.primary : THEME_COLORS.light.primary,
        },
        secondary: {
            main: mode === 'dark' ? THEME_COLORS.dark.secondary : THEME_COLORS.light.secondary,
        },
        background: {
            default: mode === 'dark' ? THEME_COLORS.dark.background : THEME_COLORS.light.background,
            paper: mode === 'dark' ? THEME_COLORS.dark.paper : THEME_COLORS.light.paper,
        },
        warning: {
            main: mode === 'dark' ? THEME_COLORS.dark.warning : THEME_COLORS.light.warning,
        },
    },
    typography: {
        fontSize: 12, // Default is 14px. Adjust this to globally change font size.
        fontFamily: '"Inter", "Roboto", "Segoe UI", sans-serif',
        h1: {
            fontSize: 18,
            fontWeight: 700,
        },
        h2: {
            fontSize: 18,
            fontWeight: 700,
        },
        h3: {
            fontSize: 18,
            fontWeight: 700,
        },
        h4: {
            fontSize: 18,
            fontWeight: 700,
        },
        h5: {
            fontSize: 14,
            fontWeight: 700,
        },
        h6: {
            fontSize: 14,
            fontWeight: 700,
        },
        subtitle1: {
            fontWeight: 700,
        },
        subtitle2: {
            fontWeight: 700,
        },
        body1: {
            fontWeight: 400,
        },
        body2: {
            fontWeight: 400,
        },
        caption: {
            fontWeight: 400,
        },
        button: {
            fontWeight: 700,
            letterSpacing: '0.02em',
        }
    },
    shape: {
        borderRadius: 6,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 8,
                },
                contained: ({ theme }) => ({
                    background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    color: '#fff',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        background: `linear-gradient(45deg, ${theme.palette.primary.main} 10%, ${theme.palette.secondary.main} 110%)`,
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    },
                }),
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    padding: 0,
                    boxShadow: mode === 'dark' ? '0 4px 6px rgba(0,0,0,0.3)' : '0 4px 6px rgba(0,0,0,0.1)',
                },
            },
        },
        MuiContainer: {
            defaultProps: {
                maxWidth: 'lg',
            },
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
        MuiStack: {
            defaultProps: {
                direction: 'row',
                spacing: 2,
            },
        },
        MuiPaper: {
            variants: [
                {
                    props: { variant: 'section' },
                    style: ({ theme }) => ({
                        padding: theme.spacing(3),
                        borderRadius: theme.shape.borderRadius,
                        backgroundColor: theme.palette.background.paper,
                        marginBottom: theme.spacing(4),
                    }),
                },
                {
                    props: { variant: 'widget' },
                    style: ({ theme }) => ({
                        padding: theme.spacing(2.5),
                        borderRadius: theme.shape.borderRadius,
                        height: '100%',
                        minHeight: 150,
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows[4],
                        },
                    }),
                },
            ],
            styleOverrides: {
                outlined: {
                    borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
                }
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 16,
                }
            }
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    padding: '24px 24px 16px', // Title stays consistent for now
                    '@media (max-width: 600px)': {
                        padding: '16px 16px 8px',
                    },
                    fontWeight: 700,
                }
            }
        },
        MuiDialogContent: {
            styleOverrides: {
                root: ({ theme }) => ({
                    padding: theme.spacing(1, 3, 3),
                    '@media (max-width: 600px)': {
                        padding: theme.spacing(1, 2, 2),
                    },
                })
            }
        },
        MuiDialogActions: {
            styleOverrides: {
                root: ({ theme }) => ({
                    padding: theme.spacing(2, 3),
                    '@media (max-width: 600px)': {
                        padding: theme.spacing(1.5, 2),
                    },
                })
            }
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 100,
                    fontWeight: 400,
                },
            },
            variants: [
                {
                    props: { variant: 'outlined', color: 'primary' },
                    style: ({ theme }) => ({
                        backgroundColor: mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.08)'
                            : 'rgba(0, 0, 0, 0.05)',
                        border: '1px solid',
                        borderColor: mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.15)'
                            : 'rgba(0, 0, 0, 0.12)',
                        color: theme.palette.text.secondary,
                        textTransform: 'capitalize',
                        fontSize: '0.75rem',
                        '& .MuiChip-label': {
                            paddingLeft: 10,
                            paddingRight: 10,
                        }
                    })
                }
            ]
        },
        MuiAvatar: {
            styleOverrides: {
                root: ({ theme }) => ({
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                }),
                img: {
                    padding: '6px',
                    objectFit: 'contain',
                },
            },
        },
    },
});
