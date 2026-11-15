Atue como um Engenheiro Front-end Sênior e Game Designer especialista em jogos educativos interativos (público 7 a 12 anos, touch-first). Estamos desenvolvendo o jogo "Aventura em Marte: Arcadia Planitia" para o NASA Space Apps Challenge usando a base já existente neste projeto (React, TypeScript, Vite, Tailwind CSS e Framer Motion).

Implemente a **Missão 01: Energia para Explorar Marte** completa, modular e 100% jogável em dispositivos touch (botões grandes >= 48px, sliders táteis, linguagem simples e clara, sem jargões sem explicação).

### 1. Cenário de Fundo (Gerado 100% via Código por você)
Crie um componente `<MarsBackground />` em camada fixa ao fundo (`z-0`) usando SVG/Canvas/CSS + Framer Motion que represente **Arcadia Planitia**:
- Céu marciano com gradiente atmosférico realista (tons de caramelo/ocre/salmão) que muda sutilmente conforme o horário solar ou alerta de tempestade de poeira.
- Disco solar animado no céu cuja altura e posição horizontal respondem dinamicamente à estação escolhida e ao horário solar.
- Terreno em paralaxe/camadas SVG com planícies extensas, pequenas formações rochosas ao fundo e partículas sutis de poeira marciana flutuando no ar (intensificando no Desafio 1.3).

### 2. Estrutura de Estado e Fluxo da Missão 01
Crie uma máquina de estados limpa (`intro` -> `step1_location` -> `step2_solar_calc` -> `step3_storm_test` -> `step4_logbook` -> `step5_transmission`):

1. **Introdução (Pós-pouso):**
   - HUD superior estilo painel de espaçonave mostrando: `Local: Arcadia Planitia`, `Suporte à Vida: OK`, `Energia Externa: NÃO INSTALADA`.
   - Janela holográfica da assistente **Capi** no canto inferior direito explicando a missão em balões curtos e amigáveis (com botão "Avançar" grande).

2. **Desafio 1.1 — Escolha do Local de Instalação:**
   - Renderize 3 pontos interativos sobre o terreno marciano com marcadores clicáveis e sprites externos (use placeholders organizados em `/assets/mission1/`):
     - **Ponto A (Vale Sombreado):** Perto de uma formação rochosa alta. Boa proteção contra vento, mas fica na sombra metade do dia (baixa geração).
     - **Ponto B (Planície Aberta Norte):** Terreno plano, alta incidência solar o dia todo, fácil acesso para limpeza de poeira e longe da rota do rover (opção ideal, mas exige cuidado com poeira).
     - **Ponto C (Encosta Inclinada):** Terreno irregular e próximo à escotilha da nave (risco operacional e atrapalha futuras missões).
   - Ao tocar em cada ponto, exiba um cartão visual com prós/contras simples para crianças. Só permita avançar após analisar e confirmar uma escolha (dando feedback educativo da Capi caso escolha A ou C, explicando o trade-off).

3. **Desafio 1.2 — Cálculo Solar (Mars24) e Ajuste dos Painéis:**
   - Exiba um painel holográfico interativo da Capi mostrando os dados reais de Arcadia Planitia (`Lat: 40.0° N | Lon: 180.0° W`).
   - O jogador escolhe a **Estação Marciana** (ex.: Verão Norte ou Inverno Norte) e toca em **"Pedir Cálculo à Capi"**.
   - A Capi mostra visualmente um arco da trajetória do Sol (Elevação Solar $h$ e Azimute) com um botão opcional "Ver fórmula da NASA (Mars24)" que exibe $Z = \arccos(\sin\delta\sin\varphi + \cos\delta\cos\varphi\cos H)$ e $h = 90^\circ - Z$ de forma didática, explicando que a inclinação ideal também considera poeira e baterias.
   - O jogador usa dois sliders grandes touch-friendly: **Orientação (Azimute: Leste/Sul/Oeste)** e **Inclinação do Painel ($0^\circ$ a $60^\circ$)**. O sprite do painel solar no terreno deve inclinar/rotacionar visualmente em tempo real e mostrar uma barra de eficiência prevista (%).
   - Ao confirmar a instalação, o painel muda para o estado "Instalado e Ativo".

4. **Desafio 1.3 — Teste do Sistema e Simulação de Tempestade de Poeira (Trade-off):**
   - Exiba o **Painel de Controle Solar** com 3 medidores claros: **Geração Solar (kW)**, **Bateria (%)** e **Consumo do Habitat (kW)**.
   - Dispare um alerta visual e sonoro (use Web Audio API simples para bipes): *"Alerta Ambiental: Nuvem de poeira se aproximando! Geração solar caindo 65%."*
   - O jogador deve tomar uma decisão de trade-off em tempo real (ex.: *Reduzir luzes não essenciais e aquecimento auxiliar para poupar bateria* vs *Manter potência máxima e arriscar zerar a bateria antes da noite marciana*). Mostre as consequências imediatas nos medidores.

5. **Registro Científico Obrigatório (Diário de Bordo) e Transmissão:**
   - Abra o modal do **Diário de Bordo da Missão 1** com 3 etapas simples para a criança completar:
     1. *Evento:* Seleção rápida ("Instalação e ativação dos painéis solares em Arcadia Planitia").
     2. *Aspecto observado:* Chips/opções clicáveis combinando o local escolhido, ângulo ajustado e comportamento na poeira.
     3. *Fotografia:* Um botão de "Capturar Foto Científica" que tira um snapshot estilizado da cena atual dos painéis com carimbo de data/coordenadas NASA.
   - Finalize com a animação de retorno à nave: *"DADOS DA MISSÃO 1 ARMAZENADOS -> TENTANDO CONEXÃO COM A CENTRAL TERRESTRE... AGUARDANDO SINAL..."* (mostrando status de armazenamento local aguardando janela de comunicação, conforme o roteiro).

### Requisitos Técnicos
- Separe os dados científicos e textos da Capi em `src/data/mission1Data.ts` citando explicitamente as fontes da NASA (*NASA GISS Mars24 Algorithm* e *Photovoltaic Arrays for Martian Surface Power*).
- Crie um arquivo `src/constants/mediaAssets.ts` centralizando os caminhos das imagens externas (com fallback visual estilizado caso a imagem ainda não tenha sido adicionada na pasta `public/assets/mission1/`).
- Adicione tooltips de 1 frase em linguagem infantil para termos científicos sublinhados (`Arcadia Planitia`, `Azimute`, `Elevação Solar`, `Fotovoltaico`, `Sol`).