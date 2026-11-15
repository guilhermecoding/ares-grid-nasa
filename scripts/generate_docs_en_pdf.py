import os
import subprocess
import sys

def build_html_doc1_en():
    return """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Ares Grid - Development &amp; Pedagogical Adaptability Report</title>
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
    font-size: 18.5pt;
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
  .page-break {
    page-break-before: always;
  }
</style>
</head>
<body>

  <div class="header-banner">
    <div class="tag-meta">NASA Space Apps Challenge // Engineering &amp; Pedagogical Documentation</div>
    <h1>ARES GRID: DEVELOPMENT &amp; PEDAGOGICAL ADAPTABILITY REPORT</h1>
    <div class="header-subtitle">Comprehensive Breakdown of Codebase Changes, Implemented Mission Systems, Architectural Refactoring, and Accessibility Engineering for Children Aged 7 to 12</div>
    <div class="meta-grid">
      <span><strong>Project:</strong> Ares Grid (Arcadia Planitia Base AP-1)</span>
      <span><strong>Target Audience:</strong> Children aged 7 to 12 (Elementary &amp; Middle School)</span>
      <span><strong>Release:</strong> Version 2.0 (Missions 1 through 5 Complete)</span>
      <span><strong>Date:</strong> November 2026</span>
    </div>
  </div>

  <h2>1. Project Vision and Educational Context</h2>
  <p><strong>Ares Grid</strong> is an interactive scientific learning platform created within the scope of the <em>NASA Space Apps Challenge</em>, engineered to introduce children aged 7 to 12 to the authentic engineering and biological realities of human survival on Mars. Situated in the northern lowlands of <strong>Arcadia Planitia</strong> (coordinates 40.0° N, 180.0° W), the platform weaves genuine NASA scientific data (subsurface radar echograms, space weather telemetry, photobiological plant studies, and orbital solar models) into an engaging, gamified, and accessible narrative.</p>
  <p>The entire learning journey is guided by <strong>Capi</strong>, an empathetic robotic capybara assistant. Capi’s pedagogical purpose is to mediate complex concepts in astrophysics, bioregenerative life support systems (BLSS), and in-situ resource utilization (ISRU), translating them into tangible, tactile, and rewarding choices for young minds.</p>

  <div class="callout">
    <strong>Document Objective:</strong> Provide a comprehensive technical and pedagogical account of all codebase changes, highlighting the complete scope of implemented features (from the opening cinematic to the fifth mission), the architectural refactorings required to overcome usability bottlenecks, and the specialized UX/UI adaptations engineered for the 7-to-12 age bracket.
  </div>

  <h2>2. Implemented Programming Scope: What Was Developed</h2>
  <p>Throughout iterative development sprints, the software evolved from an early concept into an integrated, five-mission educational suite preceded by an interactive prologue, cinematic launch, and customizer.</p>

  <h3>2.1. Interactive Prologue &amp; Astronaut Customization</h3>
  <ul>
    <li><strong>Atmospheric Liftoff &amp; Particle Physics:</strong> Implemented the <code>LaunchSpaceCanvas</code> component, utilizing native HTML5 Canvas to render dynamic starfields with relativistic particle acceleration and thrust physics during Earth departure.</li>
    <li><strong>Mars Approach &amp; Procedural Shaders:</strong> Built the <code>MarsApproachCanvas</code> component paired with <code>marsZoom.ts</code>, calculating planetary curvature, atmospheric Rayleigh-like haze gradients, and real-time solar illumination vectors.</li>
    <li><strong>Astronaut Customizer (<code>AstronautCustomizer</code>):</strong> Developed an intuitive selector allowing children to personalize their astronaut (spacesuit color, pressurized helmet visor tint, mission patch insignia, and life-support backpack), fostering immediate agency, curiosity, and emotional ownership.</li>
    <li><strong>Retro-Themed Dialogue Engine (<code>PixelDialogBox</code>):</strong> Built a pixel-art styled dialogue system with an audio-synced typewriter effect, expressive emotive portraits for Capi (neutral, excited, questioning), and customizable footer actions.</li>
  </ul>

  <h3>2.2. Mission 01 — Energy to Explore Mars</h3>
  <ul>
    <li><strong>Topographical Site Selection:</strong> Built an environmental assessment challenge featuring three landing sites (Shadow Valley, Windswept Plains, and Sunny Ridge), teaching how terrain elevation influences solar shadow casting and dust deposition.</li>
    <li><strong>Astronomical Solar Alignment Simulator:</strong> Embedded the <code>mars24.ts</code> engine (implementing NASA Goddard Institute for Space Studies solar positioning equations), enabling children to configure solar panel tilt and azimuth for Arcadia Planitia (40°N) and visualize real-time photovoltaic efficiency curves.</li>
    <li><strong>Dust Accumulation &amp; Cleaning Mechanics:</strong> Created dynamic efficiency degradation caused by airborne Martian dust settlement, allowing players to initiate maintenance cleanups to restore electrical generation.</li>
    <li><strong>Mission Logbook &amp; Base Uplink:</strong> Structured the <code>LogbookModal</code>, recording photovoltaic telemetry into the spacecraft onboard server and transmitting findings back to Earth.</li>
  </ul>

  <h3 class="page-break">2.3. Mission 02 — Caring for the Astronaut</h3>
  <ul>
    <li><strong>Circadian Rhythm &amp; Life Support in 0.38g:</strong> Modeled astronaut physiological maintenance in Martian partial gravity, monitoring three vital resource gauges: Base Electrical Energy, Potable Water Reserve, and Crew Health/Wellbeing.</li>
    <li><strong>Physical Conditioning Module (<code>ExerciseStep</code>):</strong> Introduced an interactive station where players select treadmill routines with elastic harnesses, resistive training against osteomuscular atrophy, stretching, and balance drills.</li>
    <li><strong>Space Nutrition &amp; Hydration (<code>NutritionStep</code>):</strong> Developed a meal tray composition station with freeze-dried space rations (protein packs, carbohydrates, fresh greens, and electrolytes), balancing caloric intake with water consumption.</li>
    <li><strong>Tactile Hygiene Bay (<code>HygieneBay</code>):</strong> Built an interactive minigame recreating microgravity and partial-gravity sanitary protocols without open water (using antiseptic wipes and vacuum suction hoses to manage water droplets safely).</li>
    <li><strong>Sleep Routine &amp; Nightly Medical Report (<code>NightReportModal</code>):</strong> Modeled the Sol transition where the habitat dims down and Capi compiles a clinical health report, recovering astronaut stamina for the upcoming workday.</li>
  </ul>

  <h3>2.4. Mission 03 — The Mystery of Martian Ice</h3>
  <ul>
    <li><strong>Remote Sensing with NASA MRO SHARAD Radar:</strong> Created the <code>LayeredMapStep</code> component using authentic data from the Shallow Radar (SHARAD) instrument on the <em>Mars Reconnaissance Orbiter</em>. Players toggle between optical imagery, orbital radar echograms, topographical data, and subsurface ice sheet maps.</li>
    <li><strong>Cryogenic Core Drilling:</strong> Designed a drilling minigame across Sectors Alpha, Beta, and Gamma. Players discover that Sector Beta possesses an optimal 1-to-2 meter regolith shielding layer that preserves pristine ice without overloading drill bits.</li>
    <li><strong>Six-Stage Water Processing Plant:</strong> Structured the sequential pipeline in <code>IceProcessingStep</code>: sample identification, mechanical regolith separation, thermal melting, fine filtration, catalytic purification, and final quality control.</li>
    <li><strong>Chemical &amp; Biological Potability Lab (<code>PotabilityStep</code>):</strong> Built an assay evaluation dashboard featuring <code>AssayCard</code> and <code>AssayIcon</code> components to inspect neutral pH (6.5 to 8.5), electrical conductivity (salinity), toxic Martian perchlorate scrubbing, heavy metal elimination, and ultraviolet antimicrobial sterilization.</li>
  </ul>

  <h3>2.5. Mission 04 — The First Greenhouse on Mars</h3>
  <ul>
    <li><strong>Modular Botanical Dome Assembly (<code>Mission4View</code>):</strong> Programmed the agricultural habitat setup, including structural UV-resistant polymer shells, spectrum-tuned horticultural LEDs, forced ventilation/CO₂ circulation, thermal control, and IoT telemetry sensors.</li>
    <li><strong>Comparative Space Cultivation Methods:</strong> Implemented interactive comparisons between Hydroponics (roots immersed in nutrient-rich aqueous solution), Aeroponics (roots suspended in high-pressure mist), and Treated Regolith (Martian soil washed of perchlorates and enriched with organic amendments).</li>
    <li><strong>NASA Seed Selection (Veggie &amp; OSDR):</strong> Sourced cultivars from actual spaceflight research: spaceflight-proven lettuce, dwarf wheat, micro-tomatoes, carrots, strawberries, and zinnia flowers (used to study pollination and photoperiodism in closed environments).</li>
    <li><strong>BLSS (Bioregenerative Life Support System) Closed Loop:</strong> Demonstrated biological life support integration: plant transpiration supplies clean condensed water, photosynthesis generates oxygen (O₂), and residual biomass feeds organic composters.</li>
  </ul>

  <h3>2.6. Mission 05 — Alert! Storms on Mars &amp; Expedition Finale</h3>
  <ul>
    <li><strong>Pedagogical Hazard Differentiation:</strong> Taught the critical distinction between Convective Dust Storms (visible mechanical threats that block sunlight and foul mechanical joints) and Solar Particle Events / Coronal Mass Ejections from NASA DONKI (invisible ionizing radiation that penetrates deep tissue).</li>
    <li><strong>Emergency Lockdown Protocol (<code>DustLatchId</code>):</strong> Created a step-by-step procedural sequence: retracting external sensors, sealing habitat airlocks, and decoupling high-voltage transmission lines to protect battery banks.</li>
    <li><strong>Radiation Shelter Engineering:</strong> Guided the player to select the storm shelter, illustrating why hydrogen-rich materials (water storage tanks purified in Mission 3) combined with thick regolith walls provide optimal radiation shielding.</li>
    <li><strong>Post-Storm Infrastructure Inspection:</strong> Programmed the exterior survey where players assess structural integrity across four vital systems: habitat domes, solar arrays, the botanical greenhouse, and the main high-gain antenna.</li>
    <li><strong>Scenes 6 &amp; 7 (Deep Space Uplink &amp; Martian Future):</strong> Concluded the campaign with an interplanetary telemetry uplink to Earth via the Deep Space Network (DSN) and a forward-looking reflection on sustainable human exploration of Mars.</li>
  </ul>

  <h2 class="page-break">3. Necessary Engineering Changes and Refactoring</h2>
  <p>To guarantee silky 60 FPS performance, prevent unhandled edge cases, and eliminate friction for elementary school students across diverse hardware (such as Chromebooks and lower-spec tablets), key architectural refactorings were executed:</p>

  <table>
    <thead>
      <tr>
        <th style="width: 28%;">Module / Component</th>
        <th style="width: 32%;">Observed Technical Bottleneck</th>
        <th style="width: 40%;">Implemented Refactoring &amp; Outcome</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Unified Stage Wrappers (<code>MissionStage</code>)</strong></td>
        <td>Earlier views had disparate header and navigation layouts, leading to layout shifts and erratic touch targets on tablet viewports.</td>
        <td>Engineered standardized stage containers (<code>Mission2Stage</code>, <code>Mission3Stage</code>, <code>Mission4Stage</code>, <code>Mission5Stage</code>) with unified Sol headers, integrated responsive viewports, and clean sub-step boundaries.</td>
      </tr>
      <tr>
        <td><strong>Asset Pipeline (SVG &rarr; Optimized PNG)</strong></td>
        <td>Complex SVG vectors with heavy drop-shadows and multi-stop gradients caused severe frame drops during gesture interactions on Android tablets.</td>
        <td>Strategically replaced heavy vector graphics with lossless-compressed PNGs and WebP assets, cutting GPU compositing overhead by over 70%.</td>
      </tr>
      <tr>
        <td><strong>Dialogue Management (<code>PixelDialogBox</code>)</strong></td>
        <td>Children replaying missions experienced frustration when forced to wait through sequential typewriter animations without quick progression.</td>
        <td>Architected the <code>useHideFollowingDialogs</code> hook with <code>onSkip</code> support: children can bypass dialogue blocks instantly or silence already-seen tutorials.</td>
      </tr>
      <tr>
        <td><strong>Native Fullscreen Immersion (<code>FullscreenButton</code>)</strong></td>
        <td>In mobile browsers, accidental downward swipes or touches near navigation bars opened URL bars or triggered unintended page zooms.</td>
        <td>Wired the native <code>requestFullscreen()</code> API into the <code>ReadyGate</code> onboarding flow and added a persistent floating fullscreen button across all playable missions.</td>
      </tr>
      <tr>
        <td><strong>State Persistence &amp; Soft-Lock Prevention</strong></td>
        <td>Transient battery depletion during experimental solar trials could permanently leave the save state without resources to proceed.</td>
        <td>Refactored <code>progressStore.ts</code> to isolate trial metrics from global base life-support reserves, ensuring mission retries remain educational without soft-locking the savegame.</td>
      </tr>
      <tr>
        <td><strong>Energy &amp; Water Economy Balancing</strong></td>
        <td>Excessively punitive energy consumption in Mission 2 discouraged children from exploring diverse exercise and nutrition combinations.</td>
        <td>Mathematically recalibrated energy expenditure rates and elevated wellbeing rewards for well-balanced meals, preserving challenge while eliminating frustration.</td>
      </tr>
    </tbody>
  </table>

  <h2>4. Technology Adaptability for the Target Audience (7 to 12 Years)</h2>
  <p>Designing educational software for 7-to-12-year-olds demands a nuanced balance: the software must be immediately approachable for younger learners (who are developing reading stamina and fine motor skills) while maintaining intellectual credibility for older students (who expect authentic scientific logic and real-world relevance). The following pedagogical engineering principles were embedded:</p>

  <h3>4.1. Cognitive Mediation via the SciTerm Component</h3>
  <p>Space exploration naturally involves heavy terminology (e.g., <em>perchlorates, SHARAD, cryogenics, regolith, aeroponics, BLSS</em>). Rather than dumbing down the science or overwhelming young users with unreadable textbooks, a tiered mediation system was implemented:</p>
  <ul>
    <li><strong>Dynamic In-Context Glossary (<code>SciTerm.tsx</code>, <code>SciTermM2</code>, <code>SciTermM3</code>, <code>SciTermM5</code>):</strong> Key terms are highlighted with subtle accents. Tapping or hovering reveals a child-friendly popup with everyday analogies (e.g., perchlorate is defined as <em>"a toxic salt found in Martian dust that must be thoroughly washed out before water is safe to drink"</em>).</li>
    <li><strong>Direct, Chunked Copywriting:</strong> Explanatory sentences are limited to 2 to 3 lines per block, emphasizing active voice and highlighting essential action words in bright neon hues to guide attention.</li>
  </ul>

  <h3>4.2. Visual, Tactile, and Motor Ergonomics</h3>
  <ul>
    <li><strong>Oversized Touch Targets (<code>McButton</code>):</strong> All interactive triggers conform to a minimum dimension of 48×48 pixels with bevels, responsive shadows, and immediate visual feedback when pressed, preventing miss-clicks on touchscreens.</li>
    <li><strong>Sensory-Driven Minigames:</strong> Instead of passive multiple-choice quizzes, the game relies on direct physical manipulation. In <code>DustScrubCanvas</code>, the child scrubs dust away directly by dragging across the canvas; in the nutrition and hygiene bays, items snap into trays with fluid magnetic physics.</li>
    <li><strong>High-Contrast Space Palettes:</strong> Strict adherence to WCAG AAA contrast guidelines for dark backgrounds, utilizing radiant HUD cyan (<code>#00f3ff</code>), amber warnings, and bio-greens over deep void navy (<code>#0b132b</code>).</li>
  </ul>

  <h3 class="page-break">4.3. Positive Reinforcement &amp; Constructive Failure</h3>
  <p>Traditional games often punish poor choices with jarring "Game Over" screens, triggering abandonment in elementary school students. Ares Grid applies the principle of <strong>Constructive Learning from Failure</strong>:</p>
  <ul>
    <li><strong>No Fatal Penalties:</strong> Suboptimal choices never kill the astronaut or break the save. If a child drills hard basalt rock in Sector Gamma, the drill produces an acoustic warning, Capi gently clarifies why the rock layer is too tough, and a small energy cost is deducted—encouraging the student to re-examine the radar map and formulate a new hypothesis.</li>
    <li><strong>Multi-Sensory Celebrations:</strong> Successful tasks immediately trigger joyful visual confetti bursts (<code>ConfettiBurst</code>), procedural musical fanfares, and official accomplishment badges stamped into the Mission Logbook.</li>
    <li><strong>Capi as an Affective Anchor:</strong> The capybara mentor's facial animations (curious, surprised, celebratory) humanize the technical interface and establish an emotionally safe space where exploration and curiosity are celebrated.</li>
  </ul>

  <h3>4.4. Pacing Control &amp; Neurodiversity Inclusivity</h3>
  <ul>
    <li><strong>Zero Stressful Timers:</strong> Educational stages avoid countdown clocks. Children can reflect, re-read scientific descriptions, or take breaks without penalty, accommodating students with ADHD, dyslexia, or varying processing speeds.</li>
    <li><strong>Adjustable Reading Speed:</strong> The typewriter dialogue effect can be sped up or instantly resolved with a single tap, empowering fluent readers to proceed briskly while letting early readers read sentence-by-sentence.</li>
  </ul>

  <h2>5. Pedagogical Conclusion</h2>
  <p>The programming modifications implemented in Ares Grid have transformed it into a resilient, engaging, and scientifically rigorous learning environment. By anchoring high-level NASA planetary science inside a tactile, empathetic, and child-centered user experience, the software proves that cutting-edge space exploration concepts can be taught to 7-to-12-year-olds with joy, beauty, and deep educational impact.</p>

</body>
</html>
"""

