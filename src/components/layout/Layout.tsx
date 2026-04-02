import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileNavigation from './MobileNavigation';
import OfflineBanner from '../common/OfflineBanner';

const Layout = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <OfflineBanner />
            <Box component="main" sx={{ flexGrow: 1, py: { xs: 2, md: 4 }, pb: { xs: 8, md: 4 } }}>
                <Outlet />
            </Box>
            <Footer />
            <MobileNavigation />
        </Box>
    );
};

export default Layout;
