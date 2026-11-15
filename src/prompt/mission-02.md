# Tarefa: Implementar a Missão 02 — "Cuidando do Astronauta"

Atue como um Engenheiro Front-end Sênior e Game Designer especialista em jogos educativos interativos (público-alvo: crianças de 7 a 12 anos, interface 100% touch-first). Estamos construindo o jogo **"Aventura em Marte: Arcadia Planitia"** em **React, TypeScript, Vite, Tailwind CSS e Framer Motion** para o NASA Space Apps Challenge.

Implemente a **Missão 02: Cuidando do Astronauta** conectada ao estado global do jogador (perfil do astronauta criado na abertura + energia solar instalada na Missão 01).

---

## 1. Regras Gerais de UX, Acessibilidade e Rigor Científico
- **Touch-First (7–12 anos):** Todos os botões, cards e controles interativos devem ter altura/largura mínima de `48px`, feedback visual imediato (Framer Motion) e `touch-action: manipulation`.
- **Linguagem Simples + Glossário:** Explique termos científicos em 1 frase curta via tooltip/modal ao tocar (ex.: *Microgravidade*, *Actigrafia*, *Contaminação*, *Metabolismo*).
- **Transparência Científica (Obrigatório):** Cite explicitamente a referência **NASA Spaceflight Standard Measures** e exiba um aviso visível no painel noturno: *"Dados simulados para fins educativos. Não representam medições clínicas reais."*
- **Trade-offs Reais (Essência do Desafio NASA):** Toda escolha na rotina consome **Água** ou **Energia da Base** (gerada na Missão 01) e impacta os indicadores de **Saúde Física**, **Hidratação** e **Qualidade do Sono** no relatório da Capi. Nenhuma escolha é gratuita.

---

## 2. Cenário de Fundo Dinâmico (100% Canvas / SVG gerado por você)
Crie o componente `<HabitatInteriorBackground />` (`z-0`) renderizado via **SVG + Canvas** que representa o interior do módulo habitacional em Marte:
- **Janela Panorâmica Marciana:** Mostra a paisagem de Arcadia Planitia do lado de fora, mudando a iluminação suavemente conforme o avanço dos desafios (Manhã -> Tarde -> Entardecer -> Noite estrelada marciana na hora de dormir).
- **Ambientes do Módulo:** Adapte sutilmente os elementos vetoriais do interior conforme a etapa atual (área de exercícios com elásticos de resistência, bancada nutricional com cultivo hidropônico ao fundo, estação de higienização e cabine de descanso com iluminação quente).

---

## 3. Máquina de Estados e Fluxo da Missão 02
Implemente a máquina de estados:
`intro` -> `step2_1_exercise` -> `step2_2_nutrition` -> `step2_3_hygiene` -> `step2_4_sleep_prep` -> `special_capi_night_report` -> `morning_wakeup`

### Etapa 0: Introdução (`intro`)
- **HUD Superior:** Exibe `Sol 02 | Arcadia Planitia`, medidores compactos de `Energia Base (%)`, `Reserva de Água (L)` e `Bem-Estar do Astronauta (%)`.
- **Janela Holográfica da Capi (canto inferior direito):**
  - Fala inicial amigável explicando que, com a energia solar funcionando, é hora de organizar a rotina diária porque a gravidade reduzida de Marte (38% da Terra), o isolamento e o ambiente afetam músculos, ossos e sono.

### Desafio 2.1: Exercícios Físicos (`step2_1_exercise`)
- **Objetivo:** Preservar músculos, ossos e capacidade física em baixa gravidade.
- **Interação Touch:** Exiba 4 cards grandes ilustrados para o jogador escolher sua atividade do dia (permita escolher 1 principal ou combinar até 2 dentro do limite de energia/água):
  1. **Caminhada na Esteira** (Foco: coração e resistência | Custo: médio de energia e água).
  2. **Exercícios de Resistência** (Foco: força muscular e densidade óssea | Custo: alto de energia, maior ganho físico).
  3. **Alongamento** (Foco: flexibilidade e recuperação | Custo: baixo de energia).
  4. **Treinamento de Equilíbrio** (Foco: adaptação neurológica à gravidade de Marte | Custo: baixo de energia).
- **Feedback:** Ao confirmar, mostre uma animação rápida do astronauta realizando a atividade e a Capi registrando no diário (*"Muito bem! Vou registrar a atividade realizada."*).

