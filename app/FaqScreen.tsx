<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FAQ - Academia de Luta Black & Gold</title>
    <!-- Carregamento do Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Configuração da Fonte Inter e Cores Personalizadas -->
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'dark-gold': '#d4af37', // Dourado Clássico
                        'dark-gray': '#1a1a1a', // Preto muito escuro
                        'medium-gray': '#282828',
                        'light-gold-accent': '#ffecb3', // Toque de brilho
                    },
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    },
                }
            }
        }
    </script>
    <style>
        /* Estilos de transição para o acordeão */
        .faq-answer {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease-out, padding 0.3s ease-out;
        }
        .faq-item.active .faq-answer {
            max-height: 500px; /* Suficiente para a maioria das respostas */
            padding-top: 1rem;
            padding-bottom: 1rem;
        }
        .faq-item.active .arrow {
            transform: rotate(180deg);
        }
        .arrow {
            transition: transform 0.3s ease-out;
        }
        /* Definindo a fonte Inter */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
    </style>
</head>
<body class="bg-dark-gray font-sans text-gray-200 min-h-screen p-4 sm:p-8">

    <div class="max-w-4xl mx-auto py-8">
        <!-- Título Principal -->
        <header class="text-center mb-12">
            <h1 class="text-5xl sm:text-6xl font-extrabold text-dark-gold tracking-wider drop-shadow-lg">
                FAQ <span class="text-light-gold-accent text-3xl sm:text-4xl block mt-2">Academia | Perguntas Frequentes</span>
            </h1>
            <p class="mt-4 text-gray-400 text-lg">Encontre respostas rápidas sobre treinos, horários e mensalidades.</p>
        </header>

        <!-- Container do Acordeão -->
        <div id="faq-container" class="space-y-4">

            <!-- Item 1 do FAQ: Modalidades -->
            <div class="faq-item bg-medium-gray rounded-xl shadow-2xl overflow-hidden border-b border-dark-gold/50">
                <button class="faq-question w-full flex justify-between items-center p-5 sm:p-6 text-left focus:outline-none hover:bg-gray-700/50 transition duration-300">
                    <span class="text-lg sm:text-xl font-semibold text-light-gold-accent">Quais modalidades de luta vocês oferecem?</span>
                    <svg class="arrow w-6 h-6 text-dark-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <div class="faq-answer px-5 sm:px-6 text-gray-300 border-t border-dark-gold/20">
                    <p>Atualmente, oferecemos aulas de **Jiu-Jitsu Brasileiro (BJJ)**, **Muay Thai** e **Boxe**. Temos turmas separadas para iniciantes, intermediários e avançados em todas as categorias. Consulte a recepção para saber sobre turmas infantis.</p>
                </div>
            </div>

            <!-- Item 2 do FAQ: Experiência Prévia -->
            <div class="faq-item bg-medium-gray rounded-xl shadow-2xl overflow-hidden border-b border-dark-gold/50">
                <button class="faq-question w-full flex justify-between items-center p-5 sm:p-6 text-left focus:outline-none hover:bg-gray-700/50 transition duration-300">
                    <span class="text-lg sm:text-xl font-semibold text-light-gold-accent">Preciso ter experiência prévia para começar a treinar?</span>
                    <svg class="arrow w-6 h-6 text-dark-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <div class="faq-answer px-5 sm:px-6 text-gray-300 border-t border-dark-gold/20">
                    <p>De forma alguma! Nossas aulas são estruturadas para receber alunos de **todos os níveis**, especialmente iniciantes. O foco principal é na técnica, segurança e no desenvolvimento gradual do condicionamento físico. Nossos instrutores farão o acompanhamento de perto.</p>
                </div>
            </div>

            <!-- Item 3 do FAQ: Aula Experimental -->
            <div class="faq-item bg-medium-gray rounded-xl shadow-2xl overflow-hidden border-b border-dark-gold/50">
                <button class="faq-question w-full flex justify-between items-center p-5 sm:p-6 text-left focus:outline-none hover:bg-gray-700/50 transition duration-300">
                    <span class="text-lg sm:text-xl font-semibold text-light-gold-accent">Posso fazer uma aula experimental gratuita antes de me matricular?</span>
                    <svg class="arrow w-6 h-6 text-dark-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <div class="faq-answer px-5 sm:px-6 text-gray-300 border-t border-dark-gold/20">
                    <p>Claro! Oferecemos a primeira aula experimental **totalmente gratuita** para que você possa conhecer a equipe, o ambiente e a metodologia de treino. Basta agendar seu horário com antecedência na recepção ou pelo nosso WhatsApp.</p>
                </div>
            </div>

            <!-- Item 4 do FAQ: Uniforme e Equipamento -->
            <div class="faq-item bg-medium-gray rounded-xl shadow-2xl overflow-hidden border-b border-dark-gold/50">
                <button class="faq-question w-full flex justify-between items-center p-5 sm:p-6 text-left focus:outline-none hover:bg-gray-700/50 transition duration-300">
                    <span class="text-lg sm:text-xl font-semibold text-light-gold-accent">O que devo levar para o meu primeiro treino?</span>
                    <svg class="arrow w-6 h-6 text-dark-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <div class="faq-answer px-5 sm:px-6 text-gray-300 border-t border-dark-gold/20">
                    <p>Para a aula experimental, apenas traga **roupas leves** e confortáveis, uma toalha e uma garrafa d'água. Em modalidades que exigem kimono (BJJ) ou luvas (Boxe/Muay Thai), forneceremos o equipamento emprestado para o seu primeiro dia.</p>
                </div>
            </div>

            <!-- Item 5 do FAQ: Custos -->
            <div class="faq-item bg-medium-gray rounded-xl shadow-2xl overflow-hidden border-b border-dark-gold/50">
                <button class="faq-question w-full flex justify-between items-center p-5 sm:p-6 text-left focus:outline-none hover:bg-gray-700/50 transition duration-300">
                    <span class="text-lg sm:text-xl font-semibold text-light-gold-accent">Qual é o custo e quais são os planos disponíveis?</span>
                    <svg class="arrow w-6 h-6 text-dark-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <div class="faq-answer px-5 sm:px-6 text-gray-300 border-t border-dark-gold/20">
                    <p>Temos planos mensais, trimestrais e anuais com descontos progressivos. Os valores variam conforme o número de modalidades que você deseja treinar (1 modalidade ou Pacote Ilimitado). Não cobramos taxa de matrícula. Por favor, entre em contato para receber nossa tabela de preços detalhada.</p>
                </div>
            </div>

        </div>

        <!-- Rodapé/Call to Action -->
        <footer class="text-center mt-12 pt-6 border-t border-dark-gold/30">
            <p class="text-gray-500">Ainda tem dúvidas sobre como começar seu treino?</p>
            <button class="mt-3 px-8 py-3 bg-dark-gold text-dark-gray font-bold rounded-full hover:bg-yellow-500 transition duration-300 transform hover:scale-105 shadow-xl">
                Agende sua Aula Experimental
            </button>
        </footer>

    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const faqContainer = document.getElementById('faq-container');

            // Função para alternar o acordeão
            const toggleAccordion = (item) => {
                const isActive = item.classList.contains('active');
                
                // Fechar todos os itens (opcional, para ter apenas um aberto)
                // Se quiser que múltiplos fiquem abertos, remova o loop abaixo.
                document.querySelectorAll('.faq-item.active').forEach(activeItem => {
                    if (activeItem !== item) {
                        activeItem.classList.remove('active');
                    }
                });

                // Alternar o item clicado
                if (!isActive) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            };

            // Adicionar event listeners aos botões
            faqContainer.querySelectorAll('.faq-question').forEach(button => {
                button.addEventListener('click', () => {
                    const faqItem = button.closest('.faq-item');
                    if (faqItem) {
                        toggleAccordion(faqItem);
                    }
                });
                
                // Adicionar suporte a toque para dispositivos móveis (o 'click' já cobre, mas garante)
                button.addEventListener('touchstart', (e) => {
                    e.preventDefault(); // Previne o duplo clique em alguns navegadores
                    const faqItem = button.closest('.faq-item');
                    if (faqItem) {
                        toggleAccordion(faqItem);
                    }
                }, { passive: false });
            });
        });

        // Função para simular o alert com um modal customizado
        function showMessage(message) {
            const existingModal = document.getElementById('custom-modal');
            if (existingModal) existingModal.remove();

            const modalHtml = `
                <div id="custom-modal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div class="bg-medium-gray rounded-lg p-6 shadow-2xl max-w-sm w-full border border-dark-gold">
                        <h3 class="text-xl font-bold text-dark-gold mb-4">Agendamento</h3>
                        <p class="text-gray-300 mb-6">${message}</p>
                        <div class="text-right">
                            <button onclick="document.getElementById('custom-modal').remove()" 
                                class="px-5 py-2 bg-dark-gold text-dark-gray font-semibold rounded-md hover:bg-yellow-500 transition">
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        }

        // Exemplo de uso para o botão "Agende sua Aula Experimental"
        document.querySelector('footer button').addEventListener('click', () => {
            showMessage("Obrigado pelo seu interesse! Você seria redirecionado(a) para uma página/formulário de agendamento online.");
        });
    </script>
</body>
</html>

