# Planejamento Mestre do Projeto — AresGrid: Junior Mars Mission Trainer

**Evento:** NASA Space Apps Challenge 2026  
**Desafio:** *Build a Junior Astronaut Mission Trainer*  
**Público-Alvo:** Crianças e pré-adolescentes de 7 a 12 anos (com suporte para uso em sala de aula e família)  
**Cenário Científico:** **Arcadia Planitia (Setor AP-1)** — Zona Candidata da NASA para Futuras Missões Tripuladas em Marte  
**Conceito Central:** Fazendinha espacial estilo *Stardew Valley* na superfície de Arcadia Planitia. A criança controla um robô (🤖), anda, interage com módulos da base, dorme para passar o Sol e sobe de nível — com clima espacial real da **NASA DONKI**.

---

## 0. Como configurar e rodar (API + Stack)

### 0.1 Pré-requisitos

| Item | Versão / Notas |
| :--- | :--- |
| Node.js | 20+ recomendado |
| pnpm | 9+ (o repositório usa `pnpm-lock.yaml`) |
| Navegador | Chrome / Edge / Firefox / Safari (tablets landscape preferidos) |
| Chave NASA | **Não necessária** para CCMC DONKI-API em `ccmc.gsfc.nasa.gov` |

### 0.2 Instalação

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm build        # gera dist/
pnpm preview      # serve o build de produção
pnpm lint
```

### 0.3 Stack instalada (estado atual do repositório)

| Camada | Tecnologia |
| :--- | :--- |
| UI | React 19 + TypeScript + Vite 8 |
| Estilo | Tailwind CSS v4 (`@tailwindcss/vite`) + tema “madeira/poeira” Stardew-Marte |
| Fontes | Pixelify Sans (títulos) + Nunito (corpo) |
| Ícones | lucide-react |
| Áudio | Web Audio API (`soundEngine.ts`) — sem MP3; mute por padrão |
| Persistência | `localStorage` (`aresgrid-progress-v2` + cache DONKI 30 min) |
| Backend | Nenhum obrigatório — SPA 100% client-side |
| Deploy sugerido | Vercel ou GitHub Pages |

### 0.4 Variáveis de ambiente

Nenhuma variável é obrigatória no MVP. CCMC DONKI público não exige API key.

### 0.5 Endpoints NASA DONKI

Base oficial: `https://ccmc.gsfc.nasa.gov/DONKI-API/get/`

| Recurso | Path | Uso no jogo |
| :--- | :--- | :--- |
| Solar Flares | `/FLR` | Clima do Sol (`flare`) |
| CME | `/CME` (impacto em Mars) | Clima do Sol (`cme`) |
| SEP | `/SEP` | Clima do Sol (`sep`) |

**Comportamento (`donkiService` + `weatherService`):**

1. Dev: proxy Vite `/donki-api` → CCMC (evita CORS).
2. Produção: fetch direto ao CCMC; se falhar → catálogo histórico.
3. Cache 30 min em `localStorage`.
4. Cada **Sol** (dia marciano) sorteia/rotaciona um clima a partir do bundle DONKI.
5. Tempestade aumenta risco fora do habitat; dormir no 🏠 avança o Sol.

### 0.6 Estrutura de pastas

```text
ares-grid-nasa/
├── index.html
├── package.json
├── vite.config.ts
├── docs/planejamento_completo_do_projeto_aresgrid.md
└── src/
    ├── App.tsx                 # home | world
    ├── index.css               # tokens Stardew-Marte
    ├── types/game.ts, nasa.ts
    ├── services/
    │   ├── donkiService.ts
    │   ├── weatherService.ts
    │   ├── progressStore.ts    # v2: level, xp, tools
    │   └── soundEngine.ts
    ├── data/
    │   ├── levels.ts           # progressão 1–5
    │   ├── arcadiaSiteData.ts
    │   ├── curatedDonkiEvents.ts
    │   └── osdrCrops.ts
    ├── engine/worldEngine.ts   # move / interact / sleep
    └── components/
        ├── HomeScreen.tsx
        ├── WorldScreen.tsx
        ├── MarsGrid.tsx
        ├── StardewHud.tsx
        ├── QuestBanner.tsx
        ├── DialogBox.tsx
        └── NasaDataModal.tsx
```

