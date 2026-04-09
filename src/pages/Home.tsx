import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';

import { Link as RouterLink } from 'react-router-dom';
import { getUserProfile, updateUserProfile } from '../services/db';
import { useAuth } from '../context/AuthContext';
import packageJson from '../../package.json';

const APP_DESCRIPTION = `Sport Amigo helps you track your fitness activities, weight, and body measurements. (v${packageJson.version})`;

const ALL_DASHBOARD_ELEMENTS = [
    'Project Updates',
    'Weight Tracking',
    'Session Counter',
    'Profile',
    'Templates',
    'PRs',
    'Favorite Exercises',
    'Measurements',
    'Feedback'
];

const DEFAULT_WIDGETS = ['Project Updates', 'Session Counter', 'Templates'];

const Home = () => {
    const { currentUser } = useAuth();
    const [visibleWidgets, setVisibleWidgets] = useState<string[]>([]);
    const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
    const [widgetToClose, setWidgetToClose] = useState<string | null>(null);
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
                const profileData = await getUserProfile(currentUser.uid);
                
                if (profileData?.dashboardWidgets) {
                    setVisibleWidgets(profileData.dashboardWidgets);
                } else {
                    setVisibleWidgets(DEFAULT_WIDGETS);
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

    const handleUpdateWidgets = async (newWidgets: string[]) => {
        if (!currentUser) return;
        
        try {
            setVisibleWidgets(newWidgets);
            await updateUserProfile(currentUser.uid, { dashboardWidgets: newWidgets });
        } catch (err) {
            console.error('Failed to update dashboard settings:', err);
            setError('Failed to save dashboard settings.');
        }
    };

    const removeWidget = () => {
        if (!widgetToClose) return;
        const newWidgets = visibleWidgets.filter((w: string) => w !== widgetToClose);
        void handleUpdateWidgets(newWidgets);
        setWidgetToClose(null);
    };

    const toggleWidget = (widget: string) => {
        const newWidgets = visibleWidgets.includes(widget)
            ? visibleWidgets.filter((w: string) => w !== widget)
            : [...visibleWidgets, widget];
        void handleUpdateWidgets(newWidgets);
    };

    if (!currentUser) {
        return (
            <Container maxWidth="lg">
                <Typography variant="h4" component="h1" gutterBottom sx={{ mb: { xs: 2, md: 4 }, fontWeight: 600 }}>
                    Welcome to Sport Amigo
                </Typography>
                <Grid container spacing={{ xs: 2, md: 4 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper elevation={3} sx={{ p: { xs: 2.5, sm: 4 }, height: '100%', borderRadius: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>About</Typography>
                            <Typography variant="body1" sx={{ mb: { xs: 2, md: 4 }, fontSize: { xs: '1rem', md: '1.1rem' } }}>
                                {APP_DESCRIPTION}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        {/* We use a dynamic import or just reference the Login component if exported */}
                        {/* Since Login is used in Home, we assume it's available or we can just render the Login component content */}
                        {/* For simplicity, keep it consistent with previous structure but use Paper */}
                        <Paper elevation={3} sx={{ height: '100%', borderRadius: 2, p: 2 }}>
                            {/* Assuming Login is imported correctly from previous state */}
                            {/* Wait, I removed the Login import in my chunk. Re-adding it or using the previous one */}
                            <Typography variant="h6" align="center" gutterBottom>Sign In</Typography>
                            <Box sx={{ mt: 2 }}>
                                <RouterLink to="/login" style={{ textDecoration: 'none' }}>
                                    <Button variant="contained" fullWidth size="large">Go to Login</Button>
                                </RouterLink>
                            </Box>
                        </Paper>
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 2, md: 4 } }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                    Dashboard
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SettingsIcon />}
                    onClick={() => setIsManageDialogOpen(true)}
                >
                    Widgets
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

            <Grid container spacing={3}>
                {visibleWidgets.map((widget) => (
                    <Grid key={widget} size={{ xs: 12, md: 4 }}>
                        <Paper
                            elevation={2}
                            sx={{
                                p: 3,
                                position: 'relative',
                                borderRadius: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                minHeight: '150px'
                            }}
                        >
                            <IconButton
                                size="small"
                                sx={{ position: 'absolute', top: 8, right: 8 }}
                                onClick={() => setWidgetToClose(widget)}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                            <Typography variant="h6" sx={{ mb: 2, pr: 4 }}>
                                {widget}
                            </Typography>
                            <Box sx={{ flexGrow: 1 }}>
                                {/* Content placeholder */}
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* Manage Dashboard Dialog */}
            <Dialog 
                open={isManageDialogOpen} 
                onClose={() => setIsManageDialogOpen(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Manage Dashboard</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Select the elements you want to show on your dashboard.
                    </Typography>
                    <FormGroup>
                        {ALL_DASHBOARD_ELEMENTS.map((element) => (
                            <FormControlLabel
                                key={element}
                                control={
                                    <Checkbox
                                        checked={visibleWidgets.includes(element)}
                                        onChange={() => toggleWidget(element)}
                                    />
                                }
                                label={element}
                            />
                        ))}
                    </FormGroup>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsManageDialogOpen(false)} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Confirmation Dialog for closing a widget */}
            <Dialog
                open={Boolean(widgetToClose)}
                onClose={() => setWidgetToClose(null)}
            >
                <DialogTitle>Hide Widget?</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to hide the <strong>{widgetToClose}</strong> widget? You can add it back anytime from the "Widgets" menu.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setWidgetToClose(null)}>Cancel</Button>
                    <Button onClick={removeWidget} color="primary" variant="contained">
                        Hide
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Home;
