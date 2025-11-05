import { Ionicons } from "@expo/vector-icons";
import { collection, doc, getDoc, getDocs, updateDoc } from "firebase/firestore"; // Adicionado getDoc
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { db } from "@/config/firebaseConfig";
// Importe a interface Filho do seu arquivo de tipos, assim como no primeiro código
import { Filho, Usuario } from "../types/usuarios";

// 🎯 TIPOS E INTERFACES
interface UsuarioCompleto extends Usuario {
    id: string;
}

// Nova interface para o componente unificado de gerenciamento
interface GerenciarPagamentoProps {
    usuario: UsuarioCompleto;
    filho?: Filho; // Opcional, para indicar se é o usuário principal ou um filho
    onPagamentoAtualizado: () => void;
}

interface FiltrosState {
    busca: string;
    statusPagamento: "todos" | "pagos" | "pendentes";
    modalidade: "todas" | Usuario["modalidade"];
}

// 🎯 COMPONENTE DE GERENCIAMENTO DE PAGAMENTO (UNIFICADO)
const GerenciarPagamento: React.FC<GerenciarPagamentoProps> = ({
    usuario,
    filho, // Recebe o filho
    onPagamentoAtualizado,
}) => {
    const [modalPagamento, setModalPagamento] = useState(false);
    const [processando, setProcessando] = useState(false);

    // Determinar o nome e o status de pagamento a ser gerenciado
    const nomeParaExibir = filho ? filho.nome : usuario.nome;
    const pagamentoAtual = filho ? filho.pagamento : usuario.pagamento;
    const dataPagamentoAtual = filho ? filho.dataUltimoPagamento : usuario.dataUltimoPagamento;

    const formatarData = (data: string) => {
        if (!data) return "Nunca";
        return new Date(data).toLocaleDateString("pt-BR");
    };

    const calcularDiasDesdePagamento = () => {
        if (!dataPagamentoAtual) return "Nunca pagou";

        const ultimoPagamento = new Date(dataPagamentoAtual);
        const hoje = new Date();
        const diffTempo = hoje.getTime() - ultimoPagamento.getTime();
        const diffDias = Math.floor(diffTempo / (1000 * 60 * 60 * 24));

        if (diffDias === 0) return "Hoje";
        if (diffDias === 1) return "1 dia atrás";
        return `${diffDias} dias atrás`;
    };

    // 🔄 FUNÇÃO PARA ATUALIZAR O STATUS (PAGO/PENDENTE)
    const handleTogglePagamento = async (status: boolean) => {
        setProcessando(true);
        try {
            const userRef = doc(db, "usuarios", usuario.id);

            if (filho) {
                // LÓGICA PARA ATUALIZAR PAGAMENTO DO FILHO
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const usuarioData = userSnap.data() as Usuario;
                    const novosFilhos = usuarioData.filhos?.map(f =>
                        f.id === filho.id
                            ? {
                                ...f,
                                pagamento: status,
                                dataUltimoPagamento: status ? new Date().toISOString() : undefined,
                            }
                            : f
                    );
                    await updateDoc(userRef, { filhos: novosFilhos });
                    Alert.alert(
                        "✅ Sucesso",
                        `Pagamento de ${filho.nome} ${status ? "confirmado" : "marcado como pendente"}!`
                    );
                }
            } else {
                // LÓGICA PARA ATUALIZAR PAGAMENTO DO USUÁRIO PRINCIPAL
                await updateDoc(userRef, {
                    pagamento: status,
                    dataUltimoPagamento: status ? new Date().toISOString() : undefined,
                });
                Alert.alert(
                    "✅ Sucesso",
                    `Pagamento de ${usuario.nome} ${status ? "confirmado" : "marcado como pendente"}!`
                );
            }

            onPagamentoAtualizado();
            setModalPagamento(false);
        } catch (error) {
            console.error("Erro ao atualizar pagamento:", error);
            Alert.alert("❌ Erro", "Não foi possível atualizar o status do pagamento.");
        } finally {
            setProcessando(false);
        }
    };

    return (
        <>
            <TouchableOpacity
                style={[
                    styles.pagamentoButton,
                    pagamentoAtual ? styles.pagamentoPago : styles.pagamentoPendente
                ]}
                onPress={() => setModalPagamento(true)}
                disabled={processando}
            >
                <Ionicons
                    name={pagamentoAtual ? "checkmark-circle" : "time-outline"}
                    size={16}
                    color={pagamentoAtual ? "#22c55e" : "#ef4444"}
                />
                <Text style={[
                    styles.pagamentoButtonText,
                    pagamentoAtual ? styles.pagamentoButtonTextPago : styles.pagamentoButtonTextPendente
                ]}>
                    {pagamentoAtual ? "Pago" : "Pendente"}
                </Text>
            </TouchableOpacity>

            <Modal
                visible={modalPagamento}
                animationType="slide"
                transparent={true}
                onRequestClose={() => !processando && setModalPagamento(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Gerenciar Pagamento</Text>
                            <TouchableOpacity
                                onPress={() => !processando && setModalPagamento(false)}
                                disabled={processando}
                            >
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.pagamentoInfo}>
                            <View style={styles.alunoInfo}>
                                <Ionicons name="person" size={20} color="#B8860B" />
                                <Text style={styles.pagamentoNome}>{nomeParaExibir} {filho && <Text style={styles.filhoTag}>(Aluno Dependente)</Text>}</Text>
                            </View>

                            <View style={[
                                styles.statusBadge,
                                pagamentoAtual ? styles.statusBadgePago : styles.statusBadgePendente
                            ]}>
                                <Text style={styles.statusBadgeText}>
                                    {pagamentoAtual ? "PAGO" : "PENDENTE"}
                                </Text>
                            </View>

                            <View style={styles.dataInfo}>
                                <Ionicons name="calendar" size={16} color="#666" />
                                <Text style={styles.pagamentoData}>
                                    Último pagamento: {formatarData(dataPagamentoAtual || "")}
                                </Text>
                            </View>

                            <View style={styles.dataInfo}>
                                <Ionicons name="time" size={16} color="#666" />
                                <Text style={styles.pagamentoData}>
                                    {calcularDiasDesdePagamento()}
                                </Text>
                            </View>

                            {/* Mostrar dia de pagamento apenas para o usuário principal, se a info for pertinente */}
                            {!filho && (
                                <View style={styles.dataInfo}>
                                    <Ionicons name="card" size={16} color="#666" />
                                    <Text style={styles.pagamentoData}>
                                        Dia de pagamento: {new Date(usuario.dataPagamento).getDate()} de cada mês
                                    </Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setModalPagamento(false)}
                                disabled={processando}
                            >
                                <Text style={styles.cancelButtonText}>Fechar</Text>
                            </TouchableOpacity>

                            {!pagamentoAtual ? (
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.confirmButton]}
                                    onPress={() => handleTogglePagamento(true)}
                                    disabled={processando}
                                >
                                    {processando ? (
                                        <ActivityIndicator size="small" color="#000" />
                                    ) : (
                                        <>
                                            <Ionicons name="checkmark" size={18} color="#000" />
                                            <Text style={styles.confirmButtonText}>Confirmar Pagamento</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.warningButton]}
                                    onPress={() => handleTogglePagamento(false)}
                                    disabled={processando}
                                >
                                    {processando ? (
                                        <ActivityIndicator size="small" color="#FFF" />
                                    ) : (
                                        <>
                                            <Ionicons name="refresh" size={18} color="#FFF" />
                                            <Text style={styles.warningButtonText}>Marcar como Pendente</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};

// 🎯 COMPONENTE DE CARD DE USUÁRIO
const UsuarioCard: React.FC<{
    usuario: UsuarioCompleto;
    onPagamentoAtualizado: () => void;
}> = ({ usuario, onPagamentoAtualizado }) => {
    const formatarData = (data: string) => {
        if (!data) return "Nunca";
        return new Date(data).toLocaleDateString("pt-BR");
    };

    const calcularDiasDesdePagamento = () => {
        if (!usuario.dataUltimoPagamento) return "Nunca pagou";

        const ultimoPagamento = new Date(usuario.dataUltimoPagamento);
        const hoje = new Date();
        const diffTempo = hoje.getTime() - ultimoPagamento.getTime();
        const diffDias = Math.floor(diffTempo / (1000 * 60 * 60 * 24));

        if (diffDias === 0) return "Hoje";
        if (diffDias === 1) return "1 dia atrás";
        return `${diffDias} dias atrás`;
    };

    const getStatusColor = () => {
        if (!usuario.dataUltimoPagamento) return "#ef4444";

        const ultimoPagamento = new Date(usuario.dataUltimoPagamento);
        const hoje = new Date();
        const diffTempo = hoje.getTime() - ultimoPagamento.getTime();
        const diffDias = Math.floor(diffTempo / (1000 * 60 * 60 * 24));

        if (diffDias <= 30) return "#22c55e";
        if (diffDias <= 60) return "#eab308";
        return "#ef4444";
    };

    const getFilhoStatusColor = (pagamento: boolean) => {
        return pagamento ? "#22c55e" : "#ef4444";
    }

    return (
        <View style={styles.usuarioCard}>
            <View style={styles.usuarioHeader}>
                <View style={styles.usuarioInfo}>
                    <Text style={styles.usuarioNome}>{usuario.nome}</Text>
                    <View style={styles.usuarioMeta}>
                        <View style={[
                            styles.modalidadeBadge,
                            { backgroundColor: usuario.modalidade === "Muay Thai" ? "#dc2626" : "#1e40af" }
                        ]}>
                            <Text style={styles.modalidadeBadgeText}>{usuario.modalidade}</Text>
                        </View>
                        <Text style={styles.usuarioEmail}>{usuario.email}</Text>
                    </View>
                </View>
                {/* Botão de pagamento do usuário principal */}
                <GerenciarPagamento
                    usuario={usuario}
                    onPagamentoAtualizado={onPagamentoAtualizado}
                />
            </View>

            <View style={styles.pagamentoInfo}>
                <View style={styles.dataRow}>
                    <View style={styles.dataItem}>
                        <Ionicons name="calendar" size={14} color="#B8860B" />
                        <Text style={styles.dataLabel}>Dia de pagamento:</Text>
                        <Text style={styles.dataValue}>
                            {new Date(usuario.dataPagamento).getDate()} de cada mês
                        </Text>
                    </View>
                </View>

                <View style={styles.dataRow}>
                    <View style={styles.dataItem}>
                        <Ionicons name="time" size={14} color="#B8860B" />
                        <Text style={styles.dataLabel}>Último pagamento:</Text>
                        <Text style={styles.dataValue}>
                            {formatarData(usuario.dataUltimoPagamento)}
                        </Text>
                    </View>

                    <View style={styles.dataItem}>
                        <Ionicons name="alert-circle" size={14} color={getStatusColor()} />
                        <Text style={styles.dataLabel}>Status:</Text>
                        <Text style={[styles.dataValue, { color: getStatusColor() }]}>
                            {calcularDiasDesdePagamento()}
                        </Text>
                    </View>
                </View>
            </View>

            {/* SEÇÃO DE FILHOS COM BOTÃO DE PAGAMENTO INDIVIDUAL */}
            {usuario.filhos && usuario.filhos.length > 0 && (
                <View style={styles.filhosSection}>
                    <Text style={styles.filhosTitle}>
                        <Ionicons name="people" size={14} color="#B8860B" />
                        Alunos Dependentes ({usuario.filhos.length})
                    </Text>
                    {usuario.filhos.map((filho) => (
                        <View key={filho.id} style={styles.filhoItem}>
                            <View style={styles.filhoItemContent}>
                                <Text style={styles.filhoNome}>{filho.nome}</Text>
                                <View style={styles.filhoMeta}>
                                    <Text style={styles.filhoModalidade}>{filho.modalidade}</Text>
                                    <Text style={styles.filhoPagamentoData}>
                                        Último: {formatarData(filho.dataUltimoPagamento || "")}
                                    </Text>
                                </View>
                            </View>
                            {/* Adicionado o componente de Gerenciar Pagamento para o Filho */}
                            <GerenciarPagamento
                                usuario={usuario}
                                filho={filho}
                                onPagamentoAtualizado={onPagamentoAtualizado}
                            />
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};

// 🎯 COMPONENTE DE FILTROS (MANTIDO IGUAL)
const Filtros: React.FC<{
    filtros: FiltrosState;
    onFiltrosChange: (filtros: FiltrosState) => void;
}> = ({ filtros, onFiltrosChange }) => {
    const [mostrarFiltros, setMostrarFiltros] = useState(false);

    return (
        <View style={styles.filtrosContainer}>
            <View style={styles.filtrosHeader}>
                <TextInput
                    style={styles.buscaInput}
                    placeholder="Buscar por nome ou email..."
                    placeholderTextColor="#666"
                    value={filtros.busca}
                    onChangeText={(text) => onFiltrosChange({ ...filtros, busca: text })}
                />
                <TouchableOpacity
                    style={styles.filtroButton}
                    onPress={() => setMostrarFiltros(!mostrarFiltros)}
                >
                    <Ionicons name="filter" size={20} color="#B8860B" />
                    <Text style={styles.filtroButtonText}>Filtros</Text>
                </TouchableOpacity>
            </View>

            {mostrarFiltros && (
                <View style={styles.filtrosAvançados}>
                    {/* Filtro por Status de Pagamento */}
                    <View style={styles.filtroGrupo}>
                        <Text style={styles.filtroLabel}>Status de Pagamento</Text>
                        <View style={styles.filtroBotoes}>
                            {[
                                { value: "todos" as const, label: "Todos", icon: "list" },
                                { value: "pagos" as const, label: "Pagos", icon: "checkmark" },
                                { value: "pendentes" as const, label: "Pendentes", icon: "time" }
                            ].map((opcao) => (
                                <TouchableOpacity
                                    key={opcao.value}
                                    style={[
                                        styles.filtroOpcao,
                                        filtros.statusPagamento === opcao.value && styles.filtroOpcaoSelecionada
                                    ]}
                                    onPress={() => onFiltrosChange({ ...filtros, statusPagamento: opcao.value })}
                                >
                                    <Ionicons
                                        name={opcao.icon as any}
                                        size={16}
                                        color={filtros.statusPagamento === opcao.value ? "#000" : "#B8860B"}
                                    />
                                    <Text style={[
                                        styles.filtroOpcaoTexto,
                                        filtros.statusPagamento === opcao.value && styles.filtroOpcaoTextoSelecionado
                                    ]}>
                                        {opcao.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Filtro por Modalidade */}
                    <View style={styles.filtroGrupo}>
                        <Text style={styles.filtroLabel}>Modalidade</Text>
                        <View style={styles.filtroBotoes}>
                            {[
                                { value: "todas" as const, label: "Todas" },
                                { value: "Jiu-Jitsu" as const, label: "Jiu-Jitsu" },
                                { value: "Muay Thai" as const, label: "Muay Thai" },
                                { value: "Boxe" as const, label: "Boxe" },
                                { value: "MMA" as const, label: "MMA" }
                            ].map((opcao) => (
                                <TouchableOpacity
                                    key={opcao.value}
                                    style={[
                                        styles.filtroOpcao,
                                        filtros.modalidade === opcao.value && styles.filtroOpcaoSelecionada
                                    ]}
                                    onPress={() => onFiltrosChange({ ...filtros, modalidade: opcao.value })}
                                >
                                    <Text style={[
                                        styles.filtroOpcaoTexto,
                                        filtros.modalidade === opcao.value && styles.filtroOpcaoTextoSelecionado
                                    ]}>
                                        {opcao.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
};

// 🎯 COMPONENTE PRINCIPAL ADMIN SCREEN (MANTIDO IGUAL, EXCETO USAR O NOVO COMPONENTE)
export default function AdminScreen() {
    const [usuarios, setUsuarios] = useState<UsuarioCompleto[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filtros, setFiltros] = useState<FiltrosState>({
        busca: "",
        statusPagamento: "todos",
        modalidade: "todas"
    });

    // 🔄 CARREGAR USUÁRIOS
    const carregarUsuarios = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "usuarios"));
            const usuariosData: UsuarioCompleto[] = [];

            querySnapshot.forEach((doc) => {
                usuariosData.push({
                    id: doc.id,
                    ...doc.data()
                } as UsuarioCompleto);
            });

            // Ordenar por nome
            usuariosData.sort((a, b) => a.nome.localeCompare(b.nome));
            setUsuarios(usuariosData);
        } catch (error) {
            console.error("Erro ao carregar usuários:", error);
            Alert.alert("❌ Erro", "Não foi possível carregar a lista de usuários.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // 🔄 PULL TO REFRESH
    const onRefresh = () => {
        setRefreshing(true);
        carregarUsuarios();
    };

    useEffect(() => {
        carregarUsuarios();
    }, []);

    // 🎯 APLICAR FILTROS
    const usuariosFiltrados = usuarios.filter(usuario => {
        // Filtro por busca
        if (filtros.busca &&
            !usuario.nome.toLowerCase().includes(filtros.busca.toLowerCase()) &&
            !usuario.email.toLowerCase().includes(filtros.busca.toLowerCase())
        ) {
            return false;
        }

        // Filtro por status de pagamento
        if (filtros.statusPagamento !== "todos") {
            if (filtros.statusPagamento === "pagos" && !usuario.pagamento) return false;
            if (filtros.statusPagamento === "pendentes" && usuario.pagamento) return false;
        }

        // Filtro por modalidade
        if (filtros.modalidade !== "todas" && usuario.modalidade !== filtros.modalidade) {
            return false;
        }

        return true;
    });

    // 🎯 ESTATÍSTICAS
    const estatisticas = {
        total: usuarios.length,
        pagos: usuarios.filter(u => u.pagamento).length,
        pendentes: usuarios.filter(u => !u.pagamento).length,
        comFilhos: usuarios.filter(u => u.filhos && u.filhos.length > 0).length,
        totalAlunos: usuarios.reduce((total, usuario) =>
            total + (usuario.filhos ? usuario.filhos.length : 0), 0
        ) + usuarios.length // Adiciona os usuários principais
    };

    // 🎯 RENDER STATES
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#B8860B" />
                <Text style={styles.loadingText}>Carregando usuários...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Ionicons name="shield-checkmark" size={32} color="#B8860B" />
                    <Text style={styles.headerTitle}>Painel Administrativo</Text>
                    <Text style={styles.headerSubtitle}>Gestão de Alunos e Pagamentos</Text>
                </View>
            </View>

            {/* ESTATÍSTICAS */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.estatisticasContainer}
                contentContainerStyle={styles.estatisticasContent}
            >
                <View style={[styles.estatisticaCard, styles.estatisticaTotalUsuarios]}>
                    <Ionicons name="people" size={20} color="#B8860B" />
                    <Text style={styles.estatisticaNumero}>{estatisticas.total}</Text>
                    <Text style={styles.estatisticaLabel}>Total Usuários</Text>
                </View>

                <View style={[styles.estatisticaCard, styles.estatisticaPagos]}>
                    <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                    <Text style={styles.estatisticaNumero}>{estatisticas.pagos}</Text>
                    <Text style={styles.estatisticaLabel}>Pagamentos em Dia</Text>
                </View>

                <View style={[styles.estatisticaCard, styles.estatisticaPendentes]}>
                    <Ionicons name="time" size={20} color="#ef4444" />
                    <Text style={styles.estatisticaNumero}>{estatisticas.pendentes}</Text>
                    <Text style={styles.estatisticaLabel}>Pagamentos Pendentes</Text>
                </View>

                <View style={[styles.estatisticaCard, styles.estatisticaFilhos]}>
                    <Ionicons name="people-circle" size={20} color="#8b5cf6" />
                    <Text style={styles.estatisticaNumero}>{estatisticas.totalAlunos}</Text>
                    <Text style={styles.estatisticaLabel}>Total Alunos</Text>
                </View>
            </ScrollView>

            {/* FILTROS */}
            <Filtros filtros={filtros} onFiltrosChange={setFiltros} />

            {/* LISTA DE USUÁRIOS */}
            <ScrollView
                style={styles.listaContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#B8860B"]}
                        tintColor="#B8860B"
                    />
                }
            >
                <View style={styles.resultadosInfo}>
                    <Text style={styles.resultadosTexto}>
                        {usuariosFiltrados.length} de {usuarios.length} usuários
                    </Text>
                    {filtros.busca && (
                        <Text style={styles.buscaTexto}>
                            Buscando por: "{filtros.busca}"
                        </Text>
                    )}
                </View>

                {usuariosFiltrados.length > 0 ? (
                    usuariosFiltrados.map((usuario) => (
                        <UsuarioCard
                            key={usuario.id}
                            usuario={usuario}
                            onPagamentoAtualizado={carregarUsuarios}
                        />
                    ))
                ) : (
                    <View style={styles.nenhumResultado}>
                        <Ionicons name="alert-circle" size={24} color="#B8860B" />
                        <Text style={styles.nenhumResultadoText}>Nenhum usuário encontrado com os filtros aplicados.</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

// 🎯 ESTILOS (Adicionados estilos para os filhos)
const styles = StyleSheet.create({
    // ... estilos existentes
    container: { flex: 1, backgroundColor: "#000", padding: 16 },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
    loadingText: { color: "#FFF", marginTop: 10 },
    header: { paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#333", marginBottom: 16 },
    headerContent: { alignItems: "center" },
    headerTitle: { fontSize: 24, fontWeight: "bold", color: "#FFF", marginTop: 8 },
    headerSubtitle: { fontSize: 14, color: "#AAA" },

    estatisticasContainer: {
        borderBottomWidth: 1,
        maxHeight: 120,
        marginBottom: 10
    },
    estatisticasContent: { paddingRight: 16 },
    estatisticaCard: {
        backgroundColor: "#2a2a2a",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        minWidth: 140,
        borderWidth: 1,
        borderColor: "#333",
        height: 118,
        marginRight: 12,
    },
    estatisticaTotalUsuarios: { borderColor: "#B8860B", borderWidth: 1 },
    estatisticaPagos: { borderColor: "#22c55e", borderWidth: 1 },
    estatisticaPendentes: { borderColor: "#ef4444", borderWidth: 1 },
    estatisticaFilhos: { borderColor: "#8b5cf6", borderWidth: 1 },
    estatisticaNumero: { fontSize: 18, fontWeight: "bold", color: "#FFF", marginTop: 4 },
    estatisticaLabel: { fontSize: 10, color: "#AAA", textAlign: "center", marginTop: 2 },

    filtrosContainer: { paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#333", marginBottom: 16 },
    filtrosHeader: { flexDirection: "row", gap: 10, marginBottom: 10 },
    buscaInput: {
        flex: 1,
        backgroundColor: "#1a1a1a",
        color: "#FFF",
        padding: 10,
        borderRadius: 8,
        fontSize: 14,
    },
    filtroButton: { flexDirection: "row", alignItems: "center", gap: 4, padding: 10, backgroundColor: "#1a1a1a", borderRadius: 8 },
    filtroButtonText: { color: "#B8860B", fontWeight: "bold" },
    filtrosAvançados: { backgroundColor: "#1a1a1a", padding: 12, borderRadius: 8 },
    filtroGrupo: { marginBottom: 10 },
    filtroLabel: { color: "#FFF", fontWeight: "bold", marginBottom: 6, fontSize: 12 },
    filtroBotoes: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    filtroOpcao: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 6,
        backgroundColor: "#333",
    },
    filtroOpcaoSelecionada: { backgroundColor: "#B8860B" },
    filtroOpcaoTexto: { color: "#B8860B", fontSize: 12, marginLeft: 4 },
    filtroOpcaoTextoSelecionado: { color: "#000", fontWeight: "bold" },

    listaContainer: { flex: 1 },
    resultadosInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    resultadosTexto: { color: '#AAA', fontSize: 12 },
    buscaTexto: { color: '#B8860B', fontSize: 12, fontWeight: 'bold' },
    nenhumResultado: { alignItems: 'center', marginTop: 50, padding: 20, backgroundColor: '#1a1a1a', borderRadius: 12 },
    nenhumResultadoText: { color: '#FFF', marginTop: 8, textAlign: 'center' },

    usuarioCard: {
        backgroundColor: "#1a1a1a",
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: "#B8860B",
    },
    usuarioHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
    usuarioInfo: { flex: 1, paddingRight: 10 },
    usuarioNome: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
    usuarioMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap' },
    modalidadeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 8 },
    modalidadeBadgeText: { color: "#FFF", fontSize: 10, fontWeight: "bold" },
    usuarioEmail: { color: "#AAA", fontSize: 12, marginTop: 2 },

    pagamentoButton: { flexDirection: "row", alignItems: "center", gap: 6, padding: 6, borderRadius: 8, minWidth: 100, justifyContent: 'center' },
    pagamentoPago: { backgroundColor: "#1a1a1a", borderWidth: 1, borderColor: "#22c55e" },
    pagamentoPendente: { backgroundColor: "#1a1a1a", borderWidth: 1, borderColor: "#ef4444" },
    pagamentoButtonText: { fontSize: 12, fontWeight: "600" },
    pagamentoButtonTextPago: { color: "#22c55e" },
    pagamentoButtonTextPendente: { color: "#ef4444" },

    pagamentoInfo: { paddingVertical: 8, borderTopWidth: 1, borderTopColor: "#333", borderBottomWidth: 1, borderBottomColor: "#333", marginBottom: 12 },
    dataRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    dataItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    dataLabel: { color: '#AAA', fontSize: 12 },
    dataValue: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },

    // Estilos Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '90%', backgroundColor: '#000', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#B8860B' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 10, marginBottom: 15 },
    modalTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    pagamentoNome: { color: '#FFF', fontSize: 16, fontWeight: '600', marginLeft: 8, flexShrink: 1 },
    alunoInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 15 },
    statusBadgePago: { backgroundColor: '#22c55e' },
    statusBadgePendente: { backgroundColor: '#ef4444' },
    statusBadgeText: { color: '#000', fontWeight: 'bold', fontSize: 12 },
    dataInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
    pagamentoData: { color: '#CCC', fontSize: 14 },
    modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, borderTopWidth: 1, borderTopColor: '#333', paddingTop: 15 },
    modalButton: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, gap: 6, flex: 1, marginHorizontal: 5, justifyContent: 'center' },
    cancelButton: { backgroundColor: '#333' },
    cancelButtonText: { color: '#FFF', fontWeight: 'bold' },
    confirmButton: { backgroundColor: '#B8860B' },
    confirmButtonText: { color: '#000', fontWeight: 'bold' },
    warningButton: { backgroundColor: '#ef4444' },
    warningButtonText: { color: '#FFF', fontWeight: 'bold' },
    filhoTag: { color: '#8b5cf6', fontSize: 12, fontWeight: 'normal' },

    // Estilos de Filhos
    filhosSection: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    filhosTitle: {
        color: '#B8860B',
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    filhoItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#0a0a0a',
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
        borderLeftWidth: 2,
        borderLeftColor: '#8b5cf6',
    },
    filhoItemContent: { flex: 1 },
    filhoNome: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 13,
    },
    filhoMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 2,
    },
    filhoModalidade: {
        color: '#AAA',
        fontSize: 11,
    },
    filhoPagamentoData: {
        color: '#AAA',
        fontSize: 11,
        fontStyle: 'italic',
    },
});