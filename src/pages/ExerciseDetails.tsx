import { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
    Typography, Box, CircularProgress, Container,
    Chip, Grid, Paper, Divider, Button, ToggleButton,
    ToggleButtonGroup, List, ListItem, ListItemText,
    ListItemIcon, Rating, TextField
} from '@mui/material';
import { Favorite, MenuBook, School, EventNote, ArrowBack, EditNote, Flag } from '@mui/icons-material';
import { getExerciseById, getUserProfile, updateUserProfile, getJournalEntries } from '../services/db';
import type { Exercise, UserProfile, MarkedStatus, ActivityLog as JournalEntry } from '../types';
import { useAuth } from '../context/AuthContext';

const updateExerciseStatus = (
    profile: UserProfile,
    exerciseId: string,
    statusUpdate: Partial<MarkedStatus>
): Record<string, MarkedStatus> => {
    const currentStatus = profile.markedExercises?.[exerciseId] || {};
    const updatedStatus = { ...currentStatus, ...statusUpdate };

    const isEmpty = !updatedStatus.favorite && !updatedStatus.learning && !updatedStatus.toLearn && !updatedStatus.skillLevel && !updatedStatus.notes;

    const updatedMarked = { ...(profile.markedExercises || {}) };
    if (isEmpty) {
        delete updatedMarked[exerciseId];
    } else {
        updatedMarked[exerciseId] = updatedStatus;
    }
    return updatedMarked;
};

