
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDCfCg628NCOQZ3v2sR9DFIwYXEzKtZu_Q",
  authDomain: "firdousia-c1428.firebaseapp.com",
  projectId: "firdousia-c1428",
  storageBucket: "firdousia-c1428.appspot.com",
  messagingSenderId: "668966495014",
  appId: "1:668966495014:web:72e9fdc5bec0e5d20057e7",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
