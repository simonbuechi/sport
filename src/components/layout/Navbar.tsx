import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import Brightness4 from '@mui/icons-material/Brightness4';
import Brightness7 from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAppTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const { mode, toggleColorMode } = useAppTheme();
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            await navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const pages = [
        { title: 'Exercises', path: '/exercises' },
        { title: 'Journal', path: '/journal' },
        { title: 'Profile', path: '/profile' }
    ];

    return (
        <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Toolbar>
                <Box
                    component={RouterLink}
                    to="/"
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        alignItems: 'center',
                        textDecoration: 'none'
                    }}
                >
                    <Box
                        component="img"
                        src={`${import.meta.env.BASE_URL}logo.webp`}
                        alt="Logo"
                        sx={{ height: 32, mr: 1.5 }}
                    />
                    <Typography
                        variant="h6"
                        sx={{
                            color: 'primary.main',
                        }}
                    >
                        Sport Amigo
                    </Typography>
                </Box>

                {/* Desktop menu */}
                <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, alignItems: 'center' }}>
                    {pages.map((page) => (
                        <Button key={page.title} color="inherit" component={RouterLink} to={page.path}>
                            {page.title}
                        </Button>
                    ))}
                    {currentUser && (
                        <Tooltip title="Logout">
                            <IconButton color="inherit" onClick={handleLogout} aria-label="logout">
                                <LogoutIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                    <Tooltip title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                        <IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit">
                            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                        </IconButton>
                    </Tooltip>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
