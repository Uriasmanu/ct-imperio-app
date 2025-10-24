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
    answer:
      "Atualmente, oferecemos aulas de Jiu-Jitsu Brasileiro (BJJ), Muay Thai e Boxe. Temos turmas separadas para iniciantes, intermediários e avançados em todas as categorias. Consulte a recepção para saber sobre turmas infantis.",
  },
  {
    question: "Preciso ter experiência prévia para começar a treinar?",
    answer:
      "De forma alguma! Nossas aulas são estruturadas para receber alunos de todos os níveis, especialmente iniciantes. O foco principal é na técnica, segurança e no desenvolvimento gradual do condicionamento físico.",
  },
  {
    question: "Posso fazer uma aula experimental gratuita antes de me matricular?",
    answer:
      "Claro! Oferecemos a primeira aula experimental totalmente gratuita. Basta agendar seu horário com antecedência na recepção ou pelo WhatsApp.",
  },
  {
    question: "O que devo levar para o meu primeiro treino?",
    answer:
      "Roupas leves e confortáveis, uma toalha e uma garrafa d'água. Em modalidades que exigem kimono ou luvas, forneceremos o equipamento emprestado para o seu primeiro dia.",
  },
  {
    question: "Qual é o custo e quais são os planos disponíveis?",
    answer:
      "Temos planos mensais, trimestrais e anuais com descontos progressivos. Entre em contato para receber nossa tabela de preços detalhada.",
  },
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  const toggleAccordion = (index: number) => {
    setActiveIndex(prev => (prev === index ? null : index));
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>FAQ</Text>
        <Text style={styles.subtitle}>Academia | Perguntas Frequentes</Text>
        <Text style={styles.desc}>
          Encontre respostas rápidas sobre treinos, horários e mensalidades.
        </Text>
      </View>

      <View style={styles.faqContainer}>
        {faqItems.map((item, index) => (
          <View key={index} style={styles.item}>
            <TouchableOpacity
              style={styles.questionContainer}
              onPress={() => toggleAccordion(index)}
              activeOpacity={0.7}
            >
              <Text style={styles.questionText}>{item.question}</Text>
              <AntDesign
                name={activeIndex === index ? "up" : "down"}
                size={18}
                color="#D4AF37"
                style={styles.icon}
              />
            </TouchableOpacity>

            {activeIndex === index && (
              <View style={styles.answerContainer}>
                <Text style={styles.answer}>{item.answer}</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Ainda tem dúvidas sobre como começar seu treino?
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Agende sua Aula Experimental</Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Agendamento</Text>
            <Text style={styles.modalDesc}>
              Obrigado pelo seu interesse! Você seria redirecionado(a) para um formulário de agendamento online.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.closeButton]}
                onPress={() => setShowModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.closeText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#D4AF37",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#E0C96D",
    marginTop: 8,
    textAlign: "center",
  },
  desc: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 20,
    fontSize: 14,
  },
  faqContainer: {
    marginBottom: 20,
  },
  item: {
    backgroundColor: "#2B2B2B",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  questionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingVertical: 18,
  },
  questionText: {
    color: "#E0C96D",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    paddingRight: 12,
    lineHeight: 22,
  },
  icon: {
    marginLeft: 8,
  },
  answerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  answer: {
    color: "#ddd",
    lineHeight: 22,
    fontSize: 14,
  },
  footer: {
    alignItems: "center",
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#333",
    paddingHorizontal: 10,
  },
  footerText: {
    color: "#ccc",
    textAlign: "center",
    marginBottom: 16,
    fontSize: 15,
  },
  button: {
    backgroundColor: "#D4AF37",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
    minWidth: 200,
    alignItems: "center",
  },
  buttonText: {
    color: "#1C1C1C",
    fontWeight: "700",
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "#2B2B2B",
    padding: 24,
    borderRadius: 12,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    color: "#D4AF37",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  modalDesc: {
    color: "#ccc",
    marginBottom: 24,
    lineHeight: 20,
    textAlign: "center",
    fontSize: 14,
  },
  modalButtons: {
    alignItems: "center",
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    minWidth: 120,
    alignItems: "center",
  },
  closeButton: {
    backgroundColor: "#D4AF37",
  },
  closeText: {
    color: "#1C1C1C",
    fontWeight: "700",
    fontSize: 15,
  },
});