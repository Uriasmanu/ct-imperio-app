import { UsuarioCompleto, professores } from "@/types/admin";
import { Ionicons } from "@expo/vector-icons";
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

    const obterNomeProfessor = (id: string) => {
        const p = professores.find((x) => x.id === id);
        return p ? p.nome : "Desconhecido";
    };

    return (
        <View style={styles.container}>
            {/* TÍTULO E BUSCA */}
            <View style={styles.header}>
                <View style={styles.sectionTitleContainer}>
                    <Ionicons name="list" size={22} color="#B8860B" />
                    <Text style={styles.sectionTitle}>Lista de Alunos</Text>
                </View>

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
                    listaFiltrada.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.alunoCard}
                            onPress={() =>
                                onAbrirDetalhes(
                                    item.isFilho
                                        ? usuarios.find(
                                              (u) =>
                                                  u.id === item.paiId
                                          )!
                                        : item
                                )
                            }
                        >
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

                                <Ionicons
                                    name="chevron-forward"
                                    size={20}
                                    color="#B8860B"
                                />
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
                    ))
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
        paddingVertical: 12,
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
