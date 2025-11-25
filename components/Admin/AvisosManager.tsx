// src/components/Admin/AvisosManager.tsx
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { addNotice, deleteNotice, listenToNotices, updateNotice } from '@/services/noticesService';
import { Notice } from '@/types/Notice';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { NoticeForm } from './NoticeForm';

interface AvisosManagerProps {
    isVisible: boolean;
}

// Sistema de cores otimizado para melhor contraste
const COLOR_SYSTEM = {
  // Cores de fundo
  backgrounds: {
    yellow: '#FFD700',     
    gray: '#4B5563',      
    red: '#DC2626',       
    green: '#059669',     
  },
  // Cores de texto para cada fundo
  texts: {
    onYellow: '#000000',   
    onDark: '#FFFFFF',    
  },
  // Cores para badges e elementos secundários
  accents: {
    yellowBadge: '#000000',
    darkBadge: '#FFD700',  
  }
};

export const AvisosManager: React.FC<AvisosManagerProps> = ({ isVisible }) => {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [formVisible, setFormVisible] = useState(false);
    const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const { user } = useAdminAuth();

    useEffect(() => {
        if (!isVisible) return;

        const unsubscribe = listenToNotices((data) => {
            setNotices(data);
            setLoading(false);
            setRefreshing(false);
        });

        return () => unsubscribe();
    }, [isVisible]);

    const handleRefresh = () => {
        setRefreshing(true);
    };

    const handleAddNotice = () => {
        setEditingNotice(null);
        setFormVisible(true);
    };

    const handleEditNotice = (notice: Notice) => {
        setEditingNotice(notice);
        setFormVisible(true);
    };

    const handleDeleteNotice = (notice: Notice) => {
        Alert.alert(
            'Confirmar Exclusão',
            `Tem certeza que deseja excluir o aviso "${notice.title}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const result = await deleteNotice(notice.id);
                            if (result.success) {
                                Alert.alert('Sucesso', 'Aviso excluído com sucesso!');
                            } else {
                                throw new Error('Erro ao excluir aviso');
                            }
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível excluir o aviso. Tente novamente.');
                        }
                    }
                }
            ]
        );
    };

    const handleSubmitNotice = async (formData: any) => {
        if (!user?.email) {
            Alert.alert('Erro', 'Usuário não autenticado.');
            return;
        }

        setSubmitting(true);
        try {
            let result;

            if (editingNotice) {
                result = await updateNotice(editingNotice.id, formData);
            } else {
                result = await addNotice(formData, user.email);
            }

            if (result.success) {
                setFormVisible(false);
                setEditingNotice(null);
            } else {
                throw new Error('Erro ao salvar aviso');
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível salvar o aviso. Tente novamente.');
        } finally {
            setSubmitting(false);
        }
    };

    // Sistema de cores otimizado
    const getColorStyle = (color: Notice['color']) => {
        switch (color) {
            case 'bg-fight-yellow':
                return {
                    backgroundColor: COLOR_SYSTEM.backgrounds.yellow,
                    textColor: COLOR_SYSTEM.texts.onYellow,
                    badgeColor: COLOR_SYSTEM.accents.yellowBadge,
                    badgeTextColor: COLOR_SYSTEM.backgrounds.yellow,
                    detailColor: '#6B7280', 
                    actionBg: 'rgba(0,0,0,0.1)'
                };
            case 'bg-gray-700':
                return {
                    backgroundColor: COLOR_SYSTEM.backgrounds.gray,
                    textColor: COLOR_SYSTEM.texts.onDark,
                    badgeColor: COLOR_SYSTEM.accents.darkBadge,
                    badgeTextColor: COLOR_SYSTEM.backgrounds.gray,
                    detailColor: '#D1D5DB',
                    actionBg: 'rgba(255,255,255,0.1)'
                };
            case 'bg-punch-red':
                return {
                    backgroundColor: COLOR_SYSTEM.backgrounds.red,
                    textColor: COLOR_SYSTEM.texts.onDark,
                    badgeColor: COLOR_SYSTEM.accents.darkBadge,
                    badgeTextColor: COLOR_SYSTEM.backgrounds.red,
                    detailColor: '#FECACA',
                    actionBg: 'rgba(255,255,255,0.1)'
                };
            case 'bg-green-500':
                return {
                    backgroundColor: COLOR_SYSTEM.backgrounds.green,
                    textColor: COLOR_SYSTEM.texts.onDark,
                    badgeColor: COLOR_SYSTEM.accents.darkBadge,
                    badgeTextColor: COLOR_SYSTEM.backgrounds.green,
                    detailColor: '#A7F3D0', 
                    actionBg: 'rgba(255,255,255,0.1)'
                };
            default:
                return {
                    backgroundColor: COLOR_SYSTEM.backgrounds.gray,
                    textColor: COLOR_SYSTEM.texts.onDark,
                    badgeColor: COLOR_SYSTEM.accents.darkBadge,
                    badgeTextColor: COLOR_SYSTEM.backgrounds.gray,
                    detailColor: '#D1D5DB',
                    actionBg: 'rgba(255,255,255,0.1)'
                };
        }
    };

    const windowWidth = Dimensions.get('window').width;
    const numColumns = windowWidth > 900 ? 2 : 1;

    if (!isVisible) return null;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <MaterialCommunityIcons name="clipboard-text" size={24} color="#B8860B" />
                    <Text style={styles.headerTitle}>Gerenciar Avisos</Text>
                </View>
                <TouchableOpacity style={styles.addButton} onPress={handleAddNotice}>
                    <Ionicons name="add" size={20} color="#000" />
                    <Text style={styles.addButtonText}>Novo Aviso</Text>
                </TouchableOpacity>
            </View>

            {/* Lista de Avisos */}
            <ScrollView
                style={styles.scrollContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={["#B8860B"]}
                        tintColor="#B8860B"
                    />
                }
            >
                <View style={[styles.noticesGrid, { flexDirection: numColumns === 1 ? 'column' : 'row', flexWrap: numColumns === 1 ? 'nowrap' : 'wrap' }]}>
                    {notices.map((notice) => {
                        const colors = getColorStyle(notice.color);
                        
                        return (
                            <View
                                key={notice.id}
                                style={[
                                    styles.noticeCardWrapper,
                                    { width: numColumns === 1 ? '100%' : '48%' }
                                ]}
                            >
                                <View style={[styles.noticeCard, { backgroundColor: colors.backgroundColor }]}>
                                    {/* Header do Card */}
                                    <View style={styles.cardHeader}>
                                        <View style={[styles.cardCategory, { backgroundColor: colors.badgeColor }]}>
                                            <Text style={[styles.categoryText, { color: colors.badgeTextColor }]}>
                                                {notice.category}
                                            </Text>
                                        </View>
                                        <View style={styles.cardActions}>
                                            <TouchableOpacity
                                                style={[styles.actionButton, { backgroundColor: colors.actionBg }]}
                                                onPress={() => handleEditNotice(notice)}
                                            >
                                                <Ionicons name="create-outline" size={16} color={colors.textColor} />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.actionButton, { backgroundColor: colors.actionBg }]}
                                                onPress={() => handleDeleteNotice(notice)}
                                            >
                                                <Ionicons name="trash-outline" size={16} color={colors.textColor} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* Conteúdo do Card */}
                                    <Text style={[styles.cardTitle, { color: colors.textColor }]}>
                                        {notice.title}
                                    </Text>

                                    <View style={styles.cardDetails}>
                                        <Text style={[styles.cardDetail, { color: colors.detailColor }]}>
                                            {notice.date} {notice.time && `• ${notice.time}`}
                                        </Text>
                                    </View>

                                    <Text
                                        style={[styles.cardDescription, { color: colors.textColor, opacity: 0.9 }]}
                                        numberOfLines={3}
                                    >
                                        {notice.description ?? ''}
                                    </Text>

                                    {/* Footer do Card */}
                                    <View style={[styles.cardFooter, { borderTopColor: colors.textColor }]}>
                                        <Text style={[styles.cardAuthor, { color: colors.textColor, opacity: 0.7 }]}>
                                            Por: {notice.createdBy}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {notices.length === 0 && !loading && (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="clipboard-text-outline" size={64} color="#666" />
                        <Text style={styles.emptyStateTitle}>Nenhum aviso cadastrado</Text>
                        <Text style={styles.emptyStateSubtitle}>
                            Clique em "Novo Aviso" para criar seu primeiro aviso.
                        </Text>
                    </View>
                )}

                <View style={styles.footerSpace} />
            </ScrollView>

            {/* Modal do Formulário */}
            <NoticeForm
                visible={formVisible}
                onClose={() => {
                    setFormVisible(false);
                    setEditingNotice(null);
                }}
                onSubmit={handleSubmitNotice}
                editingNotice={editingNotice}
                loading={submitting}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#B8860B',
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#000',
        fontSize: 14,
        fontWeight: '600',
    },
    scrollContainer: {
        flex: 1,
        padding: 16,
    },
    noticesGrid: {
        gap: 12,
    },
    noticeCardWrapper: {
        marginBottom: 12,
    },
    noticeCard: {
        padding: 16,
        borderRadius: 12,
        minHeight: 180,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    cardCategory: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    cardActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        padding: 6,
        borderRadius: 6,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 8,
        lineHeight: 20,
    },
    cardDetails: {
        marginBottom: 12,
    },
    cardDetail: {
        fontSize: 12,
        fontWeight: '500',
    },
    cardDescription: {
        fontSize: 14,
        lineHeight: 18,
        flex: 1,
    },
    cardFooter: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        opacity: 0.3,
    },
    cardAuthor: {
        fontSize: 11,
        fontStyle: 'italic',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFF',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyStateSubtitle: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        lineHeight: 20,
    },
    footerSpace: {
        height: 40,
    },
});