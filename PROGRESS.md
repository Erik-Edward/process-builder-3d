# Process Builder 3D – Projektstatus och Framsteg

## Utvecklingsmiljö

**Server:** `python3 -m http.server 8000`
**URL:** http://localhost:8000/
**OBS:** Port 8080 är upptagen av OpenWebUI – använd alltid port **8000**.

---

## Teknisk Stack

- **Rendering:** Three.js (laddas från CDN, ingen npm-installation)
- **Språk:** Vanilla JavaScript (ES6+), HTML5, CSS3
- **Lagring:** LocalStorage för sparade processer (planerat)
- **Plattform:** Webbläsarbaserat, testat i Chrome/Firefox/Edge

---

## Filstruktur

```
process-builder-3d/
├── CLAUDE.md                  # Projektinstruktioner för Claude
├── PROGRESS.md                # Detta dokument
├── index.html                 # Huvud-HTML, laddar alla JS/CSS
├── css/
│   └── styles.css             # All styling (dark theme, paneler, kort, port-tooltip)
├── js/
│   ├── main.js                # Appens motor: Three.js-scen, kamera,
│   │                          # placering, kopplingar, media-modal,
│   │                          # defaultMedia-logik, simulering, sekvenser
│   ├── components.js          # 57 komponentdefinitioner med 3D-geometri
│   │                          # och defaultMedia på relevanta portar
│   ├── componentLibrary.js    # Vänster panel: flikar (13 kategorier), sökning, kort
│   ├── media.js               # 31 mediatyper med färg, fas, faroklass
│   ├── pid-export.js          # Export till P&ID-format (SVG)
│   └── sequences.js           # Uppstartssekvenser + guidade övningar
├── process description/
│   ├── Processbeskrivning av en bensinavsvavlingsanläggning.md
│   └── Ugn-doc.md
└── data/
    └── saved-processes/       # Sparade processkonfigurationer
```

---

## Implementerade Funktioner

### Arbetsyta och 3D-miljö
- Three.js-scen med PerspectiveCamera och OrbitControls
- Rutnät (grid) som referensplan
- Kameranavigation: rotera, zooma, panorera
- Komponentplacering via klick i 3D-miljön
- Flytta placerade komponenter
- Ta bort komponenter
- Snap-to-grid för komponentplacering

### Komponentbibliotek (vänster panel)
- Flikbaserad navigation per kategori
- Sökfunktion (söker namn, beskrivning, kategori)
- Komponentkort med ikon och beskrivning
- Valmarkering (selected state)

### Kopplingslogik
- Klicka på utport → klicka på inport → rör skapas
- Rör renderas som 3D-cylinder med korrekt orientering
- **Automatiskt mediaval:** portar med `defaultMedia` hoppar över modalen helt
- Mediaval via modal för övriga rörledningar
- Färgkodning av rör baserat på valt media
- Rör kan tas bort

### Egenskapspanel (höger panel)
- Visar vald komponents namn, typ, parametrar
- Visar anslutna portar

### Export
- P&ID-export till SVG via `pid-export.js`

---

## Komponentbibliotek (57 komponenter)

### Pumpar (5 st)
| Nyckel | Namn |
|--------|------|
| `centrifugal_pump` | Centrifugalpump |
| `positive_displacement_pump` | Förträngningspump |
| `compressor` | Centrifugalkompressor |
| `piston_compressor` | Kolvkompressor |
| `turbine_compressor` | Turbinkompressor (ångturbin-driven) |

### Ventiler (4 st)
| Nyckel | Namn |
|--------|------|
| `gate_valve` | Slidventil |
| `control_valve` | Reglerventil |
| `check_valve` | Backventil |
| `globe_valve` | Klotventil |

### Kolonner (4 st)
| Nyckel | Namn |
|--------|------|
| `distillation_column` | Destillationskolumn |
| `stripper_column` | Stripperkolumn |
| `absorber_column` | Aminabsorber |
| `chlorine_absorber` | Klorabsorber (NaOH-tvätt för HCl/Cl₂) |

