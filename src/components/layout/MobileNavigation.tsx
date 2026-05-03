import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';

import Home from '@mui/icons-material/Home';
import LibraryBooks from '@mui/icons-material/LibraryBooks';
import Book from '@mui/icons-material/Book';
import Person from '@mui/icons-material/Person';
import { useNavigate, useLocation } from 'react-router-dom';

const MobileNavigation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const getNavigationValue = () => {
        if (location.pathname === '/') return 0;
        if (location.pathname.startsWith('/exercises')) return 1;
        if (location.pathname.startsWith('/journal')) return 2;
        if (location.pathname.startsWith('/profile')) return 3;
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
                display: { xs: 'block', md: 'none' }, // Only show on mobile
                zIndex: 1000,
                background: (theme) => theme.palette.mode === 'light'
                    ? '#bdcfe7ff' // Slate 200 (a bit darker than the Slate 100 background)
                    : '#1e293b', // Slate 800 for dark mode
                borderRadius: 0,
                border: 'none',
            }}
            elevation={8}
        >
            <BottomNavigation
                showLabels
                value={value}
                onChange={(_, newValue) => {
                    if (newValue === 0) void navigate('/');
                    else if (newValue === 1) void navigate('/exercises');
                    else if (newValue === 2) void navigate('/journal');
                    else if (newValue === 3) void navigate('/profile');
                }}
                sx={{
                    bgcolor: 'transparent',
                    height: 64,
                    '& .MuiBottomNavigationAction-root': {
                        color: 'text.secondary',
                        transition: 'all 0.2s ease-in-out',
                    },
                    '& .Mui-selected': {
                        color: (theme) => `${theme.palette.primary.main} !important`,
                        '& .MuiBottomNavigationAction-label': {
                            fontWeight: 700,
                            fontSize: '0.85rem',
                        },
                        '& .MuiSvgIcon-root': {
                            transform: 'scale(1.1)',
                        }
                    },
                }}
            >
                <BottomNavigationAction label="Home" icon={<Home />} />
                <BottomNavigationAction label="Exercises" icon={<LibraryBooks />} />
                <BottomNavigationAction label="Journal" icon={<Book />} />
                <BottomNavigationAction label="Profile" icon={<Person />} />
            </BottomNavigation>
        </Paper>
    );
};

export default MobileNavigation;
