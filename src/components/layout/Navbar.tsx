import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LogoutIcon from '@mui/icons-material/Logout';
import { alpha } from '@mui/material/styles';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    const handleLogout = async () => {
        try {
            await logout();
            await navigate('/login');
        } catch (error) {
            console.error('Failed to log out', error);
        }
    };

    const pages = [
        { title: t('nav.home'), path: '/', matchPrefix: '/' },
        { title: t('nav.exercises'), path: '/exercises', matchPrefix: '/exercises' },
        { title: t('nav.routines'), path: '/routines/programs', matchPrefix: '/routines' },
        { title: t('nav.journal'), path: '/journal', matchPrefix: '/journal' },
        { title: t('nav.profile'), path: '/profile', matchPrefix: '/profile' },
    ];

    const isRouteActive = (matchPrefix: string) => {
        if (matchPrefix === '/') return location.pathname === '/';
        return location.pathname.startsWith(matchPrefix);
    };

    return (
        <AppBar
            position="sticky"
            color="transparent"
            elevation={0}
            sx={{
                top: 0,
                zIndex: 1100,
                bgcolor: (theme) => alpha(theme.palette.background.paper, 0.85),
                backdropFilter: 'blur(12px)',
                borderBottom: 1,
                borderColor: 'divider',
            }}
        >
            <Container maxWidth="lg">
                <Toolbar disableGutters sx={{ minHeight: { xs: 56, md: 64 } }}>
                    <Box
                        component={RouterLink}
                        to="/"
                        sx={{
                            flexGrow: 1,
                            display: 'flex',
                            alignItems: 'center',
                            textDecoration: 'none',
                            gap: 1.25,
                        }}
                    >
                        <Box
                            component="img"
                            src={`${import.meta.env.BASE_URL}logo.webp`}
                            alt="Sport Amigo Logo"
                            sx={{ height: 32, width: 32, objectFit: 'contain' }}
                        />
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 700,
                                letterSpacing: '-0.02em',
                                background: (theme) =>
                                    `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Sport Amigo
                        </Typography>
                    </Box>

                    {/* Desktop navigation */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.75, alignItems: 'center' }}>
                        {pages.map((page) => {
                            const active = isRouteActive(page.matchPrefix);
                            return (
                                <Button
                                    key={page.path}
                                    component={RouterLink}
                                    to={page.path}
                                    color={active ? 'primary' : 'inherit'}
                                    sx={{
                                        px: 1.75,
                                        py: 0.75,
                                        borderRadius: 2,
                                        fontWeight: active ? 600 : 400,
                                        color: active ? 'primary.main' : 'text.primary',
                                        bgcolor: (theme) =>
                                            active ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                        '&:hover': {
                                            bgcolor: (theme) =>
                                                active
                                                    ? alpha(theme.palette.primary.main, 0.16)
                                                    : theme.palette.action.hover,
                                        },
                                    }}
                                >
                                    {page.title}
                                </Button>
                            );
                        })}
                        {currentUser && (
                            <Tooltip title={t('nav.logout')}>
                                <IconButton
                                    color="inherit"
                                    onClick={() => { void handleLogout(); }}
                                    aria-label={t('nav.logout')}
                                    sx={{ ml: 0.5, color: 'text.secondary' }}
                                >
                                    <LogoutIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Navbar;
