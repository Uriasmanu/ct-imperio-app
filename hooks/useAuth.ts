import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { auth } from '@/config/firebaseConfig';
import { loginUsuario } from '@/services/usuarioService';

interface User {
  name: string;
  email: string;
  since: string;
  avatar: string;
}

export const useAuth = () => {
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // 🟢 Carregar dados de login salvos no AsyncStorage
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Erro ao carregar usuário armazenado:', error);
      }
    };
    loadUserData();
  }, []);

  const handleLogin = () => {
    setShowLoginModal(true);
  };

  const handleConfirmLogin = async () => {
    try {
      if (!email || !password) {
        Alert.alert('Campos obrigatórios', 'Informe e-mail e senha.');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Alert.alert('E-mail inválido', 'Por favor, insira um endereço de e-mail válido.');
        return;
      }

      setLoading(true);
      const { success, user: firebaseUser, error } = await loginUsuario(email, password);

      if (!success || !firebaseUser) {
        let errorMessage = 'Não foi possível fazer login.';
        let showCreateAccountOption = false;

        if (error?.includes('invalid-credential')) {
          errorMessage = 'E-mail ou senha incorretos.';
        } else if (error?.includes('user-not-found')) {
          errorMessage = 'E-mail não cadastrado.';
          showCreateAccountOption = true;
        } else if (error?.includes('wrong-password')) {
          errorMessage = 'Senha incorreta.';
        } else if (error?.includes('too-many-requests')) {
          errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
        } else if (error?.includes('network')) {
          errorMessage = 'Erro de conexão.';
        }

        if (showCreateAccountOption) {
          Alert.alert(
            'Conta não encontrada',
            `${errorMessage}\n\nDeseja criar uma conta?`,
            [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Criar conta',
                onPress: () => {
                  setShowLoginModal(false);
                  setTimeout(() => handleRegister(), 300);
                },
              },
            ]
          );
        } else {
          Alert.alert('Erro no login', errorMessage);
        }
        return;
      }

      // ✅ Login bem-sucedido
      const nomeUsuario = firebaseUser?.email
        ? firebaseUser.email.split('@')[0]
        : 'Usuário';

      const newUser = {
        name: nomeUsuario,
        email: firebaseUser?.email ?? 'E-mail não disponível',
        since: new Date().toISOString().split('T')[0],
        avatar: nomeUsuario.charAt(0).toUpperCase(),
      };

      setUser(newUser);
      setIsLoggedIn(true);
      setShowLoginModal(false);
      setEmail('');
      setPassword('');

      // 🔒 Salva o login localmente
      await AsyncStorage.setItem('@user', JSON.stringify(newUser));

      Alert.alert('Login realizado', `Bem-vindo(a), ${firebaseUser.email}!`);
    } catch (error) {
      console.error('Erro no login:', error);
      Alert.alert('Erro', 'Falha ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
            setIsLoggedIn(false);
            setUser(null);
            await AsyncStorage.removeItem('@user'); // 🔑 remove o login salvo
            Alert.alert('Logout realizado', 'Você saiu da sua conta.');
          } catch (err) {
            Alert.alert('Erro', 'Não foi possível sair.');
          }
        },
      },
    ]);
  };

  const handleRegister = () => {
    setShowLoginModal(false);
    router.push('/registroScreen');
  };

  const handleProfile = () => {
    if (isLoggedIn) {
      router.push('/perfilScreen');
    } else {
      Alert.alert(
        'Acesso restrito',
        'Você precisa estar logado para acessar o perfil.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Fazer login',
            onPress: handleLogin,
          },
        ]
      );
    }
  };

  return {
    isLoggedIn,
    showLoginModal,
    email,
    password,
    loading,
    user,
    setShowLoginModal,
    setEmail,
    setPassword,
    handleLogin,
    handleConfirmLogin,
    handleLogout,
    handleRegister,
    handleProfile,
  };
};
