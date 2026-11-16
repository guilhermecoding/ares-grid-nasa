Aprimore o **Desafio 2.2 (Nutrição e Hidratação)** dentro de `src/missions/mission2-health/` adicionando **valores energéticos (`kcal`) aos alimentos** e um **balanço de gasto vs. reposição de energia** do astronauta:

### 1. Exibir o Gasto Energético do Astronauta
- No topo do Desafio 2.2, exiba um indicador claro baseado nos treinos realizados no Desafio 2.1:
  - **Gasto Energético da Atividade:** `~740 kcal` (exercícios físicos + preparação de missão em Marte).
  - **Meta de Reposição Ideal da Refeição:** `650 kcal a 820 kcal`.

### 2. Adicionar Valor Energético (`kcal`) em Todos os Alimentos
Mostre uma badge visível com as calorias em cada card arrastável das 3 categorias:
- **1. Proteínas (Músculos):**
  - `Tofu Proteico` — **140 kcal** *(Leve)*
  - `Grão-de-bico Espacial` — **250 kcal** *(Moderado)*
  - `Peixe Selado NASA` — **360 kcal** *(Alta Energia)*
- **2. Vegetais (Vitaminas e Fibras):**
  - `Salada de Folhas Verdes` — **35 kcal** *(Ultra Leve)*
  - `Tomates-cereja` — **70 kcal** *(Leve)*
  - `Brócolis da Estufa` — **130 kcal** *(Nutritivo)*
- **3. Carboidratos (Energia):**
  - `Tortilha Integral` — **190 kcal** *(Leve)*
  - `Quinoa Espacial` — **290 kcal** *(Moderado)*
  - `Arroz Integral` — **410 kcal** *(Alta Energia)*

### 3. Medidor de Balanço Energético na Bandeja & Feedback da Capi
Dentro do quadro **`BANDEJA DO ASTRONAUTA`**, exiba a soma em tempo real (`Total: XXX kcal`) e uma barra visual comparando com o gasto do astronauta, gerando 3 avaliações distintas quando os 3 grupos forem preenchidos:
1. **Pior Escolha — Energia Insuficiente (`< 650 kcal`, ex: Tofu + Salada + Tortilha = 365 kcal):**
   - Barra amarela/vermelha e alerta da **Capi**: *"Atenção, comandante! Você gastou muita energia nos exercícios e essa refeição tem poucas calorias. O astronauta vai ficar sem força — troque por alimentos mais energéticos!"*
   - Bloqueia a confirmação (ou penaliza a energia da base/astronauta) incentivando ajustar a bandeja.
2. **Melhor Escolha — Reposição Equilibrada (`650 – 820 kcal`, ex: Peixe Selado + Brócolis + Quinoa = 780 kcal):**
   - Barra verde brilhante e elogio da **Capi**: *"Combinação perfeita! Você repôs exatamente a energia gasta nos treinos com proteínas, vitaminas e carboidratos na medida certa!"*
   - Libera o botão de confirmação com bônus máximo de saúde e energia.
3. **Excesso Calórico (`> 820 kcal`, ex: Peixe + Brócolis + Arroz Integral = 900 kcal):**
   - Barra laranja e aviso educativo da **Capi**: *"Essa refeição ultrapassou o gasto energético do dia! Muita energia acumulada pode causar desconforto antes da próxima atividade. Tente equilibrar um item mais leve."*

### 4. Manter Mecânicas Existentes & Validar
- Mantenha o Drag & Drop (arrastar ou tocar) e o **Dispensador de Água (`300 – 400 ml`)** funcionando normalmente.
- Teste no navegador integrado montando uma combinação fraca, uma excessiva e uma ideal para confirmar que o cálculo de `kcal` e os balões da Capi respondem corretamente.