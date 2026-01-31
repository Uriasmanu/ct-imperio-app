import { GraduacaoJiuJitsu, GraduacaoMuayThai, graduaçõesJiuJitsu, graduaçõesJiuJitsuInfantil, graduaçõesMuayThai, graduaçõesMuayThaiInfantil } from '@/types/graduacoes';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface GraduacaoSelectorProps {
    modalidade: string;
    graduacaoAtual: GraduacaoMuayThai | GraduacaoJiuJitsu | undefined;
    categoriaGraduacao:
    | "jiu-jitsu"
    | "jiu-jitsu-infantil"
    | "muay-thai"
    | "muay-thai-infantil";

    onSelect: (grad: GraduacaoMuayThai | GraduacaoJiuJitsu) => void;
}

export const GraduacaoSelector: React.FC<GraduacaoSelectorProps> = ({
    modalidade,
    graduacaoAtual,
    categoriaGraduacao,
    onSelect,
}) => {
    if (modalidade === "Jiu-Jitsu") {
        const atual = graduacaoAtual as GraduacaoJiuJitsu;

        const graduacoesFonte =
            categoriaGraduacao === "jiu-jitsu-infantil"
                ? graduaçõesJiuJitsuInfantil
                : graduaçõesJiuJitsu;

        const faixasUnicas = Array.from(
            new Set(graduacoesFonte.map(g => g.cor))
        ).map(cor =>
            graduacoesFonte.find(g => g.cor === cor)
        ).filter((g): g is GraduacaoJiuJitsu => !!g);

        const faixaSelecionada = atual?.cor || faixasUnicas[0]?.cor;

        const grausDaFaixa = graduacoesFonte
            .filter(g => g.cor === faixaSelecionada)
            .sort((a, b) => (a.grau ?? 0) - (b.grau ?? 0));

        return (
            <View style={styles.graduacaoContainer}>
                <Text style={styles.modalLabel}>Faixa:</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {faixasUnicas.map((grad) => (
                        <TouchableOpacity
                            key={grad.cor}
                            style={[
                                styles.graduacaoButton,
                                faixaSelecionada === grad.cor && styles.graduacaoButtonSelected,
                            ]}
                            onPress={() => {
                                const novoGrau = grausDaFaixa.find(g => g.cor === grad.cor && g.grau === atual?.grau) ? atual.grau : 1;
                                onSelect({ cor: grad.cor, grau: novoGrau } as GraduacaoJiuJitsu);
                            }}
                        >
                            <Text style={[
                                styles.graduacaoButtonText,
                                faixaSelecionada === grad.cor && styles.graduacaoButtonTextSelected,
                            ]}>
                                {grad.cor}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {grausDaFaixa.length > 1 && (
                    <>
                        <Text style={[styles.modalLabel, { marginTop: 16 }]}>Grau:</Text>
                        <View style={styles.grauButtonsContainer}>
                            {grausDaFaixa.map((grad) => (
                                <TouchableOpacity
                                    key={`${grad.cor}-${grad.grau}`}
                                    style={[
                                        styles.grauButton,
                                        atual?.cor === grad.cor && atual?.grau === grad.grau && styles.grauButtonSelected,
                                    ]}
                                    onPress={() => onSelect(grad)}
                                >
                                    <Text style={[
                                        styles.grauButtonText,
                                        atual?.cor === grad.cor && atual?.grau === grad.grau && styles.grauButtonTextSelected,
                                    ]}>
                                        {grad.grau}º
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                )}
            </View>
        );
    } else if (modalidade === "Muay Thai") {
        const atual = graduacaoAtual as GraduacaoMuayThai;
        const graduacoesFonte =
            categoriaGraduacao === "muay-thai-infantil"
                ? graduaçõesMuayThaiInfantil
                : graduaçõesMuayThai;

        return (
            <View style={styles.graduacaoContainer}>
                <Text style={styles.modalLabel}>Praijed:</Text>
                <View style={styles.grauButtonsContainer}>
                    {graduacoesFonte.map((grad) => (
                        <TouchableOpacity
                            key={`${grad.cor}-${grad.pontaBranca ? "P" : "S"}`}
                            style={[
                                styles.grauButton,
                                atual?.cor === grad.cor && atual?.pontaBranca === grad.pontaBranca && styles.grauButtonSelected,
                            ]}
                            onPress={() => onSelect(grad)}
                        >
                            <Text style={[
                                styles.grauButtonText,
                                atual?.cor === grad.cor && atual?.pontaBranca === grad.pontaBranca && styles.grauButtonTextSelected,
                            ]}>
                                {grad.cor} {grad.pontaBranca ? " (PB)" : ""}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    }

    return <Text style={styles.infoValue}>Modalidade sem graduação definida.</Text>;
};

const styles = StyleSheet.create({
    graduacaoContainer: {
        gap: 12,
    },
    modalLabel: {
        fontSize: 16,
        color: "#B8860B",
        fontWeight: "600",
    },
    scrollContent: {
        gap: 8,
    },
    graduacaoButton: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: "#2a2a2a",
        borderWidth: 1,
        borderColor: "#333",
        marginRight: 8,
    },
    graduacaoButtonSelected: {
        backgroundColor: "#B8860B",
        borderColor: "#DAA520",
    },
    graduacaoButtonText: {
        color: "#CCC",
        fontWeight: "500",
        fontSize: 14,
    },
    graduacaoButtonTextSelected: {
        color: "#000",
        fontWeight: "600",
    },
    grauButtonsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    grauButton: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: "#2a2a2a",
        borderWidth: 1,
        borderColor: "#333",
        minWidth: 60,
        alignItems: "center",
    },
    grauButtonSelected: {
        backgroundColor: "#B8860B",
        borderColor: "#DAA520",
    },
    grauButtonText: {
        color: "#CCC",
        fontWeight: "500",
        fontSize: 14,
    },
    grauButtonTextSelected: {
        color: "#000",
        fontWeight: "600",
    },
    infoValue: {
        fontSize: 16,
        color: "#666",
    },
});