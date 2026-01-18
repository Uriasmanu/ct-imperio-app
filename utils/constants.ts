export const AD_IDS = {
  BANNER: {
    TEST: "ca-app-pub-3940256099942544/6300978111",
    IOS: "seu-id-real-ios",
    ANDROID: "ca-app-pub-4527741505458161/6382062864",
  },
  INTERSTITIAL: {
    TEST: "ca-app-pub-3940256099942544/1033173712",
    IOS: "seu-id-real-ios",
    ANDROID: "ca-app-pub-4527741505458161/6382062864",
  },
};

export const carouselImages = [
  require("@/assets/images/graduacaoThai.jpeg"),
  require("@/assets/images/graduacaoJiu.jpeg"),
  require("@/assets/images/Muay.jpeg"),
  require("@/assets/images/boxe.jpeg"),
  require("@/assets/images/jiu-feminino.jpeg"),
  require("@/assets/images/jiu-misto.jpeg"),
  require("@/assets/images/jiu-baby.jpeg"),
  require("@/assets/images/no-gi.jpeg"),
  require("@/assets/images/jiu-mirim.jpeg"),
  require("@/assets/images/muay-kids.jpeg"),
  require("@/assets/images/jiu-infantil.jpeg"),
];

export const appConfig = {
  version: "2.0",
  lastUpload: "14/01/2026",
  features: ["Correção de bugs"],
};

export const gymData = {
  name: "CT Império",
  address: "Rua Araraquara, 193 - Centro\nMarília - São Paulo",
  phone: "+55 (14) 99785-6670",
  instructor: "Mestre Will Izarias",
  hours: "Segunda a Sexta: 08:00 - 20:30\nSábado: 08:00 - 12:00",
};

interface FAQItem {
  question: string;
  answer: string;
}

export const faqItems: FAQItem[] = [
  {
    question: "Quais modalidades de luta vocês oferecem?",
    answer:
      "Atualmente oferecemos Jiu-Jitsu Brasileiro (BJJ), Muay Thai, Boxe e MMA. Consulte a recepção para informações sobre turmas infantis.",
  },
  {
    question: "Preciso ter experiência prévia para começar a treinar?",
    answer:
      "De forma alguma! As aulas são estruturadas para todos os níveis, especialmente iniciantes. O foco é a técnica, a segurança e o condicionamento físico progressivo.",
  },
  {
    question: "Posso fazer uma aula experimental antes de me matricular?",
    answer:
      "Sim! Basta agendar seu horário com antecedência pela recepção ou WhatsApp.",
  },
  {
    question: "O que devo levar para o meu primeiro treino?",
    answer: "Roupas leves e confortáveis, além de uma garrafa d'água.",
  },
  {
    question: "Qual é o custo e quais são os planos disponíveis?",
    answer:
      "Os valores variam conforme a quantidade de aulas por semana: 1x — R$90, 2x — R$100, 3x — R$110, 4x — R$130, 5x — R$150. O plano Passe Free permite treinar em qualquer horário e modalidade por R$190.",
  },
  {
    question:
      "Vocês aceitam  qual forma de pagamento da mensalidade. Cartão, PIX ou Gympass?",
    answer: "Aceitamos cartões, PIX, dinheiro, Gympass e TotalPass.",
  },
  {
    question: "Vocês oferecem horários flexíveis?",
    answer:
      "Sim! Temos turmas pela manhã e noite durante a semana, além de aulas aos sábados pela manhã.",
  },
  {
    question: "Há restrições de idade para treinar?",
    answer:
      "Atendemos todas as idades a partir de 1 ano e 11 meses. Para crianças de 1 a 12 anos, as aulas possuem metodologia adaptada.",
  },
  {
    question: "Qual é a diferença entre Muay Thai, Boxe, Jiu-Jitsu e MMA?",
    answer:
      "Muay Thai utiliza socos, chutes, joelhadas e cotoveladas. O Boxe trabalha exclusivamente golpes com as mãos. Jiu-Jitsu é focado no solo, com imobilizações e finalizações. O MMA combina técnicas de todas essas modalidades.",
  },
  {
    question: "Posso treinar mais de uma modalidade ao mesmo tempo?",
    answer:
      "Sim! Inclusive recomendamos para um desenvolvimento mais completo. Temos pacotes especiais para quem deseja praticar múltiplas modalidades.",
  },
  {
    question: "Qual é a melhor arte marcial para defesa pessoal?",
    answer:
      "Todas são eficazes para defesa pessoal: Muay Thai e Boxe são fortes no combate em pé, enquanto Jiu-Jitsu é ideal no solo. A combinação das modalidades traz uma preparação mais completa.",
  },
  {
    question: "Quais são os horários das aulas?",
    answer:
      "Os horários variam por modalidade. Temos aulas de manhã (8h–9h) e à noite (18h30–21h) de segunda a sexta, além de aulas aos sábados pela manhã. Consulte a recepção para a grade completa.",
  },
  {
    question: "Preciso marcar aula ou posso chegar no horário?",
    answer:
      "Alunos matriculados podem comparecer diretamente no horário da aula. Para aula experimental, é necessário agendamento prévio.",
  },
  {
    question: "Quanto tempo dura cada treino?",
    answer:
      "A duração média das aulas é de 1 hora, variando conforme a modalidade.",
  },
  {
    question: "Existe taxa de matrícula?",
    answer:
      "Sim, a taxa de matrícula é de R$15. O valor inclui apenas a mensalidade do plano escolhido.",
  },
  {
    question: "Preciso comprar meus próprios equipamentos?",
    answer:
      "Recomendamos adquirir seus próprios equipamentos pessoais após decidir continuar os treinos.",
  },
  {
    question: "É obrigatório usar uniforme?",
    answer:
      "Para Jiu-Jitsu, sim — é obrigatório o uso do kimono. Para Muay Thai e Boxe, recomenda-se roupas de treino adequadas. Também temos uniformes disponíveis para compra.",
  },
  {
    question: "Preciso estar em forma para começar?",
    answer:
      "Não! Os treinos são adaptados para qualquer nível de condicionamento. A melhora física vem com a prática.",
  },
  {
    question: "Os treinos ajudam a emagrecer?",
    answer:
      "Sim! As artes marciais são excelentes para queima calórica. Uma aula pode queimar entre 500 e 800 calorias, dependendo da intensidade.",
  },
  {
    question: "Há risco de lesão?",
    answer:
      "Como em qualquer atividade física, riscos existem, mas são minimizados com aquecimento adequado, supervisão constante e ensino progressivo.",
  },
  {
    question: "Tem aquecimento e alongamento antes das aulas?",
    answer:
      "Sim! Todas as aulas incluem aquecimento no início e alongamento no final.",
  },
  {
    question: "É necessário fazer exame médico?",
    answer:
      "Recomendamos avaliação médica antes de iniciar atividades físicas intensas, especialmente para quem possui condições pré-existentes.",
  },
  {
    question: "As aulas infantis são diferentes das de adultos?",
    answer:
      "Sim! Para crianças, as aulas têm foco em coordenação, disciplina, desenvolvimento motor e defesa pessoal básica, sempre de forma lúdica e segura.",
  },
  {
    question: "A academia participa de campeonatos?",
    answer:
      "Sim! Competimos em eventos locais, estaduais e nacionais. Temos alunos competidores em todas as modalidades.",
  },
  {
    question: "Posso competir mesmo sendo iniciante?",
    answer:
      "Sim! Há categorias para iniciantes. Os professores orientam e preparam quem deseja competir.",
  },
];

interface Rule {
  number: number;
  title: string;
  items: string[];
}

export const rules: Rule[] = [
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
