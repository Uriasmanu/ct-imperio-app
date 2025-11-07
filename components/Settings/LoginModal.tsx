// src/components/Settings/LoginModal/index.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Alert,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface LoginModalProps {
    visible: boolean;
    onClose: () => void;
    onLogin: (email: string, password: string) => Promise<void>;
    loading?: boolean;
    email: string; 
    onEmailChange: (email: string) => void; 
    password: string; 
    onPasswordChange: (password: string) => void; 
}

const LoginModal: React.FC<LoginModalProps> = ({
    visible,
    onClose,
    onLogin,
    loading = false,
    email, 
    onEmailChange, 
    password, 
    onPasswordChange, 
}) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const handleConfirmLogin = async () => {
        if (!email || !password) {
            Alert.alert('Campos obrigatórios', 'Informe e-mail e senha.');
            return;
        }

        await onLogin(email, password);
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleClose = () => {
        onEmailChange(''); 
        onPasswordChange(''); 
        setShowPassword(false);
        onClose();
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Fazer Login</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="E-mail"
                        placeholderTextColor="#aaa"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email} 
                        onChangeText={onEmailChange} 
                    />

                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="Senha"
                            placeholderTextColor="#aaa"
                            secureTextEntry={!showPassword}
                            value={password} 
                            onChangeText={onPasswordChange} 
                        />
                        <TouchableOpacity
                            style={styles.eyeButton}
                            onPress={toggleShowPassword}
                        >
                            <Ionicons
                                name={showPassword ? "eye-off" : "eye"}
                                size={22}
                                color="#999"
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={handleClose}
                            disabled={loading}
                        >
                            <Text style={styles.modalButtonText}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modalButton, styles.confirmButton]}
                            onPress={handleConfirmLogin}
                            disabled={loading}
                        >
                            <Text style={styles.modalButtonText}>
                                {loading ? 'Entrando...' : 'Entrar'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalContainer: {
        width: '85%',
        backgroundColor: '#1a1a1a',
        padding: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#B8860B',
    },
    modalTitle: {
        fontSize: 18,
        color: '#B8860B',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
    },
    input: {
        backgroundColor: '#000',
        color: '#fff',
        borderWidth: 1,
        borderColor: '#B8860B',
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    modalButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        marginHorizontal: 5,
        borderRadius: 6,
    },
    cancelButton: {
        backgroundColor: '#333',
    },
    confirmButton: {
        backgroundColor: '#B8860B',
    },
    modalButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        borderRadius: 8,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#333',
        paddingHorizontal: 10,
    },

    passwordInput: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        paddingVertical: 12,
    },

    eyeButton: {
        paddingHorizontal: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
})

export default LoginModal;