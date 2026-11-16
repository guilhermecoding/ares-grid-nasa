# Tarefa: Implementar a Missão 03 — "O Mistério do Gelo de Marte"

Atue como um Engenheiro Front-end Sênior e Game Designer especialista em jogos educativos interativos (público-alvo: crianças de 7 a 12 anos, interface 100% touch-first). Estamos construindo o jogo **"Aventura em Marte: Arcadia Planitia"** em **React, TypeScript, Vite, Tailwind CSS e Framer Motion** para o NASA Space Apps Challenge.

Implemente a **Missão 03: O Mistério do Gelo de Marte** conectada ao estado global do jogador (consumindo energia solar gerada na Missão 01 para operar radar, perfuradora e derretedor, e recompensando a base com reserva de água potável).

---

## 1. Regras Gerais de UX, Acessibilidade e Rigor Científico
- **Touch-First (7–12 anos):** Botões, interruptores de camadas e controles de perfuração/tratamento devem ter área mínima de toque de `48x48px`, animações táteis (Framer Motion) e `touch-action: manipulation`.
- **Linguagem Simples + Glossário:** Explique termos científicos em 1 frase curta ao tocar (ex.: *Radar SHARAD*, *Subsolo*, *Amostra*, *Condutividade Elétrica*, *Potabilidade*).
- **Rastreabilidade NASA (Obrigatório):** Cite explicitamente dentro dos painéis e do Diário de Bordo as fontes oficiais:
  - **NASA — Relatório *First Ice Cores from Mars*** (metodologia de sensoriamento remoto, radar, geologia e perfuração exploratória).
  - **Mars Reconnaissance Orbiter (MRO) — Instrumento SHARAD** (radar orbital de subsuperfície em Arcadia Planitia).
- **Trade-offs Reais (Critério NASA Space Apps):** Perfurar e derreter gelo consome **Energia da Base**. Escolher um local instável ou pular etapas de análise desperdiça energia e quebra a broca; falhar no teste de potabilidade exige gastar energia extra para retratar a água antes do consumo.

---

## 2. Cenário de Fundo Dinâmico (100% SVG / Canvas gerado por você)
Crie o componente `<ArcadiaExplorationBackground />` (`z-0`) renderizado via **SVG + Canvas**:
- **Superfície de Arcadia Planitia:** Planície avermelhada com horizonte marciano, céu caramelo/ocre, rover/equipamento de sondagem posicionado e partículas sutis de poeira.
- **Corte Transversal do Subsolo (Modo Perfuração):** Nos Desafios 3.3 e 3.4, revele na metade inferior da tela uma visualização em camadas geológicas do solo marciano (poeira superficial -> regolito com cascalho -> camada de solo congelado/gelo subterrâneo brilhante) para a criança acompanhar visualmente a broca descendo.

---

## 3. Máquina de Estados e Fluxo da Missão 03
Implemente a máquina de estados:
`intro` -> `step3_1_methodology` -> `step3_2_layered_map` -> `step3_3_drilling` -> `step3_4_sample_collection` -> `step3_5_ice_processing` -> `step3_6_potability_test` -> `step3_logbook_and_ship`

### Etapa 0: Introdução (`intro`)
- **HUD Superior:** Exibe `Sol 03 | Arcadia Planitia`, `Energia Base (%)`, `Reserva de Água (L)` e indicador de missão científica.
- **Janela Holográfica da Capi (canto inferior direito):**
  - Explica que Arcadia Planitia tem fortes evidências de gelo subterrâneo, mas que cientistas não saem perfurando qualquer lugar sem antes reunir dados.

### Desafio 3.1: As 3 Etapas da Investigação (`step3_1_methodology`)
- Apresente um painel interativo onde o jogador toca para desbloquear/compreender o protocolo científico da NASA antes de abrir o mapa:
  1. **Análise de Dados de Radar (SHARAD / MRO):** Ondas de radar enviadas da órbita refletem de forma diferente quando encontram gelo abaixo do solo.
  2. **Estudo Prévio da NASA:** Consultar mapas geológicos e descobertas anteriores para não repetir pesquisas nem arriscar equipamentos.
  3. **Pequenas Perfurações Exploratórias:** Validar no local se o que o radar mostrou realmente existe no subsolo.

### Desafio 3.2: Mapa Científico com Camadas (`step3_2_layered_map`)
- **Interação Touch:** Exiba um mapa tátil de Arcadia Planitia com **5 botões de camadas alternáveis (toggles)**:
  1. *Imagens da Superfície*
  2. *Dados de Radar Orbital (SHARAD)*
  3. *Estudos Anteriores da NASA*
  4. *Características e Estabilidade do Terreno*
  5. *Áreas de Possíveis Depósitos de Gelo*