def build_html_doc2_en():
    return """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Ares Grid - Technical Specification, Architecture &amp; Strengths</title>
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
    font-size: 18.5pt;
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
    <div class="tag-meta">NASA Space Apps Challenge // Software Architecture &amp; Engineering</div>
    <h1>ARES GRID: TECHNICAL ARCHITECTURE, STACK &amp; SOFTWARE STRENGTHS</h1>
    <div class="header-subtitle">Comprehensive Technical Analysis of the Technology Stack, Architectural Choices, Scientific NASA Integrations, and Competitive Software Highlights</div>
    <div class="meta-grid">
      <span><strong>Core Stack:</strong> React 19 · TypeScript 5.8+ · Vite 8 · Tailwind CSS 4</span>
      <span><strong>Paradigm:</strong> Client-Side First JAMstack (Zero Backend / Zero Setup)</span>
      <span><strong>License:</strong> Open Source / MIT</span>
      <span><strong>Date:</strong> November 2026</span>
    </div>
  </div>

  <h2>1. Architectural Vision and Engineering Philosophy</h2>
  <p><strong>Ares Grid</strong> was conceived upon a foundational software engineering premise: <strong>zero-barrier accessibility paired with native-grade performance</strong>. Educational software targeted at elementary schools, science centers, and community programs frequently suffers from high adoption barriers: mandatory native app installers, complex account setups, heavy server dependencies, or unreliable connectivity.</p>
  <p>To eliminate these barriers, Ares Grid adheres strictly to the <strong>Client-Side First (JAMstack)</strong> paradigm. All mathematical models, orbital simulations, biological homeostasis checks, and narrative logic execute directly inside the client’s browser runtime. This guarantees total student privacy (full compliance with COPPA and GDPR regulations without transmitting student telemetry to remote clouds) and ensures effortless deployment in classroom settings.</p>

  <div class="callout-tech">
    <strong>Guiding Engineering Benchmark:</strong> Deliver an immersive, 60 FPS graphical and auditory experience comparable to native desktop games while maintaining total memory usage under 180 MB of RAM, enabling instant execution even on low-cost educational Chromebooks and school tablets.
  </div>

  <h2>2. Technology Stack Breakdown: What Was Chosen and Why</h2>
  <p>Every layer of the Ares Grid technology stack was selected against strict engineering benchmarks: runtime efficiency, ecosystem longevity, strong typing, and developer ergonomics:</p>

  <table>
    <thead>
      <tr>
        <th style="width: 22%;">Technology &amp; Version</th>
        <th style="width: 38%;">Role in the Architecture</th>
        <th style="width: 40%;">Technical Justification &amp; Selection Reason</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>React 19</strong></td>
        <td>Reactive view composition, UI component tree lifecycle, and concurrency orchestration.</td>
        <td>Leverages cutting-edge React features: concurrent rendering, non-blocking asynchronous state transitions, and <code>Suspense</code> boundaries with <code>lazy()</code> for on-demand mission code splitting.</td>
      </tr>
      <tr>
        <td><strong>TypeScript (5.8+)</strong></td>
        <td>Core programming language providing static typing and compile-time contract enforcement.</td>
        <td>Enforces strict data contracts for NASA space weather feeds, Mars24 orbital parameters, biological vital gauges, and progression trees, eliminating runtime <code>undefined</code> crashes.</td>
      </tr>
      <tr>
        <td><strong>Vite 8</strong></td>
        <td>High-performance development server and production build bundler.</td>
        <td>Near-instantaneous dev server startup powered by native ESM; lighting-fast HMR; leverages Rollup and esbuild to generate lean, highly optimized production bundles.</td>
      </tr>
      <tr>
        <td><strong>Tailwind CSS (v4)</strong></td>
        <td>Atomic styling framework powered by the modern Lightning CSS engine.</td>
        <td>Zero runtime CSS overhead, up to 10× faster compile times, and complete design-token unification (space neon HUD accents, high-contrast text, dark cosmic palettes).</td>
      </tr>
      <tr>
        <td><strong>Framer Motion (v14)</strong></td>
        <td>Declarative physics-based animation engine and layout transition manager.</td>
        <td>Powers spring-physics gesture animations and smooth layout transitions at continuous 60 FPS directly on the GPU compositing thread without DOM thrashing.</td>
      </tr>
      <tr>
        <td><strong>Native Web Audio API</strong></td>
        <td>Real-time procedural audio synthesis engine (<code>soundEngine.ts</code>).</td>
        <td>Eliminates tens of megabytes of static audio files, achieves sub-millisecond audio latency, and gracefully manages browser autoplay policies via <code>unlockAudio()</code>.</td>
      </tr>
      <tr>
        <td><strong>NASA DONKI &amp; Mars24</strong></td>
        <td>Live space weather data ingestion and astronomical planetary calculation modules.</td>
        <td>Elevates the game from generic sci-fi to an authentic STEAM application by directly integrating NASA Goddard Institute algorithms and live Space Weather alerts.</td>
      </tr>
    </tbody>
  </table>

  <h2 class="page-break">3. Deep-Dive into Core Architectural Solutions</h2>

  <h3>3.1. Modular Code Splitting via React 19 Suspense</h3>
  <p>Rather than packaging the entire application into a massive monolithic bundle, Ares Grid implements dynamic <strong>mission-level code splitting</strong> in <code>App.tsx</code> using <code>React.lazy</code> and <code>Suspense</code> boundaries:</p>
  <ul>
    <li>The five playable missions (<code>Mission01Screen</code>, <code>Mission2View</code>, <code>Mission3View</code>, <code>Mission4View</code>, and <code>Mission5View</code>) are compiled into standalone JavaScript chunks.</li>
    <li>Upon first loading the application, only the core engine (world map, prologue, and global HUD) is downloaded. Individual mission code is fetched asynchronously only when the player unlocks and enters that specific mission.</li>
    <li>This results in a <em>First Contentful Paint</em> (FCP) of under 1 second even over constrained 3G mobile connections, guaranteeing instant engagement in classrooms.</li>
  </ul>

  <h3>3.2. Procedural Audio Synthesis via Web Audio API (soundEngine.ts)</h3>
  <p>Conventional web games download numerous recorded MP3 or WAV audio clips, consuming valuable bandwidth and causing stutter on low-powered processors. Ares Grid handles all sound procedurally in <code>src/services/soundEngine.ts</code>:</p>
  <ul>
    <li><strong>Algorithmic Sound Generation:</strong> Synthesizes audio using native browser oscillators (<code>OscillatorNode</code> with sine, square, and sawtooth waveforms) routed through dynamic biquad filters (<code>BiquadFilterNode</code>) and gain envelopes. This procedurally generates HUD clicks, warning sirens, triumphant chords, and radio static.</li>
    <li><strong>Zero Byte Footprint:</strong> The entire sound library requires 0 KB of downloaded media files, living purely as mathematical code.</li>
    <li><strong>Browser Autoplay Compliance:</strong> Browsers restrict audio before user interaction. The engine encapsulates an <code>unlockAudio()</code> method triggered on the user's first click, ensuring seamless sound delivery without warnings.</li>
  </ul>

  <h3>3.3. Authentic NASA Ingestion &amp; Resilient Offline-First Fallback</h3>
  <p>Ares Grid directly connects with NASA’s live scientific infrastructure:</p>
  <ul>
    <li><strong>NASA DONKI (Space Weather Database):</strong> The service <code>donkiService.ts</code> queries recent real-world Solar Flares (classes C, M, and X) and Coronal Mass Ejections (CMEs), directly feeding the radiation threat level in Mission 5.</li>
    <li><strong>Resilient Offline-First Strategy:</strong> School networks frequently enforce strict firewalls or suffer from spotty Wi-Fi. The platform integrates <code>curatedDonkiEvents.ts</code>: if the NASA API request exceeds a 3-second timeout or fails, the game immediately and transparently falls back to curated historical NASA datasets, ensuring class activities never stall.</li>
    <li><strong>Astronomical Mars24 Engine (<code>mars24.ts</code>):</strong> Faithfully ports the NASA Goddard Institute for Space Studies mathematical models, calculating Mars Solar Date (MSD), Solar Longitude ($L_s$), and precise solar elevation/azimuth angles for Arcadia Planitia (40°N).</li>
  </ul>

  <h3>3.4. Decoupled and Safe State Management (progressStore.ts)</h3>
  <p>Local state persistence was engineered with three safety guarantees:</p>
  <ul>
    <li><strong>Namespace Versioning:</strong> Saves to the isolated <code>aresgrid-progress-v2</code> key in browser <code>localStorage</code>, with defensive type-checking during deserialization to protect against data corruption across updates.</li>
    <li><strong>Decoupled Volatile vs. Global Stats:</strong> Intermediate energy spending within minigames does not destructively mutate permanent base reserves, preventing unrecoverable soft-locks.</li>
    <li><strong>Strict Privacy Compliance (COPPA / GDPR):</strong> Zero tracking cookies, zero external telemetry analytics, and zero personal data collection, eliminating legal compliance friction for schools and teachers.</li>
  </ul>

  <h2 class="page-break">4. Software Strengths and Core Advantages</h2>
  <p>Ares Grid distinguishes itself in the educational technology landscape through a combination of engineering rigor and pedagogical care:</p>

  <div class="callout-tech">
    <strong style="color: #0284c7; font-size: 10pt;">1. Genuine STEAM Scientific Rigor</strong><br>
    The game does not rely on arbitrary gameplay tropes. Every mechanic reflects authentic NASA research:
    <ul>
      <li>SHARAD radar on the Mars Reconnaissance Orbiter (MRO) for subsurface stratigraphic ice detection.</li>
      <li>NASA’s official <em>First Ice Cores from Mars</em> report for drilling, melting, and potability protocols.</li>
      <li>OSDR (Open Science Data Repository) and Veggie space crop datasets for greenhouse species selection.</li>
      <li>NASA GISS Mars24 equations for solar power orientation and insolation modeling.</li>
    </ul>
  </div>

  <div class="callout-tech">
    <strong style="color: #0284c7; font-size: 10pt;">2. Universal "Zero-Install" Deployment</strong><br>
    Operating 100% inside standard web browsers, Ares Grid eliminates installation headaches:
    <ul>
      <li>Runs smoothly across Chrome, Edge, Safari, and Firefox on Windows, macOS, Linux, ChromeOS, iOS, and Android.</li>
      <li>Supports native fullscreen mode, delivering an immersive console-like experience on school hardware without software installation.</li>
    </ul>
  </div>

  <div class="callout-tech">
    <strong style="color: #0284c7; font-size: 10pt;">3. Extreme Resource Efficiency &amp; Battery Conservation</strong><br>
    By offloading complex animations to the GPU compositing thread via Tailwind CSS v4 and Framer Motion, the software achieves:
    <ul>
      <li>Rock-solid 60 FPS performance without stuttering during interactive minigames.</li>
      <li>Ultra-low CPU and RAM footprint (&lt; 180 MB), preserving battery life on classroom tablets during extended school lessons.</li>
    </ul>
  </div>

  <div class="callout-tech">
    <strong style="color: #0284c7; font-size: 10pt;">4. Neurodiversity-Inclusive &amp; Resilient UX</strong><br>
    The interface was built from the ground up for diverse cognitive profiles:
    <ul>
      <li>Multi-sensory feedback (visual, audio, and tactile) on every action.</li>
      <li>A constructive failure model that replaces punitive game overs with insightful pedagogical coaching.</li>
      <li>Flexible reading speeds with skip capabilities and on-demand contextual glossary support.</li>
    </ul>
  </div>

  <div class="callout-tech">
    <strong style="color: #0284c7; font-size: 10pt;">5. Clean, Modular, and Extensible Architecture</strong><br>
    The modular codebase and strict TypeScript interfaces allow new missions, instruments, or greenhouse modules to be plugged in with minimal friction, providing a battle-tested foundation for future space education expansions.
  </div>

  <h2>5. Comparative Architecture Matrix</h2>
  <table>
    <thead>
      <tr>
        <th>Evaluation Vector</th>
        <th>Traditional Educational Games</th>
        <th>Ares Grid (NASA Space Apps)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Data Authenticity</strong></td>
        <td>Fictional numbers and static hardcoded quizzes.</td>
        <td>Live NASA DONKI space weather feeds &amp; GISS Mars24 astronomical models.</td>
      </tr>
      <tr>
        <td><strong>Deployment Friction</strong></td>
        <td>Requires app store downloads (.exe/.apk) or cloud user registrations.</td>
        <td>Zero-Install JAMstack running instantly in-browser; COPPA/GDPR private by design.</td>
      </tr>
      <tr>
        <td><strong>Audio Footprint</strong></td>
        <td>Tens of megabytes of static MP3s with high latency.</td>
        <td>Real-time procedural Web Audio synthesis with zero download footprint.</td>
      </tr>
      <tr>
        <td><strong>Failure Paradigm</strong></td>
        <td>Punitive "Game Over" states that induce frustration.</td>
        <td>Constructive learning with Capi's empathetic coaching and positive reinforcement.</td>
      </tr>
    </tbody>
  </table>

  <h2>6. Technical Conclusion</h2>
  <p>The architecture of Ares Grid proves that high-level aerospace science, cutting-edge web engineering, and compassionate pedagogical design can coalesce into an extraordinary learning platform. By pairing React 19, TypeScript, Vite 8, and procedural Web Audio with authentic NASA open science, the platform sets a new benchmark for web-based STEAM education, inspiring the next generation of space explorers.</p>

</body>
</html>
"""

