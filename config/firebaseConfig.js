import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Suas credenciais do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDAcAcRQHu_PMCtXTIeLts09lQlz5jBHzQ",
  authDomain: "ct-imperio-app-6fd93.firebaseapp.com",
  projectId: "ct-imperio-app-6fd93",
  storageBucket: "ct-imperio-app-6fd93.firebasestorage.app",
  messagingSenderId: "40289926061",
  appId: "1:40289926061:web:62b83eab0f587516173f24",
  measurementId: "G-SZYS5Z4XVC"
};

// Inicializa o app Firebase
const app = initializeApp(firebaseConfig);

// Inicializa e exporta os serviços principais
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
