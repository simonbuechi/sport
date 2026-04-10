import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import MenuItem from '@mui/material/MenuItem';
import Rating from '@mui/material/Rating';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../context/AuthContext';
import { useExercises } from '../context/ExercisesContext';
import { getJournalEntries, createJournalEntry, updateJournalEntry, deleteJournalEntry, getTemplates } from '../services/db';
import type { ActivityLog as JournalEntry, Exercise, SessionType, SessionExercise, ExerciseSet, TrainingTemplate } from '../types';

const SESSION_TYPES: SessionType[] = ['Gym', 'Run', 'Cycle', 'Swim', 'Yoga', 'Other'];

const Journal = () => {
    const { currentUser } = useAuth();
    const { exercises, loading: exercisesLoading, loadExercises } = useExercises();

    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [templates, setTemplates] = useState<TrainingTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

    // New entry form state
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
    const [length, setLength] = useState<number | ''>(60);
    const [sessionType, setSessionType] = useState<SessionType>('Gym');
    const [intensity, setIntensity] = useState<number | null>(3);

    const [comment, setComment] = useState('');
    const [maxPulse, setMaxPulse] = useState<number | ''>('');
    const [sessionExercises, setSessionExercises] = useState<SessionExercise[]>([]);
    const [submitting, setSubmitting] = useState(false);

    // Edit and Delete state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
    const [formDialogOpen, setFormDialogOpen] = useState(false);

    // Exercise management helpers
    const handleAddExercise = (exercise: Exercise | null) => {
        if (!exercise) return;
        if (sessionExercises.find(se => se.exerciseId === exercise.id)) return;
        setSessionExercises(prev => [...prev, {
            exerciseId: exercise.id,
            sets: [{ id: Date.now().toString(), weight: 0, reps: 0 }]
        }]);
    };

    const handleRemoveExercise = (exerciseId: string) => {
        setSessionExercises(prev => prev.filter(se => se.exerciseId !== exerciseId));
    };

    const handleAddSet = (exerciseId: string) => {
        setSessionExercises(prev => prev.map(se =>
            se.exerciseId === exerciseId
                ? { ...se, sets: [...se.sets, { id: Date.now().toString(), weight: 0, reps: 0 }] }
                : se
        ));
    };

    const handleRemoveSet = (exerciseId: string, setId: string) => {
        setSessionExercises(prev => prev.map(se =>
            se.exerciseId === exerciseId
                ? { ...se, sets: se.sets.filter(s => s.id !== setId) }
                : se
        ));
    };

    const handleUpdateSet = (exerciseId: string, setId: string, updates: Partial<ExerciseSet>) => {
        setSessionExercises(prev => prev.map(se =>
            se.exerciseId === exerciseId
                ? { ...se, sets: se.sets.map(s => s.id === setId ? { ...s, ...updates } : s) }
                : se
        ));
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) return;
            try {
                setLoading(true);
                
                const [entriesData, templatesData] = await Promise.all([
                    getJournalEntries(currentUser.uid),
                    getTemplates(currentUser.uid),
                    loadExercises()
                ]);
                
                setEntries(entriesData);
                setTemplates(templatesData);
            } catch (err) {
                console.error(err);
                setError('Failed to load journal data');
            } finally {
                setLoading(false);
            }
        };

        void fetchData();
    }, [currentUser, loadExercises]);

    const handleTemplateChange = (templateId: string) => {
        setSelectedTemplateId(templateId);
        if (!templateId) {
            setSessionExercises([]);
            return;
        }

        const template = templates.find(t => t.id === templateId);
        if (template?.exercises) {
            const mappedExercises: SessionExercise[] = template.exercises.map(te => ({
                exerciseId: te.exerciseId,
                sets: te.sets?.map(s => ({
                    id: Math.random().toString(36).slice(2, 11),
                    weight: s.weight ?? 0,
                    reps: s.reps ?? 0,
                    notes: s.notes ?? ''
                })) ?? [{ id: Math.random().toString(36).slice(2, 11), weight: 0, reps: 0 }]
            }));
            setSessionExercises(mappedExercises);
        }
    };

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        try {
            setSubmitting(true);
            setError('');

            // Filter out empty sets or exercises with no sets if necessary
            // For now, keep as is but focus on field mapping
            const filteredExercises = sessionExercises.map(se => ({
                ...se,
                sets: se.sets.filter(s => s.weight !== undefined && s.reps !== undefined)
            }));

            const entryData: Omit<JournalEntry, 'id' | 'userId'> = {
                date,
                time: time || undefined,
                length: Number(length) || undefined,
                sessionType,
                intensity: intensity ?? undefined,
                maxPulse: Number(maxPulse) || undefined,
                comment: comment.trim(),
                exerciseIds: filteredExercises.map(se => se.exerciseId),
                exercises: filteredExercises
            };
            
            console.log('Submitting Journal Entry:', JSON.stringify(entryData, null, 2));

            if (editingId) {
                await updateJournalEntry(currentUser.uid, editingId, entryData);
                setEntries(prev => prev.map(entry =>
                    entry.id === editingId ? { ...entry, ...entryData } : entry
                ));
            } else {
                const newId = await createJournalEntry(currentUser.uid, entryData);
                setEntries(prev => [{ id: newId, userId: currentUser.uid, ...entryData }, ...prev]);
            }

            // Reset form and close
            handleCancelEdit();

        } catch (err) {
            console.error('Error during journal submission:', err);
            setError(editingId ? `Failed to update session: ${err instanceof Error ? err.message : String(err)}` : `Failed to save session: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditClick = (entry: JournalEntry) => {
        setEditingId(entry.id);
        setDate(entry.date);
        setTime(entry.time ?? '');
        setLength(entry.length ?? '');
        setSessionType(entry.sessionType ?? 'Gym');
        setIntensity(entry.intensity ?? null);
        setMaxPulse(entry.maxPulse ?? '');
        setComment(entry.comment);

        if (entry.exercises && entry.exercises.length > 0) {
            setSessionExercises(entry.exercises);
        } else if (entry.exerciseIds.length > 0) {
            // Fallback for legacy entries
            setSessionExercises(entry.exerciseIds.map(id => ({
                exerciseId: id,
                sets: []
            })));
        } else {
            setSessionExercises([]);
        }
        setFormDialogOpen(true);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setDate(new Date().toISOString().split('T')[0]);
        setTime(new Date().toTimeString().slice(0, 5));
        setComment('');
        setLength(60);
        setIntensity(3);
        setMaxPulse('');
        setSessionType('Gym');
        setSessionExercises([]);
        setSelectedTemplateId('');
        setError('');
        setFormDialogOpen(false);
    };

    const handleDeleteClick = (id: string) => {
        setEntryToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!currentUser || !entryToDelete) return;

        try {
            await deleteJournalEntry(currentUser.uid, entryToDelete);
            setEntries(prev => prev.filter(entry => entry.id !== entryToDelete));
            setDeleteDialogOpen(false);
            setEntryToDelete(null);

            // If the deleted entry was being edited, cancel the edit
            if (editingId === entryToDelete) {
                handleCancelEdit();
            }
        } catch (err) {
            console.error(err);
            setError('Failed to delete journal entry');
        }
    };

    // Helper to get exercise name by ID
    const getExerciseName = (id: string) => {
        const t = exercises.find((tech: Exercise) => tech.id === id);
        return t ? t.name : 'Unknown Exercise';
    };

    if (loading || (exercisesLoading && exercises.length === 0)) return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                mt: 8
            }}><CircularProgress /></Box>
    );

    return (
        <Container maxWidth="md">
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                    mt: 2
                }}>
                <Typography variant="h4" component="h1">
                    Journal
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        handleCancelEdit();
                        setFormDialogOpen(true);
                    }}
                >
                    Add Session
                </Button>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Dialog 
                open={formDialogOpen} 
                onClose={handleCancelEdit}
                maxWidth="md"
                fullWidth
                scroll="paper"
                slotProps={{
                    paper: {
                        component: 'form',
                        onSubmit: (e: React.SyntheticEvent) => { void handleSubmit(e); },
                    }
                }}
            >
                <DialogTitle>
                    {editingId ? 'Edit Session' : 'Log Session'}
                </DialogTitle>
                <DialogContent dividers>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Date"
                                type="date"
                                fullWidth
                                margin="normal"
                                value={date}
                                onChange={(e) => { setDate(e.target.value); }}
                                required
                                slotProps={{
                                    inputLabel: { shrink: true }
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Time"
                                type="time"
                                fullWidth
                                margin="normal"
                                value={time}
                                onChange={(e) => { setTime(e.target.value); }}
                                slotProps={{
                                    inputLabel: { shrink: true }
                                }}
                            />
                        </Grid>
                    </Grid>

                    <Grid container spacing={2} sx={{ mt: 1, mb: 1 }}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                select
                                label="Session Type"
                                fullWidth
                                value={sessionType}
                                onChange={(e) => { setSessionType(e.target.value as SessionType); }}
                            >
                                {SESSION_TYPES.map((type) => (
                                    <MenuItem key={type} value={type}>
                                        {type}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        {!editingId && (
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    select
                                    label="Use Template"
                                    fullWidth
                                    value={selectedTemplateId}
                                    onChange={(e) => { handleTemplateChange(e.target.value); }}
                                    helperText="Prepopulates exercises and sets"
                                >
                                    <MenuItem value=""><em>None</em></MenuItem>
                                    {[...templates].sort((a, b) => {
                                        if (a.isFavorite && !b.isFavorite) return -1;
                                        if (!a.isFavorite && b.isFavorite) return 1;
                                        return a.name.localeCompare(b.name);
                                    }).map((t) => (
                                        <MenuItem key={t.id} value={t.id}>
                                            {t.isFavorite && '★ '}{t.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                        )}
                    </Grid>

                    <Grid container spacing={2} sx={{ mt: 1, mb: 1 }}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Length (min)"
                                type="number"
                                fullWidth
                                value={length}
                                onChange={(e) => { setLength(e.target.value === '' ? '' : Number(e.target.value)); }}
                                slotProps={{
                                    htmlInput: { min: 0, step: 15 }
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Max Pulse"
                                type="number"
                                fullWidth
                                value={maxPulse}
                                onChange={(e) => { setMaxPulse(e.target.value === '' ? '' : Number(e.target.value)); }}
                                slotProps={{
                                    htmlInput: { min: 0 }
                                }}
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 1 }}>
                        <Typography component="legend" sx={{ mr: 2 }}>Intensity</Typography>
                        <Rating
                            name="intensity"
                            value={intensity}
                            onChange={(_, newValue) => { setIntensity(newValue); }}
                        />
                    </Box>

                    <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" gutterBottom>Exercises & Sets</Typography>
                        
                        <Autocomplete
                            options={exercises.filter(ex => !sessionExercises.find(se => se.exerciseId === ex.id))}
                            getOptionLabel={(option) => option.name}
                            onChange={(_, newValue) => { handleAddExercise(newValue); }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="outlined"
                                    label="Add Exercise"
                                    placeholder="Search exercises..."
                                />
                            )}
                            sx={{ mb: 2 }}
                            value={null}
                        />

                        {sessionExercises.map((se) => {
                            const exercise = exercises.find(ex => ex.id === se.exerciseId);
                            return (
                                <Paper key={se.exerciseId} variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            mb: 1
                                        }}>
                                        <Typography variant="subtitle1" sx={{
                                            fontWeight: "bold"
                                        }}>
                                            {exercise?.name ?? 'Unknown Exercise'}
                                        </Typography>
                                        <IconButton size="small" onClick={() => { handleRemoveExercise(se.exerciseId); }} color="error">
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                    <Box sx={{ pl: 1 }}>
                                        {se.sets.map((set, index) => (
                                            <Grid
                                                container
                                                spacing={2}
                                                key={set.id}
                                                sx={{
                                                    alignItems: "center",
                                                    mb: 1
                                                }}>
                                                <Grid size={{ xs: 1 }}>
                                                    <Typography variant="body2" sx={{
                                                        color: "text.secondary"
                                                    }}>{index + 1}</Typography>
                                                </Grid>
                                                <Grid size={{ xs: 11, sm: 3 }}>
                                                    <TextField
                                                        label="Weight (kg)"
                                                        type="number"
                                                        size="small"
                                                        fullWidth
                                                        value={set.weight}
                                                        onChange={(e) => { handleUpdateSet(se.exerciseId, set.id, { weight: Number(e.target.value) }); }}
                                                    />
                                                </Grid>
                                                <Grid size={{ xs: 11, sm: 3 }}>
                                                    <TextField
                                                        label="Reps"
                                                        type="number"
                                                        size="small"
                                                        fullWidth
                                                        value={set.reps}
                                                        onChange={(e) => { handleUpdateSet(se.exerciseId, set.id, { reps: Number(e.target.value) }); }}
                                                    />
                                                </Grid>
                                                <Grid size={{ xs: 11, sm: 4 }}>
                                                    <TextField
                                                        label="Notes"
                                                        size="small"
                                                        fullWidth
                                                        value={set.notes ?? ''}
                                                        onChange={(e) => { handleUpdateSet(se.exerciseId, set.id, { notes: e.target.value }); }}
                                                    />
                                                </Grid>
                                                <Grid size={{ xs: 1 }}>
                                                    <IconButton size="small" onClick={() => { handleRemoveSet(se.exerciseId, set.id); }}>
                                                        <DeleteIcon fontSize="inherit" />
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                        ))}
                                        <Button 
                                            startIcon={<AddIcon />} 
                                            size="small" 
                                            onClick={() => { handleAddSet(se.exerciseId); }}
                                            sx={{ mt: 1 }}
                                        >
                                            Add Set
                                        </Button>
                                    </Box>
                                </Paper>
                            );
                        })}
                    </Box>

                    <TextField
                        label="Notes / Comments"
                        multiline
                        rows={3}
                        fullWidth
                        margin="normal"
                        value={comment}
                        onChange={(e) => { setComment(e.target.value); }}
                        placeholder="What went well? What needs work?"
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Button onClick={handleCancelEdit} color="secondary" disabled={submitting}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" color="primary" disabled={submitting}>
                        {submitting ? 'Saving...' : (editingId ? 'Update Entry' : 'Add Session')}
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Journal Entries List */}
            <Box>

                {entries.length === 0 ? (
                    <Alert severity="info" variant="outlined">
                        No journal entries yet. Start logging your training sessions!
                    </Alert>
                ) : (
                    <List sx={{ p: 0 }}>
                        {entries.map((entry) => (
                            <Paper key={entry.id} variant="outlined" sx={{ mb: 2, p: 2, borderRadius: 2 }}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        mb: 1
                                    }}>
                                    <Typography variant="h6" color="primary">
                                        {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                        {entry.time && ` • ${entry.time}`}
                                    </Typography>
                                    <Box>
                                        <IconButton size="small" onClick={() => { handleEditClick(entry); }} color="primary">
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => { handleDeleteClick(entry.id); }} color="error">
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>

                                <Box
                                    sx={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: 1,
                                        mb: 2
                                    }}>
                                    {entry.sessionType && (
                                        <Chip size="small" label={entry.sessionType} color="primary" variant="outlined" />
                                    )}
                                    {entry.length && (
                                        <Chip size="small" label={`${String(entry.length)} min`} variant="outlined" />
                                    )}
                                    {entry.intensity && (
                                        <Chip
                                            size="small"
                                            icon={<Rating value={entry.intensity} readOnly size="small" max={5} sx={{ fontSize: '1rem', ml: 0.5 }} />}
                                            label={`Intensity`}
                                            variant="outlined"
                                            sx={{ '& .MuiChip-icon': { color: 'gold' } }}
                                        />
                                    )}
                                    {entry.maxPulse && (
                                        <Chip size="small" label={`Max Pulse: ${String(entry.maxPulse)}`} variant="outlined" color="secondary" />
                                    )}
                                </Box>

                                {entry.exercises && entry.exercises.length > 0 ? (
                                    <Box sx={{
                                        mb: 2
                                    }}>
                                        {entry.exercises.map((se) => {
                                            const exercise = exercises.find(ex => ex.id === se.exerciseId);
                                            return (
                                                <Box key={se.exerciseId} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                                                    <Typography variant="subtitle2" color="primary" sx={{
                                                        fontWeight: "bold"
                                                    }}>
                                                        {exercise?.name ?? 'Unknown Exercise'}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                                                        {se.sets.map((set, idx) => (
                                                            <Typography key={set.id} variant="body2" sx={{ bgcolor: 'white', px: 1, py: 0.5, borderRadius: 0.5, border: '1px solid', borderColor: 'grey.300' }}>
                                                                Set {idx + 1}: {set.weight}kg x {set.reps} {set.notes && `(${set.notes})`}
                                                            </Typography>
                                                        ))}
                                                    </Box>
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                ) : (
                                    entry.exerciseIds.length > 0 && (
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexWrap: "wrap",
                                                gap: 1,
                                                mb: 2
                                            }}>
                                            {entry.exerciseIds.map((id: string) => (
                                                <Chip key={id} label={getExerciseName(id)} size="small" variant="outlined" />
                                            ))}
                                        </Box>
                                    )
                                )}

                                {entry.comment && (
                                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                                        {entry.comment}
                                    </Typography>
                                )}
                            </Paper>
                        ))}
                    </List>
                )}
            </Box>
            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => { setDeleteDialogOpen(false); }}>
                <DialogTitle>Delete Journal Entry</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this training session? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setDeleteDialogOpen(false); }}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Journal;
