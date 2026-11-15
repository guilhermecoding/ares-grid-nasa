# Sequência da aventura — Ares Grid

Fonte canônica: [`Narrativa de aventura infantil-35-77.pdf`](./Narrativa%20de%20aventura%20infantil-35-77.pdf).

Este arquivo existe para deixar o **encadeamento** óbvio. O PDF é longo; o planejamento Stardew (`planejamento_completo_do_projeto_aresgrid.md`) descreve **outro loop** (rover + dormir no tile). Para missões narrativas, use **este** documento.

---

## 1. Arco completo (ordem fixa)

```text
CENA 1     Contagem regressiva
CENA 2     Decolagem / viagem espacial
CENA 3     Conhecer a Capi
CENA 3.1   Personalizar astronauta
CENA 4     Pouso em Arcadia Planitia
           └─ Sistema: “Energia externa: SOLAR AINDA NÃO INSTALADO”
                │
                ▼
MISSÃO 1   Energia para Explorar Marte     → painéis / bateria da base
                │  fim: diário + servidor + transmissão
                ▼
MISSÃO 2   Cuidando do Astronauta          → rotina / saúde
                │  fim: dormir → relatório Capi → servidor → amanhecer
                ▼
MISSÃO 3   O Mistério do Gelo de Marte     → gelo / água
                │
                ▼
MISSÃO 4   A Primeira Estufa de Marte      → comida / suporte à vida
                │
                ▼
MISSÃO 5   Alerta! Tempestades em Marte    → proteger base e tripulação
                │
                ▼
CENA 6     Central de comunicação com a Terra
CENA 7     O futuro da vida em Marte
```

**Por que nessa ordem (cadeia de recursos):**

| # | Missão | Desbloqueia / prepara |
|:-:|--------|------------------------|
| 1 | Energia | Eletricidade da base (tudo o mais depende disso) |
| 2 | Saúde | Astronauta em condições de explorar |
| 3 | Gelo | Água a partir de recurso local |
| 4 | Estufa | Comida (precisa água + energia) |
| 5 | Tempestades | Stress-test: a base aguenta o ambiente? |

No mapa (`src/data/missionNodes.ts`), os nós 1→5 seguem esse arco; só **1 e 2** estão jogáveis hoje.

---

## 2. Ciclo entre missões (PDF § “Ciclo de exploração e transmissão”)

Repete a cada missão (não é o loop Stardew do rover):

1. **Receber** — Capi apresenta o objetivo  
2. **Planejar** — consultar info / equipamentos  
3. **Explorar** — desafios da missão  
4. **Registrar** — diário (evento, aspecto, fotografia)  
5. **Retornar à nave** — servidor de bordo  
6. **Transmitir** — tenta link com a Terra (pode ficar pendente)  
7. **Dormir** — Capi faz relatório de saúde + científico  
8. **Prosseguir** — próxima missão  

O “dormir” da narrativa = **cena entre missões** (relatório da Capi), não o botão Dormir do grid Stardew.

---

## 3. Detalhe por missão

### Abertura (Cenas 1–4)
- Contagem → decolagem → Capi → customização → pouso.
- Pouso deixa explícito: **sem painéis solares ainda**.

### Missão 1 — Energia para Explorar Marte
- **1.1** Local de instalação  
- **1.2** Inclinação / posição do Sol (Capi calcula)  
- **1.3** Teste do sistema (tempestade / baterias)  
- Fecho: diário + armazenamento + transmissão  

### Missão 2 — Cuidando do Astronauta
- **2.1** Exercícios  
- **2.2** Alimentação e hidratação  
- **2.3** Higiene  
- **2.4** Hora de dormir  
- **Cena especial:** Capi no sono (painel de saúde + diário científico + envio) → amanhecer  

### Missão 3 — O Mistério do Gelo
- Ambiente → dados NASA → perfurações → material congelado → derreter → potabilidade → registro/transmissão  

### Missão 4 — A Primeira Estufa
- Construir → métodos → espécies → crescimento → sistema sustentável → sono/relatório  

### Missão 5 — Tempestades
- Poeira → proteger painéis → radiação solar → inspeção → relatório de segurança  

### Cenas finais 6–7
- Transmissão completa à Terra → reflexão sobre o futuro em Marte  

---

## 4. Estado no código (implementado × falta)

| Bloco | Status | Onde |
|-------|--------|------|
| Cenas 1–4 (abertura) | Implementado | `src/opening/`, `docs/prompts/prompt-inicio.md` |
| Missão 1 | Implementado | `src/mission1/`, `docs/prompts/prompt-missao-01.md` |
| Missão 2 | Implementado | `src/components/mission2/`, `src/prompt/mission-02.md` |
| Missão 3 | Só nó no mapa (“Em breve”) | `missionNodes.ts` level 3 |
| Missão 4 | Só nó no mapa | level 4 |
| Missão 5 | Só nó no mapa | level 5 |
| Cenas 6–7 | Não implementadas | — |
| Ciclo dormir/relatório Capi | Parcial na M2 (`NightReportModal`) | Não é o `sleep()` do worldEngine |
| Loop Stardew (andar / dormir no 🏠) | Engine existe; UI do mapa **não liga** | `worldEngine.sleep`, `WorldScreen` stubs |

`PLAYABLE_MISSION_LEVELS = [1, 2]` em `src/data/missionNodes.ts`.

---

## 5. Recursos do HUD (leitura alinhada à narrativa)

| Indicador | Significado na aventura |
|-----------|-------------------------|
| **Energia / Bateria** | Eletricidade da base (Missão 1). Atividades gastam carga dos sistemas. |
| **Água** | Reserva da base (vira foco na Missão 3). |
| **Saúde** | Astronauta (Missão 2 e painel da Capi no sono). |

A “noite que enche a bateria” do `worldEngine` (dormir no habitat do grid) **não** é a noite da Missão 2 do PDF. No produto atual, após a M2 o progresso salva o que sobrou das barras.

---

## 6. Como usar este doc

- **Ao implementar missão nova:** seguir a ordem 1→5 e o ciclo §2; desbloquear no mapa só a próxima.  
- **Ao escrever copy da Capi:** amarrar à missão anterior (“painéis ligados” → saúde; “água ok” → estufa).  
- **Não misturar** regras do planejamento Stardew com o arco do PDF, a menos que a UI do rover volte a ser jogável.

---

## 7. Referência rápida de arquivos

| Assunto | Arquivo |
|---------|---------|
| Narrativa completa | `docs/Narrativa de aventura infantil-35-77.pdf` |
| Nós do mapa | `src/data/missionNodes.ts` |
| Prompt M01 | `docs/prompts/prompt-missao-01.md` |
| Prompt M02 | `src/prompt/mission-02.md` |
| Planejamento Stardew (legado / paralelo) | `docs/planejamento_completo_do_projeto_aresgrid.md` |
