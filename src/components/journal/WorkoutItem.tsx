import { useState, memo, forwardRef } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useNavigate } from 'react-router-dom';
import type { Workout, Exercise } from '../../types';

interface WorkoutItemProps {
    entry: Workout;
    exerciseMap: Record<string, Exercise | undefined>;
    onEdit: (entry: Workout) => void;
    onDelete: (id: string) => void;
}

const WorkoutItem = memo(forwardRef<HTMLDivElement, WorkoutItemProps>(({ 
    entry, 
    exerciseMap, 
    onEdit, 
    onDelete 
}, ref) => {
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);

    const getExerciseName = (id: string) => {
        return exerciseMap[id]?.name ?? 'Unknown Exercise';
    };

    return (
        <Paper
            ref={ref}
            variant="outlined"
            sx={{ mb: 2, p: { xs: 1.5, md: 3 } }}
        >
            <Stack 
                direction="row"
                sx={{
                    justifyContent: "space-between", 
                    mb: 1,
                    cursor: 'pointer',
                    '&:hover': {
                        opacity: 0.85
                    }
                }}
                onClick={() => { void navigate(`/journal/${entry.id}`); }}
            >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Typography variant="h6">
                        {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        {entry.time && ` • ${entry.time}`}
                    </Typography>
                    {entry.sessionType && (
                        <Chip size="small" label={entry.sessionType} color="primary" variant="outlined" sx={{ textTransform: 'capitalize' }} />
                    )}
                </Stack>
                <Stack
                    direction="row"
                    spacing={0}
                    onClick={(e) => { e.stopPropagation(); }}
                >
                    <IconButton size="small" onClick={() => { onEdit(entry); }} color="primary">
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => { onDelete(entry.id); }} color="error">
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => { setExpanded(!expanded); }} sx={{ ml: 1 }}>
                        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                </Stack>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mb: 2 }}>
                {entry.length && (
                    <Chip size="small" label={`${String(entry.length)} min`} variant="outlined" />
                )}
                {entry.maxPulse && (
                    <Chip size="small" label={`Max Pulse: ${String(entry.maxPulse)}`} variant="outlined" color="secondary" />
                )}
                {entry.exerciseIds.map((id: string) => {
                    const exercise = exerciseMap[id];
                    return (
                        <Chip 
                            key={id} 
                            label={getExerciseName(id)} 
                            size="small" 
                            variant="outlined"
                            avatar={
                                <Avatar
                                    src={exercise?.icon_url ?
                                        `${import.meta.env.BASE_URL}exercises/${exercise.icon_url}`
                                        : undefined}
                                >
                                    {(exercise?.name ?? 'U').charAt(0)}
                                </Avatar>
                            }
                        />
                    );
                })}
            </Stack>

            <Collapse in={expanded}>
                {entry.exercises && entry.exercises.length > 0 && (
                    <Box sx={{ mb: 2, mt: 1 }}>
                        {entry.exercises.map((se) => {
                            const exercise = exerciseMap[se.exerciseId];
                            return (
                                <Box key={se.exerciseId} sx={{ mb: 1, p: 1, bgcolor: 'grey.50' }}>
                                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                                        <Avatar
                                            src={exercise?.icon_url ?
                                                `${import.meta.env.BASE_URL}exercises/${exercise.icon_url}`
                                                : undefined}
                                            alt={exercise?.name ?? 'Unknown Exercise'}
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                fontSize: '0.875rem'
                                            }}
                                        >
                                            {(exercise?.name ?? 'U').charAt(0)}
                                        </Avatar>
                                        <Typography variant="subtitle2" color="primary" sx={{ fontWeight: "bold" }}>
                                            {exercise?.name ?? 'Unknown Exercise'}
                                        </Typography>
                                    </Stack>
                                    <Stack spacing={1} sx={{ flexWrap: "wrap", mt: 0.5 }}>
                                        {se.sets.map((set, idx) => (
                                            <Typography key={set.id} variant="body2" sx={{ bgcolor: 'white', px: 1, py: 0.5, border: '1px solid', borderColor: 'grey.300' }}>
                                                Set {idx + 1}: {set.weight}kg x {set.reps} {set.notes && `(${set.notes})`}
                                            </Typography>
                                        ))}
                                    </Stack>
                                </Box>
                            );
                        })}
                    </Box>
                )}
                {entry.comment && (
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mt: 1 }}>
                        {entry.comment}
                    </Typography>
                )}
            </Collapse>
        </Paper>
    );
}));

WorkoutItem.displayName = 'WorkoutItem';

export default WorkoutItem;
