import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { Home, LibraryBooks, Book, Person } from '@mui/icons-material';
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
            }}
            elevation={3}
        >
            <BottomNavigation
                showLabels
                value={value}
                onChange={(_, newValue) => {
                    if (newValue === 0) navigate('/');
                    else if (newValue === 1) navigate('/exercises');
                    else if (newValue === 2) navigate('/journal');
                    else if (newValue === 3) navigate('/profile');
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
