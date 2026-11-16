# Tarefa: Implementar a Missão 05 — "Alerta! Tempestades em Marte" e Encerramento (Cenas 6 e 7)

Atue como um Engenheiro Front-end Sênior e Game Designer especialista em jogos educativos interativos (público-alvo: crianças de 7 a 12 anos, interface 100% touch-first). Estamos construindo o jogo **"Aventura em Marte: Arcadia Planitia"** em **React, TypeScript, Vite, Tailwind CSS e Framer Motion** para o NASA Space Apps Challenge.

Implemente a **Missão 05: Alerta! Tempestades em Marte** (Desafios 5.1 a 5.4 + Diário e Sono) seguida da **Cena 6 (Central de Comunicação com a Terra)** e **Cena 7 (O Futuro da Vida em Marte — Tela Final da Expedição)**.

---

## 1. Regras Gerais de UX, Acessibilidade e Rigor Científico
- **Touch-First (7–12 anos):** Botões de emergência, checklists e ações de inspeção com área mínima de `48x48px`, feedback sonoro (Web Audio API para sirenes suaves e bipes de telemetria) e `touch-action: manipulation`.
- **Diferenciação Científica Crucial (Foco do Roteiro):**
  - Ensine de forma prática que **Tempestade de Poeira** (perigo físico/mecânico que bloqueia luz solar e suja equipamentos) e **Tempestade Solar / Radiação** (partículas energéticas invisíveis vindas de erupções solares e CMEs) são **fenômenos diferentes** e exigem **protocolos de proteção diferentes**.
  - No abrigo de radiação, destaque que não basta entrar em qualquer sala: é preciso usar um abrigo com **blindagem rica em hidrogênio (como tanques de água) e camadas de solo marciano (regolito)**.
- **Rastreabilidade NASA (Obrigatório):** Cite explicitamente:
  - **NASA — *Dust in the Wind*** (tempestades de poeira marcianas).
  - **NASA — *Real Martians* e Space Weather Database (DONKI)** (atividade solar, CMEs e blindagem contra radiação).
- **Trade-offs Reais:** Durante a tempestade de poeira, a geração solar cai drasticamente — o jogador precisa gerenciar a bateria instalada na Missão 01 para manter o suporte de vida ativo até poder limpar os painéis com segurança.

---

## 2. Cenário de Fundo Dinâmico (100% SVG / Canvas gerado por você)
Crie o componente `<MarsStormBackground />` (`z-0`) renderizado via **SVG + Canvas**:
- **Modo Poeira (Desafio 5.1):** Parede de poeira avermelhada avançando no horizonte, céu escurecendo para laranja-ferrugem denso, partículas rápidas soprando na tela e painel solar sendo coberto por poeira.
- **Modo Abrigo Blindado (Desafio 5.3):** Corte interno do abrigo subterrâneo/blindado com camadas visuais de solo marciano e reservatórios de água ao redor, além de ondas/partículas solares animadas sendo bloqueadas fora do casco.
- **Modo Pós-Tempestade e Futuro (Desafio 5.4 e Cena 7):** Céu limpo após a tempestade e, na Cena 7, panorama inspirador da base científica completa em Arcadia Planitia.

---

## 3. Máquina de Estados e Fluxo (Missão 05 + Cenas 6 e 7)
Implemente a máquina de estados:
`intro` -> `step5_1_dust_storm` -> `step5_2_clean_panels` -> `step5_3_solar_radiation` -> `step5_4_post_storm_inspection` -> `step5_logbook_and_sleep` -> `scene6_earth_transmission` -> `scene7_ending`

### Etapa 0: Introdução (`intro`)
- **HUD Superior:** Exibe `Sol 05 | ALERTA AMBIENTAL`, `Bateria (%)`, `Blindagem/Radiação (mSv)` e `Integridade da Base (%)`.
- **Janela Holográfica da Capi (Modo Alerta):** Avisa que os sensores detectaram dois fenômenos perigosos se aproximando de Arcadia Planitia.

### Desafio 5.1: Tempestades de Poeira (`step5_1_dust_storm`)
- **Ação Visual:** Tempestade de poeira reduz a geração solar em 75%.
- **Interação Touch (Protocolo de Emergência em 8 Ações Agrupadas em 4 Passos Rápidos):**
  1. *Consultar painel ambiental e identificar o alerta de tempestade (local/regional/global).*
  2. *Interromper atividades externas e retornar imediatamente ao habitat.*
  3. *Fechar compartimentos e verificar vedação e filtros de ar.*
  4. *Proteger equipamentos externos e ativar modo de economia nas baterias (desligando cargas não essenciais).*
