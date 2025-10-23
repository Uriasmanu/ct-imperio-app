import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "Quais modalidades de luta vocês oferecem?",
    answer:
      "Atualmente, oferecemos aulas de **Jiu-Jitsu Brasileiro (BJJ)**, **Muay Thai** e **Boxe**. Temos turmas separadas para iniciantes, intermediários e avançados em todas as categorias. Consulte a recepção para saber sobre turmas infantis.",
  },
  {
    question: "Preciso ter experiência prévia para começar a treinar?",
    answer:
      "De forma alguma! Nossas aulas são estruturadas para receber alunos de **todos os níveis**, especialmente iniciantes. O foco principal é na técnica, segurança e no desenvolvimento gradual do condicionamento físico. Nossos instrutores farão o acompanhamento de perto.",
  },
  {
    question:
      "Posso fazer uma aula experimental gratuita antes de me matricular?",
    answer:
      "Claro! Oferecemos a primeira aula experimental **totalmente gratuita** para que você possa conhecer a equipe, o ambiente e a metodologia de treino. Basta agendar seu horário com antecedência na recepção ou pelo nosso WhatsApp.",
  },
  {
    question: "O que devo levar para o meu primeiro treino?",
    answer:
      "Para a aula experimental, apenas traga **roupas leves** e confortáveis, uma toalha e uma garrafa d'água. Em modalidades que exigem kimono (BJJ) ou luvas (Boxe/Muay Thai), forneceremos o equipamento emprestado para o seu primeiro dia.",
  },
  {
    question: "Qual é o custo e quais são os planos disponíveis?",
    answer:
      "Temos planos mensais, trimestrais e anuais com descontos progressivos. Os valores variam conforme o número de modalidades que você deseja treinar (1 modalidade ou Pacote Ilimitado). Não cobramos taxa de matrícula. Por favor, entre em contato para receber nossa tabela de preços detalhada.",
  },
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  const toggleAccordion = (index: number) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="bg-dark-gray text-gray-200 min-h-screen p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-dark-gold tracking-wider drop-shadow-lg">
            FAQ{" "}
            <span className="text-light-gold-accent text-3xl sm:text-4xl block mt-2">
              Academia | Perguntas Frequentes
            </span>
          </h1>
          <p className="mt-4 text-gray-400 text-lg">
            Encontre respostas rápidas sobre treinos, horários e mensalidades.
          </p>
        </header>

        {/* FAQ */}
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className={`faq-item bg-medium-gray rounded-xl shadow-2xl overflow-hidden border-b border-dark-gold/50 transition-all duration-300 ${
                activeIndex === index ? "active" : ""
              }`}
            >
              <button
                className="faq-question w-full flex justify-between items-center p-5 sm:p-6 text-left focus:outline-none hover:bg-gray-700/50 transition duration-300"
                onClick={() => toggleAccordion(index)}
              >
                <span className="text-lg sm:text-xl font-semibold text-light-gold-accent">
                  {item.question}
                </span>
                <svg
                  className={`arrow w-6 h-6 text-dark-gold flex-shrink-0 transform transition-transform duration-300 ${
                    activeIndex === index ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </button>
              <div
                className={`faq-answer px-5 sm:px-6 text-gray-300 border-t border-dark-gold/20 transition-all duration-300 overflow-hidden ${
                  activeIndex === index ? "max-h-[500px] py-4" : "max-h-0"
                }`}
              >
                <p
                  dangerouslySetInnerHTML={{
                    __html: item.answer.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>"),
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 pt-6 border-t border-dark-gold/30">
          <p className="text-gray-500">
            Ainda tem dúvidas sobre como começar seu treino?
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-3 px-8 py-3 bg-dark-gold text-dark-gray font-bold rounded-full hover:bg-yellow-500 transition duration-300 transform hover:scale-105 shadow-xl"
          >
            Agende sua Aula Experimental
          </button>
        </footer>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-medium-gray rounded-lg p-6 shadow-2xl max-w-sm w-full border border-dark-gold">
              <h3 className="text-xl font-bold text-dark-gold mb-4">
                Agendamento
              </h3>
              <p className="text-gray-300 mb-6">
                Obrigado pelo seu interesse! Você seria redirecionado(a) para
                uma página/formulário de agendamento online.
              </p>
              <div className="text-right">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 bg-dark-gold text-dark-gray font-semibold rounded-md hover:bg-yellow-500 transition"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}