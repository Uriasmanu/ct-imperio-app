import { CarouselSection } from "@/components/CarouselSection";
import { useClassSchedule } from "@/hooks/useClassSchedule";
import { getOnboardingDone } from "@/storage/onboarding";
import { globalStyles } from "@/styles/globalStyles";
import { inicioTheme } from "@/styles/theme";
import { carouselImages } from "@/utils/constants";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Clock, User } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
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
} from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
export default function IndexScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / (screenWidth - 40));
    setActiveIndex(currentIndex);
  };

  const {
    currentClasses,
    nextClass,
    progressMap,
    getClassId,
    getGradientColor,
  } = useClassSchedule();

  useEffect(() => {
    const checkOnboarding = async () => {
      const onboardingDone = await getOnboardingDone();

      if (!onboardingDone) {
        router.replace("/onboardingScreen");
      }
    };

    checkOnboarding();
  }, []);

  const openWhatsApp = () => {
    const phoneNumber = "5514997856670";
    const message = "Olá! Gostaria de agendar uma aula experimental.";
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

    Linking.openURL(url).catch(() => {
      alert("WhatsApp não instalado. Entre em contato pelo telefone.");
    });
    setShowModal(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: inicioTheme.colors.background }}>
      <ScrollView
        style={globalStyles.container}
        contentContainerStyle={styles.container}
      >
        <Image
          source={require("@/assets/images/banner.jpeg")}
          style={styles.banner}
          resizeMode="cover"
        />

        <View style={styles.content}>
          <Text style={styles.title}>Nossa História</Text>
          <Text style={styles.paragraph}>
            Desde 2015, ajudamos pessoas a saírem do sedentarismo, cuidarem da
            saúde e evoluírem no esporte.
          </Text>
          <Text style={styles.paragraph}>
            Referência no interior paulista com trabalho dedicado a crianças e
            adultos.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Agende sua Aula Experimental</Text>
            <AntDesign
              name="arrow-right"
              size={16}
              color={inicioTheme.colors.text.dark}
              style={styles.buttonIcon}
            />
          </TouchableOpacity>
        </View>

        <CarouselSection images={carouselImages} />

        <View style={styles.professorContainer}>
          <Image
            source={require("@/assets/images/will.jpg")}
            style={styles.professorImage}
            resizeMode="cover"
          />
          <View style={styles.professorInfo}>
            <Text style={styles.professorName}>Mestre Will</Text>
            <Text style={styles.professorRole}>Proprietário e Mestre</Text>
          </View>
        </View>

        <View style={styles.scheduleSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Aulas de Hoje</Text>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => router.push("/aulasScreen")}
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
                  onPress={() => router.push("/aulasScreen")}
                  style={[
                    styles.currentClassContainer,
                    {
                      backgroundColor: getGradientColor(
                        progressMap[classItem.title] || 0,
                      ),
                    },
                  ]}
                >
                  <View style={styles.progressBarBackground}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${progressMap[classItem.title] || 0}%` },
                      ]}
                    />
                  </View>

                  <View>
                    <Text style={styles.currentClassText}>
                      {classItem.title}
                    </Text>
                    <View style={styles.classDetails}>
                      <View style={styles.detailItem}>
                        <Clock size={16} color="#FFFFFF" />
                        <Text style={styles.detailText}>
                          {classItem.startTime} - {classItem.endTime}
                        </Text>
                      </View>
                      <View style={styles.detailItem}>
                        <User size={16} color="#FFFFFF" />
                        <Text style={styles.detailText}>
                          {classItem.instructor}
                        </Text>
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
                {nextClass ? "Próxima Aula" : "Sem Aulas Hoje"}
              </Text>
              <Text style={styles.noClassText}>
                {nextClass
                  ? `${nextClass.title} às ${nextClass.startTime}`
                  : "Aproveite para descansar!"}
              </Text>
              <TouchableOpacity
                style={styles.scheduleButton}
                onPress={() => router.push("/aulasScreen")}
              >
                <Text style={styles.scheduleButtonText}>
                  Ver Grade Completa
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
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
                <AntDesign
                  name="close"
                  size={20}
                  color={inicioTheme.colors.text.muted}
                />
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
  container: {
    paddingBottom: 40,
  },
  banner: {
    width: "100%",
    height: 200,
  },
  content: {
    padding: inicioTheme.spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: inicioTheme.colors.text.primary,
    marginBottom: inicioTheme.spacing.md,
  },
  paragraph: {
    fontSize: 15,
    color: inicioTheme.colors.text.secondary,
    lineHeight: 22,
    marginBottom: inicioTheme.spacing.md,
  },
  button: {
    backgroundColor: inicioTheme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: inicioTheme.spacing.md,
    paddingHorizontal: inicioTheme.spacing.lg,
    borderRadius: 12,
    marginTop: inicioTheme.spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: inicioTheme.colors.background,
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: inicioTheme.spacing.lg,
    marginBottom: inicioTheme.spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: inicioTheme.colors.text.primary,
  },
  seeAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
  },
  seeAllText: {
    color: inicioTheme.colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  professorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: inicioTheme.spacing.lg,
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: inicioTheme.spacing.lg,
  },
  professorImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  professorInfo: {
    flex: 1,
    marginLeft: inicioTheme.spacing.md,
  },
  professorName: {
    fontSize: 18,
    fontWeight: "bold",
    color: inicioTheme.colors.text.primary,
    marginBottom: 4,
  },
  professorRole: {
    fontSize: 13,
    color: inicioTheme.colors.text.muted,
    marginBottom: 8,
  },
  professorStats: {
    flexDirection: "row",
    gap: inicioTheme.spacing.md,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: inicioTheme.colors.text.muted,
  },
  scheduleSection: {
    marginBottom: inicioTheme.spacing.lg,
  },
  currentClassesContainer: {
    paddingHorizontal: inicioTheme.spacing.lg,
  },
  currentClassesTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: inicioTheme.colors.text.primary,
    marginBottom: inicioTheme.spacing.md,
    textAlign: "center",
  },
  currentClassContainer: {
    padding: inicioTheme.spacing.lg,
    borderRadius: 16,
    marginBottom: inicioTheme.spacing.md,
    minHeight: 120,
    justifyContent: "space-between",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.3)",
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 3,
    marginBottom: inicioTheme.spacing.md,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: inicioTheme.colors.primary,
    borderRadius: 3,
  },

  currentClassText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: inicioTheme.spacing.md,
  },
  classDetails: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  noClassContainer: {
    backgroundColor: inicioTheme.colors.card,
    padding: inicioTheme.spacing.lg,
    borderRadius: 16,
    marginHorizontal: inicioTheme.spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderStyle: "dashed",
  },
  noClassEmoji: {
    fontSize: 32,
    marginBottom: inicioTheme.spacing.md,
  },
  noClassTitle: {
    fontSize: 18,
    color: inicioTheme.colors.text.primary,
    fontWeight: "bold",
    marginBottom: inicioTheme.spacing.sm,
    textAlign: "center",
  },
  noClassText: {
    fontSize: 14,
    color: inicioTheme.colors.text.secondary,
    textAlign: "center",
    marginBottom: inicioTheme.spacing.lg,
  },
  scheduleButton: {
    backgroundColor: inicioTheme.colors.primary,
    paddingHorizontal: inicioTheme.spacing.lg,
    paddingVertical: inicioTheme.spacing.md,
    borderRadius: 12,
  },
  scheduleButtonText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: inicioTheme.spacing.lg,
  },
  modalBox: {
    backgroundColor: inicioTheme.colors.card,
    padding: inicioTheme.spacing.xl,
    borderRadius: inicioTheme.borderRadius.md,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: inicioTheme.colors.border,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: inicioTheme.spacing.lg,
  },
  modalTitle: {
    color: inicioTheme.colors.text.primary,
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
  },
  modalClose: {
    padding: inicioTheme.spacing.xs,
  },
  modalDesc: {
    color: inicioTheme.colors.text.body,
    marginBottom: inicioTheme.spacing.xl,
    lineHeight: 22,
    fontSize: inicioTheme.typography.caption,
  },
  modalButtons: {
    gap: inicioTheme.spacing.md,
  },
  modalButton: {
    paddingVertical: inicioTheme.spacing.lg,
    paddingHorizontal: inicioTheme.spacing.lg,
    borderRadius: inicioTheme.borderRadius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: inicioTheme.spacing.sm,
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
    borderColor: inicioTheme.colors.border,
  },
  whatsappText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: inicioTheme.typography.body,
  },
  phoneText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: inicioTheme.typography.body,
  },
  closeText: {
    color: inicioTheme.colors.text.body,
    fontWeight: "600",
    fontSize: inicioTheme.typography.body,
  },
});
