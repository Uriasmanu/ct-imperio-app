// src/screens/PerfilScreen.tsx
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Filho, GraduacaoJiuJitsu, GraduacaoMuayThai, Usuario } from '../types/usuarios';

// Mock data - substitua pelos dados reais do seu usuário
const mockUsuario: Usuario = {
  id: '1',
  nome: 'Carlos Silva',
  modalidade: 'Jiu-Jitsu',
  graduacao: { cor: 'Azul', grau: 2 },
  email: 'carlos.silva@email.com',
  telefone: '+55 (14) 99999-9999',
  dataDeRegistro: '2024-01-15',
  filhos: [
    {
      id: '1-1',
      nome: 'Ana Silva',
      modalidade: 'Muay Thai',
      graduacao: { cor: 'Verde', pontaBranca: true },
      dataDeRegistro: '2024-02-01'
    },
    {
      id: '1-2',
      nome: 'Pedro Silva',
      modalidade: 'Jiu-Jitsu',
      graduacao: { cor: 'Branca', grau: 3 },
      dataDeRegistro: '2024-02-01'
    }
  ]
};

export default function PerfilScreen() {
  const [usuario, setUsuario] = useState<Usuario>(mockUsuario);
  const [editando, setEditando] = useState(false);
  const [modalFilho, setModalFilho] = useState(false);
  const [novoFilho, setNovoFilho] = useState<Partial<Filho>>({
    nome: '',
    modalidade: 'Jiu-Jitsu',
    graduacao: { cor: 'Branca', grau: 1 }
  });

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarGraduacao = (graduacao?: GraduacaoMuayThai | GraduacaoJiuJitsu, modalidade?: string) => {
    if (modalidade === 'Muay Thai') {
      const grad = graduacao as GraduacaoMuayThai;
      return grad.pontaBranca ? `${grad.cor} (Ponta Branca)` : grad.cor;
    } else {
      const grad = graduacao as GraduacaoJiuJitsu;
      return `${grad.cor} - ${grad.grau}º Grau`;
    }
  };

  const handleSalvarPerfil = () => {
    // Aqui você integraria com sua API
    Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    setEditando(false);
  };

  const handleAdicionarFilho = () => {
    if (!novoFilho.nome) {
      Alert.alert('Erro', 'Por favor, informe o nome do filho.');
      return;
    }

    const filhoCompleto: Filho = {
      id: Date.now().toString(),
      nome: novoFilho.nome!,
      modalidade: novoFilho.modalidade!,
      graduacao: novoFilho.graduacao!,
      dataDeRegistro: new Date().toISOString().split('T')[0]
    };

    setUsuario(prev => ({
      ...prev,
      filhos: [...(prev.filhos || []), filhoCompleto]
    }));

    setModalFilho(false);
    setNovoFilho({
      nome: '',
      modalidade: 'Jiu-Jitsu',
      graduacao: { cor: 'Branca', grau: 1 }
    });

    Alert.alert('Sucesso', 'Filho adicionado com sucesso!');
  };

  const renderInfoField = (label: string, value: string, editable?: boolean) => (
    <View style={styles.infoField}>
      <Text style={styles.infoLabel}>{label}</Text>
      {editable && editando ? (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(text) => setUsuario(prev => ({ ...prev, [label.toLowerCase()]: text }))}
        />
      ) : (
        <Text style={styles.infoValue}>{value}</Text>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header do Perfil */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {usuario.nome.split(' ').map(n => n[0]).join('').toUpperCase()}
          </Text>
        </View>
        <Text style={styles.userName}>{usuario.nome}</Text>
        <Text style={styles.userGraduacao}>
          {formatarGraduacao(usuario.graduacao, usuario.modalidade)}
        </Text>
        <Text style={styles.userModalidade}>{usuario.modalidade}</Text>
      </View>

      {/* Informações Pessoais */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>INFORMAÇÕES PESSOAIS</Text>
          <TouchableOpacity onPress={() => setEditando(!editando)}>
            <Text style={styles.editButton}>
              {editando ? 'Cancelar' : 'Editar'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          {renderInfoField('Nome', usuario.nome, true)}
          {renderInfoField('Email', usuario.email, true)}
          {renderInfoField('Telefone', usuario.telefone, true)}
          {renderInfoField('Data de Registro', formatarData(usuario.dataDeRegistro))}
          
          {editando && (
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSalvarPerfil}
            >
              <Text style={styles.saveButtonText}>Salvar Alterações</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Seção de Filhos */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>FILHOS CADASTRADOS</Text>
          <TouchableOpacity onPress={() => setModalFilho(true)}>
            <Text style={styles.addButton}>+ Adicionar</Text>
          </TouchableOpacity>
        </View>

        {usuario.filhos && usuario.filhos.length > 0 ? (
          usuario.filhos.map((filho) => (
            <View key={filho.id} style={styles.filhoCard}>
              <View style={styles.filhoHeader}>
                <Text style={styles.filhoName}>{filho.nome}</Text>
                <View style={[
                  styles.modalidadeBadge,
                  { backgroundColor: filho.modalidade === 'Muay Thai' ? '#8B0000' : '#00008B' }
                ]}>
                  <Text style={styles.modalidadeBadgeText}>
                    {filho.modalidade}
                  </Text>
                </View>
              </View>
              
              <View style={styles.filhoInfo}>
                <Text style={styles.filhoGraduacao}>
                  {formatarGraduacao(filho.graduacao, filho.modalidade)}
                </Text>
                <Text style={styles.filhoData}>
                  Registrado em: {formatarData(filho.dataDeRegistro)}
                </Text>
              </View>

              {filho.observacao && (
                <Text style={styles.filhoObservacao}>
                  Observação: {filho.observacao}
                </Text>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Nenhum filho cadastrado
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Clique em "Adicionar" para cadastrar um filho
            </Text>
          </View>
        )}
      </View>

      {/* Modal para Adicionar Filho */}
      <Modal
        visible={modalFilho}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalFilho(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Filho</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Nome do filho"
              value={novoFilho.nome}
              onChangeText={(text) => setNovoFilho(prev => ({ ...prev, nome: text }))}
            />

            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Modalidade:</Text>
              <View style={styles.modalidadeButtons}>
                <TouchableOpacity
                  style={[
                    styles.modalidadeButton,
                    novoFilho.modalidade === 'Jiu-Jitsu' && styles.modalidadeButtonSelected
                  ]}
                  onPress={() => setNovoFilho(prev => ({ 
                    ...prev, 
                    modalidade: 'Jiu-Jitsu',
                    graduacao: { cor: 'Branca', grau: 1 }
                  }))}
                >
                  <Text style={[
                    styles.modalidadeButtonText,
                    novoFilho.modalidade === 'Jiu-Jitsu' && styles.modalidadeButtonTextSelected
                  ]}>
                    Jiu-Jitsu
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.modalidadeButton,
                    novoFilho.modalidade === 'Muay Thai' && styles.modalidadeButtonSelected
                  ]}
                  onPress={() => setNovoFilho(prev => ({ 
                    ...prev, 
                    modalidade: 'Muay Thai',
                    graduacao: { cor: 'Amarela' }
                  }))}
                >
                  <Text style={[
                    styles.modalidadeButtonText,
                    novoFilho.modalidade === 'Muay Thai' && styles.modalidadeButtonTextSelected
                  ]}>
                    Muay Thai
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalFilho(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleAdicionarFilho}
              >
                <Text style={styles.confirmButtonText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    backgroundColor: '#000000',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#B8860B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  userGraduacao: {
    fontSize: 16,
    color: '#B8860B',
    fontWeight: '600',
    marginBottom: 4,
  },
  userModalidade: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  section: {
    backgroundColor: '#000000',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B8860B',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  editButton: {
    fontSize: 14,
    color: '#B8860B',
    fontWeight: '600',
  },
  addButton: {
    fontSize: 14,
    color: '#B8860B',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#B8860B',
  },
  infoField: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: '#B8860B',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 6,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#B8860B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  filhoCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#B8860B',
  },
  filhoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  filhoName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  modalidadeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modalidadeBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  filhoInfo: {
    marginBottom: 8,
  },
  filhoGraduacao: {
    fontSize: 14,
    color: '#B8860B',
    fontWeight: '500',
    marginBottom: 4,
  },
  filhoData: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  filhoObservacao: {
    fontSize: 12,
    color: '#CCCCCC',
    fontStyle: 'italic',
  },
  emptyState: {
    backgroundColor: '#1a1a1a',
    padding: 32,
    borderRadius: 8,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#333333',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 6,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 16,
  },
  modalRow: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
    fontWeight: '500',
  },
  modalidadeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  modalidadeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
  },
  modalidadeButtonSelected: {
    backgroundColor: '#B8860B',
    borderColor: '#B8860B',
  },
  modalidadeButtonText: {
    color: '#CCCCCC',
    fontWeight: '500',
  },
  modalidadeButtonTextSelected: {
    color: '#000000',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#333333',
  },
  confirmButton: {
    backgroundColor: '#B8860B',
  },
  cancelButtonText: {
    color: '#CCCCCC',
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#000000',
    fontWeight: '600',
  },
});