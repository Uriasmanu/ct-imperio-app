import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export const LoadingScreen: React.FC = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#B8860B" />
    <Text style={styles.loadingText}>Verificando permissões...</Text>
  </View>
);

const styles = StyleSheet.create({
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#000" 
  },
  loadingText: { 
    color: "#FFF", 
    marginTop: 10 
  },
});