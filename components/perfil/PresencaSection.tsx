// src/components/perfil/PresencaSection.tsx
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
        lastCheckInDate
    } = usePresenca(userId);

    const [showCalendar, setShowCalendar] = useState(false);

    const handleCheckIn = async () => {
        if (isPresencaCheckedInToday) {
            Alert.alert('Aviso', 'Presença já registrada para hoje');
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

    return (
        <>
            <View style={styles.container}>
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleContainer}>
                        <Ionicons name="calendar" size={20} color="#B8860B" />
                        <Text style={styles.sectionTitle}>FREQUÊNCIA</Text>
                    </View>
                </View>

                <View style={styles.content}>
                    {/* Informação da Última Presença */}
                    {lastCheckInDate ? (
                        <Text style={styles.lastCheckInText}>
                            Última presença: <Text style={styles.lastCheckInDate}>{lastCheckInDate}</Text>
                        </Text>
                    ) : (
                        <Text style={styles.noPresencaText}>Nenhuma presença registrada.</Text>
                    )}

                    {/* Botão Marcar Presença */}
                    <TouchableOpacity
                        style={[
                            styles.checkInButton,
                            isPresencaCheckedInToday ? styles.checkedInButton : styles.availableButton
                        ]}
                        onPress={handleCheckIn}
                        disabled={isPresencaCheckedInToday}
                    >
                        {isPresencaCheckedInToday ? (
                            <View style={styles.checkedInContent}>
                                <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                                <Text style={styles.checkedInText}>Presença Registrada Hoje</Text>
                            </View>
                        ) : (
                            <Text style={styles.checkInText}>FAZER CHECKING</Text>
                        )}
                    </TouchableOpacity>

                    {/* Botão Ver Calendário - CORRIGIDO: adicionado onPress */}
                    <TouchableOpacity 
                        style={styles.calendarButton}
                        onPress={() => setShowCalendar(true)} // ← ESTA LINHA ESTAVA FALTANDO
                    >
                        <Text style={styles.calendarButtonText}>VER CALENDÁRIO</Text>
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
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#333',
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
        gap: 12,
    },
    lastCheckInText: {
        fontSize: 14,
        color: '#CCC',
        textAlign: 'center',
    },
    lastCheckInDate: {
        color: '#B8860B',
        fontWeight: '600',
    },
    noPresencaText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    checkInButton: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    availableButton: {
        backgroundColor: '#B8860B',
    },
    checkedInButton: {
        backgroundColor: '#1e3a28',
        borderWidth: 1,
        borderColor: '#22c55e',
    },
    checkedInContent: {
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
});