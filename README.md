🏴‍☠️ Pirate Battle — Diário de Bordo do Capitão
Ahoy, marujo! Bem-vindo ao convés do Pirate Battle. Neste diário de bordo, encontrara as instruções para preparar a embarcação, comandar os canhões, enfrentar a frota inimiga e investigar qualquer tempestade técnica pelo caminho, e se você tiver sorte obter a gloria. 
E lembresse nosso capitão, Capitão Jack.....

Pirate Battle é um jogo de batalha naval 2D desenvolvido com React, TypeScript e PixiJS 8. O objetivo é sobreviver aos ataques inimigos e acumular pontos antes que o tempo acabe.
⚓ Nota do capitão: as instruções técnicas abaixo são literais. Funcionalidades ainda não verificadas estão marcadas para confirmação — nenhum mapa deve prometer ilhas que ainda não foram descobertas.

🧰 Ferramentas da Tripulação — Tecnologias
- React e TypeScript
- PixiJS 8 para renderização 2D
- Vite para desenvolvimento e build
- Armazenamento local (localStorage) para histórico de partidas
⚓ Preparando a Embarcação — Instalação
Antes de içar as velas, instale uma versão do Node.js compatível com o projeto (consulte package.json) e o npm.
npm install
npm run dev
Abra a URL indicada pelo Vite no terminal (normalmente http://localhost:5173).
Windows/PowerShell: se o PowerShell bloquear npm.ps1, utilize npm.cmd em vez de npm nos comandos.

⛵ Ordens do Convés — Comandos
Objetivo	Comando
Instalar dependências	npm install
Desenvolvimento	npm run dev
Build de produção	npm run build
Pré-visualizar o build	npm run preview
Lint	npm run lint
Verificação de tipos	npx tsc --noEmit
Playwright (se configurado)	npx playwright test
Playwright com interface (se configurado)	npx playwright test --ui
Relatório do Playwright (se gerado)	npx playwright show-report


Observação: os scripts dev, build, preview e lint devem existir em package.json para funcionar. Os comandos Playwright exigem @playwright/test, navegadores instalados (npx playwright install) e testes configurados no repositório. Não são apresentados como testes já existentes.
🧭 Instrumentos de Navegação — Variáveis de Ambiente
O jogo, na implementação descrita aqui, utiliza recursos locais e não exige credenciais externas conhecidas para iniciar. Caso o projeto possua um arquivo .env.example, copie-o para .env e preencha as variáveis documentadas nele.
# Exemplo somente se existir um arquivo .env.example
cp .env.example .env
Variáveis públicas do Vite, quando utilizadas, devem começar com VITE_. Nunca inclua tokens secretos ou credenciais no repositório.
🎮 No Leme — Controles
Tecla	Ação
W ou ↑	Avançar
A ou ←	Girar para a esquerda
D ou →	Girar para a direita
Espaço	Disparo frontal
Q	Disparo lateral esquerdo
E	Disparo lateral direito
Botão de pausa	Pausar, continuar ou voltar ao menu


💣 Regras dos Sete Mares — Gameplay
- Navio do jogador: movimentação, rotação, disparos e barra de vida que acompanha a embarcação.
- Inimigos Chaser: perseguem o jogador, causam dano na colisão e se autodestroem sem conceder pontos por essa colisão.
- Inimigos Shooter: mantêm distância do jogador e lançam projéteis.
- Combate: inimigos recebem dano de tiros; ao serem destruídos por disparos, concedem pontos.
- Cenário: água, ilha central e faixas de costa. A ilha impede a passagem do navio conforme a lógica de colisão implementada.
- Interface: pontuação, cronômetro, vida, pausa e tela de fim de partida.
- Histórico: os resultados das partidas são salvos no localStorage sob a chave pirateBattleHistory.
🗺️ Ajustando a Rota — Configuração de Gameplay
O capitão pode ajustar os principais parâmetros em src/game/constants.ts:
Constante	Finalidade
GAME_WIDTH, GAME_HEIGHT	Dimensões da área do jogo
PLAYER_SPEED, PLAYER_ROTATION_SPEED	Velocidade e rotação do jogador
PLAYER_MAX_HEALTH, ENEMY_MAX_HEALTH	Vida máxima
CANNONBALL_SPEED, SHOOT_COOLDOWN	Velocidade e intervalo entre disparos
COLLISION_DAMAGE, COLLISION_COOLDOWN	Dano e intervalo entre colisões
ENEMY_SHOOT_COOLDOWN, ENEMY_CANNONBALL_SPEED, ENEMY_CANNONBALL_DAMAGE	Comportamento dos disparos inimigos
POINTS_PER_ENEMY	Pontos por inimigo destruído


A duração da sessão e o intervalo de surgimento de inimigos são recebidos pelo componente PirateGame nas propriedades sessionTime e enemySpawnTime. Seus valores devem ser alterados no componente responsável pela configuração/início da partida.
🌊 Condições do Mar — Cenários de Rede, Seleção e Reset
Atenção, tripulação — estado atual a confirmar: no código de gameplay analisado, não há um seletor de cenários de rede, simulação de falhas de requisição ou mecanismo de reset desses cenários identificado. Portanto, não é possível indicar uma sequência real de botões ou comandos para selecionar e reiniciar esses cenários sem consultar a implementação correspondente.
Se a avaliação exige simulação de rede, documente aqui, após implementar ou localizar a funcionalidade:
Cenário	Como selecionar	Como reproduzir	Como resetar
Rede normal	A confirmar	A confirmar	A confirmar
Rede lenta	A confirmar	A confirmar	A confirmar
Rede indisponível	A confirmar	A confirmar	A confirmar
Falha HTTP / timeout	A confirmar	A confirmar	A confirmar


Não confunda a reinicialização da partida com o reset de um cenário de rede: são ações distintas.
☠️ Investigando Naufrágios — Reprodução de Falhas
⚙️ O motor não parte — Instalação e dependências
npm install
npm run dev
Se ocorrer erro, registre a versão do Node.js (node --version), do npm (npm --version) e a mensagem completa do terminal.
📜 Erros de TypeScript
npx tsc --noEmit
Anote o arquivo, a linha e a mensagem do compilador.
🔎 Erros de lint
npm run lint
🏗️ Falhas de build
npm run build
npm run preview
Abra a URL de preview indicada no terminal e confira o console do navegador (F12).
🐙 Anomalias no mar — Falhas visuais ou de gameplay
1. Inicie uma partida e anote a duração e o intervalo de spawn escolhidos.
2. Reproduza a sequência de teclas que provocou a falha.
3. Verifique o console do navegador (F12 → Console).
4. Registre o comportamento esperado, o observado, um print e os passos necessários para repetir.
5. Reinicie a partida para conferir se a falha persiste.
Exemplos de verificações manuais: movimentar o navio e observar se a barra de vida acompanha sua posição; colidir com um Chaser e confirmar que ele desaparece e não adiciona pontos; destruir um inimigo com projéteis e confirmar a pontuação.
🔭 Vigias Automatizados — Playwright
Caso os testes automatizados estejam configurados:
npx playwright install
npx playwright test
npx playwright test --headed
npx playwright show-report
Para reproduzir um teste específico, substitua <arquivo-do-teste> pelo caminho real:
npx playwright test <arquivo-do-teste> --headed
A configuração de inicialização do servidor de testes (webServer), o endereço-base (baseURL) e os arquivos de teste devem ser conferidos em playwright.config.* e na pasta de testes do projeto. Não há confirmação de que esses arquivos existam na versão atual.
🗺️ Mapa da Embarcação — Estrutura do Projeto
src/
├── PirateGame.tsx           # Tela principal e loop do jogo
├── components/
│   └── GameOverScreen       # Tela de fim de partida
└── game/
    ├── constants           # Parâmetros de gameplay
    ├── collision           # Cálculos de distância/colisão
    ├── effects             # Efeitos visuais
    ├── enemy               # Criação e movimento de inimigos
    ├── island              # Ilha e área de colisão
    ├── projectiles         # Criação e movimento de projéteis
    └── types               # Tipos compartilhados

public/assets/                # Imagens e sprites do jogo

🏴‍☠️ Última Inspeção Antes de Zarpar
Verifique se os comandos listados existem no package.json, se o build e o TypeScript passam, se os testes Playwright foram de fato configurados e se a exigência de cenários de rede foi atendida. Remova ou complete os itens "A confirmar" antes de declarar essa funcionalidade como concluída.