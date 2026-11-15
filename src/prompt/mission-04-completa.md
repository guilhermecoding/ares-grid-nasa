# Tarefa: Implementar a Missão 04 — "A Primeira Estufa de Marte"

Atue como um Engenheiro Front-end Sênior e Game Designer especialista em jogos educativos interativos (público-alvo: crianças de 7 a 12 anos, interface 100% touch-first). Estamos construindo o jogo **"Aventura em Marte: Arcadia Planitia"** em **React, TypeScript, Vite, Tailwind CSS e Framer Motion** para o NASA Space Apps Challenge.

Implemente a **Missão 04: A Primeira Estufa de Marte** conectada ao estado global do jogo (consumindo **Energia Solar** da Missão 01 e **Água Potável** extraída na Missão 03, e aumentando a produção de comida e oxigênio da base).

---

## 1. Regras Gerais de UX, Acessibilidade e Rigor Científico
- **Touch-First (7–12 anos):** Todos os botões, módulos instaláveis e controles ambientais devem ter área mínima de toque de `48x48px`, animações táteis (Framer Motion) e `touch-action: manipulation`.
- **Linguagem Simples + Glossário:** Explique termos científicos em 1 frase curta via tooltip ao tocar (ex.: *Hidroponia*, *Aeroponia*, *Regolito*, *Bioregenerativo*, *Fotossíntese*).
- **Rigor Científico NASA:**
  - Deixe claro que o **regolito marciano bruto não é adequado para plantar** sem tratamento prévio (contém percloratos e falta matéria orgânica).
  - Cite explicitamente as pesquisas da NASA sobre cultivo espacial (como experimentos *Veggie* / *Advanced Plant Habitat* na ISS e sistemas bioregenerativos de suporte à vida — BLSS).
- **Trade-offs Reais (Critério NASA Space Apps):** Iluminação LED, aquecimento e bombas de irrigação consomem **Energia** e **Água**. Plantar muitas espécies exigentes drena recursos da base; equilibrar o sistema gera oxigênio e recicla água.

---

## 2. Cenário de Fundo Dinâmico (100% SVG / Canvas gerado por você)
Crie o componente `<GreenhouseInteriorBackground />` (`z-0`) renderizado via **SVG + Canvas**:
- **Domo/Módulo da Estufa:** Estrutura transparente mostrando o horizonte avermelhado de Arcadia Planitia ao fundo e bancadas internas de cultivo.
- **Feedback Visual Progressivo:** Conforme o jogador instala os módulos (Desafio 4.1) e avança no crescimento (Desafio 4.4), as luzes LED rosadas/brancas acendem, névoa/irrigação ativa e as mudas crescem visualmente nas bancadas.

---

## 3. Máquina de Estados e Fluxo da Missão 04
Implemente a máquina de estados:
`intro` -> `step4_1_build_greenhouse` -> `step4_2_cultivation_method` -> `step4_3_select_species` -> `step4_4_growth_monitor` -> `step4_5_bioregenerative` -> `step4_logbook_and_sleep`

### Etapa 0: Introdução (`intro`)
- **HUD Superior:** Exibe `Sol 04 | Arcadia Planitia`, `Energia Base (%)`, `Reserva de Água (L)` e `Produção de Alimentos/O₂ (%)`.
- **Janela Holográfica da Capi (canto inferior direito):** Explica o objetivo de testar se conseguimos produzir alimentos e reciclar ar e água em Marte.

### Desafio 4.1: Construindo a Estufa (`step4_1_build_greenhouse`)
- **Interação Touch (Montagem Integrada):** Exiba um diagrama interativo do domo onde o jogador toca para instalar e conectar **7 subsistemas essenciais** (mostrando o custo energético de cada um):
  1. *Estrutura de proteção térmica e pressurizada*
  2. *Iluminação LED controlada*
  3. *Sistema de ventilação e circulação de ar*
  4. *Controle de temperatura*
  5. *Reservatório de água*
  6. *Sistema de irrigação*
  7. *Equipamentos de monitoramento ambiental*
