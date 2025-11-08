import { criarUsuario } from '@/services/usuarioService';
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

// Inicializa Auth e Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);


/**
 * Função para registrar um novo usuário com e-mail e senha no Firebase Auth.
 * Agora usando o usuarioService.ts
 * @param {string} email - O e-mail do usuário.
 * @param {string} password - A senha do usuário.
 * @param {object} userData - Dados adicionais do usuário (nome, telefone, etc.)
 * @returns {Promise<{success: boolean, user?: import('firebase/auth').User, error?: string}>}
 */
export const registerUser = async (email, password, userData = {}) => {
  let user = null;

  try {
    // 1. Criar usuário no Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    user = userCredential.user;

    // 2. Preparar dados para o Firestore usando as interfaces
    const usuarioFirestoreData = {
      nome: userData.nome || email.split('@')[0],
      modalidade: userData.modalidade || "",
      email: email,
      telefone: userData.telefone || "",
      observacao: userData.observacao || "",
      dataDeRegistro: new Date().toISOString(),
      filhos: userData.filhos || []
    };

    // 3. Usar o serviço criarUsuario para criar no Firestore
    const firestoreResult = await criarUsuario(usuarioFirestoreData, user.uid);

    if (!firestoreResult.success) {
      // 4. SE O FIRESTORE FALHAR, FAZEMOS O ROLLBACK
      console.warn("⚠️ Auth sucesso, Firestore falhou. Fazendo rollback...");
      
      try {
        await deleteUser(user);
  
      } catch (deleteError) {
        console.error("❌ Erro no rollback:", deleteError);
      }
      
      return { 
        success: false, 
        error: "Erro ao criar perfil no banco de dados. Tente novamente." 
      };
    }
    
    // 5. Sucesso completo
    return { success: true, user };

  } catch (error) {
    console.error("💥 Erro no registro:", error);
    
    // Tratamento de erros do Auth
    let errorMessage = "Ocorreu um erro desconhecido no registro.";
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'O e-mail fornecido já está em uso.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'O formato do e-mail é inválido.';
        break;
      case 'auth/weak-password':
        errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
        break;
      case 'auth/operation-not-allowed':
        errorMessage = 'Registro por e-mail/senha não habilitado. Verifique as configurações do Firebase.';
        break;
      default:
        errorMessage = `Erro: ${error.message}`;
        break;
    }
    
    return { success: false, error: errorMessage };
  }
};

/**
 * Função de login melhorada
 */
export const loginUser = async (email, password) => {
  try {
    // Implementação do login (se necessário)
    // Pode usar signInWithEmailAndPassword do Auth
  } catch (error) {
    console.error("Erro no login:", error);
    throw error;
  }
};

/**
 * Função para buscar usuário atual
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Função para logout
 */
export const logoutUser = async () => {
  try {
    await auth.signOut();
  } catch (error) {
    console.error("❌ Erro ao fazer logout:", error);
    throw error;
  }
};

// Exporta tudo o que é necessário
export default { 
  app, 
  auth, 
  db, 
  registerUser, 
  loginUser, 
  getCurrentUser, 
  logoutUser 
};


