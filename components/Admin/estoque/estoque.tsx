// components/Estoque.tsx
import { estoqueService } from "@/services/estoqueService";
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

export const Estoque: React.FC = () => {
    const [abaAtiva, setAbaAtiva] = useState<"estoque" | "pedidos">("estoque");
    const [mostrarFormItem, setMostrarFormItem] = useState(false);
    const [mostrarFormPedido, setMostrarFormPedido] = useState(false);
    const [estoque, setEstoque] = useState<ItemEstoque[]>([]);
    const [produtoEditando, setProdutoEditando] = useState<ItemEstoque | null>(null);
    const [modoEdicao, setModoEdicao] = useState(false);

    // Carregar produtos ao iniciar
    useEffect(() => {
        carregarProdutos();
    }, []);

    const carregarProdutos = async () => {
        try {
            const produtos = await estoqueService.getProdutos();
            setEstoque(produtos);
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            Alert.alert('Erro', 'Não foi possível carregar os produtos');
        }
    };

    // Função para adicionar produto
    const handleAdicionarProduto = async (produto: Omit<ItemEstoque, 'id'>) => {
        try {
            await estoqueService.addProduto(produto);
            await carregarProdutos(); // Recarregar a lista
        } catch (error) {
            console.error('Erro ao adicionar produto:', error);
            throw error;
        }
    };

    // Função para atualizar produto
    const handleAtualizarProduto = async (id: string, produto: Partial<ItemEstoque>) => {
        try {
            await estoqueService.updateProduto(id, produto);
            await carregarProdutos(); // Recarregar a lista
        } catch (error) {
            console.error('Erro ao atualizar produto:', error);
            throw error;
        }
    };

    // Função para abrir o formulário de edição
    const handleEditarProduto = (produto: ItemEstoque) => {
        setProdutoEditando(produto);
        setModoEdicao(true);
        setMostrarFormItem(true);
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
                            await carregarProdutos();
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

    // Função para vender produto
    const handleVenderProduto = (produto: ItemEstoque) => {
        Alert.alert(
            'Vender Produto',
            `Registrar venda de ${produto.nome}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Vender', 
                    onPress: () => {
                        // Aqui você pode implementar a lógica de venda
                        Alert.alert('Venda', 'Funcionalidade de venda em desenvolvimento');
                    }
                }
            ]
        );
    };

    const [pedidos, setPedidos] = useState<Pedido[]>([
        {
            id: "1",
            pessoa: "João Silva",
            itens: [
                { itemId: "1", quantidade: 1, tamanho: "M" },
                { itemId: "3", quantidade: 1 }
            ],
            data: "15/12/2024",
            pago: true,
            total: 134.90
        },
        {
            id: "2",
            pessoa: "Maria Santos",
            itens: [
                { itemId: "2", quantidade: 1, tamanho: "P" },
                { itemId: "4", quantidade: 2 }
            ],
            data: "16/12/2024",
            pago: false,
            total: 99.90
        },
        {
            id: "3",
            pessoa: "Pedro Costa",
            itens: [
                { itemId: "1", quantidade: 1, tamanho: "G" },
                { itemId: "5", quantidade: 3 }
            ],
            data: "17/12/2024",
            pago: true,
            total: 164.90
        }
    ]);

    const calcularTotalPedido = (pedido: Pedido): number => {
        return pedido.itens.reduce((total, itemPedido) => {
            const item = estoque.find(i => i.id === itemPedido.itemId);
            return total + (item ? item.preco * itemPedido.quantidade : 0);
        }, 0);
    };

    const obterNomeItem = (itemId: string): string => {
        const item = estoque.find(i => i.id === itemId);
        return item?.nome || "Item não encontrado";
    };

    // Função para marcar pedido como pago
    const handleMarcarPago = (pedidoId: string) => {
        setPedidos(pedidos.map(pedido => 
            pedido.id === pedidoId ? { ...pedido, pago: true } : pedido
        ));
        Alert.alert('Sucesso', 'Pedido marcado como pago!');
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

            {/* FORMULÁRIO */}
            <FormProduto
                visible={mostrarFormItem}
                onClose={handleFecharFormulario}
                onSave={handleAdicionarProduto}
                onUpdate={handleAtualizarProduto}
                produtoEditando={produtoEditando}
                modoEdicao={modoEdicao}
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
                        onPress={() => setMostrarFormPedido(true)}
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
                                            onPress={() => handleVenderProduto(item)}
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
                        {pedidos.map((pedido) => (
                            <View key={pedido.id} style={styles.pedidoCard}>
                                <View style={styles.pedidoHeader}>
                                    <View>
                                        <Text style={styles.pedidoPessoa}>{pedido.pessoa}</Text>
                                        <Text style={styles.pedidoData}>{pedido.data}</Text>
                                    </View>
                                    <View style={[
                                        styles.statusPedido,
                                        pedido.pago ? styles.statusPago : styles.statusPendente
                                    ]}>
                                        <Ionicons
                                            name={pedido.pago ? "checkmark-circle" : "time"}
                                            size={16}
                                            color={pedido.pago ? "#22C55E" : "#EF4444"}
                                        />
                                        <Text style={[
                                            styles.statusTexto,
                                            { color: pedido.pago ? "#22C55E" : "#EF4444" }
                                        ]}>
                                            {pedido.pago ? "Pago" : "Pendente"}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.pedidoItens}>
                                    {pedido.itens.map((itemPedido, index) => (
                                        <View key={index} style={styles.pedidoItem}>
                                            <Text style={styles.pedidoItemNome}>
                                                {obterNomeItem(itemPedido.itemId)}
                                            </Text>
                                            <View style={styles.pedidoItemDetalhes}>
                                                <Text style={styles.pedidoItemQuantidade}>
                                                    {itemPedido.quantidade}x
                                                </Text>
                                                {itemPedido.tamanho && (
                                                    <Text style={styles.pedidoItemTamanho}>
                                                        Tamanho: {itemPedido.tamanho}
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                    ))}
                                </View>

                                <View style={styles.pedidoFooter}>
                                    <Text style={styles.pedidoTotal}>
                                        Total: R$ {calcularTotalPedido(pedido).toFixed(2)}
                                    </Text>
                                    <View style={styles.pedidoAcoes}>
                                        {!pedido.pago && (
                                            <TouchableOpacity 
                                                style={styles.botaoMarcarPago}
                                                onPress={() => handleMarcarPago(pedido.id)}
                                            >
                                                <Ionicons name="checkmark" size={16} color="#FFF" />
                                                <Text style={styles.botaoMarcarPagoTexto}>Marcar Pago</Text>
                                            </TouchableOpacity>
                                        )}
                                        <TouchableOpacity style={styles.botaoDetalhes}>
                                            <Ionicons name="eye" size={16} color="#B8860B" />
                                            <Text style={styles.botaoDetalhesTexto}>Detalhes</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* MODAL PARA NOVO PEDIDO (placeholder) */}
            {mostrarFormPedido && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Novo Pedido</Text>
                        <Text style={styles.modalText}>
                            Formulário para criar novo pedido
                        </Text>
                        <TouchableOpacity
                            style={styles.botaoFecharModal}
                            onPress={() => setMostrarFormPedido(false)}
                        >
                            <Text style={styles.botaoFecharModalTexto}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
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
    pedidosContainer: {
        gap: 12,
        padding: 8,
    },
    pedidoCard: {
        backgroundColor: "#1a1a1a",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#333",
    },
    pedidoHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    pedidoPessoa: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFF",
    },
    pedidoData: {
        fontSize: 12,
        color: "#888",
        marginTop: 2,
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
    statusTexto: {
        fontSize: 12,
        fontWeight: "600",
    },
    pedidoItens: {
        gap: 8,
        marginBottom: 12,
    },
    pedidoItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 4,
    },
    pedidoItemNome: {
        color: "#FFF",
        fontSize: 14,
        flex: 1,
    },
    pedidoItemDetalhes: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    pedidoItemQuantidade: {
        color: "#B8860B",
        fontSize: 12,
        fontWeight: "600",
    },
    pedidoItemTamanho: {
        color: "#888",
        fontSize: 12,
    },
    pedidoFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#333",
        paddingTop: 12,
    },
    pedidoTotal: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "bold",
    },
    pedidoAcoes: {
        flexDirection: "row",
        gap: 8,
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
        borderColor: "#B8860B",
        borderRadius: 6,
    },
    botaoDetalhesTexto: {
        color: "#B8860B",
        fontSize: 12,
        fontWeight: "600",
    },
    modalOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContent: {
        backgroundColor: "#1a1a1a",
        padding: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#B8860B",
        width: "100%",
        maxWidth: 400,
    },
    modalTitle: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
    },
    modalText: {
        color: "#B8860B",
        fontSize: 14,
        textAlign: "center",
        marginBottom: 20,
    },
    botaoFecharModal: {
        backgroundColor: "#B8860B",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    botaoFecharModalTexto: {
        color: "#000",
        fontWeight: "bold",
        fontSize: 14,
    },
});