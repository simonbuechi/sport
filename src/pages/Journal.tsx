import { useState, useEffect } from 'react';
import {
    Typography, Box, Container, Paper, TextField,
    Button, CircularProgress, Alert, Grid, Divider, IconButton,
    List, Chip, Autocomplete, MenuItem, Rating,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useExercises } from '../context/ExercisesContext';
import { getJournalEntries, createJournalEntry, updateJournalEntry, deleteJournalEntry } from '../services/db';
import type { ActivityLog as JournalEntry, Exercise, SessionType } from '../types';

const SESSION_TYPES: SessionType[] = ['Gym', 'Run', 'Cycle', 'Swim', 'Yoga', 'Other'];

const Journal = () => {
    const { currentUser } = useAuth();
    const { exercises: allExercises, loadExercises } = useExercises();

    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // New entry form state
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState('');
    const [length, setLength] = useState<number | ''>(60);
    const [sessionType, setSessionType] = useState<SessionType>('Gym');
    const [intensity, setIntensity] = useState<number | null>(3);

    const [comment, setComment] = useState('');
    const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
    const [submitting, setSubmitting] = useState(false);

    // Edit and Delete state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
    const [formDialogOpen, setFormDialogOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) return;
            try {
                setLoading(true);
                // Trigger context load if needed
                loadExercises();
                const entriesData = await getJournalEntries(currentUser.uid);
                setEntries(entriesData);
            } catch (err) {
                console.error(err);
                setError('Failed to load journal data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser, loadExercises]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        try {
            setSubmitting(true);
            setError('');

            const entryData: Omit<JournalEntry, 'id' | 'userId'> = {
                date,
                time,
                length: length || undefined,
                sessionType,
                intensity: intensity || undefined,
                comment,
                exerciseIds: selectedExercises.map(t => t.id)
            };

            if (editingId) {
                await updateJournalEntry(currentUser.uid, editingId, entryData);
                setEntries(prev => prev.map(entry =>
                    entry.id === editingId ? { ...entry, ...entryData } : entry
                ));
            } else {
                const newId = await createJournalEntry(currentUser.uid, entryData);
                setEntries(prev => [{ id: newId, userId: currentUser.uid, ...entryData }, ...prev]);
            }

            // Reset form
            handleCancelEdit();

        } catch (err) {
            console.error(err);
            setError(editingId ? 'Failed to update journal entry' : 'Failed to save journal entry');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditClick = (entry: JournalEntry) => {
        setEditingId(entry.id);
        setDate(entry.date);
        setTime(entry.time || '');
        setLength(entry.length || '');
        setSessionType(entry.sessionType || 'Gym');
        setIntensity(entry.intensity || null);
        setComment(entry.comment || '');

        if (entry.exerciseIds && entry.exerciseIds.length > 0) {
            const selectedExes = entry.exerciseIds
                .map((id: string) => allExercises.find((t: Exercise) => t.id === id))
                .filter((t: Exercise | undefined): t is Exercise => t !== undefined);
            setSelectedExercises(selectedExes);
        } else {
            setSelectedExercises([]);
        }
        setFormDialogOpen(true);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setDate(new Date().toISOString().split('T')[0]);
        setTime('');
        setComment('');
        setSelectedExercises([]);
        setLength(60);
        setIntensity(3);
        setSessionType('Gym');
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
        const t = allExercises.find((tech: Exercise) => tech.id === id);
        return t ? t.name : 'Unknown Exercise';
    };

    if (loading) return <Box display="flex" justifyContent="center" mt={8}><CircularProgress /></Box>;

    return (
        <Container maxWidth="md">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} mt={2}>
                <Typography variant="h4" component="h1">
                    Journal
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        handleCancelEdit();
                        setFormDialogOpen(true);
                    }}
                >
                    Add Session
                </Button>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Dialog open={formDialogOpen} onClose={handleCancelEdit} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>{editingId ? 'Edit Session' : 'Log Session'}</DialogTitle>
                    <DialogContent dividers>
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                        <Box sx={{ mt: 1 }}>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        label="Date"
                                        type="date"
                                        fullWidth
                                        margin="normal"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        required
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        label="Time"
                                        type="time"
                                        fullWidth
                                        margin="normal"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        InputLabelProps={{ shrink: true }}
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
                                        onChange={(e) => setSessionType(e.target.value as SessionType)}
                                    >
                                        {SESSION_TYPES.map((type) => (
                                            <MenuItem key={type} value={type}>
                                                {type}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        label="Length (min)"
                                        type="number"
                                        fullWidth
                                        value={length}
                                        onChange={(e) => setLength(e.target.value === '' ? '' : Number(e.target.value))}
                                        inputProps={{ min: 0, step: 15 }}
                                    />
                                </Grid>
                            </Grid>

                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography component="legend" sx={{ mr: 2 }}>Intensity</Typography>
                                    <Rating
                                        name="intensity"
                                        value={intensity}
                                        onChange={(_, newValue) => setIntensity(newValue)}
                                    />
                                </Box>

                            <Autocomplete
                                multiple
                                options={allExercises}
                                getOptionLabel={(option) => option.name}
                                value={selectedExercises}
                                onChange={(_, newValue) => setSelectedExercises(newValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="outlined"
                                        label="Exercises Covered"
                                        placeholder="Search exercises..."
                                        margin="normal"
                                    />
                                )}
                                sx={{ mb: 2, mt: 1 }}
                            />

                            <TextField
                                label="Notes / Comments"
                                multiline
                                rows={4}
                                fullWidth
                                margin="normal"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="What went well? What needs work?"
                            />

                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={handleCancelEdit} color="secondary" disabled={submitting}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" color="primary" disabled={submitting}>
                            {submitting ? 'Saving...' : (editingId ? 'Update Entry' : 'Save Entry')}
                        </Button>
                    </DialogActions>
                </form>
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
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                    <Typography variant="h6" color="primary">
                                        {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                        {entry.time && ` • ${entry.time}`}
                                    </Typography>
                                    <Box>
                                        <IconButton size="small" onClick={() => handleEditClick(entry)} color="primary">
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => handleDeleteClick(entry.id)} color="error">
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>

                                <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                                    {entry.sessionType && (
                                        <Chip size="small" label={entry.sessionType} color="primary" variant="outlined" />
                                    )}
                                    {entry.length && (
                                        <Chip size="small" label={`${entry.length} min`} variant="outlined" />
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
                                </Box>

                                {entry.exerciseIds && entry.exerciseIds.length > 0 && (
                                    <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                                        {entry.exerciseIds.map((id: string) => (
                                            <Chip key={id} label={getExerciseName(id)} size="small" variant="outlined" />
                                        ))}
                                    </Box>
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
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete Journal Entry</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this training session? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Journal;
