import { 
    collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc, query, orderBy, deleteDoc, 
    onSnapshot, limit, type Unsubscribe 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Exercise, UserProfile, ActivityLog, TrainingTemplate } from '../types';


// Exercises

export const getAllExercises = async (): Promise<Exercise[]> => {
    const q = query(
        collection(db, 'exercises'),
        orderBy('popular', 'desc'),
        orderBy('name')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exercise));
};

export const subscribeToExercises = (callback: (exercises: Exercise[]) => void): Unsubscribe => {
    const q = query(
        collection(db, 'exercises'),
        orderBy('popular', 'desc'),
        orderBy('name')
    );
    return onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
        const exercises = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exercise));
        callback(exercises);
    });
};



export const getExerciseById = async (id: string): Promise<Exercise | null> => {
    const docRef = doc(db, 'exercises', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Exercise;
    }
    return null;
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
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { uid: docSnap.id, ...docSnap.data() } as UserProfile;
    }
    return null;
};

export const createUserProfile = async (uid: string, data: Partial<UserProfile>): Promise<void> => {
    await setDoc(doc(db, 'users', uid), data, { merge: true });
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>): Promise<void> => {
    await updateDoc(doc(db, 'users', uid), data);
};

// Activity Logs
export const getJournalEntries = async (userId: string): Promise<ActivityLog[]> => {
    const entriesRef = collection(db, 'users', userId, 'activities');
    const q = query(entriesRef, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActivityLog));
};

export const subscribeToJournalEntries = (
    userId: string, 
    callback: (entries: ActivityLog[]) => void, 
    limitCount = 50
): Unsubscribe => {
    const entriesRef = collection(db, 'users', userId, 'activities');
    const q = query(
        entriesRef, 
        orderBy('date', 'desc'), 
        limit(limitCount)
    );
    return onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
        const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActivityLog));
        callback(entries);
    });
};


export const createJournalEntry = async (userId: string, entry: Omit<ActivityLog, 'id' | 'userId'>): Promise<string> => {
    const entriesRef = collection(db, 'users', userId, 'activities');
    const docRef = await addDoc(entriesRef, { ...entry, userId });
    return docRef.id;
};

export const updateJournalEntry = async (userId: string, entryId: string, data: Partial<ActivityLog>): Promise<void> => {
    const entryRef = doc(db, 'users', userId, 'activities', entryId);
    await updateDoc(entryRef, data);
};

export const deleteJournalEntry = async (userId: string, entryId: string): Promise<void> => {
    const entryRef = doc(db, 'users', userId, 'activities', entryId);
    await deleteDoc(entryRef);
};


// Training Templates
export const getTemplates = async (userId: string): Promise<TrainingTemplate[]> => {
    const templatesRef = collection(db, 'users', userId, 'templates');
    const querySnapshot = await getDocs(templatesRef);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TrainingTemplate));
};

export const subscribeToTemplates = (
    userId: string, 
    callback: (templates: TrainingTemplate[]) => void
): Unsubscribe => {
    const templatesRef = collection(db, 'users', userId, 'templates');
    return onSnapshot(templatesRef, { includeMetadataChanges: true }, (snapshot) => {
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
