import { Outlet, useLocation } from 'react-router-dom';
import { Suspense } from 'react';
import Box from '@mui/material/Box';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileNavigation from './MobileNavigation';
import WorkoutDraftFab from '../journal/WorkoutDraftFab';
import OfflineBanner from '../common/OfflineBanner';
import PageLoader from '../common/PageLoader';

const Layout = () => {
    const location = useLocation();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    if (isAuthPage) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
                <Box component="main" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
                    <Suspense fallback={<PageLoader />}>
                        <Outlet />
                    </Suspense>
                </Box>
                <Footer />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
            <Navbar />
            <OfflineBanner />
            <Box component="main" sx={{ flexGrow: 1, pt: { xs: 1.5, md: 3.5 }, pb: { xs: 'calc(84px + env(safe-area-inset-bottom, 0px))', md: 5 } }}>
                <Suspense fallback={<PageLoader />}>
                    <Outlet />
                </Suspense>
            </Box>
            <Footer />
            <WorkoutDraftFab />
            <MobileNavigation />
        </Box>
    );
};

export default Layout;
