import { memo, forwardRef, useMemo } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import LinkIcon from '@mui/icons-material/Link';
import { useNavigate } from 'react-router-dom';
import { formatWeight, parseLocalDate } from '../../utils/format';
import { summarizeExerciseSets } from '../../utils/fitness';
import { groupExercisesIntoBlocks, type SupersetGroup } from '../../utils/supersetUtils';
import { useTranslation } from 'react-i18next';
import type { Workout, Exercise, WorkoutExercise } from '../../types';

interface WorkoutItemProps {
    entry: Workout;
    exerciseMap: Record<string, Exercise | undefined>;
    templateName?: string;
    onEdit: (entry: Workout) => void;
    onDelete: (id: string) => void;
}

const WorkoutItem = memo(forwardRef<HTMLDivElement, WorkoutItemProps>(({
    entry,
    exerciseMap,
    templateName,
    onEdit,
    onDelete
}, ref) => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const stats = useMemo(() => {
        const numEx = entry.exercises.length;
        let totalSets = 0;
        let totalReps = 0;
        let totalVolume = 0;

        for (const ex of entry.exercises) {
            totalSets += ex.sets.length;
            const summary = summarizeExerciseSets(ex.sets);
            totalReps += summary.totalReps;
            totalVolume += summary.totalVolume;
        }

        return { numEx, totalSets, totalReps, totalVolume };
    }, [entry.exercises]);

    const bodyPartsSummary = useMemo(() => {
        const bodyParts = entry.exercises.map(ex => {
            const bp = exerciseMap[ex.exerciseId]?.bodypart;
            return bp ? t(`bodyParts.${bp}`, { defaultValue: bp }) : null;
        }).filter((p): p is string => Boolean(p));
        const uniqueParts = Array.from(new Set(bodyParts));
        const wholeBodyLabel = t('bodyParts.Whole Body', { defaultValue: 'Whole Body' });
        const filteredParts = uniqueParts.length > 1 ? uniqueParts.filter(p => p !== wholeBodyLabel) : uniqueParts;
        return filteredParts.length > 0 ? filteredParts.join(', ') : t('journal.workout');
    }, [entry.exercises, exerciseMap, t]);

    const exerciseBlocks = useMemo<SupersetGroup<WorkoutExercise>[]>(
        () => groupExercisesIntoBlocks<WorkoutExercise>(entry.exercises),
        [entry.exercises]
    );

    const numSupersets = useMemo(() => {
        return exerciseBlocks.filter(b => b.isSuperset).length;
    }, [exerciseBlocks]);

    const exerciseNames = useMemo(() => {
        return exerciseBlocks
            .map((b: SupersetGroup<WorkoutExercise>) => {
                if (b.isSuperset) {
                    const names = b.items
                        .map(item => exerciseMap[item.item.exerciseId]?.name)
                        .filter(Boolean)
                        .join(' + ');
                    return `[${b.label ?? 'Superset'}: ${names}]`;
                }
                return exerciseMap[b.items[0].item.exerciseId]?.name;
            })
            .filter(Boolean)
            .join(' • ');
    }, [exerciseBlocks, exerciseMap]);

    return (
        <Paper
            ref={ref}
            variant="outlined"
            sx={{ mb: { xs: 1.5, md: 2 }, p: { xs: 1, md: 3 } }}
        >
            <Stack
                direction="row"
                sx={{
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
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
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 0.25 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500, lineHeight: 1.3 }}>
                            {parseLocalDate(entry.date).toLocaleDateString(i18n.language, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                            {entry.time && ` • ${entry.time}`}
                            {` • ${bodyPartsSummary}`}
                        </Typography>
                        {templateName && (
                            <Chip
                                size="small"
                                icon={<DescriptionIcon sx={{ fontSize: '13px !important' }} />}
                                label={templateName}
                                variant="outlined"
                                color="primary"
                                sx={{ height: 20, fontSize: '0.72rem', '& .MuiChip-label': { px: 0.75 } }}
                            />
                        )}
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' }, mt: 0.5 }}>
                        {exerciseNames}
                    </Typography>
                </Box>
                <Stack
                    direction="row"
                    spacing={{ xs: 0.5, sm: 1 }}
                    sx={{ alignItems: 'center', flexShrink: 0 }}
                >
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(entry); }} color="primary" aria-label={t('journal.editWorkout')}>
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }} color="error" aria-label={t('journal.deleteWorkout')}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Stack>
            </Stack>

            {entry.exercises.length > 0 && (
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mt: 1 }}>
                    {numSupersets > 0 && (
                        <Chip
                            size="small"
                            icon={<LinkIcon sx={{ fontSize: '13px !important' }} />}
                            label={`${String(numSupersets)} ${t('supersets.superset')}`}
                            variant="outlined"
                            color="secondary"
                        />
                    )}
                    <Chip size="small" label={t('journal.exercisesCount', { count: stats.numEx })} variant="outlined" color="primary" />
                    <Chip size="small" label={t('journal.setsCount', { count: stats.totalSets })} variant="outlined" color="primary" />
                    <Chip size="small" label={t('journal.repsCount', { count: stats.totalReps })} variant="outlined" color="primary" />
                    <Chip size="small" label={`${formatWeight(stats.totalVolume)} kg`} variant="outlined" color="primary" />
                </Stack>
            )}
        </Paper>
    );
}));

WorkoutItem.displayName = 'WorkoutItem';

export default WorkoutItem;
