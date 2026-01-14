import { globalStyles } from '@/styles/globalStyles';
import { Notice } from '@/types/Notice';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { listenToNotices } from '../services/noticesService';

// Sistema de cores otimizado
const COLOR_SYSTEM = {
  backgrounds: {
    yellow: '#FFD700',
    gray: '#4B5563',
    red: '#DC2626',
    green: '#059669',
  },
  texts: {
    onYellow: '#000000',
    onDark: '#FFFFFF',
  },
  accents: {
    yellowBadge: '#000000',
    darkBadge: '#FFD700',
  },
  fightYellow: '#FFD700',
  arenaBlack: '#1a1a1a',
  gray400: '#9ca3af',
  gray300: '#d1d5db',
};

// Componente para quando não há avisos
const EmptyNotices = () => {
  return (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons 
        name="clipboard-text-outline" 
        size={64} 
        color={COLOR_SYSTEM.gray400} 
      />
      <Text style={styles.emptyTitle}>Nenhum aviso no momento</Text>
      <Text style={styles.emptySubtitle}>
        Fique atento! Novos avisos e eventos aparecerão aqui.
      </Text>
    </View>
  );
};

const getColorStyle = (color: Notice['color']) => {
  switch (color) {
    case 'bg-fight-yellow':
      return {
        backgroundColor: COLOR_SYSTEM.backgrounds.yellow,
        textColor: COLOR_SYSTEM.texts.onYellow,
        badgeColor: COLOR_SYSTEM.accents.yellowBadge,
        badgeTextColor: COLOR_SYSTEM.backgrounds.yellow,
        detailColor: '#6B7280',
      };
    case 'bg-gray-700':
      return {
        backgroundColor: COLOR_SYSTEM.backgrounds.gray,
        textColor: COLOR_SYSTEM.texts.onDark,
        badgeColor: COLOR_SYSTEM.accents.darkBadge,
        badgeTextColor: COLOR_SYSTEM.backgrounds.gray,
        detailColor: '#D1D5DB',
      };
    case 'bg-punch-red':
      return {
        backgroundColor: COLOR_SYSTEM.backgrounds.red,
        textColor: COLOR_SYSTEM.texts.onDark,
        badgeColor: COLOR_SYSTEM.accents.darkBadge,
        badgeTextColor: COLOR_SYSTEM.backgrounds.red,
        detailColor: '#FECACA',
      };
    case 'bg-green-500':
      return {
        backgroundColor: COLOR_SYSTEM.backgrounds.green,
        textColor: COLOR_SYSTEM.texts.onDark,
        badgeColor: COLOR_SYSTEM.accents.darkBadge,
        badgeTextColor: COLOR_SYSTEM.backgrounds.green,
        detailColor: '#A7F3D0',
      };
    default:
      return {
        backgroundColor: COLOR_SYSTEM.backgrounds.gray,
        textColor: COLOR_SYSTEM.texts.onDark,
        badgeColor: COLOR_SYSTEM.accents.darkBadge,
        badgeTextColor: COLOR_SYSTEM.backgrounds.gray,
        detailColor: '#D1D5DB',
      };
  }
};

