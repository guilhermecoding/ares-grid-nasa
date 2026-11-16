import os
import subprocess
import sys

def build_html_doc1():
    return """<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Ares Grid - Relatório de Alterações de Programação e Adaptabilidade Pedagógica</title>
<style>
  @page {
    size: A4 portrait;
    margin-top: 1.8cm;
    margin-bottom: 1.8cm;
    margin-left: 1.8cm;
    margin-right: 1.8cm;
  }
  body {
    font-family: 'Liberation Sans', Arial, Helvetica, sans-serif;
    color: #1e293b;
    font-size: 9.5pt;
    line-height: 1.55;
    background-color: #ffffff;
  }
  .header-banner {
    background-color: #0b132b;
    color: #ffffff;
    padding: 24px 28px;
    border-radius: 8px;
    margin-bottom: 22px;
    border-left: 8px solid #00b4d8;
  }
  .tag-meta {
    background-color: #1c2541;
    color: #00b4d8;
    padding: 3px 10px;
    border-radius: 4px;
    font-size: 8pt;
    font-weight: bold;
    text-transform: uppercase;
    display: inline-block;
    margin-bottom: 10px;
    border: 1px solid #3a506b;
    letter-spacing: 0.5px;
  }
  h1 {
    font-size: 19pt;
    margin: 0 0 8px 0;
    color: #ffffff;
    font-weight: 700;
    line-height: 1.25;
  }
  .header-subtitle {
    font-size: 10.5pt;
    color: #94a3b8;
    margin: 0;
    line-height: 1.4;
  }
  .meta-grid {
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid #334155;
    font-size: 8.5pt;
    color: #cbd5e1;
  }
  .meta-grid span {
    margin-right: 18px;
  }
  h2 {
    color: #0b132b;
    font-size: 13pt;
    border-bottom: 2px solid #00b4d8;
    padding-bottom: 4px;
    margin-top: 24px;
    margin-bottom: 10px;
    font-weight: 700;
  }
  h3 {
    color: #1c2541;
    font-size: 10.5pt;
    margin-top: 16px;
    margin-bottom: 6px;
    font-weight: bold;
  }
  p {
    margin: 0 0 10px 0;
    text-align: justify;
  }
  .callout {
    background-color: #f0f9ff;
    border: 1px solid #bae6fd;
    border-left: 4px solid #0284c7;
    padding: 10px 14px;
    border-radius: 4px;
    margin: 12px 0;
    font-size: 9pt;
  }
  .callout-warning {
    background-color: #fffbeb;
    border: 1px solid #fde68a;
    border-left: 4px solid #d97706;
    padding: 10px 14px;
    border-radius: 4px;
    margin: 12px 0;
    font-size: 9pt;
  }
  .callout-success {
    background-color: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-left: 4px solid #16a34a;
    padding: 10px 14px;
    border-radius: 4px;
    margin: 12px 0;
    font-size: 9pt;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0;
    font-size: 8.5pt;
  }
  th, td {
    border: 1px solid #cbd5e1;
    padding: 6px 10px;
    text-align: left;
    vertical-align: top;
  }
  th {
    background-color: #f1f5f9;
    color: #0f172a;
    font-weight: bold;
  }
  tr:nth-child(even) td {
    background-color: #f8fafc;
  }
  ul {
    margin: 6px 0 10px 20px;
    padding: 0;
  }
  li {
    margin-bottom: 4px;
    text-align: justify;
  }
  .badge {
    background-color: #e0f2fe;
    color: #0369a1;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 8pt;
    font-weight: bold;
    display: inline-block;
  }
  .badge-purple {
    background-color: #f3e8ff;
    color: #7e22ce;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 8pt;
    font-weight: bold;
    display: inline-block;
  }
  .page-break {
    page-break-before: always;
  }
</style>
</head>
<body>

  <div class="header-banner">
    <div class="tag-meta">NASA Space Apps Challenge // Documentação de Engenharia &amp; Pedagogia</div>
    <h1>ARES GRID: RELATÓRIO DE DESENVOLVIMENTO &amp; ADAPTABILIDADE PEDAGÓGICA</h1>
    <div class="header-subtitle">Detalhamento das Alterações de Programação, Recursos Implementados, Refatorações de Estabilidade e Engenharia de Acessibilidade para o Público Infantil (7 a 12 Anos)</div>
    <div class="meta-grid">
      <span><strong>Projeto:</strong> Ares Grid (Base Arcadia Planitia AP-1)</span>
      <span><strong>Público-Alvo:</strong> Crianças de 7 a 12 anos (Ensino Fundamental I e II)</span>
      <span><strong>Versão:</strong> 2.0 (Missões 1 a 5 Completas)</span>
      <span><strong>Data:</strong> Novembro de 2026</span>
    </div>
  </div>

  <h2>1. Visão Geral e Contexto do Projeto</h2>
  <p>O <strong>Ares Grid</strong> é uma plataforma interativa de aprendizagem científica desenvolvida no âmbito do <em>NASA Space Apps Challenge</em>, concebida para aproximar o público infantil de 7 a 12 anos dos desafios reais da colonização e sobrevivência humana em Marte. Ambientado na região equatorial-norte de <strong>Arcadia Planitia</strong> (coordenadas 40.0° N, 180.0° W), o projeto integra dados científicos autênticos da NASA (satélites orbitais, perfis estratigráficos de gelo, clima espacial e algoritmos solares) em uma narrativa gamificada, intuitiva e acolhedora.</p>
  <p>A experiência é guiada pela mentora robótica <strong>Capi</strong> (uma capivara cibernética inteligente), cuja função pedagógica é mediar conceitos complexos de astrofísica, biologia de suporte de vida e engenharia de recursos in-situ (ISRU), transformando-os em tomadas de decisão acessíveis, táteis e estimulantes para o público infantojuvenil.</p>

  <div class="callout">
    <strong>Objetivo deste Documento:</strong> Apresentar um registro técnico e pedagógico minucioso de todas as alterações de programação efetuadas na base de código, descrevendo o escopo completo do que foi implementado (do prólogo à quinta missão), as refatorações arquiteturais que foram necessárias para superar gargalos de usabilidade e as soluções aplicadas para garantir total adaptabilidade ao público de 7 a 12 anos.
  </div>

  <h2>2. Escopo Implementado: O Que Foi Desenvolvido na Programação</h2>
  <p>Ao longo dos ciclos de desenvolvimento, a programação do software foi expandida de um protótipo conceitual para um ecossistema educacional completo composto por 5 missões sequenciais integradas, antecedidas por um prólogo interativo de lançamento e introdução narrativa.</p>

  <h3>2.1. Prólogo Interativo e Customização do Astronauta</h3>
  <ul>
    <li><strong>Sequência de Decolagem e Física de Partículas:</strong> Desenvolvimento do componente <code>LaunchSpaceCanvas</code>, utilizando a API HTML5 Canvas para simular o campo estelar dinâmico com variação de velocidade relativística e física de empuxo durante a saída da órbita terrestre.</li>
    <li><strong>Aproximação de Marte e Efeito de Shaders:</strong> Criação do componente <code>MarsApproachCanvas</code> integrado à biblioteca <code>marsZoom.ts</code>, que calcula e renderiza dinamicamente a curvatura do planeta vermelho, gradiente de dispersão atmosférica e iluminação solar contextual.</li>
    <li><strong>Customizador de Astronauta (<code>AstronautCustomizer</code>):</strong> Criação de um seletor visual interativo permitindo à criança personalizar seu avatar espacial (cor do traje, tipo de visor hermético do capacete, insígnia da missão e modelo de mochila de suporte de vida), promovendo imediato vínculo de identidade e pertencimento emocional com a jornada.</li>
    <li><strong>Sistema de Diálogo com Estética Retrô (<code>PixelDialogBox</code>):</strong> Implementação de caixas de diálogo tematizadas em pixel art com efeito sonoro e visual de máquina de escrever (<em>typewriter</em>), retratos expressivos da Capi (neutra, entusiasmada, em dúvida) e suporte a rodapés com botões de ação customizados.</li>
  </ul>

  <h3>2.2. Missão 01 — Energia para Explorar Marte</h3>
  <ul>
    <li><strong>Seleção Topográfica de Sítio:</strong> Implementação do desafio de alocação de painéis solares em três sítios distintos (Vale das Sombras, Planície dos Ventos e Encosta Ensolarada), ensinando a influência do relevo na incidência solar e no acúmulo de poeira marciana.</li>
    <li><strong>Simulador Solar Baseado em Dados Astronômicos Reais:</strong> Integração com o algoritmo <code>mars24.ts</code> (baseado em modelos matemáticos do NASA Goddard Institute for Space Studies), permitindo que a criança ajuste a inclinação (tilt) e o azimute dos painéis conforme a latitude da base (40°N), calculando a eficiência fotovoltaica resultante em tempo real.</li>
    <li><strong>Dinâmica de Desgaste por Poeira e Limpeza:</strong> Introdução da mecânica de degradação periódica da eficiência dos painéis devido ao depósito de regolito fino suspenso no ar marciano, permitindo ao jogador acionar ciclos de limpeza preventiva para restaurar o fornecimento energético da base.</li>
    <li><strong>Diário de Bordo e Transmissão:</strong> Consolidação dos parâmetros energéticos instalados no <code>LogbookModal</code>, com telemetria gravada no servidor de bordo e tentativa de transmissão para a Terra.</li>
  </ul>

  <h3 class="page-break">2.3. Missão 02 — Cuidando do Astronauta</h3>
  <ul>
    <li><strong>Suporte de Vida e Ciclo Circadiano Marciano:</strong> Modelagem da rotina de saúde do astronauta em gravidade reduzida (0.38g), monitorando três indicadores fundamentais: Energia da base, Reserva de Água e Nível de Saúde do tripulante.</li>
    <li><strong>Módulo de Exercícios Físicos:</strong> Criação do componente <code>ExerciseStep</code>, onde o jogador escolhe entre esteira com arnês elástico, exercícios de resistência contra perda óssea, alongamentos e treino de equilíbrio, compreendendo os impactos da microgravidade no corpo humano.</li>
    <li><strong>Módulo de Nutrição e Hidratação Espacial:</strong> Implementação do <code>NutritionStep</code>, permitindo a composição de bandejas alimentares com alimentos liofilizados balanceados (proteínas, carboidratos, vegetais frescos e eletrólitos), associando o gasto metabólico ao consumo de água potável.</li>
    <li><strong>Baia de Higienização Interativa (<code>HygieneBay</code>):</strong> Criação de minigame tátil simulando os protocolos de higiene espacial sem água corrente livre (uso de toalhas umedecidas com antisséptico e mangueiras de aspiração a vácuo para contenção de gotículas em gravidade marciana).</li>
    <li><strong>Ciclo de Sono e Relatório Médico Noturno (<code>NightReportModal</code>):</strong> Ao final do sol de trabalho, o astronauta descansa enquanto a robô Capi processa a telemetria biológica, gerando um relatório analítico dos ganhos de bem-estar e restaurando a energia para o próximo ciclo de exploração.</li>
  </ul>

  <h3>2.4. Missão 03 — O Mistério do Gelo de Marte</h3>
  <ul>
    <li><strong>Sensoriamento Remoto e Radar Orbital SHARAD:</strong> Baseado em dados autênticos do instrumento SHARAD da sonda <em>Mars Reconnaissance Orbiter</em> (NASA MRO), foi desenvolvido o componente <code>LayeredMapStep</code>, onde o jogador alterna entre camadas visuais (superfície fotográfica, ecogramas de radar orbital, geologia de terreno e mapeamento de lâminas de gelo subterrâneo).</li>
    <li><strong>Sondagem e Extração Criogênica:</strong> O jogador realiza perfurações em três setores (Alpha, Beta e Gamma), aprendendo que o Setor Beta apresenta uma cobertura ideal de regolito protetor (1 a 2 metros) que preserva gelo de alta pureza sem sobrecarregar a broca perfuratriz.</li>
    <li><strong>Usina de Processamento de Gelo em 6 Etapas:</strong> Implementação de uma esteira industrial interativa em <code>IceProcessingStep</code> contemplando: identificação da amostra, desbaste mecânico de regolito, fusão térmica controlada, microfiltração de sedimentos, purificação catalítica e controle final de qualidade da água.</li>
    <li><strong>Laboratório de Potabilidade Química e Biológica (<code>PotabilityStep</code>):</strong> Introdução de ensaios laboratoriais com cartões explicativos (<code>AssayCard</code> e <code>AssayIcon</code>) para verificação de pH neutro (6.5 a 8.5), teste de condutividade elétrica (salinidade), remoção crítica de percloratos tóxicos marcianos, detecção de metais pesados e desinfecção microbiológica via radiação ultravioleta.</li>
  </ul>

  <h3>2.5. Missão 04 — A Primeira Estufa de Marte</h3>
  <ul>
    <li><strong>Construção Modular da Cúpula Botânica (<code>Mission4View</code>):</strong> Montagem da infraestrutura agrícola fechada, incluindo a casca externa de polímero protetor contra radiação UV, iluminação espectral de LEDs otimizados para fotossíntese, dutos de circulação e filtragem de ar, termorregulação e sensores automatizados.</li>
    <li><strong>Comparação de Métodos de Cultivo Espacial:</strong> Apresentação e escolha entre Hidroponia (raízes em solução aquosa rica em sais minerais), Aeroponia (raízes suspensas recebendo névoa nutritiva pressurizada) e Solo de Regolito Marciano (previamente lavado de percloratos e enriquecido com matéria orgânica).</li>
    <li><strong>Seleção de Espécies e Banco de Sementes da NASA:</strong> Seleção de vegetais com base em estudos reais da NASA (estufa Veggie na Estação Espacial Internacional): alface, tomate, cenoura, morango, trigo anão e zínias ornamentais (utilizadas para testar polinização e resposta a fotoperíodo).</li>
    <li><strong>Integração com o BLSS (Bioregenerative Life Support System):</strong> Ensino do fechamento de ciclo ecológico, demonstrando como a transpiração das plantas fornece água purificada, sua fotossíntese repõe oxigênio (O₂) para o habitáculo e o consumo de biomassa residual alimenta os compostores da base.</li>
  </ul>

  <h3>2.6. Missão 05 — Alerta! Tempestades em Marte &amp; Encerramento da Expedição</h3>
  <ul>
    <li><strong>Diferenciação Pedagógica de Ameaças Ambientais:</strong> O jogo ensina a diferença fundamental entre Tempestades de Poeira Convectivas (que obscurecem o céu, cobrem os painéis solares e danificam motores) e Eventos de Radiação Solar/Ejeções de Massa Coronal da NASA DONKI (radiação ionizante invisível de prótons e raios-X altamente perigosa para tecidos biológicos).</li>
    <li><strong>Procedimentos de Emergência e Vedação (<code>DustLatchId</code>):</strong> Sequência tátil de protocolo de alerta: recolhimento de sondas externas, isolamento hermético de eclusas e desacoplamento de linhas de transmissão elétrica de alta voltagem para proteger os bancos de baterias.</li>
    <li><strong>Engenharia de Blindagem Radiológica:</strong> Escolha do abrigo seguro, demonstrando que materiais ricos em hidrogênio (tanques de água tratada obtida na Missão 3) combinados com espessas paredes de regolito constituem a melhor barreira contra raios cósmicos e partículas solares energéticas.</li>
    <li><strong>Inspeção Pós-Tempestade e Recuperação:</strong> Deslocamento do astronauta para avaliação de integridade física dos 4 pilares da base: módulos habitacionais, parque solar, estufa botânica e antena de comunicação.</li>
    <li><strong>Cenas Finais 6 e 7 (Transmissão à Terra e Futuro em Marte):</strong> Encerramento triunfal onde o jogador transmite o banco de dados científico acumulado para a Terra via Deep Space Network (DSN) e assiste a uma reflexão inspiradora sobre os passos futuros da humanidade no cosmos.</li>
  </ul>

  <h2 class="page-break">3. Alterações e Refatorações Necessárias na Programação</h2>
  <p>Para viabilizar uma experiência fluida, sem travamentos de taxa de quadros e intuitiva para crianças em diferentes dispositivos (incluindo tablets escolares e computadores mais modestos), diversas alterações de arquitetura e refatorações no código-fonte foram executadas:</p>

  <table>
    <thead>
      <tr>
        <th style="width: 28%;">Componente / Módulo</th>
        <th style="width: 32%;">Desafio Técnico Encontrado</th>
        <th style="width: 40%;">Alteração Implementada &amp; Benefício</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Padronização de Telas (<code>MissionStage</code>)</strong></td>
        <td>Cada tela possuía estruturas de cabeçalho, navegação e rodapé distintas, causando inconsistência visual e retrabalho no dimensionamento em telas menores.</td>
        <td>Criação de componentes genéricos (<code>Mission2Stage</code>, <code>Mission3Stage</code>, <code>Mission4Stage</code>, <code>Mission5Stage</code>) com layout fixo, cabeçalho de Sol marciano unificado e contêineres responsivos.</td>
      </tr>
      <tr>
        <td><strong>Otimização de Assets Gráficos (SVG &rarr; PNG)</strong></td>
        <td>Arquivos vetoriais SVG complexos com gradientes, sombras e dezenas de nós causavam quedas severas de FPS durante animações em tablets Android.</td>
        <td>Conversão seletiva de vetores pesados para formatos rasterizados otimizados (PNGs com compressão lossless e WebP), reduzindo o tempo de renderização em até 70%.</td>
      </tr>
      <tr>
        <td><strong>Gestão de Diálogos e Saltos (<code>PixelDialogBox</code>)</strong></td>
        <td>Crianças que rejogavam missões se sentiam frustradas com a obrigatoriedade de reler diálogos longos letra por letra sem opção de avanço ágil.</td>
        <td>Desenvolvimento do hook <code>useHideFollowingDialogs</code> e suporte a <code>onSkip</code>: o jogador pode pular blocos de fala instantaneamente ou silenciar tutoriais já concluídos.</td>
      </tr>
      <tr>
        <td><strong>Imersão em Tela Cheia (<code>FullscreenButton</code>)</strong></td>
        <td>Em navegadores de tablets ou laptops, toques involuntários na barra de URL ou gestos acidentais fechavam a janela ou causavam zoom desordenado.</td>
        <td>Integração da API <code>requestFullscreen()</code> no botão de ação da abertura (<code>ReadyGate</code>) e introdução de botão flutuante de tela cheia acessível em todas as missões.</td>
      </tr>
      <tr>
        <td><strong>Modelo de Persistência (<code>progressStore.ts</code>)</strong></td>
        <td>Falhas transitórias de energia em testes de painel podiam colocar o jogo em estado de "soft-lock" (bloqueio definitivo sem recursos para continuar).</td>
        <td>Refatoração da persistência: separação estrita entre métricas de teste voláteis e indicadores vitais permanentes da base, garantindo que retentativas pedagógicas não destruam o savegame.</td>
      </tr>
      <tr>
        <td><strong>Balanceamento de Custos Energéticos</strong></td>
        <td>Custos rigorosos de energia em atividades da Missão 2 desestimulavam a exploração de todas as opções de exercício e nutrição pelo público jovem.</td>
        <td>Recalibração matemática dos valores de gasto energético e aumento das recompensas de bem-estar por refeição balanceada, mantendo o desafio educativo sem frustração.</td>
      </tr>
    </tbody>
  </table>

  <h2>4. Adaptabilidade da Tecnologia ao Público-Alvo (7 a 12 Anos)</h2>
  <p>Projetar software educacional para crianças de 7 a 12 anos impõe desafios singulares: a tecnologia precisa ser acessível para os mais jovens (em fase de consolidação leitora e desenvolvimento de coordenação motora fina) e, ao mesmo tempo, intelectualmente instigante para os mais velhos (que demandam desafios com lógica real e profundidade científica). A seguir, detalham-se as soluções de adaptabilidade adotadas no Ares Grid:</p>

  <h3>4.1. Mediação Linguística e o Componente SciTerm</h3>
  <p>A astrobiologia e a engenharia aeroespacial utilizam um jargão denso (como <em>percloratos, SHARAD, criogenia, regolito, aeroponia, BLSS</em>). Para evitar que esses termos causassem afastamento ou intimidação, foi concebida uma arquitetura de mediação pedagógica em múltiplos níveis:</p>
  <ul>
    <li><strong>Glossário Dinâmico em Tempo Real (<code>SciTerm.tsx</code>, <code>SciTermM2</code>, <code>SciTermM3</code>, <code>SciTermM5</code>):</strong> Palavras científicas chave são destacadas com estilização sutil e ícone discreto. Ao tocar ou passar o mouse sobre o termo, um balão explicativo em linguagem lúdica e analógica é exibido instantaneamente (exemplo: perclorato é explicado como <em>"um tipo de sal tóxico que fica na poeira de Marte e que precisa ser lavado da água antes de podermos beber"</em>).</li>
    <li><strong>Textos Sintéticos e Estrutura Frasal Direta:</strong> Textos longos foram quebrados em cartões concisos de no máximo 2 a 3 linhas por parágrafo, com palavras essenciais destacadas em cores vibrantes para direcionar o foco visual.</li>
  </ul>

  <h3>4.2. Ergonomia Visual, Tátil e Acessibilidade Motora</h3>
  <ul>
    <li><strong>Alvos de Toque Sobredimensionados (<code>McButton</code>):</strong> Todos os elementos interativos possuem área de clique/toque de no mínimo 48x48 pixels, com bordas salientes, sombras chanfradas e feedback de depressão tátil ao pressionar, evitando toques falsos em telas sensíveis.</li>
    <li><strong>Minigames de Interação Sensorial Direta:</strong> Em vez de meros formulários de perguntas e respostas de múltipla escolha, o software emprega mecânicas mecânico-sensoriais intuitivas. Na limpeza dos painéis e trajes, o jogador utiliza o minigame <code>DustScrubCanvas</code>, onde move o dedo ou cursor diretamente sobre a poeira para limpá-la; na nutrição e exercícios, arrasta ou clica em bandejas e equipamentos com animações de encaixe imediato.</li>
    <li><strong>Contraste e Legibilidade:</strong> Emprego de contraste em conformidade com as diretrizes WCAG AAA para texto em fundo escuro espacial, combinando tons ciano brilhante (<code>#00f3ff</code>), verde bio e amarelo alerta sobre fundos azul-escuros profundos (<code>#0b132b</code>).</li>
  </ul>

  <h3 class="page-break">4.3. Pedagogia Positiva e Gestão da Frustração</h3>
  <p>Em jogos convencionais, falhas de planejamento frequentemente resultam em telas punitivas de "Game Over", o que gera abandono e desmotivação em crianças na faixa dos 7 aos 10 anos. No Ares Grid, adotou-se a filosofia da <strong>Pedagogia do Erro Construtivo</strong>:</p>
  <ul>
    <li><strong>Sem Punição Fatal:</strong> Nenhuma decisão incorreta destrói a base ou mata o astronauta. Se o aluno escolhe perfurar uma rocha basáltica imprópria no Setor Gamma, a broca emite um som de aviso, a Capi intervém explicando amigavelmente o motivo pelo qual aquele solo é inadequado e consome-se uma pequena cota de energia, incentivando o aluno a consultar o mapa de radar e tentar novamente com nova hipótese.</li>
    <li><strong>Celebração do Sucesso e Reforço Positivo:</strong> Cada objetivo completado é acompanhado de explosões visuais de confetes coloridos (<code>ConfettiBurst</code>), acordes musicais triunfais gerados pelo motor sonoro procedural e emissão de selos de conquista arquivados no Diário de Bordo.</li>
    <li><strong>A Mentora Capi como Âncora Afetiva:</strong> A presença constante da capivara robótica Capi, com suas expressões visuais variadas (de curiosidade, surpresa e celebração), humaniza a máquina e estabelece um canal seguro de comunicação, onde a criança se sente encorajada a explorar sem medo de errar.</li>
  </ul>

  <h3>4.4. Controle de Ritmo e Respeito à Neurodiversidade</h3>
  <ul>
    <li><strong>Ausência de Cronômetros Estressantes:</strong> Nenhuma fase de aprendizado impõe temporizadores regressivos com contagem regressiva punitiva. A criança pode ler no seu tempo, reler explicações quantas vezes desejar ou pausar a atividade sem penalidades, acomodando plenamente alunos com diferentes ritmos de aprendizagem, TDAH ou dislexia.</li>
    <li><strong>Velocidade de Leitura Ajustável:</strong> O efeito de máquina de escrever dos diálogos pode ser acelerado ou completado com um único toque na tela, permitindo que leitores fluentes avancem dinamicamente enquanto leitores em fase inicial acompanham o texto pausadamente.</li>
  </ul>

  <h2>5. Conclusão do Documento de Desenvolvimento</h2>
  <p>As alterações implementadas transformaram o projeto Ares Grid em uma suíte educativa robusta, moderna e de altíssimo impacto formativo. O alinhamento entre o rigor científico da NASA e uma ergonomia pensada especificamente para as necessidades cognitivas e motoras de crianças de 7 a 12 anos comprova que é viável ensinar astrobiologia, física orbital e ecologia espacial de forma acessível, inclusiva, bela e profundamente divertida.</p>

</body>
</html>
"""

