import { Ionicons } from '@expo/vector-icons';
import React from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

// TIPOS
interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  disponivel: boolean;
  imagem?: string;
  cores?: string[];
  tamanhos?: string[];
  estoque?: number;
}

// DADOS PRE-ESCRITOS DOS PRODUTOS
const produtosPredefinidos: Produto[] = [
  {
    id: '1',
    nome: 'Camisa Oficial',
    descricao: 'Camisa oficial da academia, 100% algodão, respirável e confortável para treinos intensos.',
    preco: 89.90,
    categoria: 'Vestuário',
    disponivel: true,
    imagem: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    cores: ['Preto', 'Branco', 'Cinza', 'Vermelho'],
    tamanhos: ['P', 'M', 'G', 'GG'],
    estoque: 45
  },
  {
    id: '2',
    nome: 'Short de Treino',
    descricao: 'Short leve e flexível, ideal para atividades físicas. Secagem rápida e tecido anti-odor.',
    preco: 69.90,
    categoria: 'Vestuário',
    disponivel: true,
    imagem: 'https://lh3.googleusercontent.com/d/1LTkYPAVPDHwOSB-irlnOa63lBR2x1XOP',
    cores: ['Preto', 'Azul', 'Verde', 'Cinza'],
    tamanhos: ['P', 'M', 'G'],
    estoque: 32
  },
  {
    id: '3',
    nome: 'Luva de Academia',
    descricao: 'Luva com proteção para palma da mão, ideal para levantamento de peso e barras.',
    preco: 49.90,
    categoria: 'Acessórios',
    disponivel: true,
    imagem: 'https://images.unsplash.com/photo-1584735175097-719d848f8449?w=400',
    cores: ['Preto', 'Vermelho', 'Azul'],
    tamanhos: ['Único'],
    estoque: 28
  },
  {
    id: '4',
    nome: 'Camisa Dry Fit',
    descricao: 'Tecido dry fit que absorve o suor, mantendo o corpo seco durante o treino.',
    preco: 99.90,
    categoria: 'Vestuário',
    disponivel: false,
    imagem: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    cores: ['Preto', 'Azul Marinho'],
    tamanhos: ['M', 'G', 'GG'],
    estoque: 0
  },
  {
    id: '5',
    nome: 'Short Compressão',
    descricao: 'Short de compressão para melhor performance e recuperação muscular.',
    preco: 119.90,
    categoria: 'Vestuário',
    disponivel: true,
    imagem: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400',
    cores: ['Preto'],
    tamanhos: ['P', 'M', 'G'],
    estoque: 15
  },
  {
    id: '6',
    nome: 'Luva de Dedos Abertos',
    descricao: 'Luva com dedos abertos para melhor aderência e sensibilidade.',
    preco: 59.90,
    categoria: 'Acessórios',
    disponivel: true,
    imagem: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400',
    cores: ['Cinza', 'Preto'],
    tamanhos: ['P', 'M', 'G'],
    estoque: 22
  }
];

// COMPONENTE DE CARD DE PRODUTO
interface ProdutoCardProps {
  produto: Produto;
  onPress?: () => void;
}

