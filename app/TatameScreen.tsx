import { globalStyles } from "@/styles/globalStyles";
import { pixTatameTheme } from "@/styles/theme";
import { rules } from "@/utils/constants";
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
          <ShieldCheck size={35} color={pixTatameTheme.colors.primary}/>
        </TouchableOpacity>

        <Text style={styles.title}>Regras do Tatame</Text>
        <Text style={styles.subtitle}>
          {rules.length} regras fundamentais para o tatame
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
    paddingBottom: pixTatameTheme.spacing.lg,
    backgroundColor: pixTatameTheme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: pixTatameTheme.colors.border,
    zIndex: 10,
  },
  iconContainer: {
    padding: pixTatameTheme.spacing.md,
    borderWidth: 2,
    borderColor: pixTatameTheme.colors.border,
    borderRadius: 50,
    marginBottom: pixTatameTheme.spacing.md,
    backgroundColor: 'rgba(184, 134, 11, 0.1)',
  },
  title: {
    fontSize: pixTatameTheme.typography.title,
    fontWeight: "800",
    color: pixTatameTheme.colors.text.primary,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: pixTatameTheme.spacing.xs,
  },
  subtitle: {
    fontSize: pixTatameTheme.typography.caption,
    color: pixTatameTheme.colors.text.muted,
    textAlign: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: pixTatameTheme.spacing.lg,
    paddingTop: pixTatameTheme.spacing.lg,
    paddingBottom: pixTatameTheme.spacing.xl * 2,
  },
  ruleCard: {
    backgroundColor: pixTatameTheme.colors.card,
    borderLeftWidth: 4,
    borderLeftColor: pixTatameTheme.colors.border,
    borderRadius: 16,
    padding: pixTatameTheme.spacing.lg,
    marginBottom: pixTatameTheme.spacing.md,
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
    backgroundColor: pixTatameTheme.colors.cardActive,
    transform: [{ scale: 1.02 }],
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
  },
  ruleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: pixTatameTheme.spacing.sm,
  },
  ruleNumberContainer: {
    backgroundColor: pixTatameTheme.colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: pixTatameTheme.spacing.md,
  },
  ruleNumber: {
    fontSize: 16,
    fontWeight: "900",
    color: pixTatameTheme.colors.background,
  },
  ruleTitle: {
    fontSize: pixTatameTheme.typography.subtitle,
    fontWeight: "bold",
    color: pixTatameTheme.colors.text.primary,
    flex: 1,
  },
  ruleItems: {
    marginLeft: pixTatameTheme.spacing.xs,
  },
  ruleItemContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: pixTatameTheme.spacing.xs,
  },
  bullet: {
    fontSize: 16,
    color: pixTatameTheme.colors.primary,
    marginRight: pixTatameTheme.spacing.sm,
    marginTop: 1,
  },
  ruleItem: {
    fontSize: pixTatameTheme.typography.body,
    color: pixTatameTheme.colors.text.secondary,
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
    backgroundColor: pixTatameTheme.colors.primary,
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
    borderTopColor: pixTatameTheme.colors.border,
    paddingVertical: pixTatameTheme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    fontSize: pixTatameTheme.typography.caption,
    color: pixTatameTheme.colors.text.muted,
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
    backgroundColor: pixTatameTheme.colors.primary,
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
    color: pixTatameTheme.colors.background,
    fontSize: 20,
    fontWeight: "bold",
  },
});