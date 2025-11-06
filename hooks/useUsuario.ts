import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useCallback, useEffect, useState } from 'react';
import { Alert } from "react-native";

import { auth, db } from "@/config/firebaseConfig";
import { ModalidadeAluno, Usuario } from "@/types/usuarios";

export const useUsuario = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [atualizacao, setAtualizacao] = useState(0);

  const migrarModalidadeUnicaParaArray = async (userData: any, userRef: any) => {
    if (userData.modalidade && !userData.modalidades) {
      const modalidadeUnica: ModalidadeAluno = {
        modalidade: userData.modalidade,
        graduacao: userData.graduacao,
        dataInicio: userData.dataDeRegistro,
        ativo: true
      };
      userData.modalidades = [modalidadeUnica];
      
      await updateDoc(userRef, {
        modalidades: [modalidadeUnica]
      });
    }
    
    if (!userData.modalidades) {
      userData.modalidades = [];
    }
  };

  const carregarUsuario = useCallback(async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userRef = doc(db, "usuarios", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const userData = snap.data() as any;
          
          await migrarModalidadeUnicaParaArray(userData, userRef);
          setUsuario(userData as Usuario);
        }
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        Alert.alert("Erro", "Não foi possível carregar os dados.");
      }
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  const verificarPagamentosFilhos = useCallback(async () => {
    if (!usuario?.id || !usuario.filhos) return;

    const hoje = new Date();
    let atualizou = false;

    const filhosAtualizados = usuario.filhos.map(filho => {
      if (!filho.dataUltimoPagamento) return filho;

      const ultimaData = new Date(filho.dataUltimoPagamento);
      const diffDias = Math.floor((hoje.getTime() - ultimaData.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDias >= 30 && filho.pagamento) {
        atualizou = true;
        return { ...filho, pagamento: false };
      }
      return filho;
    });

    if (atualizou) {
      try {
        const userRef = doc(db, "usuarios", usuario.id);
        await updateDoc(userRef, { filhos: filhosAtualizados });
        setUsuario(prev => prev ? { ...prev, filhos: filhosAtualizados } : prev);
      } catch (error) {
        console.error("Erro ao atualizar pagamentos:", error);
      }
    }
  }, [usuario]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    carregarUsuario();
  }, [carregarUsuario]);

  const handlePagamentoAtualizado = useCallback(() => {
    setAtualizacao(prev => prev + 1);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await carregarUsuario();
      } else {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [carregarUsuario, atualizacao]);

  useEffect(() => {
    if (usuario) {
      verificarPagamentosFilhos();
    }
  }, [usuario, verificarPagamentosFilhos]);

  return {
    usuario,
    setUsuario,
    loading,
    setLoading,
    refreshing,
    carregarUsuario,
    onRefresh,
    handlePagamentoAtualizado
  };
};