function ProdutoCard({ produto, onPress }: ProdutoCardProps) {
  return (
    <TouchableOpacity 
      style={styles.produtoCard} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* IMAGEM DO PRODUTO */}
      <View style={styles.produtoImagemContainer}>
        <Image 
          source={{ uri: produto.imagem }} 
          style={styles.produtoImagem}
          resizeMode="cover"
        />
        {/* STATUS DE DISPONIBILIDADE */}
        <View style={[
          styles.disponibilidadeBadge,
          produto.disponivel ? styles.disponivelBadge : styles.indisponivelBadge
        ]}>
          <Text style={styles.disponibilidadeTexto}>
            {produto.disponivel ? 'Disponível' : 'Esgotado'}
          </Text>
        </View>
      </View>

      {/* INFORMAÇÕES DO PRODUTO */}
      <View style={styles.produtoInfo}>
        <View style={styles.produtoHeader}>
          <Text style={styles.produtoNome} numberOfLines={1}>
            {produto.nome}
          </Text>
          <Text style={styles.produtoPreco}>
            R$ {produto.preco.toFixed(2)}
          </Text>
        </View>

        <Text style={styles.produtoDescricao} numberOfLines={2}>
          {produto.descricao}
        </Text>

        {/* CATEGORIA */}
        <View style={styles.categoriaContainer}>
          <Ionicons name="pricetag-outline" size={14} color="#B8860B" />
          <Text style={styles.categoriaTexto}>{produto.categoria}</Text>
        </View>

        {/* DETALHES DO PRODUTO */}
        <View style={styles.detalhesContainer}>
          {/* CORES DISPONÍVEIS */}
          <View style={styles.detalheItem}>
            <Ionicons name="color-palette-outline" size={14} color="#888" />
            <Text style={styles.detalheTexto} numberOfLines={1}>
              {produto.cores?.join(', ')}
            </Text>
          </View>

          {/* TAMANHOS */}
          <View style={styles.detalheItem}>
            <Ionicons name="resize-outline" size={14} color="#888" />
            <Text style={styles.detalheTexto} numberOfLines={1}>
              {produto.tamanhos?.join(', ')}
            </Text>
          </View>

          {/* ESTOQUE */}
          <View style={styles.detalheItem}>
            <Ionicons name="cube-outline" size={14} color="#888" />
            <Text style={[
              styles.detalheTexto,
              produto.estoque && produto.estoque < 10 ? styles.estoqueBaixo : null
            ]}>
              Estoque: {produto.estoque || 0}
            </Text>
          </View>
        </View>

        {/* BOTÃO DE AÇÃO */}
        <TouchableOpacity 
          style={[
            styles.botaoComprar,
            !produto.disponivel && styles.botaoComprarDisabled
          ]}
          disabled={!produto.disponivel}
          onPress={() => console.log('Comprar:', produto.nome)}
        >
          <Ionicons 
            name={produto.disponivel ? "cart-outline" : "close-circle-outline"} 
            size={18} 
            color="#FFF" 
          />
          <Text style={styles.botaoComprarTexto}>
            {produto.disponivel ? 'Adicionar ao Carrinho' : 'Indisponível'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// COMPONENTE DE CATEGORIA
interface CategoriaItemProps {
  icone: string;
  label: string;
  ativa?: boolean;
  onPress?: () => void;
}

function CategoriaItem({ icone, label, ativa = false, onPress }: CategoriaItemProps) {
  return (
    <TouchableOpacity 
      style={[
        styles.categoriaItem,
        ativa && styles.categoriaItemAtiva
      ]}
      onPress={onPress}
    >
      <Ionicons 
        name={icone as any} 
        size={22} 
        color={ativa ? "#B8860B" : "#888"} 
      />
      <Text style={[
        styles.categoriaLabel,
        ativa && styles.categoriaLabelAtiva
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// COMPONENTE PRINCIPAL
export default function ProdutosScreen() {
  const [categoriaAtiva, setCategoriaAtiva] = React.useState<string>('todos');
  const [produtosFiltrados, setProdutosFiltrados] = React.useState<Produto[]>(produtosPredefinidos);

  // FILTRAR PRODUTOS POR CATEGORIA
  const filtrarPorCategoria = (categoria: string) => {
    setCategoriaAtiva(categoria);
    
    if (categoria === 'todos') {
      setProdutosFiltrados(produtosPredefinidos);
    } else {
      const filtrados = produtosPredefinidos.filter(
        produto => produto.categoria.toLowerCase() === categoria.toLowerCase()
      );
      setProdutosFiltrados(filtrados);
    }
  };

  // CALCULAR ESTATÍSTICAS
  const estatisticas = {
    total: produtosPredefinidos.length,
    disponiveis: produtosPredefinidos.filter(p => p.disponivel).length,
    vestuario: produtosPredefinidos.filter(p => p.categoria === 'Vestuário').length,
    acessorios: produtosPredefinidos.filter(p => p.categoria === 'Acessórios').length,
  };

  // CATEGORIAS
  const categorias = [
    { id: 'todos', icone: 'grid-outline', label: 'Todos' },
    { id: 'vestuario', icone: 'shirt-outline', label: 'Vestuário' },
    { id: 'acessorios', icone: 'fitness-outline', label: 'Acessórios' },
  ];

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="storefront-outline" size={32} color="#B8860B" />
          <Text style={styles.headerTitle}>Loja de Produtos</Text>
          <Text style={styles.headerSubtitle}>
            Equipamentos e vestuário para seu treino
          </Text>
        </View>
      </View>

      {/* CONTEÚDO PRINCIPAL */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* ESTATÍSTICAS */}
        <View style={styles.estatisticasContainer}>
          <View style={styles.estatisticasCard}>
            <View style={styles.estatisticaItem}>
              <Text style={styles.estatisticaValor}>{estatisticas.total}</Text>
              <Text style={styles.estatisticaLabel}>Total</Text>
            </View>
            <View style={styles.estatisticaDivider} />
            <View style={styles.estatisticaItem}>
              <Text style={styles.estatisticaValor}>{estatisticas.disponiveis}</Text>
              <Text style={styles.estatisticaLabel}>Disponíveis</Text>
            </View>
            <View style={styles.estatisticaDivider} />
            <View style={styles.estatisticaItem}>
              <Text style={styles.estatisticaValor}>{estatisticas.vestuario}</Text>
              <Text style={styles.estatisticaLabel}>Vestuário</Text>
            </View>
            <View style={styles.estatisticaDivider} />
            <View style={styles.estatisticaItem}>
              <Text style={styles.estatisticaValor}>{estatisticas.acessorios}</Text>
              <Text style={styles.estatisticaLabel}>Acessórios</Text>
            </View>
          </View>
        </View>

        {/* CATEGORIAS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorias</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriasScroll}
          >
            {categorias.map((categoria) => (
              <CategoriaItem
                key={categoria.id}
                icone={categoria.icone}
                label={categoria.label}
                ativa={categoriaAtiva === categoria.id}
                onPress={() => filtrarPorCategoria(categoria.id)}
              />
            ))}
          </ScrollView>
        </View>

        {/* LISTA DE PRODUTOS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Produtos</Text>
            <Text style={styles.sectionSubtitle}>
              {produtosFiltrados.length} produtos encontrados
            </Text>
          </View>

          <View style={styles.produtosGrid}>
            {produtosFiltrados.map((produto) => (
              <ProdutoCard 
                key={produto.id} 
                produto={produto}
                onPress={() => console.log('Ver detalhes:', produto.nome)}
              />
            ))}
          </View>
        </View>

        {/* CARRINHO FLUTUANTE */}
        <TouchableOpacity 
          style={styles.carrinhoFloating}
          onPress={() => console.log('Abrir carrinho')}
        >
          <View style={styles.carrinhoBadge}>
            <Text style={styles.carrinhoBadgeText}>3</Text>
          </View>
          <Ionicons name="cart" size={24} color="#FFF" />
        </TouchableOpacity>

        {/* ESPAÇO FINAL */}
        <View style={styles.footerSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    backgroundColor: '#000',
    paddingTop: 10,
    paddingBottom: 1,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  headerContent: {
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#AAA",
    textAlign: 'center',
  },
  estatisticasContainer: {
    marginTop: 20,
    marginBottom: 24,
  },
  estatisticasCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  estatisticaItem: {
    alignItems: 'center',
    flex: 1,
  },
  estatisticaValor: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#B8860B',
    marginBottom: 4,
  },
  estatisticaLabel: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  estatisticaDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#333',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#B8860B',
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  categoriasScroll: {
    flexDirection: 'row',
  },
  categoriaItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    minWidth: 100,
  },
  categoriaItemAtiva: {
    backgroundColor: '#2a2a2a',
    borderColor: '#B8860B',
  },
  categoriaLabel: {
    marginTop: 6,
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  categoriaLabelAtiva: {
    color: '#B8860B',
    fontWeight: '600',
  },
  produtosGrid: {
    gap: 16,
  },
  produtoCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  produtoImagemContainer: {
    height: 200,
    position: 'relative',
  },
  produtoImagem: {
    width: '100%',
    height: '100%',
  },
  disponibilidadeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  disponivelBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  indisponivelBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  disponibilidadeTexto: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFF',
  },
  produtoInfo: {
    padding: 16,
  },
  produtoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  produtoDescricao: {
    fontSize: 14,
    color: '#AAA',
    lineHeight: 20,
    marginBottom: 12,
  },
  categoriaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  categoriaTexto: {
    fontSize: 12,
    color: '#B8860B',
    fontWeight: '500',
  },
  detalhesContainer: {
    gap: 8,
    marginBottom: 16,
  },
  detalheItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detalheTexto: {
    fontSize: 12,
    color: '#888',
    flex: 1,
  },
  estoqueBaixo: {
    color: '#EF4444',
    fontWeight: '600',
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
  botaoComprarDisabled: {
    backgroundColor: '#333',
    opacity: 0.7,
  },
  botaoComprarTexto: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  carrinhoFloating: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#B8860B',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  carrinhoBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EF4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  carrinhoBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  footerSpace: {
    height: 80,
  },
});