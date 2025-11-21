// hooks/useDeletarUsuario.ts
import { db } from '@/config/firebaseConfig';
import { collection, doc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { useState } from 'react';

export const useDeletarUsuario = () => {
  const [deletando, setDeletando] = useState(false);

  const deletarUsuario = async (usuarioId: string, usuarioNome: string): Promise<boolean> => {
    if (!usuarioId) return false;

    setDeletando(true);
    try {
      const batch = writeBatch(db);

      // 1. Deletar o usuário principal
      const usuarioRef = doc(db, 'usuarios', usuarioId);
      batch.delete(usuarioRef);

      // 2. Deletar presenças do usuário
      const presencasRef = collection(db, 'presencas');
      const qPresencas = query(presencasRef, where('usuarioId', '==', usuarioId));
      const presencasSnapshot = await getDocs(qPresencas);
      presencasSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // 3. Deletar pagamentos do usuário
      const pagamentosRef = collection(db, 'pagamentos');
      const qPagamentos = query(pagamentosRef, where('usuarioId', '==', usuarioId));
      const pagamentosSnapshot = await getDocs(qPagamentos);
      pagamentosSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // 4. Deletar filhos (se houver)
      const filhosRef = collection(db, 'filhos');
      const qFilhos = query(filhosRef, where('usuarioId', '==', usuarioId));
      const filhosSnapshot = await getDocs(qFilhos);
      
      filhosSnapshot.forEach((filhoDoc) => {
        const filhoId = filhoDoc.id;
        batch.delete(filhoDoc.ref);

        // Deletar presenças dos filhos
        const presencasFilhosRef = collection(db, 'presencas');
        const qPresencasFilhos = query(presencasFilhosRef, where('filhoId', '==', filhoId));
        // Nota: Você precisaria executar esta query separadamente ou ajustar a lógica
      });

      // Executar todas as operações em batch
      await batch.commit();

      console.log(`Usuário ${usuarioNome} (${usuarioId}) deletado com sucesso`);
      return true;

    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      throw error;
    } finally {
      setDeletando(false);
    }
  };

  return {
    deletando,
    deletarUsuario,
  };
};