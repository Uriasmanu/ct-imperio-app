import { initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
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


// Função de registro
export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    return { success: false, message: error.message };
  }
};

// Inicializa e exporta os serviços principais
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
