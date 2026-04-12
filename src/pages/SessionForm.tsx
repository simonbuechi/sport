import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Autocomplete from '@mui/material/Autocomplete';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';

import { useAuth } from '../context/AuthContext';
import { useExercises } from '../context/ExercisesContext';
import { createJournalEntry, updateJournalEntry, getJournalEntries, getTemplates } from '../services/db';
import type { ActivityLog as JournalEntry, Exercise, SessionType, SessionExercise, ExerciseSet, TrainingTemplate } from '../types';
import SessionExerciseItem from '../components/journal/SessionExerciseItem';

const SESSION_TYPES: SessionType[] = ['strength', 'cardio', 'flexibility', 'other'];

const SessionForm = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { exercises, loading: exercisesLoading } = useExercises();
    const isEditing = Boolean(id);

    const [loading, setLoading] = useState(isEditing);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [templates, setTemplates] = useState<TrainingTemplate[]>([]);

    // Form state
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
    const [length, setLength] = useState<number | ''>('');
    const [sessionType, setSessionType] = useState<SessionType>('strength');
    const [comment, setComment] = useState('');
    const [maxPulse, setMaxPulse] = useState<number | ''>('');
    const [sessionExercises, setSessionExercises] = useState<SessionExercise[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) return;
            try {
                setLoading(true);
                
                // Fetch templates
                const templatesData = await getTemplates(currentUser.uid);
                setTemplates(templatesData);
                
                // If editing, fetch existing entry
                if (isEditing && id) {
                    const entries = await getJournalEntries(currentUser.uid);
                    const entry = entries.find(e => e.id === id);
                    
                    if (entry) {
                        setDate(entry.date);
                        setTime(entry.time ?? '');
                        setLength(entry.length ?? '');
                        setSessionType(entry.sessionType ?? 'strength');
                        setMaxPulse(entry.maxPulse ?? '');
                        setComment(entry.comment);

                        if (entry.exercises && entry.exercises.length > 0) {
                            setSessionExercises(entry.exercises);
                        } else if (entry.exerciseIds.length > 0) {
                            setSessionExercises(entry.exerciseIds.map(eId => ({
                                exerciseId: eId,
                                sets: []
                            })));
                        }
                    } else {
                        setError('Session not found');
                    }
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load session data');
            } finally {
                setLoading(false);
            }
        };

        void fetchData();
    }, [currentUser, id, isEditing]);

    const handleAddExercise = (exercise: Exercise | null) => {
        if (!exercise) return;
        if (sessionExercises.find(se => se.exerciseId === exercise.id)) return;
        setSessionExercises(prev => [...prev, {
            exerciseId: exercise.id,
            sets: [{ id: Math.random().toString(36).slice(2, 11), weight: 0, reps: 0 }]
        }]);
    };

    const handleRemoveExercise = (exerciseId: string) => {
        setSessionExercises(prev => prev.filter(se => se.exerciseId !== exerciseId));
    };

    const handleAddSet = (exerciseId: string) => {
        setSessionExercises(prev => prev.map(se =>
            se.exerciseId === exerciseId
                ? { ...se, sets: [...se.sets, { id: Math.random().toString(36).slice(2, 11), weight: 0, reps: 0 }] }
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
    
    const handleUpdateExerciseNote = (exerciseId: string, note: string) => {
        setSessionExercises(prev => prev.map(se =>
            se.exerciseId === exerciseId
                ? { ...se, note }
                : se
        ));
    };

    const handleTemplateChange = (templateId: string) => {
        setSelectedTemplateId(templateId);
        if (!templateId) return;

        const template = templates.find(t => t.id === templateId);
        if (template?.exercises) {
            const mappedExercises: SessionExercise[] = template.exercises.map(te => ({
                exerciseId: te.exerciseId,
                note: te.note,
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

            const filteredExercises = sessionExercises.map(se => ({
                ...se,
                sets: se.sets.filter(s => s.weight !== undefined && s.reps !== undefined)
            }));

            const entryData: Omit<JournalEntry, 'id' | 'userId'> = {
                date,
                time: time || undefined,
                length: Number(length) || undefined,
                sessionType,
                maxPulse: Number(maxPulse) || undefined,
                comment: comment.trim(),
                exerciseIds: filteredExercises.map(se => se.exerciseId),
                exercises: filteredExercises
            };

            if (isEditing && id) {
                await updateJournalEntry(currentUser.uid, id, entryData);
            } else {
                await createJournalEntry(currentUser.uid, entryData);
            }

            void navigate('/journal');
        } catch (err) {
            console.error('Error saving session:', err);
            setError(`Failed to save session: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || (exercisesLoading && exercises.length === 0)) return (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}><CircularProgress /></Box>
    );

    return (
        <Container maxWidth="lg">
            <Box sx={{ py: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" component="h1">
                        {isEditing ? 'Edit session' : 'New session'}
                    </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    label="Date"
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
                                    label="Time"
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
                                    select
                                    label="Session Type"
                                    fullWidth
                                    size="small"
                                    value={sessionType}
                                    onChange={(e) => { setSessionType(e.target.value as SessionType); }}
                                >
                                    {SESSION_TYPES.map((type) => (
                                        <MenuItem key={type} value={type} sx={{ textTransform: 'capitalize' }}>
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
                                    size="small"
                                    value={length}
                                    onChange={(e) => { setLength(e.target.value === '' ? '' : Number(e.target.value)); }}
                                    slotProps={{ htmlInput: { min: 0 } }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Max Pulse"
                                    type="number"
                                    fullWidth
                                    size="small"
                                    value={maxPulse}
                                    onChange={(e) => { setMaxPulse(e.target.value === '' ? '' : Number(e.target.value)); }}
                                    slotProps={{ htmlInput: { min: 0 } }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" gutterBottom>Exercises & Sets</Typography>
                                
                                <Grid container spacing={2} sx={{ mb: 3 }}>
                                    {!isEditing && (
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                select
                                                label="Use Template"
                                                fullWidth
                                                size="small"
                                                value={selectedTemplateId}
                                                onChange={(e) => { handleTemplateChange(e.target.value); }}
                                                helperText="Prepopulates session"
                                            >
                                                <MenuItem value=""><em>None</em></MenuItem>
                                                {templates.sort((a, b) => {
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
                                    <Grid size={{ xs: 12, sm: isEditing ? 12 : 6 }}>
                                        <Autocomplete
                                            key={sessionExercises.length}
                                            size="small"
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
                                            value={null}
                                        />
                                    </Grid>
                                </Grid>

                                {sessionExercises.map((se) => {
                                    const exercise = exercises.find(ex => ex.id === se.exerciseId);
                                    return (
                                        <SessionExerciseItem
                                            key={se.exerciseId}
                                            sessionExercise={se}
                                            exercise={exercise}
                                            onRemoveExercise={handleRemoveExercise}
                                            onAddSet={handleAddSet}
                                            onUpdateSet={handleUpdateSet}
                                            onRemoveSet={handleRemoveSet}
                                            onUpdateExerciseNote={handleUpdateExerciseNote}
                                        />
                                    );
                                })}
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    label="Notes / Comments"
                                    multiline
                                    rows={4}
                                    fullWidth
                                    size="small"
                                    value={comment}
                                    onChange={(e) => { setComment(e.target.value); }}
                                    placeholder="What went well? What needs work?"
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
                                    <Button variant="outlined" onClick={() => navigate('/journal')}>
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        variant="contained" 
                                        color="primary" 
                                        disabled={submitting}
                                        sx={{ minWidth: 150 }}
                                    >
                                        {submitting ? 'Saving...' : (isEditing ? 'Update Session' : 'Add Session')}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default SessionForm;
