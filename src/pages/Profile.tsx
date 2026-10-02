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
import { alpha } from '@mui/material/styles';

import Star from '@mui/icons-material/Star';
import Close from '@mui/icons-material/Close';
import Edit from '@mui/icons-material/Edit';
import Logout from '@mui/icons-material/Logout';
import { ToggleButton, ToggleButtonGroup, Switch, FormControlLabel } from '@mui/material';
import { useAppTheme } from '../context/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useExercises } from '../context/ExercisesContext';
import { useWorkouts } from '../context/WorkoutsContext';
import { lazy, Suspense } from 'react';
import type { UserProfile, Exercise } from '../types';
import ExerciseListSection from '../components/exercises/ExerciseListSection';
import HistoryIcon from '@mui/icons-material/History';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/common/LanguageSelector';

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
                <Box sx={{ mt: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const Profile = () => {
    const { t } = useTranslation();
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const { mode, setThemeMode } = useAppTheme();
    const { profile, updateProfile, loading: profileLoading } = useUserProfile();
    const [activeTab, setActiveTab] = useState(0);
    const { pathname } = useLocation();

    // Form state for editing
    const [formState, setFormState] = useState<UserProfile | null>(null);

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

    const { exercises, loading: exercisesLoading } = useExercises();
    const { entries: workouts } = useWorkouts();
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [favoritesExpanded, setFavoritesExpanded] = useState(true);
    const [usedExpanded, setUsedExpanded] = useState(false);

    // Initialize form state when profile is loaded or dialog is opened
    useEffect(() => {
        if (isEditDialogOpen && profile) {
            setFormState(profile);
        }
    }, [isEditDialogOpen, profile]);

    const handleFormChange = (field: keyof UserProfile) => (event: React.ChangeEvent<HTMLInputElement>) => {
        let value: string | number | boolean | undefined = event.target.value;

        if (field === 'birthYear' || field === 'height') {
            value = event.target.value === '' ? undefined : Number(event.target.value);
        }

        if (formState) setFormState({ ...formState, [field]: value });
    };

    const handleSettingChange = (field: keyof NonNullable<UserProfile['settings']>) => (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!profile) return;
        const newSettings = { ...profile.settings, [field]: event.target.checked };
        void updateProfile({ settings: newSettings });
    };

    const handleThemeChange = (_event: React.MouseEvent<HTMLElement>, newTheme: 'light' | 'dark' | 'system' | null) => {
        if (newTheme !== null) {
            setThemeMode(newTheme);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            void navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const handleSave = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (!currentUser || !formState) return;

        try {
            setSaving(true);
            setError('');
            setMessage('');

            // ONLY update the fields that are in the form, to avoid overwriting 
            // arrays like weights or markedExercises if formState is stale.
            await updateProfile({
                name: formState.name,
                birthYear: formState.birthYear,
                height: formState.height,
                notes: formState.notes
            });

            setMessage('Profile updated successfully');
            setIsEditDialogOpen(false);
        } catch (err) {
            console.error(err);
            setError('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };



    if (profileLoading || (exercisesLoading && exercises.length === 0) || !profile) return (
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
                        label={t('profile.overview')}
                        sx={{
                            minHeight: 48,
                            textTransform: 'none',
                            '&.Mui-selected': {
                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                borderRadius: '8px 8px 0 0',
                            }
                        }}
                    />
                    <Tab
                        label={t('profile.bodyAndWeight')}
                        sx={{
                            minHeight: 48,
                            textTransform: 'none',
                            '&.Mui-selected': {
                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                borderRadius: '8px 8px 0 0',
                            }
                        }}
                    />
                    <Tab
                        label={t('profile.stats')}
                        sx={{
                            minHeight: 48,
                            textTransform: 'none',
                            '&.Mui-selected': {
                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                borderRadius: '8px 8px 0 0',
                            }
                        }}
                    />
                </Tabs>
            </Box>
            {error && <Alert severity="error" sx={{ mt: 3, mb: 0 }}>{error}</Alert>}
            {message && <Alert severity="success" sx={{ mt: 3, mb: 0 }}>{message}</Alert>}
            <CustomTabPanel value={activeTab} index={0}>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 7 }}>
                        <Grid container spacing={3}>
                            <Grid size={12}>
                                <Paper sx={{ p: { xs: 2, md: 3 }, }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                        <Typography variant="h5" sx={{ fontWeight: 700 }}>{t('profile.title')}</Typography>
                                        <Grid container spacing={1} sx={{ width: 'auto' }}>

                                            <Grid>
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    startIcon={<Edit />}
                                                    onClick={() => { setIsEditDialogOpen(true); }}
                                                >
                                                    {t('common.edit')}
                                                </Button>
                                            </Grid>
                                            <Grid>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={handleLogout}
                                                    startIcon={<Logout />}
                                                >
                                                    {t('nav.logout')}
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </Box>

                                    <Grid container spacing={3}>
                                        <Grid size={{ xs: 12 }}>
                                            <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>{t('profile.name')}</Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 600 }}>{profile.name}</Typography>
                                        </Grid>

                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Typography variant="subtitle2" sx={{
                                                color: "text.secondary"
                                            }}>{t('profile.birthYear')}</Typography>
                                            <Typography variant="body1">{profile.birthYear ?? '-'}</Typography>
                                        </Grid>

                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Typography variant="subtitle2" sx={{
                                                color: "text.secondary"
                                            }}>{t('profile.height')}</Typography>
                                            <Typography variant="body1">{profile.height ? `${String(profile.height)} cm` : '-'}</Typography>
                                        </Grid>

                                        {profile.notes && (
                                            <Grid size={{ xs: 12 }}>
                                                <Typography
                                                    variant="subtitle2"
                                                    sx={{
                                                        color: "text.secondary",
                                                        mb: 1
                                                    }}>{t('profile.notes')}</Typography>
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

                            <Grid size={12}>
                                <Paper sx={{ p: { xs: 2, md: 3 } }}>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="h6">{t('profile.settings')}</Typography>
                                    </Box>

                                    <Grid container spacing={3}>
                                        <Grid size={12}>
                                            <Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 1 }}>{t('profile.theme')}</Typography>
                                            <ToggleButtonGroup
                                                value={mode}
                                                exclusive
                                                onChange={handleThemeChange}
                                                aria-label="theme toggle"
                                                size="small"
                                                color="primary"
                                                fullWidth
                                            >
                                                <ToggleButton value="light" aria-label="light theme">
                                                    {t('profile.themeLight')}
                                                </ToggleButton>
                                                <ToggleButton value="dark" aria-label="dark theme">
                                                    {t('profile.themeDark')}
                                                </ToggleButton>
                                                <ToggleButton value="system" aria-label="system theme">
                                                    {t('profile.themeSystem')}
                                                </ToggleButton>
                                            </ToggleButtonGroup>
                                        </Grid>

                                        <Grid size={12}>
                                            <Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 1 }}>{t('profile.language')}</Typography>
                                            <LanguageSelector variant="select" size="small" />
                                        </Grid>

                                        <Grid size={12}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={profile.settings?.autoFillSets ?? false}
                                                        onChange={handleSettingChange('autoFillSets')}
                                                        color="primary"
                                                    />
                                                }
                                                label={
                                                    <Box>
                                                        <Typography variant="body1">{t('profile.autoFill')}</Typography>
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                            {t('profile.autoFillDesc')}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </Grid>

                                        <Grid size={12}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={profile.settings?.showTimer ?? true}
                                                        onChange={handleSettingChange('showTimer')}
                                                        color="primary"
                                                    />
                                                }
                                                label={
                                                    <Box>
                                                        <Typography variant="body1">{t('profile.timer')}</Typography>
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                            {t('profile.timerDesc')}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid size={{ xs: 12, md: 5 }}>
                        <Grid container spacing={3}>
                            <Grid size={12}>
                                <ExerciseListSection
                                    icon={<Star color="warning" sx={{ mr: 1 }} />}
                                    title={t('profile.favorites')}
                                    techniques={favoriteTechs}
                                    expanded={favoritesExpanded}
                                    onToggle={() => { setFavoritesExpanded(!favoritesExpanded); }}
                                />
                            </Grid>
                            <Grid size={12}>
                                <ExerciseListSection
                                    icon={<HistoryIcon color="action" sx={{ mr: 1 }} />}
                                    title={t('profile.usedExercises')}
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
                            <WeightSection />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <MeasurementsSection />
                        </Grid>
                    </Grid>
                </Suspense>
            </CustomTabPanel>
            <CustomTabPanel value={activeTab} index={2}>
                <Paper sx={{ p: { xs: 2, md: 3 }, textAlign: 'center' }}>
                    <Typography color="text.secondary">{t('profile.statsComingSoon')}</Typography>
                </Paper>
            </CustomTabPanel>
            <Dialog
                open={isEditDialogOpen}
                onClose={() => { setIsEditDialogOpen(false); }}
                maxWidth="sm"
                fullWidth
                slotProps={{
                    paper: {
                        sx: {}
                    }
                }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    {t('profile.editProfile')}
                    <IconButton
                        aria-label={t('common.close')}
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
                                    id="profile-name"
                                    label={t('profile.name')}
                                    fullWidth
                                    value={formState?.name ?? ''}
                                    onChange={handleFormChange('name')}
                                    required
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    id="profile-birthyear"
                                    label={t('profile.birthYear')}
                                    type="number"
                                    fullWidth
                                    value={formState?.birthYear ?? ''}
                                    onChange={handleFormChange('birthYear')}
                                    slotProps={{
                                        htmlInput: { min: 1900, max: new Date().getFullYear() }
                                    }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    id="profile-height"
                                    label={t('profile.height')}
                                    type="number"
                                    fullWidth
                                    value={formState?.height ?? ''}
                                    onChange={handleFormChange('height')}
                                    slotProps={{
                                        htmlInput: { min: 50, max: 250 }
                                    }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    id="profile-notes"
                                    label={t('profile.notes')}
                                    multiline
                                    rows={4}
                                    fullWidth
                                    value={formState?.notes ?? ''}
                                    onChange={handleFormChange('notes')}
                                    placeholder={t('profile.notesPlaceholder')}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, py: 2 }}>
                        <Button onClick={() => { setIsEditDialogOpen(false); }} color="inherit">
                            {t('common.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={saving}
                            sx={{ px: 3 }}
                        >
                            {saving ? t('common.saving') : t('common.save')}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Container>
    );
};

export default Profile;
