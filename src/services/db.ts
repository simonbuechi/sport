import {
    collection, doc, setDoc, updateDoc, addDoc, query, orderBy, deleteDoc,
    onSnapshot, limit, getDoc, arrayUnion, type Unsubscribe, type QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Exercise, UserProfile, Workout, TrainingTemplate, WeightEntry, MeasurementEntry, MarkedStatus } from '../types';

// Exercises

export const subscribeToExercises = (
    callback: (exercises: Exercise[]) => void
): Unsubscribe => {
    const q = query(
        collection(db, 'exercises'),
        orderBy('popular', 'desc'),
        orderBy('name'),
        limit(2000)
    );
    return onSnapshot(q, (snapshot) => {
        const exercises = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exercise));
        callback(exercises);
    });
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
    await updateDoc(doc(db, 'users', uid), data);
};

export const addWeightEntry = async (uid: string, entry: WeightEntry): Promise<void> => {
    await updateDoc(doc(db, 'users', uid), {
        weights: arrayUnion(entry)
    });
};

export const addMeasurementEntry = async (uid: string, entry: MeasurementEntry): Promise<void> => {
    await updateDoc(doc(db, 'users', uid), {
        measurements: arrayUnion(entry)
    });
};

export const subscribeToUserProfile = (
    uid: string,
    callback: (profile: UserProfile | null) => void
): Unsubscribe => {
    const docRef = doc(db, 'users', uid);
    return onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
            callback({ uid: snapshot.id, ...snapshot.data() } as UserProfile);
        } else {
            callback(null);
        }
    });
};

// Workouts
const mapWorkout = (doc: QueryDocumentSnapshot): Workout => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        exercises: (data.exercises as Workout['exercises'] | undefined) ?? []
    } as Workout;
};


export const subscribeToWorkouts = (
    userId: string,
    callback: (entries: Workout[]) => void,
    limitCount = 1000
): Unsubscribe => {
    const entriesRef = collection(db, 'users', userId, 'activities');
    const q = query(
        entriesRef,
        orderBy('date', 'desc'),
        limit(limitCount)
    );
    return onSnapshot(q, (snapshot) => {
        const entries = snapshot.docs.map(mapWorkout);
        callback(entries);
    });
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


// Training Templates

export const subscribeToTemplates = (
    userId: string,
    callback: (templates: TrainingTemplate[]) => void
): Unsubscribe => {
    const templatesRef = collection(db, 'users', userId, 'templates');
    return onSnapshot(templatesRef, (snapshot) => {
        const templates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TrainingTemplate));
        callback(templates);
    });
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

export const updateExerciseStatusInProfile = async (uid: string, exerciseId: string, status: Partial<MarkedStatus>): Promise<void> => {
    const updateData: Record<string, unknown> = {};
    if (status.favorite !== undefined) updateData[`markedExercises.${exerciseId}.favorite`] = status.favorite;
    if (status.notes !== undefined) updateData[`markedExercises.${exerciseId}.notes`] = status.notes;
    await updateDoc(doc(db, 'users', uid), updateData);
};