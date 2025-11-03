// src/services/noticesService.ts
import { Notice } from "@/types/Notice";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebaseConfig";


// Escuta atualizações em tempo real
export const listenToNotices = (callback: (notices: Notice[]) => void) => {
  const noticesRef = collection(db, "avisos");
  return onSnapshot(noticesRef, (snapshot) => {
    const notices = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Notice[];
    callback(notices);
  });
};
