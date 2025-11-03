import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { appConfig } from './../utils/constants';

// Mock de dados do usuário - você pode substituir por dados reais
const mockUser = {
  name: 'João Silva',
  email: 'joao.silva@email.com',
  membership: 'Plano Premium',
  since: '2024-01-15',
  avatar: '👤'
};

const SettingsScreen = () => {
  const [showVersionInfo, setShowVersionInfo] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState('Unidade Centro');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(mockUser);
  const router = useRouter();

  // Dados mockados da academia - você pode substituir por dados reais
  const gymData = {
    name: 'CT Império',
    address: 'Rua Araraquara, 193 - Centro\nMarília - São Paulo',
    phone: '+55 (14) 99785-6670',
    instructor: 'Mestre Will Izarias',
    hours: 'Segunda a Sexta: 08:00 - 20:30\nSábado: 08:00 - 12:00',
  };

  const handlePrivacyPolicy = async () => {
    const url = 'https://uriasmanu.github.io/ct-imperio-app/';
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Erro', 'Não foi possível abrir o link.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um problema ao abrir a política de privacidade.');
    }
  };

  const handleContact = () => {
    const phoneNumber = gymData.phone.replace(/\D/g, '');
    const url = `whatsapp://send?phone=${phoneNumber}`;

    Linking.openURL(url).catch(() => {
      Alert.alert('Erro', 'WhatsApp não está instalado no dispositivo.');
    });
  };

  const toggleVersionInfo = () => {
    setShowVersionInfo(!showVersionInfo);
  };

  const handleUnitChange = (unit: string) => {
    setSelectedUnit(unit);
    Alert.alert('Unidade Alterada', `Unidade selecionada: ${unit}`);
  };

  // Funções de autenticação
  const handleLogin = () => {
    // Aqui você pode integrar com sua lógica de autenticação real
    setIsLoggedIn(true);
    Alert.alert('Login realizado', `Bem-vindo de volta, ${user.name}!`);
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => {
            setIsLoggedIn(false);
            Alert.alert('Logout realizado', 'Você saiu da sua conta.');
          }
        }
      ]
    );
  };

  const handleProfile = () => {
    if (isLoggedIn) {
      router.push('/PerfilScreen')
    } else {
      Alert.alert('Atenção', 'Você precisa estar logado para acessar o perfil.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Seção de Autenticação */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>MINHA CONTA</Text>

        {isLoggedIn ? (
          // Usuário logado - mostrar informações e opções
          <View style={styles.userCard}>
            <View style={styles.userInfo}>
              <Text style={styles.userAvatar}>{user.avatar}</Text>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <Text style={styles.userMembership}>{user.membership}</Text>
              </View>
            </View>

            <View style={styles.authButtons}>
              <TouchableOpacity
                style={[styles.authButton, styles.profileButton]}
                onPress={handleProfile}
              >
                <Text style={styles.profileButtonText}>Ver Perfil</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.authButton, styles.logoutButton]}
                onPress={handleLogout}
              >
                <Text style={styles.logoutButtonText}>Sair</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // Usuário não logado - mostrar opção de login
          <View style={styles.loginCard}>
            <Text style={styles.loginTitle}>Acesse sua conta</Text>
            <Text style={styles.loginSubtitle}>Faça login para acessar todas as funcionalidades</Text>

            <TouchableOpacity
              style={[styles.authButton, styles.loginButton]}
              onPress={handleLogin}
            >
              <Text style={styles.loginButtonText}>Fazer Login</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Seção de Informações da Academia */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>INFORMAÇÕES DA ACADEMIA</Text>

        <View style={styles.infoCard}>
          <Text style={styles.gymName}>{gymData.name}</Text>
          <Text style={styles.gymAddress}>{gymData.address}</Text>
        </View>

        <TouchableOpacity style={styles.menuItem} onPress={handleContact}>
          <View style={styles.menuItemLeft}>
            <Text style={styles.menuText}>Contato / WhatsApp</Text>
            <Text style={styles.menuSubtext}>{gymData.phone}</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Text style={styles.menuText}>Professor Responsável</Text>
            <Text style={styles.menuSubtext}>{gymData.instructor}</Text>
          </View>
        </View>

        <View style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Text style={styles.menuText}>Horários de Funcionamento</Text>
            <Text style={styles.menuSubtext}>{gymData.hours}</Text>
          </View>
        </View>
      </View>

      {/* Seção de Suporte */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SUPORTE</Text>

        <TouchableOpacity style={styles.menuItem} onPress={handlePrivacyPolicy}>
          <Text style={styles.menuText}>Política de Privacidade</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Seção de Atualizações */}
      <View style={styles.section}>
        <View style={styles.accordionContainer}>
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={toggleVersionInfo}
          >
            <Text style={styles.menuText}>Atualizações</Text>
            <View style={styles.headerRight}>
              <Text style={styles.versionText}>v {appConfig.version}</Text>
              <Text
                style={[
                  styles.accordionArrow,
                  showVersionInfo && styles.accordionArrowOpen
                ]}
              >
                ›
              </Text>
            </View>
          </TouchableOpacity>

          {showVersionInfo && (
            <View style={styles.accordionContent}>
              <View style={styles.versionInfo}>
                <Text style={styles.versionTitle}>Informações da versão</Text>

                <View style={styles.versionDetail}>
                  <Text style={styles.versionLabel}>Versão</Text>
                  <Text style={styles.versionValue}>{appConfig.version}</Text>
                </View>

                <View style={styles.versionDetail}>
                  <Text style={styles.versionLabel}>Última atualização</Text>
                  <Text style={styles.versionValue}>{appConfig.lastUpload}</Text>
                </View>

                <View style={styles.versionDetailFeature}>
                  <Text style={styles.versionLabel}>Novidades</Text>
                  <View style={styles.featuresList}>
                    {appConfig.features.map((feature: string, index: number) => (
                      <Text key={index} style={styles.featureItem}>
                        • {feature}
                      </Text>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Rodapé */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>CT Império © 2024</Text>
        <Text style={styles.footerSubtext}>Todos os direitos reservados</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  section: {
    backgroundColor: '#000000',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B8860B',
    marginVertical: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // Estilos para a seção de autenticação
  userCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#B8860B',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userAvatar: {
    fontSize: 40,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 2,
  },
  userMembership: {
    fontSize: 12,
    color: '#B8860B',
    fontWeight: '500',
  },
  loginCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#B8860B',
    alignItems: 'center',
  },
  loginTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  loginSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  authButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  authButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButton: {
    backgroundColor: '#B8860B',
  },
  profileButton: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#B8860B',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#666666',
  },
  loginButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  profileButtonText: {
    color: '#B8860B',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButtonText: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '600',
  },
  // Estilos existentes mantidos
  infoCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#B8860B',
  },
  gymName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#B8860B',
    marginBottom: 4,
  },
  gymAddress: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  menuItemLeft: {
    flex: 1,
  },
  menuText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  menuSubtext: {
    fontSize: 14,
    color: '#B8860B',
    marginTop: 4,
    lineHeight: 18,
  },
  menuArrow: {
    fontSize: 18,
    color: '#B8860B',
    fontWeight: 'bold',
  },
  unitSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedUnitText: {
    fontSize: 14,
    color: '#B8860B',
    fontWeight: '500',
  },
  unitOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1a1a1a',
    marginBottom: 1,
  },
  unitOptionText: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  unitOptionTextSelected: {
    color: '#B8860B',
    fontWeight: '600',
  },
  checkmark: {
    color: '#B8860B',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Estilos do Accordion
  accordionContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  versionText: {
    fontSize: 14,
    color: '#B8860B',
    fontWeight: '500',
  },
  accordionArrow: {
    fontSize: 18,
    color: '#B8860B',
    fontWeight: 'bold',
    transform: [{ rotate: '0deg' }],
  },
  accordionArrowOpen: {
    transform: [{ rotate: '90deg' }],
  },
  accordionContent: {
    backgroundColor: '#000000',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  versionInfo: {
    paddingVertical: 16,
    gap: 12,
  },
  versionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#B8860B',
    marginBottom: 8,
  },
  versionDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  versionLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    fontWeight: '500',
    flex: 1,
  },
  versionValue: {
    fontSize: 14,
    color: '#B8860B',
    flex: 2,
    textAlign: 'right',
    fontWeight: '500',
  },
  versionDetailFeature: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10
  },
  featuresList: {
    flex: 2,
  },
  featureItem: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 4,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#000000',
  },
  footerText: {
    fontSize: 14,
    color: '#B8860B',
    fontWeight: '500',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
});

export default SettingsScreen;