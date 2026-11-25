import {
    collection, doc, setDoc, updateDoc, addDoc, query, orderBy, deleteDoc,
    onSnapshot, limit, getDoc, getDocs, getDocsFromCache, arrayUnion, where, writeBatch,
    type Unsubscribe, type QueryDocumentSnapshot, type DocumentSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type {
    Exercise, UserProfile, Workout, TrainingTemplate, WeightEntry,
    MeasurementEntry, MarkedStatus, Program, ProgramLibraryItem
} from '../types';

// Mappers with defensive defaults for cross-platform (Web + Android) compatibility

const mapExercise = (snap: QueryDocumentSnapshot | DocumentSnapshot): Exercise => {
    const data = snap.data() ?? {};
    return {
        id: snap.id,
        ...data,
        aliases: (data.aliases as string[] | undefined) ?? [],
    } as Exercise;
};

const mapWorkout = (snap: QueryDocumentSnapshot | DocumentSnapshot): Workout => {
    const data = snap.data() ?? {};
    const exercises = (data.exercises as Workout['exercises'] | undefined) ?? [];
    return {
        id: snap.id,
        ...data,
        exercises,
        exerciseIds: (data.exerciseIds as string[] | undefined) ?? exercises.map(e => e.exerciseId),
    } as Workout;
};

const mapTemplate = (snap: QueryDocumentSnapshot | DocumentSnapshot): TrainingTemplate => {
    const data = snap.data() ?? {};
    return {
        id: snap.id,
        ...data,
        exercises: (data.exercises as TrainingTemplate['exercises'] | undefined) ?? [],
    } as TrainingTemplate;
};

const mapProgram = (snap: QueryDocumentSnapshot | DocumentSnapshot): Program => {
    const data = snap.data() ?? {};
    return {
        id: snap.id,
        ...data,
        days: (data.days as Program['days'] | undefined) ?? [],
    } as Program;
};

const mapProgramLibraryItem = (snap: QueryDocumentSnapshot | DocumentSnapshot): ProgramLibraryItem => {
    const data = snap.data() ?? {};
    return {
        id: snap.id,
        ...data,
        days: (data.days as ProgramLibraryItem['days'] | undefined) ?? [],
    } as ProgramLibraryItem;
};

// Exercises

export const fetchExercises = async (forceServer = false): Promise<Exercise[]> => {
    const q = query(
        collection(db, 'exercises'),
        orderBy('popular', 'desc'),
        orderBy('name'),
        limit(2000)
    );

    if (!forceServer) {
        try {
            const cached = await getDocsFromCache(q);
            if (!cached.empty) {
                return cached.docs.map(mapExercise);
            }
        } catch {
            // Fall through to network fetch
        }
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(mapExercise);
};

export const subscribeToExercises = (
    callback: (exercises: Exercise[]) => void,
    onError?: (error: Error) => void
): Unsubscribe => {
    const q = query(
        collection(db, 'exercises'),
        orderBy('popular', 'desc'),
        orderBy('name'),
        limit(2000)
    );
    return onSnapshot(
        q,
        (snapshot) => {
            callback(snapshot.docs.map(mapExercise));
        },
        (error) => {
            console.error('Error subscribing to exercises:', error);
            if (onError) onError(error);
        }
    );
};

export const createExercise = async (exercise: Omit<Exercise, 'id'>): Promise<string> => {
    const docRef = await addDoc(collection(db, 'exercises'), exercise);
    return docRef.id;
};

export const updateExercise = async (id: string, data: Partial<Exercise>): Promise<void> => {
    const docRef = doc(db, 'exercises', id);
    await updateDoc(docRef, data);
};

export const deleteExercise = async (id: string): Promise<void> => {
    const docRef = doc(db, 'exercises', id);
    await deleteDoc(docRef);
};

// User Profiles

export const createUserProfile = async (uid: string, data: Partial<UserProfile>): Promise<void> => {
    await setDoc(doc(db, 'users', uid), data, { merge: true });
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    const docRef = doc(db, 'users', uid);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
        return { uid: snapshot.id, ...snapshot.data() } as UserProfile;
    }
    return null;
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>): Promise<void> => {
    await setDoc(doc(db, 'users', uid), data, { merge: true });
};

export const softDeleteUserProfile = async (uid: string): Promise<void> => {
    await setDoc(
        doc(db, 'users', uid),
        {
            deleted: true,
            deletedAt: new Date().toISOString()
        },
        { merge: true }
    );
};

export const addWeightEntry = async (uid: string, entry: WeightEntry): Promise<void> => {
    await setDoc(
        doc(db, 'users', uid),
        { weights: arrayUnion(entry) },
        { merge: true }
    );
};

export const addMeasurementEntry = async (uid: string, entry: MeasurementEntry): Promise<void> => {
    await setDoc(
        doc(db, 'users', uid),
        { measurements: arrayUnion(entry) },
        { merge: true }
    );
};

export const subscribeToUserProfile = (
    uid: string,
    callback: (profile: UserProfile | null) => void,
    onError?: (error: Error) => void
): Unsubscribe => {
    const docRef = doc(db, 'users', uid);
    return onSnapshot(
        docRef,
        (snapshot) => {
            if (snapshot.exists()) {
                callback({ uid: snapshot.id, ...snapshot.data() } as UserProfile);
            } else {
                callback(null);
            }
        },
        (error) => {
            console.error('Error subscribing to user profile:', error);
            if (onError) onError(error);
        }
    );
};

export const updateExerciseStatusInProfile = async (
    uid: string,
    exerciseId: string,
    status: Partial<MarkedStatus>
): Promise<void> => {
    const markedUpdate: Partial<MarkedStatus> = {};
    if (status.favorite !== undefined) markedUpdate.favorite = status.favorite;
    if (status.notes !== undefined) markedUpdate.notes = status.notes;

    await setDoc(
        doc(db, 'users', uid),
        { markedExercises: { [exerciseId]: markedUpdate } },
        { merge: true }
    );
};

// Workouts

export const subscribeToWorkouts = (
    userId: string,
    callback: (entries: Workout[]) => void,
    limitCount = 1000,
    onError?: (error: Error) => void
): Unsubscribe => {
    const entriesRef = collection(db, 'users', userId, 'activities');
    const q = query(
        entriesRef,
        orderBy('date', 'desc'),
        limit(limitCount)
    );
    return onSnapshot(
        q,
        (snapshot) => {
            callback(snapshot.docs.map(mapWorkout));
        },
        (error) => {
            console.error('Error subscribing to workouts:', error);
            if (onError) onError(error);
        }
    );
};

export const getWorkoutById = async (userId: string, entryId: string): Promise<Workout | null> => {
    const entryRef = doc(db, 'users', userId, 'activities', entryId);
    const snapshot = await getDoc(entryRef);
    if (!snapshot.exists()) return null;
    return mapWorkout(snapshot);
};

export const createWorkout = async (userId: string, entry: Omit<Workout, 'id' | 'userId'>): Promise<string> => {
    const entriesRef = collection(db, 'users', userId, 'activities');
    const docRef = await addDoc(entriesRef, { ...entry, userId });
    return docRef.id;
};

export const updateWorkout = async (userId: string, entryId: string, data: Partial<Workout>): Promise<void> => {
    const entryRef = doc(db, 'users', userId, 'activities', entryId);
    await updateDoc(entryRef, data);
};

export const deleteWorkout = async (userId: string, entryId: string): Promise<void> => {
    const entryRef = doc(db, 'users', userId, 'activities', entryId);
    await deleteDoc(entryRef);
};

export const subscribeToWorkoutsByTemplate = (
    userId: string,
    templateId: string,
    callback: (entries: Workout[]) => void,
    onError?: (error: Error) => void
): Unsubscribe => {
    const entriesRef = collection(db, 'users', userId, 'activities');
    const q = query(
        entriesRef,
        where('templateId', '==', templateId)
    );
    return onSnapshot(
        q,
        (snapshot) => {
            const entries = snapshot.docs
                .map(mapWorkout)
                .sort((a, b) => {
                    const dateCompare = b.date.localeCompare(a.date);
                    if (dateCompare !== 0) return dateCompare;
                    return (b.time ?? '').localeCompare(a.time ?? '');
                });
            callback(entries);
        },
        (error) => {
            console.error('Error subscribing to workouts by template:', error);
            if (onError) onError(error);
        }
    );
};

// Training Templates

export const subscribeToTemplates = (
    userId: string,
    callback: (templates: TrainingTemplate[]) => void,
    onError?: (error: Error) => void
): Unsubscribe => {
    const templatesRef = collection(db, 'users', userId, 'templates');
    return onSnapshot(
        templatesRef,
        (snapshot) => {
            callback(snapshot.docs.map(mapTemplate));
        },
        (error) => {
            console.error('Error subscribing to templates:', error);
            if (onError) onError(error);
        }
    );
};

export const createTemplate = async (userId: string, template: Omit<TrainingTemplate, 'id' | 'userId'>): Promise<string> => {
    const templatesRef = collection(db, 'users', userId, 'templates');
    const docRef = await addDoc(templatesRef, { ...template, userId });
    return docRef.id;
};

export const updateTemplate = async (userId: string, templateId: string, data: Partial<TrainingTemplate>): Promise<void> => {
    const templateRef = doc(db, 'users', userId, 'templates', templateId);
    await updateDoc(templateRef, data);
};

export const deleteTemplate = async (userId: string, templateId: string): Promise<void> => {
    const templateRef = doc(db, 'users', userId, 'templates', templateId);
    await deleteDoc(templateRef);
};

// Training Programs

export const subscribeToPrograms = (
    userId: string,
    callback: (programs: Program[]) => void,
    onError?: (error: Error) => void
): Unsubscribe => {
    const programsRef = collection(db, 'users', userId, 'programs');
    return onSnapshot(
        programsRef,
        (snapshot) => {
            callback(snapshot.docs.map(mapProgram));
        },
        (error) => {
            console.error('Error subscribing to programs:', error);
            if (onError) onError(error);
        }
    );
};

export const createProgram = async (userId: string, program: Omit<Program, 'id' | 'userId'>): Promise<string> => {
    const programsRef = collection(db, 'users', userId, 'programs');
    const now = new Date().toISOString();
    const docRef = await addDoc(programsRef, {
        ...program,
        userId,
        createdAt: now,
        updatedAt: now,
    });
    return docRef.id;
};

export const updateProgram = async (userId: string, programId: string, data: Partial<Program>): Promise<void> => {
    const programRef = doc(db, 'users', userId, 'programs', programId);
    await updateDoc(programRef, {
        ...data,
        updatedAt: new Date().toISOString()
    });
};

export const deleteProgram = async (userId: string, programId: string): Promise<void> => {
    const programRef = doc(db, 'users', userId, 'programs', programId);
    await deleteDoc(programRef);
};

export const setActiveProgram = async (userId: string, programId: string | null, programs: Program[]): Promise<void> => {
    const now = new Date();
    const today = `${String(now.getFullYear())}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const batch = writeBatch(db);

    for (const p of programs) {
        const pRef = doc(db, 'users', userId, 'programs', p.id);
        if (p.id === programId) {
            batch.update(pRef, {
                isActive: true,
                startDate: today,
                currentDayIndex: 0,
                updatedAt: now.toISOString()
            });
        } else if (p.isActive) {
            batch.update(pRef, {
                isActive: false,
                updatedAt: now.toISOString()
            });
        }
    }

    await batch.commit();
};

export const advanceProgramDay = async (userId: string, program: Program, targetIndex?: number): Promise<void> => {
    const programRef = doc(db, 'users', userId, 'programs', program.id);
    const totalDays = program.days.length;
    if (totalDays === 0) return;

    const currentIndex = program.currentDayIndex ?? 0;
    let nextIndex: number;
    if (targetIndex !== undefined) {
        nextIndex = targetIndex;
    } else if (program.type === 'repetitive') {
        nextIndex = (currentIndex + 1) % totalDays;
    } else {
        nextIndex = Math.min(currentIndex + 1, totalDays - 1);
    }

    await updateDoc(programRef, {
        currentDayIndex: nextIndex,
        updatedAt: new Date().toISOString()
    });
};

// Program Library

const loadStarterProgramsFallback = async (): Promise<ProgramLibraryItem[]> => {
    const { STARTER_PROGRAMS } = await import('../data/starterPrograms');
    return STARTER_PROGRAMS;
};

export const subscribeToProgramLibrary = (
    callback: (items: ProgramLibraryItem[]) => void,
    onError?: (error: Error) => void
): Unsubscribe => {
    const libRef = collection(db, 'program_library');
    return onSnapshot(
        libRef,
        (snapshot) => {
            if (snapshot.empty) {
                void loadStarterProgramsFallback().then(callback);
            } else {
                callback(snapshot.docs.map(mapProgramLibraryItem));
            }
        },
        (error) => {
            console.warn('Could not fetch remote program library, using starter programs fallback:', error);
            void loadStarterProgramsFallback().then(callback);
            if (onError) onError(error);
        }
    );
};

export const subscribeToProgramLibraryItem = (
    programId: string,
    callback: (item: ProgramLibraryItem | null) => void,
    onError?: (error: Error) => void
): Unsubscribe => {
    const docRef = doc(db, 'program_library', programId);
    return onSnapshot(
        docRef,
        (snapshot) => {
            if (snapshot.exists()) {
                callback(mapProgramLibraryItem(snapshot));
            } else {
                void loadStarterProgramsFallback().then((starters) => {
                    callback(starters.find(p => p.id === programId) ?? null);
                });
            }
        },
        (error) => {
            console.warn('Could not fetch program library item, checking starter fallback:', error);
            void loadStarterProgramsFallback().then((starters) => {
                callback(starters.find(p => p.id === programId) ?? null);
            });
            if (onError) onError(error);
        }
    );
};

export const cloneProgramFromLibrary = async (
    userId: string,
    item: ProgramLibraryItem,
    availableExercises: Exercise[] = []
): Promise<{ programId: string; createdTemplateIds: string[] }> => {
    const batch = writeBatch(db);
    const templatesColRef = collection(db, 'users', userId, 'templates');
    const programsColRef = collection(db, 'users', userId, 'programs');

    const templateKeyToIdMap: Record<string, string> = {};
    const createdTemplateIds: string[] = [];

    if (item.templates) {
        for (const [key, tpl] of Object.entries(item.templates)) {
            const mappedExercises = tpl.exercises.map(ex => {
                let resolvedId = ex.exerciseId;
                if (!resolvedId && ex.exerciseName) {
                    const target = ex.exerciseName.toLowerCase();
                    const match = availableExercises.find(
                        e => e.name.toLowerCase() === target || e.name.toLowerCase().includes(target)
                    );
                    if (match) resolvedId = match.id;
                }

                const sets = (ex.sets && ex.sets.length > 0)
                    ? ex.sets.map(s => ({
                        ...s,
                        id: crypto.randomUUID(),
                    }))
                    : [{ id: crypto.randomUUID(), reps: 10 }];

                return {
                    exerciseId: resolvedId ?? ex.exerciseName ?? 'exercise',
                    note: ex.note ?? '',
                    sets,
                    ...(ex.supersetId ? { supersetId: ex.supersetId } : {}),
                    ...(ex.supersetNote ? { supersetNote: ex.supersetNote } : {}),
                };
            });

            const tplDocRef = doc(templatesColRef);
            batch.set(tplDocRef, {
                name: tpl.name,
                notes: tpl.notes ?? '',
                exercises: mappedExercises,
                userId,
            });

            templateKeyToIdMap[key] = tplDocRef.id;
            createdTemplateIds.push(tplDocRef.id);
        }
    }

    const mappedDays = item.days.map((day) => ({
        id: crypto.randomUUID(),
        dayNumber: day.dayNumber,
        templateId: day.templateKey ? (templateKeyToIdMap[day.templateKey] ?? null) : null,
        note: day.note ?? '',
    }));

    const now = new Date().toISOString();
    const progDocRef = doc(programsColRef);
    batch.set(progDocRef, {
        name: item.name,
        description: item.description ?? '',
        type: item.type,
        days: mappedDays,
        userId,
        createdAt: now,
        updatedAt: now,
    });

    await batch.commit();

    return { programId: progDocRef.id, createdTemplateIds };
};
