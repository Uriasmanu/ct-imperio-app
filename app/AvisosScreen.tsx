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

// Cores
const COLORS = {
  arenaBlack: '#1a1a1a',
  fightYellow: '#FFD700',
  punchRed: '#E30000',
  gray700: '#374151',
  gray800: '#1f2937',
  gray400: '#9ca3af',
  gray300: '#d1d5db',
};

// Função de cor
const getColorStyle = (color: Notice['color']) => {
  switch (color) {
    case 'bg-fight-yellow': return { backgroundColor: COLORS.fightYellow, textColor: COLORS.arenaBlack };
    case 'bg-gray-700': return { backgroundColor: COLORS.gray700, textColor: 'white' };
    case 'bg-punch-red': return { backgroundColor: COLORS.punchRed, textColor: 'white' };
    case 'bg-green-500': return { backgroundColor: '#10B981', textColor: 'white' };
    default: return { backgroundColor: COLORS.gray800, textColor: 'white' };
  }
};

// Componente para quando não há avisos
const EmptyNotices = () => {
  return (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons 
        name="clipboard-text-outline" 
        size={64} 
        color={COLORS.gray400} 
      />
      <Text style={styles.emptyTitle}>Nenhum aviso no momento</Text>
      <Text style={styles.emptySubtitle}>
        Fique atento! Novos avisos e eventos aparecerão aqui.
      </Text>
    </View>
  );
};

// Card de aviso
const NoticeCard: React.FC<{ notice: Notice; onPress: (id: string) => void }> = ({ notice, onPress }) => {
  const { backgroundColor } = getColorStyle(notice.color);
  const detailColor = notice.color === 'bg-fight-yellow' ? '#6B7280' : COLORS.gray400;
  const titleColor = notice.color === 'bg-fight-yellow' ? COLORS.arenaBlack : COLORS.fightYellow;
  const categoryBgColor = notice.color === 'bg-fight-yellow' ? COLORS.arenaBlack : COLORS.fightYellow;
  const categoryTextColor = notice.color === 'bg-fight-yellow' ? COLORS.fightYellow : COLORS.arenaBlack;
  const descColor = notice.color === 'bg-fight-yellow' ? '#6B7280' : COLORS.gray300;

  return (
    <TouchableOpacity
      style={[styles.noticeCard, { backgroundColor }]}
      onPress={() => onPress(notice.id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.categoryBadge, { backgroundColor: categoryBgColor, color: categoryTextColor }]}>{notice.category}</Text>
        <Text style={{ fontSize: 13, color: detailColor, fontWeight: '600' }}>{notice.date}</Text>
      </View>

      <Text style={[styles.cardTitle, { color: titleColor }]}>{notice.title}</Text>

      <View style={styles.cardTime}>
        <Text style={{ fontSize: 13, color: detailColor, fontWeight: '500', marginLeft: 6 }}>{notice.time}</Text>
      </View>

      <Text style={[styles.cardDescription, { color: descColor }]} numberOfLines={3}>
        {notice.description}
      </Text>

      <View style={{ marginTop: 10 }}>
        <Text style={{ fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', color: titleColor }}>
          Ver Detalhes →
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Tela principal
export default function avisosScreen() {
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
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.fightYellow} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
          { flexDirection: notices.length > 0 ? 'row' : 'column', flexWrap: notices.length > 0 ? 'wrap' : 'nowrap' }
        ]}
      >
        {notices.length === 0 ? (
          <EmptyNotices />
        ) : (
          notices.map((notice) => (
            <View
              key={notice.id}
              style={{
                width: `${100 / numColumns}%`,
                paddingHorizontal: 8,
                paddingVertical: 8,
                maxWidth: numColumns === 1 ? '100%' : 500,
                alignSelf: 'center',
              }}
            >
              <NoticeCard notice={notice} onPress={openModal} />
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal */}
      <Modal animationType="fade" transparent visible={modalVisible} onRequestClose={closeModal}>
        <TouchableOpacity style={styles.centeredView} activeOpacity={1} onPressOut={closeModal}>
          <View style={styles.modalView}>
            {selectedNotice && (
              <>
                <Text style={styles.modalTitle}>{selectedNotice.title}</Text>
                <Text style={{ color: COLORS.gray400 }}>{selectedNotice.description}</Text>
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

// ⚙️ Styles (mantém os teus)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.arenaBlack },
  header: { padding: 16, borderBottomWidth: 4, borderBottomColor: COLORS.fightYellow },
  mainTitle: { fontSize: 36, fontWeight: '900', color: 'white', textAlign: 'center' },
  yellowText: { color: COLORS.fightYellow },
  subtitle: { color: COLORS.gray400, textAlign: 'center', marginTop: 4 },
  noticesContainer: { paddingHorizontal: 8, paddingBottom: 20 },
  emptyNoticesContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingVertical: 40,
  },
  noticeCard: { padding: 24, borderRadius: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  categoryBadge: { fontSize: 10, fontWeight: 'bold', padding: 4, borderRadius: 12 },
  cardTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  cardTime: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardDescription: { fontSize: 14 },
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)' },
  modalView: { backgroundColor: COLORS.arenaBlack, borderWidth: 2, borderColor: COLORS.fightYellow, borderRadius: 8, padding: 24, maxWidth: 500 },
  modalTitle: { fontSize: 24, color: 'white', fontWeight: 'bold', marginBottom: 10 },
  closeButton: { position: 'absolute', top: 10, right: 10 },
  // Novos estilos para o estado vazio
  emptyContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingHorizontal: 20,
  },
  emptyTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: COLORS.gray300, 
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: { 
    fontSize: 16, 
    color: COLORS.gray400, 
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
});