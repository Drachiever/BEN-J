import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Product, Order, StoreSettings, User } from '../types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Configure Google Auth Provider with Workspace Scopes
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/drive');
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
googleProvider.addScope('https://www.googleapis.com/auth/drive.readonly');
googleProvider.addScope('https://www.googleapis.com/auth/spreadsheets');
googleProvider.addScope('https://www.googleapis.com/auth/spreadsheets.readonly');

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test helper as required by Firebase skill
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, '_connection_test', 'test'));
    console.log("Firestore connection active");
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.warn("Firestore appears offline or initializing.");
    }
  }
}

// In-Memory Google OAuth Access Token Cache
let cachedAccessToken: string | null = null;

export const getCachedOAuthToken = (): string | null => cachedAccessToken;
export const setCachedOAuthToken = (token: string | null) => {
  cachedAccessToken = token;
};

// Google Popup Login with Access Token Extraction
export const signInWithGoogleOAuth = async (): Promise<{ firebaseUser: FirebaseUser; accessToken: string }> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken || '';
    if (accessToken) {
      cachedAccessToken = accessToken;
    }
    return { firebaseUser: result.user, accessToken };
  } catch (err) {
    console.error('Google Sign-In failed:', err);
    throw err;
  }
};

export const signOutFirebase = async () => {
  cachedAccessToken = null;
  await firebaseSignOut(auth);
};

// Firestore helper functions
export const fetchProductsFromFirestore = async (): Promise<Product[]> => {
  const path = 'products';
  try {
    const snap = await getDocs(collection(db, path));
    const products: Product[] = [];
    snap.forEach((d) => {
      products.push({ id: d.id, ...d.data() } as Product);
    });
    return products;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return [];
  }
};

export const saveProductToFirestore = async (product: Product): Promise<void> => {
  const path = `products/${product.id}`;
  try {
    await setDoc(doc(db, 'products', product.id), product, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};

export const deleteProductFromFirestore = async (productId: string): Promise<void> => {
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
};

export const saveOrderToFirestore = async (order: Order): Promise<void> => {
  const path = `orders/${order.id}`;
  try {
    await setDoc(doc(db, 'orders', order.id), order, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};

export const fetchOrdersFromFirestore = async (): Promise<Order[]> => {
  const path = 'orders';
  try {
    const snap = await getDocs(collection(db, path));
    const orders: Order[] = [];
    snap.forEach((d) => {
      orders.push({ id: d.id, ...d.data() } as Order);
    });
    return orders;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return [];
  }
};

export const saveStoreSettingsToFirestore = async (settings: StoreSettings): Promise<void> => {
  const path = 'settings/store';
  try {
    await setDoc(doc(db, 'settings', 'store'), settings, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};

export const fetchStoreSettingsFromFirestore = async (): Promise<StoreSettings | null> => {
  const path = 'settings/store';
  try {
    const snap = await getDocFromServer(doc(db, 'settings', 'store'));
    if (snap.exists()) {
      return snap.data() as StoreSettings;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return null;
  }
};
