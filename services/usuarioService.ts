// src/services/usuarioService.ts
import {
    doc,
    setDoc
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { Usuario } from '../types/usuarios';

/**
 * CRIA um novo documento de usuário no Firestore
 * @param usuarioData Dados do usuário (sem o ID)
 * @param id Opcional - ID customizado (se não informado, gera automaticamente)
 * @returns Promise com sucesso e ID do documento
 */
export const criarUsuario = async (
  usuarioData: Omit<Usuario, 'id'>, 
  id?: string
): Promise<{success: boolean; id?: string; error?: string}> => {
  try {
    // Gera um ID único se não foi fornecido
    const usuarioId = id || `user_${Date.now()}`;
    
    // Cria a REFERÊNCIA do documento
    const usuarioDocRef = doc(db, "usuarios", usuarioId);
    
    // Dados completos do usuário (agora incluindo o ID)
    const usuarioCompleto: Usuario = {
      ...usuarioData,
      id: usuarioId, // ✅ CORRETO - estamos adicionando o ID aqui
      dataDeRegistro: new Date().toISOString()
    };
    
    // CRIA o documento no Firestore
    await setDoc(usuarioDocRef, usuarioCompleto);
    
    console.log("✅ Documento criado com ID:", usuarioId);
    return { success: true, id: usuarioId };
    
  } catch (error: any) {
    console.error("❌ Erro ao criar documento:", error);
    return { success: false, error: error.message };
  }
};