- **3 Pontos Candidatos no Mapa:**
  - **Setor Alfa (Encosta Rochosa):** Sinal moderado no radar, mas terreno instável e perigoso para a perfuradora.
  - **Setor Beta (Planície Estável Norte):** Forte reflexão de gelo no radar SHARAD, confirmado por estudos prévios e terreno plano/seguro (**escolha ideal**).
  - **Setor Gama (Cratera Rasa):** Terreno plano, mas sem indícios de gelo no radar nem nos estudos anteriores.
- O jogador deve ativar as camadas para inspecionar os setores e confirmar o local. Se escolher Alfa ou Gama, a Capi explica o problema científico/operacional e permite corrigir.

### Desafio 3.3: Pequenas Perfurações de Estudo (`step3_3_drilling`)
- **Interação Touch:** Usando o corte transversal do subsolo, o jogador pressiona/desliza o controle da **Perfuradora Exploratória** para perfurar em 2 ou 3 pontos de teste do setor escolhido, registrando a profundidade (ex.: `0.5m`, `1.2m`, `1.8m`).
- **Feedback da Capi:** Explica que uma pequena perfuração confirma a hipótese local, mas não garante sozinha o tamanho total do depósito.

### Desafio 3.4: Coleta e Armazenamento da Amostra (`step3_4_sample_collection`)
- Ao atingir a camada de material congelado, exiba um mini-fluxo tátil de 3 toques para coleta segura:
  1. **Separar o material** cuidadosamente sem contaminar com poeira superficial.
  2. **Registrar coordenadas e profundidade** no leitor de amostras.
  3. **Armazenar em recipiente térmico adequado** (separando uma fração para análise na base e outra preservada para futuro envio à Terra).

### Desafio 3.5: Transformando Gelo em Água (`step3_5_ice_processing`)
- **Interação Touch (Pipeline Sequencial de 6 Etapas):**
  - Exiba uma bancada de laboratório com 6 módulos interativos que o jogador ativa na ordem correta (mostrando o consumo de energia em cada etapa):
    1. *Identificar o material congelado*
    2. *Separar partículas grossas do solo*
    3. *Derreter o gelo em câmara controlada*
    4. *Filtrar partículas em suspensão*
    5. *Realizar tratamento para remover contaminantes químicos*
    6. *Encaminhar para verificação de qualidade*

### Desafio 3.6: Testando a Potabilidade (`step3_6_potability_test`)
- **Objetivo:** Ensinar que água transparente pode conter substâncias invisíveis perigosas (como sais e percloratos do solo marciano).
- **Interação Touch:**
  - O jogador toca para analisar **6 indicadores laboratoriais** da amostra:
    - `pH`
    - `Condutividade elétrica e sais`
    - `Contaminantes químicos`
    - `Metais indesejados`
    - `Indicadores microbiológicos`
    - `Eficiência do tratamento`
  - **Simulação Didática (Trade-off):** Na primeira análise, faça 1 indicador (ex.: *Condutividade/Sais* ou *Contaminantes químicos*) aparecer fora do padrão seguro. Bloqueie o consumo e obrigue o jogador a tocar em **"Executar Novo Tratamento e Repetir Análise"** (gastando um pouco mais de energia) até todos os 6 indicadores ficarem verdes (`APROVADO PARA CONSUMO`), somando `+50L` à reserva de água da base!

### Etapa Final: Diário de Bordo e Retorno à Nave (`step3_logbook_and_ship`)
- Abra o modal reutilizável do **Diário de Bordo** exigindo:
  1. **Evento:** Seleção rápida (*Análise SHARAD, perfuração em Arcadia Planitia e extração de água*).
  2. **Aspecto da situação:** Chips clicáveis resumindo terreno, profundidade da amostra e resultado do teste de potabilidade.
  3. **Fotografia:** Captura visual estilizada da amostra/laboratório com carimbo NASA.
- Finalize com a animação de retorno à espaçonave, armazenamento no servidor de bordo e tentativa de transmissão à Terra, liberando o botão **"AVANÇAR PARA A MISSÃO 04: A PRIMEIRA ESTUFA DE MARTE"**.

---

## 4. Arquitetura de Arquivos Esperada
- `src/data/mission3Data.ts`: Textos da Capi, camadas do mapa, dados dos 3 setores, etapas de processamento, parâmetros de potabilidade e citações oficiais (*First Ice Cores from Mars* e *MRO SHARAD*).
- `src/constants/mediaAssets.ts`: Adicionar caminhos de sprites da Missão 03 (`/assets/mission3/...`) com fallback em SVG/ícones.
- `src/components/mission3/ArcadiaExplorationBackground.tsx`: Cenário SVG/Canvas da superfície e corte geológico do subsolo.
- `src/components/mission3/Mission3View.tsx`: Orquestrador completo da Missão 03.

Gere código TypeScript estrito, modular, responsivo para tablets e celulares, sem bibliotecas pesadas adicionais.