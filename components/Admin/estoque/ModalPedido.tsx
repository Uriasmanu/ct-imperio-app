// components/ModalPedido.tsx
import { ItemEstoque, ItemPedido, Pedido } from '@/types/estoque';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface ModalPedidoProps {
  visible: boolean;
  onClose: () => void;
  onSalvarPedido: (pedido: Omit<Pedido, 'id'>) => void;
  produtos: ItemEstoque[];
}

export const ModalPedido: React.FC<ModalPedidoProps> = ({
  visible,
  onClose,
  onSalvarPedido,
  produtos
}) => {
  const [nomePessoa, setNomePessoa] = useState('');
  const [itensPedido, setItensPedido] = useState<ItemPedido[]>([]);
  const [observacoes, setObservacoes] = useState('');

  const calcularTotal = () => {
    return itensPedido.reduce((total, item) => total + item.subtotal, 0);
  };

  const adicionarItem = (produto: ItemEstoque) => {
    // Verificar se há estoque disponível
    if (produto.quantidade === 0) {
      Alert.alert('Estoque Insuficiente', 'Este produto está sem estoque.');
      return;
    }

    const itemExistente = itensPedido.find(item => 
      item.itemId === produto.id && item.tamanho === undefined
    );

    if (itemExistente) {
      // Verificar se há estoque suficiente para adicionar mais uma unidade
      const quantidadeTotal = itemExistente.quantidade + 1;
      if (quantidadeTotal > produto.quantidade) {
        Alert.alert('Estoque Insuficiente', `Só há ${produto.quantidade} unidades disponíveis.`);
        return;
      }

      const novosItens = itensPedido.map(item =>
        item.itemId === produto.id && item.tamanho === undefined
          ? {
              ...item,
              quantidade: quantidadeTotal,
              subtotal: quantidadeTotal * item.precoUnitario
            }
          : item
      );
      setItensPedido(novosItens);
    } else {
      // Adicionar novo item
      const novoItem: ItemPedido = {
        itemId: produto.id,
        nome: produto.nome,
        quantidade: 1,
        precoUnitario: produto.preco,
        subtotal: produto.preco
      };
      setItensPedido([...itensPedido, novoItem]);
    }
  };

  const adicionarItemComTamanho = (produto: ItemEstoque, tamanho: string) => {
    const estoqueTamanho = produto.tamanhos[tamanho] || 0;
    
    if (estoqueTamanho === 0) {
      Alert.alert('Estoque Insuficiente', `Não há estoque disponível para o tamanho ${tamanho}.`);
      return;
    }

    const itemExistente = itensPedido.find(item => 
      item.itemId === produto.id && item.tamanho === tamanho
    );

    if (itemExistente) {
      const quantidadeTotal = itemExistente.quantidade + 1;
      if (quantidadeTotal > estoqueTamanho) {
        Alert.alert('Estoque Insuficiente', `Só há ${estoqueTamanho} unidades disponíveis no tamanho ${tamanho}.`);
        return;
      }

      const novosItens = itensPedido.map(item =>
        item.itemId === produto.id && item.tamanho === tamanho
          ? {
              ...item,
              quantidade: quantidadeTotal,
              subtotal: quantidadeTotal * item.precoUnitario
            }
          : item
      );
      setItensPedido(novosItens);
    } else {
      const novoItem: ItemPedido = {
        itemId: produto.id,
        nome: produto.nome,
        quantidade: 1,
        tamanho: tamanho,
        precoUnitario: produto.preco,
        subtotal: produto.preco
      };
      setItensPedido([...itensPedido, novoItem]);
    }
  };

  const removerItem = (index: number) => {
    const novosItens = itensPedido.filter((_, i) => i !== index);
    setItensPedido(novosItens);
  };

  const atualizarQuantidade = (index: number, novaQuantidade: number) => {
    if (novaQuantidade < 1) {
      removerItem(index);
      return;
    }

    const item = itensPedido[index];
    const produto = produtos.find(p => p.id === item.itemId);
    
    if (!produto) return;

    // Verificar limite de estoque
    let estoqueDisponivel = produto.quantidade;
    if (item.tamanho) {
      estoqueDisponivel = produto.tamanhos[item.tamanho] || 0;
    }

    if (novaQuantidade > estoqueDisponivel) {
      Alert.alert('Estoque Insuficiente', `Só há ${estoqueDisponivel} unidades disponíveis.`);
      return;
    }

    const novosItens = itensPedido.map((item, i) =>
      i === index
        ? {
            ...item,
            quantidade: novaQuantidade,
            subtotal: novaQuantidade * item.precoUnitario
          }
        : item
    );
    setItensPedido(novosItens);
  };

  const handleSalvarPedido = () => {
    if (!nomePessoa.trim()) {
      Alert.alert('Erro', 'Por favor, informe o nome da pessoa');
      return;
    }

    if (itensPedido.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos um item ao pedido');
      return;
    }

    const pedido: Omit<Pedido, 'id'> = {
      pessoa: nomePessoa.trim(),
      itens: itensPedido,
      data: new Date().toLocaleDateString('pt-BR'),
      dataTimestamp: new Date(),
      pago: false,
      total: calcularTotal(),
      observacoes: observacoes.trim()
    };

    onSalvarPedido(pedido);
    limparFormulario();
  };

  const limparFormulario = () => {
    setNomePessoa('');
    setItensPedido([]);
    setObservacoes('');
  };

  const handleFechar = () => {
    if (itensPedido.length > 0) {
      Alert.alert(
        'Atenção',
        'Tem certeza que deseja fechar? Os itens adicionados serão perdidos.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Fechar', 
            style: 'destructive',
            onPress: () => {
              limparFormulario();
              onClose();
            }
          }
        ]
      );
    } else {
      limparFormulario();
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleFechar}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Novo Pedido</Text>
          <TouchableOpacity onPress={handleFechar} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Informações do Cliente */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações do Cliente</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome da pessoa"
              placeholderTextColor="#666"
              value={nomePessoa}
              onChangeText={setNomePessoa}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Observações (opcional)"
              placeholderTextColor="#666"
              value={observacoes}
              onChangeText={setObservacoes}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Itens do Pedido */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Itens do Pedido</Text>
              <Text style={styles.totalText}>
                Total: R$ {calcularTotal().toFixed(2)}
              </Text>
            </View>

            {itensPedido.map((item, index) => (
              <View key={index} style={styles.itemCard}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.nome}</Text>
                  {item.tamanho && (
                    <Text style={styles.itemSize}>Tamanho: {item.tamanho}</Text>
                  )}
                  <Text style={styles.itemPrice}>
                    R$ {item.precoUnitario.toFixed(2)} × {item.quantidade} = R$ {item.subtotal.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.itemActions}>
                  <TouchableOpacity
                    onPress={() => atualizarQuantidade(index, item.quantidade - 1)}
                    style={styles.quantityButton}
                  >
                    <Ionicons name="remove" size={16} color="#FFF" />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{item.quantidade}</Text>
                  <TouchableOpacity
                    onPress={() => atualizarQuantidade(index, item.quantidade + 1)}
                    style={styles.quantityButton}
                  >
                    <Ionicons name="add" size={16} color="#FFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => removerItem(index)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="trash" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {itensPedido.length === 0 && (
              <View style={styles.emptyItems}>
                <Ionicons name="cart-outline" size={48} color="#666" />
                <Text style={styles.emptyItemsText}>
                  Nenhum item adicionado ao pedido
                </Text>
              </View>
            )}
          </View>

          {/* Produtos Disponíveis */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Produtos Disponíveis</Text>
            {produtos.map(produto => (
              <View key={produto.id} style={styles.produtoCard}>
                <View style={styles.produtoInfo}>
                  <Text style={styles.produtoName}>{produto.nome}</Text>
                  <Text style={styles.produtoPrice}>
                    R$ {produto.preco.toFixed(2)}
                  </Text>
                  <Text style={styles.produtoStock}>
                    Estoque: {produto.quantidade} unidades
                  </Text>
                </View>
                
                <View style={styles.produtoActions}>
                  {Object.keys(produto.tamanhos).length > 0 ? (
                    <View style={styles.tamanhosContainer}>
                      {Object.entries(produto.tamanhos).map(([tamanho, quantidade]) => (
                        <TouchableOpacity
                          key={tamanho}
                          onPress={() => adicionarItemComTamanho(produto, tamanho)}
                          style={[
                            styles.tamanhoButton,
                            quantidade === 0 && styles.tamanhoButtonDisabled
                          ]}
                          disabled={quantidade === 0}
                        >
                          <Text style={[
                            styles.tamanhoButtonText,
                            quantidade === 0 && styles.tamanhoButtonTextDisabled
                          ]}>
                            {tamanho} ({quantidade})
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => adicionarItem(produto)}
                      style={[
                        styles.addButton,
                        produto.quantidade === 0 && styles.addButtonDisabled
                      ]}
                      disabled={produto.quantidade === 0}
                    >
                      <Ionicons 
                        name="add" 
                        size={16} 
                        color={produto.quantidade === 0 ? "#666" : "#FFF"} 
                      />
                      <Text style={[
                        styles.addButtonText,
                        produto.quantidade === 0 && styles.addButtonTextDisabled
                      ]}>
                        Adicionar
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (itensPedido.length === 0 || !nomePessoa.trim()) && styles.saveButtonDisabled
            ]}
            onPress={handleSalvarPedido}
            disabled={itensPedido.length === 0 || !nomePessoa.trim()}
          >
            <Ionicons name="checkmark" size={20} color="#000" />
            <Text style={styles.saveButtonText}>Criar Pedido</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#B8860B',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B8860B',
    marginBottom: 12,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    color: '#FFF',
    marginBottom: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  itemCard: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemSize: {
    color: '#B8860B',
    fontSize: 12,
    marginBottom: 4,
  },
  itemPrice: {
    color: '#888',
    fontSize: 12,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    backgroundColor: '#B8860B',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    color: '#FFF',
    fontWeight: 'bold',
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    padding: 4,
  },
  emptyItems: {
    alignItems: 'center',
    padding: 20,
  },
  emptyItemsText: {
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  produtoCard: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  produtoInfo: {
    flex: 1,
  },
  produtoName: {
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  produtoPrice: {
    color: '#B8860B',
    fontSize: 14,
    marginBottom: 2,
  },
  produtoStock: {
    color: '#888',
    fontSize: 12,
  },
  produtoActions: {
    alignItems: 'flex-end',
  },
  tamanhosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'flex-end',
  },
  tamanhoButton: {
    backgroundColor: '#B8860B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tamanhoButtonDisabled: {
    backgroundColor: '#333',
  },
  tamanhoButtonText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '600',
  },
  tamanhoButtonTextDisabled: {
    color: '#666',
  },
  addButton: {
    backgroundColor: '#B8860B',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonDisabled: {
    backgroundColor: '#333',
  },
  addButtonText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '600',
  },
  addButtonTextDisabled: {
    color: '#666',
  },
  footer: {
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  saveButton: {
    backgroundColor: '#B8860B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#333',
  },
  saveButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});