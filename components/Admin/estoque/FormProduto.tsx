// components/FormProduto.tsx
import { ItemEstoque } from '@/types/estoque';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
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

interface FormProdutoProps {
  visible: boolean;
  onClose: () => void;
  onSave: (produto: Omit<ItemEstoque, 'id'>) => Promise<void>;
  onUpdate?: (id: string, produto: Partial<ItemEstoque>) => Promise<void>; // Nova prop para edição
  produtoEditando?: ItemEstoque | null; // Produto sendo editado
  modoEdicao?: boolean; // Indica se está no modo edição
}

export const FormProduto: React.FC<FormProdutoProps> = ({
  visible,
  onClose,
  onSave,
  onUpdate,
  produtoEditando,
  modoEdicao = false
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    preco: '',
  });
  const [tamanhos, setTamanhos] = useState<{ tamanho: string; quantidade: string }[]>([
    { tamanho: 'P', quantidade: '0' },
    { tamanho: 'M', quantidade: '0' },
    { tamanho: 'G', quantidade: '0' },
    { tamanho: 'GG', quantidade: '0' }
  ]);
  const [novoTamanho, setNovoTamanho] = useState('');

  // Preencher formulário quando estiver editando
  useEffect(() => {
    if (modoEdicao && produtoEditando) {
      setFormData({
        nome: produtoEditando.nome,
        preco: produtoEditando.preco.toString(),
      });

      // Converter os tamanhos do produto para o formato do formulário
      const tamanhosFormatados = Object.entries(produtoEditando.tamanhos).map(
        ([tamanho, quantidade]) => ({
          tamanho,
          quantidade: quantidade.toString()
        })
      );

      // Se não houver tamanhos, usar os padrões
      setTamanhos(tamanhosFormatados.length > 0 ? tamanhosFormatados : [
        { tamanho: 'P', quantidade: '0' },
        { tamanho: 'M', quantidade: '0' },
        { tamanho: 'G', quantidade: '0' },
        { tamanho: 'GG', quantidade: '0' }
      ]);
    } else {
      // Resetar formulário quando não estiver editando
      resetForm();
    }
  }, [modoEdicao, produtoEditando, visible]);

  // Funções para gerenciar tamanhos
  const updateTamanhoQuantidade = (index: number, campo: 'tamanho' | 'quantidade', valor: string) => {
    const novosTamanhos = [...tamanhos];
    novosTamanhos[index] = {
      ...novosTamanhos[index],
      [campo]: valor
    };
    setTamanhos(novosTamanhos);
  };

  const adicionarTamanhoPersonalizado = () => {
    if (!novoTamanho.trim()) {
      Alert.alert('Erro', 'Digite um nome para o tamanho');
      return;
    }

    // Verificar se o tamanho já existe
    if (tamanhos.some(t => t.tamanho === novoTamanho.trim())) {
      Alert.alert('Erro', 'Este tamanho já existe');
      return;
    }

    setTamanhos([...tamanhos, { tamanho: novoTamanho.trim(), quantidade: '0' }]);
    setNovoTamanho('');
  };

  const removerTamanho = (index: number) => {
    if (tamanhos.length <= 1) {
      Alert.alert('Atenção', 'É necessário ter pelo menos um tamanho');
      return;
    }

    const novosTamanhos = [...tamanhos];
    novosTamanhos.splice(index, 1);
    setTamanhos(novosTamanhos);
  };

  const calcularTotal = () => {
    return tamanhos.reduce((total, item) => total + (parseInt(item.quantidade) || 0), 0);
  };

  const handleSave = async () => {
    if (!formData.nome.trim()) {
      Alert.alert('Erro', 'Nome do produto é obrigatório');
      return;
    }

    if (!formData.preco || parseFloat(formData.preco) <= 0) {
      Alert.alert('Erro', 'Preço deve ser maior que zero');
      return;
    }

    // Converter tamanhos para o formato esperado
    const tamanhosFormatados: { [key: string]: number } = {};
    let temEstoque = false;

    tamanhos.forEach(item => {
      const quantidade = parseInt(item.quantidade) || 0;
      if (quantidade > 0) {
        tamanhosFormatados[item.tamanho] = quantidade;
        temEstoque = true;
      }
    });

    if (!temEstoque) {
      Alert.alert('Atenção', 'Adicione pelo menos um tamanho com quantidade maior que zero');
      return;
    }

    const produtoData = {
      nome: formData.nome.trim(),
      preco: parseFloat(formData.preco),
      tamanhos: tamanhosFormatados,
      quantidade: Object.values(tamanhosFormatados).reduce((total, qtd) => total + qtd, 0),
    };

    try {
      setLoading(true);
      
      if (modoEdicao && produtoEditando && onUpdate) {
        // Modo edição
        await onUpdate(produtoEditando.id, produtoData);
        Alert.alert('Sucesso', 'Produto atualizado com sucesso!');
      } else {
        // Modo criação
        await onSave(produtoData);
        Alert.alert('Sucesso', 'Produto adicionado com sucesso!');
      }
      
      resetForm();
      onClose();
    } catch (error) {
      Alert.alert('Erro', `Não foi possível ${modoEdicao ? 'atualizar' : 'adicionar'} o produto`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      preco: '',
    });
    setTamanhos([
      { tamanho: 'P', quantidade: '0' },
      { tamanho: 'M', quantidade: '0' },
      { tamanho: 'G', quantidade: '0' },
      { tamanho: 'GG', quantidade: '0' }
    ]);
    setNovoTamanho('');
  };

  const tituloModal = modoEdicao ? 'Editar Produto' : 'Adicionar Novo Item';
  const textoBotaoSalvar = loading 
    ? (modoEdicao ? 'Atualizando...' : 'Salvando...')
    : (modoEdicao ? 'Atualizar' : 'Salvar');

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{tituloModal}</Text>
            <TouchableOpacity onPress={onClose} style={styles.botaoFechar}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer}>
            {/* Nome do Produto */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome do Produto *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Camiseta de Jiu-Jitsu"
                placeholderTextColor="#666"
                value={formData.nome}
                onChangeText={(text) => setFormData({ ...formData, nome: text })}
              />
            </View>

            {/* Preço */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Preço (R$) *</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor="#666"
                keyboardType="decimal-pad"
                value={formData.preco}
                onChangeText={(text) => setFormData({ ...formData, preco: text.replace(',', '.') })}
              />
            </View>

            {/* Tamanhos e Quantidades */}
            <View style={styles.inputGroup}>
              <View style={styles.tamanhosHeader}>
                <Text style={styles.label}>Tamanhos e Quantidades *</Text>
                <Text style={styles.totalTexto}>
                  Total: {calcularTotal()} unidades
                </Text>
              </View>

              {tamanhos.map((item, index) => (
                <View key={index} style={styles.tamanhoRow}>
                  <TextInput
                    style={[styles.inputTamanho, styles.tamanhoInput]}
                    placeholder="Tamanho"
                    placeholderTextColor="#666"
                    value={item.tamanho}
                    onChangeText={(text) => updateTamanhoQuantidade(index, 'tamanho', text)}
                  />
                  <TextInput
                    style={[styles.inputTamanho, styles.quantidadeInput]}
                    placeholder="0"
                    placeholderTextColor="#666"
                    keyboardType="number-pad"
                    value={item.quantidade}
                    onChangeText={(text) => updateTamanhoQuantidade(index, 'quantidade', text.replace(/[^0-9]/g, ''))}
                  />
                  {tamanhos.length > 1 && (
                    <TouchableOpacity
                      style={styles.botaoRemoverTamanho}
                      onPress={() => removerTamanho(index)}
                    >
                      <Ionicons name="trash" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              {/* Adicionar novo tamanho personalizado */}
              <View style={styles.novoTamanhoContainer}>
                <TextInput
                  style={[styles.input, styles.novoTamanhoInput]}
                  placeholder="Novo tamanho personalizado"
                  placeholderTextColor="#666"
                  value={novoTamanho}
                  onChangeText={setNovoTamanho}
                />
                <TouchableOpacity
                  style={styles.botaoAdicionarTamanho}
                  onPress={adicionarTamanhoPersonalizado}
                >
                  <Ionicons name="add" size={20} color="#000" />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Botões de Ação */}
          <View style={styles.botoesAcao}>
            <TouchableOpacity
              style={[styles.botao, styles.botaoCancelar]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.botao, styles.botaoSalvar]}
              onPress={handleSave}
              disabled={loading}
            >
              <Ionicons name="save" size={18} color="#000" />
              <Text style={styles.botaoSalvarTexto}>{textoBotaoSalvar}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};


const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B8860B',
    width: '100%',
    maxHeight: '80%', // Reduzido já que não tem mais imagem
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
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  botaoFechar: {
    padding: 4,
  },
  formContainer: {
    maxHeight: 400, // Reduzido
  },
  inputGroup: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  label: {
    color: '#B8860B',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    padding: 12,
    color: '#FFF',
    fontSize: 16,
  },
  tamanhosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalTexto: {
    color: '#22C55E',
    fontSize: 14,
    fontWeight: '600',
  },
  tamanhoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  inputTamanho: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    padding: 12,
    color: '#FFF',
    fontSize: 16,
  },
  tamanhoInput: {
    flex: 2,
  },
  quantidadeInput: {
    flex: 1,
  },
  botaoRemoverTamanho: {
    padding: 8,
  },
  novoTamanhoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  novoTamanhoInput: {
    flex: 1,
  },
  botaoAdicionarTamanho: {
    backgroundColor: '#B8860B',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 44,
  },
  botoesAcao: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  botao: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
  },
  botaoCancelar: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#666',
  },
  botaoSalvar: {
    backgroundColor: '#B8860B',
  },
  botaoCancelarTexto: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  botaoSalvarTexto: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});