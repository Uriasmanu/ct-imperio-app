import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { db } from "@/config/firebaseConfig";
import { Filho, Usuario } from "@/types/usuarios";

interface GerenciarPagamentoProps {
    item: Usuario | Filho;
    usuarioId?: string; // Opcional - só necessário para filhos
    onPagamentoAtualizado: () => void;
    tipo: "usuario" | "filho";
}

export const GerenciarPagamento: React.FC<GerenciarPagamentoProps> = ({
    item,
    usuarioId,
    onPagamentoAtualizado,
    tipo,
}) => {
    const [modalPagamento, setModalPagamento] = useState(false);
    const [processando, setProcessando] = useState(false);

    const handleAvisarPagamento = async () => {
        setProcessando(true);
        try {
            if (tipo === "usuario") {
                // Atualizar usuário principal
                const userRef = doc(db, "usuarios", item.id);
                await updateDoc(userRef, {
                    avisoPagamento: true,
                    dataUltimoPagamento: new Date().toISOString()
                });
            } else {
                // Atualizar filho
                if (!usuarioId) throw new Error("ID do usuário é necessário para filhos");

                const userRef = doc(db, "usuarios", usuarioId);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const usuario = userSnap.data() as Usuario;
                    const filhosAtualizados = usuario.filhos?.map(f =>
                        f.id === item.id
                            ? {
                                ...f,
                                avisoPagamento: true,
                                dataUltimoPagamento: new Date().toISOString()
                            }
                            : f
                    );

                    await updateDoc(userRef, { filhos: filhosAtualizados });
                }
            }

            onPagamentoAtualizado();
            Alert.alert("Sucesso", `Pagamento de ${item.nome} foi avisado e está aguardando confirmação!`);
        } catch (error) {
            console.error("Erro ao avisar pagamento:", error);
            Alert.alert("Erro", "Não foi possível avisar o pagamento.");
        } finally {
            setProcessando(false);
        }
    };

    const handleConfirmarPagamento = async () => {
        setProcessando(true);
        try {
            if (tipo === "usuario") {
                // Atualizar usuário principal
                const userRef = doc(db, "usuarios", item.id);
                await updateDoc(userRef, {
                    pagamento: true,
                    avisoPagamento: false,
                    dataUltimoPagamento: new Date().toISOString()
                });
            } else {
                // Atualizar filho
                if (!usuarioId) throw new Error("ID do usuário é necessário para filhos");

                const userRef = doc(db, "usuarios", usuarioId);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const usuario = userSnap.data() as Usuario;
                    const filhosAtualizados = usuario.filhos?.map(f =>
                        f.id === item.id
                            ? {
                                ...f,
                                pagamento: true,
                                avisoPagamento: false,
                                dataUltimoPagamento: new Date().toISOString()
                            }
                            : f
                    );

                    await updateDoc(userRef, { filhos: filhosAtualizados });
                }
            }

            onPagamentoAtualizado();
            setModalPagamento(false);
            Alert.alert("Sucesso", `Pagamento de ${item.nome} confirmado!`);
        } catch (error) {
            console.error("Erro ao confirmar pagamento:", error);
            Alert.alert("Erro", "Não foi possível confirmar o pagamento.");
        } finally {
            setProcessando(false);
        }
    };

    const handleMarcarComoPendente = async () => {
        setProcessando(true);
        try {
            if (tipo === "usuario") {
                // Atualizar usuário principal
                const userRef = doc(db, "usuarios", item.id);
                await updateDoc(userRef, {
                    pagamento: false,
                    avisoPagamento: false
                });
            } else {
                // Atualizar filho
                if (!usuarioId) throw new Error("ID do usuário é necessário para filhos");

                const userRef = doc(db, "usuarios", usuarioId);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const usuario = userSnap.data() as Usuario;
                    const filhosAtualizados = usuario.filhos?.map(f =>
                        f.id === item.id
                            ? { 
                                ...f, 
                                pagamento: false,
                                avisoPagamento: false 
                            }
                            : f
                    );

                    await updateDoc(userRef, { filhos: filhosAtualizados });
                }
            }

            onPagamentoAtualizado();
            setModalPagamento(false);
            Alert.alert("Status Alterado", `Pagamento de ${item.nome} marcado como pendente.`);
        } catch (error) {
            console.error("Erro ao atualizar pagamento:", error);
            Alert.alert("Erro", "Não foi possível atualizar o status do pagamento.");
        } finally {
            setProcessando(false);
        }
    };

    const formatarData = (data: string) => {
        return new Date(data).toLocaleDateString("pt-BR");
    };

    const dataUltimoPagamento = 'dataUltimoPagamento' in item ? item.dataUltimoPagamento : undefined;

    // Determinar o texto a ser exibido baseado no status
    const getStatusText = () => {
        if (item.pagamento) {
            return "Pago";
        } else if (item.avisoPagamento) {
            return "Aguardando";
        } else {
            return "Pendente";
        }
    };

    // Determinar a cor baseada no status
    const getStatusColor = () => {
        if (item.pagamento) {
            return "#22c55e"; // Verde para pago
        } else if (item.avisoPagamento) {
            return "#f59e0b"; // Âmbar para aguardando
        } else {
            return "#ef4444"; // Vermelho para pendente
        }
    };

    // Determinar o ícone baseado no status
    const getStatusIcon = () => {
        if (item.pagamento) {
            return "checkmark-circle";
        } else if (item.avisoPagamento) {
            return "time";
        } else {
            return "alert-circle";
        }
    };

    return (
        <>
            <View style={styles.container}>
                {/* Status do Pagamento */}
                <TouchableOpacity
                    style={[
                        styles.pagamentoButton,
                        item.pagamento ? styles.pagamentoPago : 
                        item.avisoPagamento ? styles.pagamentoAguardando : styles.pagamentoPendente
                    ]}
                    onPress={() => setModalPagamento(true)}
                >
                    <Ionicons
                        name={getStatusIcon()}
                        size={16}
                        color={getStatusColor()}
                    />
                    <Text style={[
                        styles.pagamentoButtonText,
                        { color: getStatusColor() }
                    ]}>
                        {getStatusText()}
                    </Text>
                </TouchableOpacity>

                {/* Botão Avisar que Pagou - aparece apenas quando está pendente e não aguardando */}
                {!item.pagamento && !item.avisoPagamento && (
                    <TouchableOpacity
                        style={styles.avisarButton}
                        onPress={handleAvisarPagamento}
                        disabled={processando}
                    >
                        {processando ? (
                            <ActivityIndicator size="small" color="#000" />
                        ) : (
                            <>
                                <Ionicons name="notifications" size={14} color="#000" />
                                <Text style={styles.avisarButtonText}>Avisar que pagou</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </View>

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
                                <Text style={styles.pagamentoNome}>{item.nome}</Text>
                            </View>

                            <View style={[
                                styles.statusBadge,
                                item.pagamento ? styles.statusBadgePago : 
                                item.avisoPagamento ? styles.statusBadgeAguardando : styles.statusBadgePendente
                            ]}>
                                <Text style={styles.statusBadgeText}>
                                    {getStatusText().toUpperCase()}
                                </Text>
                            </View>

                            {dataUltimoPagamento && (
                                <View style={styles.dataInfo}>
                                    <Ionicons name="calendar" size={16} color="#666" />
                                    <Text style={styles.pagamentoData}>
                                        Último pagamento: {formatarData(dataUltimoPagamento)}
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

                            {!item.pagamento ? (
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

const styles = {
    container: {
        flexDirection: 'row',
        gap: 8,
        justifyContent: "space-between",
    },
    pagamentoButtonText: {
        fontSize: 16,
        fontWeight: "600",
    },
    pagamentoButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        alignSelf: 'flex-start',
    },
    pagamentoPago: {
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        borderColor: "#22c55e",
    },
    pagamentoAguardando: {
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        borderColor: "#f59e0b",
    },
    pagamentoPendente: {
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderColor: "#ef4444",
    },
    avisarButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        padding: 14,
        borderRadius: 6,
        backgroundColor: "#f59e0b",
        alignSelf: 'flex-start',
    },
    avisarButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#000",
    },
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
        maxHeight: "90%",
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
    pagamentoInfo: {
        backgroundColor: "#2a2a2a",
        padding: 16,
        borderRadius: 8,
        marginBottom: 20,
        gap: 12,
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
    statusBadgeAguardando: {
        backgroundColor: "rgba(245, 158, 11, 0.2)",
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
        color: "#666",
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
    },
    cancelButton: {
        backgroundColor: "#2a2a2a",
        borderWidth: 1,
        borderColor: "#333",
    },
    confirmButton: {
        backgroundColor: "#B8860B",
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
    warningButton: {
        backgroundColor: "#ef4444",
    },
    warningButtonText: {
        color: "#FFF",
        fontWeight: "600",
        fontSize: 16,
    },
} as const;