### Reaktorer (1 st)
| Nyckel | Namn |
|--------|------|
| `reactor` | Reaktor |

### Separering (9 st)
| Nyckel | Namn |
|--------|------|
| `three_phase_separator` | Trefasseparator |
| `drum` | Drum/Ackumulator |
| `knockout_drum` | Knockout drum |
| `filter` | Filter |
| `h2s_scrubber` | H₂S-skrubber (kaustisk tvätt) |
| `desalter` | Desalter (elektrostatisk råoljedesalter) |
| `mol_sieve_dryer` | Molekylsikt-tork (zeolitbädd) |
| `coalescer` | Koalescer (vertikal, vatten-/gasolin-sep.) |
| `recontacting_absorber_drum` | Rekontakteringstank (horisontell + torn + boot) |

### Tankar (4 st)
| Nyckel | Namn |
|--------|------|
| `storage_tank` | Lagringstank |
| `floating_roof_tank` | Flyttak-tank |
| `sphere_tank` | Sfärisk trycktank |
| `fuel_gas_drum` | Bränngasbehållare (horisontell, gul) |

### Värmeöverföring (3 st)
| Nyckel | Namn |
|--------|------|
| `heat_exchanger` | Värmeväxlare (generisk) |
| `shell_tube_hx` | Skal-och-rörväxlare |
| `plate_hx` | Plattvärmeväxlare |

### Kylning (2 st)
| Nyckel | Namn |
|--------|------|
| `air_cooler` | Luftkylare (fin-fan) |
| `cooling_tower` | Kyltorn |

### Ugnar med egen skorsten (13 st)
Alla har en enda centrerad skorsten. Alla `fuel_in`-portar sätter **Bränngas** automatiskt.

| Nyckel | Namn |
|--------|------|
| `process_furnace` | Processugn |
| `cracking_furnace` | Krackningsugn |
| `dual_fired_furnace` | Dubbelbränd ugn (topp + bottenbrännare) |
| `natural_draft_furnace` | Självdragsugn (5 sektioner A-E) |
| `crude_charge_heater` | Råoljeugn (shield-sektion) |
| `vacuum_heater` | Vakuumugn |
| `coker_heater` | Cokerugn |
| `reboiler_furnace` | Uppkokarugn |
| `smr_furnace` | Ångreformerugn (SMR) |
| `multi_pass_furnace` | Flerpassugn (6 sektioner A-F) |
| `cylindrical_furnace` | Cylindrisk ugn |
| `cabin_furnace` | Kabinugn |
| `calcination_kiln` | Kalcineringsugn |

### Ugnar med gemensam skorsten – "_shared"-varianter (4 st)
Dessa saknar stack och har en `flue_gas_out`-port (auto: **Rökgas**) för koppling till centralskorsten.

| Nyckel | Namn |
|--------|------|
| `crude_charge_heater_shared` | Råoljeugn (gemensam skorsten) |
| `dual_fired_furnace_shared` | Dubbelbränd ugn (gemensam skorsten) |
| `coker_heater_shared` | Cokerugn (gemensam skorsten) |
| `multi_pass_furnace_shared` | Flerpassugn A-F (gemensam skorsten) |

### Centralskorsten (1 st)
| Nyckel | Namn | Beskrivning |
|--------|------|-------------|
| `central_stack` | Centralskorsten | Stor gemensam industriskorsten. 4 gasinportar (N/S/E/W, auto: Rökgas). Baslåda 1.5×1.5, skorstenshöjd 4.5 enheter, 3 plattformsringar. |

### Säkerhet (2 st)
| Nyckel | Namn |
|--------|------|
| `psv` | Säkerhetsventil (PSV) |
| `flare_stack` | Fackla (auto: Fackelgas) |

### Utilities (1 st)
| Nyckel | Namn |
|--------|------|
| `deaerator` | Avluftare (BFW-avluftning med LP-ånga) |

### Instrument & Övrigt (3 st)
| Nyckel | Namn |
|--------|------|
| `flow_meter` | Flödesmätare |
| `static_mixer` | Statisk mixer |
| `ejector` | Ejektor |

