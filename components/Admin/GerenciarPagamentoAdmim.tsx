import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { db } from "@/config/firebaseConfig";
import { Filho, Usuario } from "@/types/usuarios";

// 🎯 TIPOS
interface UsuarioCompleto extends Usuario {
    id: string;
}

interface GerenciarPagamentoProps {
    usuario: UsuarioCompleto;
    filho?: Filho;
    onPagamentoAtualizado: () => void;
}

// 🎯 COMPONENTE DE GERENCIAMENTO DE PAGAMENTO
export const GerenciarPagamentoAdmim: React.FC<GerenciarPagamentoProps> = ({
    usuario,
    filho,
    onPagamentoAtualizado,
}) => {
    const [modalPagamento, setModalPagamento] = useState(false);
    const [processando, setProcessando] = useState(false);

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

    const handleTogglePagamento = async (status: boolean) => {
        setProcessando(true);
        try {
            const userRef = doc(db, "usuarios", usuario.id);

            if (filho) {
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
                        "Sucesso",
                        `Pagamento de ${filho.nome} ${status ? "confirmado" : "marcado como pendente"}!`
                    );
                }
            } else {
                await updateDoc(userRef, {
                    pagamento: status,
                    dataUltimoPagamento: status ? new Date().toISOString() : undefined,
                });
                Alert.alert(
                    "Sucesso",
                    `Pagamento de ${usuario.nome} ${status ? "confirmado" : "marcado como pendente"}!`
                );
            }

            onPagamentoAtualizado();
            setModalPagamento(false);
        } catch (error) {
            console.error("Erro ao atualizar pagamento:", error);
            Alert.alert("Erro", "Não foi possível atualizar o status do pagamento.");
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

// 🎯 ESTILOS
const styles = StyleSheet.create({
       pagamentoButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        padding: 6,
        borderRadius: 8,
        minWidth: 100,
        justifyContent: 'center'
    },
    pagamentoPago: {
        backgroundColor: "#1a1a1a",
        borderWidth: 1,
        borderColor: "#22c55e"
    },
    pagamentoPendente: {
        backgroundColor: "#1a1a1a",
        borderWidth: 1,
        borderColor: "#ef4444"
    },
    pagamentoButtonText: {
        fontSize: 12,
        fontWeight: "600"
    },
    pagamentoButtonTextPago: {
        color: "#22c55e"
    },
    pagamentoButtonTextPendente: {
        color: "#ef4444"
    },

    // Estilos Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#000',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: '#B8860B'
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        paddingBottom: 10,
        marginBottom: 15
    },
    modalTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold'
    },
    pagamentoNome: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
        flexShrink: 1
    },
    alunoInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginBottom: 15
    },
    statusBadgePago: {
        backgroundColor: '#22c55e'
    },
    statusBadgePendente: {
        backgroundColor: '#ef4444'
    },
    statusBadgeText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 12
    },
    dataInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8
    },
    pagamentoData: {
        color: '#CCC',
        fontSize: 14
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#333',
        paddingTop: 15
    },
    modalButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        gap: 6,
        flex: 1,
        marginHorizontal: 5,
        justifyContent: 'center'
    },
    cancelButton: {
        backgroundColor: '#333'
    },
    cancelButtonText: {
        color: '#FFF',
        fontWeight: 'bold'
    },
    confirmButton: {
        backgroundColor: '#B8860B'
    },
    confirmButtonText: {
        color: '#000',
        fontWeight: 'bold'
    },
    warningButton: {
        backgroundColor: '#ef4444'
    },
    warningButtonText: {
        color: '#FFF',
        fontWeight: 'bold'
    },
    filhoTag: {
        color: '#8b5cf6',
        fontSize: 12,
        fontWeight: 'normal'
    },
    pagamentoInfo: {
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: "#333",
        borderBottomWidth: 1,
        borderBottomColor: "#333",
        marginBottom: 12
    },
});