import { useState, useEffect } from 'react';
import {
    Typography, Box, Button, Grid, TextField,
    Dialog, DialogTitle, DialogContent, DialogActions,
    IconButton, List, Autocomplete, Chip, Tooltip,
    Accordion, AccordionSummary, AccordionDetails,
    Checkbox, FormControlLabel
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Close as CloseIcon, Search as SearchIcon, DragIndicator as DragIcon, ExpandMore as ExpandMoreIcon, NoteAdd as NoteAddIcon, Star as StarIcon } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from '../../services/db';
import type { TrainingTemplate, Exercise } from '../../types';

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
    const [templateNotes, setTemplateNotes] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);
    const [isArchived, setIsArchived] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeSearchId, setActiveSearchId] = useState<string | null>(null);
    const [editingNotePath, setEditingNotePath] = useState<{ tid: string, idx: number } | null>(null);
    const [isSetDialogOpen, setIsSetDialogOpen] = useState(false);
    const [setDialogData, setSetDialogData] = useState<{
        tid: string;
        exerciseIdx: number;
        setIdx?: number;
        weight: number;
        reps: number;
        count: number;
    } | null>(null);

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
            setTemplateNotes(template.notes || '');
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

        const newExercises = [...(template.exercises || []), { exerciseId: exercise.id, note: '' }];
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
            weight: existingSet?.weight || 0,
            reps: existingSet?.reps || 0,
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
        const newSets = [...(exercise.sets || [])];

        if (setIdx !== undefined) {
            // Edit existing set
            newSets[setIdx] = { ...newSets[setIdx], weight, reps };
        } else {
            // Add new set(s)
            for (let i = 0; i < count; i++) {
                newSets.push({
                    id: Math.random().toString(36).substr(2, 9),
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

    const getExerciseName = (id: string) => {
        return allExercises.find(ex => ex.id === id)?.name || 'Unknown Exercise';
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
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
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
                            <Accordion 
                                elevation={4} 
                                sx={{ 
                                    borderRadius: '12px !important', 
                                    border: '1px solid', 
                                    borderColor: 'divider',
                                    mb: 2,
                                    opacity: template.isArchived ? 0.6 : 1,
                                    bgcolor: template.isArchived ? 'action.hover' : 'background.paper',
                                    '&:before': { display: 'none' } 
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    sx={{ 
                                        px: 3, 
                                        py: 1,
                                        '& .MuiAccordionSummary-content': { 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center' 
                                        } 
                                    }}
                                >
                                    <Box>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1
                                            }}>
                                            {template.isFavorite && <StarIcon color="warning" fontSize="small" />}
                                            <Typography variant="h6" color="primary" sx={{
                                                fontWeight: 700
                                            }}>
                                                {template.name}
                                                {template.isArchived && " (Archived)"}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" sx={{
                                            color: "text.secondary"
                                        }}>
                                            {template.exercises?.length || 0} exercises
                                            {template.notes && ` • ${template.notes}`}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ mr: 2 }} onClick={(e) => e.stopPropagation()}>
                                        <Tooltip title="Edit Template">
                                            <IconButton size="small" onClick={() => handleOpenDialog(template)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </AccordionSummary>

                                <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                                    <Box sx={{ mt: 1 }}>
                                        {template.exercises?.length > 0 ? (
                                            <DragDropContext onDragEnd={(result) => handleOnDragEnd(result, template.id)}>
                                                <Droppable droppableId={template.id}>
                                                    {(provided) => (
                                                        <List {...provided.droppableProps} ref={provided.innerRef} sx={{ p: 0 }}>
                                                            {template.exercises.map((ex, idx) => (
                                                                <Draggable key={`${template.id}-${idx}`} draggableId={`${template.id}-${idx}`} index={idx}>
                                                                    {(provided, snapshot) => (
                                                                        <Box
                                                                            ref={provided.innerRef}
                                                                            {...provided.draggableProps}
                                                                            sx={{ 
                                                                                display: 'flex', 
                                                                                alignItems: 'flex-start', 
                                                                                gap: 1.5, 
                                                                                py: 1.5,
                                                                                px: 1,
                                                                                borderRadius: 1,
                                                                                bgcolor: snapshot.isDragging ? 'action.selected' : 'transparent',
                                                                                '&:hover': { bgcolor: snapshot.isDragging ? 'action.selected' : 'action.hover' },
                                                                                borderBottom: idx < template.exercises.length - 1 ? '1px dashed' : 'none',
                                                                                borderColor: 'divider',
                                                                                position: 'relative'
                                                                            }}
                                                                        >
                                                                            <Box 
                                                                                {...provided.dragHandleProps}
                                                                                sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 24, cursor: 'grab', color: 'text.secondary' }}
                                                                            >
                                                                                <DragIcon sx={{ fontSize: 20 }} />
                                                                            </Box>

                                                                            <Box sx={{
                                                                                flexGrow: 1
                                                                            }}>
                                                                                <Typography variant="body1" sx={{
                                                                                    fontWeight: 700
                                                                                }}>{getExerciseName(ex.exerciseId)}</Typography>
                                                                                
                                                                                {/* Sets List */}
                                                                                {ex.sets && ex.sets.length > 0 && (
                                                                                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                                                        {ex.sets.map((set, sIdx) => (
                                                                                            <Chip
                                                                                                key={set.id}
                                                                                                variant="outlined"
                                                                                                size="small"
                                                                                                label={`${set.weight}kg x ${set.reps}`}
                                                                                                onClick={() => handleOpenSetDialog(template.id, idx, sIdx)}
                                                                                                sx={{ borderRadius: '4px' }}
                                                                                            />
                                                                                        ))}
                                                                                    </Box>
                                                                                )}

                                                                                {editingNotePath?.tid === template.id && editingNotePath?.idx === idx ? (
                                                                                    <TextField
                                                                                        autoFocus
                                                                                        fullWidth
                                                                                        multiline
                                                                                        rows={2}
                                                                                        defaultValue={ex.note}
                                                                                        onBlur={(e) => handleInlineUpdateNote(template.id, idx, e.target.value)}
                                                                                        sx={{ mt: 1 }}
                                                                                        placeholder="Add sets/reps notes..."
                                                                                    />
                                                                                ) : ex.note ? (
                                                                                    <Typography
                                                                                        variant="body2"
                                                                                        onClick={() => setEditingNotePath({ tid: template.id, idx })}
                                                                                        sx={{
                                                                                            color: "text.secondary",
                                                                                            display: "block",
                                                                                            cursor: 'pointer',
                                                                                            mt: 0.5
                                                                                        }}>
                                                                                        {ex.note}
                                                                                    </Typography>
                                                                                ) : null}
                                                                            </Box>

                                                                            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                                                                <Button 
                                                                                    size="small" 
                                                                                    startIcon={<AddIcon />} 
                                                                                    onClick={() => handleOpenSetDialog(template.id, idx)}
                                                                                    sx={{ whiteSpace: 'nowrap' }}
                                                                                >
                                                                                    Set
                                                                                </Button>
                                                                                {!ex.note && (
                                                                                    <Tooltip title="Add notes">
                                                                                        <IconButton size="small" onClick={() => setEditingNotePath({ tid: template.id, idx })}>
                                                                                            <NoteAddIcon fontSize="small" />
                                                                                        </IconButton>
                                                                                    </Tooltip>
                                                                                )}
                                                                                <Tooltip title="Remove Exercise">
                                                                                    <IconButton 
                                                                                        size="small" 
                                                                                        color="error" 
                                                                                        onClick={() => handleInlineRemove(template.id, idx)}
                                                                                        sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
                                                                                    >
                                                                                        <DeleteIcon fontSize="inherit" />
                                                                                    </IconButton>
                                                                                </Tooltip>
                                                                            </Box>
                                                                        </Box>
                                                                    )}
                                                                </Draggable>
                                                            ))}
                                                            {provided.placeholder}
                                                        </List>
                                                    )}
                                                </Droppable>
                                            </DragDropContext>
                                        ) : (
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    color: "text.secondary",
                                                    fontStyle: 'italic',
                                                    py: 2
                                                }}>
                                                No exercises. Start by adding one below.
                                            </Typography>
                                        )}

                                        <Box sx={{ mt: 2 }}>
                                            {activeSearchId === template.id ? (
                                                <Box sx={{ p: 2, bgcolor: 'action.selected', borderRadius: 2 }}>
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            alignItems: "center",
                                                            mb: 1
                                                        }}>
                                                        <Typography variant="body2" sx={{
                                                            fontWeight: 700
                                                        }}>Search Exercise</Typography>
                                                        <Tooltip title="Close Search">
                                                            <IconButton size="small" onClick={() => setActiveSearchId(null)}>
                                                                <CloseIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                    <Autocomplete
                                                        autoFocus
                                                        options={allExercises}
                                                        getOptionLabel={(option) => option.name}
                                                        onChange={(_, newValue) => handleInlineAdd(template.id, newValue)}
                                                        renderInput={(params) => (
                                                            <TextField {...params} placeholder="Bench Press, Squats..." 
                                                                slotProps={{
                                                                    ...params.slotProps,
                                                                    input: {...params.slotProps.input, startAdornment: <SearchIcon color="action" sx={{ mr: 1, fontSize: 18 }} />}
                                                                }}
                                                            />
                                                        )}
                                                        value={null}
                                                        openOnFocus
                                                    />
                                                </Box>
                                            ) : (
                                                <Button 
                                                    startIcon={<AddIcon />} 
                                                    onClick={() => setActiveSearchId(template.id)}
                                                    variant="text"
                                                    color="primary"
                                                    sx={{ fontWeight: 600 }}
                                                >
                                                    Add Exercise
                                                </Button>
                                            )}
                                        </Box>
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        </Grid>
                    ))}
                </Grid>
            )}
            <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editingTemplate ? 'Rename Template' : 'Create Template'}</DialogTitle>
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
                    <TextField
                        label="Notes"
                        fullWidth
                        multiline
                        rows={3}
                        margin="normal"
                        value={templateNotes}
                        onChange={(e) => setTemplateNotes(e.target.value)}
                        placeholder="General notes about this routine..."
                    />
                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                        <FormControlLabel
                            control={<Checkbox checked={isFavorite} onChange={(e) => setIsFavorite(e.target.checked)} color="warning" />}
                            label="Favorite"
                        />
                        <FormControlLabel
                            control={<Checkbox checked={isArchived} onChange={(e) => setIsArchived(e.target.checked)} />}
                            label="Archived"
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, bgcolor: 'grey.50', justifyContent: editingTemplate ? 'space-between' : 'flex-end' }}>
                    {editingTemplate && (
                        <Button color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(editingTemplate.id)}>
                            Delete
                        </Button>
                    )}
                    <Box>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button variant="contained" onClick={handleSave} disabled={saving || !name.trim()}>
                            {saving ? 'Saving...' : (editingTemplate ? 'Save Name' : 'Create Template')}
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>
            {/* Set Dialog */}
            <Dialog open={isSetDialogOpen} onClose={() => setIsSetDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>{setDialogData?.setIdx !== undefined ? 'Edit Set' : 'Add Set(s)'}</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1 }}>
                        <TextField
                            label="Weight (kg)"
                            type="number"
                            fullWidth
                            value={setDialogData?.weight || ''}
                            onChange={(e) => setSetDialogData(prev => prev ? { ...prev, weight: Number(e.target.value) } : null)}
                            autoFocus
                        />
                        <TextField
                            label="Reps"
                            type="number"
                            fullWidth
                            value={setDialogData?.reps || ''}
                            onChange={(e) => setSetDialogData(prev => prev ? { ...prev, reps: Number(e.target.value) } : null)}
                        />
                        {setDialogData?.setIdx === undefined && (
                            <TextField
                                label="Number of Sets"
                                type="number"
                                fullWidth
                                value={setDialogData?.count || 1}
                                onChange={(e) => setSetDialogData(prev => prev ? { ...prev, count: Number(e.target.value) } : null)}
                                helperText="Adds this set multiple times"
                            />
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, bgcolor: 'grey.50', justifyContent: setDialogData?.setIdx !== undefined ? 'space-between' : 'flex-end' }}>
                    {setDialogData?.setIdx !== undefined && (
                        <Button color="error" startIcon={<DeleteIcon />} onClick={() => handleRemoveSetFromTemplate(setDialogData.tid, setDialogData.exerciseIdx, setDialogData.setIdx!)}>
                            Delete
                        </Button>
                    )}
                    <Box>
                        <Button onClick={() => setIsSetDialogOpen(false)}>Cancel</Button>
                        <Button variant="contained" onClick={handleSaveSet} color="primary">
                            {setDialogData?.setIdx !== undefined ? 'Save' : 'Add'}
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TemplatesSection;
