// components/Estoque.tsx (completo atualizado)
import { db } from "@/config/firebaseConfig";
import { estoqueService } from "@/services/estoqueService";
import { pedidoService } from "@/services/PedidoService";
import { ItemEstoque, Pedido } from "@/types/estoque";
import { Usuario } from '@/types/usuarios';
import { Ionicons } from "@expo/vector-icons";
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Image,
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

    // Estado para alunos (usuários)
    const [alunos, setAlunos] = useState<Usuario[]>([]);
    const [carregandoAlunos, setCarregandoAlunos] = useState(true);

    // Função para carregar alunos do banco de dados
    const carregarAlunos = async () => {
        try {
            setCarregandoAlunos(true);
            const querySnapshot = await getDocs(collection(db, "usuarios"));
            const alunosData: Usuario[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                alunosData.push({
                    id: doc.id,
                    nome: data.nome || "",
                    email: data.email || "",
                    telefone: data.telefone || "",
                    ...data
                } as Usuario);
            });

            // Ordena os alunos por nome
            alunosData.sort((a, b) => a.nome.localeCompare(b.nome));
            setAlunos(alunosData);
        } catch (error) {
            console.error("Erro ao carregar alunos:", error);
            Alert.alert("Erro", "Não foi possível carregar a lista de alunos.");
        } finally {
            setCarregandoAlunos(false);
        }
    };

    // Carregar produtos ao iniciar
    useEffect(() => {
        const unsubscribe = estoqueService.listenProdutos((produtos) => {
            setEstoque(produtos);
        });

        // Carregar alunos quando o componente montar
        carregarAlunos();

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

    // Função para marcar pedido como entregue (usando atualizarPedido)
    const handleMarcarEntregue = async (pedidoId: string) => {
        try {
            await pedidoService.atualizarPedido(pedidoId, {
                status: 'entregue'
            });
            await carregarPedidos();
            Alert.alert('Sucesso', 'Pedido marcado como entregue!');
        } catch (error) {
            console.error('Erro ao marcar pedido como entregue:', error);
            Alert.alert('Erro', 'Não foi possível marcar o pedido como entregue');
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

    // Função para obter o texto do status
    const getStatusTexto = (pedido: Pedido): string => {
        return pedido.status.charAt(0).toUpperCase() + pedido.status.slice(1);
    };

    // Função para obter a cor do status
    const getStatusCor = (pedido: Pedido): string => {
        switch (pedido.status) {
            case 'entregue': return "#3B82F6"; // Azul
            case 'pago': return "#22C55E"; // Verde
            case 'reservado': return "#F59E0B"; // Laranja
            case 'pendente': return "#EF4444"; // Vermelho
            default: return "#6B7280"; // Cinza
        }
    };

    // Função para obter o ícone do status
    const getStatusIcone = (pedido: Pedido): string => {
        switch (pedido.status) {
            case 'entregue': return "checkmark-done";
            case 'pago': return "checkmark-circle";
            case 'reservado': return "time-outline";
            case 'pendente': return "alert-circle";
            default: return "help-circle";
        }
    };

    // Função para determinar se o botão de pagamento deve ser mostrado
    const mostrarBotaoPagar = (pedido: Pedido): boolean => {
        return pedido.status === 'pendente' || pedido.status === 'reservado';
    };

    // Função para determinar se o botão de entregue deve ser mostrado
    const mostrarBotaoEntregue = (pedido: Pedido): boolean => {
        return pedido.status === 'pago';
    };

    // Função para marcar como reservado
    const handleMarcarReservado = async (pedidoId: string) => {
        try {
            await pedidoService.atualizarPedido(pedidoId, {
                status: 'reservado'
            });
            await carregarPedidos();
            Alert.alert('Sucesso', 'Pedido marcado como reservado!');
        } catch (error) {
            console.error('Erro ao marcar pedido como reservado:', error);
            Alert.alert('Erro', 'Não foi possível marcar o pedido como reservado');
        }
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
                alunos={alunos} // Passa a lista de alunos carregada
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
                                    {/* IMAGEM GRANDE NO TOPO */}
                                    <View style={styles.imagemContainer}>
                                        {item.imagem ? (
                                            <Image
                                                source={{ uri: item.imagem }}
                                                style={styles.itemImagemGrande}
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <View style={[styles.itemImagemGrande, styles.itemImagemPlaceholder]}>
                                                <Ionicons name="cube-outline" size={48} color="#666" />
                                                <Text style={styles.placeholderTexto}>Sem imagem</Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* INFORMAÇÕES ABAIXO DA IMAGEM */}
                                    <View style={styles.conteudoCard}>
                                        {/* CABEÇALHO COM NOME E PREÇO */}
                                        <View style={styles.itemHeader}>
                                            <Text style={styles.itemNome} numberOfLines={2}>
                                                {item.nome}
                                            </Text>
                                            <View style={styles.itemPrecoContainer}>
                                                <Text style={styles.itemPreco}>
                                                    R$ {item.preco.toFixed(2)}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* INFORMAÇÕES DO PRODUTO */}
                                        <View style={styles.itemInfo}>
                                            <View style={styles.quantidadeContainer}>
                                                <Ionicons name="pricetag" size={16} color="#B8860B" />
                                                <Text style={styles.quantidadeTexto}>
                                                    Estoque: {item.quantidade} unidades
                                                </Text>
                                            </View>

                                            {Object.keys(item.tamanhos).length > 0 && (
                                                <View style={styles.tamanhosContainer}>
                                                    <Text style={styles.tamanhosTitulo}>Tamanhos disponíveis:</Text>
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

                                        {/* AÇÕES */}
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
                            pedidos.map((pedido) => {
                                const statusCor = getStatusCor(pedido);
                                const statusTexto = getStatusTexto(pedido);
                                const statusIcone = getStatusIcone(pedido);

                                return (
                                    <View key={pedido.id} style={styles.pedidoCard}>
                                        {/* Cabeçalho */}
                                        <View style={styles.pedidoHeader}>
                                            <View>
                                                <Text style={styles.pedidoPessoa}>{pedido.pessoa}</Text>
                                                <Text style={styles.pedidoData}>
                                                    <Ionicons name="calendar-outline" size={12} /> {pedido.data}
                                                </Text>
                                            </View>
                                            <View style={[styles.statusBadge, { borderColor: statusCor }]}>
                                                <Ionicons
                                                    name={statusIcone as any}
                                                    size={14}
                                                    color={statusCor}
                                                />
                                                <Text style={[styles.statusTexto, { color: statusCor }]}>
                                                    {statusTexto}
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

                                        {pedido.observacoes && (
                                            <View style={styles.observacoesContainer}>
                                                <View style={styles.observacoesHeader}>
                                                    <Ionicons name="document-text-outline" size={16} color="#B8860B" />
                                                    <Text style={styles.observacoesLabel}>Observações:</Text>
                                                </View>
                                                <Text style={styles.observacoesTexto}>
                                                    {pedido.observacoes}
                                                </Text>
                                            </View>
                                        )}

                                        {/* Rodapé e Ações */}
                                        <View style={styles.pedidoFooter}>
                                            <View style={styles.pedidoTotalContainer}>
                                                <Text style={styles.totalLabel}>Total do Pedido</Text>
                                                <Text style={styles.pedidoTotal}>
                                                    R$ {calcularTotalPedido(pedido).toFixed(2)}
                                                </Text>
                                            </View>

                                            <View style={styles.pedidoAcoes}>

                                                {/* Botão de Pagar - aparece apenas se pendente ou reservado */}
                                                {mostrarBotaoPagar(pedido) && (
                                                    <TouchableOpacity
                                                        style={[styles.botaoAcao, styles.botaoPagar]}
                                                        onPress={() => handleMarcarPago(pedido.id)}
                                                    >
                                                        <Ionicons name="cash-outline" size={16} color="#FFF" />
                                                        <Text style={styles.botaoAcaoTexto}>Pagar</Text>
                                                    </TouchableOpacity>
                                                )}

                                                {/* Botão de Entregue - aparece apenas se pago */}
                                                {mostrarBotaoEntregue(pedido) && (
                                                    <TouchableOpacity
                                                        style={[styles.botaoAcao, styles.botaoEntregue]}
                                                        onPress={() => handleMarcarEntregue(pedido.id)}
                                                    >
                                                        <Ionicons name="checkmark-done-outline" size={16} color="#FFF" />
                                                        <Text style={styles.botaoAcaoTexto}>Entregue</Text>
                                                    </TouchableOpacity>
                                                )}

                                                {/* Botão Editar */}
                                                <TouchableOpacity
                                                    style={[styles.botaoAcao, styles.botaoEditarPedido]}
                                                    onPress={() => {
                                                        setPedidoEditando({
                                                            ...pedido,
                                                            usuarioId: pedido.usuarioId || ''
                                                        });
                                                        setMostrarModalPedido(true);
                                                    }}
                                                >
                                                    <Ionicons name="create-outline" size={16} color="#B8860B" />
                                                    <Text style={styles.botaoAcaoTexto}>Editar</Text>
                                                </TouchableOpacity>

                                                {/* Botão Excluir */}
                                                <TouchableOpacity
                                                    style={[styles.botaoAcao, styles.botaoExcluirPedido]}
                                                    onPress={() => handleDeletarPedido(pedido)}
                                                >
                                                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                                                    <Text style={styles.botaoAcaoTexto}>Excluir</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })
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
        backgroundColor: '#000',
        paddingTop: 20,
        paddingBottom: 16,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#333",
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#B8860B',
        letterSpacing: 0.5,
    },
    abasContainer: {
        flexDirection: 'row',
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 4,
    },
    aba: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    abaAtiva: {
        backgroundColor: '#B8860B',
    },
    abaTexto: {
        fontSize: 14,
        fontWeight: '600',
        color: '#B8860B',
    },
    abaTextoAtivo: {
        color: '#000',
    },
    acoesContainer: {
        paddingHorizontal: 8,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    botaoAdicionar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#B8860B',
        paddingVertical: 14,
        paddingHorizontal: 8,
        borderRadius: 12,
    },
    botaoAdicionarTexto: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
    },
    conteudo: {
        flex: 1,
        paddingHorizontal: 8,
        paddingTop: 20,
    },
    estoqueContainer: {
        gap: 20, // Aumentei o gap entre os cards
        paddingBottom: 40,
    },
    pedidosContainer: {
        gap: 16,
        paddingBottom: 40,
    },
    listaVazia: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    listaVaziaTexto: {
        color: '#888',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 8,
    },
    botaoAdicionarPrimeiro: {
        backgroundColor: '#B8860B',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 16,
    },
    botaoAdicionarPrimeiroTexto: {
        color: '#000',
        fontSize: 14,
        fontWeight: '600',
    },
    itemCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 16,
        overflow: 'hidden', // Para a imagem respeitar o border radius
    },
    imagemContainer: {
        width: '100%',
        height: 350, // Altura da imagem grande
        backgroundColor: '#2a2a2a',
    },
    itemImagemGrande: {
        width: '100%',
        height: '100%',
    },
    itemImagemPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2a2a2a',
    },
    placeholderTexto: {
        color: '#666',
        fontSize: 12,
        marginTop: 8,
    },
    conteudoCard: {
        padding: 16,
        gap: 16,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    itemNome: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFF',
        flex: 1,
        marginRight: 12,
    },
    itemPrecoContainer: {
        backgroundColor: '#B8860B',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        minWidth: 80,
        alignItems: 'center',
    },
    itemPreco: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    itemInfo: {
        gap: 12,
    },
    quantidadeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    quantidadeTexto: {
        color: '#AAA',
        fontSize: 14,
    },
    tamanhosContainer: {
        gap: 8,
    },
    tamanhosTitulo: {
        color: '#888',
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 4,
    },
    tamanhosLista: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tamanhoItem: {
        backgroundColor: '#2a2a2a',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    tamanhoTexto: {
        color: '#AAA',
        fontSize: 12,
    },
    itemAcoes: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 4,
    },
    botaoEditar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#2a2a2a',
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#B8860B',
    },
    botaoEditarTexto: {
        color: '#B8860B',
        fontSize: 14,
        fontWeight: '500',
    },
    botaoVender: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#22C55E',
        paddingVertical: 12,
        borderRadius: 8,
    },
    botaoVenderTexto: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '500',
    },
    botaoDeletar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#EF4444',
        paddingVertical: 12,
        borderRadius: 8,
    },
    botaoDeletarTexto: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '500',
    },
    // ... mantém os estilos dos pedidos abaixo (não alterados)
    pedidoCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: 16,
        padding: 16,
        gap: 16,
    },
    pedidoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    pedidoPessoa: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFF',
    },
    pedidoData: {
        color: '#888',
        fontSize: 12,
        marginTop: 4,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#2a2a2a',
        borderWidth: 1,
    },
    statusTexto: {
        fontSize: 12,
        fontWeight: '500',
    },
    pedidoItens: {
        gap: 8,
    },
    pedidoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    pedidoItemBadge: {
        backgroundColor: '#B8860B',
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pedidoItemQuantidade: {
        color: '#000',
        fontSize: 12,
        fontWeight: 'bold',
    },
    pedidoItemNome: {
        flex: 1,
        color: '#FFF',
        fontSize: 14,
    },
    pedidoItemPreco: {
        color: '#B8860B',
        fontSize: 14,
        fontWeight: '500',
    },
    pedidoFooter: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#2a2a2a',
        gap: 12,
    },
    pedidoTotalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        color: '#888',
        fontSize: 12,
    },
    pedidoTotal: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    pedidoAcoes: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    botaoAcao: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        minWidth: 80,
    },
    botaoAcaoTexto: {
        fontSize: 12,
        fontWeight: '500',
        color: '#FFF',
    },
    botaoReservar: {
        backgroundColor: '#F59E0B',
    },
    botaoPagar: {
        backgroundColor: '#22C55E',
    },
    botaoEntregue: {
        backgroundColor: '#3B82F6',
    },
    botaoEditarPedido: {
        backgroundColor: '#2a2a2a',
        borderWidth: 1,
        borderColor: '#B8860B',
    },
    botaoExcluirPedido: {
        backgroundColor: '#2a2a2a',
        borderWidth: 1,
        borderColor: '#EF4444',
    },
    observacoesContainer: {
        backgroundColor: '#2a2a2a',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333',
        marginTop: 8,
    },
    observacoesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    observacoesLabel: {
        fontSize: 14,
        color: '#B8860B',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    observacoesTexto: {
        fontSize: 14,
        color: '#CCC',
        lineHeight: 20,
    },
});