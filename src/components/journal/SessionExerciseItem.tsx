import { useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import CommentIcon from '@mui/icons-material/Comment';
import CommentOutlinedIcon from '@mui/icons-material/ModeCommentOutlined';

import type { SessionExercise, Exercise, ExerciseSet } from '../../types';

interface SessionExerciseItemProps {
    sessionExercise: SessionExercise;
    exercise: Exercise | undefined;
    onRemoveExercise: (exerciseId: string) => void;
    onAddSet: (exerciseId: string) => void;
    onUpdateSet: (exerciseId: string, setId: string, updates: Partial<ExerciseSet>) => void;
    onRemoveSet: (exerciseId: string, setId: string) => void;
    onUpdateExerciseNote: (exerciseId: string, note: string) => void;
}

const SessionExerciseItem = ({
    sessionExercise,
    exercise,
    onRemoveExercise,
    onAddSet,
    onUpdateSet,
    onRemoveSet,
    onUpdateExerciseNote
}: SessionExerciseItemProps) => {
    const [noteEditingSetId, setNoteEditingSetId] = useState<string | null>(null);
    const [isEditingExerciseNote, setIsEditingExerciseNote] = useState(false);

    const editingSet = sessionExercise.sets.find(s => s.id === noteEditingSetId);

    return (
        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: sessionExercise.note ? 0.5 : 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                        {exercise?.name ?? 'Unknown Exercise'}
                    </Typography>
                    <IconButton 
                        size="small" 
                        onClick={() => { setIsEditingExerciseNote(true); }} 
                        color={sessionExercise.note ? "primary" : "default"}
                        sx={{ ml: 0.5 }}
                    >
                        <CommentIcon fontSize="small" />
                    </IconButton>
                </Box>
                <IconButton size="small" onClick={() => { onRemoveExercise(sessionExercise.exerciseId); }} color="error">
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>
            
            {sessionExercise.note && (
                <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ mb: 2, pl: 0.5, fontStyle: 'italic', cursor: 'pointer' }}
                    onClick={() => { setIsEditingExerciseNote(true); }}
                >
                    {sessionExercise.note}
                </Typography>
            )}
            
            <Box sx={{ pl: { xs: 0, sm: 1 } }}>
                {sessionExercise.sets.map((set, index) => (
                    <Grid container spacing={1} key={set.id} sx={{ alignItems: "center", mb: 2, flexWrap: "nowrap" }}>
                        <Grid size="auto" sx={{ minWidth: 24 }}>
                            <Typography variant="body2" color="text.secondary">{index + 1}</Typography>
                        </Grid>
                        <Grid size={4}>
                            <TextField
                                label={index === 0 ? "Weight" : ""}
                                placeholder="kg"
                                type="number"
                                size="small"
                                fullWidth
                                value={set.weight ?? ''}
                                onChange={(e) => { onUpdateSet(sessionExercise.exerciseId, set.id, { weight: Number(e.target.value) }); }}
                                sx={{ '& .MuiInputLabel-root': { display: index === 0 ? 'block' : 'none' } }}
                            />
                        </Grid>
                        <Grid size={4}>
                            <TextField
                                label={index === 0 ? "Reps" : ""}
                                placeholder="reps"
                                type="number"
                                size="small"
                                fullWidth
                                value={set.reps ?? ''}
                                onChange={(e) => { onUpdateSet(sessionExercise.exerciseId, set.id, { reps: Number(e.target.value) }); }}
                                sx={{ '& .MuiInputLabel-root': { display: index === 0 ? 'block' : 'none' } }}
                            />
                        </Grid>
                        <Grid size="auto">
                            <IconButton 
                                size="small" 
                                onClick={() => { setNoteEditingSetId(set.id); }}
                                color={set.notes ? "primary" : "default"}
                            >
                                {set.notes ? <CommentIcon fontSize="small" /> : <CommentOutlinedIcon fontSize="small" />}
                            </IconButton>
                        </Grid>
                        <Grid size="auto">
                            <IconButton size="small" onClick={() => { onRemoveSet(sessionExercise.exerciseId, set.id); }} color="error">
                                <DeleteIcon fontSize="small" />
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

            {/* Note Modal */}
            <Dialog 
                open={Boolean(noteEditingSetId)} 
                onClose={() => { setNoteEditingSetId(null); }}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Set {sessionExercise.sets.findIndex(s => s.id === noteEditingSetId) + 1} Notes</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Add notes for this set..."
                        value={editingSet?.notes ?? ''}
                        onChange={(e) => { 
                            if (noteEditingSetId) {
                                onUpdateSet(sessionExercise.exerciseId, noteEditingSetId, { notes: e.target.value });
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setNoteEditingSetId(null); }} variant="contained">Done</Button>
                </DialogActions>
            </Dialog>

            {/* Exercise Note Modal */}
            <Dialog 
                open={isEditingExerciseNote} 
                onClose={() => { setIsEditingExerciseNote(false); }}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>{exercise?.name ?? 'Exercise'} Notes</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="General notes for this exercise..."
                        value={sessionExercise.note ?? ''}
                        onChange={(e) => { onUpdateExerciseNote(sessionExercise.exerciseId, e.target.value); }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setIsEditingExerciseNote(false); }} variant="contained">Done</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default SessionExerciseItem;