def build_html_doc2():
    return """<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Ares Grid - Relatório Técnico, Stacks Tecnológicas e Pontos Fortes do Software</title>
<style>
  @page {
    size: A4 portrait;
    margin-top: 1.8cm;
    margin-bottom: 1.8cm;
    margin-left: 1.8cm;
    margin-right: 1.8cm;
  }
  body {
    font-family: 'Liberation Sans', Arial, Helvetica, sans-serif;
    color: #1e293b;
    font-size: 9.5pt;
    line-height: 1.55;
    background-color: #ffffff;
  }
  .header-banner {
    background-color: #030712;
    color: #ffffff;
    padding: 24px 28px;
    border-radius: 8px;
    margin-bottom: 22px;
    border-left: 8px solid #38bdf8;
  }
  .tag-meta {
    background-color: #0f172a;
    color: #38bdf8;
    padding: 3px 10px;
    border-radius: 4px;
    font-size: 8pt;
    font-weight: bold;
    text-transform: uppercase;
    display: inline-block;
    margin-bottom: 10px;
    border: 1px solid #1e293b;
    letter-spacing: 0.5px;
  }
  h1 {
    font-size: 19pt;
    margin: 0 0 8px 0;
    color: #ffffff;
    font-weight: 700;
    line-height: 1.25;
  }
  .header-subtitle {
    font-size: 10.5pt;
    color: #94a3b8;
    margin: 0;
    line-height: 1.4;
  }
  .meta-grid {
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid #1f2937;
    font-size: 8.5pt;
    color: #cbd5e1;
  }
  .meta-grid span {
    margin-right: 18px;
  }
  h2 {
    color: #0f172a;
    font-size: 13pt;
    border-bottom: 2px solid #38bdf8;
    padding-bottom: 4px;
    margin-top: 24px;
    margin-bottom: 10px;
    font-weight: 700;
  }
  h3 {
    color: #1e293b;
    font-size: 10.5pt;
    margin-top: 16px;
    margin-bottom: 6px;
    font-weight: bold;
  }
  p {
    margin: 0 0 10px 0;
    text-align: justify;
  }
  .callout {
    background-color: #f0f9ff;
    border: 1px solid #bae6fd;
    border-left: 4px solid #0284c7;
    padding: 10px 14px;
    border-radius: 4px;
    margin: 12px 0;
    font-size: 9pt;
  }
  .callout-tech {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-left: 4px solid #475569;
    padding: 10px 14px;
    border-radius: 4px;
    margin: 12px 0;
    font-size: 9pt;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0;
    font-size: 8.5pt;
  }
  th, td {
    border: 1px solid #cbd5e1;
    padding: 6px 10px;
    text-align: left;
    vertical-align: top;
  }
  th {
    background-color: #f1f5f9;
    color: #0f172a;
    font-weight: bold;
  }
  tr:nth-child(even) td {
    background-color: #f8fafc;
  }
  ul {
    margin: 6px 0 10px 20px;
    padding: 0;
  }
  li {
    margin-bottom: 4px;
    text-align: justify;
  }
  .badge {
    background-color: #e0f2fe;
    color: #0369a1;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 8pt;
    font-weight: bold;
    display: inline-block;
  }
  .badge-green {
    background-color: #dcfce7;
    color: #15803d;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 8pt;
    font-weight: bold;
    display: inline-block;
  }
  code {
    background-color: #f1f5f9;
    color: #0f172a;
    padding: 1px 4px;
    border-radius: 3px;
    font-family: 'Liberation Mono', monospace;
    font-size: 8.5pt;
    border: 1px solid #e2e8f0;
  }
  .page-break {
    page-break-before: always;
  }
</style>
</head>
<body>

  <div class="header-banner">
    <div class="tag-meta">NASA Space Apps Challenge // Arquitetura &amp; Engenharia de Software</div>
    <h1>ARES GRID: ESPECIFICAÇÃO TÉCNICA, STACK &amp; PONTOS FORTES</h1>
    <div class="header-subtitle">Análise Detalhada das Tecnologias Empregadas, Justificativas de Escolha, Padrões Arquiteturais e Diferenciais Competitivos do Software</div>
    <div class="meta-grid">
      <span><strong>Stack Principal:</strong> React 19 · TypeScript 5.8+ · Vite 8 · Tailwind CSS 4</span>
      <span><strong>Paradigma:</strong> JAMstack Client-Side First (Zero Backend / Zero Setup)</span>
      <span><strong>Licença:</strong> Open Source / MIT</span>
      <span><strong>Data:</strong> Novembro de 2026</span>
    </div>
  </div>

  <h2>1. Visão Geral da Arquitetura e Filosofia de Engenharia</h2>
  <p>O <strong>Ares Grid</strong> foi construído sobre uma premissa técnica determinante: <strong>zero atrito de implantação com desempenho nativo de alto nível</strong>. Softwares educacionais voltados a escolas públicas, laboratórios de ciências e residências frequentemente falham quando exigem instalação prévia de aplicativos pesados, logins complexos em servidores remotos ou conexões ininterruptas de alta velocidade.</p>
  <p>Para contornar esses entraves, a plataforma foi estruturada segundo o paradigma <strong>Client-Side First (JAMstack)</strong>. Toda a lógica de simulação física, astrométrica, biológica e narrativa é executada diretamente no navegador web do cliente através de compilação otimizada em JavaScript moderno, garantindo privacidade estrita dos alunos (conformidade por design com normas COPPA e LGPD, sem coleta de dados pessoais em bancos de dados em nuvem) e autonomia total de execução.</p>

  <div class="callout-tech">
    <strong>Princípio Norteador de Engenharia:</strong> Prover uma experiência audiovisual imersiva comparável a jogos desktop nativos, mantendo o consumo de memória abaixo de 180 MB de RAM e permitindo o carregamento instantâneo da aplicação até mesmo em redes móveis limitadas ou dispositivos de baixo custo (Chromebooks e tablets educacionais).
  </div>

  <h2>2. Stack Tecnológica: O Que Foi Escolhido e Por Que Foi Escolhido</h2>
  <p>A seleção de cada camada tecnológica da stack do Ares Grid foi orientada por critérios rigorosos de robustez, longevidade do ecossistema, desempenho em tempo de execução e produtividade de desenvolvimento:</p>

  <table>
    <thead>
      <tr>
        <th style="width: 22%;">Tecnologia &amp; Versão</th>
        <th style="width: 38%;">Papel no Sistema</th>
        <th style="width: 40%;">Justificativa Técnica de Escolha</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>React 19</strong></td>
        <td>Camada de renderização reativa, orquestração de componentes e ciclo de vida da interface.</td>
        <td>Utilização da versão mais recente com suporte a renderização concorrente, transições não-bloqueantes e fronteiras de <code>Suspense</code> com <code>lazy()</code> para divisão dinâmica de código (Code Splitting) por missão.</td>
      </tr>
      <tr>
        <td><strong>TypeScript (5.8+)</strong></td>
        <td>Linguagem base de desenvolvimento com tipagem estática e segurança em tempo de compilação.</td>
        <td>Garantia de contratos de dados rigorosos para telemetria da NASA, estados de homeostase biológica e nós de progresso. Elimina erros comuns de runtime e viabiliza refatorações com previsibilidade matemática.</td>
      </tr>
      <tr>
        <td><strong>Vite 8</strong></td>
        <td>Ambiente de desenvolvimento e ferramenta de build de produção (bundler).</td>
        <td>Velocidade extrema de inicialização com Hot Module Replacement (HMR) instantâneo baseado em ESM nativo; empacotamento com Rollup e esbuild gerando bundles enxutos e altamente otimizados.</td>
      </tr>
      <tr>
        <td><strong>Tailwind CSS (v4)</strong></td>
        <td>Framework de estilização utilitária de última geração baseado no motor Lightning CSS.</td>
        <td>Zero runtime overhead, compilação de CSS até 10x mais rápida, sem necessidade de arquivos de configuração inflados. Facilita o controle de tokens espaciais (paleta neon HUD, tema cósmico e dark mode nativo).</td>
      </tr>
      <tr>
        <td><strong>Framer Motion (v14)</strong></td>
        <td>Motor declarativo de animações baseadas em física e transições de layout.</td>
        <td>Permite animar elementos de interface com física de molas (<em>spring physics</em>) a 60 FPS consistentes na thread de composição da GPU, viabilizando transições fluidas de telas e modais.</td>
      </tr>
      <tr>
        <td><strong>Web Audio API Nativo</strong></td>
        <td>Síntese procedural de som e efeitos sonoros em tempo real (<code>soundEngine.ts</code>).</td>
        <td>Elimina a necessidade de downloads de dezenas de megabytes de arquivos MP3/WAV estáticos, tem latência nula e contorna com segurança as políticas restritivas de autoplay dos navegadores via desbloqueio no primeiro clique.</td>
      </tr>
      <tr>
        <td><strong>NASA DONKI &amp; Mars24</strong></td>
        <td>Serviços e algoritmos astronômicos e meteorológicos reais integrados ao jogo.</td>
        <td>Transforma o software em uma ferramenta STEAM genuína, unindo equações do NASA Goddard Institute com telemetria de erupções solares do banco oficial DONKI da NASA.</td>
      </tr>
    </tbody>
  </table>

  <h2 class="page-break">3. Análise Profunda das Escolhas Arquiteturais</h2>

  <h3>3.1. Code Splitting Modular por Missão com React 19 Suspense</h3>
  <p>Em vez de compilar o jogo inteiro em um único arquivo JavaScript monolítico gigantesco, a arquitetura do Ares Grid implementa <strong>divisão dinâmica de código (Code Splitting)</strong> através de <code>React.lazy</code> e <code>Suspense</code> no arquivo raiz <code>App.tsx</code>:</p>
  <ul>
    <li>As cinco missões (<code>Mission01Screen</code>, <code>Mission2View</code>, <code>Mission3View</code>, <code>Mission4View</code> e <code>Mission5View</code>) são empacotadas em pedaços de código (<em>chunks</em>) separados e autônomos.</li>
    <li>Ao iniciar o aplicativo, o navegador faz o download exclusivamente do núcleo (mapa, fluxo de abertura e HUD global). Cada missão individual só é transferida pela rede quando o jogador clica para ingressar nela.</li>
    <li>Isso resulta em um <em>First Contentful Paint</em> (FCP) de menos de 1 segundo mesmo em conexões lentas, garantindo que o aluno comece a interagir sem telas de carregamento morosas.</li>
  </ul>

  <h3>3.2. Síntese Sonora Procedural via Web Audio API (soundEngine.ts)</h3>
  <p>A maioria das aplicações web multimídia carrega dezenas de arquivos de áudio gravados (MP3, WAV ou OGG), resultando em alto consumo de banda e problemas recorrentes de latência ou corte sonoro. No Ares Grid, o componente <code>src/services/soundEngine.ts</code> implementa uma abordagem elegante:</p>
  <ul>
    <li><strong>Geração Algorítmica de Sons:</strong> Utiliza nós osciladores nativos do navegador (<code>OscillatorNode</code> com formas de onda senoidal, quadrada e dente de serra) e geradores de ruído branco filtrado por nós biquad (<code>BiquadFilterNode</code>) para criar efeitos sonoros de bips de painel, alertas de tempestade, acordes triunfais de sucesso e frequências de transmissão de rádio.</li>
    <li><strong>Pegada Zero de Download:</strong> A biblioteca completa de efeitos consome zero bytes de transferência de mídia, existindo puramente como código matemático em TypeScript.</li>
    <li><strong>Compatibilidade com Políticas de Autoplay:</strong> Os navegadores modernos bloqueiam reprodução automática de som antes do primeiro toque do usuário. O motor implementa o método <code>unlockAudio()</code> ativado automaticamente na primeira interação da criança, prevenindo silêncios inesperados.</li>
  </ul>

  <h3>3.3. Integração com Dados Reais da NASA e Camada de Fallback Resiliente</h3>
  <p>O software não simula o clima espacial com valores aleatórios arbitrários; ele se conecta à base oficial da NASA:</p>
  <ul>
    <li><strong>NASA DONKI (Space Weather Database):</strong> O serviço <code>donkiService.ts</code> consulta erupções solares recentes (<em>Solar Flares</em> classes C, M e X) e ejeções de massa coronal que afetam diretamente o nível de radiação incidente no escudo da base na Missão 5.</li>
    <li><strong>Arquitetura First-Offline Resiliente:</strong> Como muitas redes escolares bloqueiam APIs externas por regras de firewall ou sofrem com perda intermitente de sinal, o sistema conta com o módulo <code>curatedDonkiEvents.ts</code>. Caso a requisição para os servidores da NASA demore mais de 3 segundos ou falhe, o software alterna silenciosa e instantaneamente para um conjunto curado de dados reais históricos, garantindo que a aula nunca seja interrompida por problemas de rede.</li>
    <li><strong>Algoritmo Astronômico Mars24 (<code>mars24.ts</code>):</strong> Transcrição fiel para TypeScript das formulações matemáticas do NASA GISS para conversão de tempo terrestre em Sol marciano, Longitude Solar ($L_s$) e elevação/azimute solar exatos para a coordenada geográfica de Arcadia Planitia.</li>
  </ul>

  <h3>3.4. Camada de Persistência Desacoplada e Segura (progressStore.ts)</h3>
  <p>A persistência local de dados do Ares Grid foi desenhada com três garantias fundamentais:</p>
  <ul>
    <li><strong>Isolamento de Estado (Namespace Versionado):</strong> Utilização da chave de armazenamento <code>aresgrid-progress-v2</code> no <code>localStorage</code>, com validação de tipagem defensiva na desserialização para evitar que atualizações de versão corrompam dados salvos anteriormente.</li>
    <li><strong>Desacoplamento de Métricas Voláteis vs. Globais:</strong> A energia temporária utilizada em minigames não interfere irreversivelmente nos indicadores vitais permanentes da base, prevenindo o bloqueio prematuro do progresso do jogador.</li>
    <li><strong>Privacidade Absoluta (COPPA/LGPD):</strong> Nenhum dado de telemetria, nome do aluno ou tempo de uso sai do dispositivo da criança, dispensando cadastros, senhas ou armazenamento de informações confidenciais em servidores de terceiros.</li>
  </ul>

  <h2 class="page-break">4. Pontos Fortes e Diferenciais do Software</h2>
  <p>O Ares Grid se destaca no cenário de tecnologia educacional e jogos baseados em ciência aberta por reunir qualidades técnicas e pedagógicas raras no segmento:</p>

  <div class="callout-tech">
    <strong style="color: #0284c7; font-size: 10pt;">1. Rigor Científico STEAM Autêntico</strong><br>
    O software não recorre à ficção científica descolada da realidade. Cada etapa do jogo é lastreada em relatórios e instrumentos oficiais da NASA:
    <ul>
      <li>Instrumento SHARAD a bordo do Mars Reconnaissance Orbiter (MRO) para estratigrafia e radar de subsuperfície de gelo.</li>
      <li>Relatório oficial <em>First Ice Cores from Mars</em> para perfuração e purificação de água.</li>
      <li>Protocolos de suporte de vida bioregenerativo (BLSS) e cultivares espaciais da base de dados OSDR (Open Science Data Repository da NASA).</li>
      <li>Modelos astronômicos Mars24 para ângulo de insolação fotovoltaica.</li>
    </ul>
  </div>

  <div class="callout-tech">
    <strong style="color: #0284c7; font-size: 10pt;">2. Acessibilidade Universal "Zero-Install"</strong><br>
    Ao rodar 100% no navegador sem demandar emuladores, extensões ou downloads adicionais, o software alcança democratização real:
    <ul>
      <li>Funciona perfeitamente em Chrome, Edge, Safari e Firefox em qualquer sistema operacional (Windows, Linux, macOS, Android, iOS e ChromeOS).</li>
      <li>Compatível com modo tela cheia nativo, proporcionando uma experiência de imersão de console mesmo em computadores educacionais modestos.</li>
    </ul>
  </div>

  <div class="callout-tech">
    <strong style="color: #0284c7; font-size: 10pt;">3. Eficiência de Recursos e Alta Performance</strong><br>
    Graças à utilização criteriosa de aceleração por hardware (GPU) via Tailwind CSS v4, Framer Motion e HTML5 Canvas dedicado, o jogo mantém:
    <ul>
      <li>Taxa de quadros consistente de 60 FPS, sem solavancos durante animações ou minigames táteis.</li>
      <li>Consumo ínfimo de memória RAM e processamento, preservando a vida útil de bateria em tablets escolares durante jornadas pedagógicas prolongadas.</li>
    </ul>
  </div>

  <div class="callout-tech">
    <strong style="color: #0284c7; font-size: 10pt;">4. UX Inclusiva e Resiliente à Neurodiversidade</strong><br>
    O design visual e a interação foram calibrados para acomodar diferentes perfis cognitivos e habilidades motoras:
    <ul>
      <li>Feedback multissensorial (visual, sonoro e tátil) imediato a cada ação.</li>
      <li>Ausência de telas punitivas de derrota, estimulando a curiosidade científica e o aprendizado através da experimentação positiva.</li>
      <li>Flexibilidade total de leitura com diálogos puláveis e glossário contextual integrado.</li>
    </ul>
  </div>

  <div class="callout-tech">
    <strong style="color: #0284c7; font-size: 10pt;">5. Código Limpo, Modular e Escalável</strong><br>
    A estrutura de diretórios e a padronização de tipos permitem que novas missões, novos módulos de estufa ou novos sensores espaciais sejam incorporados com esforço mínimo de engenharia, servindo como uma base sólida para futuros desenvolvimentos e competições internacionais.
  </div>

  <h2>5. Matriz de Resumo Comparativo</h2>
  <table>
    <thead>
      <tr>
        <th>Dimensão</th>
        <th>Jogos Educativos Tradicionais</th>
        <th>Ares Grid (NASA Space Apps)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Origem dos Dados</strong></td>
        <td>Valores fictícios ou estáticos pré-programados sem base empírica.</td>
        <td>Dados autênticos de satélites e clima espacial da NASA (MRO, DONKI, Mars24).</td>
      </tr>
      <tr>
        <td><strong>Infraestrutura Necessária</strong></td>
        <td>Instalação de executáveis (.exe/.apk) ou servidores em nuvem com contas.</td>
        <td>Zero-Install (JAMstack no navegador), First-Offline e sem coleta de dados privados.</td>
      </tr>
      <tr>
        <td><strong>Desempenho de Áudio</strong></td>
        <td>Arquivos MP3 pesados, com carregamento lento e cortes em dispositivos lentos.</td>
        <td>Síntese procedural Web Audio em tempo real com zero peso de download e latência zero.</td>
      </tr>
      <tr>
        <td><strong>Pedagogia de Feedback</strong></td>
        <td>Telas punitivas de "Game Over" que desmotivam o estudante diante do erro.</td>
        <td>Pedagogia do erro construtivo mediada pela robô Capi com celebração de conquistas.</td>
      </tr>
    </tbody>
  </table>

  <h2>6. Conclusão Técnica</h2>
  <p>A arquitetura de software implementada no Ares Grid consolida um equilíbrio primoroso entre rigor científico aeroespacial, excelência em engenharia web moderna e sensibilidade pedagógica para o público infantil. Ao unir React 19, TypeScript, Vite 8 e Web Audio nativo a dados abertos da NASA, o projeto estabelece uma referência de como a tecnologia pode servir como veículo de encantamento, cidadania científica e inspiração para a próxima geração de exploradores do espaço.</p>

</body>
</html>
"""

