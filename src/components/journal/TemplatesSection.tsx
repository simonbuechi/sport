import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import AddIcon from '@mui/icons-material/Add';
import InfoIcon from '@mui/icons-material/Info';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import type { DropResult } from '@hello-pangea/dnd';
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from '../../services/db';
import type { TrainingTemplate, Exercise } from '../../types';
import TemplateDialog, { type TemplateFormData } from './TemplateDialog';
import TemplateSetDialog, { type SetDialogData } from './TemplateSetDialog';
import TemplateAccordion from './TemplateAccordion';

interface TemplatesSectionProps {
    userId: string;
    exercises: Exercise[];
    onBack?: () => void;
}

const TemplatesSection = ({ userId, exercises, onBack }: TemplatesSectionProps) => {
    const [templates, setTemplates] = useState<TrainingTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<TrainingTemplate | null>(null);
    const [saving, setSaving] = useState(false);
    const [activeSearchId, setActiveSearchId] = useState<string | null>(null);
    const [editingNotePath, setEditingNotePath] = useState<{ tid: string, idx: number } | null>(null);
    const [isSetDialogOpen, setIsSetDialogOpen] = useState(false);
    const [setDialogData, setSetDialogData] = useState<SetDialogData | null>(null);
    const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

    const templatesRef = useRef(templates);
    useEffect(() => {
        templatesRef.current = templates;
    }, [templates]);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const data = await getTemplates(userId);
                setTemplates(data);
            } catch (err) {
                console.error('Failed to fetch templates:', err);
            } finally {
                setLoading(false);
            }
        };

        void fetchTemplates();
    }, [userId]);

    const exerciseMap = useMemo(() => {
        return exercises.reduce<Record<string, Exercise>>((acc, ex) => {
            acc[ex.id] = ex;
            return acc;
        }, {});
    }, [exercises]);

    const sortedTemplates = useMemo(() => {
        return [...templates].sort((a, b) => {
            // Favorites first
            if (a.isFavorite && !b.isFavorite) return -1;
            if (!a.isFavorite && b.isFavorite) return 1;
            // Archived last
            if (a.isArchived && !b.isArchived) return 1;
            if (!a.isArchived && b.isArchived) return -1;
            // Then by name
            return a.name.localeCompare(b.name);
        });
    }, [templates]);

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
        const template = templatesRef.current.find(t => t.id === templateId);
        if (!template) return;

        const newExercises = [...template.exercises, { exerciseId: exercise.id, note: '' }];
        const updatedTemplate = { ...template, exercises: newExercises };

        setTemplates(prev => prev.map(t => t.id === templateId ? updatedTemplate : t));
        setActiveSearchId(null);

        try {
            await updateTemplate(userId, templateId, updatedTemplate);
        } catch (err) {
            console.error('Failed to add exercise:', err);
        }
    }, [userId]);

    const handleInlineRemove = useCallback(async (templateId: string, index: number) => {
        const template = templatesRef.current.find(t => t.id === templateId);
        if (!template) return;

        const newExercises = template.exercises.filter((_, i) => i !== index);
        const updatedTemplate = { ...template, exercises: newExercises };

        setTemplates(prev => prev.map(t => t.id === templateId ? updatedTemplate : t));

        try {
            await updateTemplate(userId, templateId, updatedTemplate);
        } catch (err) {
            console.error('Failed to remove exercise:', err);
        }
    }, [userId]);

    const handleInlineUpdateNote = useCallback(async (templateId: string, index: number, note: string) => {
        const template = templatesRef.current.find(t => t.id === templateId);
        if (!template) return;

        const newExercises = template.exercises.map((ex, i) => i === index ? { ...ex, note } : ex);
        const updatedTemplate = { ...template, exercises: newExercises };

        setTemplates(prev => prev.map(t => t.id === templateId ? updatedTemplate : t));
        setEditingNotePath(null);

        try {
            await updateTemplate(userId, templateId, updatedTemplate);
        } catch (err) {
            console.error('Failed to update note:', err);
        }
    }, [userId]);

    const handleOnDragEnd = useCallback(async (result: DropResult, templateId: string) => {
        if (!result.destination) return;
        const template = templatesRef.current.find(t => t.id === templateId);
        if (!template) return;

        const newExercises = Array.from(template.exercises);
        const [reorderedItem] = newExercises.splice(result.source.index, 1);
        newExercises.splice(result.destination.index, 0, reorderedItem);
        const updatedTemplate = { ...template, exercises: newExercises };

        setTemplates(prev => prev.map(t => t.id === templateId ? updatedTemplate : t));

        try {
            await updateTemplate(userId, templateId, updatedTemplate);
        } catch (err) {
            console.error('Failed to reorder exercises:', err);
        }
    }, [userId]);

    const handleOpenSetDialog = useCallback((tid: string, exerciseIdx: number, setIdx?: number) => {
        const template = templatesRef.current.find(t => t.id === tid);
        const exercise = template?.exercises[exerciseIdx];
        const existingSet = setIdx !== undefined ? exercise?.sets?.[setIdx] : null;

        setSetDialogData({
            tid,
            exerciseIdx,
            setIdx,
            weight: existingSet?.weight,
            reps: existingSet?.reps,
            count: 1
        });
        setIsSetDialogOpen(true);
    }, []);

    const handleSaveSet = async () => {
        if (!setDialogData) return;
        const { tid, exerciseIdx, setIdx, weight, reps, count } = setDialogData;

        const template = templatesRef.current.find(t => t.id === tid);
        if (!template) return;

        const newExercises = [...template.exercises];
        const exercise = { ...newExercises[exerciseIdx] };
        const newSets = [...(exercise.sets ?? [])];

        if (setIdx !== undefined) {
            newSets[setIdx] = { ...newSets[setIdx], weight, reps };
        } else {
            for (let i = 0; i < count; i++) {
                newSets.push({
                    id: crypto.randomUUID(),
                    weight,
                    reps
                });
            }
        }

        exercise.sets = newSets;
        newExercises[exerciseIdx] = exercise;
        const updatedTemplate = { ...template, exercises: newExercises };

        setTemplates(prev => prev.map(t => t.id === tid ? updatedTemplate : t));
        setIsSetDialogOpen(false);
        setSetDialogData(null);

        try {
            await updateTemplate(userId, tid, updatedTemplate);
        } catch (err) {
            console.error('Failed to save set:', err);
        }
    };

    const handleRemoveSetFromTemplate = useCallback(async (tid: string, exerciseIdx: number, setIdx: number) => {
        const template = templatesRef.current.find(t => t.id === tid);
        if (!template) return;

        const newExercises = [...template.exercises];
        const exercise = { ...newExercises[exerciseIdx] };
        exercise.sets = exercise.sets?.filter((_, i) => i !== setIdx);
        newExercises[exerciseIdx] = exercise;

        const updatedTemplate = { ...template, exercises: newExercises };
        setTemplates(prev => prev.map(t => t.id === tid ? updatedTemplate : t));
        setIsSetDialogOpen(false);

        try {
            await updateTemplate(userId, tid, updatedTemplate);
        } catch (err) {
            console.error('Failed to remove set:', err);
        }
    }, [userId]);

    const handleSave = async (formData: TemplateFormData) => {
        setSaving(true);
        try {
            if (editingTemplate) {
                const updatedTemplate = { ...editingTemplate, ...formData };
                await updateTemplate(userId, editingTemplate.id, updatedTemplate);
                setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? updatedTemplate : t));
            } else {
                const id = await createTemplate(userId, { ...formData, exercises: [] });
                setTemplates(prev => [...prev, { id, userId, exercises: [], ...formData }]);
            }
            handleCloseDialog();
        } catch (err) {
            console.error('Failed to save template:', err);
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
            await deleteTemplate(userId, templateToDelete);
            setTemplates(prev => prev.filter(t => t.id !== templateToDelete));
            setIsDeleteDialogOpen(false);
            setTemplateToDelete(null);
            if (isDialogOpen) handleCloseDialog();
        } catch (err) {
            console.error('Failed to delete template:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleCreateSample = async () => {
        setSaving(true);
        try {
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
                console.error("Could not find any matching exercises for sample");
                setSaving(false);
                return;
            }

            const templateData = {
                name: sample.name,
                notes: 'Auto-generated sample workout.',
                isFavorite: false,
                isArchived: false,
                exercises: templateExercises
            };

            const id = await createTemplate(userId, templateData);
            setTemplates(prev => [...prev, { id, userId, ...templateData }]);
            handleCloseDialog();
        } catch (err) {
            console.error('Failed to create sample template:', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box sx={{ mt: { xs: 1, md: 2 } }}>
            <Stack 
                direction="row" 
                sx={{ 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    mb: { xs: 2, md: 4 }
                }}
            >
                <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                    {onBack && (
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={onBack}
                            sx={{ color: 'text.secondary' }}
                        >
                            Back
                        </Button>
                    )}
                    <Typography variant="h4" component="h1">
                        Templates
                    </Typography>
                </Stack>
                
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => { handleOpenDialog(); }}>
                        Template
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<InfoIcon />}
                        onClick={() => { setIsInfoDialogOpen(true); }}
                        sx={{ minWidth: 'auto', px: 1.5 }}
                    >
                        Info
                    </Button>
                </Stack>
            </Stack>
            {loading ? (
                <Typography sx={{
                    color: "text.secondary"
                }}>Loading templates...</Typography>
            ) : templates.length === 0 ? (
                <Typography sx={{
                    color: "text.secondary"
                }}>No templates created yet. Create one to easily log your favorite workouts!</Typography>
            ) : (
                <Grid container spacing={2}>
                    {sortedTemplates.map(template => (
                        <Grid size={{ xs: 12 }} key={template.id}>
                            <TemplateAccordion
                                template={template}
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
                                onDragEnd={handleOnDragEnd}
                                onOpenSetDialog={handleOpenSetDialog}
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
                <DialogTitle>Training Templates</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        You can set up templates for your workouts with a set of exercises and sets. When logging a new workout, you can select your template.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ pb: 2, px: 3 }}>
                    <Button onClick={() => { setIsInfoDialogOpen(false); }} variant="contained">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={isDeleteDialogOpen}
                onClose={() => { if (!saving) setIsDeleteDialogOpen(false); }}
            >
                <DialogTitle>Delete Template?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this template? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ pb: 2, px: 3 }}>
                    <Button onClick={() => { setIsDeleteDialogOpen(false); }} disabled={saving}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={() => { void confirmDeleteTemplate(); }} 
                        color="error" 
                        variant="contained"
                        disabled={saving}
                    >
                        {saving ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TemplatesSection;