// Card de aviso
const NoticeCard: React.FC<{ notice: Notice; onPress: (id: string) => void }> = ({ notice, onPress }) => {
  const colors = getColorStyle(notice.color);
  
  return (
    <TouchableOpacity
      style={[styles.noticeCard, { backgroundColor: colors.backgroundColor }]}
      onPress={() => onPress(notice.id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: colors.badgeColor }]}>
          <Text style={[styles.categoryText, { color: colors.badgeTextColor }]}>
            {notice.category}
          </Text>
        </View>
        <Text style={[styles.cardDate, { color: colors.detailColor }]}>{notice.date}</Text>
      </View>

      <Text style={[styles.cardTitle, { color: colors.textColor }]}>{notice.title}</Text>

      {notice.time && (
        <View style={styles.cardTime}>
          <MaterialCommunityIcons 
            name="clock-outline" 
            size={14} 
            color={colors.detailColor} 
          />
          <Text style={[styles.cardTimeText, { color: colors.detailColor }]}>
            {notice.time}
          </Text>
        </View>
      )}

      <Text style={[styles.cardDescription, { color: colors.textColor }]} numberOfLines={3}>
        {notice.description}
      </Text>

      <View style={{ marginTop: 10 }}>
        <Text style={[styles.readMore, { color: colors.textColor }]}>
          Ver Detalhes →
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Tela principal
export default function AvisosScreen() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  useEffect(() => {
    const unsubscribe = listenToNotices((data) => {
      setNotices(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const openModal = (id: string) => {
    const notice = notices.find((n) => n.id === id);
    if (notice) {
      setSelectedNotice(notice);
      setModalVisible(true);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedNotice(null);
  };

  const windowWidth = Dimensions.get('window').width;
  const numColumns = windowWidth > 900 ? 3 : windowWidth > 600 ? 2 : 1;

  if (loading) {
    return (
      <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLOR_SYSTEM.fightYellow} />
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <Text style={styles.mainTitle}>
          MURAL <Text style={styles.yellowText}>CT IMPERIO</Text>
        </Text>
        <Text style={styles.subtitle}>Fique por dentro dos avisos e eventos.</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.noticesContainer, 
          notices.length === 0 && styles.emptyNoticesContainer,
        ]}
      >
        {notices.length === 0 ? (
          <EmptyNotices />
        ) : (
          <View style={[
            styles.noticesGrid,
            { 
              flexDirection: numColumns === 1 ? 'column' : 'row', 
              flexWrap: numColumns === 1 ? 'nowrap' : 'wrap' 
            }
          ]}>
            {notices.map((notice) => (
              <View
                key={notice.id}
                style={{
                  width: `${100 / numColumns}%`,
                  paddingHorizontal: 8,
                  paddingVertical: 8,
                  maxWidth: numColumns === 1 ? '100%' : 500,
                }}
              >
                <NoticeCard notice={notice} onPress={openModal} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal */}
      <Modal animationType="fade" transparent visible={modalVisible} onRequestClose={closeModal}>
        <TouchableOpacity 
          style={styles.centeredView} 
          activeOpacity={1} 
          onPressOut={closeModal}
        >
          <View style={styles.modalView}>
            {selectedNotice && (
              <>
                <Text style={styles.modalTitle}>{selectedNotice.title}</Text>
                <Text style={styles.modalDescription}>{selectedNotice.description}</Text>
                <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                  <MaterialCommunityIcons name="close" size={24} color="white" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { 
    padding: 16, 
    borderBottomWidth: 4, 
    borderBottomColor: COLOR_SYSTEM.fightYellow 
  },
  mainTitle: { 
    fontSize: 36, 
    fontWeight: '900', 
    color: 'white', 
    textAlign: 'center' 
  },
  yellowText: { 
    color: COLOR_SYSTEM.fightYellow 
  },
  subtitle: { 
    color: COLOR_SYSTEM.gray400, 
    textAlign: 'center', 
    marginTop: 4 
  },
  noticesContainer: { 
    paddingHorizontal: 8, 
    paddingBottom: 20,
    flexGrow: 1,
  },
  noticesGrid: {
    width: '100%',
  },
  emptyNoticesContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingVertical: 40,
  },
  noticeCard: { 
    padding: 24, 
    borderRadius: 8,
    minHeight: 200,
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  categoryBadge: { 
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: { 
    fontSize: 10, 
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  cardDate: { 
    fontSize: 13, 
    fontWeight: '600' 
  },
  cardTitle: { 
    fontSize: 20, 
    fontWeight: '800', 
    marginBottom: 8,
    lineHeight: 24,
  },
  cardTime: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12,
    gap: 4,
  },
  cardTimeText: { 
    fontSize: 13, 
    fontWeight: '500' 
  },
  cardDescription: { 
    fontSize: 14,
    lineHeight: 20,
  },
  readMore: {
    fontSize: 12, 
    fontWeight: 'bold', 
    textTransform: 'uppercase',
  },
  centeredView: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.8)' 
  },
  modalView: { 
    backgroundColor: COLOR_SYSTEM.arenaBlack, 
    borderWidth: 2, 
    borderColor: COLOR_SYSTEM.fightYellow, 
    borderRadius: 8, 
    padding: 24, 
    margin: 20,
    maxWidth: 500,
    width: '90%',
  },
  modalTitle: { 
    fontSize: 24, 
    color: 'white', 
    fontWeight: 'bold', 
    marginBottom: 16 
  },
  modalDescription: { 
    color: COLOR_SYSTEM.gray300,
    fontSize: 16,
    lineHeight: 24,
  },
  closeButton: { 
    position: 'absolute', 
    top: 16, 
    right: 16 
  },
  // Estilos para o estado vazio
  emptyContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingHorizontal: 20,
  },
  emptyTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: COLOR_SYSTEM.gray300, 
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: { 
    fontSize: 16, 
    color: COLOR_SYSTEM.gray400, 
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
});