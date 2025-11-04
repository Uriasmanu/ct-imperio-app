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

export const COLORS = {
  PRIMARY: "#007AFF",
  BACKGROUND: "#F5F5F5",
  WHITE: "#FFFFFF",
  BORDER: "#E0E0E0",
};

export const appConfig = {
  version: "1.1",
  lastUpload: "27/10/2025",
  features: ["Correção de bugs"],
};

// Dados mockados da academia - você pode substituir por dados reais
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
    answer: "Atualmente, oferecemos aulas de Jiu-Jitsu Brasileiro (BJJ), Muay Thai e Boxe. Consulte a recepção para saber sobre turmas infantis.",
  },
  {
    question: "Preciso ter experiência prévia para começar a treinar?",
    answer: "De forma alguma! Nossas aulas são estruturadas para receber alunos de todos os níveis, especialmente iniciantes. O foco principal é na técnica, segurança e no desenvolvimento gradual do condicionamento físico.",
  },
  {
    question: "Posso fazer uma aula experimental antes de me matricular?",
    answer: "Claro! Basta agendar seu horário com antecedência na recepção ou pelo WhatsApp.",
  },
  {
    question: "O que devo levar para o meu primeiro treino?",
    answer: "Roupas leves e confortáveis, uma toalha e uma garrafa d'água. Em modalidades que exigem kimono ou luvas, forneceremos o equipamento emprestado para o seu primeiro dia.",
  },
  {
    question: "Qual é o custo e quais são os planos disponíveis?",
    answer: "Temos planos mensais, trimestrais e anuais com descontos progressivos. Entre em contato para receber nossa tabela de preços detalhada.",
  },
  {
    question: "Vocês oferecem horários flexíveis?",
    answer: "Sim! Temos turmas em diversos horários pela manhã, tarde e noite durante a semana, e também aulas aos sábados pela manhã.",
  },
  {
    question: "Há restrições de idade para treinar?",
    answer: "Oferecemos turmas para todas as idades a partir de 5 anos. Para crianças de 5 a 12 anos, temos aulas específicas com metodologia adaptada.",
  },
  // Novas perguntas e respostas adicionadas
  {
    question: "Qual é a diferença entre Muay Thai, Boxe e Jiu-Jitsu?",
    answer: "Muay Thai é uma arte marcial tailandesa que utiliza socos, chutes, cotoveladas e joelhadas. Boxe foca apenas em socos com as mãos. Jiu-Jitsu é uma luta de solo com foco em finalizações, imobilizações e estrangulamentos. Cada uma desenvolve habilidades diferentes e são complementares.",
  },
  {
    question: "Posso treinar mais de uma modalidade ao mesmo tempo?",
    answer: "Sim! Inclusive recomendamos para um desenvolvimento marcial mais completo. Temos pacotes especiais para alunos que desejam praticar múltiplas modalidades.",
  },
  {
    question: "Qual é a melhor arte marcial para defesa pessoal?",
    answer: "Todas as modalidades que oferecemos são eficazes para defesa pessoal. Muay Thai e Boxe são excelentes para situações em pé, enquanto Jiu-Jitsu é ideal para situações de grappling e solo. A combinação de ambas oferece uma preparação mais completa.",
  },
  {
    question: "Tem aulas para iniciantes?",
    answer: "Sim! Temos turmas específicas para iniciantes em todas as modalidades, com foco nos fundamentos básicos e adaptação gradual ao treinamento.",
  },
  {
    question: "Quais são os horários das aulas?",
    answer: "Nossos horários variam por modalidade. Temos aulas pela manhã (6h-12h), tarde (14h-18h) e noite (19h-22h) de segunda a sexta, e aulas aos sábados pela manhã. Consulte a recepção para o horário específico de cada modalidade.",
  },
  {
    question: "Preciso marcar aula ou posso chegar no horário?",
    answer: "Para alunos matriculados, pode chegar no horário da aula. Para aula experimental, solicitamos que agende previamente para melhor atendimento.",
  },
  {
    question: "Quanto tempo dura cada treino?",
    answer: "Nossas aulas têm duração média de 1 hora a 1h30, dependendo da modalidade e do nível da turma.",
  },
  {
    question: "Há planos trimestrais, semestrais ou anuais com desconto?",
    answer: "Sim! Oferecemos descontos progressivos para planos de longer duration: 5% trimestral, 10% semestral e 15% anual.",
  },
  {
    question: "Vocês aceitam cartão, PIX ou gympass?",
    answer: "Aceitamos todas as formas de pagamento: cartão de crédito/débito, PIX, dinheiro e também trabalhamos com Gympass e TotalPass.",
  },
  {
    question: "Existe taxa de matrícula?",
    answer: "Não cobramos taxa de matrícula. O valor inclui apenas a mensalidade do plano escolhido.",
  },
  {
    question: "Preciso comprar meus próprios equipamentos?",
    answer: "Para as primeiras aulas, fornecemos equipamentos básicos. Recomendamos que adquira seus próprios equipamentos pessoais após decidir continuar com os treinos.",
  },
  {
    question: "A academia fornece luvas, kimono ou caneleiras?",
    answer: "Sim, temos equipamentos disponíveis para empréstimo nas primeiras aulas. Após isso, orientamos sobre a aquisição do material pessoal.",
  },
  {
    question: "É obrigatório usar uniforme?",
    answer: "Para Jiu-Jitsu é obrigatório o kimono. Para Muay Thai e Boxe, roupas de treino adequadas (shorts e camiseta). Temos uniformes disponíveis para compra na academia.",
  },
  {
    question: "Preciso estar em forma para começar?",
    answer: "Não! Os treinos são adaptados para todos os níveis de condicionamento. O objetivo é justamente ajudar você a melhorar sua forma física gradualmente.",
  },
  {
    question: "Os treinos ajudam a emagrecer?",
    answer: "Sim! As artes marciais são excelentes para queima calórica e definição muscular. Uma aula pode queimar entre 500-800 calorias, dependendo da intensidade.",
  },
  {
    question: "Há risco de lesão?",
    answer: "Como em qualquer atividade física, há riscos, mas minimizamos através de aquecimento adequado, supervisão constante e técnicas de ensino progressivas. A segurança é nossa prioridade.",
  },
  {
    question: "Tem aquecimento e alongamento antes das aulas?",
    answer: "Sim! Todas as aulas incluem aquecimento completo no início e alongamento no final, essenciais para prevenir lesões.",
  },
  {
    question: "É necessário fazer exame médico?",
    answer: "Recomendamos que todos os alunos realizem avaliação médica antes de iniciar qualquer atividade física intensa, especialmente se possuem condições preexistentes.",
  },
  {
    question: "A partir de que idade as crianças podem treinar?",
    answer: "Aceitamos crianças a partir de 5 anos em nossas turmas infantis, com metodologia específica e lúdica para cada faixa etária.",
  },
  {
    question: "As aulas infantis são diferentes das de adultos?",
    answer: "Sim! As aulas infantis focam em desenvolvimento motor, disciplina, coordenação e defesa pessoal básica, tudo de forma lúdica e segura.",
  },
  {
    question: "A academia participa de campeonatos?",
    answer: "Sim! Participamos regularmente de competições locais, estaduais e nacionais. Temos alunos competidores em todas as modalidades.",
  },
  {
    question: "Posso competir mesmo sendo iniciante?",
    answer: "Sim! Existem categorias para todos os níveis, incluindo iniciantes. Nossos professores avaliam e preparam alunos interessados em competir.",
  },
];
