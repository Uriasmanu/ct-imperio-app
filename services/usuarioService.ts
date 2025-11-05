import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../config/firebaseConfig";
import { Usuario } from "../types/usuarios";

/**
 * CRIA um novo documento de usuário no Firestore (sem armazenar senha)
 */
export const criarUsuario = async (
  usuarioData: Omit<Usuario, "id"> & { senha?: string },
  id?: string
): Promise<{ success: boolean; id?: string; error?: string }> => {
  try {
    // Gera um ID único se não foi fornecido
    if (!id) throw new Error("É obrigatório informar o UID do usuário para criar o documento.");
    const usuarioId = id;


    // Remove o campo "senha" se vier por engano
    const { senha, ...dadosSemSenha } = usuarioData;

    // Cria a REFERÊNCIA do documento
    const usuarioDocRef = doc(db, "usuarios", usuarioId);

    const hoje = new Date();
    const dataPagamentoPadrao = new Date(hoje.getFullYear(), hoje.getMonth(), 10).toISOString();


    // Dados completos do usuário (sem senha)
    const usuarioCompleto: Usuario = {
      ...dadosSemSenha,
      id: usuarioId,
      dataDeRegistro: new Date().toISOString(),
      admin: usuarioData.admin ?? false,
      dataPagamento: usuarioData.dataPagamento ?? dataPagamentoPadrao,
    };

    // Grava no Firestore
    await setDoc(usuarioDocRef, usuarioCompleto);

    console.log("✅ Documento criado com ID:", usuarioId);
    return { success: true, id: usuarioId };
  } catch (error: any) {
    console.error("❌ Erro ao criar documento:", error);
    return { success: false, error: error.message };
  }
};

/**
 * LOGIN de usuário usando Firebase Auth
 */
export const loginUsuario = async (
  email: string,
  senha: string
): Promise<{ success: boolean; user?: any; error?: string }> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    const user = userCredential.user;
    console.log("✅ Login bem-sucedido:", user.uid);
    return { success: true, user };
  } catch (error: any) {
    console.error("❌ Erro no login:", error);
    return { success: false, error: error.message };
  }
};
