import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDABx9QGgNdwghrH9PWVCusomr5uDLnny4",
    authDomain: "cosmochat-5d508.firebaseapp.com",
    projectId: "cosmochat-5d508",
    storageBucket: "cosmochat-5d508.firebasestorage.app",
    messagingSenderId: "207778958373",
    appId: "1:207778958373:web:25dc29734bc06f831083cc",
    measurementId: "G-VZB19630RD"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