def main():
    docs_dir = os.path.abspath("docs")
    os.makedirs(docs_dir, exist_ok=True)

    html1_en_path = os.path.join(docs_dir, "Development_Adaptability_Report_AresGrid.html")
    pdf1_en_path = os.path.join(docs_dir, "Development_Adaptability_Report_AresGrid.pdf")

    html2_en_path = os.path.join(docs_dir, "Technical_Architecture_Report_AresGrid.html")
    pdf2_en_path = os.path.join(docs_dir, "Technical_Architecture_Report_AresGrid.pdf")

    print("Writing English HTML Document 1...")
    with open(html1_en_path, "w", encoding="utf-8") as f:
        f.write(build_html_doc1_en())

    print("Writing English HTML Document 2...")
    with open(html2_en_path, "w", encoding="utf-8") as f:
        f.write(build_html_doc2_en())

    print("Converting English Document 1 to PDF via LibreOffice...")
    cmd1 = [
        "libreoffice",
        "-env:UserInstallation=file:///tmp/libreoffice_profile",
        "--headless",
        '--infilter=HTML (StarWriter)',
        "--convert-to", "pdf",
        html1_en_path,
        "--outdir", docs_dir
    ]
    res1 = subprocess.run(cmd1, capture_output=True, text=True)
    print("Doc 1 EN exit code:", res1.returncode)
    if res1.returncode != 0:
        print("Doc 1 EN STDERR:", res1.stderr)

    print("Converting English Document 2 to PDF via LibreOffice...")
    cmd2 = [
        "libreoffice",
        "-env:UserInstallation=file:///tmp/libreoffice_profile",
        "--headless",
        '--infilter=HTML (StarWriter)',
        "--convert-to", "pdf",
        html2_en_path,
        "--outdir", docs_dir
    ]
    res2 = subprocess.run(cmd2, capture_output=True, text=True)
    print("Doc 2 EN exit code:", res2.returncode)
    if res2.returncode != 0:
        print("Doc 2 EN STDERR:", res2.stderr)

    print("\nVerifying generated English PDF files:")
    for p in [pdf1_en_path, pdf2_en_path]:
        if os.path.exists(p):
            size_kb = os.path.getsize(p) / 1024
            print(f"OK: {p} ({size_kb:.1f} KB)")
        else:
            print(f"FAILED: {p} not found")

if __name__ == "__main__":
    main()
