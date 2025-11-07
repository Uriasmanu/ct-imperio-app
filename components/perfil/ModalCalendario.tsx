// src/components/perfil/ModalCalendario.tsx
import { usePresenca } from '@/hooks/usePresenca';
import React from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Calendar } from 'react-native-calendars';

interface ModalCalendarioProps {
    visible: boolean;
    onClose: () => void;
    userId?: string;
}

export const ModalCalendario: React.FC<ModalCalendarioProps> = ({
    visible,
    onClose,
    userId
}) => {
    const {
        presencaRecords,
        todayString,
        currentYear // ← Adicione esta linha
    } = usePresenca(userId);

    // Preparar dados para o calendário
    const markedDates: { [key: string]: any } = {};

    // Marcar datas com presença
    presencaRecords.forEach(record => {
        markedDates[record.date] = {
            selected: true,
            selectedColor: '#B8860B',
            selectedTextColor: '#000'
        };
    });

    // Marcar hoje
    markedDates[todayString] = {
        ...markedDates[todayString],
        marked: true,
        dotColor: '#22c55e',
        today: true,
        todayTextColor: '#B8860B'
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {/* Cabeçalho */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Histórico de Presenças - {currentYear}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Calendário */}
                    <Calendar
                        // Estilo
                        style={styles.calendar}
                        theme={{
                            // Cores principais
                            backgroundColor: '#1a1a1a',
                            calendarBackground: '#1a1a1a',

                            // Texto
                            textSectionTitleColor: '#B8860B',
                            textSectionTitleDisabledColor: '#555',
                            dayTextColor: '#fff',
                            textDisabledColor: '#555',
                            todayTextColor: '#B8860B',

                            // Dias selecionados
                            selectedDayBackgroundColor: '#B8860B',
                            selectedDayTextColor: '#000',

                            // Setas
                            arrowColor: '#B8860B',

                            // Mês
                            monthTextColor: '#fff',
                            textMonthFontSize: 16,
                            textMonthFontWeight: 'bold',

                            // Cabeçalho dos dias
                            textDayHeaderFontSize: 12,
                            textDayHeaderFontWeight: '600',

                            // Dias
                            textDayFontSize: 14,
                            textDayFontWeight: '500',

                            // Pontos/dots
                            dotColor: '#22c55e',
                            selectedDotColor: '#000',
                            disabledDotColor: '#555',
                        }}
                        // Configurações
                        markedDates={markedDates}
                        markingType={'multi-dot'}
                        hideExtraDays={false}
                        showWeekNumbers={false}
                        // Limitar ao ano atual (2 de janeiro a 31 de dezembro)
                        minDate={`${currentYear}-01-02`} // 2 de janeiro
                        maxDate={`${currentYear}-12-31`} // 31 de dezembro
                        // Navegação
                        enableSwipeMonths={true}
                        // Header customizado usando renderArrow (opcional)
                        renderArrow={(direction) => (
                            <View style={styles.arrowContainer}>
                                <Text style={styles.arrowText}>
                                    {direction === 'left' ? '‹' : '›'}
                                </Text>
                            </View>
                        )}
                    />

                    {/* Legenda */}
                    <View style={styles.legend}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, styles.presenceIndicator]} />
                            <Text style={styles.legendText}>Presença registrada</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, styles.todayIndicator]} />
                            <Text style={styles.legendText}>Hoje</Text>
                        </View>
                    </View>

                    {/* Informação sobre o período */}
                    <View style={styles.infoContainer}>
                        <Text style={styles.infoText}>
                            Período válido: 02/01/{currentYear} a 31/12/{currentYear}
                        </Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#1a1a1a',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#333',
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    closeButton: {
        padding: 5,
    },
    closeButtonText: {
        fontSize: 20,
        color: '#fff',
        fontWeight: 'bold',
    },
    calendar: {
        borderRadius: 10,
        marginBottom: 20,
        backgroundColor: '#1a1a1a',
    },
    arrowContainer: {
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrowText: {
        fontSize: 18,
        color: '#B8860B',
        fontWeight: 'bold',
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
        marginBottom: 15,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    presenceIndicator: {
        backgroundColor: '#B8860B',
    },
    todayIndicator: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#B8860B',
    },
    legendText: {
        color: '#CCC',
        fontSize: 12,
    },
    infoContainer: {
        backgroundColor: '#2a2a2a',
        padding: 10,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#B8860B',
    },
    infoText: {
        color: '#B8860B',
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
    },
});