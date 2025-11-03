import { classSchedule, ClassSchedule } from '@/data/classSchedule';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Clock, User } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Linking,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Sistema de tema
const theme = {
  colors: {
    primary: '#FFD700',
    secondary: '#3B82F6',
    background: '#000000',
    card: '#1A1A1A',
    text: {
      primary: '#FFFFFF',
      secondary: '#E5E5E5',
      muted: '#888888',
      dark: '#000000',
      body: "#ddd",
    },
    border: "#333",
    success: "#4CAF50"
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32
  },
  typography: {
    title: 36,
    subtitle: 18,
    body: 16,
    caption: 14,
    small: 12
  },
  borderRadius: {
    sm: 6,
    md: 12,
    lg: 25
  }
};

export default function IndexScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentClasses, setCurrentClasses] = useState<ClassSchedule[]>([]);
  const [nextClass, setNextClass] = useState<ClassSchedule | null>(null);
  const [progressMap, setProgressMap] = useState<{ [key: string]: number }>({});
  const [showModal, setShowModal] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  const carouselImages = [
    require('@/assets/images/Muay.jpeg'),
    require('@/assets/images/boxe.jpeg'),
    require('@/assets/images/jiu-feminino.jpeg'),
    require('@/assets/images/jiu-misto.jpeg'),
    require('@/assets/images/no-gi.jpeg'),
  ];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / (screenWidth - 40));
    setActiveIndex(currentIndex);
  };

  const openWhatsApp = () => {
    const phoneNumber = "5514997856670";
    const message = "Olá! Gostaria de agendar uma aula experimental.";
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

    Linking.openURL(url).catch(() => {
      alert("WhatsApp não instalado. Entre em contato pelo telefone.");
    });
    setShowModal(false);
  };

  const timeToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const getTodayDay = (): string => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[new Date().getDay()];
  };

  // PERFORMANCE: Atualização otimizada
  const calculateClasses = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    const currentTimeInMinutes = currentHour * 60 + currentMinute + currentSecond / 60;

    const today = getTodayDay();

    const todayClasses = classSchedule
      .filter(classItem => classItem.days.includes(today))
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

    const foundCurrentClasses: ClassSchedule[] = [];
    const newProgressMap: { [key: string]: number } = {};
    let foundNextClass: ClassSchedule | null = null;

    todayClasses.forEach(classItem => {
      const startTimeInMinutes = timeToMinutes(classItem.startTime);
      const endTimeInMinutes = timeToMinutes(classItem.endTime);

      if (currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes) {
        foundCurrentClasses.push(classItem);
        const totalDuration = endTimeInMinutes - startTimeInMinutes;
        const elapsedTime = currentTimeInMinutes - startTimeInMinutes;
        const progress = (elapsedTime / totalDuration) * 100;
        newProgressMap[classItem.title] = Math.min(Math.max(progress, 0), 100);
      }
    });

    if (foundCurrentClasses.length === 0) {
      foundNextClass = todayClasses.find(classItem => {
        const classStartTime = timeToMinutes(classItem.startTime);
        return currentTimeInMinutes < classStartTime;
      }) || null;
    }

    setCurrentClasses(foundCurrentClasses);
    setNextClass(foundNextClass);
    setProgressMap(newProgressMap);
  };

  // FUNÇÃO MODIFICADA: Azul Escuro com Gradiente Elegante
  const getGradientColor = (progress: number): string => {
    const baseBlue = 150;
    const additionalBlue = Math.floor((progress / 100) * 105);
    const blueValue = baseBlue + additionalBlue;
    return `rgb(30, 70, ${blueValue})`;
  };

  const getClassId = (classItem: ClassSchedule): string => {
    return `${classItem.title}-${classItem.startTime}-${classItem.endTime}`;
  };

  useEffect(() => {
    calculateClasses();

    // Atualizar a cada segundo para progresso suave
    const interval = setInterval(calculateClasses, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.container}>
        {/* Banner Principal */}
        <Image
          source={require('@/assets/images/banner.jpeg')}
          style={styles.banner}
          resizeMode="cover"
        />

        {/* Conteúdo de texto COM BOTÃO - OPÇÃO 1 */}
        <View style={styles.content}>
          <Text style={styles.title}>Nossa História</Text>
          <Text style={styles.paragraph}>
            Desde 2015, ajudamos pessoas a saírem do sedentarismo, cuidarem da saúde e evoluírem no esporte.
          </Text>
          <Text style={styles.paragraph}>
            Referência no interior paulista com trabalho dedicado a crianças e adultos.
          </Text>

          {/* BOTÃO AGENDE SUA AULA EXPERIMENTAL - POSIÇÃO ESTRATÉGICA */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Agende sua Aula Experimental</Text>
            <AntDesign name="arrow-right" size={16} color={theme.colors.text.dark} style={styles.buttonIcon} />
          </TouchableOpacity>
        </View>

        {/* Carrossel com Indicadores Dinâmicos */}
        <View style={styles.carouselSection}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.carousel}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {carouselImages.map((image, index) => (
              <View key={index} style={styles.carouselItem}>
                <Image
                  source={image}
                  style={styles.carouselImage}
                  resizeMode='cover'
                />
              </View>
            ))}
          </ScrollView>

          <View style={styles.indicators}>
            {carouselImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === activeIndex && styles.indicatorActive
                ]}
              />
            ))}
          </View>
        </View>

        {/* Professor */}
        <View style={styles.professorContainer}>
          <Image
            source={require('@/assets/images/will.jpg')}
            style={styles.professorImage}
            resizeMode="cover"
          />
          <View style={styles.professorInfo}>
            <Text style={styles.professorName}>Mestre Will</Text>
            <Text style={styles.professorRole}>Proprietário e Mestre</Text>
          </View>
        </View>

        {/* Aulas em Andamento */}
        <View style={styles.scheduleSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Aulas de Hoje</Text>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => router.push('/AulasScreen')}
            >
              <Text style={styles.seeAllText}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          {currentClasses.length > 0 ? (
            <View style={styles.currentClassesContainer}>
              <Text style={styles.currentClassesTitle}>
                Aulas em andamento ({currentClasses.length})
              </Text>
              {currentClasses.map((classItem) => (
                <TouchableOpacity
                  key={getClassId(classItem)}
                  activeOpacity={0.8}
                  onPress={() => router.push('/AulasScreen')}
                  style={[
                    styles.currentClassContainer,
                    { backgroundColor: getGradientColor(progressMap[classItem.title] || 0) }
                  ]}
                >
                  <View style={styles.progressBarBackground}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${progressMap[classItem.title] || 0}%` }
                      ]}
                    />
                  </View>

                  <View style={styles.classInfo}>
                    <Text style={styles.currentClassText}>{classItem.title}</Text>
                    <View style={styles.classDetails}>
                      <View style={styles.detailItem}>
                        <Clock size={16} color="#FFFFFF" />
                        <Text style={styles.detailText}>
                          {classItem.startTime} - {classItem.endTime}
                        </Text>
                      </View>
                      <View style={styles.detailItem}>
                        <User size={16} color="#FFFFFF" />
                        <Text style={styles.detailText}>{classItem.instructor}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.noClassContainer}>
              <Text style={styles.noClassEmoji}>⏰</Text>
              <Text style={styles.noClassTitle}>
                {nextClass ? 'Próxima Aula' : 'Sem Aulas Hoje'}
              </Text>
              <Text style={styles.noClassText}>
                {nextClass
                  ? `${nextClass.title} às ${nextClass.startTime}`
                  : 'Aproveite para descansar!'
                }
              </Text>
              <TouchableOpacity
                style={styles.scheduleButton}
                onPress={() => router.push('/AulasScreen')}
              >
                <Text style={styles.scheduleButtonText}>Ver Grade Completa</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>{/* Modal de Agendamento */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agendar Aula Experimental</Text>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setShowModal(false)}
              >
                <AntDesign name="close" size={20} color={theme.colors.text.muted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDesc}>
              Entre em contato pelo WhatsApp para agendar sua aula experimental.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.whatsappButton]}
                onPress={openWhatsApp}
                activeOpacity={0.8}
              >
                <AntDesign name="whats-app" size={20} color="#FFF" />
                <Text style={styles.whatsappText}>Abrir WhatsApp</Text>
              </TouchableOpacity>


              <TouchableOpacity
                style={[styles.modalButton, styles.closeButton]}
                onPress={() => setShowModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.closeText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    paddingBottom: 40,
  },
  banner: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  paragraph: {
    fontSize: 15,
    color: theme.colors.text.secondary,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  // ESTILOS DO BOTÃO
  button: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 12,
    marginTop: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  carouselSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  seeAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  seeAllText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  carousel: {
    marginBottom: theme.spacing.md,
  },
  carouselItem: {
    width: screenWidth - 40,
    marginHorizontal: 20,
    position: 'relative',
  },
  carouselImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.text.muted,
  },
  indicatorActive: {
    backgroundColor: theme.colors.primary,
    width: 20,
  },
  professorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: theme.spacing.lg,
  },
  professorImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  professorInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  professorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  professorRole: {
    fontSize: 13,
    color: theme.colors.text.muted,
    marginBottom: 8,
  },
  professorStats: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: theme.colors.text.muted,
  },
  scheduleSection: {
    marginBottom: theme.spacing.lg,
  },
  currentClassesContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  currentClassesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  currentClassContainer: {
    padding: theme.spacing.lg,
    borderRadius: 16,
    marginBottom: theme.spacing.md,
    minHeight: 120,
    justifyContent: 'space-between',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  classInfo: {
    // Espaço para informações
  },
  currentClassText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  classDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  noClassContainer: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: 16,
    marginHorizontal: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'dashed',
  },
  noClassEmoji: {
    fontSize: 32,
    marginBottom: theme.spacing.md,
  },
  noClassTitle: {
    fontSize: 18,
    color: theme.colors.text.primary,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  noClassText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  scheduleButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: 12,
  },
  scheduleButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.lg,
  },
  modalBox: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    color: theme.colors.text.primary,
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
  },
  modalClose: {
    padding: theme.spacing.xs,
  },
  modalDesc: {
    color: theme.colors.text.body,
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
    fontSize: theme.typography.caption,
  },
  modalButtons: {
    gap: theme.spacing.md,
  },
  modalButton: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
  },
  whatsappButton: {
    backgroundColor: "#25D366",
  },
  phoneButton: {
    backgroundColor: "#34B7F1",
  },
  closeButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  whatsappText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: theme.typography.body,
  },
  phoneText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: theme.typography.body,
  },
  closeText: {
    color: theme.colors.text.body,
    fontWeight: "600",
    fontSize: theme.typography.body,
  },
});