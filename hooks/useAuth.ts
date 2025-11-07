import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { useState } from 'react';
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

  const handleLogin = () => {
    setShowLoginModal(true);
  };

  const handleConfirmLogin = async () => {
    try {
      if (!email || !password) {
        Alert.alert('Campos obrigatórios', 'Informe e-mail e senha.');
        return;
      }

      // Validação básica de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Alert.alert('E-mail inválido', 'Por favor, insira um endereço de e-mail válido.');
        return;
      }

      setLoading(true);
      const { success, user: firebaseUser, error } = await loginUsuario(email, password);

      if (!success || !firebaseUser) {
        // Tratamento específico para diferentes tipos de erro do Firebase
        let errorMessage = 'Não foi possível fazer login.';
        let showCreateAccountOption = false;

        // Verifica o código de erro do Firebase
        if (error?.includes('invalid-credential') || error?.includes('auth/invalid-credential')) {
          errorMessage = 'E-mail ou senha incorretos. Verifique suas credenciais.';
        } else if (error?.includes('user-not-found') || error?.includes('auth/user-not-found')) {
          errorMessage = 'E-mail não cadastrado.';
          showCreateAccountOption = true;
        } else if (error?.includes('wrong-password') || error?.includes('auth/wrong-password')) {
          errorMessage = 'Senha incorreta. Tente novamente.';
        } else if (error?.includes('invalid-email') || error?.includes('auth/invalid-email')) {
          errorMessage = 'E-mail inválido. Verifique o formato do endereço.';
        } else if (error?.includes('too-many-requests') || error?.includes('auth/too-many-requests')) {
          errorMessage = 'Muitas tentativas de login. Tente novamente mais tarde.';
        } else if (error?.includes('network-request-failed') || error?.includes('auth/network-request-failed')) {
          errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
        } else {
          errorMessage = error || 'Não foi possível fazer login. Tente novamente.';
        }

        // Se for usuário não encontrado, oferece opção de criar conta
        if (showCreateAccountOption) {
          Alert.alert(
            'Conta não encontrada',
            errorMessage + '\n\nDeseja criar uma conta?',
            [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Criar conta',
                onPress: () => {
                  setShowLoginModal(false);
                  setTimeout(() => handleRegister(), 300);
                }
              }
            ]
          );
        } else {
          Alert.alert('Erro no login', errorMessage);
        }
        return;
      }

      // Login bem-sucedido
      setIsLoggedIn(true);
      const nomeUsuario = firebaseUser?.email
        ? firebaseUser.email.split('@')[0]
        : 'Usuário';

      setUser({
        name: nomeUsuario,
        email: firebaseUser?.email ?? 'E-mail não disponível',
        since: new Date().toISOString().split('T')[0],
        avatar: nomeUsuario.charAt(0).toUpperCase(),
      });


      setShowLoginModal(false);
      setEmail('');
      setPassword('');
      Alert.alert('Login realizado', `Bem-vindo(a), ${firebaseUser.email}!`);
    } catch (error) {
      console.error('Erro no login:', error);

      // Tratamento de erros genéricos
      let errorMessage = 'Falha ao fazer login. Tente novamente.';
      let errorCode = '';

      // Extrai o código de erro do Firebase se disponível
      if (error instanceof Error) {
        const errorString = error.toString();

        if (errorString.includes('auth/invalid-credential')) {
          errorMessage = 'E-mail ou senha incorretos. Verifique suas credenciais.';
          errorCode = 'invalid-credential';
        } else if (errorString.includes('auth/user-not-found')) {
          errorMessage = 'E-mail não cadastrado. Deseja criar uma conta?';
          errorCode = 'user-not-found';
        } else if (errorString.includes('network') || errorString.includes('internet')) {
          errorMessage = 'Sem conexão com a internet. Verifique sua rede e tente novamente.';
        }
      }

      // Se for usuário não encontrado no catch, também oferece criar conta
      if (errorCode === 'user-not-found') {
        Alert.alert(
          'Conta não encontrada',
          errorMessage,
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Criar conta',
              onPress: () => {
                setShowLoginModal(false);
                setTimeout(() => handleRegister(), 300);
              }
            }
          ]
        );
      } else {
        Alert.alert('Erro', errorMessage);
      }
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
            onPress: handleLogin
          }
        ]
      );
    }
  };

  return {
    // States
    isLoggedIn,
    showLoginModal,
    email,
    password,
    loading,
    user,

    // Setters
    setShowLoginModal,
    setEmail,
    setPassword,

    // Handlers
    handleLogin,
    handleConfirmLogin,
    handleLogout,
    handleRegister,
    handleProfile,
  };
};