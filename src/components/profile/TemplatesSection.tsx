import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import AddIcon from '@mui/icons-material/Add';
import type { DropResult } from '@hello-pangea/dnd';
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from '../../services/db';
import type { TrainingTemplate, Exercise } from '../../types';
import TemplateDialog from './TemplateDialog';
import TemplateSetDialog, { type SetDialogData } from './TemplateSetDialog';
import TemplateAccordion from './TemplateAccordion';

interface TemplatesSectionProps {
    userId: string;
    exercises: Exercise[];
}

const TemplatesSection = ({ userId, exercises }: TemplatesSectionProps) => {
    const [templates, setTemplates] = useState<TrainingTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<TrainingTemplate | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [templateNotes, setTemplateNotes] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);
    const [isArchived, setIsArchived] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeSearchId, setActiveSearchId] = useState<string | null>(null);
    const [editingNotePath, setEditingNotePath] = useState<{ tid: string, idx: number } | null>(null);
    const [isSetDialogOpen, setIsSetDialogOpen] = useState(false);
    const [setDialogData, setSetDialogData] = useState<SetDialogData | null>(null);

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

    const handleOpenDialog = (template?: TrainingTemplate) => {
        if (template) {
            setEditingTemplate(template);
            setName(template.name);
            setTemplateNotes(template.notes ?? '');
            setIsFavorite(!!template.isFavorite);
            setIsArchived(!!template.isArchived);
        } else {
            setEditingTemplate(null);
            setName('');
            setTemplateNotes('');
            setIsFavorite(false);
            setIsArchived(false);
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingTemplate(null);
        setName('');
        setTemplateNotes('');
        setIsFavorite(false);
        setIsArchived(false);
    };

    const handleInlineAdd = async (templateId: string, exercise: Exercise | null) => {
        if (!exercise) return;
        const template = templates.find(t => t.id === templateId);
        if (!template) return;

        const newExercises = [...template.exercises, { exerciseId: exercise.id, note: '' }];
        try {
            await updateTemplate(userId, templateId, { ...template, exercises: newExercises });
            setTemplates(prev => prev.map(t => t.id === templateId ? { ...t, exercises: newExercises } : t));
            setActiveSearchId(null);
        } catch (err) {
            console.error('Failed to add exercise:', err);
        }
    };

    const handleInlineRemove = async (templateId: string, index: number) => {
        const template = templates.find(t => t.id === templateId);
        if (!template) return;

        const newExercises = template.exercises.filter((_, i) => i !== index);
        try {
            await updateTemplate(userId, templateId, { ...template, exercises: newExercises });
            setTemplates(prev => prev.map(t => t.id === templateId ? { ...t, exercises: newExercises } : t));
        } catch (err) {
            console.error('Failed to remove exercise:', err);
        }
    };

    const handleInlineUpdateNote = async (templateId: string, index: number, note: string) => {
        const template = templates.find(t => t.id === templateId);
        if (!template) return;

        const newExercises = template.exercises.map((ex, i) => i === index ? { ...ex, note } : ex);
        try {
            await updateTemplate(userId, templateId, { ...template, exercises: newExercises });
            setTemplates(prev => prev.map(t => t.id === templateId ? { ...t, exercises: newExercises } : t));
            setEditingNotePath(null);
        } catch (err) {
            console.error('Failed to update note:', err);
        }
    };

    const handleOnDragEnd = async (result: DropResult, templateId: string) => {
        if (!result.destination) return;
        
        const template = templates.find(t => t.id === templateId);
        if (!template) return;

        const newExercises = Array.from(template.exercises);
        const [reorderedItem] = newExercises.splice(result.source.index, 1);
        newExercises.splice(result.destination.index, 0, reorderedItem);

        try {
            await updateTemplate(userId, templateId, { ...template, exercises: newExercises });
            setTemplates(prev => prev.map(t => t.id === templateId ? { ...t, exercises: newExercises } : t));
        } catch (err) {
            console.error('Failed to reorder exercises:', err);
        }
    };

    const handleOpenSetDialog = (tid: string, exerciseIdx: number, setIdx?: number) => {
        const template = templates.find(t => t.id === tid);
        const exercise = template?.exercises[exerciseIdx];
        const existingSet = setIdx !== undefined ? exercise?.sets?.[setIdx] : null;

        setSetDialogData({
            tid,
            exerciseIdx,
            setIdx,
            weight: existingSet?.weight ?? 0,
            reps: existingSet?.reps ?? 0,
            count: 1
        });
        setIsSetDialogOpen(true);
    };

    const handleSaveSet = async () => {
        if (!setDialogData) return;
        const { tid, exerciseIdx, setIdx, weight, reps, count } = setDialogData;
        const template = templates.find(t => t.id === tid);
        if (!template) return;

        const newExercises = [...template.exercises];
        const exercise = { ...newExercises[exerciseIdx] };
        const newSets = [...(exercise.sets ?? [])];

        if (setIdx !== undefined) {
            // Edit existing set
            newSets[setIdx] = { ...newSets[setIdx], weight, reps };
        } else {
            // Add new set(s)
            for (let i = 0; i < count; i++) {
                newSets.push({
                    id: Math.random().toString(36).slice(2, 11),
                    weight,
                    reps
                });
            }
        }

        exercise.sets = newSets;
        newExercises[exerciseIdx] = exercise;
        const updatedTemplate = { ...template, exercises: newExercises };

        try {
            await updateTemplate(userId, tid, updatedTemplate);
            setTemplates(prev => prev.map(t => t.id === tid ? updatedTemplate : t));
            setIsSetDialogOpen(false);
            setSetDialogData(null);
        } catch (err) {
            console.error('Failed to save set:', err);
        }
    };

    const handleRemoveSetFromTemplate = async (tid: string, exerciseIdx: number, setIdx: number) => {
        if (!window.confirm('Remove this set?')) return;
        const template = templates.find(t => t.id === tid);
        if (!template) return;

        const newExercises = [...template.exercises];
        const exercise = { ...newExercises[exerciseIdx] };
        exercise.sets = exercise.sets?.filter((_, i) => i !== setIdx);
        newExercises[exerciseIdx] = exercise;
        
        try {
            await updateTemplate(userId, tid, { ...template, exercises: newExercises });
            setTemplates(prev => prev.map(t => t.id === tid ? { ...t, exercises: newExercises } : t));
            setIsSetDialogOpen(false);
        } catch (err) {
            console.error('Failed to remove set:', err);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) return;

        setSaving(true);
        try {
            const templateData = { 
                name, 
                notes: templateNotes, 
                isFavorite, 
                isArchived 
            };
            if (editingTemplate) {
                await updateTemplate(userId, editingTemplate.id, { ...editingTemplate, ...templateData });
                setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? { ...t, ...templateData } : t));
            } else {
                const id = await createTemplate(userId, { ...templateData, exercises: [] });
                setTemplates(prev => [...prev, { id, userId, exercises: [], ...templateData }]);
            }
            handleCloseDialog();
        } catch (err) {
            console.error('Failed to save template:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this template?')) return;
        try {
            await deleteTemplate(userId, id);
            setTemplates(prev => prev.filter(t => t.id !== id));
            if (isDialogOpen) handleCloseDialog();
        } catch (err) {
            console.error('Failed to delete template:', err);
        }
    };
    const sortedTemplates = [...templates].sort((a, b) => {
        // Favorites first
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        // Archived last
        if (a.isArchived && !b.isArchived) return 1;
        if (!a.isArchived && b.isArchived) return -1;
        // Then by name
        return a.name.localeCompare(b.name);
    });

    return (
        <Box sx={{ mt: 4 }}>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3
                }}>
                <Typography variant="h5" sx={{
                    fontWeight: 600
                }}>Training Templates</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => { handleOpenDialog(); }}>
                    Create Template
                </Button>
            </Box>
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
                open={isDialogOpen}
                onClose={handleCloseDialog}
                onSave={handleSave}
                onDelete={handleDelete}
                saving={saving}
                editingTemplate={editingTemplate}
                name={name}
                setName={setName}
                notes={templateNotes}
                setNotes={setTemplateNotes}
                isFavorite={isFavorite}
                setIsFavorite={setIsFavorite}
                isArchived={isArchived}
                setIsArchived={setIsArchived}
            />

            <TemplateSetDialog
                open={isSetDialogOpen}
                onClose={() => { setIsSetDialogOpen(false); }}
                onSave={handleSaveSet}
                onDelete={(tid, eIdx, sIdx) => { void handleRemoveSetFromTemplate(tid, eIdx, sIdx); }}
                data={setDialogData}
                setData={setSetDialogData}
            />
        </Box>
    );
};

export default TemplatesSection;
