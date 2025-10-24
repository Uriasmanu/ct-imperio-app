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

const SettingsScreen = () => {
  const [showVersionInfo, setShowVersionInfo] = useState(false);

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

  const toggleVersionInfo = () => {
    setShowVersionInfo(!showVersionInfo);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem} onPress={handlePrivacyPolicy}>
          <Text style={styles.menuText}>Política de Privacidade</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        {/* Accordion para Atualizações */}
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
    fontSize: 16,
    fontWeight: '600',
    color: '#B8860B',
    marginVertical: 12,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#B8860B',
  },
  menuText: {
    fontSize: 16,
    color: '#B8860B',
    fontWeight: '500',
  },
  menuArrow: {
    fontSize: 18,
    color: '#B8860B',
    fontWeight: 'bold',
  },
  // Estilos do Accordion
  accordionContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#B8860B',
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
    borderTopColor: '#B8860B',
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
    color: '#B8860B',
    fontWeight: '500',
    flex: 1,
    opacity: 0.9,
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
    color: '#B8860B',
    marginBottom: 4,
    fontWeight: '500',
  },
});

export default SettingsScreen;