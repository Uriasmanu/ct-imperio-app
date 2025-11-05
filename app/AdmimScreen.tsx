import { Ionicons } from "@expo/vector-icons";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
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
import { Usuario } from "../types/usuarios";

// 🎯 TIPOS E INTERFACES
interface UsuarioCompleto extends Usuario {
    id: string;
}

interface GerenciarPagamentoAdminProps {
    usuario: UsuarioCompleto;
    onPagamentoAtualizado: () => void;
}

interface FiltrosState {
    busca: string;
    statusPagamento: "todos" | "pagos" | "pendentes";
    modalidade: "todas" | Usuario["modalidade"];
}

// 🎯 COMPONENTE DE GERENCIAMENTO DE PAGAMENTO (ADMIN)
const GerenciarPagamentoAdmin: React.FC<GerenciarPagamentoAdminProps> = ({
    usuario,
    onPagamentoAtualizado,
}) => {
    const [modalPagamento, setModalPagamento] = useState(false);
    const [processando, setProcessando] = useState(false);

    const handleConfirmarPagamento = async () => {
        setProcessando(true);
        try {
            const userRef = doc(db, "usuarios", usuario.id);

            await updateDoc(userRef, {
                pagamento: true,
                dataUltimoPagamento: new Date().toISOString()
            });

            onPagamentoAtualizado();
            setModalPagamento(false);
            Alert.alert("✅ Sucesso", `Pagamento de ${usuario.nome} confirmado!`);
        } catch (error) {
            console.error("Erro ao confirmar pagamento:", error);
            Alert.alert("❌ Erro", "Não foi possível confirmar o pagamento.");
        } finally {
            setProcessando(false);
        }
    };

    const handleMarcarComoPendente = async () => {
        setProcessando(true);
        try {
            const userRef = doc(db, "usuarios", usuario.id);

            await updateDoc(userRef, {
                pagamento: false
            });

            onPagamentoAtualizado();
            setModalPagamento(false);
            Alert.alert("🔄 Status Alterado", `Pagamento de ${usuario.nome} marcado como pendente.`);
        } catch (error) {
            console.error("Erro ao atualizar pagamento:", error);
            Alert.alert("❌ Erro", "Não foi possível atualizar o status do pagamento.");
        } finally {
            setProcessando(false);
        }
    };

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

    return (
        <>
            <TouchableOpacity
                style={[
                    styles.pagamentoButton,
                    usuario.pagamento ? styles.pagamentoPago : styles.pagamentoPendente
                ]}
                onPress={() => setModalPagamento(true)}
            >
                <Ionicons
                    name={usuario.pagamento ? "checkmark-circle" : "time-outline"}
                    size={16}
                    color={usuario.pagamento ? "#22c55e" : "#ef4444"}
                />
                <Text style={[
                    styles.pagamentoButtonText,
                    usuario.pagamento ? styles.pagamentoButtonTextPago : styles.pagamentoButtonTextPendente
                ]}>
                    {usuario.pagamento ? "Pago" : "Pendente"}
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
                                <Text style={styles.pagamentoNome}>{usuario.nome}</Text>
                            </View>

                            <View style={[
                                styles.statusBadge,
                                usuario.pagamento ? styles.statusBadgePago : styles.statusBadgePendente
                            ]}>
                                <Text style={styles.statusBadgeText}>
                                    {usuario.pagamento ? "PAGO" : "PENDENTE"}
                                </Text>
                            </View>

                            <View style={styles.dataInfo}>
                                <Ionicons name="calendar" size={16} color="#666" />
                                <Text style={styles.pagamentoData}>
                                    Último pagamento: {formatarData(usuario.dataUltimoPagamento)}
                                </Text>
                            </View>

                            <View style={styles.dataInfo}>
                                <Ionicons name="time" size={16} color="#666" />
                                <Text style={styles.pagamentoData}>
                                    {calcularDiasDesdePagamento()}
                                </Text>
                            </View>

                            <View style={styles.dataInfo}>
                                <Ionicons name="card" size={16} color="#666" />
                                <Text style={styles.pagamentoData}>
                                    Dia de pagamento: {new Date(usuario.dataPagamento).getDate()} de cada mês
                                </Text>
                            </View>
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setModalPagamento(false)}
                                disabled={processando}
                            >
                                <Text style={styles.cancelButtonText}>Fechar</Text>
                            </TouchableOpacity>

                            {!usuario.pagamento ? (
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.confirmButton]}
                                    onPress={handleConfirmarPagamento}
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
                                    onPress={handleMarcarComoPendente}
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
                <GerenciarPagamentoAdmin
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

            {/* SEÇÃO DE FILHOS */}
            {usuario.filhos && usuario.filhos.length > 0 && (
                <View style={styles.filhosSection}>
                    <Text style={styles.filhosTitle}>
                        <Ionicons name="people" size={14} color="#B8860B" />
                        Alunos Dependentes ({usuario.filhos.length})
                    </Text>
                    {usuario.filhos.slice(0, 3).map((filho, index) => (
                        <View key={filho.id} style={styles.filhoItem}>
                            <Text style={styles.filhoNome}>{filho.nome}</Text>
                            <View style={styles.filhoInfo}>
                                <Text style={styles.filhoModalidade}>{filho.modalidade}</Text>
                                <View style={[
                                    styles.statusPonto,
                                    filho.pagamento ? styles.statusPago : styles.statusPendente
                                ]} />
                            </View>
                        </View>
                    ))}
                    {usuario.filhos.length > 3 && (
                        <Text style={styles.maisFilhos}>
                            + {usuario.filhos.length - 3} outros alunos
                        </Text>
                    )}
                </View>
            )}
        </View>
    );
};

