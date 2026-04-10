import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';

import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

import type { SessionExercise, Exercise, ExerciseSet } from '../../types';

interface SessionExerciseItemProps {
    sessionExercise: SessionExercise;
    exercise: Exercise | undefined;
    onRemoveExercise: (exerciseId: string) => void;
    onAddSet: (exerciseId: string) => void;
    onUpdateSet: (exerciseId: string, setId: string, updates: Partial<ExerciseSet>) => void;
    onRemoveSet: (exerciseId: string, setId: string) => void;
}

const SessionExerciseItem = ({
    sessionExercise,
    exercise,
    onRemoveExercise,
    onAddSet,
    onUpdateSet,
    onRemoveSet
}: SessionExerciseItemProps) => {
    return (
        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    {exercise?.name ?? 'Unknown Exercise'}
                </Typography>
                <IconButton size="small" onClick={() => { onRemoveExercise(sessionExercise.exerciseId); }} color="error">
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>
            
            <Box sx={{ pl: { xs: 0, sm: 1 } }}>
                {sessionExercise.sets.map((set, index) => (
                    <Grid container spacing={2} key={set.id} sx={{ alignItems: "center", mb: 2 }}>
                        <Grid size={{ xs: 1 }}>
                            <Typography variant="body2" color="text.secondary">{index + 1}</Typography>
                        </Grid>
                        <Grid size={{ xs: 11, sm: 3 }}>
                            <TextField
                                label="Weight (kg)"
                                type="number"
                                size="small"
                                fullWidth
                                value={set.weight}
                                onChange={(e) => { onUpdateSet(sessionExercise.exerciseId, set.id, { weight: Number(e.target.value) }); }}
                            />
                        </Grid>
                        <Grid size={{ xs: 11, sm: 3 }}>
                            <TextField
                                label="Reps"
                                type="number"
                                size="small"
                                fullWidth
                                value={set.reps}
                                onChange={(e) => { onUpdateSet(sessionExercise.exerciseId, set.id, { reps: Number(e.target.value) }); }}
                            />
                        </Grid>
                        <Grid size={{ xs: 11, sm: 4 }}>
                            <TextField
                                label="Notes"
                                size="small"
                                fullWidth
                                value={set.notes ?? ''}
                                onChange={(e) => { onUpdateSet(sessionExercise.exerciseId, set.id, { notes: e.target.value }); }}
                            />
                        </Grid>
                        <Grid size={{ xs: 1 }}>
                            <IconButton size="small" onClick={() => { onRemoveSet(sessionExercise.exerciseId, set.id); }}>
                                <DeleteIcon fontSize="inherit" />
                            </IconButton>
                        </Grid>
                    </Grid>
                ))}
                <Button 
                    startIcon={<AddIcon />} 
                    size="small" 
                    onClick={() => { onAddSet(sessionExercise.exerciseId); }}
                >
                    Add Set
                </Button>
            </Box>
        </Paper>
    );
};

export default SessionExerciseItem;
