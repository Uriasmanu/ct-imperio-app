import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { GraduacaoSelector } from '@/components/perfil/GraduacaoSelector';
import { Filho, GraduacaoJiuJitsu, GraduacaoMuayThai } from '@/types/usuarios';

interface ModalFilhoProps {
  visible: boolean;
  filhoEmEdicao: Filho | null;
  onClose: () => void;
  onAdicionarFilho: (filho: Omit<Filho, 'id'>) => Promise<void>;
  onSalvarEdicaoFilho: (filho: Filho) => Promise<void>;
}

export const ModalFilho: React.FC<ModalFilhoProps> = ({
  visible,
  filhoEmEdicao,
  onClose,
  onAdicionarFilho,
  onSalvarEdicaoFilho,
}) => {
  // Estado local para gerenciar os dados do formulário
  const [dadosFilho, setDadosFilho] = useState<Omit<Filho, 'id'> | Filho>({
    nome: '',
    idade: 0,
    modalidade: 'Jiu-Jitsu',
    graduacao: { cor: 'Branca', grau: 1 },
    dataDeRegistro: new Date().toISOString().split('T')[0],
    pagamento: false,
    observacao: '',
    dataPagamento: new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString(),
    dataUltimoPagamento: '',
  });

  // Atualiza os dados quando o filhoEmEdicao muda
  useEffect(() => {
    if (filhoEmEdicao) {
      setDadosFilho(filhoEmEdicao);
    } else {
      // Reset para valores padrão quando for adicionar novo
      setDadosFilho({
        nome: '',
        idade: 0,
        modalidade: 'Jiu-Jitsu',
        graduacao: { cor: 'Branca', grau: 1 },
        dataDeRegistro: new Date().toISOString().split('T')[0],
        pagamento: false,
        observacao: '',
        dataPagamento: new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString(),
        dataUltimoPagamento: '',
      });
    }
  }, [filhoEmEdicao, visible]);

  const modalTitle = filhoEmEdicao ? 'Editar Aluno' : 'Adicionar Aluno';

  const closeModal = () => {
    onClose();
  };

  const handleSubmit = async () => {
    if (!dadosFilho.nome?.trim()) {
      alert('Por favor, informe o nome do aluno.');
      return;
    }

    if (!dadosFilho.idade || dadosFilho.idade <= 0) {
      alert('Por favor, informe uma idade válida.');
      return;
    }

    try {
      if (filhoEmEdicao) {
        // Edição - garante que o ID seja preservado
        await onSalvarEdicaoFilho({
          ...dadosFilho,
          id: filhoEmEdicao.id,
        } as Filho);
      } else {
        // Novo - gera um ID temporário
        await onAdicionarFilho(dadosFilho);
      }
      closeModal();
    } catch (error) {
      console.error('Erro ao salvar aluno:', error);
    }
  };

  const handleModalidadeChange = (modalidade: Filho['modalidade']) => {
    if (modalidade === 'Jiu-Jitsu') {
      setDadosFilho(prev => ({
        ...prev,
        modalidade: modalidade,
        graduacao: { cor: 'Branca', grau: 1 }
      }));
    } else if (modalidade === 'Muay Thai') {
      setDadosFilho(prev => ({
        ...prev,
        modalidade: modalidade,
        graduacao: { cor: 'Amarela', pontaBranca: false }
      }));
    } else {
      setDadosFilho(prev => ({
        ...prev,
        modalidade: modalidade,
        graduacao: undefined
      }));
    }
  };

  const handleGraduacaoChange = (graduacao: GraduacaoJiuJitsu | GraduacaoMuayThai) => {
    setDadosFilho(prev => ({
      ...prev,
      graduacao: graduacao
    }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={closeModal}
      statusBarTranslucent={true}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <TouchableOpacity onPress={closeModal}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalScrollView}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            bounces={true}
          >
            <TextInput
              style={styles.modalInput}
              placeholder="Nome completo *"
              placeholderTextColor="#666"
              value={dadosFilho.nome}
              onChangeText={(text) => setDadosFilho(prev => ({ ...prev, nome: text }))}
              returnKeyType="next"
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Idade *"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={dadosFilho.idade?.toString() || ''}
              onChangeText={(text) => setDadosFilho(prev => ({ ...prev, idade: Number(text) || 0 }))}
              returnKeyType="next"
            />

            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="Observações (opcional)"
              placeholderTextColor="#666"
              value={dadosFilho.observacao || ''}
              onChangeText={(text) => setDadosFilho(prev => ({ ...prev, observacao: text }))}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              returnKeyType="done"
            />

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Modalidade:</Text>
              <View style={styles.modalidadeButtons}>
                <TouchableOpacity
                  style={[
                    styles.modalidadeButton,
                    dadosFilho.modalidade === 'Jiu-Jitsu' && styles.modalidadeButtonSelected,
                  ]}
                  onPress={() => handleModalidadeChange('Jiu-Jitsu')}
                >
                  <Text
                    style={[
                      styles.modalidadeButtonText,
                      dadosFilho.modalidade === 'Jiu-Jitsu' && styles.modalidadeButtonTextSelected,
                    ]}
                  >
                    Jiu-Jitsu
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalidadeButton,
                    dadosFilho.modalidade === 'Muay Thai' && styles.modalidadeButtonSelected,
                  ]}
                  onPress={() => handleModalidadeChange('Muay Thai')}
                >
                  <Text
                    style={[
                      styles.modalidadeButtonText,
                      dadosFilho.modalidade === 'Muay Thai' && styles.modalidadeButtonTextSelected,
                    ]}
                  >
                    Muay Thai
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Graduação:</Text>
              <GraduacaoSelector
                modalidade={dadosFilho.modalidade}
                graduacaoAtual={dadosFilho.graduacao}
                onSelect={handleGraduacaoChange}
              />
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={closeModal}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleSubmit}
            >
              <Text style={styles.confirmButtonText}>
                {filhoEmEdicao ? 'Salvar' : 'Adicionar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '90%',
    minHeight: '60%', // Garante uma altura mínima
    borderWidth: 1,
    borderColor: '#333',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  modalScrollView: {
    flex: 1, // Agora ocupa todo o espaço disponível
  },
  modalScrollContent: {
    padding: 20,
    gap: 20,
    paddingBottom: 10, // Espaço extra no final
  },
  modalSection: {
    gap: 12,
  },
  modalInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 16,
    color: '#FFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  textArea: {
    minHeight: 120, // Altura maior para área de texto
    textAlignVertical: 'top',
  },
  modalLabel: {
    fontSize: 16,
    color: '#B8860B',
    fontWeight: '600',
  },
  modalidadeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  modalidadeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  modalidadeButtonSelected: {
    backgroundColor: '#B8860B',
    borderColor: '#DAA520',
  },
  modalidadeButtonText: {
    color: '#CCC',
    fontWeight: '500',
    fontSize: 14,
  },
  modalidadeButtonTextSelected: {
    color: '#000',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#333',
  },
  confirmButton: {
    backgroundColor: '#B8860B',
  },
  cancelButtonText: {
    color: '#CCC',
    fontWeight: '600',
    fontSize: 16,
  },
  confirmButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  },
});