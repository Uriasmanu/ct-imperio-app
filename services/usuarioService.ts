
import { salvarCredenciaisSeguras } from "@/utils/credenciais";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../config/firebaseConfig";
import { Usuario } from "../types/usuarios";

export const criarUsuario = async (
  usuarioData: Omit<Usuario, "id"> & { senha?: string },
  id?: string
): Promise<{ success: boolean; id?: string; error?: string }> => {
  try {
    if (!id) throw new Error("É obrigatório informar o UID do usuário para criar o documento.");
    const usuarioId = id;


    const { senha, ...dadosSemSenha } = usuarioData;

    const usuarioDocRef = doc(db, "usuarios", usuarioId);

    const hoje = new Date();
    const dataPagamentoPadrao = new Date(hoje.getFullYear(), hoje.getMonth(), 10).toISOString();


    const usuarioCompleto: Usuario = {
      ...dadosSemSenha,
      id: usuarioId,
      dataDeRegistro: new Date().toISOString(),
      admin: usuarioData.admin ?? false,
      dataPagamento: usuarioData.dataPagamento ?? dataPagamentoPadrao,
    };

    await setDoc(usuarioDocRef, usuarioCompleto);

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
    await salvarCredenciaisSeguras(email, senha);

    return { success: true, user };
  } catch (error: any) {
    console.error("❌ Erro no login:", error);
    return { success: false, error: error.message };
  }
};

