// hooks/useAdminAuth.ts
import { auth, db } from '@/config/firebaseConfig';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

interface AdminUser extends User {
  isAdmin?: boolean;
}

export const useAdminAuth = () => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Verificar se o usuário tem campo admin=true no Firestore
          const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const adminStatus = userData.admin === true;
            
            setUser({
              ...user,
              isAdmin: adminStatus
            });
            setIsAdmin(adminStatus);
          } else {
            setUser(user);
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('Erro ao verificar admin:', error);
          setUser(user);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, isAdmin, loading };
};