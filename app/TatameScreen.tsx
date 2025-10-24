
import { ShieldCheck } from "lucide-react-native";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

interface Rule {
  number: number;
  title: string;
  items: string[];
}

const rules: Rule[] = [
  {
    number: 1,
    title: "Etiqueta e Respeito",
    items: [
      "Cumprimente ao entrar e sair do tatame.",
      "Cumprimente por ordem de GRADUAÇÃO.",
      "Respeite mestres, instrutores e colegas em todos os momentos.",
    ],
  },
  {
    number: 2,
    title: "Higiene Pessoal",
    items: [
      "KIMONO e FAIXA devem estar SEMPRE lavados e limpos.",
      "Mantenha UNHAS CURTAS (mãos e pés).",
      "Utilize DESODORANTE nas axilas.",
      "DENTES ESCOVADOS e hálito fresco.",
      "Cabelos longos devem estar presos.",
    ],
  },
  {
    number: 3,
    title: "Uniforme e Segurança",
    items: [
      "Apenas KIMONO PRETO é permitido para treino.",
      "CAMISETA ou RASHGUARD (sem decote) é obrigatória por baixo do kimono.",
      "Use SHORT por baixo da calça do kimono.",
      "Sem joias, brincos, piercings ou relógios no tatame.",
    ],
  },
  {
    number: 4,
    title: "Pontualidade e Preparação",
    items: [
      "CHEGAR NO HORÁRIO da aula ou peça permissão ao instrutor se atrasado.",
      "Traga e ENCHA sua GARRAFA DE ÁGUA antes da aula começar.",
      "Sem calçados no tatame. Mantenha os chinelos nos pés ao sair do tatame e ao retornar.",
    ],
  },
  {
    number: 5,
    title: "Foco e Conduta",
    items: [
      "Sempre peça permissão ao professor antes de SAIR ou ENTRAR no tatame durante a aula.",
      "Treine com controle e comunique lesões.",
      "Mantenha o FOCO e a disciplina (Celulares desligados ou guardados).",
      "Ajude a manter o tatame e as áreas comuns limpas.",
    ],
  },
];

export default function Rules() {

  return (
    <View style={styles.container}>
      {/* Ícone Superior */}
      <View style={styles.iconContainer}>
        <ShieldCheck size={35} color="#d4af37"/>
      </View>

      {/* Título */}
      <Text style={styles.title}>Regras do Tatame</Text>

      {/* Lista de Regras */}
      <ScrollView style={styles.scroll}>
        {rules.map((rule) => (
          <View key={rule.number} style={styles.ruleCard}>
            <Text style={styles.ruleTitle}>
              <Text style={styles.ruleNumber}>{rule.number}. </Text>
              {rule.title}
            </Text>

            {rule.items.map((item, idx) => (
              <Text key={idx} style={styles.ruleItem}>
                • {item}
              </Text>
            ))}
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0b0b",
    alignItems: "center",
    paddingVertical: 10
  },
  iconContainer: {
    padding: 10,
    borderWidth: 2,
    borderColor: "#b8860b",
    borderRadius: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#d4af37",
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderColor: "#b8860b",
    paddingBottom: 8,
    marginBottom: 20,
  },
  scroll: {
    width: "90%",
  },
  ruleCard: {
    backgroundColor: "#1a1a1a",
    borderLeftWidth: 4,
    borderLeftColor: "#b8860b",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  ruleTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#d4af37",
    marginBottom: 6,
  },
  ruleNumber: {
    fontSize: 20,
    fontWeight: "900",
    marginRight: 6,
  },
  ruleItem: {
    fontSize: 13,
    color: "#ccc",
    marginLeft: 6,
    marginBottom: 2,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#0b0b0b",
    borderTopWidth: 1,
    borderTopColor: "#222",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    width: "80%",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonActive: {
    backgroundColor: "#b8860b",
  },
  buttonDisabled: {
    backgroundColor: "#444",
  },
  buttonText: {
    fontWeight: "600",
    textTransform: "uppercase",
  },
  textActive: {
    color: "#0b0b0b",
  },
  textDisabled: {
    color: "#888",
  },
  settingsButton: {
    position: "absolute",
    right: 20,
    top: "30%",
  },
});
