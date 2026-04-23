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
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import type { Workout, Exercise, BodyPart } from '../../types';
import { formatWeight, formatCount } from '../../utils/format';
import { useMemo } from 'react';
import type { WorkoutExercise } from '../../types';

const getExerciseSummary = (se: WorkoutExercise) => {
    const sets = se.sets.length;
    const reps = se.sets.reduce((sum, s) => sum + (s.reps ?? 0), 0);
    const volume = se.sets.reduce((sum, s) => sum + ((s.weight ?? 0) * (s.reps ?? 0)), 0);
    return `${String(sets)} sets, ${String(reps)} reps, ${String(volume)} kg`;
};

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

    const stats = useMemo(() => {
        const numEx = entry.exercises.length;
        const totalSets = entry.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
        const totalReps = entry.exercises.reduce((sum, ex) => sum + ex.sets.reduce((sSum, s) => sSum + (s.reps ?? 0), 0), 0);
        const totalVolume = entry.exercises.reduce((sum, ex) => sum + ex.sets.reduce((sSum, s) => sSum + ((s.weight ?? 0) * (s.reps ?? 0)), 0), 0);
        
        return { numEx, totalSets, totalReps, totalVolume };
    }, [entry.exercises]);

    const bodyPartsSummary = useMemo(() => {
        const bodyParts = entry.exercises.map(ex => exerciseMap[ex.exerciseId]?.bodypart).filter((p): p is BodyPart => !!p);
        const uniqueParts = Array.from(new Set(bodyParts));
        const filteredParts = uniqueParts.length > 1 ? uniqueParts.filter(p => p !== 'Whole Body') : uniqueParts;
        return filteredParts.length > 0 ? filteredParts.join(', ') : 'Workout';
    }, [entry.exercises, exerciseMap]);


    return (
        <Paper
            ref={ref}
            variant="outlined"
            sx={{ mb: { xs: 1.5, md: 2 }, p: { xs: 1, md: 3 } }}
        >
            <Stack
                direction="row"
                sx={{
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 1,
                    gap: 1
                }}
            >
                <Box 
                    sx={{ 
                        flexGrow: 1, 
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.85 }
                    }}
                    onClick={() => { void navigate(`/journal/${entry.id}`); }}
                >
                    <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, lineHeight: 1.2 }}>
                        {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        {entry.time && ` • ${entry.time}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        {bodyPartsSummary}
                    </Typography>
                </Box>
                <Stack
                    direction="row"
                    spacing={{ xs: 0.5, sm: 1 }}
                    sx={{ alignItems: 'center', flexShrink: 0 }}
                >
                    <IconButton size="small" onClick={() => { onEdit(entry); }} color="primary" aria-label="edit workout">
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => { onDelete(entry.id); }} color="error" aria-label="delete workout">
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                        size="small" 
                        onClick={() => { setExpanded(!expanded); }} 
                        sx={{ ml: { xs: 0, sm: 0.5 } }}
                        aria-label={expanded ? "show less" : "show more"}
                    >
                        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                </Stack>
            </Stack>

            {!expanded && entry.exercises.length > 0 && (
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mb: 2 }}>
                    <Chip size="small" label={`${String(stats.numEx)} exercises`} variant="outlined" color="primary" />
                    <Chip size="small" label={`${formatCount(stats.totalSets)} sets`} variant="outlined" color="primary" />
                    <Chip size="small" label={`${formatCount(stats.totalReps)} reps`} variant="outlined" color="primary" />
                    <Chip size="small" label={`${formatWeight(stats.totalVolume)} kg`} variant="outlined" color="primary" sx={{ fontWeight: 'bold' }} />
                </Stack>
            )}

            {expanded && (
                <Box sx={{ mb: 2, mt: -0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                        {[
                            entry.sessionType ? entry.sessionType.charAt(0).toUpperCase() + entry.sessionType.slice(1) : null,
                            entry.length ? `${String(entry.length)} min` : null,
                            entry.maxPulse ? `Max Pulse: ${String(entry.maxPulse)}` : null
                        ].filter(Boolean).join(' • ')}
                    </Typography>
                    {entry.comment && (
                        <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-line' }}>
                            {entry.comment}
                        </Typography>
                    )}
                </Box>
            )}

            <Collapse in={expanded}>
                {entry.exercises.length > 0 && (
                    <Box sx={{ mb: 1, mt: 1 }}>
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
                                                fontSize: '0.875rem',
                                                cursor: exercise ? 'pointer' : 'default',
                                                '&:hover': { opacity: 0.8 }
                                            }}
                                            component={exercise ? RouterLink : 'div'}
                                            to={exercise ? `/exercises/${exercise.id}` : undefined}
                                        >
                                            {(exercise?.name ?? 'U').charAt(0)}
                                        </Avatar>
                                        <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline', flexWrap: 'wrap', flexGrow: 1 }}>
                                            <Typography
                                                variant="subtitle2"
                                                color="primary"
                                                sx={{
                                                    fontWeight: "bold",
                                                    textDecoration: 'none',
                                                    '&:hover': { textDecoration: exercise ? 'underline' : 'none' },
                                                    cursor: exercise ? 'pointer' : 'default',
                                                    fontSize: { xs: '0.85rem', sm: '0.875rem' }
                                                }}
                                                component={exercise ? RouterLink : 'div'}
                                                to={exercise ? `/exercises/${exercise.id}` : undefined}
                                            >
                                                {exercise?.name ?? 'Unknown Exercise'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                                {getExerciseSummary(se)}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mt: 1 }}>
                                        {se.sets.map((set, idx) => (
                                            <Chip
                                                key={set.id}
                                                size="small"
                                                variant="outlined"
                                                color="primary"
                                                label={`S${String(idx + 1)}: ${String(set.weight)}kg × ${String(set.reps)}${set.notes ? ` (${set.notes})` : ''}`}
                                            />
                                        ))}
                                    </Stack>
                                </Box>
                            );
                        })}
                    </Box>
                )}
            </Collapse>
        </Paper>
    );
}));

WorkoutItem.displayName = 'WorkoutItem';

export default WorkoutItem;
