import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import OpenInNew from '@mui/icons-material/OpenInNew';
import LinkIcon from '@mui/icons-material/Link';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { deleteExercise } from '../services/db';

import { useAuth } from '../context/AuthContext';
import { useExercises } from '../context/ExercisesContext';
import { useWorkouts } from '../context/WorkoutsContext';
import { useUserProfile } from '../hooks/useUserProfile';
import ExerciseHeader from '../components/exercises/ExerciseHeader';
import ExerciseHistoryCard from '../components/exercises/ExerciseHistoryCard';
import ExerciseProgressChart from '../components/exercises/ExerciseProgressChart';
import { sanitizeUrl } from '../utils/security';
import { updateExerciseStatus } from '../utils/exerciseUtils';
import ExerciseNotes from '../components/exercises/ExerciseNotes';



const ExerciseDetails = () => {
    const { id } = useParams<{ id: string }>();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const { exercises, loading: exercisesLoading } = useExercises();
    const { profile, updateProfile, loading: profileLoading } = useUserProfile();
    const { entries: allEntries, loading: workoutsLoading } = useWorkouts();
    const [error, setError] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const exercise = useMemo(() => {
        if (!id || exercisesLoading) return null;
        return exercises.find(e => e.id === id) ?? null;
    }, [id, exercises, exercisesLoading]);

    const workouts = useMemo(() => {
        if (!id || workoutsLoading) return [];
        return allEntries.filter(entry => entry.exerciseIds.includes(id));
    }, [id, allEntries, workoutsLoading]);

    const loading = exercisesLoading || profileLoading || workoutsLoading;



    const handleFavoriteToggle = async () => {
        if (!currentUser || !id || !profile) return;

        try {
            const currentValue = profile.markedExercises?.[id]?.favorite ?? false;
            const updatedMarked = updateExerciseStatus(profile, id, { favorite: !currentValue });

            await updateProfile({ markedExercises: updatedMarked });
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };




    const handleDelete = () => {
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!id) return;

        try {
            await deleteExercise(id);
            void navigate('/exercises');
        } catch (err) {
            console.error("Failed to delete exercise", err);
            setError('Failed to delete exercise');
        } finally {
            setDeleteDialogOpen(false);
        }
    };


    if (loading) return <Stack sx={{ mt: 8 }}><CircularProgress /></Stack>;
    if (error || !exercise) return (
        <Container><Typography color="error" sx={{
            mt: 4
        }}>{error || 'Not found'}</Typography></Container>
    );

    const currentStatus = profile?.markedExercises?.[exercise.id] ?? {};

    return (
        <Container maxWidth="lg">
            <Paper elevation={0} sx={{ p: { xs: 1.5, md: 3 }, bgcolor: 'background.paper', }}>
                <Grid container spacing={{ xs: 2, md: 3 }}>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <ExerciseHeader 
                            exercise={exercise} 
                            onDelete={handleDelete}
                            isFavorite={currentStatus.favorite ?? false}
                            onToggleFavorite={handleFavoriteToggle}
                        />


                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                            {exercise.description ?? 'No description available.'}
                        </Typography>
                        {exercise.aliases.length > 0 && (
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8, mt: 1 }}>
                                Also known as: {exercise.aliases.join(', ')}
                            </Typography>
                        )}

                        <Box sx={{ mt: { xs: 3, md: 4 } }}>
                            <ExerciseProgressChart workouts={workouts} exerciseId={exercise.id} />
                        </Box>

                        {exercise.links && exercise.links.length > 0 && (
                            <Box sx={{ mt: { xs: 2, md: 3 } }}>
                                <Typography variant="h5" gutterBottom>Links & Resources</Typography>
                                <List sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                                    {exercise.links.map((link, index) => (
                                        <Box key={index}>
                                            <ListItem 
                                                component="a" 
                                                href={sanitizeUrl(link.url)} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                sx={{ 
                                                    textDecoration: 'none', 
                                                    color: 'inherit',
                                                    '&:hover': { bgcolor: 'action.hover' }
                                                }}
                                            >
                                                <ListItemIcon>
                                                    <LinkIcon color="primary" />
                                                </ListItemIcon>
                                                <ListItemText 
                                                    primary={link.label ?? 'Web Link'} 
                                                    secondary={link.url}
                                                    slotProps={{ secondary: { noWrap: true, sx: { maxWidth: '100%' } } }}
                                                />
                                                <OpenInNew fontSize="small" color="action" />
                                            </ListItem>
                                            {index < (exercise.links?.length ?? 0) - 1 && <Divider component="li" />}
                                        </Box>
                                    ))}
                                </List>
                            </Box>
                        )}

                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Stack direction="column" spacing={3} sx={{ position: "sticky", top: 24 }}>

                                <ExerciseNotes exerciseId={exercise.id} />

                            <ExerciseHistoryCard workouts={workouts} exerciseId={exercise.id} />
                        </Stack>
                    </Grid>
                </Grid>
            </Paper>

            <Dialog open={deleteDialogOpen} onClose={() => { setDeleteDialogOpen(false); }}>
                <DialogTitle>Delete Exercise</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete <strong>{exercise.name}</strong>? This action cannot be undone and will remove it from all templates and workouts.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setDeleteDialogOpen(false); }}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container >
    );
};

export default ExerciseDetails;
