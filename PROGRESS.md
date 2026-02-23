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
│   └── styles.css             # All styling (dark theme, paneler, kort)
├── js/
│   ├── main.js                # Appens motor: Three.js-scen, kamera,
│   │                          # placering, kopplingar, media-modal,
│   │                          # defaultMedia-logik, P&ID-export
│   ├── components.js          # 52 komponentdefinitioner med 3D-geometri
│   │                          # och defaultMedia på relevanta portar
│   ├── componentLibrary.js    # Vänster panel: flikar, sökning, kort
│   ├── media.js               # 31 mediatyper med färg, fas, faroklass
│   ├── pid-export.js          # Export till P&ID-format (SVG)
│   └── sequences.js           # Uppstartssekvenser (påbörjad)
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

## Komponentbibliotek (52 komponenter)

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

### Separering (7 st)
| Nyckel | Namn |
|--------|------|
| `three_phase_separator` | Trefasseparator |
| `drum` | Drum/Ackumulator |
| `knockout_drum` | Knockout drum |
| `filter` | Filter |
| `h2s_scrubber` | H₂S-skrubber (kaustisk tvätt) |
| `desalter` | Desalter (elektrostatisk råoljedesalter) |
| `mol_sieve_dryer` | Molekylsikt-tork (zeolitbädd) |

### Tankar (3 st)
| Nyckel | Namn |
|--------|------|
| `storage_tank` | Lagringstank |
| `floating_roof_tank` | Flyttak-tank |
| `sphere_tank` | Sfärisk trycktank |

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

#### Steg 4 – Enkel flödessimulering ✳️ NÄSTA
- Animerade flödespilar längs aktiva rörledningar
- On/off-status per komponent (dubbelklick)
- Temperatur-/tryckfärg på rör (blå=kallt, röd=varmt)
- Grundläggande processparametrar i egenskapspanelen

#### Steg 5 – Guidade övningar / scenarion
- Fördefinierade uppgifter: "Bygg en HDS-enhet", "Koppla kylvattensystemet"
- Verifiering när studenten löst uppgiften rätt
- Tips och ledtrådar vid fel
- Bygger på `sequences.js`-infrastrukturen

### Övriga framtida förbättringar
- Fristående ångturbin (driver pump/generator)
- Fler ventiltyper: butterfly, membran, nålventil
- Nödstopp-simulering (Fas 4): ESD-sekvens
- Felsökningsscenarier: presentera ett fel, låt studenten hitta orsaken
- Förbättrad P&ID-export med ISA-symboler
- Kategori-fix: `heat_exchanger` har inkonsekvent kategorikodning
