Agora vamos transformar as **Missões 4 e 5** em **Mini-Games Táteis e Interativos** (compatíveis com mouse no PC e toque/arrastar no celular usando `PointerEvents` e classes `touch-none select-none`), sem vir pré-concluídos:

---

### 1. Mini-Games da Missão 4 (`src/missions/mission4-greenhouse/`)
- **Desafio 4.1 (Conexão de Cabos e Tubos ECLSS):**
  - Substitua os cliques simples por um painel de **conexão por arraste**: o jogador **arrasta** o cabo amarelo de **Energia Solar** e o tubo azul de **Água Potável** até os conectores do Domo da Estufa (com encaixe magnético e faísca/fluxo animado ao conectar).
- **Desafio 4.3 (Plantio Drag & Drop nos Berços):**
  - Permita **arrastar (ou tocar)** cada semente/muda escolhida (Hortaliça, Morango, Trigo e Flor Ornamental) diretamente para dentro dos **4 quadrantes vazios** da bandeja hidropônica/aeropônica[cite: 135].
- **Desafio 4.4 (Borrifador de Névoa + Colheita Interativa):**
  - Adicione um **borrifador de névoa nutritiva arrastável**: o jogador passa o cursor/dedo sobre as folhas para hidratar e nutrir as plantas em cada estágio de crescimento (`Sementes -> Broto -> Colheita`)[cite: 136].
  - No estágio final (`3/3`), o jogador **clica/toca diretamente sobre os frutos e vegetais maduros** na bandeja para colher antes de liberar o sistema ECLSS[cite: 136, 137].

---

### 2. Mini-Games da Missão 5 (`src/missions/mission5-storms/`)
- **Desafio 5.1 (Vedação de Emergência do Habitat):**
  - Substitua os botões estáticos por **4 escotilhas/alavancas de vedação**: o jogador precisa **arrastar cada trava até o fim** (`DESTRAVADO -> VEDADO`) enquanto um cronômetro de aproximação da tempestade de poeira avança e a poeira bate na janela.
- **Desafio 5.2 (Limpeza Pós-Tempestade no Canvas):**
  - Reutilize o `DustScrubCanvas` com uma **camada espessa de poeira marciana** sobre o painel solar após a tempestade — o jogador **esfrega com o mouse ou dedo** até limpar `90%+` e restaurar os `480 W`.
- **Desafio 5.3 (Corrida para o Abrigo Blindado contra Radiação):**
  - Crie um mini-game rápido de movimento no terreno (`onPointerDown` / toque ou setas): quando o alerta de erupção solar disparar e a barra de radiação começar a subir, o jogador precisa **guiar o astronauta pelo terreno até a porta do Abrigo Blindado** (desviando de duas rochas) antes que a radiação atinja o limite crítico.

---

### 3. Ajuste de Layout & Validação
- Mantenha o respiro inferior (`pb-32`) para que a janela da **Capi** nunca sobreponha nenhum botão.
- Teste no navegador integrado jogando as Missões 4 e 5 do zero para confirmar que todos os mini-games (arrastar cabos, plantar mudas, borrifar, travar escotilhas, esfregar poeira e correr para o abrigo) funcionam perfeitamente.