import { usePresenca } from '@/hooks/usePresenca';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { ModalCalendario } from './ModalCalendario';

interface PresencaSectionProps {
    userId?: string;
    isChild?: boolean;
}

export const PresencaSection: React.FC<PresencaSectionProps> = ({
    userId,
    isChild = false
}) => {
    const {
        loading,
        checkIn,
        isPresencaCheckedInToday,
        isPresencaConfirmadaToday,
        lastCheckInDate,
        isNewDay,
        presencaRecords,
        currentYear,
        getSemestreInfo
    } = usePresenca(userId);

    const [showCalendar, setShowCalendar] = useState(false);

    // Estatísticas de presença
    const totalPresencas = presencaRecords.length;
    const presencasConfirmadas = presencaRecords.filter(record => record.confirmada).length;

    // Calcular porcentagem por semestre
    const getPorcentagemPresenca = () => {
        const hoje = new Date();
        const currentMonth = hoje.getMonth();

        let inicioSemestre: Date;
        let fimSemestre: Date;

        if (currentMonth >= 0 && currentMonth <= 5) {
            // Primeiro semestre: janeiro a junho
            inicioSemestre = new Date(currentYear, 0, 2); // 2 de janeiro
            fimSemestre = new Date(currentYear, 5, 30); // 30 de junho
        } else {
            // Segundo semestre: julho a dezembro
            inicioSemestre = new Date(currentYear, 6, 1); // 1 de julho
            fimSemestre = new Date(currentYear, 11, 31); // 31 de dezembro
        }

        // Se hoje estiver antes do fim do semestre, usar a data atual como limite
        const dataLimite = hoje < fimSemestre ? hoje : fimSemestre;

        const diasUteisNoSemestre = calcularDiasUteis(inicioSemestre, dataLimite);

        if (diasUteisNoSemestre === 0) return 0;
        return Math.round((totalPresencas / diasUteisNoSemestre) * 100);
    };

    const calcularDiasUteis = (inicio: Date, fim: Date): number => {
        let count = 0;
        const current = new Date(inicio);

        while (current <= fim) {
            // Conta apenas de segunda (1) a sábado (6), exceto 1º de janeiro
            const day = current.getDay();
            const isPrimeiroJaneiro = current.getMonth() === 0 && current.getDate() === 1;

            if (day >= 1 && day <= 6 && !isPrimeiroJaneiro) {
                count++;
            }
            current.setDate(current.getDate() + 1);
        }
        return count;
    };


    const handleCheckIn = async () => {
        // Só permite marcar se for um novo dia OU se nunca marcou
        if (!isNewDay() && isPresencaCheckedInToday) {
            Alert.alert('Aviso', 'Você já marcou presença para hoje. Tente novamente amanhã.');
            return;
        }

        try {
            const success = await checkIn();
            if (success) {
                Alert.alert('Sucesso', 'Presença registrada com sucesso!');
            } else {
                Alert.alert('Erro', 'Não foi possível registrar a presença');
            }
        } catch (error) {
            Alert.alert('Erro', 'Ocorreu um erro ao registrar a presença');
        }
    };


    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#B8860B" />
                <Text style={styles.loadingText}>Carregando frequência...</Text>
            </View>
        );
    }

    const porcentagem = getPorcentagemPresenca();
    const semestreInfo = getSemestreInfo();

    return (
        <>
            <View style={styles.container}>
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleContainer}>
                        <Ionicons name="calendar" size={20} color="#B8860B" />
                        <Text style={styles.sectionTitle}>
                            FREQUÊNCIA {currentYear} - {semestreInfo.periodo}
                        </Text>
                    </View>
                </View>

                <View style={styles.content}>
                    {/* Indicador do Semestre */}
                    <View style={styles.semestreBadge}>
                        <Text style={styles.semestreText}>
                            {semestreInfo.nome} ({semestreInfo.periodo})
                        </Text>
                    </View>

                    {/* Estatísticas em Grid */}
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{totalPresencas}</Text>
                            <Text style={styles.statLabel}>Total</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{presencasConfirmadas}</Text>
                            <Text style={styles.statLabel}>Confirmadas</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{porcentagem}%</Text>
                            <Text style={styles.statLabel}>Frequência</Text>
                        </View>
                    </View>

                    {/* Barra de Progresso */}
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBackground}>
                            <View
                                style={[
                                    styles.progressFill,
                                    { width: `${Math.min(porcentagem, 100)}%` }
                                ]}
                            />
                        </View>
                        <Text style={styles.progressText}>
                            {porcentagem}% de frequência no {semestreInfo.nome.toLowerCase()}
                        </Text>
                    </View>

                    {/* Informação da Última Presença */}
                    {lastCheckInDate ? (
                        <View style={styles.lastCheckInContainer}>
                            <Ionicons name="time" size={16} color="#B8860B" />
                            <Text style={styles.lastCheckInText}>
                                Última presença: <Text style={styles.lastCheckInDate}>{lastCheckInDate}</Text>
                            </Text>
                        </View>
                    ) : (
                        <Text style={styles.noPresencaText}>Nenhuma presença registrada.</Text>
                    )}

                    {/* Botão Marcar Presença */}
                    <TouchableOpacity
                        style={[
                            styles.checkInButton,
                            isNewDay()
                                ? styles.availableButton 
                                : isPresencaCheckedInToday
                                    ? (isPresencaConfirmadaToday ? styles.confirmedButton : styles.checkedInButton)
                                    : styles.availableButton
                        ]}
                        onPress={handleCheckIn}
                        disabled={!isNewDay() && isPresencaCheckedInToday}
                    >
                        {isNewDay() ? (
                            // NOVO DIA: Mostra "MARCAR PRESENÇA"
                            <View style={styles.buttonContent}>
                                <Ionicons name="checkmark-circle-outline" size={20} color="#000" />
                                <Text style={styles.checkInText}>MARCAR PRESENÇA</Text>
                            </View>
                        ) : isPresencaCheckedInToday ? (
                            // JÁ MARCOU HOJE: Mostra estado atual
                            isPresencaConfirmadaToday ? (
                                <View style={styles.buttonContent}>
                                    <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                                    <Text style={styles.checkedInText}>Presença Confirmada</Text>
                                </View>
                            ) : (
                                <View style={styles.buttonContent}>
                                    <Ionicons name="time" size={20} color="#F59E0B" />
                                    <Text style={styles.checkInText}>AGUARDANDO CONFIRMAÇÃO</Text>
                                </View>
                            )
                        ) : (
                            // CASO DE FALHA (não deveria acontecer)
                            <View style={styles.buttonContent}>
                                <Ionicons name="checkmark-circle-outline" size={20} color="#000" />
                                <Text style={styles.checkInText}>MARCAR PRESENÇA</Text>
                            </View>
                        )}
                    </TouchableOpacity>


                    <TouchableOpacity
                        style={styles.calendarButton}
                        onPress={() => setShowCalendar(true)}
                    >
                        <View style={styles.buttonContent}>
                            <Ionicons name="calendar-outline" size={20} color="#FFF" />
                            <Text style={styles.calendarButtonText}>VER CALENDÁRIO COMPLETO</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <ModalCalendario
                visible={showCalendar}
                onClose={() => setShowCalendar(false)}
                userId={userId}
            />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
        padding: 16,
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#B8860B',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    content: {
        gap: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#B8860B',
    },
    statLabel: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    progressContainer: {
        marginBottom: 8,
    },
    progressBackground: {
        height: 8,
        backgroundColor: '#333',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#B8860B',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
        color: '#CCC',
        textAlign: 'center',
    },
    lastCheckInContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 8,
    },
    lastCheckInText: {
        fontSize: 14,
        color: '#CCC',
    },
    lastCheckInDate: {
        color: '#B8860B',
        fontWeight: '600',
    },
    noPresencaText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        paddingVertical: 8,
    },
    checkInButton: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    availableButton: {
        backgroundColor: '#3B82F6',
    },
    checkedInButton: {
        backgroundColor: '#F59E0B',
    },
    confirmedButton: {
        backgroundColor: '#1e3a28',
        borderColor: '#22c55e',
        borderWidth: 1,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    checkInText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    checkedInText: {
        color: '#22c55e',
        fontSize: 16,
        fontWeight: '600',
    },
    calendarButton: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: '#333',
        alignItems: 'center',
        justifyContent: 'center',
    },
    calendarButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
    },
    loadingText: {
        color: '#B8860B',
        fontSize: 14,
    },
    semestreBadge: {
        backgroundColor: '#2a2a2a',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: '#B8860B',
    },
    semestreText: {
        color: '#B8860B',
        fontSize: 12,
        fontWeight: '600',
    },
});