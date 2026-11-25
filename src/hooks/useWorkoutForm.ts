import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useExercises } from '../context/ExercisesContext';
import { useWorkouts } from '../context/WorkoutsContext';
import { useUserProfile } from '../context/UserProfileContext';
import { createWorkout, updateWorkout, getWorkoutById } from '../services/db';
import type { Workout, Exercise, SessionType, WorkoutExercise, ExerciseSet, TemplateExercise } from '../types';
import { getDefaultDateTime } from '../utils/format';
import { linkWithNext, unlinkFromSuperset, unlinkEntireSuperset, updateSupersetNote } from '../utils/supersetUtils';

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
    templateId?: string;
}

export const getWorkoutDraftKey = (userId?: string | null, workoutId?: string) => {
    if (userId) {
        return `workout_draft_${userId}_${workoutId ?? 'new'}`;
    }
    return `workout_draft_${workoutId ?? 'new'}`;
};

const mapTemplateExercisesToWorkout = (templateExercises?: TemplateExercise[]): WorkoutExercise[] => {
    if (!templateExercises) return [];
    return templateExercises.map(te => ({
        exerciseId: te.exerciseId,
        note: te.note,
        supersetId: te.supersetId,
        supersetNote: te.supersetNote,
        sets: te.sets?.map(s => ({
            id: crypto.randomUUID(),
            weight: s.weight ?? undefined,
            reps: s.reps ?? undefined,
            rpe: s.rpe ?? undefined,
            rir: s.rir ?? undefined,
            notes: s.notes ?? ''
        })) ?? []
    }));
};

