import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getStorage, Storage } from "firebase-admin/storage";

let adminApp: App | undefined;

function getAdminApp(): App {
  if (!adminApp) {
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (getApps().length === 0) {
      adminApp = initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim(),
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim(),
          privateKey: privateKey?.trim(),
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim(),
      });
    } else {
      adminApp = getApps()[0];
    }
  }
  return adminApp;
}

let _adminDb: Firestore | undefined;
let _adminStorage: Storage | undefined;

export function getAdminDb(): Firestore {
  if (!_adminDb) {
    _adminDb = getFirestore(getAdminApp());
  }
  return _adminDb;
}

export function getAdminStorage(): Storage {
  if (!_adminStorage) {
    _adminStorage = getStorage(getAdminApp());
  }
  return _adminStorage;
}

// For backwards compatibility
export const adminDb = {
  collection: (path: string) => getAdminDb().collection(path),
};

export const adminStorage = {
  bucket: () => getAdminStorage().bucket(),
};
