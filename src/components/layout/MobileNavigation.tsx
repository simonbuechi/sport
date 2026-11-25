import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import { alpha } from '@mui/material/styles';

import Home from '@mui/icons-material/Home';
import LibraryBooks from '@mui/icons-material/LibraryBooks';
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import Book from '@mui/icons-material/Book';
import Person from '@mui/icons-material/Person';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const MobileNavigation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    const getNavigationValue = () => {
        if (location.pathname === '/') return 0;
        if (location.pathname.startsWith('/exercises')) return 1;
        if (location.pathname.startsWith('/routines')) return 2;
        if (location.pathname.startsWith('/journal')) return 3;
        if (location.pathname.startsWith('/profile')) return 4;
        return 0;
    };

    const value = getNavigationValue();

    return (
        <Paper
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                display: { xs: 'block', md: 'none' },
                zIndex: 1050,
                bgcolor: (theme) => alpha(theme.palette.background.paper, 0.92),
                backdropFilter: 'blur(12px)',
                borderRadius: 0,
                border: 'none',
                borderTop: 1,
                borderColor: 'divider',
                pb: 'env(safe-area-inset-bottom)',
                boxShadow: (theme) =>
                    theme.palette.mode === 'dark'
                        ? '0 -4px 16px rgba(0, 0, 0, 0.35)'
                        : '0 -2px 12px rgba(15, 23, 42, 0.06)',
            }}
            elevation={0}
        >
            <BottomNavigation
                showLabels
                value={value}
                onChange={(_, newValue) => {
                    if (newValue === 0) void navigate('/');
                    else if (newValue === 1) void navigate('/exercises');
                    else if (newValue === 2) void navigate('/routines/programs');
                    else if (newValue === 3) void navigate('/journal');
                    else if (newValue === 4) void navigate('/profile');
                }}
                sx={{
                    bgcolor: 'transparent',
                    height: 60,
                    '& .MuiBottomNavigationAction-root': {
                        color: 'text.secondary',
                        minWidth: 0,
                        maxWidth: 'none',
                        px: 0.5,
                        py: 0.75,
                        transition: 'color 0.2s ease',
                        '& .MuiBottomNavigationAction-label': {
                            fontSize: '0.7rem',
                            mt: 0.25,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '100%',
                        },
                    },
                    '& .Mui-selected': {
                        color: 'primary.main',
                        '& .MuiBottomNavigationAction-label': {
                            fontWeight: 600,
                            fontSize: '0.72rem',
                        },
                    },
                }}
            >
                <BottomNavigationAction label={t('nav.home')} icon={<Home fontSize="small" />} />
                <BottomNavigationAction label={t('nav.exercises')} icon={<LibraryBooks fontSize="small" />} />
                <BottomNavigationAction label={t('nav.routines')} icon={<CalendarMonth fontSize="small" />} />
                <BottomNavigationAction label={t('nav.journal')} icon={<Book fontSize="small" />} />
                <BottomNavigationAction label={t('nav.profile')} icon={<Person fontSize="small" />} />
            </BottomNavigation>
        </Paper>
    );
};

export default MobileNavigation;
