import { ItemEstoque } from '@/types/estoque';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProdutoCardProps {
  produto: ItemEstoque;
  onPress?: () => void;
  onAdicionarAoCarrinho: (produto: ItemEstoque) => void;
}

export function ProdutoCard({ produto, onPress, onAdicionarAoCarrinho }: ProdutoCardProps) {
  const temImagem = produto.imagem && produto.imagem.trim() !== '';

  return (
    <View style={styles.produtoCard}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <View style={styles.produtoImagemContainer}>
          {temImagem ? (
            <Image
              source={{ uri: produto.imagem }}
              style={styles.produtoImagem}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagemPlaceholder}>
              <Ionicons name="image-outline" size={48} color="#666" />
              <Text style={styles.placeholderTexto}>Sem imagem</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.produtoInfo}>
        <View style={styles.produtoHeader}>
          <Text style={styles.produtoNome} numberOfLines={1}>
            {produto.nome}
          </Text>
          <Text style={styles.produtoPreco}>
            R$ {produto.preco.toFixed(2)}
          </Text>
        </View>

        {produto.tamanhos && Object.keys(produto.tamanhos).length > 0 && (
          <View style={styles.detalheItem}>
            <Ionicons name="resize-outline" size={14} color="#888" />
            <Text style={styles.detalheTexto} numberOfLines={1}>
              {Object.keys(produto.tamanhos).join(', ')}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.botaoComprar}
          onPress={() => onAdicionarAoCarrinho(produto)}
        >
          <Ionicons name="cart" size={18} color="#FFF" />
          <Text style={styles.botaoComprarTexto}>
            Adicionar ao Carrinho
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  produtoCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  produtoImagemContainer: {
    height: 350,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  produtoImagem: {
    width: '100%',
    height: '100%',
  },
  imagemPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderTexto: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  produtoInfo: {
    padding: 16,
  },
  produtoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  produtoNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    flex: 1,
    marginRight: 12,
  },
  produtoPreco: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#B8860B',
  },
  detalheItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  detalheTexto: {
    fontSize: 12,
    color: '#888',
  },
  botaoComprar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#B8860B',
    paddingVertical: 12,
    borderRadius: 8,
  },
  botaoComprarTexto: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
