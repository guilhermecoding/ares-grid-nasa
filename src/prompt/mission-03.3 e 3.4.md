Refaça o **Desafio 3.3 & 3.4 (Perfuração e Coleta do Ice Core)** dentro de `src/missions/mission3-ice/` para que ele tenha **dois mini-games táteis obrigatórios** (funcionando com mouse no PC e toque/arrastar no celular via `PointerEvents` e `touch-none select-none`), sem vir pré-concluído:

### 1. Mini-Game 3.3 — Perfuração com Controle de Calor e Camadas (`0,0 m` até `2,2 m`)
- A perfuração deve começar obrigatoriamente em **`0,0 m` (Superfície)**.
- Crie um botão interativo **`⚙️ SEGURAR PARA PERFURAR`** (`onPointerDown` / `onPointerUp`):
  - Enquanto o jogador segura pressionado, a broca desce animada pelas camadas do subsolo (`0,0 m` Regolito $\rightarrow$ `1,0 m` Camada Rochosa Densa $\rightarrow$ `2,2 m` Depósito de Gelo Subterrâneo) e a **Barra de Temperatura da Broca** sobe.
  - Na camada rochosa (`0,8 m` a `1,5 m`), o atrito aumenta e a temperatura sobe mais rápido — o jogador precisa **soltar o botão por 1–2 segundos para resfriar a broca** antes de continuar.
  - Se a temperatura atingir `100%` (zona vermelha), a broca trava por superaquecimento durante 2,5 segundos e a **Capi** avisa para pulsar o botão em vez de segurar direto.

### 2. Mini-Game 3.4 — Separação e Armazenamento Interativo do Cilindro de Gelo
Assim que atingir `2,2 m` e extrair o cilindro (`Ice Core`), substitua os 3 botões estáticos por **2 ações práticas na bancada**:
1. **Separar Regolito da Amostra (Esfregar/Limpar):** Use o `DustScrubCanvas` sobre a crosta de poeira e terra grudada no cilindro de gelo — o jogador **esfrega com o mouse ou dedo** para limpar o regolito e revelar os cristais azul-ciano puros (`90%+` limpo).
2. **Armazenar no Recipiente Criogênico (Drag & Drop):** Permita **arrastar o cilindro de gelo limpo** (ou tocar para encaixar e deslizar a trava térmica) para dentro do **Recipiente Térmico Científico** ao lado, ativando o selo criogênico (`-73 °C`).

### 3. Correção de Sobreposição da Capi
- Garanta um espaçamento inferior (`pb-32`) na área da missão para que a caixa da **Capi** no canto inferior direito nunca cubra o botão **`Levar Amostra ao Laboratório (3.5)`**[cite: 132].

Valide no navegador integrado jogando o Desafio 3.3 e 3.4 do zero (`0,0 m` até selar a amostra) e confirme que ambos os mini-games respondem ao segurar, esfregar e arrastar.