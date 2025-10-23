import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const PrivacyPolicyScreen = () => {
  const openPrivacyPolicy = async () => {
    // URL onde você hospedou o PDF
    await Linking.openURL('https://seusite.com/privacy-policy');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Política de Privacidade</Text>
        
        <Text style={styles.badge}>🔒 100% Local</Text>
        
        <Text style={styles.sectionTitle}>Seus Dados São Seguros</Text>
        <Text style={styles.text}>
          • Nenhum dado pessoal coletado{'\n'}
          • Flash Cards armazenados apenas no seu dispositivo{'\n'}
          • Sem contas ou cadastros necessários{'\n'}
          • Sem sincronização com nuvem
        </Text>

        <Text style={styles.sectionTitle}>Anúncios</Text>
        <Text style={styles.text}>
          Exibimos anúncios para manter o app gratuito. Eles podem usar identificadores anônimos do dispositivo, mas não acessam seus flash cards.
        </Text>

        <Text style={styles.sectionTitle}>Transparência Total</Text>
        <Text style={styles.text}>
          Este app funciona 100% offline após instalado. Os anúncios são a única conexão com a internet.
        </Text>

        <TouchableOpacity style={styles.button} onPress={openPrivacyPolicy}>
          <Text style={styles.buttonText}>Política Completa (PDF)</Text>
        </TouchableOpacity>

        <Text style={styles.contact}>
          Dúvidas?{'\n'}
          <Text style={styles.email}>maanoelaurias@gmail.com</Text>
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  badge: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: 8,
    borderRadius: 12,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 25,
    marginBottom: 10,
    color: '#444',
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 10,
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    marginTop: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contact: {
    marginTop: 25,
    fontSize: 14,
    textAlign: 'center',
    color: '#888',
    lineHeight: 20,
  },
  email: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default PrivacyPolicyScreen;