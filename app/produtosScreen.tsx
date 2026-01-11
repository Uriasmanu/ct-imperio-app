// screens/ProdutosScreen.tsx

import { CarrinhoModal, ItemCarrinho } from '@/components/telaProdutos/CarrinhoModal';
import { ModalTamanho } from '@/components/telaProdutos/ModalTamanho';
import { PedidoCard } from '@/components/telaProdutos/PedidoCard';
import { ProdutoCard } from '@/components/telaProdutos/ProdutoCard';
import { auth } from '@/config/firebaseConfig';
import { estoqueService } from '@/services/estoqueService';
import { pedidoService } from '@/services/PedidoService';
import { ItemEstoque, Pedido } from '@/types/estoque';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

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
    const [pedidosUsuario, setPedidosUsuario] = useState<Pedido[]>([]);

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

    // Carregar pedidos quando a aba de pedidos estiver ativa
    useEffect(() => {
        if (abaAtiva === 'pedidos') {
            carregarPedidosUsuario();
        }
    }, [abaAtiva]);

    const carregarPedidosUsuario = async () => {
        try {
            const usuarioLogado = auth.currentUser;

            if (!usuarioLogado) {
                setPedidosUsuario([]);
                return;
            }

            const pedidos = await pedidoService.getPedidosPorUsuario(
                usuarioLogado.uid
            );

            setPedidosUsuario(pedidos);
        } catch (error) {
            console.error("Erro ao carregar pedidos do usuário:", error);
            setPedidosUsuario([]);
        }
    };


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
            // ABA DE PEDIDOS
            return (
                <ScrollView
                    style={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {pedidosUsuario.length > 0 ? (
                        <View style={styles.pedidosContainer}>
                            {pedidosUsuario.map((pedido) => (
                                <PedidoCard
                                    key={pedido.id}
                                    pedido={pedido}
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
    pedidosContainer: {
        gap: 16,
        paddingTop: 16,
    },
    pedidoCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    pedidoText: {
        color: '#FFF',
        fontSize: 16,
    },
    /* ESTADOS VAZIOS */
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
    /* CARRINHO */
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