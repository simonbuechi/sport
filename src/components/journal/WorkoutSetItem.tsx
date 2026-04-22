import { useState, useEffect, memo } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import CommentIcon from '@mui/icons-material/Comment';
import CommentOutlinedIcon from '@mui/icons-material/ModeCommentOutlined';
import type { ExerciseSet } from '../../types';

interface WorkoutSetItemProps {
    exerciseId: string;
    set: ExerciseSet;
    index: number;
    onUpdateSet: (exerciseId: string, setId: string, updates: Partial<ExerciseSet>) => void;
    onRemoveSet: (exerciseId: string, setId: string) => void;
    onEditNotes: (setId: string) => void;
    previousSet?: ExerciseSet;
}

const WorkoutSetItem = ({
    exerciseId,
    set,
    index,
    onUpdateSet,
    onRemoveSet,
    onEditNotes,
    previousSet
}: WorkoutSetItemProps) => {
    // Local state for instant feedback while typing
    const [localWeight, setLocalWeight] = useState<string>(set.weight?.toString() ?? '');
    const [localReps, setLocalReps] = useState<string>(set.reps?.toString() ?? '');

    // Sync local state to parent state with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            const weightNum = localWeight === '' ? undefined : Number(localWeight);
            const repsNum = localReps === '' ? undefined : Number(localReps);
            
            // Only update parent if values actually changed to avoid unnecessary re-renders
            if (weightNum !== set.weight || repsNum !== set.reps) {
                onUpdateSet(exerciseId, set.id, { 
                    weight: weightNum, 
                    reps: repsNum 
                });
            }
        }, 500);
        return () => { clearTimeout(timer); };
    }, [localWeight, localReps, exerciseId, set.id, set.weight, set.reps, onUpdateSet]);

    const [prevSet, setPrevSet] = useState({ weight: set.weight, reps: set.reps });

    if (set.weight !== prevSet.weight || set.reps !== prevSet.reps) {
        setPrevSet({ weight: set.weight, reps: set.reps });
        setLocalWeight(set.weight?.toString() ?? '');
        setLocalReps(set.reps?.toString() ?? '');
    }

    return (
        <Box>
            <Grid container spacing={1} sx={{ alignItems: "center", mb: 1.5, flexWrap: "nowrap" }}>
                <Grid size="auto" sx={{ minWidth: { xs: 20, sm: 24 } }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>{index + 1}</Typography>
                </Grid>
                <Grid size={4}>
                    <TextField
                        variant="standard"
                        label={index === 0 ? "Weight" : ""}
                        placeholder="kg"
                        type="number"
                        size="small"
                        fullWidth
                        value={localWeight}
                        onChange={(e) => { setLocalWeight(e.target.value); }}
                        sx={{ 
                            '& .MuiInputLabel-root': { display: index === 0 ? 'block' : 'none' },
                            '& .MuiInputBase-input': { px: { xs: 1, sm: 1.5 } }
                        }}
                    />
                </Grid>
                <Grid size={4}>
                    <TextField
                        variant="standard"
                        label={index === 0 ? "Reps" : ""}
                        placeholder="reps"
                        type="number"
                        size="small"
                        fullWidth
                        value={localReps}
                        onChange={(e) => { setLocalReps(e.target.value); }}
                        sx={{ 
                            '& .MuiInputLabel-root': { display: index === 0 ? 'block' : 'none' },
                            '& .MuiInputBase-input': { px: { xs: 1, sm: 1.5 } }
                        }}
                    />
                </Grid>
                <Grid size="auto" sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Add Notes" arrow>
                        <IconButton 
                            size="small" 
                            onClick={() => { onEditNotes(set.id); }}
                            color={set.notes ? "primary" : "default"}
                            sx={{ p: { xs: 0.5, sm: 1 } }}
                        >
                            {set.notes ? <CommentIcon fontSize="small" /> : <CommentOutlinedIcon fontSize="small" />}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Remove Set" arrow>
                        <IconButton 
                            size="small" 
                            onClick={() => { onRemoveSet(exerciseId, set.id); }} 
                            color="error"
                            sx={{ p: { xs: 0.5, sm: 1 } }}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Grid>
            </Grid>
            {previousSet && (previousSet.weight !== undefined || previousSet.reps !== undefined) && (
                <Box sx={{ ml: 4, mt: -1.5, mb: 1, display: 'flex', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        Last: {previousSet.weight !== undefined ? `${String(previousSet.weight)}kg` : ''} 
                        {previousSet.weight !== undefined && previousSet.reps !== undefined ? ' × ' : ''}
                        {previousSet.reps !== undefined ? `${String(previousSet.reps)} reps` : ''}
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default memo(WorkoutSetItem);
