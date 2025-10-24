import { useState } from "react";

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
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <div className="bg-app-black text-gray-100 min-h-screen flex flex-col items-center justify-start p-4 font-sans">
      <div className="w-full max-w-md mx-auto h-full flex flex-col items-center py-8">
        {/* Ícone Superior */}
        <div
          className="mb-6 p-3 rounded-full border-2 border-gold-dark shadow-xl"
          style={{ boxShadow: "0 0 15px rgba(212, 175, 55, 0.5)" }}
        >
          {/* Substituir Lucide por um ícone SVG próprio ou biblioteca de ícones */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-10 h-10 text-gold-accent"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7l3-7z"
            />
          </svg>
        </div>

        {/* Título Principal */}
        <h1 className="text-3xl font-extrabold tracking-widest text-gold-accent mb-8 uppercase border-b border-gold-dark pb-2">
          Regras do Tatame
        </h1>

        {/* Lista de Regras */}
        <div className="w-full space-y-4">
          {rules.map((rule) => (
            <div
              key={rule.number}
              className="rule-card bg-dark-bg p-4 rounded-xl border-l-4 border-gold-dark shadow-md transition-transform duration-200 hover:-translate-y-1"
            >
              <p className="text-lg font-bold text-gold-accent mb-2 flex items-center">
                <span className="text-2xl font-black mr-2">{rule.number}.</span>
                {rule.title}
              </p>
              <ul className="rule-list text-sm text-gray-300 space-y-1">
                {rule.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Barra Inferior */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-app-black border-t border-gray-800 flex justify-center items-center">
        <button
          onClick={() => setAcknowledged(true)}
          disabled={acknowledged}
          className={`w-3/4 py-3 rounded-xl font-semibold uppercase tracking-wider shadow-lg transition duration-200 focus:outline-none focus:ring-4 focus:ring-gold-dark focus:ring-opacity-50 ${
            acknowledged
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-gold-dark text-app-black hover:bg-gold-accent"
          }`}
        >
          {acknowledged ? "Você reconheceu as regras" : "Atesto que Li e Entendi"}
        </button>

        {/* Ícone de Configurações */}
        <button className="absolute right-4 p-2 text-gold-dark hover:text-gold-accent transition">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c1.5 0 2.5-1 3-2s1.5-2 3-2 2.5 1 3 2 1.5 2 3 2-1.5 1-3 2-2.5 1-3 2-1.5 2-3 2-2.5-1-3-2-1.5-2-3-2z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}