### Anslutningar (2 st)
| Nyckel | Namn | Beskrivning |
|--------|------|-------------|
| `battery_limit_in` | Batterigräns Intag | Gul diamantmarkör – rör kommer IN från annan anläggning. Har `liquid_out`-port. Fyll i källanläggning + ledningsnummer i egenskapspanelen. |
| `battery_limit_out` | Batterigräns Utlopp | Gul diamantmarkör – rör lämnar till annan anläggning. Har `liquid_in`-port. Fyll i målanläggning + ledningsnummer i egenskapspanelen. |

---

## Mediatyper (31 st)

### Kolväten (11 st)
`straight_run_gasoline`, `cracked_gasoline`, `raw_gasoline`, `whole_gasoline`,
`light_gasoline`, `heavy_gasoline`, `lpg`, `crude_oil`, `diesel`, `kerosene`, `residue`

### Gaser (7 st)
`hydrogen`, `hydrogen_sulfide`, `fuel_gas`, `recycle_gas`, `flare_gas`, `flue_gas`, `two_phase_hc`

> **Rökgas (`flue_gas`)** – för rörledningar från ugnar (shared-varianter) till centralskorsten.

### Kemikalier (3 st)
`amine_lean`, `amine_rich`, `caustic`

### Vatten (4 st)
`sour_water`, `cooling_water`, `boiler_feed_water`, `process_water`

### Utilities (5 st)
`steam_hp`, `steam_mp`, `steam_lp`, `instrument_air`, `nitrogen`

### Övrigt (1 st)
`unknown`

---

## Automatiskt Mediaval (defaultMedia)

Portar med känt media sätts automatiskt utan modal. Komplett lista:

| Port / Komponent | Media |
|---|---|
| `fuel_in`, `fuel_in_1/2` – alla ugnar | Bränngas |
| `flue_gas_out` – shared-ugnar | Rökgas |
| `fluegas_out` – SMR-ugn | Rökgas |
| `gas_in_1/2/3/4` – centralskorsten | Rökgas |
| `inlet` – fackla | Fackelgas |
| `steam_in` – turbinkompressor | HP-ånga |
| `steam_out` – turbinkompressor | LP-ånga |
| `steam_in` – SMR-ugn, coker-ugnar | HP-ånga |
| `steam_in` – råoljeugnar, vakuumugn | MP-ånga |
| `steam_in` – stripper, avluftare | LP-ånga |
| `warm_in`, `cool_out`, `makeup_in` – kyltorn | Kylvatten |
| `bfw_in`, `bfw_out` – avluftare | Pannmatarvatten |
| `solvent_in` – aminabsorber | Mager amin |
| `rich_out` – aminabsorber | Rik amin |
| `caustic_in`, `spent_out` – klorabsorber, H₂S-skrubber | Natronlut |
| `crude_in/out` – desalter | Råolja |
| `water_in` – desalter | Processvatten |
| `brine_out` – desalter | Survatten |
| `regen_in/out` – molekylsikt-tork | Kvävgas |
| `feed_in`, `product_out` – koalescer | Krackad bensin resp. Tvåfas (gas+vätska) |
| `relief_out` – koalescer | Fackelgas |
| `water_out` – koalescer | Survatten |
| `gas_in`, `gas_out` – rekontakteringstank | Tvåfas (gas+vätska) resp. Recirkulationsgas |
| `naphtha_in`, `naphtha_out` – rekontakteringstank | Råbensin |
| `water_out` – rekontakteringstank | Survatten |

---

## Arbetslogg – Genomförda sessioner

### Session 1 – Grundstruktur
- HTML-struktur, Three.js-integration
- Komponentbibliotek med fliknavigation och sökning
- Grundläggande 3D-komponentplacering
- Kopplingslogik (port → port → rör)
- Mediatyper och färgkodning av rör
- P&ID-export (SVG)