export const useWorkoutForm = (id?: string) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const queryTemplateId = searchParams.get('templateId') ?? '';
    const { currentUser } = useAuth();
    const { exercises, loading: exercisesLoading } = useExercises();
    const { entries, templates, activeProgram, advanceActiveDay, loading: sessionsLoading } = useWorkouts();
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
    const DRAFT_KEY = useMemo(() => getWorkoutDraftKey(currentUser?.uid, id), [currentUser?.uid, id]);

    // Load initial data and drafts (including fallback fetch for older workouts beyond current context slice)
    useEffect(() => {
        if (!currentUser || sessionsLoading || profileLoading || !loading) return;

        let cancelled = false;

        const initForm = async () => {
            let baseData: WorkoutFormDraft | null = null;

            if (isEditing && id) {
                let entry = entries.find(e => e.id === id) ?? null;
                if (!entry) {
                    try {
                        entry = await getWorkoutById(currentUser.uid, id);
                    } catch {
                        entry = null;
                    }
                }
                if (cancelled) return;

                if (entry) {
                    baseData = {
                        date: entry.date,
                        time: entry.time ?? '',
                        length: entry.length ?? '',
                        sessionType: entry.sessionType ?? 'strength',
                        maxPulse: entry.maxPulse ?? '',
                        comment: entry.comment,
                        exercises: entry.exercises,
                        templateId: entry.templateId ?? ''
                    };
                } else {
                    setError('Workout not found');
                    setLoading(false);
                    return;
                }
            }

            // Load UID-scoped draft from local storage
            const savedDraft = localStorage.getItem(DRAFT_KEY);
            if (savedDraft) {
                try {
                    const draft = JSON.parse(savedDraft) as WorkoutFormDraft;
                    baseData = baseData ? { ...baseData, ...draft } : draft;
                } catch {
                    // Ignore malformed draft
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
                if (baseData.templateId !== undefined) {
                    setSelectedTemplateId(baseData.templateId);
                }
                if (baseData.startTime) setStartTime(baseData.startTime);
                if (baseData.autoFillFromLast !== undefined) setAutoFillFromLast(baseData.autoFillFromLast);

                lastSavedDataRef.current = JSON.stringify(baseData);
            } else if (!isEditing) {
                const now = Date.now();
                setStartTime(now);
                const { date: d, time: t } = getDefaultDateTime();

                const queryTemplate = queryTemplateId ? templates.find(tpl => tpl.id === queryTemplateId) : null;
                const initialExercises = mapTemplateExercisesToWorkout(queryTemplate?.exercises);

                const initialNewData: WorkoutFormDraft = {
                    date: d,
                    time: t,
                    length: '',
                    sessionType: 'strength',
                    maxPulse: '',
                    comment: '',
                    exercises: initialExercises,
                    startTime: now,
                    templateId: queryTemplateId || undefined
                };

                setDate(d);
                setTime(t);
                setWorkoutExercises(initialExercises);
                if (queryTemplateId) {
                    setSelectedTemplateId(queryTemplateId);
                }
                lastSavedDataRef.current = JSON.stringify(initialNewData);

                if (profile?.settings?.autoFillSets) {
                    setAutoFillFromLast(true);
                }
            }

            setLoading(false);
        };

        void initForm();

        return () => {
            cancelled = true;
        };
    }, [currentUser, id, isEditing, entries, sessionsLoading, loading, DRAFT_KEY, profileLoading, profile, queryTemplateId, templates]);

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
            autoFillFromLast,
            templateId: selectedTemplateId || undefined
        };

        const dataStr = JSON.stringify(entryData);
        if (dataStr === lastSavedDataRef.current) return;

        const timer = setTimeout(() => {
            try {
                localStorage.setItem(DRAFT_KEY, dataStr);
                window.dispatchEvent(new Event('draft-updated'));
                lastSavedDataRef.current = dataStr;
                setAutoSaveState({ isSaving: false, lastSaved: new Date(), error: '' });
            } catch {
                setAutoSaveState(prev => ({ ...prev, isSaving: false, error: 'Local save failed' }));
            }
        }, 1000);
        return () => { clearTimeout(timer); };
    }, [currentUser, loading, submitting, date, time, length, sessionType, maxPulse, comment, sessionExercises, DRAFT_KEY, startTime, autoFillFromLast, selectedTemplateId]);

    // Comment debouncing
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localComment !== comment) {
                setComment(localComment);
            }
        }, 500);
        return () => { clearTimeout(timer); };
    }, [localComment, comment]);

    // Precomputed map of each exercise's most recent performance prior to `date` + `time`.
    // Independent of `sessionExercises` so set keystrokes never trigger O(W * E) re-scans!
    const previousExercisesMap = useMemo<Record<string, WorkoutExercise | undefined>>(() => {
        if (sessionsLoading || !entries.length) return {};

        const map: Record<string, WorkoutExercise> = {};
        const currentKey = `${date}T${time || '00:00'}`;

        // `entries` is ordered by date desc; sort ties by time desc once
        const sorted = [...entries].sort((a, b) => {
            const keyA = `${a.date}T${a.time ?? '00:00'}`;
            const keyB = `${b.date}T${b.time ?? '00:00'}`;
            return keyB.localeCompare(keyA);
        });

        for (const workout of sorted) {
            if (workout.id === id) continue;
            const workoutKey = `${workout.date}T${workout.time ?? '00:00'}`;
            if (workoutKey >= currentKey) continue;

            for (const ex of workout.exercises) {
                if (!(ex.exerciseId in map)) {
                    map[ex.exerciseId] = ex;
                }
            }
        }

        return map;
    }, [entries, sessionsLoading, date, time, id]);

    const handleAddExercise = useCallback((exercise: Exercise | null) => {
        if (!exercise) return;
        setWorkoutExercises(prev => {
            if (prev.some(se => se.exerciseId === exercise.id)) return prev;

            let initialSets: ExerciseSet[] = [{ id: crypto.randomUUID() }];
            if (autoFillFromLast) {
                const prevEx = previousExercisesMap[exercise.id];
                if (prevEx && prevEx.sets.length > 0) {
                    initialSets = [{
                        id: crypto.randomUUID(),
                        weight: prevEx.sets[0].weight,
                        reps: prevEx.sets[0].reps,
                        rpe: prevEx.sets[0].rpe,
                        rir: prevEx.sets[0].rir
                    }];
                }
            }

            return [...prev, {
                exerciseId: exercise.id,
                sets: initialSets
            }];
        });
    }, [autoFillFromLast, previousExercisesMap]);

    const handleRemoveExercise = useCallback((exerciseId: string) => {
        setWorkoutExercises(prev => {
            const idx = prev.findIndex(se => se.exerciseId === exerciseId);
            if (idx === -1) return prev;
            const unlinked = unlinkFromSuperset(prev, idx);
            return unlinked.filter(se => se.exerciseId !== exerciseId);
        });
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
                            reps: prevSet.reps,
                            rpe: prevSet.rpe,
                            rir: prevSet.rir
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

    const handleMoveExercise = useCallback((index: number, direction: 'up' | 'down') => {
        setWorkoutExercises(prev => {
            const newIndex = direction === 'up' ? index - 1 : index + 1;
            if (newIndex < 0 || newIndex >= prev.length) return prev;

            const result = [...prev];
            const temp = result[index];
            result[index] = result[newIndex];
            result[newIndex] = temp;
            return result;
        });
    }, []);

    const handleTemplateChange = (templateId: string) => {
        setSelectedTemplateId(templateId);
        if (!templateId) return;

        const template = templates.find(t => t.id === templateId);
        if (template?.exercises) {
            setWorkoutExercises(mapTemplateExercisesToWorkout(template.exercises));
        }
    };

    const handleLinkWithNext = useCallback((index: number) => {
        setWorkoutExercises(prev => linkWithNext(prev, index));
    }, []);

    const handleUnlinkSuperset = useCallback((index: number) => {
        setWorkoutExercises(prev => unlinkFromSuperset(prev, index));
    }, []);

    const handleUnlinkEntireSuperset = useCallback((supersetId: string) => {
        setWorkoutExercises(prev => unlinkEntireSuperset(prev, supersetId));
    }, []);

    const handleUpdateSupersetNote = useCallback((supersetId: string, note: string) => {
        setWorkoutExercises(prev => updateSupersetNote(prev, supersetId, note));
    }, []);

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        try {
            setSubmitting(true);
            setError('');

            const filteredExercises = sessionExercises.map(se => ({
                ...se,
                sets: se.sets.filter(s => s.weight !== undefined || s.reps !== undefined || s.rpe !== undefined || s.rir !== undefined || (s.notes && s.notes.trim() !== ''))
            }));

            const resolvedLength = length !== ''
                ? length
                : (isEditing || !showTimer ? undefined : elapsedMinutes);
            const resolvedMaxPulse = maxPulse !== '' ? maxPulse : undefined;

            const entryData: Omit<Workout, 'id' | 'userId'> = {
                date,
                time: time || undefined,
                length: resolvedLength,
                sessionType,
                maxPulse: resolvedMaxPulse,
                comment: comment.trim(),
                exerciseIds: filteredExercises.map(se => se.exerciseId),
                exercises: filteredExercises,
                templateId: selectedTemplateId || undefined
            };

            let finalId = id;
            if (isEditing && id) {
                await updateWorkout(currentUser.uid, id, entryData);
            } else {
                finalId = await createWorkout(currentUser.uid, entryData);
                if (activeProgram && activeProgram.days.length > 0) {
                    const currentDay = activeProgram.days[activeProgram.currentDayIndex ?? 0];
                    if (selectedTemplateId && currentDay.templateId === selectedTemplateId) {
                        try {
                            await advanceActiveDay();
                        } catch (advErr) {
                            console.warn('Failed to auto-advance active program', advErr);
                        }
                    }
                }
            }

            try {
                localStorage.removeItem(DRAFT_KEY);
                window.dispatchEvent(new Event('draft-updated'));
            } catch {
                // Silently ignore storage cleanup errors
            }
            void navigate(`/journal/${finalId ?? ''}`);
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
        handleMoveExercise,
        handleLinkWithNext,
        handleUnlinkSuperset,
        handleUnlinkEntireSuperset,
        handleUpdateSupersetNote,
        handleTemplateChange,
        handleSubmit,
        previousExercisesMap,
        DRAFT_KEY
    };
};
