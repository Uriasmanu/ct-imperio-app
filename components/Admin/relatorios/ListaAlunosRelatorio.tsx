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

    // GERAR OPÇÕES DE PERÍODO (sempre 30 dias, começando do dia 10)
    const opcoesPeriodo = useMemo(() => {
        const opcoes: string[] = [];
        const hoje = new Date();
        const anoAtual = hoje.getFullYear();

        // Gerar períodos do ano atual (de janeiro a dezembro)
        for (let mes = 0; mes < 12; mes++) {
            const dataInicio = new Date(anoAtual, mes, 10);
            const dataFim = new Date(anoAtual, mes, 9);
            dataFim.setMonth(dataFim.getMonth() + 1);

            const inicioFormatado = dataInicio.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit'
            });
            const fimFormatado = dataFim.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit'
            });

            opcoes.push(`${inicioFormatado} a ${fimFormatado}`);
        }

        return opcoes;
    }, []);

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

    // FORMATADOR DE PAGAMENTO
    const formatarUltimoPagamento = (data: string) => {
        if (!data) return "Nunca";
        const d = new Date(data);
        if (isNaN(d.getTime())) return "Inválido";
        return d.toLocaleDateString("pt-BR");
    };

    // FUNÇÃO PARA FILTRAR PRESENÇAS POR PERÍODO
    const filtrarPresencasPorPeriodo = (presencas: any[], periodo: string): number => {
        if (!periodo) return presencas?.length || 0;

        try {
            const partes = periodo.split(' ');
            const dataInicioStr = partes[0];
            const dataFimStr = partes[2];

            const [diaInicio, mesInicio] = dataInicioStr.split('/').map(Number);
            const [diaFim, mesFim] = dataFimStr.split('/').map(Number);

            const anoAtual = new Date().getFullYear();

            let anoFim = anoAtual;
            if (mesFim < mesInicio) {
                anoFim = anoAtual + 1;
            }

            const dataInicio = new Date(anoAtual, mesInicio - 1, diaInicio);
            const dataFim = new Date(anoFim, mesFim - 1, diaFim);

            const presencasNoPeriodo = presencas?.filter((presenca: any) => {
                const dataPresencaStr = typeof presenca === 'string' ? presenca : presenca.date;

                if (!dataPresencaStr) return false;

                const [anoPres, mesPres, diaPres] = dataPresencaStr.split('-').map(Number);
                const dataPresenca = new Date(anoPres, mesPres - 1, diaPres);

                return dataPresenca >= dataInicio && dataPresenca <= dataFim;
            }) || [];

            return presencasNoPeriodo.length;
        } catch (error) {
            console.error('Erro ao filtrar presenças por período:', error);
            return presencas?.length || 0;
        }
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

    const gerarPdfSelecionados = async (periodo: string) => {
        if (itensSelecionados.size === 0) {
            alert("Nenhum aluno selecionado");
            return;
        }

        // CORREÇÃO: Buscar em ambas as listas para garantir que encontramos todos
        const selecionados: any[] = [];

        // Primeiro, buscar na lista filtrada (que está sendo exibida)
        listaFiltrada.forEach(item => {
            if (itensSelecionados.has(item.id)) {
                selecionados.push(item);
            }
        });

        // Se não encontrou todos, buscar na lista expandida também
        if (selecionados.length !== itensSelecionados.size) {
            listaExpandida.forEach(item => {
                if (itensSelecionados.has(item.id) && !selecionados.find(s => s.id === item.id)) {
                    selecionados.push(item);
                }
            });
        }

        if (selecionados.length === 0) {
            alert("Erro: Nenhum aluno correspondente encontrado.");
            return;
        }

        if (selecionados.length !== itensSelecionados.size) {
            console.warn(`Aviso: Esperados ${itensSelecionados.size} itens, mas encontrados ${selecionados.length}`);
        }

        // Gerar as linhas da tabela
        const linhasTabela = selecionados.map((s) => {
            const modalidadesTexto = s.modalidades?.length > 0
                ? s.modalidades.map((m: any) => m.modalidade).join(", ")
                : "Nenhuma";

            const dataPagamento = s.dataUltimoPagamento
                ? new Date(s.dataUltimoPagamento).toLocaleDateString("pt-BR")
                : "Nunca";

            const presencas = filtrarPresencasPorPeriodo(s.Presenca || [], periodo);

            // Adicionar indicação se é filho
            const nomeCompleto = s.isFilho ? `${s.nome} (filho de ${s.paiNome})` : s.nome;

            return `
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">${nomeCompleto}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${dataPagamento}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${modalidadesTexto}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${presencas}</td>
            </tr>
        `;
        }).join("");

        const conteudoHtml = `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                        color: #333;
                    }
                    h1 {
                        color: #B8860B;
                        text-align: center;
                        margin-bottom: 10px;
                    }
                    .info {
                        text-align: center;
                        margin: 10px 0;
                        color: #666;
                        background-color: #f9f9f9;
                        padding: 10px;
                        border-radius: 5px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                        font-size: 12px;
                    }
                    th {
                        background-color: #B8860B;
                        color: white;
                        padding: 12px;
                        text-align: left;
                        border: 1px solid #ddd;
                        font-weight: bold;
                    }
                    td {
                        padding: 8px;
                        border: 1px solid #ddd;
                    }
                    tr:nth-child(even) {
                        background-color: #f2f2f2;
                    }
                    .total {
                        margin-top: 15px;
                        font-weight: bold;
                        text-align: center;
                        padding: 10px;
                        background-color: #f0f0f0;
                        border-radius: 5px;
                    }
                </style>
            </head>
            <body>
                <h1>Relatório de Alunos</h1>
                <div class="info">
                    <strong>Total de alunos no relatório:</strong> ${selecionados.length}
                </div>
                ${periodo ? `
                    <div class="info">
                        <strong>Período analisado:</strong> ${periodo}
                    </div>
                ` : ''}
                <div class="info">
                    <strong>Data de geração:</strong> ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Último Pagamento</th>
                            <th>Modalidades</th>
                            <th style="text-align: center;">Presenças${periodo ? ' no Período' : ''}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${linhasTabela}
                    </tbody>
                </table>
                
                <div class="total">
                    Total de registros no relatório: ${selecionados.length}
                </div>
            </body>
        </html>
    `;

        try {
            const { uri } = await Print.printToFileAsync({
                html: conteudoHtml,
            });

            await Sharing.shareAsync(uri, {
                mimeType: 'application/pdf',
                dialogTitle: `Relatório de Alunos - ${selecionados.length} alunos`,
            });

            console.log("PDF gerado com sucesso!");

        } catch (e) {
            console.error("Erro ao gerar PDF:", e);
            alert("Erro ao gerar PDF. Verifique o console para mais detalhes.");
        }
    };

    // MODAL DE SELEÇÃO DE PERÍODO COM ESTADO INTERNO
    const ModalSelecaoPeriodo = () => {
        const [periodoSelecionado, setPeriodoSelecionado] = useState<string>("");

        return (
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
                                <Text style={styles.modalTitle}>Selecionar Período</Text>

                                <Text style={styles.periodoInfo}>
                                    Selecione o período de 30 dias para o relatório:
                                </Text>

                                <ScrollView style={styles.listaPeriodos} showsVerticalScrollIndicator={false}>
                                    {opcoesPeriodo.map((periodo, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={[
                                                styles.periodoOpcao,
                                                periodoSelecionado === periodo && styles.periodoOpcaoSelecionada,
                                            ]}
                                            onPress={() => setPeriodoSelecionado(periodo)}
                                        >
                                            <Ionicons
                                                name={periodoSelecionado === periodo ? "radio-button-on" : "radio-button-off"}
                                                size={20}
                                                color={periodoSelecionado === periodo ? "#B8860B" : "#666"}
                                            />
                                            <Text style={[
                                                styles.periodoTexto,
                                                periodoSelecionado === periodo && styles.periodoTextoSelecionado,
                                            ]}>
                                                {periodo}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

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
                                            if (!periodoSelecionado) {
                                                alert("Por favor, selecione um período");
                                                return;
                                            }
                                            gerarPdfSelecionados(periodoSelecionado);
                                            setMostrarModalPeriodo(false);
                                        }}
                                        disabled={!periodoSelecionado}
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
    };

    return (
        <View style={styles.container}>
            {/* TÍTULO E BUSCA */}
            <View style={styles.header}>
                <View style={styles.sectionTitleContainer}>
                    <Ionicons name="list" size={22} color="#B8860B" />
                    <Text style={styles.sectionTitle}>Lista de Alunos</Text>
                </View>

                {/* BARRA DE BUSCA */}
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

                {/* BARRA DE SELEÇÃO MÚLTIPLA */}
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
                        <View style={styles.filtroGrupo}>
                            <Text style={styles.filtroLabel}>Modalidade</Text>
                            <View style={styles.filtroBotoes}>
                                {["todas", "Jiu-Jitsu", "Muay Thai", "Boxe", "MMA"].map((m) => (
                                    <TouchableOpacity
                                        key={m}
                                        style={[
                                            styles.filtroOpcao,
                                            filtroModalidade === m && styles.filtroOpcaoSelecionada,
                                        ]}
                                        onPress={() => setFiltroModalidade(m)}
                                    >
                                        <Text
                                            style={[
                                                styles.filtroOpcaoTexto,
                                                filtroModalidade === m && styles.filtroOpcaoTextoSelecionado,
                                            ]}
                                        >
                                            {m}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.filtroGrupo}>
                            <Text style={styles.filtroLabel}>Professor</Text>
                            <View style={styles.filtroBotoes}>
                                <TouchableOpacity
                                    style={[
                                        styles.filtroOpcao,
                                        filtroProfessor === "todos" && styles.filtroOpcaoSelecionada,
                                    ]}
                                    onPress={() => setFiltroProfessor("todos")}
                                >
                                    <Text
                                        style={[
                                            styles.filtroOpcaoTexto,
                                            filtroProfessor === "todos" && styles.filtroOpcaoTextoSelecionado,
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
                                            filtroProfessor === p.id && styles.filtroOpcaoSelecionada,
                                        ]}
                                        onPress={() => setFiltroProfessor(p.id)}
                                    >
                                        <Text
                                            style={[
                                                styles.filtroOpcaoTexto,
                                                filtroProfessor === p.id && styles.filtroOpcaoTextoSelecionado,
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
                        <Ionicons name="search-outline" size={56} color="#666" />
                        <Text style={styles.nenhumResultadoTitle}>Nenhum aluno encontrado</Text>
                        <Text style={styles.nenhumResultadoText}>Ajuste os filtros ou a busca</Text>
                    </View>
                ) : (
                    listaFiltrada.map((item) => {
                        const estaSelecionado = itensSelecionados.has(item.id);
                        const quantidadePresencas = item.Presenca?.length || 0;

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
                                {modoSelecao && (
                                    <View style={styles.checkbox}>
                                        <Ionicons
                                            name={estaSelecionado ? "checkmark-circle" : "ellipse-outline"}
                                            size={24}
                                            color={estaSelecionado ? "#B8860B" : "#666"}
                                        />
                                    </View>
                                )}

                                <View style={styles.cardHeader}>
                                    <View>
                                        <Text style={styles.alunoNome}>{item.nome}</Text>
                                        {item.isFilho && (
                                            <Text style={styles.filhoInfo}>Filho de {item.paiNome}</Text>
                                        )}
                                    </View>
                                </View>

                                <View style={styles.cardContent}>
                                    <View style={styles.infoItem}>
                                        <Ionicons name="cash" size={16} color="#B8860B" />
                                        <Text style={styles.infoLabel}>Último pagamento:</Text>
                                        <Text style={styles.infoValue}>
                                            {formatarUltimoPagamento(item.dataUltimoPagamento)}
                                        </Text>
                                    </View>

                                    <View style={styles.infoItem}>
                                        <Ionicons name="fitness" size={16} color="#B8860B" />
                                        <Text style={styles.infoLabel}>Modalidades:</Text>
                                        <Text style={styles.infoValue}>
                                            {item.modalidades?.length > 0
                                                ? item.modalidades.map((m: any) => m.modalidade).join(", ")
                                                : "Nenhuma"}
                                        </Text>
                                    </View>

                                    <View style={styles.infoItem}>
                                        <Ionicons name="calendar" size={16} color="#B8860B" />
                                        <Text style={styles.infoLabel}>Presenças:</Text>
                                        <Text style={styles.infoValue}>{quantidadePresencas}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                )}

                <View style={{ height: 30 }} />
            </ScrollView>

            {/* MODAL DE SELEÇÃO DE PERÍODO */}
            <ModalSelecaoPeriodo />
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
        maxHeight: '80%',
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
    listaPeriodos: {
        maxHeight: 200,
        marginBottom: 20,
    },
    periodoOpcao: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#333",
    },
    periodoOpcaoSelecionada: {
        backgroundColor: "#2a2510",
    },
    periodoTexto: {
        color: "#FFF",
        fontSize: 14,
        flex: 1,
    },
    periodoTextoSelecionado: {
        color: "#B8860B",
        fontWeight: "bold",
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