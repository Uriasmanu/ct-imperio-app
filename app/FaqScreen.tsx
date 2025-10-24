import { AntDesign } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "Quais modalidades de luta vocês oferecem?",
    answer: "Atualmente, oferecemos aulas de Jiu-Jitsu Brasileiro (BJJ), Muay Thai e Boxe. Temos turmas separadas para iniciantes, intermediários e avançados em todas as categorias. Consulte a recepção para saber sobre turmas infantis.",
  },
  {
    question: "Preciso ter experiência prévia para começar a treinar?",
    answer: "De forma alguma! Nossas aulas são estruturadas para receber alunos de todos os níveis, especialmente iniciantes. O foco principal é na técnica, segurança e no desenvolvimento gradual do condicionamento físico.",
  },
  {
    question: "Posso fazer uma aula experimental gratuita antes de me matricular?",
    answer: "Claro! Oferecemos a primeira aula experimental totalmente gratuita. Basta agendar seu horário com antecedência na recepção ou pelo WhatsApp.",
  },
  {
    question: "O que devo levar para o meu primeiro treino?",
    answer: "Roupas leves e confortáveis, uma toalha e uma garrafa d'água. Em modalidades que exigem kimono ou luvas, forneceremos o equipamento emprestado para o seu primeiro dia.",
  },
  {
    question: "Qual é o custo e quais são os planos disponíveis?",
    answer: "Temos planos mensais, trimestrais e anuais com descontos progressivos. Entre em contato para receber nossa tabela de preços detalhada.",
  },
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  const toggleAccordion = (index: number) => {
    setActiveIndex(prev => (prev === index ? null : index));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>FAQ</Text>
        <Text style={styles.subtitle}>Academia | Perguntas Frequentes</Text>
        <Text style={styles.desc}>
          Encontre respostas rápidas sobre treinos, horários e mensalidades.
        </Text>
      </View>

      {faqItems.map((item, index) => (
        <View key={index} style={styles.item}>
          <TouchableOpacity
            style={styles.question}
            onPress={() => toggleAccordion(index)}
          >
            <Text style={styles.questionText}>{item.question}</Text>
            <AntDesign
              name={activeIndex === index ? "up" : "down"}
              size={20}
              color="#D4AF37"
              style={styles.icon}
            />
          </TouchableOpacity>

          {activeIndex === index && (
            <Text style={styles.answer}>{item.answer}</Text>
          )}
        </View>
      ))}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Ainda tem dúvidas sobre como começar seu treino?
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowModal(true)}
        >
          <Text style={styles.buttonText}>Agende sua Aula Experimental</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Agendamento</Text>
            <Text style={styles.modalDesc}>
              Obrigado pelo seu interesse! Você seria redirecionado(a) para um formulário de agendamento online.
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.closeText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C1C1C",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#D4AF37",
  },
  subtitle: {
    fontSize: 18,
    color: "#E0C96D",
    marginTop: 4,
  },
  desc: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 8,
  },
  item: {
    backgroundColor: "#2B2B2B",
    borderRadius: 10,
    marginBottom: 10,
    padding: 15,
  },
  question: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  questionText: {
    color: "#E0C96D",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    paddingRight: 10,
  },
  icon: {
    marginTop: 4,
  },
  answer: {
    color: "#ddd",
    marginTop: 10,
    lineHeight: 20,
  },
  footer: {
    alignItems: "center",
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#D4AF37",
  },
  footerText: {
    color: "#ccc",
  },
  button: {
    marginTop: 10,
    backgroundColor: "#D4AF37",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  buttonText: {
    color: "#1C1C1C",
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#2B2B2B",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    color: "#D4AF37",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },
  modalDesc: {
    color: "#ccc",
    marginBottom: 20,
  },
  closeButton: {
    alignSelf: "flex-end",
    backgroundColor: "#D4AF37",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  closeText: {
    color: "#1C1C1C",
    fontWeight: "700",
  },
});