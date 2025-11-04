import { registerUser } from '@/config/firebaseConfig';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';



const RegistroScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegisterPress = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    if (email.trim() === '' || password.trim() === '') {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    setLoading(true);

    const result = await registerUser(email, password);

    setLoading(false);

    if (result.success) {
      Alert.alert('Sucesso', 'Usuário registrado! Faça login para continuar.');
      // Redirecionar para a tela de login ou principal
      router.replace('/SettingsScreen'); // Exemplo: Redireciona para a raiz ou tela de login
    } else {
      Alert.alert('Erro no Registro', result.error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crie sua Conta</Text>
      
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Senha (mínimo 6 caracteres)"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirmar Senha"
        placeholderTextColor="#999"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      
      <TouchableOpacity
        style={styles.registerButton}
        onPress={handleRegisterPress}
        disabled={loading}
      >
        <Text style={styles.registerButtonText}>
          {loading ? 'Registrando...' : 'Registrar'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/SettingsScreen')} style={{ marginTop: 20 }}>
        <Text style={styles.backText}>Já tem uma conta? Voltar para Login</Text>
      </TouchableOpacity>
    </View>
  );
};

// Estilos de exemplo para RegistroScreen
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#B8860B',
        marginBottom: 30,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#1a1a1a',
        color: '#FFFFFF',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16,
    },
    registerButton: {
        backgroundColor: '#B8860B',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    registerButtonText: {
        color: '#000000',
        fontSize: 18,
        fontWeight: 'bold',
    },
    backText: {
        color: '#CCCCCC',
        textAlign: 'center',
        fontSize: 14,
    }
});

export default RegistroScreen;