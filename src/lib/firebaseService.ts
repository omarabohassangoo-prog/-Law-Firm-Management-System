import { db } from './firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
  Unsubscribe
} from 'firebase/firestore';

/**
 * Generic Firestore CRUD Operations Helper for Law Firm Management
 */

// Fetch all documents in a collection
export async function getCollectionData<T = DocumentData>(collectionName: string): Promise<T[]> {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
  } catch (error) {
    console.error(`Error fetching collection ${collectionName}:`, error);
    return [];
  }
}

// Subscribe to real-time updates for a collection
export function subscribeToCollection<T = DocumentData>(
  collectionName: string,
  callback: (data: T[]) => void
): Unsubscribe {
  const colRef = collection(db, collectionName);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
      callback(items);
    },
    (error) => {
      console.warn(`Firestore snapshot error on ${collectionName}:`, error);
    }
  );
}

// Save or overwrite a document
export async function saveDocument(collectionName: string, docId: string, data: Record<string, any>): Promise<boolean> {
  try {
    await setDoc(doc(db, collectionName, docId), {
      ...data,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error(`Error saving document ${docId} in ${collectionName}:`, error);
    return false;
  }
}

// Update specific fields of a document
export async function updateDocumentFields(collectionName: string, docId: string, updates: Record<string, any>): Promise<boolean> {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error(`Error updating document ${docId} in ${collectionName}:`, error);
    return false;
  }
}

// Delete a document
export async function deleteDocument(collectionName: string, docId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, collectionName, docId));
    return true;
  } catch (error) {
    console.error(`Error deleting document ${docId} in ${collectionName}:`, error);
    return false;
  }
}
