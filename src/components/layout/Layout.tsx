import { Outlet, useLocation } from 'react-router-dom';
import { Suspense } from 'react';
import Box from '@mui/material/Box';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileNavigation from './MobileNavigation';
import OfflineBanner from '../common/OfflineBanner';
import PageLoader from '../common/PageLoader';

const Layout = () => {
    const location = useLocation();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    if (isAuthPage) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
                <Box component="main" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Suspense fallback={<PageLoader />}>
                        <Outlet />
                    </Suspense>
                </Box>
                <Footer />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <OfflineBanner />
            <Box component="main" sx={{ flexGrow: 1, py: { xs: 2, md: 4 }, pb: { xs: 8, md: 4 } }}>
                <Suspense fallback={<PageLoader />}>
                    <Outlet />
                </Suspense>
            </Box>
            <Footer />
            <MobileNavigation />
        </Box>
    );
};

export default Layout;
