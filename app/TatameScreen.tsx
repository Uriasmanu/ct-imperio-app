import { globalStyles } from "@/styles/globalStyles";
import { ShieldCheck } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

// Sistema de tema unificado
const theme = {
  colors: {
    primary: "#d4af37",
    primaryDark: "#b8860b",
    background: "#0b0b0b",
    card: "#1a1a1a",
    cardActive: "#2a2a2a",
    text: {
      primary: "#d4af37",
      secondary: "#e0e0e0",
      muted: "#a0a0a0"
    },
    border: "#b8860b"
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32
  },
  typography: {
    title: 28,
    subtitle: 18,
    body: 14,
    caption: 12
  }
};

interface Rule {
  number: number;
  title: string;
  items: string[];
}

const rules: Rule[] = [
  {
    number: 1,
    title: "Etiqueta e Respeito",
    items: [
      "Cumprimente ao entrar e sair do tatame.",
      "Cumprimente por ordem de GRADUAÇÃO.",
      "Respeite mestres, instrutores e colegas em todos os momentos.",
    ],
  },
  {
    number: 2,
    title: "Higiene Pessoal",
    items: [
      "KIMONO e FAIXA devem estar SEMPRE lavados e limpos.",
      "Mantenha UNHAS CURTAS (mãos e pés).",
      "Utilize DESODORANTE nas axilas.",
      "DENTES ESCOVADOS e hálito fresco.",
      "Cabelos longos devem estar presos.",
    ],
  },
  {
    number: 3,
    title: "Uniforme e Segurança",
    items: [
      "Apenas KIMONO PRETO é permitido para treino.",
      "CAMISETA ou RASHGUARD (sem decote) é obrigatória por baixo do kimono.",
      "Use SHORT por baixo da calça do kimono.",
      "Sem joias, brincos, piercings ou relógios no tatame.",
    ],
  },
  {
    number: 4,
    title: "Pontualidade e Preparação",
    items: [
      "CHEGAR NO HORÁRIO da aula ou peça permissão ao instrutor se atrasado.",
      "Traga e ENCHA sua GARRAFA DE ÁGUA antes da aula começar.",
      "Sem calçados no tatame. Mantenha os chinelos nos pés ao sair do tatame e ao retornar.",
    ],
  },
  {
    number: 5,
    title: "Foco e Conduta",
    items: [
      "Sempre peça permissão ao professor antes de SAIR ou ENTRAR no tatame durante a aula.",
      "Treine com controle e comunique lesões.",
      "Mantenha o FOCO e a disciplina (Celulares desligados ou guardados).",
      "Ajude a manter o tatame e as áreas comuns limpas.",
    ],
  },
];

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function Rules() {
  const [activeRule, setActiveRule] = useState<number | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { 
      useNativeDriver: true,
      listener: (event: any) => {
      }
    }
  );

  // Efeito de parallax para o título - CORRIGIDO
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  const headerScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.95],
    extrapolate: 'clamp',
  });

  const handleRulePress = (ruleNumber: number) => {
    setActiveRule(activeRule === ruleNumber ? null : ruleNumber);
  };

  // Função segura para scroll to top
  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

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
        <TouchableOpacity 
          style={styles.iconContainer}
          onPress={scrollToTop}
          activeOpacity={0.7}
        >
          <ShieldCheck size={35} color={theme.colors.primary}/>
        </TouchableOpacity>

        <Text style={styles.title}>Regras do Tatame</Text>
        <Text style={styles.subtitle}>
          {rules.length} regras fundamentais para o dojô
        </Text>
      </Animated.View>

      <Animated.ScrollView 
        ref={scrollViewRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        scrollEventThrottle={16}
        onScroll={handleScroll} 
      >
        {rules.map((rule) => (
          <TouchableOpacity
            key={rule.number}
            activeOpacity={0.7}
            onPress={() => handleRulePress(rule.number)}
          >
            <View style={[
              styles.ruleCard,
              activeRule === rule.number && styles.ruleCardActive
            ]}>
              {/* Número da regra com destaque */}
              <View style={styles.ruleHeader}>
                <View style={styles.ruleNumberContainer}>
                  <Text style={styles.ruleNumber}>{rule.number}</Text>
                </View>
                <Text style={styles.ruleTitle}>{rule.title}</Text>
              </View>

              {/* Itens da regra */}
              <View style={styles.ruleItems}>
                {rule.items.map((item, idx) => (
                  <View key={idx} style={styles.ruleItemContainer}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.ruleItem}>{item}</Text>
                  </View>
                ))}
              </View>

              {/* Indicador visual de interação */}
              {activeRule === rule.number && (
                <View style={styles.activeIndicator} />
              )}
            </View>
          </TouchableOpacity>
        ))}

        {/* Espaço final para scroll */}
        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>

      {/* Footer informativo */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Mantenha o respeito e a disciplina
        </Text>
      </View>

      {/* Botão flutuante para voltar ao topo */}
      <Animated.View 
        style={[
          styles.floatingButton,
          {
            opacity: scrollY.interpolate({
              inputRange: [0, 50],
              outputRange: [0, 1],
              extrapolate: 'clamp',
            })
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.floatingButtonInner}
          onPress={scrollToTop}
          activeOpacity={0.8}
        >
          <Text style={styles.floatingButtonText}>↑</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    paddingTop: screenHeight * 0.00,
    paddingBottom: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    zIndex: 10,
  },
  iconContainer: {
    padding: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: 50,
    marginBottom: theme.spacing.md,
    backgroundColor: 'rgba(184, 134, 11, 0.1)',
  },
  title: {
    fontSize: theme.typography.title,
    fontWeight: "800",
    color: theme.colors.text.primary,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.caption,
    color: theme.colors.text.muted,
    textAlign: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl * 2,
  },
  ruleCard: {
    backgroundColor: theme.colors.card,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.border,
    borderRadius: 16,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  ruleCardActive: {
    backgroundColor: theme.colors.cardActive,
    transform: [{ scale: 1.02 }],
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
  },
  ruleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  ruleNumberContainer: {
    backgroundColor: theme.colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  ruleNumber: {
    fontSize: 16,
    fontWeight: "900",
    color: theme.colors.background,
  },
  ruleTitle: {
    fontSize: theme.typography.subtitle,
    fontWeight: "bold",
    color: theme.colors.text.primary,
    flex: 1,
  },
  ruleItems: {
    marginLeft: theme.spacing.xs,
  },
  ruleItemContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: theme.spacing.xs,
  },
  bullet: {
    fontSize: 16,
    color: theme.colors.primary,
    marginRight: theme.spacing.sm,
    marginTop: 1,
  },
  ruleItem: {
    fontSize: theme.typography.body,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    flex: 1,
    textAlign: "justify",
  },
  activeIndicator: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 4,
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  bottomSpacer: {
    height: screenHeight * 0.1,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(11, 11, 11, 0.9)',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingVertical: theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    fontSize: theme.typography.caption,
    color: theme.colors.text.muted,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  floatingButton: {
    position: "absolute",
    bottom: 80,
    right: 20,
    zIndex: 20,
  },
  floatingButtonInner: {
    backgroundColor: theme.colors.primary,
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  floatingButtonText: {
    color: theme.colors.background,
    fontSize: 20,
    fontWeight: "bold",
  },
});