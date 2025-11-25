import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface User {
  nome?: string;            
  email: string;
  avatar?: string;
  since?: string;
}

interface AccountSectionProps {
  isLoggedIn: boolean;
  user: User | null;
  handleProfile: () => void;
  handleLogout: () => void;
  handleRegister: () => void;
  handleLogin: () => void;
}

const AccountSection: React.FC<AccountSectionProps> = ({
  isLoggedIn,
  user,
  handleProfile,
  handleLogout,
  handleRegister,
  handleLogin,
}) => {
  // Função para obter a primeira letra do nome
  const getFirstLetter = (nome: string | undefined) => {
    if (!nome || nome.trim() === '') return '??';
    return nome.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>MINHA CONTA</Text>

      {isLoggedIn && user ? (
        <View style={styles.userCard}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getFirstLetter(user.nome)}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user.nome}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
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
        <View style={styles.loginCard}>
          <Text style={styles.loginTitle}>Acesse sua conta</Text>
          <Text style={styles.loginSubtitle}>
            Faça login para acessar todas as funcionalidades
          </Text>

          <View style={styles.authButtonsContainer}>
            <TouchableOpacity
              style={[styles.authButton, styles.registerButton]}
              onPress={handleRegister}
            >
              <Text style={styles.authButtonText}>Registrar-se</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.authButton, styles.loginButton]}
              onPress={handleLogin}
            >
              <Text style={styles.authButtonText}>Fazer Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#B8860B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#DAA520',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
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
  userSince: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
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
  authButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 10,
  },
  registerButton: {
    backgroundColor: '#B8860B',
  },
  loginButton: {
    backgroundColor: '#B8860B',
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default AccountSection;