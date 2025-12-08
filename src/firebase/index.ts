
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

import { firebaseConfig } from './config';
export {
  FirebaseProvider,
  useFirebase,
  useFirebaseApp,
  useAuth,
  useFirestore,
} from './provider';

export { FirebaseClientProvider } from './client-provider';

export type FirebaseApps = {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

// Call this function to initialize Firebase and get the services.
// This function is idempotent, so it can be called multiple times.
export function initializeFirebase(): FirebaseApps {
  const firebaseApp =
    getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);
  return { firebaseApp, auth, firestore };
}
