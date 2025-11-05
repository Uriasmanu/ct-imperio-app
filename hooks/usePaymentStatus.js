// hooks/usePaymentStatus.js
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../config/firebase';

export const usePaymentStatus = (userId) => {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const userRef = doc(db, 'users', userId);
    
    // Listener em tempo real
    const unsubscribe = onSnapshot(userRef, async (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        await checkAndUpdatePaymentStatus(userRef, userData);
        setPaymentStatus(userData.paymentStatus);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const checkAndUpdatePaymentStatus = async (userRef, userData) => {
    const today = new Date();
    const lastCheck = userData.lastStatusCheck ? new Date(userData.lastStatusCheck) : new Date(0);
    
    // Só verifica se já passou um dia desde a última verificação
    if ((today - lastCheck) < (24 * 60 * 60 * 1000)) {
      return;
    }

    const paymentDay = userData.paymentDay || 10;
    const currentDay = today.getDate();

    // Se é dia 1 e o status ainda está como true, atualiza para false
    if (currentDay === 1 && userData.paymentStatus === true) {
      await updateDoc(userRef, {
        paymentStatus: false,
        lastStatusCheck: today.toISOString()
      });
    }

    // Atualiza a data da última verificação
    await updateDoc(userRef, {
      lastStatusCheck: today.toISOString()
    });
  };

  return { paymentStatus, loading };
};