### 0.7 Progresso local

Chave: `aresgrid-progress-v2` — nome, nível, XP, ferramentas, Sols jogados, tutorial, mute.

### 0.8 Controles

| Ação | Como |
| :--- | :--- |
| Andar | D-pad na HUD, setas do teclado, ou toque em célula **vizinha** |
| Interagir | Botão Interagir, tecla `E` / Espaço, ou toque na célula atual |
| Dormir | No habitat 🏠 → botão Dormir |

---

## 1. Visão Geral — Arcadia Planitia

### 1.1 Por que Arcadia Planitia
Região candidata a exploração humana (~39°N), com gelo raso (**NASA SWIM**), terreno plano (**HiRISE**) e equilíbrio solar adequado a painéis.

### 1.2 Solução AresGrid (loop Stardew)
A criança é o robô da base AP-1:

1. Acorda com o **clima DONKI** do Sol.
2. Vê **um** objetivo do nível (ex.: limpar 2 painéis).
3. Anda e interage (limpar, perfurar gelo, colher, minerar, reforçar escudo).
4. Energia (stamina) cai; dorme na casinha → próximo Sol.
5. Completa objetivo → sobe de nível → desbloqueia tiles/ferramentas.

### 1.3 Diferenciais
- Aprendizado por **fazenda espacial aconchegante**, não por dashboard técnico.
- Progressão clara por níveis (7–12 anos).
- Ciência NASA rastreável (DONKI, SWIM, OSDR) no botão **Ciência NASA**.

---

## 2. Game Design — Progressão

| Nível | Título | Desbloqueio | Objetivo |
| ---: | :--- | :--- | :--- |
| 1 | Fazendeiro Solar | Andar + limpar painéis | Limpar 2 painéis |
| 2 | Caçador de Gelo SWIM | Perfuração SWIM | Extrair 1 gelo |
| 3 | Jardineiro OSDR | Estufas | Colher 1 cultura |
| 4 | Construtor de Escudo | Regolito + cúpula | Depositar 1 escudo |
| 5 | Guardião da Tempestade | Sols de tempestade | Sobreviver a 2 Sols de tempestade |

Tiles trancados mostram 🔒 até o nível correspondente.

### Recursos (simplificados)
- **Energia** — stamina principal (como Stardew).
- **Base (vida)** — suporte à vida suave (painéis limpos, gelo, colheitas).
- **Escudo** — proteção em Sols de tempestade DONKI.

---

## 3. Matriz NASA

| Fonte | Uso pedagógico |
| :--- | :--- |
| CCMC DONKI (FLR/CME/SEP) | Clima do Sol / tempestades |
| NASA SWIM | Tile de perfuração de gelo |
| NASA OSDR | Culturas da estufa |
| Mars Trek / HiRISE | Contexto do sítio Arcadia |

---

## 4. Roadmap

- [x] Conceito Arcadia Planitia + DONKI híbrido live/curated
- [x] Loop Stardew: andar / interagir / dormir / níveis
- [x] UI cozy (tema madeira/poeira, robô emoji, HUD inferior)
- [x] Tutorial em caixas de diálogo
- [x] Persistência local v2
- [ ] Deploy Vercel/GitHub Pages
- [ ] Vídeo pitch Space Apps
- [ ] (Opcional) mapa 6×6, mais níveis, login

---

## 5. Checklist de submissão

* [ ] Link público sem login
* [x] Docs de planejamento / setup neste arquivo
* [x] Atribuição NASA (modal Ciência NASA)
* [ ] Vídeo ou slides de gameplay

---

## 6. Atribuição de Dados da NASA

* [CCMC DONKI](https://ccmc.gsfc.nasa.gov/tools/DONKI/)
* [NASA SWIM](https://swim.psi.edu/)
* [NASA OSDR](https://osdr.nasa.gov/bio/)
* [Mars Trek](https://trek.nasa.gov/mars/)
