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
  limit,
  DocumentData,
  Unsubscribe,
} from 'firebase/firestore';

/**
 * Robust Realtime Two-Way Sync between Firestore and Local Application State
 */

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMessage = error instanceof Error ? error.message : String(error);
  console.warn(`[Firestore ${operationType.toUpperCase()}] at ${path}:`, errMessage);
}

// Subscribe to collection changes with error boundary
export function subscribeCollectionLive<T = DocumentData>(
  collectionName: string,
  onData: (items: T[]) => void
): Unsubscribe {
  try {
    const colRef = collection(db, collectionName);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          })) as T[];
          onData(items);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, collectionName);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, collectionName);
    return () => {};
  }
}

// Mutate or create a document with Firestore and fallback handling
export async function syncSetDocument(
  collectionName: string,
  docId: string,
  data: Record<string, any>
): Promise<boolean> {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${collectionName}/${docId}`);
    return false;
  }
}

// Update specific fields in Firestore
export async function syncUpdateDocument(
  collectionName: string,
  docId: string,
  updates: Record<string, any>
): Promise<boolean> {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, { ...updates, updatedAt: new Date().toISOString() });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${collectionName}/${docId}`);
    return false;
  }
}

// Delete document from Firestore
export async function syncDeleteDocument(collectionName: string, docId: string): Promise<boolean> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${collectionName}/${docId}`);
    return false;
  }
}
