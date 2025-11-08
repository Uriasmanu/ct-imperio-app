import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";


interface EstatisticasProps {
    estatisticas: {
        total: number;
        pagos: number;
        pendentes: number;
        comFilhos: number;
        totalAlunos: number;
    };
}

export const Estatisticas: React.FC<EstatisticasProps> = ({ estatisticas }) => {
    return (
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
    );
};


export const styles = StyleSheet.create({
    estatisticasContainer: {
        borderBottomWidth: 1,
        maxHeight: 120,
        marginBottom: 10
    },
    estatisticasContent: {
        paddingRight: 16
    },
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
    estatisticaTotalUsuarios: {
        borderColor: "#B8860B",
        borderWidth: 1
    },
    estatisticaPagos: {
        borderColor: "#22c55e",
        borderWidth: 1
    },
    estatisticaPendentes: {
        borderColor: "#ef4444",
        borderWidth: 1
    },
    estatisticaFilhos: {
        borderColor: "#8b5cf6",
        borderWidth: 1
    },
    estatisticaNumero: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
        marginTop: 4
    },
    estatisticaLabel: {
        fontSize: 10,
        color: "#AAA",
        textAlign: "center",
        marginTop: 2
    },
});