const ExerciseDetails = () => {
    const { id } = useParams<{ id: string }>();
    const { currentUser } = useAuth();

    const [exercise, setExercise] = useState<Exercise | null>(null);
    const [connected, setConnected] = useState<Exercise[]>([]);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [sessions, setSessions] = useState<JournalEntry[]>([]);
    const [notes, setNotes] = useState('');
    const [isSavingNotes, setIsSavingNotes] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const techData = await getExerciseById(id);
                if (!techData) {
                    setError('Exercise not found');
                    return;
                }
                setExercise(techData);

                if (techData.connectedExercises && techData.connectedExercises.length > 0) {
                    const connectedPromises = techData.connectedExercises.map((cid: string) => getExerciseById(cid));
                    const connectedResults = await Promise.all(connectedPromises);
                    setConnected(connectedResults.filter((t: Exercise | null): t is Exercise => t !== null));
                }

                if (currentUser) {
                    const userProf = await getUserProfile(currentUser.uid);
                    setProfile(userProf);

                    const allEntries = await getJournalEntries(currentUser.uid);
                    const exerciseSessions = allEntries.filter((entry: JournalEntry) =>
                        entry.exerciseIds && entry.exerciseIds.includes(id)
                    );
                    setSessions(exerciseSessions);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load exercise details');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, currentUser]);

    useEffect(() => {
        if (profile && id) {
            setNotes(profile.markedExercises?.[id]?.notes || '');
        }
    }, [id, profile]);

    const handleStatusToggle = async (key: keyof Omit<MarkedStatus, 'skillLevel'>) => {
        if (!currentUser || !id || !profile) return;

        try {
            const currentValue = profile.markedExercises?.[id]?.[key];
            const updatedMarked = updateExerciseStatus(profile, id, { [key]: !currentValue });

            setProfile({ ...profile, markedExercises: updatedMarked });
            await updateUserProfile(currentUser.uid, { markedExercises: updatedMarked });
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    const handleRatingChange = async (_event: React.SyntheticEvent, newValue: number | null) => {
        if (!currentUser || !id || !profile) return;

        try {
            const updatedMarked = updateExerciseStatus(profile, id, {
                skillLevel: newValue === null ? undefined : newValue
            });

            setProfile({ ...profile, markedExercises: updatedMarked });
            await updateUserProfile(currentUser.uid, { markedExercises: updatedMarked });
        } catch (err) {
            console.error("Failed to update rating", err);
        }
    };

    const handleSaveNotes = async () => {
        if (!currentUser || !id || !profile) return;
        const currentNotes = profile.markedExercises?.[id]?.notes || '';
        if (notes === currentNotes) return;

        try {
            setIsSavingNotes(true);
            const updatedMarked = updateExerciseStatus(profile, id, { notes });
            setProfile({ ...profile, markedExercises: updatedMarked });
            await updateUserProfile(currentUser.uid, { markedExercises: updatedMarked });
        } catch (err) {
            console.error("Failed to save notes", err);
        } finally {
            setIsSavingNotes(false);
        }
    };


    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
    if (error || !exercise) return <Container><Typography color="error" mt={4}>{error || 'Not found'}</Typography></Container>;

    const currentStatus = profile?.markedExercises?.[exercise.id] || {};

    return (
        <Container maxWidth="lg">
            <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.paper', borderRadius: 2 }}>
                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Box mb={2} display="flex" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                                <Button
                                    component={RouterLink}
                                    to="/exercises"
                                    startIcon={<ArrowBack />}
                                    sx={{ mb: 1, color: 'text.secondary' }}
                                >
                                    Back to Overview
                                </Button>
                                <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
                                    {exercise.name}
                                </Typography>
                                <Chip
                                    label={exercise.type}
                                    color="primary"
                                    variant="outlined"
                                />
                            </Box>
                            {currentUser && (
                                <Button
                                    component={RouterLink}
                                    to={`/exercises/${exercise.id}/edit`}
                                    variant="outlined"
                                    color="primary"
                                    size="small"
                                >
                                    Edit
                                </Button>
                            )}
                        </Box>


                        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Description</Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                            {exercise.description}
                        </Typography>

                        {exercise.videos && exercise.videos.length > 0 && (
                            <Box mt={4}>
                                <Typography variant="h5" gutterBottom>Videos</Typography>
                                <Divider sx={{ mb: 2 }} />
                                <Grid container spacing={2}>
                                    {exercise.videos.map((vid: string, index: number) => {
                                        // Simple check to try and embed youtube, otherwise just a link
                                        const isYoutube = vid.includes('youtube.com/watch') || vid.includes('youtu.be/');
                                        if (isYoutube) {
                                            const videoId = vid.includes('youtube.com')
                                                ? new URL(vid).searchParams.get('v')
                                                : vid.split('youtu.be/')[1]?.split('?')[0];

                                            return (
                                                <Grid size={{ xs: 12, sm: 6 }} key={index}>
                                                    <Box sx={{ position: 'relative', paddingTop: '56.25%', width: '100%', borderRadius: 2, overflow: 'hidden' }}>
                                                        <iframe
                                                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                                                            src={`https://www.youtube.com/embed/${videoId}`}
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                            allowFullScreen
                                                            title={`Video ${index + 1}`}
                                                        />
                                                    </Box>
                                                </Grid>
                                            );
                                        }
                                        return (
                                            <Grid size={{ xs: 12 }} key={index}>
                                                <Button href={vid} target="_blank" rel="noopener noreferrer" variant="outlined" sx={{ justifyContent: 'flex-start', textTransform: 'none' }} fullWidth>
                                                    {vid}
                                                </Button>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            </Box>
                        )}

                        {exercise.resources && exercise.resources.length > 0 && (
                            <Box mt={4}>
                                <Typography variant="h5" gutterBottom>Resources</Typography>
                                <Divider sx={{ mb: 2 }} />
                                <List disablePadding>
                                    {exercise.resources.map((res: string, index: number) => (
                                        <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                                            <Button href={res} target="_blank" rel="noopener noreferrer" variant="text" sx={{ justifyContent: 'flex-start', textTransform: 'none', textAlign: 'left' }} fullWidth>
                                                {res}
                                            </Button>
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        )}

                        {connected.length > 0 && (
                            <Box mt={6}>
                                <Typography variant="h5" gutterBottom>Connected Exercises</Typography>
                                <Divider sx={{ mb: 2 }} />
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                                    {connected.map(tech => (
                                        <Paper
                                            key={tech.id}
                                            component={RouterLink}
                                            to={`/exercises/${tech.id}`}
                                            variant="outlined"
                                            sx={{
                                                px: 2,
                                                py: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                textDecoration: 'none',
                                                color: 'inherit',
                                                borderRadius: 10,
                                                transition: '0.2s',
                                                '&:hover': {
                                                    borderColor: 'primary.main',
                                                    bgcolor: 'action.hover',
                                                    transform: 'translateY(-1px)',
                                                    boxShadow: 1
                                                }
                                            }}
                                        >
                                            <Typography variant="body1" fontWeight={600}>
                                                {tech.name}
                                            </Typography>
                                            <Chip
                                                label={tech.type}
                                                size="small"
                                                variant="outlined"
                                                color="primary"
                                                sx={{ pointerEvents: 'none' }}
                                            />
                                        </Paper>
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Box sx={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Paper variant="outlined" sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>My Progress</Typography>
                                <Divider sx={{ mb: 3 }} />

                                {!currentUser ? (
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" mb={2}>
                                            Log in to mark this exercise and track your progress.
                                        </Typography>
                                        <Button variant="outlined" fullWidth component={RouterLink} to="/login">
                                            Log In
                                        </Button>
                                    </Box>
                                ) : (
                                    <Box display="flex" flexDirection="column" gap={2}>
                                        <ToggleButtonGroup
                                            orientation="vertical"
                                            fullWidth
                                            sx={{
                                                '& .MuiToggleButton-root': {
                                                    display: 'flex',
                                                    justifyContent: 'flex-start',
                                                    px: 2,
                                                    py: 1,
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    transition: 'all 0.2s',
                                                    textTransform: 'none',
                                                    borderRadius: 0,
                                                    mb: 0,
                                                    '&:first-of-type': {
                                                        borderTopLeftRadius: '12px',
                                                        borderTopRightRadius: '12px',
                                                    },
                                                    '&:last-of-type': {
                                                        borderBottomLeftRadius: '12px',
                                                        borderBottomRightRadius: '12px',
                                                    }
                                                }
                                            }}
                                        >
                                            <ToggleButton
                                                value="favorite"
                                                selected={!!currentStatus.favorite}
                                                onChange={() => handleStatusToggle('favorite')}
                                                size="small"
                                                sx={{
                                                    '&.Mui-selected': {
                                                        bgcolor: '#D7195F',
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        borderColor: '#D7195F',
                                                        '&:hover': { bgcolor: '#D7195F' },
                                                        '& .MuiSvgIcon-root': { color: 'white' }
                                                    }
                                                }}
                                            >
                                                <Favorite sx={{ mr: 1, fontSize: 22 }} />
                                                <Typography variant="body2" sx={{ fontWeight: 'inherit', textAlign: 'left' }}>Favorite</Typography>
                                                {currentStatus.favorite && <Flag sx={{ ml: 'auto', fontSize: 18 }} />}
                                            </ToggleButton>
                                            <ToggleButton
                                                value="learning"
                                                selected={!!currentStatus.learning}
                                                onChange={() => handleStatusToggle('learning')}
                                                size="small"
                                                sx={{
                                                    '&.Mui-selected': {
                                                        bgcolor: '#B21E84',
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        borderColor: '#B21E84',
                                                        '&:hover': { bgcolor: '#B21E84' },
                                                        '& .MuiSvgIcon-root': { color: 'white' }
                                                    }
                                                }}
                                            >
                                                <School sx={{ mr: 1, fontSize: 22 }} />
                                                <Typography variant="body2" sx={{ fontWeight: 'inherit', textAlign: 'left' }}>Currently Learning</Typography>
                                                {currentStatus.learning && <Flag sx={{ ml: 'auto', fontSize: 18 }} />}
                                            </ToggleButton>
                                            <ToggleButton
                                                value="toLearn"
                                                selected={!!currentStatus.toLearn}
                                                onChange={() => handleStatusToggle('toLearn')}
                                                size="small"
                                                sx={{
                                                    '&.Mui-selected': {
                                                        bgcolor: '#9123A6',
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        borderColor: '#9123A6',
                                                        '&:hover': { bgcolor: '#9123A6' },
                                                        '& .MuiSvgIcon-root': { color: 'white' }
                                                    }
                                                }}
                                            >
                                                <MenuBook sx={{ mr: 1, fontSize: 22 }} />
                                                <Typography variant="body2" sx={{ fontWeight: 'inherit', textAlign: 'left' }}>To Learn</Typography>
                                                {currentStatus.toLearn && <Flag sx={{ ml: 'auto', fontSize: 18 }} />}
                                            </ToggleButton>
                                        </ToggleButtonGroup>

                                        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mt: 2, mb: 1 }}>
                                            <Typography variant="subtitle2">My Skill Level</Typography>
                                            <Rating
                                                name="exercise-skill-level"
                                                value={currentStatus.skillLevel || 0}
                                                onChange={handleRatingChange}
                                                size="medium"
                                            />
                                        </Box>
                                    </Box>
                                )}
                            </Paper>

                            {currentUser && (
                                <Paper variant="outlined" sx={{ p: 3 }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <EditNote color="primary" />
                                            <Typography variant="h6">My Notes</Typography>
                                        </Box>
                                        {isSavingNotes && <CircularProgress size={16} />}
                                    </Box>
                                    <Divider sx={{ mb: 2 }} />
                                    <TextField
                                        multiline
                                        rows={6}
                                        fullWidth
                                        placeholder="Add your personal notes and details about this exercise..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        onBlur={handleSaveNotes}
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                bgcolor: 'background.default',
                                            }
                                        }}
                                    />
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                        Notes are private to you and save automatically.
                                    </Typography>
                                </Paper>
                            )}

                            {currentUser && sessions.length > 0 && (
                                <Paper variant="outlined" sx={{ p: 3 }}>
                                    <Typography variant="h6" gutterBottom>Training History</Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <List disablePadding>
                                        {sessions.map(session => (
                                            <ListItem key={session.id} disablePadding sx={{ mb: 1, alignItems: 'flex-start' }}>
                                                <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                                                    <EventNote fontSize="small" color="primary" />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={new Date(session.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                                    secondary={
                                                        <>
                                                            {session.sessionType || 'Training Session'}
                                                            {session.length ? ` • ${session.length} min` : ''}
                                                        </>
                                                    }
                                                    secondaryTypographyProps={{ variant: 'caption', display: 'block' }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                    <Button
                                        component={RouterLink}
                                        to="/journal"
                                        variant="text"
                                        fullWidth
                                        size="small"
                                        sx={{ mt: 1 }}
                                    >
                                        View Full Journal
                                    </Button>
                                </Paper>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Container >
    );
};

export default ExerciseDetails;
