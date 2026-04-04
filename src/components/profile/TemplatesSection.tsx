import { useState, useEffect } from 'react';
import {
    Typography, Box, Paper, Button, Grid, TextField,
    Dialog, DialogTitle, DialogContent, DialogActions,
    IconButton, List, Autocomplete, Chip
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Close as CloseIcon } from '@mui/icons-material';
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from '../../services/db';
import type { TrainingTemplate, TemplateExercise, Exercise } from '../../types';

interface TemplatesSectionProps {
    userId: string;
    allExercises: Exercise[];
}

const TemplatesSection = ({ userId, allExercises }: TemplatesSectionProps) => {
    const [templates, setTemplates] = useState<TrainingTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<TrainingTemplate | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [templateExercises, setTemplateExercises] = useState<TemplateExercise[]>([]);
    const [saving, setSaving] = useState(false);

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

        fetchTemplates();
    }, [userId]);

    const handleOpenDialog = (template?: TrainingTemplate) => {
        if (template) {
            setEditingTemplate(template);
            setName(template.name);
            setTemplateExercises(template.exercises || []);
        } else {
            setEditingTemplate(null);
            setName('');
            setTemplateExercises([]);
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingTemplate(null);
        setName('');
        setTemplateExercises([]);
    };

    const handleAddExercise = (exercise: Exercise | null) => {
        if (!exercise) return;
        setTemplateExercises(prev => [...prev, { exerciseId: exercise.id, note: '' }]);
    };

    const handleRemoveExercise = (index: number) => {
        setTemplateExercises(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpdateNote = (index: number, note: string) => {
        setTemplateExercises(prev => prev.map((ex, i) => i === index ? { ...ex, note } : ex));
    };

    const handleSave = async () => {
        if (!name.trim()) return;

        try {
            setSaving(true);
            const templateData = {
                name,
                exercises: templateExercises
            };

            if (editingTemplate) {
                await updateTemplate(userId, editingTemplate.id, templateData);
                setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? { ...t, ...templateData } : t));
            } else {
                const id = await createTemplate(userId, templateData);
                setTemplates(prev => [...prev, { id, userId, ...templateData }]);
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
        } catch (err) {
            console.error('Failed to delete template:', err);
        }
    };

    const getExerciseName = (id: string) => {
        return allExercises.find(ex => ex.id === id)?.name || 'Unknown Exercise';
    };

    return (
        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mt: 4, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight={600}>Training Templates</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                    Create Template
                </Button>
            </Box>

            {loading ? (
                <Typography color="text.secondary">Loading templates...</Typography>
            ) : templates.length === 0 ? (
                <Typography color="text.secondary">No templates created yet. Create one to easily log your favorite workouts!</Typography>
            ) : (
                <Grid container spacing={2}>
                    {templates.map(template => (
                        <Grid size={{ xs: 12 }} key={template.id}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                    <Box>
                                        <Typography variant="h6" color="primary">{template.name}</Typography>
                                        <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                                            {template.exercises.map((ex, idx) => (
                                                <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                    <Chip label={getExerciseName(ex.exerciseId)} size="small" component="span" />
                                                    {ex.note && (
                                                        <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                                                            {ex.note}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                    <Box>
                                        <IconButton size="small" onClick={() => handleOpenDialog(template)} title="Edit">
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => handleDelete(template.id)} title="Delete">
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            )}

            <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create Template'}</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        autoFocus
                        label="Template Name"
                        fullWidth
                        margin="normal"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Push Day, Leg Routine"
                    />

                    <Typography variant="subtitle1" fontWeight={600} mt={3} mb={1}>Exercises (Ordered List)</Typography>
                    
                    <Autocomplete
                        options={allExercises}
                        getOptionLabel={(option) => option.name}
                        onChange={(_, newValue) => handleAddExercise(newValue)}
                        renderInput={(params) => (
                            <TextField {...params} label="Search and Add Exercise" placeholder="Type exercise name..." />
                        )}
                        sx={{ mb: 2 }}
                        value={null}
                    />

                    <List sx={{ pt: 0 }}>
                        {templateExercises.map((ex, index) => (
                            <Paper key={index} variant="outlined" sx={{ mb: 1, p: 1, position: 'relative' }}>
                                <Box display="flex" alignItems="flex-start" gap={2}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{index + 1}.</Typography>
                                    <Box flexGrow={1}>
                                        <Typography variant="subtitle2" fontWeight={600}>{getExerciseName(ex.exerciseId)}</Typography>
                                        <TextField
                                            label="Notes (Sets, Reps, etc.)"
                                            size="small"
                                            fullWidth
                                            margin="dense"
                                            value={ex.note || ''}
                                            onChange={(e) => handleUpdateNote(index, e.target.value)}
                                            placeholder="e.g. 3x12, tempo 2-0-1-0"
                                        />
                                    </Box>
                                    <IconButton size="small" color="error" onClick={() => handleRemoveExercise(index)}>
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Paper>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave} disabled={saving || !name.trim()}>
                        {saving ? 'Saving...' : 'Save Template'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default TemplatesSection;
