import { useState, useEffect } from 'react';
import {
    Typography, Box, Container, Paper, TextField,
    Button, CircularProgress, Alert, Grid,
    Dialog, DialogTitle, DialogContent, DialogActions, IconButton
} from '@mui/material';
import { Favorite, School, MenuBook, Close, Edit, Logout } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, createUserProfile, getExercises } from '../services/db';
import type { UserProfile, Exercise, WeightEntry, MeasurementEntry } from '../types';
import ExerciseListSection from '../components/exercises/ExerciseListSection';
import WeightSection from '../components/profile/WeightSection';
import MeasurementsSection from '../components/profile/MeasurementsSection';

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

    const [allExercises, setAllExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [favoritesExpanded, setFavoritesExpanded] = useState(true);
    const [learningExpanded, setLearningExpanded] = useState(true);
    const [toLearnExpanded, setToLearnExpanded] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) return;
            try {
                setLoading(true);
                const [userData, exercisesData] = await Promise.all([
                    getUserProfile(currentUser.uid),
                    getExercises()
                ]);

                setAllExercises(exercisesData.exercises);

                if (userData) {
                    setProfile(userData);
                } else {
                    // If no profile exists, set the name to email prefix or display name as default
                    setProfile(prev => ({
                        ...prev,
                        name: currentUser.displayName || currentUser.email?.split('@')[0] || ''
                    }));
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load profile data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
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
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        try {
            setSaving(true);
            setError('');
            setMessage('');

            // Use setDoc with merge (createUserProfile) unconditionally — no extra read needed
            await createUserProfile(currentUser.uid, profile as Partial<UserProfile>);

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

    if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;

    const getMarkedExercises = (statusKey: 'favorite' | 'learning' | 'toLearn') => {
        if (!profile.markedExercises) return [];
        return Object.entries(profile.markedExercises)
            .filter(([, status]) => status[statusKey])
            .map(([exerciseId]) => allExercises.find(t => t.id === exerciseId))
            .filter((t): t is Exercise => t !== undefined);
    };

    const favoriteTechs = getMarkedExercises('favorite');
    const learningTechs = getMarkedExercises('learning');
    const toLearnTechs = getMarkedExercises('toLearn');

    return (
        <Container maxWidth="lg">
            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 7 }}>
                    <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mt: 4, borderRadius: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                            <Typography variant="h4" component="h1">
                                Your profile
                            </Typography>
                        </Box>

                        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                        {message && <Alert severity="success" sx={{ mb: 3 }}>{message}</Alert>}

                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="h5" fontWeight={600}>{profile.name || 'Anonymous Athlete'}</Typography>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="subtitle2" color="text.secondary">Birth Year</Typography>
                                <Typography variant="body1">{profile.birthYear || 'Not specified'}</Typography>
                            </Grid>
                            
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="subtitle2" color="text.secondary">Height</Typography>
                                <Typography variant="body1">{profile.height ? `${profile.height} cm` : 'Not specified'}</Typography>
                            </Grid>

                            {profile.notes && (
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Notes & Journey</Typography>
                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                            {profile.notes}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            )}

                            {currentUser && (
                                <>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography variant="subtitle2" color="text.secondary">Member Since</Typography>
                                        <Typography variant="body1">
                                            {currentUser.metadata.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : 'Unknown'}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography variant="subtitle2" color="text.secondary">Last Login</Typography>
                                        <Typography variant="body1">
                                            {currentUser.metadata.lastSignInTime ? new Date(currentUser.metadata.lastSignInTime).toLocaleDateString() : 'Unknown'}
                                        </Typography>
                                    </Grid>
                                </>
                            )}

                            {currentUser && (
                                <Grid size={{ xs: 12 }}>

                                    <Box mt={4} display="flex" gap={2}>
                                        <Button
                                            variant="contained"
                                            startIcon={<Edit />}
                                            onClick={() => setIsEditDialogOpen(true)}
                                            sx={{ minWidth: 150 }}
                                        >
                                            Edit Profile
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            onClick={handleLogout}
                                            startIcon={<Logout />}
                                            sx={{ minWidth: 150 }}
                                        >
                                            Logout
                                        </Button>
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    </Paper>

                    <Dialog
                        open={isEditDialogOpen}
                        onClose={() => setIsEditDialogOpen(false)}
                        maxWidth="sm"
                        fullWidth
                        PaperProps={{
                            sx: { borderRadius: 3 }
                        }}
                    >
                        <DialogTitle sx={{ pb: 1 }}>
                            Edit Profile
                            <IconButton
                                aria-label="close"
                                onClick={() => setIsEditDialogOpen(false)}
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
                            <DialogContent dividers sx={{ pt: 3 }}>
                                <Grid container spacing={3}>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            label="Name"
                                            fullWidth
                                            value={profile.name || ''}
                                            onChange={handleChange('name')}
                                            required
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            label="Birth Year"
                                            type="number"
                                            fullWidth
                                            value={profile.birthYear || ''}
                                            onChange={handleChange('birthYear')}
                                            inputProps={{ min: 1900, max: new Date().getFullYear() }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            label="Height (cm)"
                                            type="number"
                                            fullWidth
                                            value={profile.height || ''}
                                            onChange={handleChange('height')}
                                            inputProps={{ min: 50, max: 250 }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            label="Training Notes / Journey"
                                            multiline
                                            rows={4}
                                            fullWidth
                                            value={profile.notes || ''}
                                            onChange={handleChange('notes')}
                                            placeholder="Keep track of your overall fitness goals, notes, or general thoughts..."
                                        />
                                    </Grid>
                                </Grid>
                            </DialogContent>
                            <DialogActions sx={{ px: 3, py: 2 }}>
                                <Button onClick={() => setIsEditDialogOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={saving}
                                    sx={{ fontWeight: 600, px: 3 }}
                                >
                                    {saving ? 'Saving...' : 'Save Profile'}
                                </Button>
                            </DialogActions>
                        </form>
                    </Dialog>
                    
                    {currentUser && (
                        <>
                            <WeightSection 
                                profile={{ ...profile, uid: currentUser.uid }} 
                                onWeightsUpdated={handleWeightsUpdated} 
                            />
                            <MeasurementsSection 
                                profile={{ ...profile, uid: currentUser.uid }} 
                                onMeasurementsUpdated={handleMeasurementsUpdated} 
                            />
                        </>
                    )}
                </Grid>

                <Grid size={{ xs: 12, md: 5 }}>
                    <Box sx={{ position: 'sticky', top: 24, mt: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <ExerciseListSection
                            icon={<Favorite color="primary" sx={{ mr: 1 }} />}
                            title="Favorites"
                            techniques={favoriteTechs}
                            expanded={favoritesExpanded}
                            onToggle={() => setFavoritesExpanded(!favoritesExpanded)}
                        />
                        <ExerciseListSection
                            icon={<School color="primary" sx={{ mr: 1 }} />}
                            title="Currently Learning"
                            techniques={learningTechs}
                            expanded={learningExpanded}
                            onToggle={() => setLearningExpanded(!learningExpanded)}
                        />
                        <ExerciseListSection
                            icon={<MenuBook color="primary" sx={{ mr: 1 }} />}
                            title="To Learn"
                            techniques={toLearnTechs}
                            expanded={toLearnExpanded}
                            onToggle={() => setToLearnExpanded(!toLearnExpanded)}
                        />
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Profile;