- Exija que o jogador toque em **"Conectar à Rede Solar (Missão 01)"** para energizar o conjunto.

### Desafio 4.2: Escolhendo os Métodos de Cultivo (`step4_2_cultivation_method`)
- **Interação Touch:** Apresente 3 cartões comparativos interativos para o jogador testar/selecionar nas bancadas:
  1. **Hidroponia:** Raízes submersas em água com nutrientes dissolvidos (economia de água de ~90%, crescimento rápido).
  2. **Aeroponia:** Raízes suspensas recebendo névoa nutritiva (economia máxima de água e ótima oxigenação, exige mais energia nas bombas).
  3. **Regolito Marciano Tratado (Experimental):** Alerta educativo da Capi explicando que o solo de Marte é tóxico no estado natural e precisa de lavagem e tratamento mineral antes de servir como substrato.

### Desafio 4.3: Selecionando as Espécies Vegetais (`step4_3_select_species`)
- **Interação Touch:** O jogador escolhe pelo menos uma espécie de cada um dos **4 grupos de pesquisa** para compor a estufa:
  1. **Hortaliças e vegetais:** Alface, Tomate ou Cenoura.
  2. **Plantas frutíferas:** Morango (ou frutífera anã).
  3. **Cereais:** Trigo anão (energia calórica).
  4. **Plantas ornamentais:** Flores (ex.: Zínia — bem-estar psicológico da tripulação).

### Desafio 4.4: Acompanhando o Crescimento (`step4_4_growth_monitor`)
- **Interação Touch (Simulador de Sols / Estágios):**
  - Um slider ou botão de avanço de dias (`Germinação` -> `Raízes e Folhas` -> `Crescimento Adulto`) com 3 controles de ajuste rápido: **Luz (LED)**, **Água/Nutrientes** e **Temperatura**.
  - Exiba um painel de observação comparando: *Tempo de germinação*, *Raízes/Folhas*, *Altura* e *Sinais de estresse/doença* (caso falte luz ou água, a Capi alerta e o jogador corrige).

### Desafio 4.5: Construindo um Sistema Sustentável (`step4_5_bioregenerative`)
- **Interação Touch (Conexão de Fluxos BLSS):**
  - Exiba um esquema visual circular onde a criança toca para ligar as setas entre **Plantas**, **Astronauta**, **Água** e **Ar**:
    - Plantas absorvem $CO_2$ e liberam $O_2$ (revitalização do ar).
    - Transpiração das plantas é recuperada como água limpa.
    - Resíduos orgânicos viram nutrientes.
  - Mostre o ganho permanente na autossuficiência da base!

### Etapa Final: Diário de Bordo e Cena do Sono (`step4_logbook_and_sleep`)
- Abra o modal do **Diário de Bordo** exigindo:
  1. **Evento:** Construção, plantio e operação da estufa bioregenerativa.
  2. **Aspecto da situação:** Chips com método escolhido, espécies cultivadas e resultados.
  3. **Fotografia:** Registro visual da estufa verde em Marte.
- Acione o componente reutilizável `<NightReportModal />` da **Cena do Sono**: Capi atualiza o relatório da estufa e o painel de saúde do astronauta, salva no servidor e libera o botão **"AVANÇAR PARA A MISSÃO 05: ALERTA DE TEMPESTADES"**.

---

## 4. Arquitetura de Arquivos Esperada
- `src/data/mission4Data.ts`: Subsistemas da estufa, métodos de cultivo, espécies dos 4 grupos, parâmetros de crescimento e citações NASA.
- `src/constants/mediaAssets.ts`: Adicionar caminhos `/assets/mission4/...` com fallbacks em SVG/ícones.
- `src/components/mission4/GreenhouseInteriorBackground.tsx`: Cenário SVG/Canvas evolutivo da estufa.
- `src/components/mission4/Mission4View.tsx`: Orquestrador completo da Missão 04.

Gere código TypeScript estrito, modular e responsivo para tablets e celulares.