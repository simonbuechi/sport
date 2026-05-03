import { memo, forwardRef } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import type { Workout, Exercise, BodyPart } from '../../types';
import { formatWeight, formatCount } from '../../utils/format';
import { useMemo } from 'react';


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

    const exerciseNames = useMemo(() => {
        return entry.exercises
            .map(ex => exerciseMap[ex.exerciseId]?.name)
            .filter(Boolean)
            .join(' • ');
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
                    <Typography variant="body1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                        {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        {entry.time && ` • ${entry.time}`}
                        {` • ${bodyPartsSummary}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' }, mt: 0.5 }}>
                        {exerciseNames}
                    </Typography>
                </Box>
                <Stack
                    direction="row"
                    spacing={{ xs: 0.5, sm: 1 }}
                    sx={{ alignItems: 'center', flexShrink: 0 }}
                >
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(entry); }} color="primary" aria-label="edit workout">
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }} color="error" aria-label="delete workout">
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Stack>
            </Stack>

            {entry.exercises.length > 0 && (
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mt: 1 }}>
                    <Chip size="small" label={`${String(stats.numEx)} exercises`} variant="outlined" color="primary" />
                    <Chip size="small" label={`${formatCount(stats.totalSets)} sets`} variant="outlined" color="primary" />
                    <Chip size="small" label={`${formatCount(stats.totalReps)} reps`} variant="outlined" color="primary" />
                    <Chip size="small" label={`${formatWeight(stats.totalVolume)} kg`} variant="outlined" color="primary" />
                </Stack>
            )}
        </Paper>
    );
}));

WorkoutItem.displayName = 'WorkoutItem';

export default WorkoutItem;
