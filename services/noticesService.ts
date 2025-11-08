// src/services/noticesService.ts
import { Notice, NoticeFormData } from "@/types/Notice";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";

// Escuta atualizações em tempo real
export const listenToNotices = (callback: (notices: Notice[]) => void) => {
  const noticesRef = collection(db, "avisos");
  return onSnapshot(noticesRef, (snapshot) => {
    const notices = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Notice[];
    // Ordenar por data de criação (mais recentes primeiro)
    notices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(notices);
  });
};

// Adicionar novo aviso
export const addNotice = async (notice: NoticeFormData, userEmail: string) => {
  try {
    const noticesRef = collection(db, "avisos");
    const newNotice = {
      ...notice,
      createdAt: serverTimestamp(),
      createdBy: userEmail
    };
    
    const docRef = await addDoc(noticesRef, newNotice);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Erro ao adicionar aviso:", error);
    return { success: false, error };
  }
};

// Editar aviso existente
export const updateNotice = async (id: string, notice: NoticeFormData) => {
  try {
    const noticeRef = doc(db, "avisos", id);
    await updateDoc(noticeRef, notice);
    return { success: true };
  } catch (error) {
    console.error("Erro ao editar aviso:", error);
    return { success: false, error };
  }
};

// Apagar aviso
export const deleteNotice = async (id: string) => {
  try {
    const noticeRef = doc(db, "avisos", id);
    await deleteDoc(noticeRef);
    return { success: true };
  } catch (error) {
    console.error("Erro ao apagar aviso:", error);
    return { success: false, error };
  }
};