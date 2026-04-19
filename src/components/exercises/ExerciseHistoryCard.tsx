import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import EventNote from '@mui/icons-material/EventNote';
import type { Workout } from '../../types';

interface ExerciseHistoryCardProps {
    workouts: Workout[];
    exerciseId: string;
}

const ExerciseHistoryCard = ({ workouts, exerciseId }: ExerciseHistoryCardProps) => {
    const navigate = useNavigate();
    if (workouts.length === 0) return null;

    const recentWorkouts = workouts.slice(0, 5);

    return (
        <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 3 } }}>
            <Typography variant="h6" gutterBottom>Training History</Typography>
            <Divider sx={{ mb: 2 }} />
            <List disablePadding>
                {recentWorkouts.map(workout => {
                    const exerciseData = workout.exercises?.find(ex => ex.exerciseId === exerciseId);

                    return (
                        <ListItem
                            key={workout.id}
                            disablePadding
                            sx={{
                                mb: 2,
                                flexDirection: 'column',
                                alignItems: 'stretch',
                                cursor: 'pointer',
                                '&:hover': { bgcolor: 'action.hover' },
                                p: 1,
                                borderRadius: 1
                            }}
                            onClick={() => { void navigate(`/journal/${workout.id}`); }}
                        >
                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                                <EventNote fontSize="small" color="primary" />
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
                                    {new Date(workout.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                </Typography>
                            </Stack>

                            <Box sx={{ ml: 3.5 }}>
                                {exerciseData && (
                                    <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                                        {exerciseData.sets.map((set, idx) => (
                                            <Typography key={set.id} variant="caption" sx={{ display: 'block' }}>
                                                Set {idx + 1}: {set.weight}kg x {set.reps}
                                                {set.notes && <Typography component="span" variant="caption" sx={{ fontStyle: 'italic', ml: 1, color: 'text.secondary' }}>- {set.notes}</Typography>}
                                            </Typography>
                                        ))}
                                    </Stack>
                                )}
                            </Box>
                        </ListItem>
                    );
                })}
            </List>
            <Button
                component={RouterLink}
                to={`/exercises/${exerciseId}/history`}
                variant="outlined"
                fullWidth
                size="small"
                sx={{ mt: 1 }}
            >
                Full History
            </Button>
        </Paper>
    );
};

export default ExerciseHistoryCard;
