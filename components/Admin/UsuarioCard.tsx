import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { GerenciarPagamentoAdmim } from "@/components/Admin/GerenciarPagamentoAdmim";
import { UsuarioCompleto } from "@/types/admin";


interface UsuarioCardProps {
    usuario: UsuarioCompleto;
    onPagamentoAtualizado: () => void;
}

export const UsuarioCard: React.FC<UsuarioCardProps> = ({
    usuario,
    onPagamentoAtualizado
}) => {
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
                        {usuario.modalidades?.map((m, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.modalidadeBadge,
                                    {
                                        backgroundColor:
                                            m.modalidade === "Muay Thai" ? "#dc2626" : "#1e40af",
                                    },
                                ]}
                            >
                                <Text style={styles.modalidadeBadgeText}>{m.modalidade}</Text>
                            </View>
                        ))}
                        <Text style={styles.usuarioEmail}>{usuario.email}</Text>
                    </View>
                </View>
                <GerenciarPagamentoAdmim
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
                                    <Text style={styles.filhoModalidade}>
                                        {filho.modalidades?.map(m => m.modalidade).join(", ") || "Sem modalidade"}
                                    </Text>
                                    <Text style={styles.filhoPagamentoData}>
                                        Último: {formatarData(filho.dataUltimoPagamento || "")}
                                    </Text>
                                </View>
                            </View>
                            <GerenciarPagamentoAdmim
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

const styles = StyleSheet.create({
    usuarioCard: {
        backgroundColor: "#1a1a1a",
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: "#B8860B",
    },
    usuarioHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    usuarioInfo: {
        flex: 1,
        paddingRight: 10,
    },
    usuarioNome: {
        color: "#FFF",
        fontWeight: "bold",
        fontSize: 16,
    },
    usuarioMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        flexWrap: 'wrap',
    },
    modalidadeBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: 8,
    },
    modalidadeBadgeText: {
        color: "#FFF",
        fontSize: 10,
        fontWeight: "bold",
    },
    usuarioEmail: {
        color: "#AAA",
        fontSize: 12,
        marginTop: 2,
    },
    pagamentoInfo: {
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: "#333",
        borderBottomWidth: 1,
        borderBottomColor: "#333",
        marginBottom: 12,
    },
    dataRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    dataItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dataLabel: {
        color: '#AAA',
        fontSize: 12,
    },
    dataValue: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
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
    filhoItemContent: {
        flex: 1,
    },
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