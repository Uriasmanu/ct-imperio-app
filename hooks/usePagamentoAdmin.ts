// hooks/usePagamentoAdmin.ts
import { db } from '@/config/firebaseConfig';
import { Filho, Usuario } from '@/types/usuarios';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Alert } from 'react-native';

interface UsePagamentoAdminProps {
  item: Usuario | Filho;
  usuarioId?: string;
  tipo: 'usuario' | 'filho';
  onPagamentoAtualizado: () => void;
}

export const usePagamentoAdmin = ({
  item,
  usuarioId,
  tipo,
  onPagamentoAtualizado,
}: UsePagamentoAdminProps) => {
  const [modalPagamento, setModalPagamento] = useState(false);
  const [processando, setProcessando] = useState(false);

  // FUNÇÃO DO ADMIN: Confirmar pagamento
  const handleConfirmarPagamento = async () => {
    setProcessando(true);
    try {
      if (tipo === 'filho' && usuarioId) {
        const userRef = doc(db, 'usuarios', usuarioId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const usuarioData = userSnap.data() as Usuario;
          const filhosAtualizados = usuarioData.filhos?.map((f) =>
            f.id === item.id
              ? {
                  ...f,
                  pagamento: true,
                  avisoPagamento: false,
                  dataUltimoPagamento: new Date().toISOString(),
                }
              : f
          );

          await updateDoc(userRef, { filhos: filhosAtualizados });
        }
      } else {
        const userRef = doc(db, 'usuarios', item.id);
        await updateDoc(userRef, {
          pagamento: true,
          avisoPagamento: false,
          dataUltimoPagamento: new Date().toISOString(),
        });
      }

      onPagamentoAtualizado();
      Alert.alert('Sucesso', `Pagamento de ${item.nome} confirmado com sucesso!`);
      setModalPagamento(false);
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      Alert.alert('Erro', 'Não foi possível confirmar o pagamento.');
    } finally {
      setProcessando(false);
    }
  };

  // FUNÇÃO DO ADMIN: Reverter para pendente
  const handleReverterPagamento = async () => {
    setProcessando(true);
    try {
      if (tipo === 'filho' && usuarioId) {
        const userRef = doc(db, 'usuarios', usuarioId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const usuarioData = userSnap.data() as Usuario;
          const filhosAtualizados = usuarioData.filhos?.map((f) =>
            f.id === item.id
              ? {
                  ...f,
                  pagamento: false,
                  avisoPagamento: false,
                }
              : f
          );

          await updateDoc(userRef, { filhos: filhosAtualizados });
        }
      } else {
        const userRef = doc(db, 'usuarios', item.id);
        await updateDoc(userRef, {
          pagamento: false,
          avisoPagamento: false,
        });
      }

      onPagamentoAtualizado();
      Alert.alert('Sucesso', `Pagamento de ${item.nome} revertido para pendente!`);
      setModalPagamento(false);
    } catch (error) {
      console.error('Erro ao reverter pagamento:', error);
      Alert.alert('Erro', 'Não foi possível reverter o pagamento.');
    } finally {
      setProcessando(false);
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const getStatusInfo = () => {
    if (item.pagamento) {
      return {
        texto: 'Pago',
        textoLongo: 'Pago',
        cor: '#22c55e',
        icone: 'checkmark-circle',
        descricao: 'Pagamento confirmado pelo administrador',
      };
    } else if (item.avisoPagamento) {
      return {
        texto: 'Aguardando',
        textoLongo: 'Aguardando Confirmação',
        cor: '#f59e0b',
        icone: 'time',
        descricao: 'Aluno avisou que pagou - aguardando confirmação',
      };
    } else {
      return {
        texto: 'Pendente',
        textoLongo: 'Pendente',
        cor: '#ef4444',
        icone: 'alert-circle',
        descricao: 'Aguardando pagamento',
      };
    }
  };

  return {
    // Estados
    modalPagamento,
    setModalPagamento,
    processando,
    
    // Funções do ADMIN
    handleConfirmarPagamento,
    handleReverterPagamento,
    formatarData,
    getStatusInfo,
    
    // Dados computados
    dataUltimoPagamento: 'dataUltimoPagamento' in item ? item.dataUltimoPagamento : undefined,
  };
};