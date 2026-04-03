import { collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc, query, orderBy, deleteDoc, limit, startAfter, type QueryDocumentSnapshot, type DocumentData } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Exercise, UserProfile, ActivityLog } from '../types';


// Exercises
export const getExercises = async (pageSize = 20, lastVisible?: QueryDocumentSnapshot<DocumentData>): Promise<{ exercises: Exercise[], lastVisible: QueryDocumentSnapshot<DocumentData> | null }> => {
    let q = query(
        collection(db, 'exercises'),
        orderBy('name'),
        limit(pageSize)
    );

    if (lastVisible) {
        q = query(q, startAfter(lastVisible));
    }

    const querySnapshot = await getDocs(q);
    const exercises = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exercise));
    const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
    
    return { exercises, lastVisible: lastDoc };
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