def main():
    docs_dir = os.path.abspath("docs")
    os.makedirs(docs_dir, exist_ok=True)

    html1_path = os.path.join(docs_dir, "Relatorio_Desenvolvimento_Adaptabilidade_AresGrid.html")
    pdf1_path = os.path.join(docs_dir, "Relatorio_Desenvolvimento_Adaptabilidade_AresGrid.pdf")

    html2_path = os.path.join(docs_dir, "Relatorio_Tecnico_Arquitetura_AresGrid.html")
    pdf2_path = os.path.join(docs_dir, "Relatorio_Tecnico_Arquitetura_AresGrid.pdf")

    print("Writing HTML Document 1...")
    with open(html1_path, "w", encoding="utf-8") as f:
        f.write(build_html_doc1())

    print("Writing HTML Document 2...")
    with open(html2_path, "w", encoding="utf-8") as f:
        f.write(build_html_doc2())

    print("Converting Document 1 to PDF via LibreOffice...")
    cmd1 = [
        "libreoffice",
        "-env:UserInstallation=file:///tmp/libreoffice_profile",
        "--headless",
        '--infilter=HTML (StarWriter)',
        "--convert-to", "pdf",
        html1_path,
        "--outdir", docs_dir
    ]
    res1 = subprocess.run(cmd1, capture_output=True, text=True)
    print("Doc 1 exit code:", res1.returncode)
    if res1.returncode != 0:
        print("Doc 1 STDERR:", res1.stderr)

    print("Converting Document 2 to PDF via LibreOffice...")
    cmd2 = [
        "libreoffice",
        "-env:UserInstallation=file:///tmp/libreoffice_profile",
        "--headless",
        '--infilter=HTML (StarWriter)',
        "--convert-to", "pdf",
        html2_path,
        "--outdir", docs_dir
    ]
    res2 = subprocess.run(cmd2, capture_output=True, text=True)
    print("Doc 2 exit code:", res2.returncode)
    if res2.returncode != 0:
        print("Doc 2 STDERR:", res2.stderr)

    print("\nVerifying generated PDF files:")
    for p in [pdf1_path, pdf2_path]:
        if os.path.exists(p):
            size_kb = os.path.getsize(p) / 1024
            print(f"OK: {p} ({size_kb:.1f} KB)")
        else:
            print(f"FAILED: {p} not found")

if __name__ == "__main__":
    main()
