import { UsuarioCompleto, professores } from "@/types/admin";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import React, { useMemo, useState } from "react";
import {
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

interface ListaAlunosRelatorioProps {
    usuarios: UsuarioCompleto[];
    onAbrirDetalhes: (usuario: UsuarioCompleto) => void;
    refreshing: boolean;
    onRefresh: () => void;
}

export const ListaAlunosRelatorio: React.FC<ListaAlunosRelatorioProps> = ({
    usuarios = [],
    onAbrirDetalhes,
    refreshing,
    onRefresh,
}) => {
    const [busca, setBusca] = useState("");
    const [filtroModalidade, setFiltroModalidade] = useState("todas");
    const [filtroProfessor, setFiltroProfessor] = useState("todos");
    const [mostrarFiltros, setMostrarFiltros] = useState(false);

    // ESTADO PARA SELEÇÃO MÚLTIPLA
    const [modoSelecao, setModoSelecao] = useState(false);
    const [itensSelecionados, setItensSelecionados] = useState<Set<string>>(new Set());

    const [mostrarModalPeriodo, setMostrarModalPeriodo] = useState(false);
    const [pdfDataInicial, setPdfDataInicial] = useState("");
    const [pdfDataFinal, setPdfDataFinal] = useState("");

    // FUNÇÃO PARA CALCULAR O PERÍODO DE 10 A 10
    const calcularPeriodo = () => {
        const hoje = new Date();
        const mesAtual = hoje.getMonth();
        const anoAtual = hoje.getFullYear();
        
        let dataInicio, dataFim;
        
        if (hoje.getDate() >= 10) {
            // Se estamos depois do dia 10, período é do dia 10 atual ao dia 10 próximo
            dataInicio = new Date(anoAtual, mesAtual, 10);
            dataFim = new Date(anoAtual, mesAtual + 1, 10);
        } else {
            // Se estamos antes do dia 10, período é do dia 10 anterior ao dia 10 atual
            dataInicio = new Date(anoAtual, mesAtual - 1, 10);
            dataFim = new Date(anoAtual, mesAtual, 10);
        }
        
        return { dataInicio, dataFim };
    };

    // FUNÇÃO PARA CONTAR FREQUÊNCIAS NO PERÍODO
    const contarFrequenciasNoPeriodo = (usuario: any) => {
        const { dataInicio, dataFim } = calcularPeriodo();
        
        if (!usuario.frequencias || usuario.frequencias.length === 0) {
            return 0;
        }
        
        const frequenciasNoPeriodo = usuario.frequencias.filter((freq: any) => {
            const dataFrequencia = new Date(freq.data);
            return dataFrequencia >= dataInicio && dataFrequencia <= dataFim;
        });
        
        return frequenciasNoPeriodo.length;
    };

    // FUNÇÃO PARA FORMATAR O PERÍODO ATUAL
    const formatarPeriodoAtual = () => {
        const { dataInicio, dataFim } = calcularPeriodo();
        return {
            inicio: dataInicio.toLocaleDateString("pt-BR"),
            fim: dataFim.toLocaleDateString("pt-BR")
        };
    };

    // TRANSFORMA TODOS OS USUÁRIOS E TODOS OS FILHOS EM UMA LISTA ÚNICA
    const listaExpandida = useMemo(() => {
        const itens: any[] = [];

        usuarios.forEach((u) => {
            itens.push({
                ...u,
                isFilho: false,
                paiNome: null,
                frequenciasNoPeriodo: contarFrequenciasNoPeriodo(u)
            });

            if (u.filhos && u.filhos.length > 0) {
                u.filhos.forEach((f) => {
                    itens.push({
                        ...f,
                        isFilho: true,
                        paiNome: u.nome,
                        paiId: u.id,
                        frequenciasNoPeriodo: contarFrequenciasNoPeriodo(f)
                    });
                });
            }
        });

        return itens;
    }, [usuarios]);

    // FILTRAGEM
    const listaFiltrada = useMemo(() => {
        let resultado = [...listaExpandida];

        // BUSCA
        if (busca.trim() !== "") {
            const b = busca.toLowerCase();
            resultado = resultado.filter((item) =>
                item.nome?.toLowerCase().includes(b)
            );
        }

        // MODALIDADE
        if (filtroModalidade !== "todas") {
            resultado = resultado.filter((item) =>
                item.modalidades?.some(
                    (m: any) => m?.modalidade === filtroModalidade
                )
            );
        }

        // PROFESSOR
        if (filtroProfessor !== "todos") {
            resultado = resultado.filter((item) => {
                const temDireto =
                    item.professor === filtroProfessor ||
                    item.professores?.includes(filtroProfessor);

                const modalidadesTem = item.modalidades?.some(
                    (m: any) =>
                        m.professor === filtroProfessor ||
                        m.professorId === filtroProfessor
                );

                return temDireto || modalidadesTem;
            });
        }

        return resultado;
    }, [busca, filtroModalidade, filtroProfessor, listaExpandida]);

    // FORMATADOR DE PAGAMENTO (resumido)
    const formatarUltimoPagamento = (data: string) => {
        if (!data) return "Nunca";
        const d = new Date(data);
        if (isNaN(d.getTime())) return "Inválido";
        return d.toLocaleDateString("pt-BR");
    };

    // FUNÇÕES DE SELEÇÃO
    const handleLongPress = (itemId: string) => {
        setModoSelecao(true);
        toggleSelecao(itemId);
    };

    const toggleSelecao = (itemId: string) => {
        setItensSelecionados((prev) => {
            const novo = new Set(prev);
            if (novo.has(itemId)) {
                novo.delete(itemId);
            } else {
                novo.add(itemId);
            }
            return novo;
        });
    };

    const cancelarSelecao = () => {
        setModoSelecao(false);
        setItensSelecionados(new Set());
    };

    const selecionarTodos = () => {
        setItensSelecionados(new Set(listaFiltrada.map((item) => item.id)));
    };

    const gerarPdfSelecionados = async () => {
        if (itensSelecionados.size === 0) {
            alert("Nenhum aluno selecionado");
            return;
        }

        // pega só os itens selecionados
        const selecionados = listaFiltrada.filter((item) =>
            itensSelecionados.has(item.id)
        );

        const periodo = formatarPeriodoAtual();

        // monta html
        const conteudoHtml = `
        <html>
            <body style="font-family: Arial; padding: 20px;">
                <h1>Relatório de Alunos</h1>
                <p>Período: ${periodo.inicio} à ${periodo.fim}</p>
                <p>Total: ${selecionados.length}</p>

                <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">
                    <thead>
                        <tr style="background-color: #f2f2f2;">
                            <th>Nome</th>
                            <th>Frequências</th>
                            <th>Último Pagamento</th>
                            <th>Modalidades</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${selecionados
                            .map(
                                (s) => `
                            <tr>
                                <td>${s.nome}</td>
                                <td style="text-align: center;">${s.frequenciasNoPeriodo}</td>
                                <td>${s.dataUltimoPagamento
                                    ? new Date(s.dataUltimoPagamento).toLocaleDateString("pt-BR")
                                    : "Nunca"
                                }</td>
                                <td>${s.modalidades?.length > 0
                                    ? s.modalidades.map((m: any) => m.modalidade).join(", ")
                                    : "Nenhuma"
                                }</td>
                            </tr>
                        `
                            )
                            .join("")}
                    </tbody>
                </table>
            </body>
        </html>
    `;

        try {
            const { uri } = await Print.printToFileAsync({
                html: conteudoHtml,
            });

            await Sharing.shareAsync(uri);
        } catch (e) {
            console.log(e);
            alert("Erro ao gerar PDF");
        }
    };

    // MODAL DE PERÍODO PERSONALIZADO
    const ModalPeriodo = () => (
        <Modal
            visible={mostrarModalPeriodo}
            transparent
            animationType="fade"
            onRequestClose={() => setMostrarModalPeriodo(false)}
        >
            <TouchableWithoutFeedback onPress={() => setMostrarModalPeriodo(false)}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Gerar Relatório PDF</Text>
                            
                            <Text style={styles.periodoInfo}>
                                Período atual: {formatarPeriodoAtual().inicio} à {formatarPeriodoAtual().fim}
                            </Text>
                            
                            <View style={styles.modalButtons}>
                                <TouchableOpacity 
                                    style={[styles.modalButton, styles.modalButtonSecondary]}
                                    onPress={() => setMostrarModalPeriodo(false)}
                                >
                                    <Text style={styles.modalButtonTextSecondary}>Cancelar</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={[styles.modalButton, styles.modalButtonPrimary]}
                                    onPress={() => {
                                        gerarPdfSelecionados();
                                        setMostrarModalPeriodo(false);
                                    }}
                                >
                                    <Text style={styles.modalButtonTextPrimary}>Gerar PDF</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );

    return (
        <View style={styles.container}>
            {/* TÍTULO E BUSCA */}
            <View style={styles.header}>
                <View style={styles.sectionTitleContainer}>
                    <Ionicons name="list" size={22} color="#B8860B" />
                    <Text style={styles.sectionTitle}>Lista de Alunos</Text>
                </View>

                {/* INFO DO PERÍODO ATUAL */}
                <View style={styles.periodoContainer}>
                    <Ionicons name="calendar" size={16} color="#B8860B" />
                    <Text style={styles.periodoText}>
                        Período: {formatarPeriodoAtual().inicio} à {formatarPeriodoAtual().fim}
                    </Text>
                </View>

                {/* BARRA DE BUSCA - SEMPRE VISÍVEL */}
                <View style={styles.filtrosHeader}>
                    <View style={styles.buscaContainer}>
                        <Ionicons name="search" size={20} color="#666" />
                        <TextInput
                            style={styles.buscaInput}
                            placeholder="Buscar aluno..."
                            placeholderTextColor="#666"
                            value={busca}
                            onChangeText={setBusca}
                        />

                        {busca.length > 0 && (
                            <TouchableOpacity onPress={() => setBusca("")}>
                                <Ionicons
                                    name="close-circle"
                                    size={20}
                                    color="#666"
                                />
                            </TouchableOpacity>
                        )}
                    </View>

                    <TouchableOpacity
                        style={styles.filtroButton}
                        onPress={() => setMostrarFiltros(!mostrarFiltros)}
                    >
                        <Ionicons
                            name="filter"
                            size={20}
                            color="#B8860B"
                        />
                        <Text style={styles.filtroButtonText}>Filtros</Text>
                    </TouchableOpacity>
                </View>

                {/* BARRA DE SELEÇÃO MÚLTIPLA */}
                {modoSelecao && (
                    <View style={styles.selecaoBar}>
                        <View style={styles.selecaoInfo}>
                            <Ionicons
                                name="checkmark-circle"
                                size={24}
                                color="#B8860B"
                            />
                            <Text style={styles.selecaoTexto}>
                                {itensSelecionados.size} selecionado(s)
                            </Text>
                        </View>

                        <View style={styles.selecaoAcoes}>
                            <TouchableOpacity style={styles.selecaoBtn} onPress={selecionarTodos}>
                                <Ionicons name="checkbox" size={20} color="#B8860B" />
                                <Text style={styles.selecaoBtnTexto}>Todos</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.selecaoBtn}
                                onPress={() => setMostrarModalPeriodo(true)}
                            >
                                <Ionicons name="document" size={20} color="#B8860B" />
                                <Text style={styles.selecaoBtnTexto}>PDF</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.selecaoBtn} onPress={cancelarSelecao}>
                                <Ionicons name="close" size={20} color="#FF6B6B" />
                                <Text style={[styles.selecaoBtnTexto, { color: "#FF6B6B" }]}>
                                    Cancelar
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* PAINEL DE FILTROS */}
                {mostrarFiltros && (
                    <View style={styles.filtrosAvancados}>
                        {/* MODALIDADES */}
                        <View style={styles.filtroGrupo}>
                            <Text style={styles.filtroLabel}>Modalidade</Text>
                            <View style={styles.filtroBotoes}>
                                {[
                                    "todas",
                                    "Jiu-Jitsu",
                                    "Muay Thai",
                                    "Boxe",
                                    "MMA",
                                ].map((m) => (
                                    <TouchableOpacity
                                        key={m}
                                        style={[
                                            styles.filtroOpcao,
                                            filtroModalidade === m &&
                                            styles.filtroOpcaoSelecionada,
                                        ]}
                                        onPress={() =>
                                            setFiltroModalidade(m)
                                        }
                                    >
                                        <Text
                                            style={[
                                                styles.filtroOpcaoTexto,
                                                filtroModalidade === m &&
                                                styles.filtroOpcaoTextoSelecionado,
                                            ]}
                                        >
                                            {m}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* PROFESSOR */}
                        <View style={styles.filtroGrupo}>
                            <Text style={styles.filtroLabel}>Professor</Text>
                            <View style={styles.filtroBotoes}>
                                <TouchableOpacity
                                    style={[
                                        styles.filtroOpcao,
                                        filtroProfessor === "todos" &&
                                        styles.filtroOpcaoSelecionada,
                                    ]}
                                    onPress={() =>
                                        setFiltroProfessor("todos")
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.filtroOpcaoTexto,
                                            filtroProfessor === "todos" &&
                                            styles.filtroOpcaoTextoSelecionado,
                                        ]}
                                    >
                                        Todos
                                    </Text>
                                </TouchableOpacity>

                                {professores.map((p) => (
                                    <TouchableOpacity
                                        key={p.id}
                                        style={[
                                            styles.filtroOpcao,
                                            filtroProfessor === p.id &&
                                            styles.filtroOpcaoSelecionada,
                                        ]}
                                        onPress={() =>
                                            setFiltroProfessor(p.id)
                                        }
                                    >
                                        <Text
                                            style={[
                                                styles.filtroOpcaoTexto,
                                                filtroProfessor === p.id &&
                                                styles.filtroOpcaoTextoSelecionado,
                                            ]}
                                        >
                                            {p.nome}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                )}
            </View>

            {/* LISTAGEM */}
            <ScrollView
                style={styles.listaContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            >
                <Text style={styles.resultadosTexto}>
                    {listaFiltrada.length} de {listaExpandida.length} alunos
                </Text>

                {listaFiltrada.length === 0 ? (
                    <View style={styles.nenhumResultado}>
                        <Ionicons
                            name="search-outline"
                            size={56}
                            color="#666"
                        />
                        <Text style={styles.nenhumResultadoTitle}>
                            Nenhum aluno encontrado
                        </Text>
                        <Text style={styles.nenhumResultadoText}>
                            Ajuste os filtros ou a busca
                        </Text>
                    </View>
                ) : (
                    listaFiltrada.map((item) => {
                        const estaSelecionado = itensSelecionados.has(item.id);

                        return (
                            <TouchableOpacity
                                key={item.id}
                                style={[
                                    styles.alunoCard,
                                    estaSelecionado && styles.alunoCardSelecionado,
                                ]}
                                onPress={() => {
                                    if (modoSelecao) {
                                        toggleSelecao(item.id);
                                    }
                                }}
                                onLongPress={() => handleLongPress(item.id)}
                                delayLongPress={500}
                            >
                                {/* CHECKBOX DE SELEÇÃO */}
                                {modoSelecao && (
                                    <View style={styles.checkbox}>
                                        <Ionicons
                                            name={
                                                estaSelecionado
                                                    ? "checkmark-circle"
                                                    : "ellipse-outline"
                                            }
                                            size={24}
                                            color={estaSelecionado ? "#B8860B" : "#666"}
                                        />
                                    </View>
                                )}

                                <View style={styles.cardHeader}>
                                    <View>
                                        <Text style={styles.alunoNome}>
                                            {item.nome}
                                        </Text>

                                        {item.isFilho && (
                                            <Text style={styles.filhoInfo}>
                                                Filho de {item.paiNome}
                                            </Text>
                                        )}
                                    </View>
                                    
                                    {/* CONTADOR DE FREQUÊNCIAS */}
                                    <View style={styles.frequenciaBadge}>
                                        <Ionicons name="calendar" size={14} color="#B8860B" />
                                        <Text style={styles.frequenciaText}>
                                            {item.frequenciasNoPeriodo} vezes
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.cardContent}>
                                    <View style={styles.infoItem}>
                                        <Ionicons
                                            name="cash"
                                            size={16}
                                            color="#B8860B"
                                        />
                                        <Text style={styles.infoLabel}>
                                            Último pagamento:
                                        </Text>
                                        <Text style={styles.infoValue}>
                                            {formatarUltimoPagamento(
                                                item.dataUltimoPagamento
                                            )}
                                        </Text>
                                    </View>

                                    <View style={styles.infoItem}>
                                        <Ionicons
                                            name="fitness"
                                            size={16}
                                            color="#B8860B"
                                        />
                                        <Text style={styles.infoLabel}>
                                            Modalidades:
                                        </Text>

                                        <Text style={styles.infoValue}>
                                            {item.modalidades?.length > 0
                                                ? item.modalidades
                                                    .map((m: any) => m.modalidade)
                                                    .join(", ")
                                                : "Nenhuma"}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                )}

                <View style={{ height: 30 }} />
            </ScrollView>

            {/* MODAL DE CONFIRMAÇÃO DO PDF */}
            <ModalPeriodo />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { marginBottom: 20 },
    sectionTitleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#B8860B",
    },
    periodoContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    periodoText: {
        color: "#B8860B",
        fontSize: 14,
        fontWeight: "500",
    },
    selecaoBar: {
        backgroundColor: "#1a1a1a",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#B8860B",
        marginBottom: 12,
    },
    selecaoInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 12,
    },
    selecaoTexto: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "600",
    },
    selecaoAcoes: {
        flexDirection: "row",
        gap: 12,
    },
    selecaoBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: "#333",
        borderRadius: 8,
    },
    selecaoBtnTexto: {
        color: "#B8860B",
        fontSize: 14,
        fontWeight: "600",
    },
    filtrosHeader: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 12,
    },
    buscaContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1a1a1a",
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#333",
        gap: 12,
    },
    buscaInput: { flex: 1, color: "#FFF", fontSize: 16 },
    filtroButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        padding: 10,
        backgroundColor: "#1a1a1a",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#333",
    },
    filtroButtonText: {
        color: "#B8860B",
        fontWeight: "bold",
        fontSize: 14,
    },
    filtrosAvancados: {
        backgroundColor: "#1a1a1a",
        padding: 12,
        borderRadius: 8,
    },
    filtroGrupo: { marginBottom: 16 },
    filtroLabel: {
        color: "#FFF",
        fontWeight: "bold",
        marginBottom: 8,
        fontSize: 12,
    },
    filtroBotoes: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    filtroOpcao: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 6,
        backgroundColor: "#333",
    },
    filtroOpcaoSelecionada: { backgroundColor: "#B8860B" },
    filtroOpcaoTexto: { color: "#B8860B", fontSize: 12 },
    filtroOpcaoTextoSelecionado: {
        color: "#000",
        fontWeight: "bold",
    },
    listaContainer: { flex: 1 },
    resultadosTexto: {
        color: "#AAA",
        fontSize: 14,
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    alunoCard: {
        backgroundColor: "#1a1a1a",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#333",
        position: "relative",
    },
    alunoCardSelecionado: {
        borderColor: "#B8860B",
        backgroundColor: "#2a2510",
    },
    checkbox: {
        position: "absolute",
        top: 12,
        right: 12,
        zIndex: 1,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    alunoNome: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
        flex: 1,
    },
    filhoInfo: { color: "#888", fontSize: 12, marginTop: 2 },
    frequenciaBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "#2a2510",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#B8860B",
    },
    frequenciaText: {
        color: "#B8860B",
        fontSize: 12,
        fontWeight: "600",
    },
    cardContent: { gap: 12 },
    infoItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    infoLabel: {
        fontSize: 14,
        color: "#B8860B",
        fontWeight: "600",
        minWidth: 120,
    },
    infoValue: {
        fontSize: 14,
        color: "#FFF",
        fontWeight: "500",
        flex: 1,
    },
    nenhumResultado: {
        alignItems: "center",
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    nenhumResultadoTitle: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "600",
        marginTop: 16,
    },
    nenhumResultadoText: {
        color: "#888",
        fontSize: 14,
        marginTop: 4,
    },
    modalOverlay: {
        flex: 1,
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
    periodoInfo: {
        color: "#B8860B",
        fontSize: 14,
        textAlign: "center",
        marginBottom: 20,
        fontWeight: "500",
    },
    modalButtons: {
        flexDirection: "row",
        gap: 12,
        justifyContent: "center",
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    modalButtonPrimary: {
        backgroundColor: "#B8860B",
    },
    modalButtonSecondary: {
        backgroundColor: "#333",
        borderWidth: 1,
        borderColor: "#666",
    },
    modalButtonTextPrimary: {
        color: "#000",
        fontWeight: "bold",
        fontSize: 14,
    },
    modalButtonTextSecondary: {
        color: "#FFF",
        fontWeight: "bold",
        fontSize: 14,
    },
});