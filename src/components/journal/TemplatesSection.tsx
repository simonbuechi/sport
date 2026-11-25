import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useWorkouts } from '../../context/WorkoutsContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import AddIcon from '@mui/icons-material/Add';
import InfoIcon from '@mui/icons-material/Info';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import { createTemplate, updateTemplate, deleteTemplate } from '../../services/db';
import { linkWithNext, unlinkFromSuperset, unlinkEntireSuperset, updateSupersetNote } from '../../utils/supersetUtils';
import { sortTemplates } from '../../utils/workoutUtils';
import type { TrainingTemplate, Exercise } from '../../types';
import TemplateDialog, { type TemplateFormData } from './TemplateDialog';
import TemplateSetDialog, { type SetDialogData } from './TemplateSetDialog';
import TemplateAccordion from './TemplateAccordion';
import EmptyState from '../common/EmptyState';
import DescriptionIcon from '@mui/icons-material/Description';
import { useTranslation } from 'react-i18next';

interface TemplatesSectionProps {
    userId: string;
    exercises: Exercise[];
    onBack?: () => void;
}

const TemplatesSection = ({ userId, exercises, onBack }: TemplatesSectionProps) => {
    const { t } = useTranslation();
    const { templates: contextTemplates, loading: contextLoading } = useWorkouts();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<TrainingTemplate | null>(null);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [activeSearchId, setActiveSearchId] = useState<string | null>(null);
    const [editingNotePath, setEditingNotePath] = useState<{ tid: string, idx: number } | null>(null);
    const [isSetDialogOpen, setIsSetDialogOpen] = useState(false);
    const [setDialogData, setSetDialogData] = useState<SetDialogData | null>(null);
    const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

    const templatesRef = useRef(contextTemplates);
    useEffect(() => {
        templatesRef.current = contextTemplates;
    }, [contextTemplates]);

    const templates = contextTemplates;
    const loading = contextLoading;

    const exerciseMap = useMemo(() => {
        return exercises.reduce<Record<string, Exercise>>((acc, ex) => {
            acc[ex.id] = ex;
            return acc;
        }, {});
    }, [exercises]);

    const sortedTemplates = useMemo(() => sortTemplates(templates), [templates]);

    const handleOpenDialog = useCallback((template?: TrainingTemplate) => {
        setEditingTemplate(template ?? null);
        setIsDialogOpen(true);
    }, []);

    const handleCloseDialog = useCallback(() => {
        setIsDialogOpen(false);
        setEditingTemplate(null);
    }, []);

    const handleInlineAdd = useCallback(async (templateId: string, exercise: Exercise | null) => {
        if (!exercise) return;
        const template = templatesRef.current.find(tpl => tpl.id === templateId);
        if (!template) return;

        const newExercises = [...template.exercises, { exerciseId: exercise.id, note: '' }];
        const updatedTemplate = { ...template, exercises: newExercises };

        setActiveSearchId(null);

        try {
            setErrorMessage(null);
            await updateTemplate(userId, templateId, updatedTemplate);
        } catch (err) {
            console.error('Failed to add exercise:', err);
            setErrorMessage(err instanceof Error ? err.message : 'Failed to add exercise');
        }
    }, [userId]);

    const handleInlineRemove = useCallback(async (templateId: string, index: number) => {
        const template = templatesRef.current.find(tpl => tpl.id === templateId);
        if (!template) return;

        const unlinked = unlinkFromSuperset(template.exercises, index);
        const newExercises = unlinked.filter((_, i) => i !== index);
        const updatedTemplate = { ...template, exercises: newExercises };

        try {
            setErrorMessage(null);
            await updateTemplate(userId, templateId, updatedTemplate);
        } catch (err) {
            console.error('Failed to remove exercise:', err);
            setErrorMessage(err instanceof Error ? err.message : 'Failed to remove exercise');
        }
    }, [userId]);

    const handleInlineUpdateNote = useCallback(async (templateId: string, index: number, note: string) => {
        const template = templatesRef.current.find(tpl => tpl.id === templateId);
        if (!template) return;

        const newExercises = template.exercises.map((ex, i) => i === index ? { ...ex, note } : ex);
        const updatedTemplate = { ...template, exercises: newExercises };

        setEditingNotePath(null);

        try {
            setErrorMessage(null);
            await updateTemplate(userId, templateId, updatedTemplate);
        } catch (err) {
            console.error('Failed to update note:', err);
            setErrorMessage(err instanceof Error ? err.message : 'Failed to update note');
        }
    }, [userId]);

    const handleLinkSuperset = useCallback(async (templateId: string, index: number) => {
        const template = templatesRef.current.find(tpl => tpl.id === templateId);
        if (!template) return;
        const newExercises = linkWithNext(template.exercises, index);
        const updatedTemplate = { ...template, exercises: newExercises };
        try {
            setErrorMessage(null);
            await updateTemplate(userId, templateId, updatedTemplate);
        } catch (err) {
            console.error('Failed to link superset:', err);
            setErrorMessage(err instanceof Error ? err.message : 'Failed to link superset');
        }
    }, [userId]);

    const handleUnlinkSuperset = useCallback(async (templateId: string, index: number) => {
        const template = templatesRef.current.find(tpl => tpl.id === templateId);
        if (!template) return;
        const newExercises = unlinkFromSuperset(template.exercises, index);
        const updatedTemplate = { ...template, exercises: newExercises };
        try {
            setErrorMessage(null);
            await updateTemplate(userId, templateId, updatedTemplate);
        } catch (err) {
            console.error('Failed to unlink superset:', err);
            setErrorMessage(err instanceof Error ? err.message : 'Failed to unlink superset');
        }
    }, [userId]);

    const handleUnlinkEntireSuperset = useCallback(async (templateId: string, supersetId: string) => {
        const template = templatesRef.current.find(tpl => tpl.id === templateId);
        if (!template) return;
        const newExercises = unlinkEntireSuperset(template.exercises, supersetId);
        const updatedTemplate = { ...template, exercises: newExercises };
        try {
            setErrorMessage(null);
            await updateTemplate(userId, templateId, updatedTemplate);
        } catch (err) {
            console.error('Failed to unlink superset group:', err);
            setErrorMessage(err instanceof Error ? err.message : 'Failed to unlink superset');
        }
    }, [userId]);

    const handleUpdateSupersetNote = useCallback(async (templateId: string, supersetId: string, note: string) => {
        const template = templatesRef.current.find(tpl => tpl.id === templateId);
        if (!template) return;
        const newExercises = updateSupersetNote(template.exercises, supersetId, note);
        const updatedTemplate = { ...template, exercises: newExercises };
        try {
            setErrorMessage(null);
            await updateTemplate(userId, templateId, updatedTemplate);
        } catch (err) {
            console.error('Failed to update superset note:', err);
            setErrorMessage(err instanceof Error ? err.message : 'Failed to update superset note');
        }
    }, [userId]);

    const handleMoveExercise = useCallback(async (templateId: string, fromIndex: number, toIndex: number) => {
        const template = templatesRef.current.find(tpl => tpl.id === templateId);
        if (!template || toIndex < 0 || toIndex >= template.exercises.length) return;

        const newExercises = Array.from(template.exercises);
        const [movedItem] = newExercises.splice(fromIndex, 1);
        newExercises.splice(toIndex, 0, movedItem);
        const updatedTemplate = { ...template, exercises: newExercises };

        try {
            setErrorMessage(null);
            await updateTemplate(userId, templateId, updatedTemplate);
        } catch (err) {
            console.error('Failed to move exercise:', err);
            setErrorMessage(err instanceof Error ? err.message : 'Failed to reorder exercises');
        }
    }, [userId]);

    const handleOpenSetDialog = useCallback((tid: string, exerciseIdx: number, setIdx?: number) => {
        const template = templatesRef.current.find(tpl => tpl.id === tid);
        const exercise = template?.exercises[exerciseIdx];
        const existingSet = setIdx !== undefined ? exercise?.sets?.[setIdx] : null;

        setSetDialogData({
            tid,
            exerciseIdx,
            setIdx,
            weight: existingSet?.weight,
            reps: existingSet?.reps,
            rpe: existingSet?.rpe,
            rir: existingSet?.rir,
            count: 1
        });
        setIsSetDialogOpen(true);
    }, []);

    const handleSaveSet = async () => {
        if (!setDialogData) return;
        const { tid, exerciseIdx, setIdx, weight, reps, rpe, rir, count } = setDialogData;

        const template = templatesRef.current.find(tpl => tpl.id === tid);
        if (!template) return;

        const newExercises = [...template.exercises];
        const exercise = { ...newExercises[exerciseIdx] };
        const newSets = [...(exercise.sets ?? [])];

        if (setIdx !== undefined) {
            newSets[setIdx] = { ...newSets[setIdx], weight, reps, rpe, rir };
        } else {
            for (let i = 0; i < count; i++) {
                newSets.push({
                    id: crypto.randomUUID(),
                    weight,
                    reps,
                    rpe,
                    rir
                });
            }
        }

        exercise.sets = newSets;
        newExercises[exerciseIdx] = exercise;
        const updatedTemplate = { ...template, exercises: newExercises };

        setIsSetDialogOpen(false);
        setSetDialogData(null);

        try {
            setErrorMessage(null);
            await updateTemplate(userId, tid, updatedTemplate);
        } catch (err) {
            console.error('Failed to save set:', err);
            setErrorMessage(err instanceof Error ? err.message : 'Failed to save set');
        }
    };

    const handleRemoveSetFromTemplate = useCallback(async (tid: string, exerciseIdx: number, setIdx: number) => {
        const template = templatesRef.current.find(tpl => tpl.id === tid);
        if (!template) return;

        const newExercises = [...template.exercises];
        const exercise = { ...newExercises[exerciseIdx] };
        exercise.sets = exercise.sets?.filter((_, i) => i !== setIdx);
        newExercises[exerciseIdx] = exercise;

        const updatedTemplate = { ...template, exercises: newExercises };
        setIsSetDialogOpen(false);

        try {
            setErrorMessage(null);
            await updateTemplate(userId, tid, updatedTemplate);
        } catch (err) {
            console.error('Failed to remove set:', err);
            setErrorMessage(err instanceof Error ? err.message : 'Failed to remove set');
        }
    }, [userId]);

    const handleSave = async (formData: TemplateFormData) => {
        setSaving(true);
        try {
            setErrorMessage(null);
            if (editingTemplate) {
                const updatedTemplate = { ...editingTemplate, ...formData };
                await updateTemplate(userId, editingTemplate.id, updatedTemplate);
            } else {
                await createTemplate(userId, { ...formData, exercises: [] });
            }
            handleCloseDialog();
        } catch (err) {
            console.error('Failed to save template:', err);
            setErrorMessage(err instanceof Error ? err.message : 'Failed to save template');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (id: string) => {
        setTemplateToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteTemplate = async () => {
        if (!templateToDelete) return;
        try {
            setSaving(true);
            setErrorMessage(null);
            await deleteTemplate(userId, templateToDelete);
            setIsDeleteDialogOpen(false);
            setTemplateToDelete(null);
            if (isDialogOpen) handleCloseDialog();
        } catch (err) {
            console.error('Failed to delete template:', err);
            setErrorMessage(err instanceof Error ? err.message : 'Failed to delete template');
        } finally {
            setSaving(false);
        }
    };

    const handleCreateSample = async () => {
        setSaving(true);
        try {
            setErrorMessage(null);
            const samples = [
                {
                    name: 'Sample Push Workout',
                    exs: ['Bench Press', 'Alternating Dumbbell Shoulder Press', 'Alternating Dumbbell Lateral Raise', 'Alternating Dumbbell Tricep Kickback']
                },
                {
                    name: 'Sample Pull Workout',
                    exs: ['Deadlift', 'Alternating Dumbbell Preacher Curl', 'Alternating Hammer Preacher Curl', 'Alternating Bent Over Reverse Dumbbell Fly']
                },
                {
                    name: 'Sample Leg Workout',
                    exs: ['Squat', 'Deadlift', 'Ab Wheel Rollout', 'Ab Bench Crunch']
                }
            ];

            const sample = samples[Math.floor(Math.random() * samples.length)];

            const templateExercises = sample.exs.map(name => {
                const found = exercises.find(e => e.name.toLowerCase().includes(name.toLowerCase()));
                if (!found) return null;
                return {
                    exerciseId: found.id,
                    note: '',
                    sets: [
                        { id: crypto.randomUUID(), reps: 10 },
                        { id: crypto.randomUUID(), reps: 10 },
                        { id: crypto.randomUUID(), reps: 10 }
                    ]
                };
            }).filter((e): e is NonNullable<typeof e> => e !== null);

            if (templateExercises.length === 0) {
                setErrorMessage('Could not find matching exercises for sample workout');
                return;
            }

            const templateData = {
                name: sample.name,
                notes: 'Auto-generated sample workout.',
                isFavorite: false,
                isArchived: false,
                exercises: templateExercises
            };

            await createTemplate(userId, templateData);
            handleCloseDialog();
        } catch (err) {
            console.error('Failed to create sample template:', err);
            setErrorMessage(err instanceof Error ? err.message : 'Failed to create sample template');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box>
            <Stack
                direction="row"
                sx={{
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2.5,
                    flexWrap: 'wrap',
                    gap: 1,
                }}
            >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    {onBack && (
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={onBack}
                            sx={{ color: 'text.secondary' }}
                        >
                            {t('common.back')}
                        </Button>
                    )}
                    <Typography variant="h6" component="h2">
                        {t('templates.title')}
                    </Typography>
                </Stack>

                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => { handleOpenDialog(); }}>
                        {t('templates.create')}
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<InfoIcon />}
                        onClick={() => { setIsInfoDialogOpen(true); }}
                        sx={{ minWidth: 'auto', px: 1.5 }}
                    >
                        {t('common.info', { defaultValue: 'Info' })}
                    </Button>
                </Stack>
            </Stack>

            {errorMessage && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => { setErrorMessage(null); }}>
                    {errorMessage}
                </Alert>
            )}

            {loading ? (
                <Typography sx={{ color: 'text.secondary' }}>
                    {t('templates.loadingTemplates')}
                </Typography>
            ) : templates.length === 0 ? (
                <EmptyState
                    icon={<DescriptionIcon />}
                    title={t('templates.title')}
                    description={t('templates.emptyTemplatesDesc')}
                    actions={
                        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { handleOpenDialog(); }}>
                            {t('templates.create')}
                        </Button>
                    }
                />
            ) : (
                <Grid container spacing={2}>
                    {sortedTemplates.map(template => (
                        <Grid size={{ xs: 12 }} key={template.id}>
                            <TemplateAccordion
                                template={template}
                                userId={userId}
                                exercises={exercises}
                                exerciseMap={exerciseMap}
                                activeSearchId={activeSearchId}
                                setActiveSearchId={setActiveSearchId}
                                editingNotePath={editingNotePath}
                                setEditingNotePath={setEditingNotePath}
                                onEdit={handleOpenDialog}
                                onInlineAdd={handleInlineAdd}
                                onInlineRemove={handleInlineRemove}
                                onInlineUpdateNote={handleInlineUpdateNote}
                                onMoveExercise={handleMoveExercise}
                                onOpenSetDialog={handleOpenSetDialog}
                                onLinkSuperset={handleLinkSuperset}
                                onUnlinkSuperset={handleUnlinkSuperset}
                                onUnlinkEntireSuperset={handleUnlinkEntireSuperset}
                                onUpdateSupersetNote={handleUpdateSupersetNote}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}

            <TemplateDialog
                key={isDialogOpen ? (editingTemplate?.id ?? 'new') : 'closed'}
                open={isDialogOpen}
                onClose={handleCloseDialog}
                onSave={handleSave}
                onDelete={handleDelete}
                saving={saving}
                editingTemplate={editingTemplate}
                onCreateSample={handleCreateSample}
            />

            <TemplateSetDialog
                open={isSetDialogOpen}
                onClose={() => { setIsSetDialogOpen(false); }}
                onSave={handleSaveSet}
                onDelete={(tid, eIdx, sIdx) => { void handleRemoveSetFromTemplate(tid, eIdx, sIdx); }}
                data={setDialogData}
                setData={setSetDialogData}
            />

            <Dialog
                open={isInfoDialogOpen}
                onClose={() => { setIsInfoDialogOpen(false); }}
            >
                <DialogTitle>{t('templates.infoTitle')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('templates.infoDesc')}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ pb: 2, px: 3 }}>
                    <Button onClick={() => { setIsInfoDialogOpen(false); }} variant="contained">
                        {t('common.close')}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={isDeleteDialogOpen}
                onClose={() => { if (!saving) setIsDeleteDialogOpen(false); }}
            >
                <DialogTitle>{t('templates.deletePrompt')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('templates.deleteConfirm')}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ pb: 2, px: 3 }}>
                    <Button onClick={() => { setIsDeleteDialogOpen(false); }} disabled={saving}>
                        {t('common.cancel')}
                    </Button>
                    <Button
                        onClick={() => { void confirmDeleteTemplate(); }}
                        color="error"
                        variant="contained"
                        disabled={saving}
                    >
                        {saving ? t('common.loading') : t('common.delete')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TemplatesSection;
