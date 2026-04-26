import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useExercises } from '../context/ExercisesContext';
import { useWorkouts } from '../context/WorkoutsContext';
import { useUserProfile } from './useUserProfile';
import { createWorkout, updateWorkout } from '../services/db';
import type { Workout, Exercise, SessionType, WorkoutExercise, ExerciseSet } from '../types';
import { getDefaultDateTime } from '../utils/format';

interface WorkoutFormDraft {
    date: string;
    time: string;
    length: number | '';
    sessionType: SessionType;
    maxPulse: number | '';
    comment: string;
    exercises: WorkoutExercise[];
    startTime?: number | null;
    autoFillFromLast?: boolean;
}

export const useWorkoutForm = (id?: string) => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { exercises, loading: exercisesLoading } = useExercises();
    const { entries, templates, loading: sessionsLoading } = useWorkouts();
    const { profile, loading: profileLoading } = useUserProfile();
    const isEditing = Boolean(id);
    const showTimer = profile?.settings?.showTimer ?? true;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const { date: initialDate, time: initialTime } = useMemo(() => getDefaultDateTime(), []);
    const [date, setDate] = useState(initialDate);
    const [time, setTime] = useState(initialTime);
    const [length, setLength] = useState<number | ''>('');
    const [sessionType, setSessionType] = useState<SessionType>('strength');
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
    const DRAFT_KEY = `workout_draft_${id ?? 'new'}`;

    // Load initial data and drafts
    useEffect(() => {
        if (!currentUser || sessionsLoading || profileLoading || !loading) return;

        let baseData: WorkoutFormDraft | null = null;

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
                const draft = JSON.parse(savedDraft) as WorkoutFormDraft;
                if (baseData) {
                    baseData = { ...baseData, ...draft };
                } else {
                    baseData = draft;
                }
            } catch (_e) {
                // console.error("Failed to parse draft", _e);
            }
        }

        if (baseData) {
            setDate(baseData.date);
            setTime(baseData.time);
            setLength(baseData.length);
            setSessionType(baseData.sessionType);
            setMaxPulse(baseData.maxPulse);
            setComment(baseData.comment);
            setLocalComment(baseData.comment);
            setWorkoutExercises(baseData.exercises);
            if (baseData.startTime) setStartTime(baseData.startTime);
            if (baseData.autoFillFromLast !== undefined) setAutoFillFromLast(baseData.autoFillFromLast);

            lastSavedDataRef.current = JSON.stringify(baseData);
        } else if (!isEditing) {
            const now = Date.now();
            setStartTime(now);
            const { date: d, time: t } = getDefaultDateTime();
            const initialNewData: WorkoutFormDraft = {
                date: d,
                time: t,
                length: '',
                sessionType: 'strength',
                maxPulse: '',
                comment: '',
                exercises: [],
                startTime: now
            };
            lastSavedDataRef.current = JSON.stringify(initialNewData);

            if (profile?.settings?.autoFillSets) {
                setAutoFillFromLast(true);
            }
        }

        setLoading(false);
    }, [currentUser, id, isEditing, entries, sessionsLoading, loading, DRAFT_KEY, profileLoading, profile]);

    // Timer effect
    useEffect(() => {
        if (!startTime || isEditing || !showTimer) return;

        const updateTimer = () => {
            const mins = Math.floor((Date.now() - startTime) / 60000);
            setElapsedMinutes(mins);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 30000);
        return () => { clearInterval(interval); };
    }, [startTime, isEditing, showTimer]);

    // Debounced local persistence (Auto-save)
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
            startTime,
            autoFillFromLast
        };

        const dataStr = JSON.stringify(entryData);
        if (dataStr === lastSavedDataRef.current) return;

        const timer = setTimeout(() => {
            try {
                localStorage.setItem(DRAFT_KEY, dataStr);
                lastSavedDataRef.current = dataStr;
                setAutoSaveState({ isSaving: false, lastSaved: new Date(), error: '' });
            } catch (_err) {
                setAutoSaveState(prev => ({ ...prev, isSaving: false, error: 'Local save failed' }));
            }
        }, 1000);
        return () => { clearTimeout(timer); };
    }, [currentUser, loading, submitting, date, time, length, sessionType, maxPulse, comment, sessionExercises, DRAFT_KEY, startTime, autoFillFromLast]);

    // Comment debouncing
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localComment !== comment) {
                setComment(localComment);
            }
        }, 500);
        return () => { clearTimeout(timer); };
    }, [localComment, comment]);

    // Optimized previous exercises map
    const previousExercisesMap = useMemo<Record<string, WorkoutExercise | undefined>>(() => {
        if (sessionsLoading || !entries.length) return {};

        const map: Record<string, WorkoutExercise> = {};
        const currentDateTime = new Date(`${date}T${time || '00:00'}`).getTime();

        sessionExercises.forEach(se => {
            const exerciseId = se.exerciseId;
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
                    if (prevEx && prevEx.sets.length > 0) {
                        const nextSetIdx = se.sets.length;
                        const prevSet = prevEx.sets[nextSetIdx] ?? prevEx.sets[prevEx.sets.length - 1];

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
                    weight: s.weight ?? undefined,
                    reps: s.reps ?? undefined,
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
                length: Number(length) || (isEditing || !showTimer ? undefined : elapsedMinutes),
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

            try {
                localStorage.removeItem(DRAFT_KEY);
            } catch (_err) {
                // Silently fail
            }
            void navigate(isEditing ? `/journal/${id ?? ''}` : '/journal');
        } catch (_err) {
            setError(`Failed to save workout: ${_err instanceof Error ? _err.message : String(_err)}`);
        } finally {
            setSubmitting(false);
        }
    };

    return {
        date, setDate,
        time, setTime,
        length, setLength,
        sessionType, setSessionType,
        localComment, setLocalComment,
        maxPulse, setMaxPulse,
        sessionExercises,
        selectedTemplateId,
        autoFillFromLast, setAutoFillFromLast,
        autoSaveState,
        elapsedMinutes,
        error, setError,
        loading, submitting,
        exercises, templates,
        exercisesLoading, sessionsLoading, profileLoading,
        isEditing, showTimer,
        handleAddExercise,
        handleRemoveExercise,
        handleAddSet,
        handleRemoveSet,
        handleUpdateSet,
        handleUpdateExerciseNote,
        handleTemplateChange,
        handleSubmit,
        previousExercisesMap,
        DRAFT_KEY
    };
};
