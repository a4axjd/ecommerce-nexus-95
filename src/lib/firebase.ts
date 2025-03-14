
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDCfCg628NCOQZ3v2sR9DFIwYXEzKtZu_Q",
  authDomain: "firdousia-c1428.firebaseapp.com",
  projectId: "firdousia-c1428",
  storageBucket: "firdousia-c1428.appspot.com",
  messagingSenderId: "668966495014",
  appId: "1:668966495014:web:72e9fdc5bec0e5d20057e7",
  databaseURL: "https://firdousia-c1428-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app);
