import { ESTABELECIMENTO_PIX, gerarPayloadExato } from '@/services/pix/pix.constants';
import { pixTatameTheme } from '@/styles/theme';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import QRCode from 'react-native-qrcode-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function PagamentoPixScreen() {
    const [copied, setCopied] = useState(false);

    const copiarChavePix = async () => {
        try {

            const cnpjFormatado = ESTABELECIMENTO_PIX.chavePix.replace(
                /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
                '$1.$2.$3/$4-$5'
            );

            await Clipboard.setStringAsync(cnpjFormatado);
            setCopied(true);

            Alert.alert(
                "CNPJ copiado!",
                "O CNPJ foi copiado para a área de transferência.",
                [{ text: "OK" }]
            );

            setTimeout(() => setCopied(false), 3000);
        } catch (error) {
            Alert.alert("Erro", "Não foi possível copiar o CNPJ");
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <FontAwesome5 name="qrcode" size={32} color={pixTatameTheme.colors.primary} />
                    </View>
                    <Text style={styles.title}>PAGAMENTO PIX</Text>
                </View>

                {/* Card Principal */}
                <View style={styles.card}>
                    {/* QR Code */}
                    <View style={styles.qrCodeContainer}>
                        <View style={styles.qrCodeWrapper}>
                            {/* Use gerarPayloadExato() para gerar exatamente o mesmo QR Code */}
                            <QRCode
                                value={gerarPayloadExato()}
                                size={screenWidth * 0.6}
                                color={pixTatameTheme.colors.background}
                                backgroundColor="#FFFFFF"
                                logoSize={60}
                                logoMargin={10}
                                logoBorderRadius={30}
                                logoBackgroundColor="transparent"
                            />

                            {/* Overlay do Logo PIX */}
                            <View style={styles.pixLogoOverlay}>
                                <View style={styles.pixLogo}>
                                    <Text style={styles.pixLogoText}>PIX</Text>
                                </View>
                            </View>
                        </View>

                        <Text style={styles.qrCodeInstruction}>
                            Aponte a câmera do seu app bancário para escanear
                        </Text>
                    </View>

                    {/* Informações do Beneficiário */}
                    <View style={styles.infoSection}>
                        <View style={styles.infoRow}>
                            <MaterialIcons
                                name="person"
                                size={20}
                                color={pixTatameTheme.colors.text.muted}
                                style={styles.infoIcon}
                            />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Beneficiário:</Text>
                                <Text style={styles.infoValue}>WILLIAM IZARIAS DE OLIVEI</Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <MaterialIcons
                                name="business"
                                size={20}
                                color={pixTatameTheme.colors.text.muted}
                                style={styles.infoIcon}
                            />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Instituição:</Text>
                                <Text style={styles.infoValue}>MERCADO PAGO</Text>
                            </View>
                        </View>
                    </View>

                    {/* Chave PIX (CNPJ) */}
                    <View style={styles.chavePixSection}>
                        <Text style={styles.sectionTitle}>CHAVE PIX (CNPJ)</Text>

                        <View style={styles.chavePixContainer}>
                            <Text style={styles.chavePixText} selectable>
                                37.553.172/0001-00
                            </Text>

                            <TouchableOpacity
                                style={[
                                    styles.copyButton,
                                    copied && styles.copyButtonActive
                                ]}
                                onPress={copiarChavePix}
                            >
                                {copied ? (
                                    <>
                                        <MaterialIcons name="check" size={20} color={pixTatameTheme.colors.success} />
                                        <Text style={[styles.copyButtonText, { color: pixTatameTheme.colors.success }]}>
                                            Copiado!
                                        </Text>
                                    </>
                                ) : (
                                    <>
                                        <MaterialIcons name="content-copy" size={20} color={pixTatameTheme.colors.primary} />
                                        <Text style={styles.copyButtonText}>Copiar</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: pixTatameTheme.colors.background,
    },
    scrollContent: {
        paddingBottom: pixTatameTheme.spacing.xl,
    },
    header: {
        alignItems: "center",
        paddingTop: screenHeight * 0.02,
        paddingBottom: pixTatameTheme.spacing.lg,
        backgroundColor: pixTatameTheme.colors.background,
        borderBottomWidth: 1,
        borderBottomColor: pixTatameTheme.colors.border,
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
    card: {
        backgroundColor: pixTatameTheme.colors.card,
        marginHorizontal: pixTatameTheme.spacing.md,
        borderRadius: 16,
        padding: pixTatameTheme.spacing.lg,
        marginTop: pixTatameTheme.spacing.md,
        borderWidth: 1,
        borderColor: pixTatameTheme.colors.border,
    },
    qrCodeContainer: {
        alignItems: 'center',
        marginBottom: pixTatameTheme.spacing.lg,
    },
    qrCodeWrapper: {
        backgroundColor: '#FFFFFF',
        padding: pixTatameTheme.spacing.md,
        borderRadius: 12,
        marginBottom: pixTatameTheme.spacing.md,
        position: 'relative',
        shadowColor: pixTatameTheme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    pixLogoOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pixLogo: {
        backgroundColor: '#32BCAD',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.9,
    },
    pixLogoText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    qrCodeInstruction: {
        color: pixTatameTheme.colors.text.secondary,
        textAlign: 'center',
        fontSize: pixTatameTheme.typography.caption,
        marginTop: pixTatameTheme.spacing.sm,
    },
    testButtonText: {
        color: pixTatameTheme.colors.text.muted,
        fontSize: pixTatameTheme.typography.caption,
    },
    chavePixSection: {
        marginBottom: pixTatameTheme.spacing.lg,
    },
    sectionTitle: {
        color: pixTatameTheme.colors.text.muted,
        fontSize: pixTatameTheme.typography.caption,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: pixTatameTheme.spacing.sm,
    },
    chavePixContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: pixTatameTheme.spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.3)',
    },
    chavePixText: {
        color: pixTatameTheme.colors.text.secondary,
        fontSize: pixTatameTheme.typography.body,
        fontFamily: 'monospace',
        flex: 1,
        marginRight: pixTatameTheme.spacing.sm,
        letterSpacing: 1,
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: pixTatameTheme.spacing.sm,
        paddingHorizontal: pixTatameTheme.spacing.md,
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: pixTatameTheme.colors.border,
        gap: pixTatameTheme.spacing.xs,
    },
    copyButtonActive: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: pixTatameTheme.colors.success,
    },
    copyButtonText: {
        color: pixTatameTheme.colors.primary,
        fontWeight: '600',
        fontSize: pixTatameTheme.typography.caption,
    },
    chavePixDescription: {
        color: pixTatameTheme.colors.text.muted,
        fontSize: pixTatameTheme.typography.caption,
        marginTop: pixTatameTheme.spacing.sm,
        fontStyle: 'italic',
    },
    stepNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: pixTatameTheme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2,
    },
    stepNumberText: {
        color: pixTatameTheme.colors.background,
        fontSize: 12,
        fontWeight: 'bold',
    },
    instructionText: {
        color: pixTatameTheme.colors.text.secondary,
        fontSize: pixTatameTheme.typography.body,
        flex: 1,
        lineHeight: 20,
    },
    infoSection: {
        backgroundColor: 'rgba(212, 175, 55, 0.05)',
        borderRadius: 12,
        padding: pixTatameTheme.spacing.md,
        marginBottom: pixTatameTheme.spacing.lg,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.2)',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: pixTatameTheme.spacing.sm,
        gap: pixTatameTheme.spacing.sm,
    },
    infoIcon: {
        marginTop: 2,
    },
    infoContent: {
        flex: 1,
        flexDirection: 'column',
    },
    infoLabel: {
        color: pixTatameTheme.colors.text.muted,
        fontSize: pixTatameTheme.typography.caption,
        fontWeight: '500',
        marginBottom: 2,
    },
    infoValue: {
        color: pixTatameTheme.colors.text.secondary,
        fontSize: pixTatameTheme.typography.body,
        flex: 1,
        lineHeight: 20,
    },
});