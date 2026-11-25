import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Autocomplete from '@mui/material/Autocomplete';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';

import type { Exercise, SessionType, WorkoutExercise } from '../types';
import { groupExercisesIntoBlocks, type SupersetGroup } from '../utils/supersetUtils';
import WorkoutExerciseItem from '../components/journal/WorkoutExerciseItem';
import PageLoader from '../components/common/PageLoader';
import PageHeader from '../components/common/PageHeader';
import { sortTemplates } from '../utils/workoutUtils';
import { useWorkoutForm } from '../hooks/useWorkoutForm';
import { useUserProfile } from '../context/UserProfileContext';
import { useTranslation } from 'react-i18next';

const SESSION_TYPES: SessionType[] = ['strength', 'cardio', 'flexibility', 'other'];

const WorkoutForm = () => {
    const { t } = useTranslation();
    const { profile } = useUserProfile();
    const isSupersetsEnabled = profile?.settings?.enableSupersets ?? true;

    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const {
        date, setDate,
        time, setTime,
        length, setLength,
        sessionType, setSessionType,
        localComment, setLocalComment,
        maxPulse, setMaxPulse,
        sessionExercises,
        selectedTemplateId,
        autoFillFromLast, setAutoFillFromLast,
        autoSaveState,
        elapsedMinutes,
        error,
        loading, submitting,
        exercises, templates,
        exercisesLoading, profileLoading,
        isEditing, showTimer,
        handleAddExercise,
        handleRemoveExercise,
        handleAddSet,
        handleRemoveSet,
        handleUpdateSet,
        handleUpdateExerciseNote,
        handleMoveExercise,
        handleLinkWithNext,
        handleUnlinkSuperset,
        handleUnlinkEntireSuperset,
        handleUpdateSupersetNote,
        handleTemplateChange,
        handleSubmit,
        previousExercisesMap,
        DRAFT_KEY
    } = useWorkoutForm(id);

    const [editingSupersetId, setEditingSupersetId] = useState<string | null>(null);
    const [tempSupersetNote, setTempSupersetNote] = useState('');

    const exerciseMap = useMemo<Record<string, Exercise | undefined>>(() => {
        const map: Record<string, Exercise> = {};
        for (const ex of exercises) {
            map[ex.id] = ex;
        }
        return map;
    }, [exercises]);

    const availableExercises = useMemo(() => {
        const selectedIds = new Set(sessionExercises.map(se => se.exerciseId));
        return exercises.filter(ex => !selectedIds.has(ex.id));
    }, [exercises, sessionExercises]);

    const sortedTemplates = useMemo(() => sortTemplates(templates), [templates]);

    const exerciseBlocks = useMemo<SupersetGroup<WorkoutExercise>[]>(
        () => groupExercisesIntoBlocks<WorkoutExercise>(sessionExercises),
        [sessionExercises]
    );


    if (loading || (exercisesLoading && exercises.length === 0) || profileLoading) return (
        <PageLoader />
    );

    return (
        <Container maxWidth="lg">
            <PageHeader
                title={isEditing ? t('journal.editWorkout') : t('journal.newWorkout')}
                onBack={() => { void navigate(isEditing ? `/journal/${id ?? ''}` : '/journal'); }}
            />

            {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}
            {autoSaveState.error && <Alert severity="warning" sx={{ mb: 2.5 }}>{autoSaveState.error}</Alert>}

            <Paper sx={{ p: { xs: 2, md: 3.5 }, position: 'relative' }}>
                <form onSubmit={(e) => { void handleSubmit(e); }}>
                    <Grid container spacing={{ xs: 2, sm: 2.5 }}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                                id="workout-date"
                                label={t('journal.date')}
                                type="date"
                                fullWidth
                                size="small"
                                value={date}
                                onChange={(e) => { setDate(e.target.value); }}
                                required
                                slotProps={{ inputLabel: { shrink: true } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                                id="workout-time"
                                label={t('journal.time')}
                                type="time"
                                fullWidth
                                size="small"
                                value={time}
                                onChange={(e) => { setTime(e.target.value); }}
                                slotProps={{ inputLabel: { shrink: true } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                                id="workout-type"
                                select
                                label={t('journal.workoutType')}
                                fullWidth
                                size="small"
                                value={sessionType}
                                onChange={(e) => { setSessionType(e.target.value as SessionType); }}
                            >
                                {SESSION_TYPES.map((type) => (
                                    <MenuItem key={type} value={type}>
                                        {t(`exerciseTypes.${type}`, { defaultValue: type })}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 3 }}>
                            <TextField
                                id="workout-length"
                                label={t('journal.durationMin')}
                                type="number"
                                fullWidth
                                size="small"
                                value={length}
                                onChange={(e) => { setLength(e.target.value === '' ? '' : Number(e.target.value)); }}
                                slotProps={{ htmlInput: { min: 0 } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                            <TextField
                                id="workout-pulse"
                                label={t('journal.maxPulse')}
                                type="number"
                                fullWidth
                                size="small"
                                value={maxPulse}
                                onChange={(e) => { setMaxPulse(e.target.value === '' ? '' : Number(e.target.value)); }}
                                slotProps={{ htmlInput: { min: 0 } }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                id="workout-notes"
                                label={t('journal.notes')}
                                fullWidth
                                size="small"
                                value={localComment}
                                onChange={(e) => { setLocalComment(e.target.value); }}
                                placeholder={t('journal.notesPlaceholder')}
                                slotProps={{ htmlInput: { maxLength: 1000 } }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Divider sx={{ my: 1.5 }} />
                            <Typography variant="h6" gutterBottom>{t('journal.exercisesAndSets')}</Typography>
                            <Grid container spacing={2} sx={{ mb: 2.5, alignItems: 'center' }}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        id="workout-template"
                                        select
                                        label={t('journal.useTemplate')}
                                        fullWidth
                                        size="small"
                                        value={selectedTemplateId}
                                        onChange={(e) => { handleTemplateChange(e.target.value); }}
                                        helperText={selectedTemplateId ? t('journal.templateLinked') : t('journal.prepopulatesWorkout')}
                                    >
                                            <MenuItem value=""><em>{t('common.none')}</em></MenuItem>
                                            {sortedTemplates.map((tItem) => (
                                                <MenuItem key={tItem.id} value={tItem.id}>
                                                    {tItem.isFavorite && '★ '}{tItem.name}
                                                </MenuItem>
                                            ))}
                                            {selectedTemplateId && !templates.some(tItem => tItem.id === selectedTemplateId) && (
                                                <MenuItem value={selectedTemplateId}>
                                                    <em>{t('journal.referencedTemplate', { name: '' })}</em>
                                                </MenuItem>
                                            )}
                                        </TextField>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Tooltip title={t('journal.autoFillTooltip')} arrow>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        id="workout-autofill"
                                                        checked={autoFillFromLast}
                                                        onChange={(e) => { setAutoFillFromLast(e.target.checked); }}
                                                        color="primary"
                                                    />
                                                }
                                                label={t('journal.autoFillLast')}
                                                sx={{ ml: 1 }}
                                            />
                                        </Tooltip>
                                    </Grid>
                                </Grid>

                                {exerciseBlocks.map((block: SupersetGroup<WorkoutExercise>, blockIdx: number) => {
                                    if (block.isSuperset) {
                                        return (
                                            <Paper
                                                key={`superset-${block.supersetId ?? String(blockIdx)}`}
                                                variant="outlined"
                                                sx={{
                                                    p: { xs: 1.5, sm: 2 },
                                                    mb: { xs: 2, sm: 3 },
                                                    borderLeft: '4px solid',
                                                    borderColor: 'primary.main',
                                                    bgcolor: 'action.hover',
                                                    borderRadius: 2
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                                                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                                                        <Chip
                                                            icon={<LinkIcon fontSize="small" />}
                                                            label={t('supersets.supersetTitle', { letter: block.letter })}
                                                            size="small"
                                                            color="primary"
                                                            sx={{ fontWeight: 500 }}
                                                        />
                                                        {block.note && editingSupersetId !== block.supersetId && (
                                                            <Typography
                                                                variant="body2"
                                                                sx={{ color: 'text.secondary', fontStyle: 'italic', cursor: 'pointer' }}
                                                                onClick={() => {
                                                                    setEditingSupersetId(block.supersetId ?? null);
                                                                    setTempSupersetNote(block.note ?? '');
                                                                }}
                                                            >
                                                                &ldquo;{block.note}&rdquo;
                                                            </Typography>
                                                        )}
                                                    </Stack>
                                                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                                                        <Tooltip title={block.note ? t('supersets.editNote') : t('supersets.addNote')}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => {
                                                                    setEditingSupersetId(block.supersetId ?? null);
                                                                    setTempSupersetNote(block.note ?? '');
                                                                }}
                                                            >
                                                                <NoteAddIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title={t('supersets.unlink')}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => {
                                                                    if (block.supersetId) {
                                                                        handleUnlinkEntireSuperset(block.supersetId);
                                                                    }
                                                                }}
                                                            >
                                                                <LinkOffIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Stack>
                                                </Box>

                                                {editingSupersetId === block.supersetId && (
                                                    <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                                                        <TextField
                                                            size="small"
                                                            fullWidth
                                                            placeholder={t('supersets.notePlaceholder')}
                                                            value={tempSupersetNote}
                                                            onChange={(e) => { setTempSupersetNote(e.target.value); }}
                                                        />
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            onClick={() => {
                                                                if (block.supersetId) {
                                                                    handleUpdateSupersetNote(block.supersetId, tempSupersetNote);
                                                                }
                                                                setEditingSupersetId(null);
                                                            }}
                                                        >
                                                            {t('common.save')}
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            onClick={() => { setEditingSupersetId(null); }}
                                                        >
                                                            {t('common.cancel')}
                                                        </Button>
                                                    </Box>
                                                )}

                                                {block.items.map(({ item: se, originalIndex, tag }) => {
                                                    const exercise = exerciseMap[se.exerciseId];
                                                    return (
                                                        <WorkoutExerciseItem
                                                            key={se.exerciseId}
                                                            sessionExercise={se}
                                                            exercise={exercise}
                                                            onRemoveExercise={handleRemoveExercise}
                                                            onAddSet={handleAddSet}
                                                            onUpdateSet={handleUpdateSet}
                                                            onRemoveSet={handleRemoveSet}
                                                            onUpdateExerciseNote={handleUpdateExerciseNote}
                                                            onMoveUp={() => { handleMoveExercise(originalIndex, 'up'); }}
                                                            onMoveDown={() => { handleMoveExercise(originalIndex, 'down'); }}
                                                            isFirst={originalIndex === 0}
                                                            isLast={originalIndex === sessionExercises.length - 1}
                                                            previousExercise={previousExercisesMap[se.exerciseId]}
                                                            supersetTag={tag}
                                                            isInsideSuperset={true}
                                                            onUnlinkSuperset={() => { handleUnlinkSuperset(originalIndex); }}
                                                        />
                                                    );
                                                })}
                                            </Paper>
                                        );
                                    }

                                    const { item: se, originalIndex } = block.items[0];
                                    const exercise = exerciseMap[se.exerciseId];
                                    return (
                                        <WorkoutExerciseItem
                                            key={se.exerciseId}
                                            sessionExercise={se}
                                            exercise={exercise}
                                            onRemoveExercise={handleRemoveExercise}
                                            onAddSet={handleAddSet}
                                            onUpdateSet={handleUpdateSet}
                                            onRemoveSet={handleRemoveSet}
                                            onUpdateExerciseNote={handleUpdateExerciseNote}
                                            onMoveUp={() => { handleMoveExercise(originalIndex, 'up'); }}
                                            onMoveDown={() => { handleMoveExercise(originalIndex, 'down'); }}
                                            isFirst={originalIndex === 0}
                                            isLast={originalIndex === sessionExercises.length - 1}
                                            previousExercise={previousExercisesMap[se.exerciseId]}
                                            isInsideSuperset={false}
                                            onLinkWithNext={isSupersetsEnabled && originalIndex < sessionExercises.length - 1 ? () => { handleLinkWithNext(originalIndex); } : undefined}
                                        />
                                    );
                                })}
                                <Box sx={{ mt: 2 }}>
                                    <Autocomplete
                                        key={sessionExercises.length}
                                        size="small"
                                        options={availableExercises}
                                        getOptionLabel={(option) => option.name}
                                        onChange={(_, newValue) => { handleAddExercise(newValue); }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                id="add-exercise-autocomplete"
                                                label={t('journal.addExercise')}
                                                placeholder={t('journal.searchExercises')}
                                            />
                                        )}
                                        value={null}
                                        sx={{ width: '100%', maxWidth: { sm: 400 } }}
                                    />
                                </Box>
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Box
                                    sx={{
                                        mt: 2.5,
                                        display: 'flex',
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        justifyContent: 'flex-end',
                                        alignItems: { xs: 'stretch', sm: 'center' },
                                        gap: 2,
                                    }}
                                >
                                    {!isEditing && showTimer && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-start' }, gap: 1 }}>
                                            <AccessTimeIcon fontSize="small" color="action" />
                                            <Typography variant="body1" sx={{ fontWeight: 500, color: 'primary.main' }}>
                                                {elapsedMinutes} {t('common.unitMin')}
                                            </Typography>
                                        </Box>
                                    )}
                                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                                        <Button
                                            variant="outlined"
                                            onClick={() => {
                                                localStorage.removeItem(DRAFT_KEY);
                                                window.dispatchEvent(new Event('draft-updated'));
                                                void navigate(isEditing ? `/journal/${id ?? ''}` : '/journal');
                                            }}
                                            sx={{ flex: { xs: 1, sm: '0 0 auto' } }}
                                        >
                                            {t('common.cancel')}
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            color="primary"
                                            disabled={submitting}
                                            sx={{ flex: { xs: 1, sm: '0 0 auto' }, minWidth: { sm: 150 } }}
                                        >
                                            {submitting ? t('common.saving') : (isEditing ? t('journal.updateWorkout') : t('journal.finishWorkout'))}
                                        </Button>
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
        </Container>
    );
};

export default WorkoutForm;
