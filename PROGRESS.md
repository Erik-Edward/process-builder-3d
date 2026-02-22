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
│   │                          # placering, kopplingar, media-modal, export
│   ├── components.js          # 47 komponentdefinitioner med 3D-geometri
│   ├── componentLibrary.js    # Vänster panel: flikar, sökning, kort
│   ├── media.js               # 31 mediatyper med färg, fas, faroklass
│   ├── pid-export.js          # Export till P&ID-format (SVG)
│   └── sequences.js           # Uppstartssekvenser (planerat)
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
- Mediaval: välj mediatyp per rörledning (öppnar modal)
- Färgkodning av rör baserat på valt media
- Rör kan tas bort

### Egenskapspanel (höger panel)
- Visar vald komponents namn, typ, parametrar
- Visar anslutna portar

### Export
- P&ID-export till SVG via `pid-export.js`

---

## Komponentbibliotek (47 komponenter)

### Pumpar (3 st)
| Nyckel | Namn |
|--------|------|
| `centrifugal_pump` | Centrifugalpump |
| `positive_displacement_pump` | Förträngningspump |
| `compressor` | Kompressor |

### Ventiler (4 st)
| Nyckel | Namn |
|--------|------|
| `gate_valve` | Spjällventil |
| `control_valve` | Reglerventil |
| `check_valve` | Backventil |
| `globe_valve` | Klotventil |

### Kolonner & Reaktorer (4 st)
| Nyckel | Namn |
|--------|------|
| `distillation_column` | Destillationskolumn |
| `reactor` | Reaktor |
| `stripper_column` | Stripperkolumn |
| `absorber_column` | Absorberkolumn |

### Tankar (5 st)
| Nyckel | Namn |
|--------|------|
| `storage_tank` | Lagringstank |
| `floating_roof_tank` | Flyttak-tank |
| `sphere_tank` | Sfärisk trycktank |
| `drum` | Tryckkärl/Drum |
| `knockout_drum` | Knockout drum |

### Separering (2 st)
| Nyckel | Namn |
|--------|------|
| `three_phase_separator` | Trefasseparator |
| `filter` | Filter |

### Värmeöverföring (4 st)
| Nyckel | Namn |
|--------|------|
| `heat_exchanger` | Värmeväxlare |
| `shell_tube_hx` | Skal-och-rörväxlare |
| `plate_hx` | Plattvärmeväxlare |
| `static_mixer` | Statisk mixer |

### Ugnar med egen skorsten (10 st)
Alla har en enda centrerad skorsten (uppdaterat under session 2).

| Nyckel | Namn | Beskrivning |
|--------|------|-------------|
| `process_furnace` | Processugn | Generisk ugn |
| `cracking_furnace` | Krackningsugn | För termisk krackning |
| `dual_fired_furnace` | Dubbelbränd ugn | Topp- och bottenbrännare |
| `natural_draft_furnace` | Självdragsugn (A-E) | 5 sektioner, naturlig drag |
| `crude_charge_heater` | Råoljeugn | Stor ugn för råolja, shield-sektion |
| `vacuum_heater` | Vakuumugn | För vakuumdestillation |
| `coker_heater` | Cokeugn | Hög-COT coker-ugn |
| `reboiler_furnace` | Uppkokarugn | Eldad uppkokare |
| `smr_furnace` | SMR-ugn | Steamreforming med katalysatorrör |
| `multi_pass_furnace` | Flerpassugn (A-F) | 6 sektioner, hög kapacitet |

Övriga ugnar:
| Nyckel | Namn |
|--------|------|
| `cylindrical_furnace` | Cylindrisk ugn |
| `cabin_furnace` | Kabinugn |
| `calcination_kiln` | Kalcineringsugn |

### Ugnar med gemensam skorsten – "_shared"-varianter (4 st)
Dessa saknar stack och har istället en `flue_gas_out`-port riktad uppåt.
Kopplas till `central_stack` via rörledningar med mediatypen **Rökgas**.

| Nyckel | Namn |
|--------|------|
| `crude_charge_heater_shared` | Råoljeugn (gemensam skorsten) |
| `dual_fired_furnace_shared` | Dubbelbränd ugn (gemensam skorsten) |
| `coker_heater_shared` | Cokeugn (gemensam skorsten) |
| `multi_pass_furnace_shared` | Flerpassugn A-F (gemensam skorsten) |

