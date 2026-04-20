import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import Star from '@mui/icons-material/Star';
import Close from '@mui/icons-material/Close';
import Edit from '@mui/icons-material/Edit';
import Logout from '@mui/icons-material/Logout';
import History from '@mui/icons-material/History';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, createUserProfile } from '../services/db';
import { useExercises } from '../context/ExercisesContext';
import { useWorkouts } from '../context/WorkoutsContext';
import { lazy, Suspense } from 'react';
import type { UserProfile, Exercise, WeightEntry, MeasurementEntry } from '../types';
import ExerciseListSection from '../components/exercises/ExerciseListSection';

const WeightSection = lazy(() => import('../components/profile/WeightSection'));
const MeasurementsSection = lazy(() => import('../components/profile/MeasurementsSection'));

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`profile-tabpanel-${String(index)}`}
            aria-labelledby={`profile-tab-${String(index)}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ mt: 2 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const Profile = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<Partial<UserProfile>>({
        name: '',
        birthYear: undefined,
        height: undefined,
        notes: '',
        markedExercises: {}
    });

    const [activeTab, setActiveTab] = useState(0);
    const { pathname } = useLocation();

    // Sync tab with URL path
    useEffect(() => {
        if (pathname === '/profile/body') setActiveTab(1);
        else if (pathname === '/profile/stats') setActiveTab(2);
        else setActiveTab(0);
    }, [pathname]);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
        // Update URL path when tab changes
        if (newValue === 1) void navigate('/profile/body');
        else if (newValue === 2) void navigate('/profile/stats');
        else void navigate('/profile');
    };

    const { exercises } = useExercises();
    const { entries: workouts } = useWorkouts();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [favoritesExpanded, setFavoritesExpanded] = useState(true);
    const [usedExpanded, setUsedExpanded] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) return;
            try {
                setLoading(true);
                const [userData] = await Promise.all([
                    getUserProfile(currentUser.uid)
                ]);

                if (userData) {
                    setProfile(userData);
                } else {
                    // If no profile exists, set the name to email prefix or display name as default
                    setProfile(prev => ({
                        ...prev,
                        name: currentUser.displayName ?? currentUser.email?.split('@')[0] ?? ''
                    }));
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load profile data');
            } finally {
                setLoading(false);
            }
        };

        void fetchData();
    }, [currentUser]);

    const handleChange = (field: keyof UserProfile) => (event: React.ChangeEvent<HTMLInputElement>) => {
        let value: string | number | boolean | undefined = event.target.value;

        if (field === 'birthYear' || field === 'height') {
            value = event.target.value === '' ? undefined : Number(event.target.value);
        }

        setProfile({ ...profile, [field]: value });
    };

    const handleLogout = async () => {
        try {
            await logout();
            await navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const handleSave = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        try {
            setSaving(true);
            setError('');
            setMessage('');

            // Use setDoc with merge (createUserProfile) unconditionally — no extra read needed
            await createUserProfile(currentUser.uid, profile);

            setMessage('Profile updated successfully');
            setIsEditDialogOpen(false);
        } catch (err) {
            console.error(err);
            setError('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleWeightsUpdated = (newWeights: WeightEntry[]) => {
        setProfile((prev) => ({ ...prev, weights: newWeights }));
    };

    const handleMeasurementsUpdated = (newMeasurements: MeasurementEntry[]) => {
        setProfile((prev) => ({ ...prev, measurements: newMeasurements }));
    };

    if (loading || (exercises.length === 0)) return (
        <Stack sx={{ mt: 8 }}><CircularProgress /></Stack>
    );

    const getMarkedExercises = (statusKey: 'favorite') => {
        if (!profile.markedExercises) return [];
        return Object.entries(profile.markedExercises)
            .filter(([, status]) => status[statusKey])
            .map(([exerciseId]) => exercises.find(t => t.id === exerciseId))
            .filter((t): t is Exercise => t !== undefined);
    };

    const favoriteTechs = getMarkedExercises('favorite');

    const usedExerciseIds = new Set(workouts.flatMap(w => w.exerciseIds));
    const usedExercises = exercises.filter(ex => usedExerciseIds.has(ex.id)).sort((a, b) => a.name.localeCompare(b.name));

    return (
        <Container maxWidth="lg">
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: { xs: 1, md: 2 } }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    aria-label="profile tabs"
                    indicatorColor="primary"
                    textColor="primary"
                >
                    <Tab 
                        label="Profile" 
                        sx={{ 
                            minHeight: 48,
                            textTransform: 'none',
                            '&.Mui-selected': {
                                bgcolor: 'action.selected',
                                borderRadius: '8px 8px 0 0',
                            }
                        }} 
                    />
                    <Tab 
                        label="Body" 
                        sx={{ 
                            minHeight: 48,
                            textTransform: 'none',
                            '&.Mui-selected': {
                                bgcolor: 'action.selected',
                                borderRadius: '8px 8px 0 0',
                            }
                        }} 
                    />
                    <Tab 
                        label="Stats" 
                        sx={{ 
                            minHeight: 48,
                            textTransform: 'none',
                            '&.Mui-selected': {
                                bgcolor: 'action.selected',
                                borderRadius: '8px 8px 0 0',
                            }
                        }} 
                    />
                </Tabs>
            </Box>
            {error && <Alert severity="error" sx={{ mt: 3, mb: 0 }}>{error}</Alert>}
            {message && <Alert severity="success" sx={{ mt: 3, mb: 0 }}>{message}</Alert>}
            <CustomTabPanel value={activeTab} index={0}>
                <Grid container spacing={4}>
                    <Grid size={12}>
                        <Grid 
                            container 
                            sx={{ 
                                alignItems: { xs: "flex-start", sm: "center" }, 
                                justifyContent: "space-between", 
                                mt: { xs: 1, md: 2 },
                                mb: { xs: 2, md: 4 } 
                            }}
                            spacing={2}
                        >
                            <Grid>
                                <Typography variant="h4" component="h1">
                                    Profile
                                </Typography>
                            </Grid>
                            <Grid>
                                <Grid container spacing={1.5}>
                                    <Grid>
                                        <Button
                                            variant="contained"
                                            startIcon={<Edit />}
                                            onClick={() => { setIsEditDialogOpen(true); }}
                                        >
                                            Edit
                                        </Button>
                                    </Grid>
                                    <Grid>
                                        <Button
                                            variant="outlined"
                                            onClick={handleLogout}
                                            startIcon={<Logout />}
                                        >
                                            Logout
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid size={{ xs: 12, md: 7 }}>
                        <Paper elevation={3} sx={{ p: { xs: 1.5, md: 3 }, }}>

                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="body1">{profile.name ?? 'Anonymous Athlete'}</Typography>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="subtitle2" sx={{
                                        color: "text.secondary"
                                    }}>Birth Year</Typography>
                                    <Typography variant="body1">{profile.birthYear ?? 'Not specified'}</Typography>
                                </Grid>
                                
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="subtitle2" sx={{
                                        color: "text.secondary"
                                    }}>Height</Typography>
                                    <Typography variant="body1">{profile.height ? `${String(profile.height)} cm` : 'Not specified'}</Typography>
                                </Grid>

                                {profile.notes && (
                                    <Grid size={{ xs: 12 }}>
                                        <Typography
                                            variant="subtitle2"
                                            sx={{
                                                color: "text.secondary",
                                                mb: 1
                                            }}>Notes & Journey</Typography>
                                        <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 }, bgcolor: 'background.default', }}>
                                            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                                {profile.notes}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                )}

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography variant="subtitle2" sx={{
                                            color: "text.secondary"
                                        }}>Member Since</Typography>
                                        <Typography variant="body1">
                                            {currentUser?.metadata.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : 'Unknown'}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography variant="subtitle2" sx={{
                                            color: "text.secondary"
                                        }}>Last Login</Typography>
                                        <Typography variant="body1">
                                            {currentUser?.metadata.lastSignInTime ? new Date(currentUser.metadata.lastSignInTime).toLocaleDateString() : 'Unknown'}
                                        </Typography>
                                    </Grid>

                            </Grid>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, md: 5 }}>
                        <Grid container spacing={3}>
                            <Grid size={12}>
                                <ExerciseListSection
                                    icon={<Star color="warning" sx={{ mr: 1 }} />}
                                    title="Favorites"
                                    techniques={favoriteTechs}
                                    expanded={favoritesExpanded}
                                    onToggle={() => { setFavoritesExpanded(!favoritesExpanded); }}
                                />
                            </Grid>
                            <Grid size={12}>
                                <ExerciseListSection
                                    icon={<History color="action" sx={{ mr: 1 }} />}
                                    title="Used Exercises"
                                    techniques={usedExercises}
                                    expanded={usedExpanded}
                                    onToggle={() => { setUsedExpanded(!usedExpanded); }}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </CustomTabPanel>
            <CustomTabPanel value={activeTab} index={1}>
                <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <WeightSection 
                                profile={{ ...profile, uid: currentUser?.uid ?? '' }} 
                                onWeightsUpdated={handleWeightsUpdated} 
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <MeasurementsSection 
                                profile={{ ...profile, uid: currentUser?.uid ?? '' }} 
                                onMeasurementsUpdated={handleMeasurementsUpdated} 
                            />
                        </Grid>
                    </Grid>
                </Suspense>
            </CustomTabPanel>
            <CustomTabPanel value={activeTab} index={2}>
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', mt: 4 }}>
                    <Typography color="text.secondary">Detailed analytics and progress stats coming soon!</Typography>
                </Paper>
            </CustomTabPanel>
            <Dialog
                open={isEditDialogOpen}
                onClose={() => { setIsEditDialogOpen(false); }}
                maxWidth="sm"
                fullWidth
                slotProps={{
                    paper: {
                        sx: { }
                    }
                }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    Edit Profile
                    <IconButton
                        aria-label="close"
                        onClick={() => { setIsEditDialogOpen(false); }}
                        sx={{
                            position: 'absolute',
                            right: 16,
                            top: 16,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>
                <form onSubmit={handleSave}>
                <DialogContent dividers sx={{ pt: 2 }}>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    label="Name"
                                    fullWidth
                                    value={profile.name ?? ''}
                                    onChange={handleChange('name')}
                                    required
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Birth Year"
                                    type="number"
                                    fullWidth
                                    value={profile.birthYear ?? ''}
                                    onChange={handleChange('birthYear')}
                                    slotProps={{
                                        htmlInput: { min: 1900, max: new Date().getFullYear() }
                                    }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Height (cm)"
                                    type="number"
                                    fullWidth
                                    value={profile.height ?? ''}
                                    onChange={handleChange('height')}
                                    slotProps={{
                                        htmlInput: { min: 50, max: 250 }
                                    }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    label="Training Notes / Journey"
                                    multiline
                                    rows={4}
                                    fullWidth
                                    value={profile.notes ?? ''}
                                    onChange={handleChange('notes')}
                                    placeholder="Keep track of your overall fitness goals, notes, or general thoughts..."
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, py: 2 }}>
                        <Button onClick={() => { setIsEditDialogOpen(false); }} color="inherit">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={saving}
                            sx={{ px: 3 }}
                        >
                            {saving ? 'Saving...' : 'Save Profile'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Container>
    );
};

export default Profile;
