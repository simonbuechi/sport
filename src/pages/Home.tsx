import { useState, useEffect } from 'react';
import { Typography, Box, Grid, CircularProgress, Alert, Container, Button, Card, CardContent } from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';

import { Link as RouterLink } from 'react-router-dom';
import { getUserProfile, getJournalEntries } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { usePwa } from '../context/PwaContext';
import Login from './Login';
import packageJson from '../../package.json';
import type { MarkedStatus } from '../types';

const APP_DESCRIPTION = `Sport Amigo helps you track your fitness activities, weight, and body measurements. (v${packageJson.version})`;

const Home = () => {
    const { currentUser } = useAuth();
    const { isInstallable, install } = usePwa();
    const [sessionsCount, setSessionsCount] = useState<number | null>(null);
    const [favoriteCount, setFavoriteCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!currentUser) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const [profileData, sessionsData] = await Promise.all([
                    getUserProfile(currentUser.uid),
                    getJournalEntries(currentUser.uid)
                ]);

                setSessionsCount(sessionsData.length);

                if (profileData?.markedExercises) {
                    const favorites = Object.values(profileData.markedExercises).filter((status: MarkedStatus) => status.favorite).length;
                    setFavoriteCount(favorites);
                } else {
                    setFavoriteCount(0);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        void fetchDashboardData();
    }, [currentUser]);

    if (!currentUser) {
        return (
            <Container maxWidth="lg">
                <Typography variant="h4" component="h1" gutterBottom sx={{ mb: { xs: 2, md: 4 }, fontWeight: 600 }}>
                    Welcome to Sport Amigo
                </Typography>
                <Grid container spacing={{ xs: 2, md: 4 }} sx={{
                    alignItems: "stretch"
                }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
                            <CardContent sx={{ p: { xs: 2.5, sm: 4 }, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>About</Typography>
                                <Typography variant="body1" sx={{ mb: { xs: 2, md: 4 }, flexGrow: 1, fontSize: { xs: '1rem', md: '1.1rem' } }}>
                                    {APP_DESCRIPTION}
                                </Typography>
                                <Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card elevation={3} sx={{ height: '100%', borderRadius: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 2 }}>
                            <Login />
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        );
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: { xs: 2, md: 4 } }}>
                Dashboard
            </Typography>
            {error && <Alert severity="error" sx={{ mb: { xs: 2, md: 4 } }}>{error}</Alert>}
            <Grid container spacing={{ xs: 2, md: 4 }}>
                {/* Welcome Info Card */}
                <Grid size={{ xs: 12 }}>
                    <Card elevation={3} sx={{ borderRadius: 2 }}>
                        <CardContent sx={{ p: { xs: 2.5, sm: 4 }, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: { xs: 2, sm: 3 } }}>
                            <Typography variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, textAlign: { xs: 'center', sm: 'left' } }}>
                                {APP_DESCRIPTION}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Sessions Stat Card */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: { xs: 2.5, sm: 4 }, height: '100%' }}>
                            <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold', fontSize: { xs: '2.5rem', md: '3rem' } }}>
                                {sessionsCount ?? '-'}
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: "text.secondary",
                                    mb: { xs: 2, md: 4 },
                                    textAlign: 'center'
                                }}>
                                Logged Sessions
                            </Typography>
                            <Box sx={{ mt: 'auto', width: '100%' }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    component={RouterLink}
                                    to="/journal"
                                    fullWidth
                                    size="large"
                                >
                                    Add New Session
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Favorites Stat Card */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card elevation={3} sx={{ height: '100%', borderRadius: 2 }}>
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: { xs: 2.5, sm: 4 }, height: '100%' }}>
                            <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold', fontSize: { xs: '2.5rem', md: '3rem' } }}>
                                {favoriteCount ?? '-'}
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: "text.secondary",
                                    mb: { xs: 2, md: 4 },
                                    textAlign: 'center'
                                }}>
                                Favorite Exercises
                            </Typography>
                            <Box sx={{ mt: 'auto', width: '100%' }}>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    component={RouterLink}
                                    to="/exercises"
                                    fullWidth
                                    size="large"
                                >
                                    Explore Exercises
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* PWA Install Card */}
                {isInstallable && (
                    <Grid size={{ xs: 12 }}>
                        <Card elevation={3} sx={{ borderRadius: 2 }}>
                            <CardContent sx={{ p: { xs: 2.5, sm: 4 }, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: { xs: 2, sm: 3 } }}>
                                <Typography variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, textAlign: { xs: 'center', sm: 'left' } }}>
                                    Install Sport Amigo on your device for faster access, offline support, and a better experience.
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={install}
                                    startIcon={<GetAppIcon />}
                                    sx={{ minWidth: '150px' }}
                                >
                                    Install App
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                )}

            </Grid>
        </Container>
    );
};

export default Home;
