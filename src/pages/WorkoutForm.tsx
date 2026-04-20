import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useAuth } from '../context/AuthContext';
import { useExercises } from '../context/ExercisesContext';
import { useWorkouts } from '../context/WorkoutsContext';
import { createWorkout, updateWorkout } from '../services/db';
import type { Workout, Exercise, WorkoutType, WorkoutExercise, ExerciseSet } from '../types';
import WorkoutExerciseItem from '../components/journal/WorkoutExerciseItem';
import PageLoader from '../components/common/PageLoader';

const SESSION_TYPES: WorkoutType[] = ['strength', 'cardio', 'flexibility', 'other'];

const WorkoutForm = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { exercises, loading: exercisesLoading } = useExercises();
    const { entries, templates, loading: sessionsLoading } = useWorkouts();
    const isEditing = Boolean(id);

    const [loading, setLoading] = useState(isEditing);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState(`${new Date().getHours().toString().padStart(2, '0')}:00`);
    const [length, setLength] = useState<number | ''>('');
    const [sessionType, setWorkoutType] = useState<WorkoutType>('strength');
    const [comment, setComment] = useState('');
    const [localComment, setLocalComment] = useState('');
    const [maxPulse, setMaxPulse] = useState<number | ''>('');
    const [sessionExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [autoSaveError, setAutoSaveError] = useState<string>('');
    const lastSavedDataRef = useRef<string>('');

    useEffect(() => {
        if (!currentUser || sessionsLoading || !loading) return;
        
        if (isEditing && id) {
            const entry = entries.find(e => e.id === id);
            
            if (entry) {
                setDate(entry.date);
                setTime(entry.time ?? '');
                setLength(entry.length ?? '');
                setWorkoutType(entry.sessionType ?? 'strength');
                setMaxPulse(entry.maxPulse ?? '');
                setComment(entry.comment);
                setLocalComment(entry.comment);

                if (entry.exercises && entry.exercises.length > 0) {
                    setWorkoutExercises(entry.exercises);
                } else if (entry.exerciseIds.length > 0) {
                    setWorkoutExercises(entry.exerciseIds.map(eId => ({
                        exerciseId: eId,
                        sets: []
                    })));
                }
                
                // Initialize last saved data to prevent immediate redundant auto-save
                const filteredExercises = (entry.exercises ?? []).map(se => ({
                    ...se,
                    sets: se.sets.filter(s => s.weight !== undefined && s.reps !== undefined)
                }));
                const entryData = {
                    date: entry.date,
                    time: entry.time ?? undefined,
                    length: entry.length ?? undefined,
                    sessionType: entry.sessionType ?? 'strength',
                    maxPulse: entry.maxPulse ?? undefined,
                    comment: entry.comment.trim(),
                    exerciseIds: filteredExercises.map(se => se.exerciseId),
                    exercises: filteredExercises
                };
                lastSavedDataRef.current = JSON.stringify(entryData);
                
                setLoading(false);
            } else {
                setError('Workout not found');
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, [currentUser, id, isEditing, entries, sessionsLoading, loading]);

    // Debounced auto-save
    useEffect(() => {
        if (!currentUser || loading || submitting) return;

        // Don't auto-save if it's a new workout and no meaningful data has been entered yet
        const hasData = sessionExercises.length > 0 || comment.trim() !== '' || length !== '' || maxPulse !== '' || time !== `${new Date().getHours().toString().padStart(2, '0')}:00`;
        if (!isEditing && !hasData) return;

        const timer = setTimeout(async () => {
            try {
                const filteredExercises = sessionExercises.map(se => ({
                    ...se,
                    sets: se.sets.filter(s => s.weight !== undefined || s.reps !== undefined || (s.notes && s.notes.trim() !== ''))
                }));

                const entryData: Omit<Workout, 'id' | 'userId'> = {
                    date,
                    time: time || undefined,
                    length: Number(length) || undefined,
                    sessionType,
                    maxPulse: Number(maxPulse) || undefined,
                    comment: comment.trim(),
                    exerciseIds: filteredExercises.map(se => se.exerciseId),
                    exercises: filteredExercises
                };

                // Avoid redundant writes if data hasn't changed
                const dataStr = JSON.stringify(entryData);
                if (dataStr === lastSavedDataRef.current) return;

                setIsAutoSaving(true);
                setAutoSaveError('');

                if (isEditing && id) {
                    await updateWorkout(currentUser.uid, id, entryData);
                } else {
                    const newId = await createWorkout(currentUser.uid, entryData);
                    // Update ref before navigating to prevent the immediate re-render from triggering another save
                    lastSavedDataRef.current = dataStr;
                    void navigate(`/journal/${newId}/edit`, { replace: true });
                }
                
                lastSavedDataRef.current = dataStr;
                setLastSaved(new Date());
            } catch (err) {
                console.error('Auto-save error:', err);
                setAutoSaveError('Auto-save failed');
            } finally {
                setIsAutoSaving(false);
            }
        }, 2000);
        return () => { clearTimeout(timer); };
    }, [currentUser, id, isEditing, loading, submitting, date, time, length, sessionType, comment, maxPulse, sessionExercises, navigate]);

    // Sync local comment to main state with a debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localComment !== comment) {
                setComment(localComment);
            }
        }, 500);
        return () => { clearTimeout(timer); };
    }, [localComment, comment]);

    const handleAddExercise = useCallback((exercise: Exercise | null) => {
        if (!exercise) return;
        if (sessionExercises.find(se => se.exerciseId === exercise.id)) return;
        setWorkoutExercises(prev => [...prev, {
            exerciseId: exercise.id,
            sets: [{ id: Math.random().toString(36).slice(2, 11) }]
        }]);
    }, [sessionExercises]);

    const handleRemoveExercise = useCallback((exerciseId: string) => {
        setWorkoutExercises(prev => prev.filter(se => se.exerciseId !== exerciseId));
    }, []);

    const handleAddSet = useCallback((exerciseId: string) => {
        setWorkoutExercises(prev => prev.map(se =>
            se.exerciseId === exerciseId
                ? { ...se, sets: [...se.sets, { id: Math.random().toString(36).slice(2, 11) }] }
                : se
        ));
    }, []);

    const handleRemoveSet = useCallback((exerciseId: string, setId: string) => {
        setWorkoutExercises(prev => prev.map(se =>
            se.exerciseId === exerciseId
                ? { ...se, sets: se.sets.filter(s => s.id !== setId) }
                : se
        ));
    }, []);

    const handleUpdateSet = useCallback((exerciseId: string, setId: string, updates: Partial<ExerciseSet>) => {
        setWorkoutExercises(prev => prev.map(se =>
            se.exerciseId === exerciseId
                ? { ...se, sets: se.sets.map(s => s.id === setId ? { ...s, ...updates } : s) }
                : se
        ));
    }, []);
    
    const handleUpdateExerciseNote = useCallback((exerciseId: string, note: string) => {
        setWorkoutExercises(prev => prev.map(se =>
            se.exerciseId === exerciseId
                ? { ...se, note }
                : se
        ));
    }, []);

    const handleTemplateChange = (templateId: string) => {
        setSelectedTemplateId(templateId);
        if (!templateId) return;

        const template = templates.find(t => t.id === templateId);
        if (template?.exercises) {
            const mappedExercises: WorkoutExercise[] = template.exercises.map(te => ({
                exerciseId: te.exerciseId,
                note: te.note,
                sets: te.sets?.map(s => ({
                    id: Math.random().toString(36).slice(2, 11),
                    weight: s.weight,
                    reps: s.reps,
                    notes: s.notes ?? ''
                })) ?? [{ id: Math.random().toString(36).slice(2, 11) }]
            }));
            setWorkoutExercises(mappedExercises);
        }
    };

    const previousExercisesMap = useMemo<Record<string, WorkoutExercise>>(() => {
        if (sessionsLoading || !entries.length) return {};
        
        const map: Record<string, WorkoutExercise> = {};
        const currentDateTime = new Date(`${date}T${time || '00:00'}`).getTime();
        
        sessionExercises.forEach(se => {
            const exerciseId = se.exerciseId;
            // Since entries are already sorted by date desc, the first one we find in the past is the most recent
            const prevWorkout = entries.find(e => 
                e.id !== id && 
                e.exerciseIds.includes(exerciseId) && 
                new Date(`${e.date}T${e.time ?? '00:00'}`).getTime() < currentDateTime
            );
                
            if (prevWorkout) {
                const prevEx = prevWorkout.exercises?.find(ex => ex.exerciseId === exerciseId);
                if (prevEx) {
                    map[exerciseId] = prevEx;
                }
            }
        });
        
        return map;
    }, [entries, sessionsLoading, date, time, id, sessionExercises]);

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        try {
            setSubmitting(true);
            setError('');

            const filteredExercises = sessionExercises.map(se => ({
                ...se,
                sets: se.sets.filter(s => s.weight !== undefined || s.reps !== undefined || (s.notes && s.notes.trim() !== ''))
            }));

            const entryData: Omit<Workout, 'id' | 'userId'> = {
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
                await updateWorkout(currentUser.uid, id, entryData);
            } else {
                await createWorkout(currentUser.uid, entryData);
            }

            void navigate(isEditing ? `/journal/${id ?? ''}` : '/journal');
        } catch (err) {
            console.error('Error saving workout:', err);
            setError(`Failed to save workout: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || (exercisesLoading && exercises.length === 0)) return (
        <PageLoader />
    );

    return (
        <Container maxWidth="lg">
            <Box sx={{ py: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <IconButton onClick={() => navigate(isEditing ? `/journal/${id ?? ''}` : '/journal')} sx={{ mr: 1 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4" component="h1">
                        {isEditing ? 'Edit Workout' : 'New Workout'}
                    </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                {autoSaveError && <Alert severity="warning" sx={{ mb: 3, py: 0 }}>{autoSaveError}</Alert>}

                <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, position: 'relative' }}>
                    {isAutoSaving && (
                        <Box sx={{ position: 'absolute', top: 8, right: 16, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={12} />
                            <Typography variant="caption" color="text.secondary">Saving...</Typography>
                        </Box>
                    )}
                    {!isAutoSaving && lastSaved && (
                        <Box sx={{ position: 'absolute', top: 8, right: 16 }}>
                            <Typography variant="caption" color="text.secondary">
                                Saved at {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                        </Box>
                    )}
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    variant="filled"
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
                                    variant="filled"
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
                                    variant="filled"
                                    label="Workout Type"
                                    fullWidth
                                    size="small"
                                    value={sessionType}
                                    onChange={(e) => { setWorkoutType(e.target.value as WorkoutType); }}
                                >
                                    {SESSION_TYPES.map((type) => (
                                        <MenuItem key={type} value={type}>
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 3 }}>
                                <TextField
                                    variant="filled"
                                    label="Length (min)"
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
                                    variant="filled"
                                    label="Max Pulse"
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
                                    variant="filled"
                                    label="Notes"
                                    fullWidth
                                    size="small"
                                    value={localComment}
                                    onChange={(e) => { setLocalComment(e.target.value); }}
                                    placeholder="Quick notes..."
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" gutterBottom>Exercises & Sets</Typography>
                                <Grid container spacing={2} sx={{ mb: 3 }}>
                                    {sessionExercises.length === 0 && (
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField
                                                select
                                                variant="filled"
                                                label="Use Template"
                                                fullWidth
                                                size="small"
                                                value={selectedTemplateId}
                                                onChange={(e) => { handleTemplateChange(e.target.value); }}
                                                helperText="Prepopulates workout"
                                                sx={{ mb: 3 }}
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
                                </Grid>

                                {sessionExercises.map((se) => {
                                    const exercise = exercises.find(ex => ex.id === se.exerciseId);
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
                                            previousExercise={previousExercisesMap[se.exerciseId]}
                                        />
                                    );
                                })}

                                <Box sx={{ mt: 2 }}>
                                    <Autocomplete
                                        key={sessionExercises.length}
                                        size="small"
                                        options={exercises.filter(ex => !sessionExercises.find(se => se.exerciseId === ex.id))}
                                        getOptionLabel={(option) => option.name}
                                        onChange={(_, newValue) => { handleAddExercise(newValue); }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                variant="filled"
                                                label="Add Exercise"
                                                placeholder="Search exercises..."
                                            />
                                        )}
                                        value={null}
                                        sx={{ maxWidth: isEditing ? '100%' : 400 }}
                                    />
                                </Box>
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Box sx={{ mt: 3, display: 'flex', justifyContent: "flex-end", gap: 2 }}>
                                    <Button variant="outlined" onClick={() => navigate(isEditing ? `/journal/${id ?? ''}` : '/journal')}>
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        variant="contained" 
                                        color="primary" 
                                        disabled={submitting}
                                        sx={{ minWidth: 150 }}
                                    >
                                        {submitting ? 'Saving...' : (isEditing ? 'Update Workout' : 'Add Workout')}
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

export default WorkoutForm;