### Session 2 – Ugnsutökning
- Lade till 10+ ugnstyper med detaljerade 3D-modeller
- `multi_pass_furnace`: expanderades till **6 sektioner (A-F)**
- `natural_draft_furnace`: expanderades till **5 sektioner (A-E)**
- Lade till `_shared`-varianter (4 st) utan stack, med `flue_gas_out`-port
- Lade till `central_stack` med 4 inportar och realistisk industriskorsten
- **Cylindrisk ugn:** Tog bort felaktigt orienterade TorusGeometry-ringar
- **Alla ugnar:** Z-djup ökades (~0.7 → 1.2–1.5) för realistiska brännrarrader

### Session 3 – Polering och skalning
- **En skorsten per ugn:** Konsoliderade dubbla/trippla till en centrerad stack
- **Rökgas:** Ny mediatyp `flue_gas` för ugn→centralskorsten-kopplingar
- **Centralskorsten skalad upp:** höjd 2.6→4.5 enheter, bas 1.0→1.5, 3 plattformar
- Skapade PROGRESS.md-dokumentet

### Session 4 – Nya komponenter och automatiskt mediaval
- Nya komponenter: `turbine_compressor`, `chlorine_absorber`, `h2s_scrubber`
- **`defaultMedia` på portar:** ~30 portar i components.js fick `defaultMedia`
- **main.js:** `resolvePortDefaultMedia()` hoppar automatiskt över media-modalen
  för manuell koppling och auto-connect vid placering

### Session 5 – Ytterligare komponenter
- Nya komponenter: `deaerator` (avluftare), `desalter`, `mol_sieve_dryer`
- `deaerator`: horisontell lagringsdrum + vertikal brickkolumn, LP-ånga
- `desalter`: elektrostatisk råoljedesalter med HV-isolatorer och transformatorbox
- `mol_sieve_dryer`: zeolitbädd med isolering, grön statusindikatoring, N₂-regenerering
- Uppdaterade PROGRESS.md och CLAUDE.md

### Session 6 – Produktplan och Steg 1: Spara/ladda processer
- **PRODUCT_PLAN.md:** Kommersiell produktplan — tre driftsättningsvarianter (Electron, Docker, SaaS),
  licensmodell (engångslicens + underhållsavtal), prisintervall, roadmap och go-to-market
- **Spara-modal:** Namngivna sparslots i localStorage, lista befintliga sparar med datum/statistik,
  tvåstegs-överskrivningsskydd, radering direkt i modalen
- **Ladda-modal:** Lista alla sparade processer med Ladda/Ta-bort-knappar, bakåtkompatibilitet
  med gammalt enkelt sparformat (automatisk migration)
- **Export till JSON-fil:** Laddar ned nuvarande arbetsyta som `.json`-fil (för delning och backup)
- **Import från JSON-fil:** Läser `.json`-fil från disk och återställer processen
- Refaktorerat: `serializeCanvas()` och `restoreCanvas()` som återanvändbara funktioner

### Session 6 (fortsättning) – Steg 2: Komponentetiketter i 3D
- **Taggnummer-fält** i egenskapspanelen (type="text", monospace, placeholder "P-101")
- **3D-sprite-etikett** ovanför varje komponent (Canvas2D → CanvasTexture → THREE.Sprite)
  — placeras automatiskt ovanför meshens bounding box, synlig från alla kameravinklar
- Etiketten uppdateras live medan man skriver taggnumret
- **Synkas med flytt:** etiketten följer med i realtid under move-mode
- **Sparas och laddas** med processen (JSON export/import + localStorage + undo/redo)
- Städas korrekt vid: Radera komponent, Rensa allt, Ladda process, Ångra/Gör om

### Session 7 – Steg 4: Enkel flödessimulering (buggfixar + förbättringar)
- **Buggfix `buildSimGraph`:** Branch pipes (T-kopplingar, `from.componentId === '__branch'`)
  kraschade med TypeError när `adjOut.get('__branch')` returnerade undefined.
  Fix: guarda mot `'__branch'` i adjOut-loop och hoppa över dem i Kahn's in-degree-beräkning
