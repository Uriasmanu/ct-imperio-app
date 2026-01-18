import React, { useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AccountSection from "@/components/Settings/AccountSection";
import LoginModal from "@/components/Settings/LoginModal";
import { useUser } from "@/contexts/UserContext";
import { useLogin } from "@/hooks/useLogin";
import { globalStyles } from "@/styles/globalStyles";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { appConfig, gymData } from "./../utils/constants";

const SettingsScreen = () => {
  const [showVersionInfo, setShowVersionInfo] = useState(false);
  const { usuario } = useUser();

  const {
    showLoginModal,
    email,
    password,
    loading,
    setShowLoginModal,
    setEmail,
    setPassword,
    handleLogin,
    handleConfirmLogin,
    handleLogout,
    handleRegister,
    handleProfile,
  } = useLogin();

  const handlePrivacyPolicy = async () => {
    const url = "https://ct-imperio-privacy-policy.vercel.app/";
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Erro", "Não foi possível abrir o link.");
      }
    } catch (error) {
      Alert.alert(
        "Erro",
        "Ocorreu um problema ao abrir a política de privacidade.",
      );
    }
  };

  const handleContact = () => {
    const phoneNumber = gymData.phone.replace(/\D/g, "");
    const url = `whatsapp://send?phone=${phoneNumber}`;

    Linking.openURL(url).catch(() => {
      Alert.alert("Erro", "WhatsApp não está instalado no dispositivo.");
    });
  };

  const toggleVersionInfo = () => {
    setShowVersionInfo(!showVersionInfo);
  };

  const handleTutorial = () => {
    // Função para navegar para o tutorial
    router.push("/onboardingScreen");
  };

  return (
    <ScrollView
      style={globalStyles.container}
      showsVerticalScrollIndicator={false}
    >
      <AccountSection
        isLoggedIn={!!usuario}
        user={usuario}
        handleProfile={handleProfile}
        handleLogout={handleLogout}
        handleRegister={handleRegister}
        handleLogin={handleLogin}
      />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="business" size={18} color="#B8860B" />
          <Text style={styles.sectionTitle}>INFORMAÇÕES DA ACADEMIA</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <Ionicons name="trophy" size={20} color="#B8860B" />
            <Text style={styles.gymName}>{gymData.name}</Text>
          </View>
          <Text style={styles.gymAddress}>{gymData.address}</Text>
        </View>

        <TouchableOpacity style={styles.menuItem} onPress={handleContact}>
          <View style={styles.menuItemLeft}>
            <View style={styles.menuItemIcon}>
              <Ionicons name="logo-whatsapp" size={18} color="#B8860B" />
            </View>
            <View>
              <Text style={styles.menuText}>Contato / WhatsApp</Text>
              <Text style={styles.menuSubtext}>{gymData.phone}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#B8860B" />
        </TouchableOpacity>

        <View style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={styles.menuItemIcon}>
              <Ionicons name="person" size={18} color="#B8860B" />
            </View>
            <View>
              <Text style={styles.menuText}>Professor Responsável</Text>
              <Text style={styles.menuSubtext}>{gymData.instructor}</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={styles.menuItemIcon}>
              <Ionicons name="time" size={18} color="#B8860B" />
            </View>
            <View>
              <Text style={styles.menuText}>Horários de Funcionamento</Text>
              <Text style={styles.menuSubtext}>{gymData.hours}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="help-circle" size={18} color="#B8860B" />
          <Text style={styles.sectionTitle}>SUPORTE</Text>
        </View>

        <TouchableOpacity style={styles.menuItem} onPress={handlePrivacyPolicy}>
          <View style={styles.menuItemLeft}>
            <View style={styles.menuItemIcon}>
              <Ionicons name="shield-checkmark" size={18} color="#B8860B" />
            </View>
            <Text style={styles.menuText}>Política de Privacidade</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#B8860B" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="refresh-circle" size={18} color="#B8860B" />
          <Text style={styles.sectionTitle}>APLICATIVO</Text>
        </View>

        <TouchableOpacity style={styles.menuItem} onPress={toggleVersionInfo}>
          <View style={styles.menuItemLeft}>
            <View style={styles.menuItemIcon}>
              <Ionicons name="information-circle" size={18} color="#B8860B" />
            </View>
            <Text style={styles.menuText}>Versão do App</Text>
          </View>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>v{appConfig.version}</Text>
            <Ionicons
              name={showVersionInfo ? "chevron-up" : "chevron-down"}
              size={18}
              color="#B8860B"
            />
          </View>
        </TouchableOpacity>

        <View>
          <TouchableOpacity
            style={styles.tutorialButton}
            onPress={handleTutorial}
          >
            <View style={styles.tutorialIconContainer}>
              <Ionicons name="play-circle" size={24} color="#B8860B" />
            </View>
            <View style={styles.tutorialContent}>
              <Text style={styles.tutorialTitle}>Tutorial do App</Text>
              <Text style={styles.tutorialSubtitle}>
                Aprenda a usar todos os recursos
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B8860B" />
          </TouchableOpacity>
        </View>

        {showVersionInfo && (
          <View style={styles.versionInfoCard}>
            <View style={styles.versionDetail}>
              <Text style={styles.versionLabel}>Última atualização:</Text>
              <Text style={styles.versionValue}>{appConfig.lastUpload}</Text>
            </View>
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>Novidades:</Text>
              {appConfig.features.map((feature: string, index: number) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={14} color="#B8860B" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.footerLogo}>
          <Ionicons name="fitness" size={24} color="#B8860B" />
          <Text style={styles.footerTitle}>CT Império</Text>
        </View>
        <Text style={styles.footerText}>
          © 2025 Todos os direitos reservados
        </Text>
      </View>

      <LoginModal
        visible={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleConfirmLogin}
        loading={loading}
        email={email}
        onEmailChange={setEmail}
        password={password}
        onPasswordChange={setPassword}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#000000",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1a1a1a",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#0a0a0a",
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#B8860B",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  tutorialButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0a0a0a",
    padding: 16,
    borderRadius: 12,
    margin: 16,
    borderWidth: 1,
    borderColor: "#B8860B",
    shadowColor: "#B8860B",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tutorialIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(184, 134, 11, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  tutorialContent: {
    flex: 1,
  },
  tutorialTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  tutorialSubtitle: {
    fontSize: 14,
    color: "#B8860B",
    fontWeight: "500",
  },
  infoCard: {
    backgroundColor: "#0a0a0a",
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1a1a1a",
  },
  infoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  gymName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#B8860B",
  },
  gymAddress: {
    fontSize: 14,
    color: "#CCCCCC",
    lineHeight: 20,
    marginLeft: 28,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(184, 134, 11, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  menuSubtext: {
    fontSize: 14,
    color: "#B8860B",
    marginTop: 2,
    fontWeight: "500",
  },
  versionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  versionText: {
    fontSize: 14,
    color: "#B8860B",
    fontWeight: "600",
  },
  versionInfoCard: {
    backgroundColor: "#0a0a0a",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1a1a1a",
  },
  versionDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  versionLabel: {
    fontSize: 14,
    color: "#CCCCCC",
    fontWeight: "500",
  },
  versionValue: {
    fontSize: 14,
    color: "#B8860B",
    fontWeight: "600",
  },
  featuresContainer: {
    gap: 8,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#B8860B",
    marginBottom: 4,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 4,
  },
  featureText: {
    fontSize: 13,
    color: "#CCCCCC",
    flex: 1,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255, 68, 68, 0.1)",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 68, 68, 0.3)",
  },
  resetButtonText: {
    fontSize: 15,
    color: "#FF4444",
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: "#000000",
  },
  footerLogo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  footerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#B8860B",
  },
  footerText: {
    fontSize: 13,
    color: "#666666",
    fontWeight: "500",
  },
});

export default SettingsScreen;
