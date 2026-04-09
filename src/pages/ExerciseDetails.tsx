import { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Rating from '@mui/material/Rating';
import TextField from '@mui/material/TextField';
import Avatar from '@mui/material/Avatar';

import Favorite from '@mui/icons-material/Favorite';
import MenuBook from '@mui/icons-material/MenuBook';
import School from '@mui/icons-material/School';
import EventNote from '@mui/icons-material/EventNote';
import ArrowBack from '@mui/icons-material/ArrowBack';
import EditNote from '@mui/icons-material/EditNote';
import Flag from '@mui/icons-material/Flag';
import Delete from '@mui/icons-material/Delete';
import { getExerciseById, getUserProfile, updateUserProfile, getJournalEntries, deleteExercise } from '../services/db';
import type { Exercise, UserProfile, MarkedStatus, ActivityLog as JournalEntry } from '../types';
import { useAuth } from '../context/AuthContext';

const updateExerciseStatus = (
    profile: UserProfile,
    exerciseId: string,
    statusUpdate: Partial<MarkedStatus>
): Record<string, MarkedStatus> => {
    const currentStatus = profile.markedExercises[exerciseId] ?? {};
    const updatedStatus = { ...currentStatus, ...statusUpdate };

    const isEmpty = !updatedStatus.favorite && !updatedStatus.learning && !updatedStatus.toLearn && !updatedStatus.skillLevel && !updatedStatus.notes;

    const updatedMarked = { ...profile.markedExercises };
    if (isEmpty) {
        const { [exerciseId]: _, ...rest } = updatedMarked;
        return rest;
    } else {
        updatedMarked[exerciseId] = updatedStatus;
    }
    return updatedMarked;
};

const ExerciseDetails = () => {
    const { id } = useParams<{ id: string }>();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [exercise, setExercise] = useState<Exercise | null>(null);
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


                if (currentUser) {
                    const userProf = await getUserProfile(currentUser.uid);
                    setProfile(userProf);

                    const allEntries = await getJournalEntries(currentUser.uid);
                    const exerciseSessions = allEntries.filter((entry: JournalEntry) =>
                        entry.exerciseIds.includes(id)
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

        void fetchData();
    }, [id, currentUser]);

    useEffect(() => {
        if (profile && id) {
            setNotes(profile.markedExercises[id].notes ?? '');
        }
    }, [id, profile]);

    const handleStatusToggle = async (key: keyof Omit<MarkedStatus, 'skillLevel'>) => {
        if (!currentUser || !id || !profile) return;

        try {
            const currentValue = profile.markedExercises[id][key];
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
                skillLevel: newValue ?? undefined
            });

            setProfile({ ...profile, markedExercises: updatedMarked });
            await updateUserProfile(currentUser.uid, { markedExercises: updatedMarked });
        } catch (err) {
            console.error("Failed to update rating", err);
        }
    };

    const handleSaveNotes = async () => {
        if (!currentUser || !id || !profile) return;
        const currentNotes = profile.markedExercises[id].notes ?? '';
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

    const handleDelete = async () => {
        if (!id || !window.confirm('Are you sure you want to delete this exercise?')) return;

        try {
            await deleteExercise(id);
            await navigate('/exercises');
        } catch (err) {
            console.error("Failed to delete exercise", err);
            setError('Failed to delete exercise');
        }
    };


    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
    if (error || !exercise) return (
        <Container><Typography color="error" sx={{
            mt: 4
        }}>{error || 'Not found'}</Typography></Container>
    );

    const currentStatus = profile?.markedExercises[exercise.id] ?? {};

    return (
        <Container maxWidth="lg">
            <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.paper', borderRadius: 2 }}>
                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Box
                            sx={{
                                mb: 2,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start"
                            }}>
                            <Box>
                                <Button
                                    component={RouterLink}
                                    to="/exercises"
                                    startIcon={<ArrowBack />}
                                    sx={{ mb: 1, color: 'text.secondary' }}
                                >
                                    Back to Overview
                                </Button>
                                <Avatar 
                                    src={exercise.icon_url ? 
                                        `${import.meta.env.BASE_URL}exercises/${exercise.icon_url.replace(/^exercises\//, '').replace(/-icon-128(?=\.\w+$)/, '')}` 
                                        : undefined}
                                    alt={exercise.name}
                                    sx={{ 
                                        width: 100, 
                                        height: 100, 
                                        mb: 2, 
                                    }}
                                >
                                    {exercise.name.charAt(0)}
                                </Avatar>
                                <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
                                    {exercise.name}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                                    <Chip
                                        label={exercise.type}
                                        color="primary"
                                        variant="outlined"
                                        size="small"
                                        sx={{ textTransform: 'capitalize' }}
                                    />
                                    <Chip
                                        label={exercise.bodypart}
                                        color="secondary"
                                        variant="outlined"
                                        size="small"
                                    />
                                    <Chip
                                        label={exercise.category}
                                        color="info"
                                        variant="outlined"
                                        size="small"
                                    />
                                </Box>
                                {exercise.aliases.length > 0 && (
                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                                        {exercise.aliases.map((alias, index) => (
                                            <Typography
                                                key={index}
                                                variant="caption"
                                                sx={{
                                                    color: "text.secondary",
                                                    fontStyle: 'italic'
                                                }}>
                                                {alias}{index < exercise.aliases.length - 1 ? ', ' : ''}
                                            </Typography>
                                        ))}
                                    </Box>
                                )}
                                {exercise.name_url && (
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: "text.secondary",
                                            display: "block"
                                        }}>
                                        URL Name: {exercise.name_url}
                                    </Typography>
                                )}
                            </Box>
                            {currentUser && (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        component={RouterLink}
                                        to={`/exercises/${exercise.id}/edit`}
                                        variant="outlined"
                                        color="primary"
                                        size="small"
                                        startIcon={<EditNote />}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        size="small"
                                        startIcon={<Delete />}
                                        onClick={handleDelete}
                                    >
                                        Delete
                                    </Button>
                                </Box>
                            )}
                        </Box>


                        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>Description</Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                            {exercise.description ?? 'No description available.'}
                        </Typography>

                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Box sx={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Paper variant="outlined" sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>My Progress</Typography>
                                <Divider sx={{ mb: 3 }} />

                                {!currentUser ? (
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: "text.secondary",
                                                mb: 2
                                            }}>
                                            Log in to mark this exercise and track your progress.
                                        </Typography>
                                        <Button variant="outlined" fullWidth component={RouterLink} to="/login">
                                            Log In
                                        </Button>
                                    </Box>
                                ) : (
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 2
                                        }}>
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

                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                mt: 2,
                                                mb: 1
                                            }}>
                                            <Typography variant="subtitle2">My Skill Level</Typography>
                                            <Rating
                                                name="exercise-skill-level"
                                                value={currentStatus.skillLevel ?? 0}
                                                onChange={handleRatingChange}
                                                size="medium"
                                            />
                                        </Box>
                                    </Box>
                                )}
                            </Paper>

                            {currentUser && (
                                <Paper variant="outlined" sx={{ p: 3 }}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            mb: 1
                                        }}>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1
                                            }}>
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
                                        onChange={(e) => { setNotes(e.target.value); }}
                                        onBlur={handleSaveNotes}
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                bgcolor: 'background.default',
                                            }
                                        }}
                                    />
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: "text.secondary",
                                            mt: 1,
                                            display: 'block'
                                        }}>
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
                                                            {session.sessionType ?? 'Training Session'}
                                                            {session.length ? ` • ${String(session.length)} min` : ''}
                                                        </>
                                                    }
                                                    slotProps={{
                                                        secondary: { variant: 'caption', sx: { display: 'block' } }
                                                    }}
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
