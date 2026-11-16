Atue como um Engenheiro Front-end Sênior e Creative Developer especializado em jogos educativos interativos (público 7 a 12 anos, touch-first). Estamos desenvolvendo "Aventura em Marte: Arcadia Planitia" em React, TypeScript, Vite, Tailwind CSS e Framer Motion.

Implemente a **Sequência de Abertura Completa (Cenas 1 a 4)** que antecede a Missão 01, salvando o perfil do astronauta personalizado em um Contexto Global / localStorage para ser usado no restante do jogo.

### 1. Fundos Animados em HTML5 `<canvas>` e SVG (100% gerados via código por você)
Crie componentes de fundo dinâmicos (`z-0`) sem depender de vídeos externos:
- **`<LaunchSpaceCanvas />` (Cenas 2 e 3):** Um `<canvas>` interativo de alta performance que renderiza o espaço profundo com estrelas em movimento (efeito warp/velocidade durante a decolagem), a curvatura da Terra com brilho atmosférico azul na parte inferior da janela recuando gradualmente, e partículas de luz. Sobreponha uma moldura vetorial SVG representando o cockpit/janelas da espaçonave com luzes de painel piscando e uma luz central que pulsa ao ativar a assistente.
- **`<MarsApproachCanvas />` (Cena 4):** Transição suave no `<canvas>` onde o disco avermelhado de Marte cresce no horizonte até revelar as planícies extensas e formações rochosas de Arcadia Planitia durante a descida e pouso.

### 2. Fluxo das Cenas da Abertura
Gerencie a abertura com uma máquina de estados (`ready_gate` -> `scene1_countdown` -> `scene2_takeoff` -> `scene3_capi_intro` -> `scene3_1_customizer` -> `scene4_landing` -> `start_mission_1`), incluindo um botão discreto "Pular Introdução" no canto superior direito para facilitar testes e avaliação dos jurados:

1. **Cena 1 — Contagem Regressiva (`scene1_countdown`):**
   - Tela completamente preta (`#000000`), sem nenhum logotipo, personagem ou texto explicativo.
   - Antes do 10, exiba apenas um botão tátil centralizado minimalista (`INICIAR CONTAGEM`) para desbloquear o áudio do navegador.
   - Exiba os números de `10` até `0` centralizados, um de cada vez, com animação de escala (Framer Motion).
   - Use **Web Audio API** para sintetizar bipes de telemetria a cada segundo e um som grave crescente de ignição dos motores nos últimos 3 segundos, acompanhado de um efeito CSS/Framer Motion de vibração (`screen shake`) crescente na tela até o `0`.

2. **Cena 2 — Decolagem e Viagem Espacial (`scene2_takeoff`):**
   - Abra a visão para o cockpit (`<LaunchSpaceCanvas />`).
   - Exiba no painel central um terminal estilo HUD espacial com efeito de digitação (*typewriter*) apresentando exatamente:
     - `DECOLAGEM CONFIRMADA!`
     - `Sistemas de navegação ativados.`
     - `Destino: MARTE.`
     - `Região de exploração: ARCADIA PLANITIA.`
     - `Ativando assistente virtual de bordo...`
   - Ao final do texto, acenda uma luz holográfica pulsante no centro do painel e avance automaticamente (ou ao toque) para a Cena 3.

3. **Cena 3 — Conhecendo a Capivara (`scene3_capi_intro`):**
   - Abra a janela holográfica no **canto inferior direito** com o sprite da **Capi** (use `/assets/capi/capi-neutral.png` com fallback estilizado).
   - Exiba os diálogos da Capi divididos em 3 balões curtos, amigáveis e fáceis para crianças de 7–12 anos lerem (com botão grande "Continuar" >= 48px):
     1. *"Olááá, astronauta! Finalmente vamos nos conhecer! Eu sou a Capi, sua assistente virtual. Vou monitorar a nave, ajudar nos experimentos e lembrar você de cuidar da saúde!"*
     2. *"Nosso destino é Arcadia Planitia, em Marte! Vamos estudar o ambiente, procurar pistas de gelo subterrâneo e descobrir como usar os recursos do planeta."*
     3. *"Mas não vou fazer tudo sozinha — você será o pesquisador responsável! Antes de começarmos, preciso saber quem está comigo nessa aventura!"*

4. **Cena 3.1 — Personalização do Astronauta (`scene3_1_customizer`):**
   - Exiba um painel tátil interativo ao lado da janela holográfica da Capi para a criança montar seu astronauta:
     - Campo de texto grande para **Nome do Astronauta** (com sugestões rápidas de 1 toque caso a criança não queira digitar).
     - Seletores visuais grandes (botões táteis >= 48px) para personalizar: **Cor do Uniforme** (ex.: Branco NASA, Laranja Missão, Azul Cobalto, Verde Explorador), **Estilo do Capacete/Visor**, **Mochila de Suporte à Vida** e **Insígnia/Detalhes da Roupa**.
     - Renderize um **Preview Dinâmico em SVG/Camadas** do astronauta no centro da tela que muda as cores e acessórios instantaneamente conforme a criança toca nas opções.
   - Ao tocar em **"Confirmar Astronauta"**, a Capi responde: *"Prontinho, Comandante [Nome]! Agora temos um astronauta preparado para explorar o Planeta Vermelho. Nossa primeira tarefa começará assim que pousarmos!"*

5. **Cena 4 — Pouso em Arcadia Planitia (`scene4_landing`):**
   - Transição para `<MarsApproachCanvas />` simulando a aproximação e pouso suave em Marte (com leve tremor de toque no solo).
   - Exiba o diagnóstico final da nave:
     - `POUSO CONFIRMADO! Localização: Arcadia Planitia – Marte.`
     - `Sistemas de suporte à vida: OPERACIONAIS.`
     - `Equipamentos científicos: OPERACIONAIS.`
     - `Energia externa: SISTEMA SOLAR AINDA NÃO INSTALADO.`
   - A Capi conclui alertando que precisam instalar os painéis solares imediatamente e exibe o botão principal: **"INICIAR MISSÃO 01: ENERGIA SOLAR"**.

### Requisitos Técnicos
- Centralize todos os textos da abertura em `src/data/openingData.ts` e os caminhos de mídia em `src/constants/mediaAssets.ts`.
- Garanta responsividade total para tablets (horizontal/vertical) e celulares, bloqueando zoom acidental (`touch-action: manipulation`).