import { MaterialCommunityIcons } from '@expo/vector-icons'; // Recommended icon library for Expo
import React, { useState } from 'react';
import {
  Dimensions,
  Modal, // Import Modal for the popup
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Define your custom colors from the Tailwind config
const COLORS = {
  arenaBlack: '#1a1a1a',
  fightYellow: '#FFD700',
  punchRed: '#E30000',
  gray700: '#374151',
  gray800: '#1f2937',
  gray400: '#9ca3af',
  gray300: '#d1d5db',
};

// Define the shape of a Notice object for TypeScript
interface Notice {
  id: number;
  title: string;
  category: 'Evento' | 'Comunicado' | 'Urgente' | 'Novidade';
  date: string;
  time: string;
  description: string;
  color: 'bg-fight-yellow' | 'bg-gray-700' | 'bg-punch-red' | 'bg-green-500'; // Simplified color map
  iconName: keyof typeof MaterialCommunityIcons.glyphMap; // Use a specific icon name from the library
}

// Data directly from the HTML/JS, converted to the Notice interface
const noticesData: Notice[] = [
  {
    id: 1,
    title: 'CAMPEONATO INTERNO',
    category: 'Evento',
    date: '30/11/2025',
    time: '09:00h',
    description:
      'Prepare seu kimono e suas luvas! O torneio interno de Jiu-Jitsu será no próximo sábado. Inscrições abertas até quinta-feira na recepção. Categorias: Leve, Médio e Pesado. Premiação para os três primeiros!',
    color: 'bg-fight-yellow',
    iconName: 'clock-outline', // Equivalent to the Clock icon
  },
  {
    id: 2,
    title: 'REAJUSTE DE MENSALIDADES',
    category: 'Comunicado',
    date: '01/12/2025',
    time: 'Todo o dia',
    description:
      'Informamos que a partir de 01/12/2025 haverá um pequeno reajuste anual de 5% nas mensalidades. Agradecemos a compreensão e o apoio contínuo para manter a qualidade das nossas instalações e instrutores.',
    color: 'bg-gray-700',
    iconName: 'credit-card-outline', // Equivalent to the Credit Card icon
  }
];

// Helper function to map the simplified color string to a specific hex color
const getColorStyle = (color: Notice['color']) => {
  switch (color) {
    case 'bg-fight-yellow':
      return { backgroundColor: COLORS.fightYellow, textColor: COLORS.arenaBlack };
    case 'bg-gray-700':
      return { backgroundColor: COLORS.gray700, textColor: 'white' };
    case 'bg-punch-red':
      return { backgroundColor: COLORS.punchRed, textColor: 'white' };
    case 'bg-green-500':
      return { backgroundColor: '#10B981', textColor: 'white' }; // Green-500 approximation
    default:
      return { backgroundColor: COLORS.gray800, textColor: 'white' };
  }
};

// Component for a single Notice Card
const NoticeCard: React.FC<{ notice: Notice; onPress: (id: number) => void }> = ({
  notice,
  onPress,
}) => {
  const { backgroundColor, textColor } = getColorStyle(notice.color);

  // Dynamic text color for details/title based on card background
  const detailColor = notice.color === 'bg-fight-yellow' ? '#6B7280' : COLORS.gray400; // Gray-700 or Gray-400
  const titleColor = notice.color === 'bg-fight-yellow' ? COLORS.arenaBlack : COLORS.fightYellow;
  const categoryBgColor = notice.color === 'bg-fight-yellow' ? COLORS.arenaBlack : COLORS.fightYellow;
  const categoryTextColor = notice.color === 'bg-fight-yellow' ? COLORS.fightYellow : COLORS.arenaBlack;
  const descColor = notice.color === 'bg-fight-yellow' ? '#6B7280' : COLORS.gray300;


  return (
    <TouchableOpacity
      style={[styles.noticeCard, { backgroundColor: backgroundColor }]}
      onPress={() => onPress(notice.id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.categoryBadge, { backgroundColor: categoryBgColor, color: categoryTextColor }]}>
          {notice.category}
        </Text>
        <Text style={{ fontSize: 13, color: detailColor, fontWeight: '600' }}>
          {notice.date}
        </Text>
      </View>

      <Text style={[styles.cardTitle, { color: titleColor }]}>
        {notice.title}
      </Text>

      <View style={styles.cardTime}>
        <MaterialCommunityIcons
          name={notice.iconName}
          size={18}
          color={detailColor}
        />
        <Text style={{ fontSize: 13, color: detailColor, fontWeight: '500', marginLeft: 6 }}>
          {notice.time}
        </Text>
      </View>

      <Text style={[styles.cardDescription, { color: descColor }]} numberOfLines={3}>
        {notice.description}
      </Text>

      <View style={{ marginTop: 10 }}>
        <Text style={{ fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', color: titleColor }}>
          Ver Detalhes &rarr;
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Main Screen Component
const AvisosScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  const openModal = (id: number) => {
    const notice = noticesData.find(n => n.id === id);
    if (notice) {
      setSelectedNotice(notice);
      setModalVisible(true);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedNotice(null);
  };

  // Determine the number of columns based on the screen width
  const windowWidth = Dimensions.get('window').width;
  const numColumns = windowWidth > 900 ? 3 : windowWidth > 600 ? 2 : 1;

  // The Modal content component
  const ModalContent = () => {
    if (!selectedNotice) return null;

    const { category, title, date, time, description, iconName, color } = selectedNotice;
    const categoryBgColor = color === 'bg-fight-yellow' ? COLORS.arenaBlack : COLORS.fightYellow;
    const categoryTextColor = color === 'bg-fight-yellow' ? COLORS.fightYellow : COLORS.arenaBlack;

    return (
      <View style={styles.modalContentContainer}>
        <Text style={[styles.categoryBadge, { backgroundColor: categoryBgColor, color: categoryTextColor }]}>
          {category}
        </Text>
        <Text style={styles.modalTitle}>{title}</Text>
        <View style={styles.modalTimeInfo}>
          <MaterialCommunityIcons
            name={iconName}
            size={20}
            color={COLORS.fightYellow}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.modalDetailText}>Data: {date}</Text>
          <Text style={[styles.modalDetailText, { marginLeft: 16 }]}>Hora: {time}</Text>
        </View>
        <View style={styles.descriptionPill}>
          <Text style={styles.modalDescription}>{description}</Text>
        </View>
        <Text style={styles.modalFooterText}>
          Para mais informações, procure a recepção da academia.
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.mainTitle}>
          MURAL <Text style={styles.yellowText}>CT IMPERIO</Text>
        </Text>
        <Text style={styles.subtitle}>
          Fique por dentro dos avisos e eventos.
        </Text>
      </View>

      {/* Notices Section */}
      <ScrollView
        contentContainerStyle={[
          styles.noticesContainer,
          { flexDirection: 'row', flexWrap: 'wrap' }, // Allows wrapping for grid layout
        ]}
      >
        {noticesData.map(notice => (
          <View
            key={notice.id}
            style={{
              width: `${100 / numColumns}%`, // Distribute width dynamically
              paddingHorizontal: 8, // Gap equivalent
              paddingVertical: 8,
              maxWidth: numColumns === 1 ? '100%' : 500, // Max width for larger screens
              alignSelf: 'center', // Center cards horizontally
            }}
          >
            <NoticeCard notice={notice} onPress={openModal} />
          </View>
        ))}
      </ScrollView>

      {/* Modal - Use a proper Modal component for React Native */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <TouchableOpacity
          style={styles.centeredView}
          activeOpacity={1}
          onPressOut={closeModal} // Closes modal when tapping outside
        >
          <View style={styles.modalView}>
            {/* Stops touch events from propagating to the container and closing the modal */}
            <TouchableOpacity activeOpacity={1} onPress={() => { /* Do nothing */ }}>
                <ModalContent />
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeModal}
                >
                  <MaterialCommunityIcons name="close" size={24} color="white" />
                </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// Styles using React Native StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.arenaBlack,
  },
  
  // --- Header Styles ---
  header: {
    padding: 16,
    marginBottom: 20,
    borderBottomWidth: 4,
    borderBottomColor: COLORS.fightYellow,
    // RN does not have border-radius-bottom, so we use a general one
    borderBottomEndRadius: 8,
    borderBottomStartRadius: 8,
  },
  mainTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: 'white',
    textAlign: 'center',
    letterSpacing: -1,
    textTransform: 'uppercase',
  },
  yellowText: {
    color: COLORS.fightYellow,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 16,
    color: COLORS.gray400,
    textAlign: 'center',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  
  // --- Notices Section Styles ---
  noticesContainer: {
    paddingHorizontal: 8,
    paddingBottom: 20,
    // Add maxHeight for web/Expo Go on web to mimic the scrollable-content style
    // The ScrollView component inherently handles the scrolling on mobile.
    maxHeight: Platform.OS === 'web' ? 500 : undefined,
  },
  
  // --- Notice Card Styles ---
  noticeCard: {
    padding: 24,
    borderRadius: 8,
    minHeight: 180,
    // Adding a subtle shadow for depth on mobile
    shadowColor: COLORS.fightYellow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3, // For Android
    // The hover effects from the CSS are not directly possible in RN without extra libraries.
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    paddingVertical: 3,
    paddingHorizontal: 12,
    borderRadius: 9999, // full rounded
    overflow: 'hidden', // Required for borderRadius on Text
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
    lineHeight: 24,
  },
  cardTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
  },

  // --- Modal Styles ---
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Dark overlay with backdrop-blur-sm approximation
    padding: 16,
  },
  modalView: {
    // Mimics the 'bg-arena-black border-4 border-fight-yellow rounded-xl' styles
    backgroundColor: COLORS.arenaBlack,
    borderRadius: 12,
    borderWidth: 4,
    borderColor: COLORS.fightYellow,
    width: '100%',
    maxWidth: 500,
    shadowColor: COLORS.fightYellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 20,
    padding: 32,
    position: 'relative',
  },
  modalContentContainer: {
    // Container to hold the content
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 5,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginTop: 12,
    marginBottom: 16,
    lineHeight: 32,
  },
  modalTimeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalDetailText: {
    fontSize: 14,
    color: COLORS.gray400,
    fontWeight: '500',
  },
  descriptionPill: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.fightYellow,
    paddingLeft: 16,
    paddingTop: 4,
  },
  modalDescription: {
    fontSize: 16,
    color: COLORS.gray300,
    lineHeight: 24,
  },
  modalFooterText: {
    marginTop: 24,
    fontSize: 12,
    color: COLORS.gray400,
    fontStyle: 'italic',
  },
});

export default AvisosScreen;