// 🎯 COMPONENTE DE FILTROS
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

// 🎯 COMPONENTE PRINCIPAL ADMIN SCREEN
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
        if (filtros.busca && !usuario.nome.toLowerCase().includes(filtros.busca.toLowerCase()) &&
            !usuario.email.toLowerCase().includes(filtros.busca.toLowerCase())) {
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
        )
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
                    <View style={styles.emptyState}>
                        <Ionicons name="search" size={48} color="#666" />
                        <Text style={styles.emptyStateText}>Nenhum usuário encontrado</Text>
                        <Text style={styles.emptyStateSubtext}>
                            Tente ajustar os filtros ou termos de busca
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

// 🎯 ESTILOS
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
    },
    loadingText: {
        color: "#B8860B",
        fontSize: 16,
        fontWeight: "500",
    },

    // HEADER
    header: {
        backgroundColor: "#000",
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#333",
    },
    headerContent: {
        alignItems: "center",
        gap: 8,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFF",
        textAlign: "center",
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#B8860B",
        textAlign: "center",
    },

    // ESTATÍSTICAS
    estatisticasContainer: {
        backgroundColor: "#1a1a1a",
        borderBottomWidth: 1,
        borderBottomColor: "#333",
        height: 0
    },
    estatisticasContent: {
        padding: 16,
        gap: 12,
    },
    estatisticaCard: {
        backgroundColor: "#2a2a2a",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        minWidth: 140,
        borderWidth: 1,
        borderColor: "#333",
        height: 100
    },
    estatisticaTotalUsuarios: {
        borderColor: "#B8860B",
    },
    estatisticaPagos: {
        borderColor: "#22c55e",
    },
    estatisticaPendentes: {
        borderColor: "#ef4444",
    },
    estatisticaFilhos: {
        borderColor: "#8b5cf6",
    },
    estatisticaNumero: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFF",
        marginTop: 4,
    },
    estatisticaLabel: {
        fontSize: 12,
        color: "#CCC",
        textAlign: "center",
        marginTop: 4,
    },

    // FILTROS
    filtrosContainer: {
        backgroundColor: "#1a1a1a",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#333",
    },
    filtrosHeader: {
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
    },
    buscaInput: {
        flex: 1,
        backgroundColor: "#2a2a2a",
        borderRadius: 8,
        padding: 12,
        color: "#FFF",
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#333",
    },
    filtroButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        padding: 12,
        backgroundColor: "#2a2a2a",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#333",
    },
    filtroButtonText: {
        color: "#B8860B",
        fontWeight: "600",
        fontSize: 14,
    },
    filtrosAvançados: {
        marginTop: 16,
        gap: 16,
    },
    filtroGrupo: {
        gap: 8,
    },
    filtroLabel: {
        fontSize: 14,
        color: "#B8860B",
        fontWeight: "600",
    },
    filtroBotoes: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    filtroOpcao: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: "#2a2a2a",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#333",
    },
    filtroOpcaoSelecionada: {
        backgroundColor: "#B8860B",
        borderColor: "#DAA520",
    },
    filtroOpcaoTexto: {
        color: "#CCC",
        fontSize: 12,
        fontWeight: "500",
    },
    filtroOpcaoTextoSelecionado: {
        color: "#000",
        fontWeight: "600",
    },

    // LISTA
    listaContainer: {
        flex: 1,
    },
    resultadosInfo: {
        padding: 16,
        backgroundColor: "#1a1a1a",
        borderBottomWidth: 1,
        borderBottomColor: "#333",
    },
    resultadosTexto: {
        color: "#B8860B",
        fontWeight: "600",
        fontSize: 14,
    },
    buscaTexto: {
        color: "#666",
        fontSize: 12,
        marginTop: 4,
    },

    // CARD DE USUÁRIO
    usuarioCard: {
        backgroundColor: "#1a1a1a",
        margin: 16,
        marginBottom: 0,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#333",
    },
    usuarioHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center", // antes estava flex-start, agora centraliza verticalmente
        marginBottom: 12,
    },
    usuarioInfo: {
        flex: 1,
    },
    usuarioNome: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
        marginBottom: 8,
    },
    usuarioMeta: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
    },
    modalidadeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    modalidadeBadgeText: {
        fontSize: 12,
        color: "#FFF",
        fontWeight: "600",
    },
    usuarioEmail: {
        fontSize: 12,
        color: "#666",
    },

    // INFORMAÇÕES DE PAGAMENTO
    pagamentoInfo: {
        gap: 12,
        marginBottom: 12,

    },
    dataRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
    },
    dataItem: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    dataLabel: {
        fontSize: 12,
        color: "#B8860B",
        fontWeight: "500",
    },
    dataValue: {
        fontSize: 12,
        color: "#FFF",
        fontWeight: "500",
    },

    // SEÇÃO DE FILHOS
    filhosSection: {
        borderTopWidth: 1,
        borderTopColor: "#333",
        paddingTop: 12,
        gap: 8,
    },
    filhosTitle: {
        fontSize: 14,
        color: "#B8860B",
        fontWeight: "600",
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    filhoItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center", // garante que ponto de status fique centralizado com o nome
        paddingVertical: 4,
    },
    filhoNome: {
        fontSize: 12,
        color: "#CCC",
        flex: 1,
    },
    filhoInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        minWidth: 80, // evita que fique muito pequeno
    },
    filhoModalidade: {
        fontSize: 10,
        color: "#666",
        textTransform: "uppercase",
    },
    statusPonto: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusPago: {
        backgroundColor: "#22c55e",
    },
    statusPendente: {
        backgroundColor: "#ef4444",
    },
    maisFilhos: {
        fontSize: 11,
        color: "#666",
        fontStyle: "italic",
        textAlign: "center",
    },

    // BOTÃO DE PAGAMENTO
    pagamentoButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
    },
    pagamentoPago: {
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        borderColor: "#22c55e",
    },
    pagamentoPendente: {
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderColor: "#ef4444",

    },
    pagamentoButtonText: {
        fontSize: 14,
        fontWeight: "600",
    },
    pagamentoButtonTextPago: {
        color: "#22c55e",
    },
    pagamentoButtonTextPendente: {
        color: "#ef4444",
    },

    // MODAL
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.8)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContent: {
        backgroundColor: "#1a1a1a",
        borderRadius: 16,
        width: "100%",
        maxWidth: 400,
        borderWidth: 1,
        borderColor: "#333",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#333",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFF",
    },
    alunoInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    pagamentoNome: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
    },
    statusBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusBadgePago: {
        backgroundColor: "rgba(34, 197, 94, 0.2)",
    },
    statusBadgePendente: {
        backgroundColor: "rgba(239, 68, 68, 0.2)",
    },
    statusBadgeText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#FFF",
        textTransform: "uppercase",
    },
    dataInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    pagamentoData: {
        fontSize: 14,
        color: "#CCC",
    },
    modalActions: {
        flexDirection: "row",
        gap: 12,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: "#333",
    },
    modalButton: {
        flex: 1,
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
    },
    cancelButton: {
        backgroundColor: "#2a2a2a",
        borderWidth: 1,
        borderColor: "#333",
    },
    confirmButton: {
        backgroundColor: "#B8860B",
    },
    warningButton: {
        backgroundColor: "#ef4444",
    },
    cancelButtonText: {
        color: "#CCC",
        fontWeight: "600",
        fontSize: 16,
    },
    confirmButtonText: {
        color: "#000",
        fontWeight: "600",
        fontSize: 16,
    },
    warningButtonText: {
        color: "#FFF",
        fontWeight: "600",
        fontSize: 16,
    },

    // ESTADO VAZIO
    emptyState: {
        backgroundColor: "#1a1a1a",
        margin: 40,
        padding: 40,
        borderRadius: 12,
        alignItems: "center",
        gap: 12,
        borderWidth: 1,
        borderColor: "#333",
        borderStyle: "dashed",
    },
    emptyStateText: {
        fontSize: 16,
        color: "#CCC",
        fontWeight: "600",
        textAlign: "center",
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
    },
});