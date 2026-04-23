import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';

import { useAuth } from '../context/AuthContext';
import { useExercises } from '../context/ExercisesContext';
import { useWorkouts } from '../context/WorkoutsContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { createWorkout, updateWorkout } from '../services/db';
import type { Workout, Exercise, WorkoutType, WorkoutExercise, ExerciseSet } from '../types';
import WorkoutExerciseItem from '../components/journal/WorkoutExerciseItem';
import PageLoader from '../components/common/PageLoader';
import { getDefaultDateTime } from '../utils/format';
import { sortTemplates } from '../utils/workoutUtils';

const SESSION_TYPES: WorkoutType[] = ['strength', 'cardio', 'flexibility', 'other'];

const WorkoutForm = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { exercises, loading: exercisesLoading } = useExercises();
    const { entries, templates, loading: sessionsLoading } = useWorkouts();
    const { profile, loading: profileLoading } = useUserProfile();
    const isEditing = Boolean(id);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const { date: initialDate, time: initialTime } = getDefaultDateTime();
    const [date, setDate] = useState(initialDate);
    const [time, setTime] = useState(initialTime);
    const [length, setLength] = useState<number | ''>('');
    const [sessionType, setWorkoutType] = useState<WorkoutType>('strength');
    const [comment, setComment] = useState('');
    const [localComment, setLocalComment] = useState('');
    const [maxPulse, setMaxPulse] = useState<number | ''>('');
    const [sessionExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [autoSaveState, setAutoSaveState] = useState<{
        isSaving: boolean;
        lastSaved: Date | null;
        error: string;
    }>({
        isSaving: false,
        lastSaved: null,
        error: ''
    });
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsedMinutes, setElapsedMinutes] = useState<number>(0);
    const [autoFillFromLast, setAutoFillFromLast] = useState(false);
    const lastSavedDataRef = useRef<string>('');
    const DRAFT_KEY = `workout_draft_${id || 'new'}`;

    useEffect(() => {
        if (!currentUser || sessionsLoading || profileLoading || !loading) return;

        let baseData: any = null;

        if (isEditing && id) {
            const entry = entries.find(e => e.id === id);

            if (entry) {
                baseData = {
                    date: entry.date,
                    time: entry.time ?? '',
                    length: entry.length ?? '',
                    sessionType: entry.sessionType ?? 'strength',
                    maxPulse: entry.maxPulse ?? '',
                    comment: entry.comment,
                    exercises: entry.exercises
                };
            } else {
                setError('Workout not found');
                setLoading(false);
                return;
            }
        }

        // Load draft from local storage
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
            try {
                const draft = JSON.parse(savedDraft);
                if (baseData) {
                    baseData = { ...baseData, ...draft };
                } else {
                    baseData = draft;
                }
            } catch (e) {
                console.error("Failed to parse draft", e);
            }
        }

        if (baseData) {
            setDate(baseData.date);
            setTime(baseData.time);
            setLength(baseData.length);
            setWorkoutType(baseData.sessionType);
            setMaxPulse(baseData.maxPulse);
            setComment(baseData.comment);
            setLocalComment(baseData.comment);
            setWorkoutExercises(baseData.exercises);
            if (baseData.startTime) setStartTime(baseData.startTime);
            if (baseData.autoFillFromLast !== undefined) setAutoFillFromLast(baseData.autoFillFromLast);

            // Initialize lastSavedDataRef to current state to avoid immediate auto-save
            lastSavedDataRef.current = JSON.stringify(baseData);
        } else if (!isEditing) {
            // Initialize for new workout without draft
            const now = Date.now();
            setStartTime(now);
            const { date: d, time: t } = getDefaultDateTime();
            lastSavedDataRef.current = JSON.stringify({
                date: d,
                time: t,
                length: '',
                sessionType: 'strength',
                maxPulse: '',
                comment: '',
                exercises: [],
                startTime: now
            });

            // Apply profile setting for new workouts if no draft
            if (profile?.settings?.autoFillSets) {
                setAutoFillFromLast(true);
            }
        }

        setLoading(false);
    }, [currentUser, id, isEditing, entries, sessionsLoading, loading, DRAFT_KEY, profileLoading, profile]);

    // Timer effect for new workouts
    useEffect(() => {
        if (!startTime || isEditing) return;

        const updateTimer = () => {
            const mins = Math.floor((Date.now() - startTime) / 60000);
            setElapsedMinutes(mins);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 30000); // Update every 30s
        return () => { clearInterval(interval); };
    }, [startTime, isEditing]);

    // Debounced local persistence
    useEffect(() => {
        if (!currentUser || loading || submitting) return;

        const entryData = {
            date,
            time,
            length,
            sessionType,
            maxPulse,
            comment: comment.trim(),
            exercises: sessionExercises,
            startTime, // Persist start time in draft
            autoFillFromLast // Persist toggle state
        };

        const dataStr = JSON.stringify(entryData);
        if (dataStr === lastSavedDataRef.current) return;

        const timer = setTimeout(() => {
            try {
                localStorage.setItem(DRAFT_KEY, dataStr);
                lastSavedDataRef.current = dataStr;
                setAutoSaveState({ isSaving: false, lastSaved: new Date(), error: '' });
            } catch (err) {
                console.error('Local save error:', err);
                setAutoSaveState(prev => ({ ...prev, isSaving: false, error: 'Local save failed' }));
            }
        }, 1000);
        return () => { clearTimeout(timer); };
    }, [currentUser, loading, submitting, date, time, length, sessionType, maxPulse, comment, sessionExercises, DRAFT_KEY]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localComment !== comment) {
                setComment(localComment);
            }
        }, 500);
        return () => { clearTimeout(timer); };
    }, [localComment, comment]);

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
                const prevEx = prevWorkout.exercises.find(ex => ex.exerciseId === exerciseId);
                if (prevEx) {
                    map[exerciseId] = prevEx;
                }
            }
        });

        return map;
    }, [entries, sessionsLoading, date, time, id, sessionExercises]);

    const handleAddExercise = useCallback((exercise: Exercise | null) => {
        if (!exercise) return;
        if (sessionExercises.find(se => se.exerciseId === exercise.id)) return;

        let initialSets: ExerciseSet[] = [{ id: crypto.randomUUID() }];

        if (autoFillFromLast) {
            const prevEx = previousExercisesMap[exercise.id];
            if (prevEx && prevEx.sets.length > 0) {
                initialSets = [{
                    id: crypto.randomUUID(),
                    weight: prevEx.sets[0].weight,
                    reps: prevEx.sets[0].reps
                }];
            }
        }

        setWorkoutExercises(prev => [...prev, {
            exerciseId: exercise.id,
            sets: initialSets
        }]);
    }, [sessionExercises, autoFillFromLast, previousExercisesMap]);

    const handleRemoveExercise = useCallback((exerciseId: string) => {
        setWorkoutExercises(prev => prev.filter(se => se.exerciseId !== exerciseId));
    }, []);

    const handleAddSet = useCallback((exerciseId: string) => {
        setWorkoutExercises(prev => prev.map(se => {
            if (se.exerciseId === exerciseId) {
                let newSet: Partial<ExerciseSet> = { id: crypto.randomUUID() };

                if (autoFillFromLast) {
                    const prevEx = previousExercisesMap[exerciseId];
                    const nextSetIdx = se.sets.length;
                    const prevSet = prevEx?.sets[nextSetIdx] || prevEx?.sets[prevEx.sets.length - 1];

                    if (prevSet) {
                        newSet = {
                            ...newSet,
                            weight: prevSet.weight,
                            reps: prevSet.reps
                        };
                    }
                }

                return { ...se, sets: [...se.sets, newSet as ExerciseSet] };
            }
            return se;
        }));
    }, [autoFillFromLast, previousExercisesMap]);

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
                    id: crypto.randomUUID(),
                    weight: s.weight || undefined,
                    reps: s.reps || undefined,
                    notes: s.notes ?? ''
                })) ?? []
            }));
            setWorkoutExercises(mappedExercises);
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
                sets: se.sets.filter(s => s.weight !== undefined || s.reps !== undefined || (s.notes && s.notes.trim() !== ''))
            }));

            const entryData: Omit<Workout, 'id' | 'userId'> = {
                date,
                time: time || undefined,
                length: Number(length) || (isEditing ? undefined : elapsedMinutes),
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

            localStorage.removeItem(DRAFT_KEY);
            void navigate(isEditing ? `/journal/${id ?? ''}` : '/journal');
        } catch (err) {
            console.error('Error saving workout:', err);
            setError(`Failed to save workout: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || (exercisesLoading && exercises.length === 0) || profileLoading) return (
        <PageLoader />
    );

    return (
        <Container maxWidth="lg">
            <Box sx={{ py: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1.5, md: 3 } }}>
                    <IconButton 
                        onClick={() => navigate(isEditing ? `/journal/${id ?? ''}` : '/journal')} 
                        sx={{ mr: 1, p: { xs: 0.5, sm: 1 } }}
                        aria-label="go back"
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4" component="h1">
                        {isEditing ? 'Edit Workout' : 'New Workout'}
                    </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                {autoSaveState.error && <Alert severity="warning" sx={{ mb: 3, py: 0 }}>{autoSaveState.error}</Alert>}

                <Paper elevation={3} sx={{ p: { xs: 1.5, md: 4 }, position: 'relative' }}>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={{ xs: 1.5, sm: 3 }}>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField
                                    variant="standard"
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
                                    variant="standard"
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
                                    variant="standard"
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
                                    variant="standard"
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
                                    variant="standard"
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
                                    variant="standard"
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
                                <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
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
                                        >
                                            <MenuItem value=""><em>None</em></MenuItem>
                                            {sortTemplates(templates).map((t) => (
                                                <MenuItem key={t.id} value={t.id}>
                                                    {t.isFavorite && '★ '}{t.name}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Tooltip title="Automatically fill in weight and reps from your last training" arrow>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={autoFillFromLast}
                                                        onChange={(e) => setAutoFillFromLast(e.target.checked)}
                                                        color="primary"
                                                    />
                                                }
                                                label="Auto-fill"
                                                sx={{ ml: 1 }}
                                            />
                                        </Tooltip>
                                    </Grid>
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
                                        sx={{ width: '100%', maxWidth: { sm: 400 } }}
                                    />
                                </Box>
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Box sx={{ mt: 3, display: 'flex', justifyContent: "flex-end", alignItems: 'center', gap: 3 }}>
                                    {!isEditing && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <AccessTimeIcon fontSize="small" color="action" />
                                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                {elapsedMinutes} min
                                            </Typography>
                                        </Box>
                                    )}
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Button variant="outlined" onClick={() => {
                                            localStorage.removeItem(DRAFT_KEY);
                                            navigate(isEditing ? `/journal/${id ?? ''}` : '/journal');
                                        }}>
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            color="primary"
                                            disabled={submitting}
                                            sx={{ minWidth: 150 }}
                                        >
                                            {submitting ? 'Saving...' : (isEditing ? 'Update Workout' : 'Finish Workout')}
                                        </Button>
                                    </Box>
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