- Exiba um breve intervalo de passagem da tempestade mostrando as baterias segurando o habitat.

### Desafio 5.2: Protegendo e Limpando os Painéis Solares (`step5_2_clean_panels`)
- **Objetivo:** Recuperar a energia acumulada sem expor o astronauta antes da hora.
- **Interação Touch:**
  1. Verificar no sensor que os ventos externos já baixaram para nível seguro.
  2. Inspecionar a camada de poeira nos painéis (geração em 25%).
  3. Acionar o **Sistema de Manutenção/Limpeza Eletrostática ou Escova Remota** (ou deslizar o dedo sobre os painéis na tela para remover a poeira acumulada) até a geração voltar a `100%`!

### Desafio 5.3: Tempestades Solares e Radiação (`step5_3_solar_radiation`)
- **Ação Visual:** Sirene de alerta solar (dados inspirados no **DONKI** — erupção solar / ejeção de massa coronal). Medidor de radiação sobe; a Capi enfatiza que não dá para enxergar a radiação a olho nu.
- **Interação Touch (Escolha de Abrigo + Protocolo):**
  - Mostre 3 locais da base para o jogador escolher onde se proteger:
    - *Estufa de Vidro/Polímero* (Inseguro — pouca proteção contra partículas energéticas).
    - *Módulo Padrão de Superfície* (Proteção parcial — insuficiente para tempestade solar forte).
    - *Abrigo Blindado com Água e Solo Marciano* (**Correto** — hidrogênio da água e espessura de regolito absorvem a radiação).
  - Dentro do abrigo correto, o jogador confirma o monitoramento da blindagem e aguarda o medidor de radiação voltar ao nível verde antes de sair.

### Desafio 5.4: Inspeção Após a Tempestade (`step5_4_post_storm_inspection`)
- **Interação Touch:** O jogador toca em **4 pontos de inspeção** na base externa para validar integridade:
  1. *Painéis Solares* (Produção normalizada)
  2. *Estrutura e Vedação do Habitat* (Pressurização OK)
  3. *Estufa e Equipamentos Externos* (Sistemas intactos)
  4. *Antena e Sistemas de Comunicação* (Prontos para transmissão)

### Diário de Bordo e Cena do Sono (`step5_logbook_and_sleep`)
- Registro obrigatório no **Diário de Bordo** (Evento, Aspecto da situação com nível de alerta e blindagem, Fotografia) + `<NightReportModal />` consolidando o histórico de radiação e saúde.

### Cena 6: A Central de Comunicação com a Terra (`scene6_earth_transmission`)
- De volta à espaçonave, exiba o **Relatório Geral da Expedição** com checkmarks verdes nas **5 Missões** (`Energia Solar`, `Saúde Humana`, `Geologia e Água`, `Agricultura Espacial`, `Proteção Ambiental`).
- Botão grande **"TRANSMITIR RELATÓRIO PARA A TERRA"**:
  - Animação de envio de pacote de dados: `PACOTE DE DADOS PREPARADO` -> `BUSCANDO SINAL DA TERRA...` -> `CONEXÃO ESTABELECIDA! DADOS RECEBIDOS!`.

### Cena 7: O Futuro da Vida em Marte (`scene7_ending`)
- Tela final celebrando a conquista do **Comandante [Nome do Astronauta]**, mostrando o panorama da base completa em Arcadia Planitia e um botão **"VER FONTES CIENTÍFICAS NASA"** (modal transparente listando todas as referências usadas no jogo para os jurados verificarem) + botão **"JOGAR NOVAMENTE"**.

---

## 4. Arquitetura de Arquivos Esperada
- `src/data/mission5Data.ts`: Textos da Capi, protocolos de poeira vs. radiação, dados de blindagem, textos das Cenas 6 e 7 e citações oficiais (*Dust in the Wind*, *Real Martians*, *DONKI*).
- `src/constants/mediaAssets.ts`: Adicionar caminhos `/assets/mission5/...` com fallbacks em SVG/ícones.
- `src/components/mission5/MarsStormBackground.tsx`: Cenário SVG/Canvas dinâmico (poeira, abrigo blindado e base concluída).
- `src/components/mission5/Mission5View.tsx`: Orquestrador completo da Missão 05 e Cenas 6–7.

Gere código TypeScript estrito, modular e responsivo para tablets e celulares.