import React from 'react';
import {
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface PrivacyPolicyModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ 
  visible, 
  onAccept, 
  onDecline 
}) => {
  const openPrivacyPolicy = () => {
    Linking.openURL('https://seusite.com/privacy-policy');
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onDecline}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.title}>Política de Privacidade</Text>
          
          <ScrollView style={styles.scrollView}>
            <Text style={styles.text}>
              Para continuar usando nosso aplicativo, você precisa aceitar nossa Política de Privacidade.
            </Text>
            
            <Text style={styles.section}>📱 Coleta de Dados</Text>
            <Text style={styles.smallText}>
              Coletamos informações necessárias para o funcionamento do app e melhorar sua experiência.
            </Text>

            <Text style={styles.section}>🔒 Segurança</Text>
            <Text style={styles.smallText}>
              Seus dados são protegidos e não compartilhamos informações pessoais sem sua permissão.
            </Text>

            <TouchableOpacity onPress={openPrivacyPolicy}>
              <Text style={styles.link}>Ler política completa online</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.declineButton]} 
              onPress={onDecline}
            >
              <Text style={styles.declineButtonText}>Recusar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.acceptButton]} 
              onPress={onAccept}
            >
              <Text style={styles.acceptButtonText}>Aceitar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '80%',
    width: '90%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  scrollView: {
    maxHeight: 200,
    width: '100%',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
    color: '#666',
  },
  section: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: '#444',
  },
  smallText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
    textAlign: 'justify',
  },
  link: {
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  acceptButton: {
    backgroundColor: '#007AFF',
  },
  declineButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  acceptButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  declineButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default PrivacyPolicyModal;