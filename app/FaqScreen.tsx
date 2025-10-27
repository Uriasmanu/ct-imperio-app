import { AntDesign } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Linking,
  Modal,
  StyleSheet,
  Text,
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

interface FAQItem {
  question: string;
  answer: string;
}


const faqItems: FAQItem[] = [
  {
    question: "Quais modalidades de luta vocês oferecem?",
    answer: "Atualmente, oferecemos aulas de Jiu-Jitsu Brasileiro (BJJ), Muay Thai e Boxe. Consulte a recepção para saber sobre turmas infantis.",
  },
  {
    question: "Preciso ter experiência prévia para começar a treinar?",
    answer: "De forma alguma! Nossas aulas são estruturadas para receber alunos de todos os níveis, especialmente iniciantes. O foco principal é na técnica, segurança e no desenvolvimento gradual do condicionamento físico.",
  },
  {
    question: "Posso fazer uma aula experimental antes de me matricular?",
    answer: "Claro! Basta agendar seu horário com antecedência na recepção ou pelo WhatsApp.",
  },
  {
    question: "O que devo levar para o meu primeiro treino?",
    answer: "Roupas leves e confortáveis, uma toalha e uma garrafa d'água. Em modalidades que exigem kimono ou luvas, forneceremos o equipamento emprestado para o seu primeiro dia.",
  },
  {
    question: "Qual é o custo e quais são os planos disponíveis?",
    answer: "Temos planos mensais, trimestrais e anuais com descontos progressivos. Entre em contato para receber nossa tabela de preços detalhada.",
  },
  {
    question: "Vocês oferecem horários flexíveis?",
    answer: "Sim! Temos turmas em diversos horários pela manhã, tarde e noite durante a semana, e também aulas aos sábados pela manhã.",
  },
  {
    question: "Há restrições de idade para treinar?",
    answer: "Oferecemos turmas para todas as idades a partir de 5 anos. Para crianças de 5 a 12 anos, temos aulas específicas com metodologia adaptada.",
  },
  // Novas perguntas e respostas adicionadas
  {
    question: "Qual é a diferença entre Muay Thai, Boxe e Jiu-Jitsu?",
    answer: "Muay Thai é uma arte marcial tailandesa que utiliza socos, chutes, cotoveladas e joelhadas. Boxe foca apenas em socos com as mãos. Jiu-Jitsu é uma luta de solo com foco em finalizações, imobilizações e estrangulamentos. Cada uma desenvolve habilidades diferentes e são complementares.",
  },
  {
    question: "Posso treinar mais de uma modalidade ao mesmo tempo?",
    answer: "Sim! Inclusive recomendamos para um desenvolvimento marcial mais completo. Temos pacotes especiais para alunos que desejam praticar múltiplas modalidades.",
  },
  {
    question: "Qual é a melhor arte marcial para defesa pessoal?",
    answer: "Todas as modalidades que oferecemos são eficazes para defesa pessoal. Muay Thai e Boxe são excelentes para situações em pé, enquanto Jiu-Jitsu é ideal para situações de grappling e solo. A combinação de ambas oferece uma preparação mais completa.",
  },
  {
    question: "Tem aulas para iniciantes?",
    answer: "Sim! Temos turmas específicas para iniciantes em todas as modalidades, com foco nos fundamentos básicos e adaptação gradual ao treinamento.",
  },
  {
    question: "Quais são os horários das aulas?",
    answer: "Nossos horários variam por modalidade. Temos aulas pela manhã (6h-12h), tarde (14h-18h) e noite (19h-22h) de segunda a sexta, e aulas aos sábados pela manhã. Consulte a recepção para o horário específico de cada modalidade.",
  },
  {
    question: "Preciso marcar aula ou posso chegar no horário?",
    answer: "Para alunos matriculados, pode chegar no horário da aula. Para aula experimental, solicitamos que agende previamente para melhor atendimento.",
  },
  {
    question: "Quanto tempo dura cada treino?",
    answer: "Nossas aulas têm duração média de 1 hora a 1h30, dependendo da modalidade e do nível da turma.",
  },
  {
    question: "Há planos trimestrais, semestrais ou anuais com desconto?",
    answer: "Sim! Oferecemos descontos progressivos para planos de longer duration: 5% trimestral, 10% semestral e 15% anual.",
  },
  {
    question: "Vocês aceitam cartão, PIX ou gympass?",
    answer: "Aceitamos todas as formas de pagamento: cartão de crédito/débito, PIX, dinheiro e também trabalhamos com Gympass e TotalPass.",
  },
  {
    question: "Existe taxa de matrícula?",
    answer: "Não cobramos taxa de matrícula. O valor inclui apenas a mensalidade do plano escolhido.",
  },
  {
    question: "Preciso comprar meus próprios equipamentos?",
    answer: "Para as primeiras aulas, fornecemos equipamentos básicos. Recomendamos que adquira seus próprios equipamentos pessoais após decidir continuar com os treinos.",
  },
  {
    question: "A academia fornece luvas, kimono ou caneleiras?",
    answer: "Sim, temos equipamentos disponíveis para empréstimo nas primeiras aulas. Após isso, orientamos sobre a aquisição do material pessoal.",
  },
  {
    question: "É obrigatório usar uniforme?",
    answer: "Para Jiu-Jitsu é obrigatório o kimono. Para Muay Thai e Boxe, roupas de treino adequadas (shorts e camiseta). Temos uniformes disponíveis para compra na academia.",
  },
  {
    question: "Preciso estar em forma para começar?",
    answer: "Não! Os treinos são adaptados para todos os níveis de condicionamento. O objetivo é justamente ajudar você a melhorar sua forma física gradualmente.",
  },
  {
    question: "Os treinos ajudam a emagrecer?",
    answer: "Sim! As artes marciais são excelentes para queima calórica e definição muscular. Uma aula pode queimar entre 500-800 calorias, dependendo da intensidade.",
  },
  {
    question: "Há risco de lesão?",
    answer: "Como em qualquer atividade física, há riscos, mas minimizamos através de aquecimento adequado, supervisão constante e técnicas de ensino progressivas. A segurança é nossa prioridade.",
  },
  {
    question: "Tem aquecimento e alongamento antes das aulas?",
    answer: "Sim! Todas as aulas incluem aquecimento completo no início e alongamento no final, essenciais para prevenir lesões.",
  },
  {
    question: "É necessário fazer exame médico?",
    answer: "Recomendamos que todos os alunos realizem avaliação médica antes de iniciar qualquer atividade física intensa, especialmente se possuem condições preexistentes.",
  },
  {
    question: "A partir de que idade as crianças podem treinar?",
    answer: "Aceitamos crianças a partir de 5 anos em nossas turmas infantis, com metodologia específica e lúdica para cada faixa etária.",
  },
  {
    question: "As aulas infantis são diferentes das de adultos?",
    answer: "Sim! As aulas infantis focam em desenvolvimento motor, disciplina, coordenação e defesa pessoal básica, tudo de forma lúdica e segura.",
  },
  {
    question: "A academia participa de campeonatos?",
    answer: "Sim! Participamos regularmente de competições locais, estaduais e nacionais. Temos alunos competidores em todas as modalidades.",
  },
  {
    question: "Posso competir mesmo sendo iniciante?",
    answer: "Sim! Existem categorias para todos os níveis, incluindo iniciantes. Nossos professores avaliam e preparam alunos interessados em competir.",
  },
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

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
    <View style={styles.container}>
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
          {faqItems.map((item, index) => (
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
                    transform: [{
                      rotate: activeIndex === index ? '0deg' : '180deg'
                    }]
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
                      transform: [{
                        translateY: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-10, 0],
                        })
                      }]
                    }
                  ]}
                >
                  <Text style={styles.answer}>{item.answer}</Text>
                </Animated.View>
              )}
            </View>
          ))}
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
              Escolha a melhor forma de entrar em contato conosco para agendar sua aula experimental gratuita:
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
    flex: 1,
    backgroundColor: theme.colors.background,
  },
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
});