- **Branch pipe propagation:** I varje sim-tick (per pass) ärvs `computedFlow/Temp/Pressure`
  direkt från parent pipe via `pipe.branchFrom.pipeId`
- **Temperaturfärgade pipe mesh:** `updatePipeColorsFromComputed()` sätter nu
  `pipe.mesh.material.color` + emissive baserat på temperaturkarta (blå→röd) när flödande;
  `resetPipeMeshColor(pipe)` återställer media/compat-färg vid stopp eller ingen flöde
- **Pipe-färg återställs:** `stopSimTick()` anropar `resetPipeMeshColor()` på alla rör
- **Separator-hantering i simTick:** Trefasseparator splittar gas/olja/vatten; filter och
  enkel separator har 5% tryckfall i pass-through
- **Statusrad under simulering:** `▶ Simulering — X/Y komponenter på`

### Session 6 (forts.) – Steg 3: Mediakompabilitetskontroll
- **`checkPipeCompatibility(pipe)`** – kontrollerar mot `defaultMedia` på porter (primärt)
  och portnamns-mönster (sekundärt: fuel_in, steam_in/out, cooling, amine, caustic, etc.)
- **Två feltyper:** `error` (annan kategori/fas, t.ex. kylvatten till bränngas-port) och
  `warning` (samma kategori men annan variant, t.ex. HP-ånga istället för LP-ånga)
