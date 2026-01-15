import { globalStyles } from "@/styles/globalStyles";
import { faqTheme } from "@/styles/theme";
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
          placeholderTextColor={faqTheme.colors.text.muted}
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
                      color={faqTheme.colors.primary}
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
            <AntDesign name="arrow-right" size={16} color={faqTheme.colors.text.dark} style={styles.buttonIcon} />
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
                <AntDesign name="close" size={20} color={faqTheme.colors.text.muted} />
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
    paddingBottom: faqTheme.spacing.xl * 2,
  },
  header: {
    alignItems: "center",
    paddingTop: screenHeight * 0.00,
    paddingBottom: faqTheme.spacing.lg,
    paddingHorizontal: faqTheme.spacing.lg,
    backgroundColor: faqTheme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: faqTheme.colors.border,
  },
  title: {
    fontSize: faqTheme.typography.title,
    fontWeight: "800",
    color: faqTheme.colors.text.primary,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: faqTheme.typography.subtitle,
    color: faqTheme.colors.text.secondary,
    marginTop: faqTheme.spacing.sm,
    textAlign: "center",
    fontWeight: "600",
  },
  desc: {
    color: faqTheme.colors.text.muted,
    textAlign: "center",
    marginTop: faqTheme.spacing.md,
    lineHeight: 20,
    fontSize: faqTheme.typography.caption,
    maxWidth: 400,
  },
  faqContainer: {
    paddingHorizontal: faqTheme.spacing.lg,
    marginBottom: faqTheme.spacing.lg,
  },
  item: {
    backgroundColor: faqTheme.colors.card,
    borderRadius: faqTheme.borderRadius.md,
    marginBottom: faqTheme.spacing.sm,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "transparent",
  },
  itemActive: {
    borderColor: faqTheme.colors.primary,
    backgroundColor: faqTheme.colors.cardActive,
    shadowColor: faqTheme.colors.primary,
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
    padding: faqTheme.spacing.lg,
    paddingVertical: faqTheme.spacing.lg,
  },
  questionText: {
    color: faqTheme.colors.text.secondary,
    fontSize: faqTheme.typography.body,
    fontWeight: "600",
    flex: 1,
    paddingRight: faqTheme.spacing.md,
    lineHeight: 22,
  },
  icon: {
    marginLeft: faqTheme.spacing.sm,
  },
  answerContainer: {
    paddingHorizontal: faqTheme.spacing.lg,
    paddingBottom: faqTheme.spacing.lg,
  },
  answer: {
    color: faqTheme.colors.text.body,
    lineHeight: 22,
    fontSize: faqTheme.typography.caption,
    textAlign: "justify",
  },
  footer: {
    alignItems: "center",
    marginTop: faqTheme.spacing.xl,
    paddingTop: faqTheme.spacing.xl,
    paddingHorizontal: faqTheme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: faqTheme.colors.border,
    marginHorizontal: faqTheme.spacing.lg,
    backgroundColor: faqTheme.colors.card,
    borderRadius: faqTheme.borderRadius.md,
    padding: faqTheme.spacing.lg,
    marginBottom: faqTheme.spacing.lg,
  },
  footerTitle: {
    color: faqTheme.colors.text.primary,
    fontSize: faqTheme.typography.body,
    fontWeight: "700",
    marginBottom: faqTheme.spacing.sm,
    textAlign: "center",
  },
  footerText: {
    color: faqTheme.colors.text.muted,
    textAlign: "center",
    marginBottom: faqTheme.spacing.lg,
    fontSize: faqTheme.typography.caption,
    lineHeight: 20,
    maxWidth: 400,
  },
  button: {
    backgroundColor: faqTheme.colors.primary,
    paddingVertical: faqTheme.spacing.lg,
    paddingHorizontal: faqTheme.spacing.xl,
    borderRadius: faqTheme.borderRadius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 250,
    shadowColor: faqTheme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: faqTheme.colors.text.dark,
    fontWeight: "700",
    fontSize: faqTheme.typography.body,
    textAlign: "center",
  },
  buttonIcon: {
    marginLeft: faqTheme.spacing.sm,
  },
  bottomSpacer: {
    height: screenHeight * 0.1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: faqTheme.spacing.lg,
  },
  modalBox: {
    backgroundColor: faqTheme.colors.card,
    padding: faqTheme.spacing.xl,
    borderRadius: faqTheme.borderRadius.md,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: faqTheme.colors.border,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: faqTheme.spacing.lg,
  },
  modalTitle: {
    color: faqTheme.colors.text.primary,
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
  },
  modalClose: {
    padding: faqTheme.spacing.xs,
  },
  modalDesc: {
    color: faqTheme.colors.text.body,
    marginBottom: faqTheme.spacing.xl,
    lineHeight: 22,
    fontSize: faqTheme.typography.caption,
  },
  modalButtons: {
    gap: faqTheme.spacing.md,
  },
  modalButton: {
    paddingVertical: faqTheme.spacing.lg,
    paddingHorizontal: faqTheme.spacing.lg,
    borderRadius: faqTheme.borderRadius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: faqTheme.spacing.sm,
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
    borderColor: faqTheme.colors.border,
  },
  whatsappText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: faqTheme.typography.body,
  },
  phoneText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: faqTheme.typography.body,
  },
  closeText: {
    color: faqTheme.colors.text.body,
    fontWeight: "600",
    fontSize: faqTheme.typography.body,
  },
  searchInput: {
    backgroundColor: faqTheme.colors.cardActive,
    borderRadius: faqTheme.borderRadius.md,
    paddingVertical: faqTheme.spacing.sm,
    paddingHorizontal: faqTheme.spacing.md,
    color: faqTheme.colors.text.body,
    marginTop: faqTheme.spacing.md,
    borderWidth: 1,
    borderColor: faqTheme.colors.border,
    fontSize: faqTheme.typography.body,
    width: "100%",
    maxWidth: 400,
  },
  noResults: {
  textAlign: "center",
  color: faqTheme.colors.text.muted,
  marginTop: faqTheme.spacing.xl,
  fontSize: faqTheme.typography.caption,
},
});