### Desafio 2.2: Alimentação e Hidratação (`step2_2_nutrition`)
- **Objetivo:** Montar uma refeição nutricionalmente equilibrada e gerenciar o consumo de água sem desperdício.
- **Interação Touch:**
  - **Bandeja Espacial Interativa:** O jogador toca para adicionar alimentos de 3 grupos (Proteínas/Grãos, Vegetais/Hortaliças, Frutas/Energia). Exiba uma barra de **Equilíbrio Nutricional** em tempo real (se colocar só um tipo de comida, a Capi avisa que falta variedade).
  - **Controle de Hidratação (Slider Tátil):** Ajustar a cota de água do dia (ex.: `1.5L` a `3.0L`). Mostrar o **trade-off**: beber pouca água reduz a hidratação e a qualidade do sono; exagerar desperdiça a reserva limitada da base.

### Desafio 2.3: Higiene Pessoal (`step2_3_hygiene`)
- **Objetivo:** Reduzir riscos de contaminação biológica e manter equipamentos e tripulação saudáveis em ambiente fechado.
- **Interação Touch (Checklist Interativo com Micro-interações):**
  - 3 ações rápidas com ícones grandes e som suave de confirmação:
    1. **Escovar os dentes** (com sistema de sucção sem desperdício de água).
    2. **Higienizar as mãos e o corpo** (lenços especiais / banho seco econômico).
    3. **Limpar sensores e equipamentos da estação** (evitar poeira e microrganismos).
  - Mostre o consumo mínimo de água reciclável e a queda no indicador de **Risco de Contaminação** para `0%`.

### Desafio 2.4: Hora de Dormir (`step2_4_sleep_prep`)
- **Objetivo:** Revisar o checklist do dia e preparar o ambiente de descanso.
- **Interação Touch:**
  - A Capi verifica automaticamente se o astronauta completou: Exercícios, Alimentação/Hidratação e Higiene.
  - O jogador toca em **"Preparar Cabine e Dormir"** (apaga as luzes principais do habitat, ativa o modo noturno e inicia a transição cinematográfica).

### Cena Especial: A Capivara Durante o Sono (`special_capi_night_report`)
- **Ação Visual:** A tela escurece gradualmente (`framer-motion`), mostrando o astronauta dormindo na cabine enquanto a janela exibe o céu noturno estrelado de Marte. A Capi aparece no canto inferior direito e abre o **Painel Holográfico Noturno**.
- **Sequência Automatizada/Interativa em 7 Passos (com barra de progresso clara para a criança acompanhar):**
  1. **Saúde:** Atualiza indicadores fisiológicos simulados (frequência cardíaca em repouso, adaptação).
  2. **Sono:** Calcula **Duração** e **Qualidade do Sono (Sleep Score)** com base nas escolhas feitas nos Desafios 2.1 a 2.3.
  3. **Atividades:** Consolida exercícios, refeição, hidratação e higiene.
  4. **Pesquisas (Diário Científico):** Organiza eventos, observações e registros fotografados das Missões 1 e 2.
  5. **Armazenamento:** Salva o pacote completo no servidor de bordo da espaçonave.
  6. **Comunicação:** Simula o envio para a Central Terrestre (mostrando o atraso real de comunicação Marte–Terra ou status *"Armazenado localmente — aguardando janela de sinal com a Terra"*).
  7. **Confirmação:** Exibe o aviso obrigatório: *"Dados simulados para fins educativos. Não representam medições clínicas reais."* e referência à *NASA Spaceflight Standard Measures*.
- **Amanhecer (`morning_wakeup`):** A luz do sol nascente ilumina a janela do habitat, a Capi dá *"Bom dia, Comandante!"*, exibe o resumo de pontos de ciência/saúde conquistados e libera o botão **"AVANÇAR PARA A MISSÃO 03: O MISTÉRIO DO GELO"**.

---

## 4. Arquitetura de Arquivos Esperada
- `src/data/mission2Data.ts`: Textos da Capi, opções de exercícios, alimentos, custos de água/energia, fórmulas de cálculo do Sleep Score e citações da NASA.
- `src/constants/mediaAssets.ts`: Atualizar com os caminhos de sprites da Missão 02 (ex.: `/assets/mission2/...`) sempre com fallback visual em SVG/ícones caso a imagem ainda não exista na pasta `public`.
- `src/components/mission2/HabitatInteriorBackground.tsx`: Cenário SVG/Canvas com ciclo dia/noite.
- `src/components/mission2/NightReportModal.tsx`: Painel holográfico noturno da Capi (reutilizável nas próximas missões, pois faz parte da mecânica permanente do jogo).
- `src/components/mission2/Mission2View.tsx`: Orquestrador principal da Missão 02.

Gere código TypeScript estrito, limpo, bem componentizado e sem dependências pesadas adicionais.