- **`applyPipeCompatColor(pipe)`** – röd (#ff3333) vid error, orange (#ff9900) vid warning
  med svag emissive-glöd; återgår till medias normalfärg när kompatibelt
- **Egenskapspanelen** – visar röd/orange block med beskrivande feltext, eller grön
  "✓ Kompatibel"-bekräftelse vid korrekt media
- **Statusraden** – visar "✕ Inkompatibel: …" eller "⚠ Varning: …" direkt när
  rör skapas (manuellt och auto) eller media ändras via "Ändra media"

### Session 7 (fortsättning) – Steg 5: Guidade övningar + Simuleringsbuggfixar
- **Steg 5 – Guidade byggövningar:** Tre övningar med steg-för-steg verifiering i `sequences.js`
- **Auto-start simulering:** `startSimTick()` sätter alla komponenter till `running = true` automatiskt
- **Toggle-knapp fix:** `updatePropertiesComputedSection()` – uppdaterar bara computed-sektionen i egenskapspanelen (istf. hela panelen) så knappklick inte avbryts av simTick-rebuild
- **Tangentbordsguard:** R/M-genvägar avfyras inte när fokus är i ett `<input>`-fält
- **Double-step-advance fix:** `sequenceStepPassing`-flagga förhindrar att 500ms-intervallet anropar `showSequenceStepSuccess()` dubbelt under 800ms-fördröjning

### Session 9 – Steg 6: Prov-Läge (Exam Mode)
- **`examMode` boolean-flagga** i app-state
- **`resolvePortDefaultMedia()`** returnerar `null` i examMode — student väljer alltid media manuellt via modal
- **`applyPipeCompatColor()`** hoppar logiken, sätter `pipe.compat = { ok: true }` — inga röda/orangea rör
- **`detectNearbyPorts()`** returnerar `[]` — ingen auto-koppling av närliggande portar
- **`createComponentLabel()`** sätter `sprite.visible = !examMode` — nya etiketter döljs direkt i Prov-Läge
- **`applyExamMode(active)`** central funktion: togglar allt, döljer/visar tagSprites, återställer/återapplicerar compat-färger på alla rör, uppdaterar egenskapspanelen
- **Röd banner** i 3D-vyn: *"PROV-LÄGE AKTIVT — ..."* (`#exam-mode-banner`)
- **Knapp `🎓 Prov-Läge`** i toolbar med röd highlight-stil när aktiv (`#btn-exam-mode.exam-active`)
- **Examinatorvy:** Examinatorn stänger av Prov-Läge → compat-färger återkommer omedelbart på alla felkopplade rör

### Session 10 – Steg 7: Felsökningsscenarier
- **5 FAULT_SCENARIOS** definierade i `sequences.js` — 3 befintliga + 2 nya (`pd_pump_failure_scenario`, `control_valve_stuck_scenario`)
- **`overheat_scenario` buggfix:** Saknade toggle pump + toggle HX + verify_flow efter omstart — lade till 3 steg
- **`emergency_stop` buggfix:** `activateEmergencyStop()` anropar nu `showSequenceStepSuccess()` direkt om aktuellt steg är `emergency_stop` — intervallet pausas under ESD och detecterar aldrig steget annars
- **`valve_stuck` buggfix:** `__updateParam` sätter nu `comp.running = true` när `valve_stuck`-felet rensas och öppningsvärdet > 0 — verify_flow passerar nu korrekt
- **`reset_emergency` fault-rensning:** Dubbelt skydd — `showSequenceStepSuccess` + `advanceSequenceStep` anropar `clearAllFaults()` efter reset_emergency i fault-scenarion

### Session 11 – Bypass-buggfix + 2 nya komponenter (Koalescer & Rekontakteringstank)

#### Bypass-fix (end-tee): Huvudrör visade medialfärg istf. simuleringsfärg
- **Rotsak:** `getPipeFlowState` beräknade `effectiveFlow` on-the-fly — resulterade i race condition
  för bypass-röret (P2, CV→tank) som fortfarande fick medialfärg (grön) när bypass var aktiv
- **Fix:** Lade till Phase 3-resolution i `simTick` — pre-beräknar `pipe.effectiveFlow`,
  `pipe.effectiveTemp` och `pipe.endTeeFeeder` explicit på alla rör innan färguppdatering
- `getPipeFlowState` förenklades till att läsa pre-beräknade värden; `updatePipeColorsFromComputed`
  läser `pipe.effectiveFlow` direkt — ingen on-the-fly logik kvar

#### Ny komponent – `coalescer` (Separering)
- Vertikal cylinderformad vessel för separation av vatten från gasolin/nafta
- Geometri: CylinderGeometry + SphereGeometry-halvkupar (topp + botten) + 3 stödben
- Röd RV-kropp på säkerhetsventil-nozzeln
- 4 portar: `feed_in` (krackad bensin, sida nära topp), `product_out` (tvåfas, topp),
  `relief_out` (fackelgas, övre sida), `water_out` (survatten, botten — Z-riktning mot grid)
- `water_out` ritning: exitriktning `[0,0,1]` (Z) istf. `[0,-1,0]` (ner) — undviker under-grid-ledning

#### Ny komponent – `recontacting_absorber_drum` (Separering)
- Horisontell liggande tank + vertikal absorptionstorn (lila, wireframe-fyllning) + survattenpotta
- Geometri: Horisontell CylinderGeometry med saddelstöd + upprättstående torn + liten vertikal boot
- 5 portar: `gas_in` (tvåfas från koalescer, drumtopp), `naphtha_in` (råbensin, tornsida nära topp),
  `gas_out` (recirkulationsgas, torntopp), `naphtha_out` (råbensin, drumundersida),
  `water_out` (survatten, bootbotten)

#### Buggfixar nya komponenter
- `gas_in.defaultMedia` ändrad `recycle_gas` → `raw_gasoline` → slutligen `two_phase_hc` (stegvis
  under testning — matchat koalescerns `product_out`)
- `coalescer.product_out.defaultMedia` ändrad `raw_gasoline` → `two_phase_hc` för att matcha

---

### Session 8 – Portfixar, Ny Tooltip, Ny Komponent och Batterigräns
- **Dolda portar fixade (6 Separering-komponenter):** Portpositioner justerade utanför mesh-geometri för `three_phase_separator`, `drum`, `knockout_drum`, `desalter`, `h2s_scrubber`, `mol_sieve_dryer`
- **H₂S-skrubber `spent_out`:** Ändrad från nedåt-riktad underjordisk port (`[0,-1.05,0]`) till sidodränering på sumpen (`[-0.28,-0.94,0]`, riktning vänster). Munstycksmesh uppdaterad.
- **Port info tooltip:** Flytande infokort visas vid muspekaren när man klickar på valfri port (in eller ut). Visar komponentnamn, portnamn, porttyp och ledtråd. Färgkodad kantlinje: röd = utport, blå = inport. Tonar ut efter 4 sekunder.
- **Tips-knappen borttagen:** Removed `seq-hint-btn`, all timer-logik och `hintTimer`/`hintVisible`-variabler städade från `main.js` och `index.html`.
- **Ny komponent – `fuel_gas_drum`:** Horisontell trycktank för bränngas (Tankar-kategori). Gul med svarta säkerhetsmärkningsband. Portar: `gas_in`, `gas_out`, `drain`, `relief`. Default media `fuel_gas`.
- **Ny kategori – Anslutningar:** Läggs till i `componentLibrary.js` med ikon `⇌`, ordning 12.
- **Ny komponent – `battery_limit_in`:** Gul diamantmarkör med pil höger. `liquid_out`-port. Representerar rör som kommer IN från annan anläggning. Editerbara fält: källanläggning, ledningsnummer, medium.
- **Ny komponent – `battery_limit_out`:** Gul diamantmarkör med pil vänster. `liquid_in`-port. Representerar rör som lämnar till annan anläggning.

---

## Planerat / Framtida Arbete

### Planerade steg (i ordning)

#### Steg 1 – Spara/ladda processer ✅ KLART
- Namngivna sparslots i localStorage (flera processer parallellt)
- Spara-modal: namnge, lista befintliga, överskrivningsskydd
- Ladda-modal: lista alla sparade processer med datum och raderingsknapp
- **Exportera till JSON-fil** (download) — kritiskt för delning och säkerhetskopiering
- **Importera JSON-fil** (upload) — öppnar sparad fil från disk
- Bakåtkompatibilitet med gamla enkla sparformatet

#### Steg 2 – Komponentetiketter i 3D ✅ KLART
- Visa taggnummer (P-101, V-201, E-301) direkt i 3D-vyn ovanför varje komponent
- Redigerbara via egenskapspanelen
- Exporteras med processen (sparas i JSON)

#### Steg 3 – Mediakompabilitetskontroll ✅ KLART
- Varning (röd highlight) om inkompatibla mediatyper kopplas ihop
  (t.ex. råolja → aminabsorber, kylvatten → rörledning märkt H₂S)
- Grön bekräftelse vid kompatibel koppling
- Kompabilitetstabell definieras per komponenttyp

#### Steg 4 – Enkel flödessimulering ✅ KLART
- Animerade flödespartiklar längs aktiva rörledningar (speed ∝ flöde)
- On/off-status per komponent (dubbelklick), visuell glöd på körande komponenter
- **Temperaturfärgade rör:** pipe mesh ändrar färg blå→cyan→gul→orange→röd baserat på beräknad temperatur under simulering; återgår till medias normalfärg när simulering stoppar
- Dynamisk simuleringsgraf (topologisk sortering, Kahn's algorithm)
- `simTick()` var 200 ms: propagerar flöde/tryck/temperatur längs grafen
- **Fix:** Branch pipes (T-kopplingar med `from.__branch`) kraschar inte längre i buildSimGraph
- **Fix:** Branch pipes ärver flöde/temp/tryck från parent pipe i varje tick
- **Separator-hantering:** Trefasseparator delar flödet gas 30%/olja 40%/vatten 30%; enkel separator/filter med tryckfall 5%
- **Statusrad** visar `▶ Simulering — X/Y komponenter på` under aktiv simulering
- Beräknade värden visas i egenskapspanelen (flöde, tryck, temp in/ut)

#### Steg 5 – Guidade övningar / scenarion ✅ KLART
- Tre guidade byggövningar: *Enkel pumpsystem*, *Enkel destillationsenhet*, *Pump–separator*
- `GUIDED_EXERCISES` i `sequences.js` med `place_component`- och `connect_components`-validering
- Sekvenser-modalen visar nu två sektioner: *Byggövningar* (alltid tillgängliga) och *Uppstartssekvenser*
- Svårighetsgrads-badge per övning (Enkel/Medel/Svår)
- `sequenceStepPassing`-flagga förhindrar dubbel-steg-avancering

#### Steg 6 – Prov-Läge (Exam Mode) ✅ KLART
- `examMode` boolean-flagga; toggle-knapp `🎓 Prov-Läge` i toolbar
- Inaktiverar: automatiskt mediaval, compat-feedback (röda rör), auto-koppling, komponentetiketter
- Röd banner i 3D-vyn när aktivt; knapp röd-markerad
- Examinatorvy: stäng av Prov-Läge → alla compat-fel syns direkt

#### Steg 8 – Bypassledningar (T-anslutning mot rör) ✅ KLART
- **End-tee-rör:** Nytt rörtyp (`to.componentId === '__pipe_end'`) – startar från en komponentport och avslutas på ett befintligt rör (T-anslutning)
- **Användningsflöde:** Klicka utport → klicka på ett befintligt rör → lägg till waypoints → Enter för att slutföra
- **Statusmeddelande** uppdaterat: informerar om att man kan klicka på inport ELLER rör
- **`createPipeWithEndTee()`:** Skapar T-anslutningsrör med tee-markör (cyan torus) på målröret
- **`startPipeToTeeDrawing()`:** Övergångsfunktion från select-target till drawing-fas med end-tee
- **`buildSimGraph`:** Hoppar över `__pipe_end` i adjIn och inDegree (identisk guard-logik som `__branch`)
- **`isPipeFlowing`:** End-tee-rör flödar om `simulationRunning && fromComp.running` (ingen toComp)
- **Serialisering:** `captureSnapshot`, `restoreSnapshot`, `serializeCanvas`, `restoreCanvas` inkluderar `endTee`-fält och återställer end-tee-rör efter normala och branch-rör
- **Rensning:** `removePipe` hanterar end-tee-rör korrekt (reell fromComp, ingen toComp); tee-markör rensas via befintlig `teeMarker`-städning
- **Steg-tidsinställning:** Sekvens-stegövergång ändrad 800 ms → 2000 ms (mer tid att läsa)

#### Steg 7 – Felsökningsscenarier ✅ KLART
- **5 felsökningsscenarier** i `sequences.js` (`FAULT_SCENARIOS`):
  1. **Pumpavbrott** (Enkel) — centrifugalpump havererar, nödstopp, restart
  2. **Ventil fastnar** (Medel) — slidventil fastnar stängd, manuell override
  3. **Kolvpump havererar** (Enkel) — PD-pump havererar i högtrycksystem
  4. **Reglerventil tappar kontroll** (Medel) — automatisk reglerventil fastnar, manuell override
  5. **Överhettning** (Svår) — värmeväxlare överhettas, nödstopp, temp-justering, restart
- **Knapp `🔧 Felsökning`** i toolbar öppnar fault-modal med tillgänglighets-check per scenario
- **Felsökning-panel** återanvänder sekvens-UI (seq-panel) med titel `FELSÖKNING: ...`
- **Orange pulsande glow** på felaktiga komponenter (`updateFaultVisuals` i animate-loop)
- **Fault-indikator** i egenskapspanelen när faultad komponent är vald
- **Viewport glow** (`#viewport.has-faults`) när aktiva fel finns
- **Buggfixar (session 10):**
  - `emergency_stop`-steg valideras nu direkt i `activateEmergencyStop()` — intervalll pausas under ESD
  - `valve_stuck` → `clearFault` sätter nu `comp.running = true` när opening > 0 (verify_flow fungerar)
  - `reset_emergency`-steg rensar alla fel i `showSequenceStepSuccess` + `advanceSequenceStep` (dubbelt skydd)
  - `overheat_scenario`: lade till toggle pump + toggle HX + verify_flow efter omstart

### Övriga framtida förbättringar
- Fristående ångturbin (driver pump/generator)
- Fler ventiltyper: butterfly, membran, nålventil
- Förbättrad P&ID-export med ISA-symboler
- Kategori-fix: `heat_exchanger` har inkonsekvent kategorikodning
