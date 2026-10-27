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
import { useTranslation } from 'react-i18next';
import { useUserProfile } from '../../hooks/useUserProfile';
import { calculateExertionValues, getDisplayedExertion, formatExertionLabel } from '../../utils/exertionUtils';
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
    const { t } = useTranslation();
    const { profile } = useUserProfile();
    const isExertionEnabled = Boolean(profile?.settings?.enableExertionTracking);
    const exertionMode = profile?.settings?.exertionMode ?? 'rpe';

    // Local state for instant feedback while typing
    const [localWeight, setLocalWeight] = useState<string>(set.weight?.toString() ?? '');
    const [localReps, setLocalReps] = useState<string>(set.reps?.toString() ?? '');
    const [localExertion, setLocalExertion] = useState<string>(
        getDisplayedExertion(set, exertionMode)?.toString() ?? ''
    );

    // Sync local state to parent state with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            const weightNum = localWeight === '' || Number.isNaN(Number(localWeight)) ? undefined : Number(localWeight);
            const repsNum = localReps === '' || Number.isNaN(Number(localReps)) ? undefined : Number(localReps);
            const exertionNum = localExertion === '' || Number.isNaN(Number(localExertion)) ? undefined : Number(localExertion);
            const currentDisplayed = getDisplayedExertion(set, exertionMode);

            const weightChanged = weightNum !== set.weight;
            const repsChanged = repsNum !== set.reps;
            const exertionChanged = isExertionEnabled && exertionNum !== currentDisplayed;

            if (weightChanged || repsChanged || exertionChanged) {
                const updates: Partial<ExerciseSet> = {
                    weight: weightNum,
                    reps: repsNum
                };
                if (isExertionEnabled) {
                    const calculated = calculateExertionValues(exertionNum, exertionMode);
                    updates.rpe = calculated.rpe;
                    updates.rir = calculated.rir;
                }
                onUpdateSet(exerciseId, set.id, updates);
            }
        }, 500);
        return () => { clearTimeout(timer); };
    }, [localWeight, localReps, localExertion, exerciseId, set.id, set.weight, set.reps, set.rpe, set.rir, set, isExertionEnabled, exertionMode, onUpdateSet]);

    const [prevSet, setPrevSet] = useState({
        weight: set.weight,
        reps: set.reps,
        rpe: set.rpe,
        rir: set.rir,
        mode: exertionMode
    });

    if (
        set.weight !== prevSet.weight ||
        set.reps !== prevSet.reps ||
        set.rpe !== prevSet.rpe ||
        set.rir !== prevSet.rir ||
        exertionMode !== prevSet.mode
    ) {
        setPrevSet({
            weight: set.weight,
            reps: set.reps,
            rpe: set.rpe,
            rir: set.rir,
            mode: exertionMode
        });
        setLocalWeight(set.weight?.toString() ?? '');
        setLocalReps(set.reps?.toString() ?? '');
        const currentEx = getDisplayedExertion(set, exertionMode);
        setLocalExertion(currentEx?.toString() ?? '');
    }

    return (
        <Box>
            <Grid container spacing={1} sx={{ alignItems: "center", mb: 1.5, flexWrap: "nowrap" }}>
                <Grid size="auto" sx={{ minWidth: { xs: 20, sm: 24 } }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>{index + 1}</Typography>
                </Grid>
                <Grid size={isExertionEnabled ? 3 : 4}>
                    <TextField
                        id={`weight-${set.id}`}
                        variant="standard"
                        label={index === 0 ? t('journal.weight') : ""}
                        placeholder={t('common.unitKg')}
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
                <Grid size={isExertionEnabled ? 3 : 4}>
                    <TextField
                        id={`reps-${set.id}`}
                        variant="standard"
                        label={index === 0 ? t('journal.reps') : ""}
                        placeholder={t('journal.reps')}
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
                {isExertionEnabled && (
                    <Grid size={3}>
                        <TextField
                            id={`exertion-${set.id}`}
                            variant="standard"
                            label={index === 0 ? (exertionMode === 'rpe' ? t('exertion.labelRpe') : t('exertion.labelRir')) : ""}
                            placeholder={exertionMode === 'rpe' ? t('exertion.labelRpe') : t('exertion.labelRir')}
                            type="number"
                            slotProps={{ htmlInput: { step: 0.5, min: 0, max: 10 } }}
                            size="small"
                            fullWidth
                            value={localExertion}
                            onChange={(e) => { setLocalExertion(e.target.value); }}
                            sx={{
                                '& .MuiInputLabel-root': { display: index === 0 ? 'block' : 'none' },
                                '& .MuiInputBase-input': { px: { xs: 1, sm: 1.5 } }
                            }}
                        />
                    </Grid>
                )}
                <Grid size="auto" sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title={t('journal.addNotes')} arrow>
                        <IconButton 
                            size="small" 
                            onClick={() => { onEditNotes(set.id); }}
                            color={set.notes ? "primary" : "default"}
                            sx={{ p: { xs: 0.5, sm: 1 } }}
                        >
                            {set.notes ? <CommentIcon fontSize="small" /> : <CommentOutlinedIcon fontSize="small" />}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('journal.removeSet')} arrow>
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
                        {t('journal.lastSession')} {previousSet.weight !== undefined ? `${String(previousSet.weight)}${t('common.unitKg')}` : ''} 
                        {previousSet.weight !== undefined && previousSet.reps !== undefined ? ' × ' : ''}
                        {previousSet.reps !== undefined ? `${String(previousSet.reps)} ${t('journal.reps')}` : ''}
                        {isExertionEnabled && formatExertionLabel(previousSet, exertionMode) ? ` (${formatExertionLabel(previousSet, exertionMode)})` : ''}
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default memo(WorkoutSetItem);
