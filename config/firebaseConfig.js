// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDAcAcRQHu_PMCtXTIeLts09lQlz5jBHzQ",
  authDomain: "ct-imperio-app-6fd93.firebaseapp.com",
  projectId: "ct-imperio-app-6fd93",
  storageBucket: "ct-imperio-app-6fd93.firebasestorage.app",
  messagingSenderId: "40289926061",
  appId: "1:40289926061:web:62b83eab0f587516173f24",
  measurementId: "G-SZYS5Z4XVC"
};

// Inicializa o app
const app = initializeApp(firebaseConfig);

// Inicializa o banco Firestore
export const db = getFirestore(app);

// Exporta também o app se quiser usar em outros módulos
export default app;
