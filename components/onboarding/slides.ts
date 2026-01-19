export type SlideType = {
  key: string;
  title: string;
  subtitle: string;
  image: any;
  backgroundColor: string;
  titleColor?: string;
  subtitleColor?: string;
};

export const slides: SlideType[] = [
  {
    key: "slide1",
    title: "Bem-vindo à CT Império",
    subtitle: "Sua academia agora na palma da mão",
    image: require("../../assets/onboarding/inicio.png"),
    backgroundColor: "#000",
    titleColor: "#FFFFFF",
    subtitleColor: "#CCCCCC",
  },
  {
    key: "slide2",
    title: "Cronograma de Aulas",
    subtitle: "Acompanhe horários, professores e status em tempo real",
    image: require("../../assets/onboarding/cronograma.png"),
    backgroundColor: "#000",
    titleColor: "#FFFFFF",
    subtitleColor: "#CCCCCC",
  },
  {
    key: "slide3",
    title: "Faça seu Registro",
    subtitle: "Crie sua conta em poucos passos e comece hoje mesmo",
    image: require("../../assets/onboarding/registrese.png"),
    backgroundColor: "#000",
    titleColor: "#FFFFFF",
    subtitleColor: "#CCCCCC",
  },
  {
    key: "slide4",
    title: "Gerencie seu cadastro",
    subtitle: "Cadastre filhos e acompanhe todos em uma só conta",
    image: require("../../assets/onboarding/registreFilhos.png"),
    backgroundColor: "#000",
    titleColor: "#FFFFFF",
    subtitleColor: "#CCCCCC",
  },
  {
    key: "slide5",
    title: "Controle de Frequência",
    subtitle: "Marque presença e veja seu histórico de participação",
    image: require("../../assets/onboarding/AvisePresenca.png"),
    backgroundColor: "#000",
    titleColor: "#FFFFFF",
    subtitleColor: "#CCCCCC",
  },
  {
    key: "slide6",
    title: "Aviso de Pagamento",
    subtitle: "Informe quando realizar seu pagamento mensal",
    image: require("../../assets/onboarding/avisePagamento.png"),
    backgroundColor: "#000",
    titleColor: "#FFFFFF",
    subtitleColor: "#CCCCCC",
  },
  {
    key: "slide7",
    title: "Pagamento Rápido",
    subtitle: "Use PIX para pagamentos instantâneos e seguros",
    image: require("../../assets/onboarding/informacaoPagamento.png"),
    backgroundColor: "#000",
    titleColor: "#FFFFFF",
    subtitleColor: "#CCCCCC",
  },
  {
    key: "slide8",
    title: "Equipamentos Oficiais",
    subtitle: "Compre uniformes e acessórios direto pelo app",
    image: require("../../assets/onboarding/nossosProdutos.png"),
    backgroundColor: "#000",
    titleColor: "#FFFFFF",
    subtitleColor: "#CCCCCC",
  },
];