### Centralskorsten (1 st)
| Nyckel | Namn | Beskrivning |
|--------|------|-------------|
| `central_stack` | Centralskorsten | Stor gemensam industriskorsten. 4 gasinportar (N/S/E/W). Skala: baslåda 1.5×1.5, skorstenshöjd 4.5 enheter, 3 plattformsringar, stormfästen, blixtledare. |

### Kylning (2 st)
| Nyckel | Namn |
|--------|------|
| `air_cooler` | Luftkylare (fin-fan) |
| `cooling_tower` | Kylvattentorn |

### Säkerhet (2 st)
| Nyckel | Namn |
|--------|------|
| `psv` | Säkerhetsventil (PSV) |
| `flare_stack` | Fackelstapel |

### Instrument & Övrigt (4 st)
| Nyckel | Namn |
|--------|------|
| `flow_meter` | Flödesmätare |
| `ejector` | Ejektor |
| `piston_compressor` | Kolvkompressor |
| `static_mixer` | Statisk mixer |

---

## Mediatyper (31 st)

### Kolväten (11 st)
`straight_run_gasoline`, `cracked_gasoline`, `raw_gasoline`, `whole_gasoline`,
`light_gasoline`, `heavy_gasoline`, `lpg`, `crude_oil`, `diesel`, `kerosene`, `residue`

### Gaser (7 st)
`hydrogen`, `hydrogen_sulfide`, `fuel_gas`, `recycle_gas`, `flare_gas`, `flue_gas`, `two_phase_hc`

> **Rökgas (`flue_gas`)** – Tillagd för att koppla ugnar med gemensam skorsten till centralskorstenen.
> Grå färg, fas: gas, hazard: none. Typisk avgastemperatur 160°C, O₂-halt ~3%.

### Kemikalier (3 st)
`amine_lean`, `amine_rich`, `caustic`

### Vatten (4 st)
`sour_water`, `cooling_water`, `boiler_feed_water`, `process_water`

### Utilities (5 st)
`steam_hp`, `steam_mp`, `steam_lp`, `instrument_air`, `nitrogen`

### Övrigt (1 st)
`unknown`

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
- `multi_pass_furnace`: expanderades från 4 till **6 sektioner (A-F)**
- `natural_draft_furnace`: expanderades från 3 till **5 sektioner (A-E)**
- Lade till `_shared`-varianter (4 st) utan stack, med `flue_gas_out`-port
- Lade till `central_stack` med 4 inportar och realistisk industriskorsten
- **Cylindrisk ugn:** Tog bort felaktigt orienterade TorusGeometry-ringar,
  roterade burnerRing till horisontellt läge
- **Alla ugnar:** Z-djup (kortsidan) ökades (~0.7 → 1.2–1.5) för att ge
  plats för realistiska brännrarrader längs golvet

### Session 3 – Polering och skalning
- **En skorsten per ugn:** Konsoliderade dubbla/trippla skorstenar till
  en enda centrerad skorsten på `cracking_furnace`, `multi_pass_furnace`,
  `dual_fired_furnace`, `coker_heater`, `natural_draft_furnace`
- **Rökgas:** Ny mediatyp `flue_gas` ("Rökgas") för rörledningar mellan
  ugnar och centralskorsten
- **Centralskorsten skalad upp:** Baslåda 1.0→1.5, skorstenscylinder
  höjd 2.6→4.5 enheter, tre plattformsringar (var två), proportionerliga
  stormfästen och blixtledare

---

## Planerat / Framtida Arbete

- **Simulering:** Animerade flödespilar längs rör, temperatur-färgkodning
- **Uppstartssekvenser:** Steg-för-steg guide (`sequences.js` påbörjad)
- **Validering:** Kontroll av kompatibla media mellan portar (rätt mediatyp)
- **LocalStorage:** Spara och ladda kompletta processlayouter
- **Fler komponenter:** Turbiner, centrifuger, torkar
- **Etiketter i 3D:** Komponentnamn synliga i arbetsytan
- **Mobilstöd / touch:** Stöd för surfplattor
