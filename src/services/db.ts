import { collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc, query, orderBy, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import type { Exercise, UserProfile, ActivityLog } from '../types';

export const uploadImage = async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
};

export const deleteImage = async (url: string): Promise<void> => {
    try {
        const decodedUrl = decodeURIComponent(url);
        const startIndex = decodedUrl.indexOf('/o/') + 3;
        const endIndex = decodedUrl.indexOf('?');

        if (startIndex > 2 && endIndex > startIndex) {
            const filePath = decodedUrl.substring(startIndex, endIndex);
            const storageRef = ref(storage, filePath);
            await deleteObject(storageRef);
        }
    } catch (error) {
        console.error("Error deleting image from storage:", error);
    }
};

// Exercises
export const getExercises = async (): Promise<Exercise[]> => {
    const querySnapshot = await getDocs(collection(db, 'exercises'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exercise));
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
    const exe = await getExerciseById(id);
    const docRef = doc(db, 'exercises', id);
    await deleteDoc(docRef);

    if (exe && exe.images && exe.images.length > 0) {
        for (const url of exe.images) {
            if (url.includes('firebasestorage')) {
                await deleteImage(url);
            }
        }
    }
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
