// components/Estoque.tsx (atualizado completo)
import { estoqueService } from "@/services/estoqueService";
import { pedidoService } from "@/services/PedidoService";
import { ItemEstoque, Pedido } from "@/types/estoque";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { FormProduto } from "./FormProduto";
import { ModalPedido } from "./ModalPedido";
import { ModalVenda } from "./ModalVenda";

export const Estoque: React.FC = () => {
    const [abaAtiva, setAbaAtiva] = useState<"estoque" | "pedidos">("estoque");
    const [mostrarFormItem, setMostrarFormItem] = useState(false);
    const [mostrarModalVenda, setMostrarModalVenda] = useState(false);
    const [estoque, setEstoque] = useState<ItemEstoque[]>([]);
    const [produtoEditando, setProdutoEditando] = useState<ItemEstoque | null>(null);
    const [produtoVendendo, setProdutoVendendo] = useState<ItemEstoque | null>(null);
    const [modoEdicao, setModoEdicao] = useState(false);

    const [mostrarModalPedido, setMostrarModalPedido] = useState(false);
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [pedidoEditando, setPedidoEditando] = useState<Pedido | null>(null);

    // Carregar produtos ao iniciar
    useEffect(() => {
        const unsubscribe = estoqueService.listenProdutos((produtos) => {
            setEstoque(produtos);
        });

        return () => unsubscribe();
    }, []);

    // Carregar pedidos quando a aba estiver ativa
    useEffect(() => {
        if (abaAtiva === 'pedidos') {
            carregarPedidos();
        }
    }, [abaAtiva]);


    const carregarPedidos = async () => {
        try {
            const pedidosData = await pedidoService.getPedidos();
            setPedidos(pedidosData);
        } catch (error) {
            console.error('Erro ao carregar pedidos:', error);
            Alert.alert('Erro', 'Não foi possível carregar os pedidos');
        }
    };

    // Função para criar novo pedido
    const handleCriarPedido = async (pedido: Omit<Pedido, 'id'>) => {
        try {
            await pedidoService.criarPedido(pedido);
            await carregarPedidos();
            setMostrarModalPedido(false);
            Alert.alert('Sucesso', 'Pedido criado com sucesso!');
        } catch (error) {
            console.error('Erro ao criar pedido:', error);
            Alert.alert('Erro', 'Não foi possível criar o pedido');
        }
    };

    // Função para marcar pedido como pago
    const handleMarcarPago = async (pedidoId: string) => {
        try {
            await pedidoService.marcarComoPago(pedidoId);
            await carregarPedidos();
            Alert.alert('Sucesso', 'Pedido marcado como pago!');
        } catch (error) {
            console.error('Erro ao marcar pedido como pago:', error);
            Alert.alert('Erro', 'Não foi possível marcar o pedido como pago');
        }
    };

    // Função para deletar pedido
    const handleDeletarPedido = async (pedido: Pedido) => {
        Alert.alert(
            'Confirmar Exclusão',
            `Tem certeza que deseja excluir o pedido de ${pedido.pessoa}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await pedidoService.deletarPedido(pedido.id);
                            await carregarPedidos();
                            Alert.alert('Sucesso', 'Pedido excluído com sucesso!');
                        } catch (error) {
                            console.error('Erro ao excluir pedido:', error);
                            Alert.alert('Erro', 'Não foi possível excluir o pedido');
                        }
                    }
                }
            ]
        );
    };

    // Função para adicionar produto
    const handleAdicionarProduto = async (produto: Omit<ItemEstoque, 'id'>) => {
        try {
            await estoqueService.addProduto(produto);
        } catch (error) {
            console.error('Erro ao adicionar produto:', error);
            throw error;
        }
    };

    // Função para atualizar produto
    const handleAtualizarProduto = async (id: string, produto: Partial<ItemEstoque>) => {
        try {
            await estoqueService.updateProduto(id, produto);
        } catch (error) {
            console.error('Erro ao atualizar produto:', error);
            throw error;
        }
    };

    // Função para processar venda
    const handleProcessarVenda = async (produtoId: string, tamanho: string, quantidade: number) => {
        try {
            await estoqueService.atualizarEstoque(produtoId, tamanho, quantidade, 'remover');
        } catch (error) {
            console.error('Erro ao processar venda:', error);
            throw error;
        }
    };

    // Função para abrir o formulário de edição
    const handleEditarProduto = (produto: ItemEstoque) => {
        setProdutoEditando(produto);
        setModoEdicao(true);
        setMostrarFormItem(true);
    };

    // Função para abrir o modal de venda
    const handleAbrirVenda = (produto: ItemEstoque) => {
        setProdutoVendendo(produto);
        setMostrarModalVenda(true);
    };

    // Função para fechar o modal de venda
    const handleFecharVenda = () => {
        setMostrarModalVenda(false);
        setProdutoVendendo(null);
    };

    // Função para abrir o formulário de criação
    const handleNovoProduto = () => {
        setProdutoEditando(null);
        setModoEdicao(false);
        setMostrarFormItem(true);
    };

    // Função para fechar o formulário
    const handleFecharFormulario = () => {
        setMostrarFormItem(false);
        setProdutoEditando(null);
        setModoEdicao(false);
    };

    const handleAtualizarPedido = async (id: string, pedido: Partial<Pedido>) => {
        try {
            await pedidoService.atualizarPedido(id, pedido);
            await carregarPedidos();
            setPedidoEditando(null);
            setMostrarModalPedido(false);
            Alert.alert('Sucesso', 'Pedido atualizado com sucesso!');
        } catch (error) {
            console.error('Erro ao atualizar pedido:', error);
        }
    };

    // Função para deletar produto
    const handleDeletarProduto = async (produto: ItemEstoque) => {
        Alert.alert(
            'Confirmar Exclusão',
            `Tem certeza que deseja excluir "${produto.nome}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await estoqueService.deleteProduto(produto.id);
            
                            Alert.alert('Sucesso', 'Produto excluído com sucesso!');
                        } catch (error) {
                            console.error('Erro ao excluir produto:', error);
                            Alert.alert('Erro', 'Não foi possível excluir o produto');
                        }
                    }
                }
            ]
        );
    };

    const calcularTotalPedido = (pedido: Pedido): number => {
        return pedido.total || pedido.itens.reduce((total, item) => total + item.subtotal, 0);
    };

    const obterNomeItem = (itemId: string): string => {
        // Primeiro tenta encontrar o nome nos itens do pedido
        const pedidoComItem = pedidos.find(pedido =>
            pedido.itens.some(item => item.itemId === itemId)
        );
        if (pedidoComItem) {
            const item = pedidoComItem.itens.find(item => item.itemId === itemId);
            if (item) return item.nome;
        }
        // Se não encontrar, busca no estoque
        const itemEstoque = estoque.find(i => i.id === itemId);
        return itemEstoque?.nome || "Item não encontrado";
    };

    return (
        <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <View style={styles.sectionTitleContainer}>
                    <Ionicons name="cube" size={22} color="#B8860B" />
                    <Text style={styles.sectionTitle}>Controle de Estoque</Text>
                </View>

                {/* ABAS */}
                <View style={styles.abasContainer}>
                    <TouchableOpacity
                        style={[
                            styles.aba,
                            abaAtiva === "estoque" && styles.abaAtiva
                        ]}
                        onPress={() => setAbaAtiva("estoque")}
                    >
                        <Ionicons
                            name="cube-outline"
                            size={18}
                            color={abaAtiva === "estoque" ? "#000" : "#B8860B"}
                        />
                        <Text style={[
                            styles.abaTexto,
                            abaAtiva === "estoque" && styles.abaTextoAtivo
                        ]}>
                            Estoque
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.aba,
                            abaAtiva === "pedidos" && styles.abaAtiva
                        ]}
                        onPress={() => setAbaAtiva("pedidos")}
                    >
                        <Ionicons
                            name="list"
                            size={18}
                            color={abaAtiva === "pedidos" ? "#000" : "#B8860B"}
                        />
                        <Text style={[
                            styles.abaTexto,
                            abaAtiva === "pedidos" && styles.abaTextoAtivo
                        ]}>
                            Pedidos
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* FORMULÁRIO DE PRODUTO */}
            <FormProduto
                visible={mostrarFormItem}
                onClose={handleFecharFormulario}
                onSave={handleAdicionarProduto}
                onUpdate={handleAtualizarProduto}
                produtoEditando={produtoEditando}
                modoEdicao={modoEdicao}
            />

            {/* MODAL DE VENDA */}
            <ModalVenda
                visible={mostrarModalVenda}
                produto={produtoVendendo}
                onClose={handleFecharVenda}
                onVender={handleProcessarVenda}
            />

            {/* MODAL DE PEDIDO */}
            <ModalPedido
                visible={mostrarModalPedido}
                onClose={() => setMostrarModalPedido(false)}
                onSalvarPedido={handleCriarPedido}
                onAtualizarPedido={handleAtualizarPedido}
                pedidoEditando={pedidoEditando}
                produtos={estoque}
            />


            {/* BOTÕES DE AÇÃO */}
            <View style={styles.acoesContainer}>
                {abaAtiva === "estoque" ? (
                    <TouchableOpacity
                        style={styles.botaoAdicionar}
                        onPress={handleNovoProduto}
                    >
                        <Ionicons name="add" size={20} color="#000" />
                        <Text style={styles.botaoAdicionarTexto}>Novo Item</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.botaoAdicionar}
                        onPress={() => setMostrarModalPedido(true)}
                    >
                        <Ionicons name="add" size={20} color="#000" />
                        <Text style={styles.botaoAdicionarTexto}>Novo Pedido</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* CONTEÚDO DAS ABAS */}
            <ScrollView style={styles.conteudo}>
                {abaAtiva === "estoque" ? (
                    // ABA DE ESTOQUE
                    <View style={styles.estoqueContainer}>
                        {estoque.length === 0 ? (
                            <View style={styles.listaVazia}>
                                <Ionicons name="cube-outline" size={48} color="#666" />
                                <Text style={styles.listaVaziaTexto}>
                                    Nenhum produto cadastrado
                                </Text>
                                <TouchableOpacity
                                    style={styles.botaoAdicionarPrimeiro}
                                    onPress={handleNovoProduto}
                                >
                                    <Text style={styles.botaoAdicionarPrimeiroTexto}>
                                        Adicionar Primeiro Produto
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            estoque.map((item) => (
                                <View key={item.id} style={styles.itemCard}>
                                    <View style={styles.itemHeader}>
                                        <Text style={styles.itemNome}>{item.nome}</Text>
                                        <View style={styles.itemPrecoContainer}>
                                            <Text style={styles.itemPreco}>
                                                R$ {item.preco.toFixed(2)}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.itemInfo}>
                                        <View style={styles.quantidadeContainer}>
                                            <Ionicons name="pricetag" size={16} color="#B8860B" />
                                            <Text style={styles.quantidadeTexto}>
                                                Estoque: {item.quantidade} unidades
                                            </Text>
                                        </View>

                                        {Object.keys(item.tamanhos).length > 0 && (
                                            <View style={styles.tamanhosContainer}>
                                                <Text style={styles.tamanhosTitulo}>Tamanhos:</Text>
                                                <View style={styles.tamanhosLista}>
                                                    {Object.entries(item.tamanhos).map(([tamanho, qtd]) => (
                                                        <View key={tamanho} style={styles.tamanhoItem}>
                                                            <Text style={styles.tamanhoTexto}>
                                                                {tamanho}: {qtd}
                                                            </Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            </View>
                                        )}
                                    </View>

                                    <View style={styles.itemAcoes}>
                                        <TouchableOpacity
                                            style={styles.botaoEditar}
                                            onPress={() => handleEditarProduto(item)}
                                        >
                                            <Ionicons name="create" size={16} color="#B8860B" />
                                            <Text style={styles.botaoEditarTexto}>Editar</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.botaoVender}
                                            onPress={() => handleAbrirVenda(item)}
                                        >
                                            <Ionicons name="cart" size={16} color="#FFF" />
                                            <Text style={styles.botaoVenderTexto}>Vender</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.botaoDeletar}
                                            onPress={() => handleDeletarProduto(item)}
                                        >
                                            <Ionicons name="trash" size={16} color="#FFF" />
                                            <Text style={styles.botaoDeletarTexto}>Excluir</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                ) : (
                    // ABA DE PEDIDOS
                    <View style={styles.pedidosContainer}>
                        {pedidos.length === 0 ? (
                            <View style={styles.listaVazia}>
                                <Ionicons name="list-outline" size={48} color="#666" />
                                <Text style={styles.listaVaziaTexto}>
                                    Nenhum pedido cadastrado
                                </Text>
                                <TouchableOpacity
                                    style={styles.botaoAdicionarPrimeiro}
                                    onPress={() => setMostrarModalPedido(true)}
                                >
                                    <Text style={styles.botaoAdicionarPrimeiroTexto}>
                                        Criar Primeiro Pedido
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            pedidos.map((pedido) => (
                                <View key={pedido.id} style={styles.pedidoCard}>
                                    {/* Cabeçalho */}
                                    <View style={styles.pedidoHeader}>
                                        <View>
                                            <Text style={styles.pedidoPessoa}>{pedido.pessoa}</Text>
                                            <Text style={styles.pedidoData}>
                                                <Ionicons name="calendar-outline" size={12} /> {pedido.data}
                                            </Text>
                                        </View>
                                        <View style={[
                                            styles.statusBadge,
                                            pedido.pago ? styles.statusBadgePago : styles.statusBadgePendente
                                        ]}>
                                            <Ionicons
                                                name={pedido.pago ? "checkmark-circle" : "alert-circle"}
                                                size={14}
                                                color={pedido.pago ? "#22C55E" : "#EF4444"}
                                            />
                                            <Text style={[
                                                styles.statusTexto,
                                                { color: pedido.pago ? "#22C55E" : "#EF4444" }
                                            ]}>
                                                {pedido.pago ? "Recebido" : "Pendente"}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Lista de Itens */}
                                    <View style={styles.pedidoItens}>
                                        {pedido.itens.map((itemPedido, index) => (
                                            <View key={index} style={styles.pedidoItem}>
                                                <View style={styles.pedidoItemBadge}>
                                                    <Text style={styles.pedidoItemQuantidade}>{itemPedido.quantidade}x</Text>
                                                </View>
                                                <Text style={styles.pedidoItemNome} numberOfLines={1}>
                                                    {itemPedido.nome || obterNomeItem(itemPedido.itemId)}
                                                    {itemPedido.tamanho ? ` (${itemPedido.tamanho})` : ''}
                                                </Text>
                                                <Text style={styles.pedidoItemPreco}>
                                                    R$ {itemPedido.subtotal.toFixed(2)}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>

                                    {/* Rodapé e Ações */}
                                    <View style={styles.pedidoFooter}>
                                        <View style={styles.pedidoTotalContainer}>
                                            <Text style={styles.totalLabel}>Total do Pedido</Text>
                                            <Text style={styles.pedidoTotal}>
                                                R$ {calcularTotalPedido(pedido).toFixed(2)}
                                            </Text>
                                        </View>

                                        <View style={styles.pedidoAcoes}>
                                            {!pedido.pago && (
                                                <TouchableOpacity
                                                    style={[styles.botaoAcaoIcone, styles.botaoAcaoPagar]}
                                                    onPress={() => handleMarcarPago(pedido.id)}
                                                >
                                                    <Ionicons name="cash-outline" size={20} color="#FFF" />
                                                </TouchableOpacity>
                                            )}

                                            <TouchableOpacity
                                                style={styles.botaoAcaoIcone}
                                                onPress={() => {
                                                    setPedidoEditando(pedido);
                                                    setMostrarModalPedido(true);
                                                }}
                                            >
                                                <Ionicons name="create-outline" size={20} color="#B8860B" />
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={styles.botaoAcaoIcone}
                                                onPress={() => handleDeletarPedido(pedido)}
                                            >
                                                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    header: {
        padding: 16,
        backgroundColor: "#1a1a1a",
    },
    sectionTitleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#B8860B",
    },
    abasContainer: {
        flexDirection: "row",
        backgroundColor: "#1a1a1a",
        borderRadius: 8,
        padding: 4,
    },
    aba: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
    },
    abaAtiva: {
        backgroundColor: "#B8860B",
    },
    abaTexto: {
        color: "#B8860B",
        fontWeight: "600",
        fontSize: 14,
    },
    abaTextoAtivo: {
        color: "#000",
        fontWeight: "bold",
    },
    acoesContainer: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#333",
    },
    botaoAdicionar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#B8860B",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    botaoAdicionarTexto: {
        color: "#000",
        fontWeight: "bold",
        fontSize: 14,
    },
    conteudo: {
        flex: 1,
        padding: 4,
    },
    estoqueContainer: {
        gap: 12,
        padding: 8,
    },
    listaVazia: {
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
    },
    listaVaziaTexto: {
        color: "#666",
        fontSize: 16,
        marginTop: 12,
        textAlign: "center",
    },
    botaoAdicionarPrimeiro: {
        backgroundColor: "#B8860B",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 16,
    },
    botaoAdicionarPrimeiroTexto: {
        color: "#000",
        fontWeight: "bold",
        fontSize: 14,
    },
    itemCard: {
        backgroundColor: "#1a1a1a",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#333",
    },
    itemHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    itemNome: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFF",
        flex: 1,
    },
    itemPrecoContainer: {
        backgroundColor: "#B8860B",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    itemPreco: {
        color: "#000",
        fontWeight: "bold",
        fontSize: 12,
    },
    itemInfo: {
        gap: 8,
    },
    quantidadeContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    quantidadeTexto: {
        color: "#FFF",
        fontSize: 14,
    },
    tamanhosContainer: {
        marginTop: 4,
    },
    tamanhosTitulo: {
        color: "#B8860B",
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 4,
    },
    tamanhosLista: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    tamanhoItem: {
        backgroundColor: "#333",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    tamanhoTexto: {
        color: "#FFF",
        fontSize: 12,
    },
    itemAcoes: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 12,
        gap: 8,
    },
    botaoEditar: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "#B8860B",
        borderRadius: 6,
        flex: 1,
    },
    botaoEditarTexto: {
        color: "#B8860B",
        fontSize: 12,
        fontWeight: "600",
    },
    botaoVender: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: "#22C55E",
        borderRadius: 6,
        flex: 1,
    },
    botaoVenderTexto: {
        color: "#FFF",
        fontSize: 12,
        fontWeight: "600",
    },
    botaoDeletar: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: "#EF4444",
        borderRadius: 6,
        flex: 1,
    },
    botaoDeletarTexto: {
        color: "#FFF",
        fontSize: 12,
        fontWeight: "600",
    },

    statusPedido: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusPago: {
        backgroundColor: "rgba(34, 197, 94, 0.1)",
    },
    statusPendente: {
        backgroundColor: "rgba(239, 68, 68, 0.1)",
    },
    pedidoItemDetalhes: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    pedidoItemTamanho: {
        color: "#888",
        fontSize: 12,
    },
    botaoMarcarPago: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: "#22C55E",
        borderRadius: 6,
    },
    botaoMarcarPagoTexto: {
        color: "#FFF",
        fontSize: 12,
        fontWeight: "600",
    },
    botaoDetalhes: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "#EF4444",
        borderRadius: 6,
    },
    botaoDetalhesTexto: {
        color: "#EF4444",
        fontSize: 12,
        fontWeight: "600",
    },
    pedidosContainer: {
        padding: 12,
        gap: 16,
    },
    pedidoCard: {
        backgroundColor: "#1a1a1a",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#333",
        // Sombra leve para profundidade no iOS
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5, // Sombra no Android
    },
    pedidoHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        borderBottomWidth: 1,
        borderBottomColor: "#333",
        paddingBottom: 12,
        marginBottom: 12,
    },
    pedidoPessoa: {
        fontSize: 18,
        fontWeight: "800",
        color: "#FFF",
        textTransform: 'capitalize',
    },
    pedidoData: {
        fontSize: 12,
        color: "#888",
        marginTop: 2,
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 4,
    },
    statusBadgePago: {
        backgroundColor: "rgba(34, 197, 94, 0.15)",
    },
    statusBadgePendente: {
        backgroundColor: "rgba(239, 68, 68, 0.15)",
    },
    statusTexto: {
        fontSize: 11,
        fontWeight: "bold",
        textTransform: "uppercase",
    },
    pedidoItens: {
        gap: 10,
        marginBottom: 16,
    },
    pedidoItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#262626",
        padding: 10,
        borderRadius: 8,
    },
    pedidoItemNome: {
        color: "#DDD",
        fontSize: 14,
        fontWeight: "500",
        flex: 1,
    },
    pedidoItemBadge: {
        backgroundColor: "#333",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: 8,
    },
    pedidoItemQuantidade: {
        color: "#B8860B",
        fontSize: 12,
        fontWeight: "bold",
    },
    pedidoItemPreco: {
        color: "#22C55E",
        fontSize: 13,
        fontWeight: "700",
    },
    pedidoFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 4,
    },
    pedidoTotalContainer: {
        flex: 1,
    },
    totalLabel: {
        color: "#888",
        fontSize: 10,
        textTransform: "uppercase",
    },
    pedidoTotal: {
        color: "#FFF",
        fontSize: 20,
        fontWeight: "900",
    },
    pedidoAcoes: {
        flexDirection: "row",
        gap: 8,
    },
    botaoAcaoIcone: {
        padding: 10,
        borderRadius: 10,
        backgroundColor: "#262626",
        borderWidth: 1,
        borderColor: "#444",
    },
    botaoAcaoPagar: {
        backgroundColor: "#22C55E",
        borderColor: "#22C55E",
    }
});
