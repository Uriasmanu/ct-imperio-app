import { UsuarioCompleto } from "@/types/admin";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import React, { useMemo, useState } from "react";
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
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

    // TRANSFORMA TODOS OS USUÁRIOS E TODOS OS FILHOS EM UMA LISTA ÚNICA
    const listaExpandida = useMemo(() => {
        const itens: any[] = [];

        usuarios.forEach((u) => {
            itens.push({
                ...u,
                isFilho: false,
                paiNome: null,
            });

            if (u.filhos && u.filhos.length > 0) {
                u.filhos.forEach((f) => {
                    itens.push({
                        ...f,
                        isFilho: true,
                        paiNome: u.nome,
                        paiId: u.id,
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

        // monta html
        const conteudoHtml = `
        <html>
            <body style="font-family: Arial; padding: 20px;">
                <h1>Relatório de Alunos</h1>
                <p>Total: ${selecionados.length}</p>

                <ul>
                    ${selecionados
                .map(
                    (s) => `
                        <li style="margin-bottom: 12px;">
                            <strong>Nome:</strong> ${s.nome} <br/>
                            <strong>Último Pagamento:</strong> ${s.dataUltimoPagamento
                            ? new Date(s.dataUltimoPagamento).toLocaleDateString("pt-BR")
                            : "Nunca"
                        } <br/>
                            <strong>Modalidades:</strong> ${s.modalidades?.length > 0
                            ? s.modalidades.map((m: any) => m.modalidade).join(", ")
                            : "Nenhuma"
                        }
                        </li>
                    `
                )
                .join("")}
                </ul>
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


    return (
        <View style={styles.container}>
            {/* TÍTULO E BUSCA */}

            <View style={styles.header}>
                <View style={styles.sectionTitleContainer}>
                    <Ionicons name="list" size={22} color="#B8860B" />
                    <Text style={styles.sectionTitle}>Lista de Alunos</Text>
                </View>

                {/* BARRA DE SELEÇÃO — aparece junto com a busca */}
                {modoSelecao && (
                    <View style={styles.selecaoBar}>
                        <View style={styles.selecaoInfo}>
                            <Ionicons name="checkmark-circle" size={24} color="#B8860B" />
                            <Text style={styles.selecaoTexto}>
                                {itensSelecionados.size} selecionado(s)
                            </Text>
                        </View>

                        <View style={styles.selecaoAcoes}>
                            <TouchableOpacity style={styles.selecaoBtn} onPress={selecionarTodos}>
                                <Ionicons name="checkbox" size={20} color="#B8860B" />
                                <Text style={styles.selecaoBtnTexto}>Todos</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.selecaoBtn} onPress={gerarPdfSelecionados}>
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

                {/* BUSCA — sempre visível */}
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
                                <Ionicons name="close-circle" size={20} color="#666" />
                            </TouchableOpacity>
                        )}
                    </View>

                    <TouchableOpacity
                        style={styles.filtroButton}
                        onPress={() => setMostrarFiltros(!mostrarFiltros)}
                    >
                        <Ionicons name="filter" size={20} color="#B8860B" />
                        <Text style={styles.filtroButtonText}>Filtros</Text>
                    </TouchableOpacity>
                </View>

                {/* FILTROS AVANÇADOS — também sempre disponíveis */}
                {mostrarFiltros && (
                    <View style={styles.filtrosAvancados}>
                        {/* ...resto igual... */}
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
                                onPress={() => toggleSelecao(item.id)}
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
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#B8860B",
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
        marginBottom: 12,
    },
    alunoNome: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
    },
    filhoInfo: { color: "#888", fontSize: 12, marginTop: 2 },
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
});