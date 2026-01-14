import { globalStyles } from "@/styles/globalStyles";
import { faqItems } from "@/utils/constants";
import { AntDesign } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

// Sistema de tema unificado
const theme = {
  colors: {
    primary: "#D4AF37",
    primaryLight: "#E0C96D",
    background: "#000",
    card: "#2B2B2B",
    cardActive: "#3A3A3A",
    text: {
      primary: "#D4AF37",
      secondary: "#E0C96D",
      body: "#ddd",
      muted: "#ccc",
      dark: "#1C1C1C"
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

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');


export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaq = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleAccordion = (index: number) => {
    if (activeIndex === index) {
      // Fechar accordion com animação
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setActiveIndex(null);
      });
    } else {
      setActiveIndex(index);
      // Abrir accordion com animação
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
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

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true }
  );

  // Efeito de parallax para o header
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const headerScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.98],
    extrapolate: 'clamp',
  });

  return (
    <View style={globalStyles.container}>
      {/* Header com efeito de parallax */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerOpacity,
            transform: [{ scale: headerScale }]
          }
        ]}
      >
        <Text style={styles.title}>FAQ</Text>
        <Text style={styles.subtitle}>Academia | Perguntas Frequentes</Text>
        <Text style={styles.desc}>
          Encontre respostas rápidas sobre treinos, horários e mensalidades.
        </Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Digite sua dúvida..."
          placeholderTextColor={theme.colors.text.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </Animated.View>

      {/* Lista de FAQs */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
      >
        <View style={styles.faqContainer}>
          {filteredFaq.length > 0 ? (
            filteredFaq.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.item,
                  activeIndex === index && styles.itemActive
                ]}
              >
                <TouchableOpacity
                  style={styles.questionContainer}
                  onPress={() => toggleAccordion(index)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.questionText}>{item.question}</Text>
                  <Animated.View
                    style={{
                      transform: [
                        { rotate: activeIndex === index ? "0deg" : "180deg" }
                      ]
                    }}
                  >
                    <AntDesign
                      name="up"
                      size={18}
                      color={theme.colors.primary}
                      style={styles.icon}
                    />
                  </Animated.View>
                </TouchableOpacity>

                {activeIndex === index && (
                  <Animated.View
                    style={[
                      styles.answerContainer,
                      {
                        opacity: fadeAnim,
                        transform: [
                          {
                            translateY: fadeAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-10, 0],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <Text style={styles.answer}>{item.answer}</Text>
                  </Animated.View>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.noResults}>Nenhum resultado encontrado 😕</Text>
          )}
        </View>

        {/* Footer com CTA */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Ainda tem dúvidas?</Text>
          <Text style={styles.footerText}>
            Nossa equipe está pronta para te ajudar a começar sua jornada no martial arts
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Agende sua Aula Experimental</Text>
            <AntDesign name="arrow-right" size={16} color={theme.colors.text.dark} style={styles.buttonIcon} />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>

      {/* Modal de Agendamento */}
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: theme.spacing.xl * 2,
  },
  header: {
    alignItems: "center",
    paddingTop: screenHeight * 0.00,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: theme.typography.title,
    fontWeight: "800",
    color: theme.colors.text.primary,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: theme.typography.subtitle,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
    textAlign: "center",
    fontWeight: "600",
  },
  desc: {
    color: theme.colors.text.muted,
    textAlign: "center",
    marginTop: theme.spacing.md,
    lineHeight: 20,
    fontSize: theme.typography.caption,
    maxWidth: 400,
  },
  faqContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  item: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "transparent",
  },
  itemActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.cardActive,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  questionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  questionText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.body,
    fontWeight: "600",
    flex: 1,
    paddingRight: theme.spacing.md,
    lineHeight: 22,
  },
  icon: {
    marginLeft: theme.spacing.sm,
  },
  answerContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  answer: {
    color: theme.colors.text.body,
    lineHeight: 22,
    fontSize: theme.typography.caption,
    textAlign: "justify",
  },
  footer: {
    alignItems: "center",
    marginTop: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  footerTitle: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.body,
    fontWeight: "700",
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  footerText: {
    color: theme.colors.text.muted,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
    fontSize: theme.typography.caption,
    lineHeight: 20,
    maxWidth: 400,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 250,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: theme.colors.text.dark,
    fontWeight: "700",
    fontSize: theme.typography.body,
    textAlign: "center",
  },
  buttonIcon: {
    marginLeft: theme.spacing.sm,
  },
  bottomSpacer: {
    height: screenHeight * 0.1,
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
  searchInput: {
    backgroundColor: theme.colors.cardActive,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.text.body,
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontSize: theme.typography.body,
    width: "100%",
    maxWidth: 400,
  },
  noResults: {
  textAlign: "center",
  color: theme.colors.text.muted,
  marginTop: theme.spacing.xl,
  fontSize: theme.typography.caption,
},
});