// screens/ProdutosScreen.tsx

import { CarrinhoModal, ItemCarrinho } from '@/components/telaProdutos/CarrinhoModal';
import { estoqueService } from '@/services/estoqueService';
import { ItemEstoque } from '@/types/estoque';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from "react";
import {
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

// TIPOS PARA PEDIDOS
interface Pedido {
    id: string;
    pessoa: string;
    itens: {
        nome: string;
        quantidade: number;
        tamanho?: string;
        precoUnitario: number;
        subtotal: number;
    }[];
    data: string;
    pago: boolean;
    total: number;
    observacoes?: string;
    status: 'pendente' | 'reservado' | 'entregue';
}


// DADOS DE EXEMPLO PARA MEUS PEDIDOS
const pedidosExemplo: Pedido[] = [
    {
        id: '001',
        pessoa: 'João Silva',
        itens: [
            { nome: 'Camisa Oficial', quantidade: 1, tamanho: 'M', precoUnitario: 89.90, subtotal: 89.90 },
            { nome: 'Short de Treino', quantidade: 2, tamanho: 'G', precoUnitario: 69.90, subtotal: 139.80 }
        ],
        data: '15/12/2023',
        pago: true,
        total: 229.70,
        observacoes: 'Retirar na academia',
        status: 'entregue'
    },
    {
        id: '002',
        pessoa: 'João Silva',
        itens: [
            { nome: 'Luva de Academia', quantidade: 1, precoUnitario: 49.90, subtotal: 49.90 }
        ],
        data: '18/12/2023',
        pago: false,
        total: 49.90,
        observacoes: '',
        status: 'pendente'
    },
    {
        id: '003',
        pessoa: 'João Silva',
        itens: [
            { nome: 'Camisa Dry Fit', quantidade: 1, tamanho: 'G', precoUnitario: 99.90, subtotal: 99.90 },
            { nome: 'Short Compressão', quantidade: 1, tamanho: 'M', precoUnitario: 119.90, subtotal: 119.90 }
        ],
        data: '20/12/2023',
        pago: true,
        total: 219.80,
        observacoes: 'Cor preferida: Preto',
        status: 'reservado'
    }
];

// MODAL DE SELEÇÃO DE TAMANHO
interface ModalTamanhoProps {
    visible: boolean;
    produto: ItemEstoque | null;
    onFechar: () => void;
    onConfirmar: (tamanho: string) => void;
}

function ModalTamanho({ visible, produto, onFechar, onConfirmar }: ModalTamanhoProps) {
    const [tamanhoSelecionado, setTamanhoSelecionado] = useState<string>('');

    if (!produto) return null;

    const tamanhosDisponiveis = produto.tamanhos ? Object.keys(produto.tamanhos) : [];

    const handleConfirmar = () => {
        if (tamanhoSelecionado) {
            onConfirmar(tamanhoSelecionado);
            setTamanhoSelecionado('');
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onFechar}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalTamanhoContainer}>
                    {/* HEADER */}
                    <View style={styles.modalTamanhoHeader}>
                        <Text style={styles.modalTamanhoTitulo}>
                            Selecione o Tamanho
                        </Text>
                        <TouchableOpacity onPress={onFechar} style={styles.modalFecharBtn}>
                            <Ionicons name="close" size={24} color="#AAA" />
                        </TouchableOpacity>
                    </View>

                    {/* INFO DO PRODUTO */}
                    <View style={styles.modalProdutoInfo}>
                        <Text style={styles.modalProdutoNome}>{produto.nome}</Text>
                        <Text style={styles.modalProdutoPreco}>
                            R$ {produto.preco.toFixed(2)}
                        </Text>
                    </View>

                    {/* TAMANHOS DISPONÍVEIS */}
                    <View style={styles.tamanhosContainer}>
                        {tamanhosDisponiveis.map((tamanho) => {
                            const estoque = produto.tamanhos?.[tamanho] || 0;
                            const disponivel = estoque > 0;

                            return (
                                <TouchableOpacity
                                    key={tamanho}
                                    style={[
                                        styles.tamanhoItem,
                                        tamanhoSelecionado === tamanho && styles.tamanhoSelecionado,
                                        !disponivel && styles.tamanhoIndisponivel
                                    ]}
                                    onPress={() => disponivel && setTamanhoSelecionado(tamanho)}
                                    disabled={!disponivel}
                                >
                                    <Text style={[
                                        styles.tamanhoTexto,
                                        tamanhoSelecionado === tamanho && styles.tamanhoTextoSelecionado,
                                        !disponivel && styles.tamanhoTextoIndisponivel
                                    ]}>
                                        {tamanho}
                                    </Text>
                                    <Text style={[
                                        styles.estoqueTexto,
                                        !disponivel && styles.estoqueTextoIndisponivel
                                    ]}>
                                        {disponivel ? `${estoque} disponíveis` : 'Indisponível'}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* BOTÕES */}
                    <View style={styles.modalBotoesContainer}>
                        <TouchableOpacity
                            style={styles.modalBotaoCancelar}
                            onPress={onFechar}
                        >
                            <Text style={styles.modalBotaoCancelarTexto}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.modalBotaoConfirmar,
                                !tamanhoSelecionado && styles.modalBotaoConfirmarDisabled
                            ]}
                            onPress={handleConfirmar}
                            disabled={!tamanhoSelecionado}
                        >
                            <Ionicons name="cart" size={20} color="#FFF" />
                            <Text style={styles.modalBotaoConfirmarTexto}>
                                Adicionar ao Carrinho
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// COMPONENTE DE CARD DE PRODUTO
interface ProdutoCardProps {
    produto: ItemEstoque;
    onPress?: () => void;
    onAdicionarAoCarrinho: (produto: ItemEstoque) => void;
}

function ProdutoCard({ produto, onPress, onAdicionarAoCarrinho }: ProdutoCardProps) {
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
                            <Ionicons
                                name="image-outline"
                                size={48}
                                color="#666"
                                style={styles.placeholderIcon}
                            />
                            <Text style={styles.placeholderTexto}>
                                Sem imagem
                            </Text>
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

                <View style={styles.detalhesContainer}>
                    {produto.tamanhos && Object.keys(produto.tamanhos).length > 0 && (
                        <View style={styles.detalheItem}>
                            <Ionicons name="resize-outline" size={14} color="#888" />
                            <Text style={styles.detalheTexto} numberOfLines={1}>
                                {Object.keys(produto.tamanhos).join(', ')}
                            </Text>
                        </View>
                    )}
                </View>

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

// COMPONENTE DE CARD DE PEDIDO
interface PedidoCardProps {
    pedido: Pedido;
    onPress?: () => void;
}

function PedidoCard({ pedido, onPress }: PedidoCardProps) {
    const getStatusColor = (status: Pedido['status']) => {
        switch (status) {
            case 'pendente': return '#F59E0B';
            case 'reservado': return '#3B82F6';
            case 'entregue': return '#10B981';
            default: return '#888';
        }
    };

    const getStatusIcon = (status: Pedido['status']) => {
        switch (status) {
            case 'pendente': return 'time-outline';
            case 'reservado': return 'checkmark-circle-outline';
            case 'entregue': return 'cube-outline';
            default: return 'help-circle-outline';
        }
    };

    const getStatusText = (status: Pedido['status']) => {
        switch (status) {
            case 'pendente': return 'Pendente';
            case 'reservado': return 'Reservado';
            case 'entregue': return 'Entregue';
            default: return 'Desconhecido';
        }
    };

    return (
        <TouchableOpacity style={styles.pedidoCard} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.pedidoHeader}>
                <View style={styles.pedidoInfo}>
                    <Text style={styles.pedidoId}>Pedido #{pedido.id}</Text>
                    <Text style={styles.pedidoData}>{pedido.data}</Text>
                </View>

                <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(pedido.status) + '20', borderColor: getStatusColor(pedido.status) }
                ]}>
                    <Ionicons
                        name={getStatusIcon(pedido.status) as any}
                        size={14}
                        color={getStatusColor(pedido.status)}
                    />
                    <Text style={[styles.statusText, { color: getStatusColor(pedido.status) }]}>
                        {getStatusText(pedido.status)}
                    </Text>
                </View>
            </View>

            <View style={styles.pedidoItensContainer}>
                {pedido.itens.slice(0, 2).map((item, index) => (
                    <View key={index} style={styles.pedidoItem}>
                        <Text style={styles.pedidoItemNome} numberOfLines={1}>
                            {item.quantidade}x {item.nome}
                        </Text>
                        <Text style={styles.pedidoItemSubtotal}>
                            R$ {item.subtotal.toFixed(2)}
                        </Text>
                    </View>
                ))}

                {pedido.itens.length > 2 && (
                    <Text style={styles.pedidoMaisItens}>
                        +{pedido.itens.length - 2} iten(s)
                    </Text>
                )}
            </View>

            <View style={styles.pedidoResumo}>
                <View style={styles.pedidoTotalContainer}>
                    <Text style={styles.pedidoTotalLabel}>Total</Text>
                    <Text style={styles.pedidoTotalValor}>
                        R$ {pedido.total.toFixed(2)}
                    </Text>
                </View>

                <View style={styles.pedidoPagamentoContainer}>
                    <View style={[
                        styles.pagamentoBadge,
                        pedido.pago ? styles.pagamentoPago : styles.pagamentoPendente
                    ]}>
                        <Ionicons
                            name={pedido.pago ? "checkmark-circle" : "time"}
                            size={12}
                            color="#FFF"
                        />
                        <Text style={styles.pagamentoTexto}>
                            {pedido.pago ? 'Pago' : 'Pendente'}
                        </Text>
                    </View>

                    {pedido.observacoes && (
                        <View style={styles.observacoesBadge}>
                            <Ionicons name="document-text" size={12} color="#888" />
                            <Text style={styles.observacoesTexto}>Obs</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

// COMPONENTE PRINCIPAL
export default function ProdutosScreen() {
    const [abaAtiva, setAbaAtiva] = useState<'produtos' | 'pedidos'>('produtos');
    const [busca, setBusca] = useState('');
    const [produtos, setProdutos] = useState<ItemEstoque[]>([]);
    const [produtosFiltrados, setProdutosFiltrados] = useState<ItemEstoque[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalCarrinhoVisible, setModalCarrinhoVisible] = useState(false);
    const [modalTamanhoVisible, setModalTamanhoVisible] = useState(false);
    const [produtoSelecionado, setProdutoSelecionado] = useState<ItemEstoque | null>(null);
    const [itensCarrinho, setItensCarrinho] = useState<ItemCarrinho[]>([]);
    const [observacoes, setObservacoes] = useState('');

    useEffect(() => {
        const carregarProdutos = async () => {
            try {
                const dados = await estoqueService.getProdutos();
                setProdutos(dados);
                setProdutosFiltrados(dados);
            } catch (error) {
                console.error('Erro ao carregar produtos:', error);
            } finally {
                setLoading(false);
            }
        };

        carregarProdutos();
    }, []);

    useEffect(() => {
        const unsubscribe = estoqueService.listenProdutos((dados) => {
            setProdutos(dados);
            setProdutosFiltrados(dados);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);



    const filtrarProdutos = (texto: string) => {
        setBusca(texto);

        if (texto.trim() === '') {
            setProdutosFiltrados(produtos);
        } else {
            const textoLower = texto.toLowerCase();
            const filtrados = produtos.filter(produto =>
                produto.nome.toLowerCase().includes(textoLower)
            );
            setProdutosFiltrados(filtrados);
        }
    };


    const limparBusca = () => {
        setBusca('');
        setProdutosFiltrados(produtos);
    };


    const adicionarAoCarrinho = (produto: ItemEstoque) => {
        setProdutoSelecionado(produto);
        setModalTamanhoVisible(true);
    };

    const confirmarAdicao = (tamanho: string) => {
        if (!produtoSelecionado) return;

        const itemExistenteIndex = itensCarrinho.findIndex(item =>
            item.produto.id === produtoSelecionado.id && item.tamanhoSelecionado === tamanho
        );

        if (itemExistenteIndex >= 0) {
            const novosItens = [...itensCarrinho];
            novosItens[itemExistenteIndex].quantidade += 1;
            novosItens[itemExistenteIndex].subtotal =
                novosItens[itemExistenteIndex].quantidade * produtoSelecionado.preco;
            setItensCarrinho(novosItens);
        } else {
            const novoItem: ItemCarrinho = {
                produto: produtoSelecionado,
                quantidade: 1,
                tamanhoSelecionado: tamanho,
                subtotal: produtoSelecionado.preco
            };

            setItensCarrinho([...itensCarrinho, novoItem]);
        }

        setModalTamanhoVisible(false);
        setProdutoSelecionado(null);
        setModalCarrinhoVisible(true);
    };

    const aumentarQuantidade = (index: number) => {
        const novosItens = [...itensCarrinho];
        novosItens[index].quantidade += 1;
        novosItens[index].subtotal =
            novosItens[index].quantidade * novosItens[index].produto.preco;
        setItensCarrinho(novosItens);
    };

    const diminuirQuantidade = (index: number) => {
        const novosItens = [...itensCarrinho];
        if (novosItens[index].quantidade > 1) {
            novosItens[index].quantidade -= 1;
            novosItens[index].subtotal =
                novosItens[index].quantidade * novosItens[index].produto.preco;
            setItensCarrinho(novosItens);
        }
    };

    const removerItem = (index: number) => {
        const novosItens = itensCarrinho.filter((_, i) => i !== index);
        setItensCarrinho(novosItens);
    };

    const calcularTotal = () => {
        return itensCarrinho.reduce((total, item) => total + item.subtotal, 0);
    };

    const reservarItens = () => {
        alert(`Reserva realizada com sucesso!\n\nItens: ${itensCarrinho.length}\nTotal: R$ ${calcularTotal().toFixed(2)}\nObservações: ${observacoes || 'Nenhuma'}`);

        setItensCarrinho([]);
        setObservacoes('');
        setModalCarrinhoVisible(false);
    };

    const renderConteudoAba = () => {
        if (abaAtiva === 'produtos') {
            return (
                <>
                    <View style={styles.buscaContainer}>
                        <View style={styles.buscaInputContainer}>
                            <Ionicons name="search" size={20} color="#888" style={styles.buscaIcon} />
                            <TextInput
                                style={styles.buscaInput}
                                placeholder="Buscar por nome, descrição..."
                                placeholderTextColor="#666"
                                value={busca}
                                onChangeText={filtrarProdutos}
                                autoCapitalize="none"
                            />
                            {busca.length > 0 && (
                                <TouchableOpacity onPress={limparBusca} style={styles.buscaLimpar}>
                                    <Ionicons name="close-circle" size={20} color="#888" />
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.resultadosInfo}>
                            <Text style={styles.resultadosTexto}>
                                {produtosFiltrados.length} {produtosFiltrados.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
                            </Text>
                            {busca && (
                                <Text style={styles.buscaAtivaTexto}>
                                    Buscando por: "{busca}"
                                </Text>
                            )}
                        </View>
                    </View>

                    <ScrollView
                        style={styles.scrollContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        {produtosFiltrados.length > 0 ? (
                            <View style={styles.produtosGrid}>
                                {produtosFiltrados.map((produto) => (
                                    <ProdutoCard
                                        key={produto.id}
                                        produto={produto}
                                        onPress={() => console.log('Ver detalhes:', produto.nome)}
                                        onAdicionarAoCarrinho={adicionarAoCarrinho}
                                    />
                                ))}
                            </View>
                        ) : (
                            <View style={styles.nenhumResultado}>
                                <Ionicons name="search-outline" size={64} color="#666" />
                                <Text style={styles.nenhumResultadoTitle}>
                                    Nenhum produto encontrado
                                </Text>
                                <Text style={styles.nenhumResultadoText}>
                                    Não encontramos produtos para "{busca}"
                                </Text>
                                <TouchableOpacity style={styles.botaoLimparBusca} onPress={limparBusca}>
                                    <Text style={styles.botaoLimparBuscaTexto}>Limpar busca</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={styles.footerSpace} />
                    </ScrollView>
                </>
            );
        } else {
            return (
                <ScrollView
                    style={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {pedidosExemplo.length > 0 ? (
                        <View style={styles.pedidosGrid}>
                            {pedidosExemplo.map((pedido) => (
                                <PedidoCard
                                    key={pedido.id}
                                    pedido={pedido}
                                    onPress={() => console.log('Ver detalhes do pedido:', pedido.id)}
                                />
                            ))}
                        </View>
                    ) : (
                        <View style={styles.nenhumResultado}>
                            <Ionicons name="receipt-outline" size={64} color="#666" />
                            <Text style={styles.nenhumResultadoTitle}>
                                Nenhum pedido encontrado
                            </Text>
                            <Text style={styles.nenhumResultadoText}>
                                Você ainda não fez nenhum pedido
                            </Text>
                            <TouchableOpacity
                                style={styles.botaoVoltarProdutos}
                                onPress={() => setAbaAtiva('produtos')}
                            >
                                <Text style={styles.botaoVoltarProdutosTexto}>
                                    Ver Produtos
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={styles.footerSpace} />
                </ScrollView>
            );
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Ionicons
                        name={abaAtiva === 'produtos' ? "search-outline" : "receipt-outline"}
                        size={32}
                        color="#B8860B"
                    />
                    <Text style={styles.headerTitle}>
                        {abaAtiva === 'produtos' ? 'Buscar Produtos' : 'Meus Pedidos'}
                    </Text>
                    <Text style={styles.headerSubtitle}>
                        {abaAtiva === 'produtos'
                            ? 'Digite o nome do produto que procura'
                            : 'Acompanhe seus pedidos e reservas'
                        }
                    </Text>
                </View>
            </View>

            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[
                        styles.tabItem,
                        abaAtiva === 'produtos' && styles.tabItemAtiva
                    ]}
                    onPress={() => setAbaAtiva('produtos')}
                >
                    <Ionicons
                        name="cart-outline"
                        size={20}
                        color={abaAtiva === 'produtos' ? "#B8860B" : "#888"}
                    />
                    <Text style={[
                        styles.tabText,
                        abaAtiva === 'produtos' && styles.tabTextAtiva
                    ]}>
                        Produtos
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tabItem,
                        abaAtiva === 'pedidos' && styles.tabItemAtiva
                    ]}
                    onPress={() => setAbaAtiva('pedidos')}
                >
                    <Ionicons
                        name="receipt-outline"
                        size={20}
                        color={abaAtiva === 'pedidos' ? "#B8860B" : "#888"}
                    />
                    <Text style={[
                        styles.tabText,
                        abaAtiva === 'pedidos' && styles.tabTextAtiva
                    ]}>
                        Meus Pedidos
                    </Text>
                </TouchableOpacity>
            </View>

            {renderConteudoAba()}

            {abaAtiva === 'produtos' && (
                <TouchableOpacity
                    style={styles.carrinhoFloating}
                    onPress={() => setModalCarrinhoVisible(true)}
                >
                    <View style={styles.carrinhoBadge}>
                        <Text style={styles.carrinhoBadgeText}>
                            {itensCarrinho.reduce((total, item) => total + item.quantidade, 0)}
                        </Text>
                    </View>
                    <Ionicons name="cart" size={24} color="#FFF" />
                </TouchableOpacity>
            )}

            <ModalTamanho
                visible={modalTamanhoVisible}
                produto={produtoSelecionado}
                onFechar={() => {
                    setModalTamanhoVisible(false);
                    setProdutoSelecionado(null);
                }}
                onConfirmar={confirmarAdicao}
            />

            <CarrinhoModal
                visible={modalCarrinhoVisible}
                itens={itensCarrinho}
                total={calcularTotal()}
                onFechar={() => setModalCarrinhoVisible(false)}
                onAumentarQuantidade={aumentarQuantidade}
                onDiminuirQuantidade={diminuirQuantidade}
                onRemoverItem={removerItem}
                onReservar={reservarItens}
                observacoes={observacoes}
                onObservacoesChange={setObservacoes}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    header: {
        backgroundColor: '#000',
        paddingTop: 10,
        paddingBottom: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#333",
    },
    headerContent: {
        alignItems: "center",
        gap: 12,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#B8860B",
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#AAA",
        textAlign: 'center',
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#000',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        paddingHorizontal: 20,
    },
    tabItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        position: 'relative',
    },
    tabItemAtiva: {
        borderBottomWidth: 2,
        borderBottomColor: '#B8860B',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#888',
    },
    tabTextAtiva: {
        color: '#B8860B',
        fontWeight: '600',
    },
    buscaContainer: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
        backgroundColor: '#000',
    },
    buscaInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333',
        paddingHorizontal: 16,
    },
    buscaIcon: {
        marginRight: 12,
    },
    buscaInput: {
        flex: 1,
        color: '#FFF',
        fontSize: 16,
        paddingVertical: 14,
    },
    buscaLimpar: {
        padding: 4,
    },
    resultadosInfo: {
        marginTop: 12,
        paddingHorizontal: 4,
    },
    resultadosTexto: {
        color: '#AAA',
        fontSize: 14,
        fontWeight: '500',
    },
    buscaAtivaTexto: {
        color: '#B8860B',
        fontSize: 12,
        marginTop: 4,
    },
    scrollContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    produtosGrid: {
        gap: 16,
        paddingTop: 8,
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
    placeholderIcon: {
        marginBottom: 12,
    },
    placeholderTexto: {
        color: '#666',
        fontSize: 14,
        fontWeight: '500',
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
    pedidosGrid: {
        gap: 16,
        paddingTop: 16,
    },
    pedidoCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    pedidoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    pedidoInfo: {
        flex: 1,
    },
    pedidoId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 4,
    },
    pedidoData: {
        fontSize: 12,
        color: '#888',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    pedidoItensContainer: {
        gap: 8,
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    pedidoItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pedidoItemNome: {
        fontSize: 14,
        color: '#AAA',
        flex: 1,
        marginRight: 12,
    },
    pedidoItemSubtotal: {
        fontSize: 14,
        fontWeight: '600',
        color: '#B8860B',
    },
    pedidoMaisItens: {
        fontSize: 12,
        color: '#888',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 4,
    },
    pedidoResumo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pedidoTotalContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    pedidoTotalLabel: {
        fontSize: 14,
        color: '#AAA',
    },
    pedidoTotalValor: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#B8860B',
    },
    pedidoPagamentoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    pagamentoBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    pagamentoPago: {
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderWidth: 1,
        borderColor: '#10B981',
    },
    pagamentoPendente: {
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        borderWidth: 1,
        borderColor: '#F59E0B',
    },
    pagamentoTexto: {
        fontSize: 12,
        color: '#FFF',
        fontWeight: '500',
    },
    observacoesBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: 'rgba(136, 136, 136, 0.2)',
        borderWidth: 1,
        borderColor: '#888',
    },
    observacoesTexto: {
        fontSize: 10,
        color: '#888',
    },
    nenhumResultado: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    nenhumResultadoTitle: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '600',
        marginTop: 24,
        marginBottom: 8,
        textAlign: 'center',
    },
    nenhumResultadoText: {
        color: '#888',
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    botaoLimparBusca: {
        backgroundColor: '#B8860B',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    botaoLimparBuscaTexto: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    botaoVoltarProdutos: {
        backgroundColor: '#B8860B',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    botaoVoltarProdutosTexto: {
        color: '#FFF',
        fontSize: 16,
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
    // MODAL DE TAMANHO
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalTamanhoContainer: {
        backgroundColor: '#1a1a1a',
        borderRadius: 20,
        width: '100%',
        maxWidth: 400,
        borderWidth: 1,
        borderColor: '#333',
    },
    modalTamanhoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    modalTamanhoTitulo: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
    },
    modalFecharBtn: {
        padding: 4,
    },
    modalProdutoInfo: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    modalProdutoNome: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFF',
        marginBottom: 8,
    },
    modalProdutoPreco: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#B8860B',
    },
    tamanhosContainer: {
        padding: 20,
        gap: 12,
    },
    tamanhoItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#0a0a0a',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#333',
    },
    tamanhoSelecionado: {
        borderColor: '#B8860B',
        backgroundColor: 'rgba(184, 134, 11, 0.1)',
    },
    tamanhoIndisponivel: {
        opacity: 0.5,
        backgroundColor: '#1a1a1a',
    },
    tamanhoTexto: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
    },
    tamanhoTextoSelecionado: {
        color: '#B8860B',
    },
    tamanhoTextoIndisponivel: {
        color: '#666',
    },
    estoqueTexto: {
        fontSize: 14,
        color: '#888',
    },
    estoqueTextoIndisponivel: {
        color: '#666',
    },
    modalBotoesContainer: {
        flexDirection: 'row',
        gap: 12,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    modalBotaoCancelar: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        backgroundColor: '#2a2a2a',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalBotaoCancelarTexto: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    modalBotaoConfirmar: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 8,
        backgroundColor: '#B8860B',
    },
    modalBotaoConfirmarDisabled: {
        backgroundColor: '#333',
        opacity: 0.5,
    },
    modalBotaoConfirmarTexto: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});