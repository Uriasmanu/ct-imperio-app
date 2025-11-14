// src/hooks/usePresencaAdmin.ts
import { db } from '@/config/firebaseConfig';
import { PresencaRecord } from '@/types/usuarios';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Alert } from 'react-native';

export const usePresencaAdmin = () => {
  const [loading, setLoading] = useState(false);

  // Utilitário para formatar a data como YYYY-MM-DD
  const formatDate = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const today = new Date();
  const todayString = formatDate(today);

  // Verificar se é 1º de janeiro
  const isFirstJanuary = () => {
    return today.getMonth() === 0 && today.getDate() === 1;
  };

  // Função para verificar se já tem presença hoje (para usuário específico)
  const checkPresencaToday = async (userId: string, isChild: boolean = false, childId?: string): Promise<{ hasPresenca: boolean; isConfirmed: boolean }> => {
    try {
      const userDocRef = doc(db, "usuarios", userId);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        return { hasPresenca: false, isConfirmed: false };
      }

      const userData = userDoc.data();

      let presencaArray: any[] = [];

      if (isChild && childId) {
        const filhos = userData.filhos || [];
        const filho = filhos.find((f: any) => f.id === childId);
        presencaArray = filho?.Presenca || [];
      } else {
        presencaArray = userData.Presenca || [];
      }

      // Verificar se tem presença hoje
      const presencaHoje = presencaArray.find((presenca: any) => {
        const presencaDate = typeof presenca === 'string' ? presenca : presenca.date;
        return presencaDate === todayString;
      });

      if (!presencaHoje) {
        return { hasPresenca: false, isConfirmed: false };
      }

      // Se for objeto, verificar se está confirmada
      const isConfirmed = typeof presencaHoje === 'object' ? presencaHoje.confirmada || false : false;

      return { hasPresenca: true, isConfirmed };
    } catch (error) {
      console.error('Erro ao verificar presença:', error);
      return { hasPresenca: false, isConfirmed: false };
    }
  };

  // Função para marcar presença (admin)
  const checkInAdmin = async (userId: string, userName: string, isChild: boolean = false, childId?: string, childName?: string): Promise<boolean> => {
    if (isFirstJanuary()) {
      Alert.alert('Aviso', 'Não é permitido marcar presença no dia 1º de janeiro');
      return false;
    }

    setLoading(true);
    try {
      const userDocRef = doc(db, "usuarios", userId);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        Alert.alert('Erro', 'Usuário não encontrado');
        return false;
      }

      const userData = userDoc.data();

      // Verificar se já tem presença hoje
      const { hasPresenca } = await checkPresencaToday(userId, isChild, childId);
      if (hasPresenca) {
        Alert.alert('Aviso', `${childName || userName} já marcou presença para hoje.`);
        return false;
      }

      const newRecord: PresencaRecord = {
        date: todayString,
        confirmada: false
      };

      if (isChild && childId) {
        const filhos = userData.filhos || [];
        const filhoIndex = filhos.findIndex((f: any) => f.id === childId);
        
        if (filhoIndex === -1) {
          Alert.alert('Erro', 'Aluno dependente não encontrado');
          return false;
        }

        const filhoAtual = filhos[filhoIndex];
        const presencasAtuais: PresencaRecord[] = filhoAtual.Presenca || [];
        const novasPresencas = [...presencasAtuais, newRecord];
        
        const novosFilhos = [...filhos];
        novosFilhos[filhoIndex] = { ...filhoAtual, Presenca: novasPresencas };

        await updateDoc(userDocRef, { filhos: novosFilhos });
      } else {
        const presencasAtuais: PresencaRecord[] = userData.Presenca || [];
        const novasPresencas = [...presencasAtuais, newRecord];
        
        await updateDoc(userDocRef, { Presenca: novasPresencas });
      }

      Alert.alert('Sucesso', `Presença de ${childName || userName} registrada com sucesso!`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao marcar presença (admin):', error);
      Alert.alert('Erro', 'Não foi possível registrar a presença');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    checkInAdmin,
    checkPresencaToday,
    todayString,
    isFirstJanuary: isFirstJanuary(),
  };
};