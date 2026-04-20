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
import { calculate1RM } from '../../utils/fitness';
import { formatWeight, formatCount } from '../../utils/format';

interface ExerciseHistoryCardProps {
    workouts: Workout[];
    exerciseId: string;
}

const ExerciseHistoryCard = ({ workouts, exerciseId }: ExerciseHistoryCardProps) => {
    const navigate = useNavigate();
    if (workouts.length === 0) return null;

    const recentWorkouts = workouts.slice(0, 3);

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
                                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                                    {new Date(workout.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                </Typography>
                            </Stack>

                            <Box sx={{ ml: 3.5 }}>
                                {exerciseData && (
                                    <Typography variant="body2">
                                        {(() => {
                                            const totalReps = exerciseData.sets.reduce((sum, s) => sum + (s.reps || 0), 0);
                                            const totalVolume = exerciseData.sets.reduce((sum, s) => sum + ((s.weight || 0) * (s.reps || 0)), 0);
                                            const max1RM = exerciseData.sets.reduce((max, s) => {
                                                const current1RM = calculate1RM(s.weight || 0, s.reps || 0);
                                                return current1RM > max ? current1RM : max;
                                            }, 0);

                                            return `1RM: ${formatWeight(Math.round(max1RM))}kg, Reps: ${formatCount(totalReps)}, Volume: ${formatWeight(totalVolume)}kg`;
                                        })()}
                                    </Typography>
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
