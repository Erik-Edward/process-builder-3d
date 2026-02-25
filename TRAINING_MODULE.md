# Ugnsläromodul – Design, Vision och Implementation

## Översikt

Ugnsläromodulen är ett interaktivt utbildningsverktyg inbyggt i Process Builder 3D.
Den simulerar uppstartsproceduren för en industriell självdragsugn (F-XXX1) med
tillhörande bränslegastrumma (V-XXX4). Studenten klickar på reella komponenter i
3D-modellen och bekräftar rätt åtgärder i rätt ordning — precis som i en riktig
kontrollrumsövning.

---

## Vision och Pedagogiskt Syfte

### Mål
- Förbereda operatörstuderande inför verkliga uppstartssekvenser
- Ge en tydlig bild av brännarordning, ventillogik och säkerhetsrutiner
- Erbjuda repetitionsövning utan risk (ingen riktig utrustning, ingen säkerhetsrisk)
- Möjliggöra examination i Prov-Läge (TRAINING_MODULE samkörs med Exam Mode-flaggan)

### Pedagogisk princip
- Varje steg har ett syfte, ett förväntat agerande och en bekräftelsemekanism
- Studenten måste klicka på rätt komponent i 3D-modellen — inte bara klicka "Nästa"
- Fel agerande gör att steget inte avancerar (validering mot `furnaceState`)
- Instruktörer kan skipa steg med debugläget för att visa specifika moment

### Målgrupp
- Studenter i processteknik, instrumentteknik och operatörsutbildning
- Nyanställda operatörer vid petrokem-/raffinaderiprocesser
- In-house träning hos industriella kunder

---

## Implementerade Komponenter

### `furnace_training` — Processugn F-XXX1

**Geometriska konstanter:**
```
LIFT = 2.0     (höjd från grid till ugngolv)
FW   = 7.5     (total bredd, 3 sektioner × 2.5)
FH   = 3.2     (eldstadens höjd)
FD   = 4.0     (ugnsdjup)
```

**3D-struktur:**
- Betongbas (grå box under LIFT)
- Eldstad (FireboxGeometry, BoxGeometry FW×FH×FD)
  - **Frontvägg:** glassMaterial (transparent, opacity 0.18, blåtonad) — insyn i eldstaden
  - Övriga väggar: eldstadsmaterial (mörkgrå)
- Isoleringstopp (plåttak)
- Sektioner A / B / C (xOff = −2.5 / 0 / +2.5):

  | Element | Position | Beskrivning |
  |---------|----------|-------------|
  | Sub-header | bakre del, gul cylinder | Bränngas-toppledning per sektion |
  | PRIM_AIR | frontfasad, underdel | Primärluftlucka (sliding damper) |
  | SEC_AIR | frontfasad, ovan PRIM | Sekundärluftlucka |
  | Pilot | vänster sida, frontfasad | Tändsticka/pilot-tändrör |
  | KIKV ×6 | frontfasad, 2 rader à 3 | Kör-i-klart-ventiler (brännarventiler) |
  | HATCH | frontfasad, övre del | Inspektionslucka (öppnas/stängs) |
  | Burner-indikatorer | under HATCH, 3×2 | Synliga brännarpunkter inuti eldstaden |
  | BURNER feed-pipes ×6 | undersida ugn | Grå stålrör underifrån till eldstaden — klickbara |
  | BLEED | sub-header, bakre ände | Tömningsventil per sektion (teer uppåt) |
  | Processtubbar | nära tak inuti eldstad | Processrör (visuella, ej klickbara) |
  | Sektionslabel A/B/C | frontfasad, topp | Mörkt badge, 0.45×0.22 sprite |

**`initialFurnaceState` — alla start i stängt/stängt läge:**
```javascript
{
  PRIM_AIR_A: 'closed', SEC_AIR_A: 'closed', PILOT_A: 'off', HATCH_A: 'closed',
  KIKV_A1..A6: 'closed',  BURNER_A1..A6: 'off',  BLEED_A: 'closed',
  // ... samma för B och C
}
```

---

### `v_xxx4_drum` — Bränslegastrumma V-XXX4

**Geometri:**
- Stående cylinder (R=0.70, H=1.40) med halvkupar (topp + botten)
- 3 stödben
- Nozzle (koppling till ugnsrör) vid lokal z=0 (matchar ugnsrör world-z=2.1)
- Nivåindikator (levelBand): klickbar mesh, 1.82 enheter hög, `furnaceKey='V_XXX4_INSPECT'`
- Dräneringsventil (frontfasad, lokal z=0.92 — 0.22 utanför trumväggen): `furnaceKey='DRAIN_V_XXX4'`
- Facklerör: horisontellt rör från dräneringsventil ut (lokal z=1.51–2.04)

**`initialFurnaceState`:**
```javascript
{ V_XXX4_INSPECT: false, DRAIN_V_XXX4: 'closed' }
```

---

## Teknisk Arkitektur

### Click-detection

Standardens port-klick-logik använder en `Map<Mesh, component>` som inte fungerar
pålitligt med nästlade groups. Ugnsmodulen använder istället:

```javascript
for (const comp of placedComponents) {
    if (comp.type !== 'furnace_training' && comp.type !== 'v_xxx4_drum') continue;
    const hits = raycaster.intersectObject(comp.mesh, true);  // recursive
    for (const hit of hits) {
        if (hit.object.userData.furnaceKey) {
            handleFurnaceElementClick(comp, hit.object.userData.furnaceKey);
            return;
        }
    }
}
```

`intersectObject(mesh, true)` testar alla Mesh-descendants rekursivt.
Resultaten är distanssorterade — närmaste träff med `furnaceKey` hanteras alltid.

### Steg-typerna i `FURNACE_SCENARIOS`

| Typ | Beskrivning |
|-----|-------------|
| `furnace_interact` | Klicka komponent → ändra `furnaceState[key]` till `expectedState` |
| `furnace_verify` | Klicka komponent → sätt `furnaceState[key+'_verified'] = true` (bekräftelse utan ändring) |
| `furnace_ccr` | Visa CCR-knapp → operatören bekräftar att kontrollrummet är informerat |
| `furnace_timer` | Vänta tills `Date.now() - start >= duration * 1000` (nedräkning visas) |
| `place_component` | Studenten placerar en specifik komponent (byggövning) |

### `furnaceState`-livscykel

```
placeComponent()  →  comp.furnaceState = {...def.initialFurnaceState}
startFurnaceScenario()  →  sparar canvas, restoreCanvas(preload), scenarioLocked=true
handleFurnaceElementClick()  →  uppdaterar furnaceState[key], anropar updateFurnaceElementVisual()
cancelSequence()  →  rensar furnaceTimer, återställer canvas, scenarioLocked=false
```

### Visuell feedback-tabell

| Tillstånd | Färg |
|-----------|------|
| `'closed'` / `'off'` / `false` | Grön (0x22cc44) |
| `'open'` / `'on'` / `true` | Röd (0xff3322) |
| `'lit'` | Orange (0xff8800) |
| `'adjusted'` | Blå (0x3399ff) |

---

## Sekvensstruktur — `furnace_startup` (52 steg)

### Fas 1: Förberedelse och kontroll (steg 1–10)
Verifiering av att alla ventiler är i rätt läge inför uppstart.
- Kontroll av V-XXX4 (nivåindikator, tömning)
- Verifiering att PRIM_AIR och SEC_AIR är stängda
- Verifiering att alla KIKV och HATCH är stängda
- Öppna bränngastillförseln

### Fas 2: Gasprov och tändning (steg 11–28)
Den kritiska fasen — proven gas, tändning av pilot och provtändning av brännare.
- Öppna BLEED_A/B/C (tömning av eventuellt kondensat)
- Stäng BLEED
- Öppna HATCH per sektion
- Tänd pilot (PILOT_A/B/C)
- Klicka BURNER_A1/A2... (provtändning)
- Stäng HATCH

### Fas 3: Uppvärmning (steg 29–44)
Gradvis öppning av brännare och luftreglering.
- Öppna KIKV per sektion (3+3 i varje)
- Justera PRIM_AIR och SEC_AIR
- CCR-bekräftelse (kontrollrum informeras)
- Timer-steg: vänta på temperaturstegring

### Fas 4: Driftläge (steg 45–52)
Avslutande moment, överlämning till driftläge.
- Sista temperaturverifiering
- CCR-bekräftelse att ugnen är i stabil drift
- Statusuppdatering

---

## Debugläge

Debugläget är avsett för instruktörer och testning — inte för studenter i examination.

**Aktivering:** Klicka på 🔧-knappen i sekvens-panelen (visas bredvid ×-knappen).

**Funktioner:**
- **Hoppa till steg:** Ange stegnummer och klicka "Hoppa" (eller tryck Enter)
- **Nästa →:** Gå direkt ett steg framåt (kringgår validering)
- Steg-input synkas automatiskt när steg avanceras normalt

**Teknisk not:** `debugJumpToStep(targetIndex)` rensar timer-state (`furnaceTimerInterval`,
`furnaceTimerStart`, `sequenceStepPassing`) innan steget sätts — förhindrar låst timer-steg.

---

## Preload-data (canvas-state vid scenariostart)

`startFurnaceScenario()` kör `restoreCanvas(scenario.preload)` som placerar
en `furnace_training` vid `{x:0, y:0, z:0}` och en `v_xxx4_drum` vid `{x:0, y:0, z:2.1}`.

V-XXX4 placeras på z=2.1 för att matcha ugnsrörets world-z (sub-header bakkant).
Kameran frames automatiskt för att visa hela ugnen och V-XXX4.

---

## Kända Begränsningar och Planerade Förbättringar

### Kända begränsningar
- Brännarna (BURNER_X1..X6) har enkel färgfeedback — ingen flamanimation
- Sekvensen är låst till sektionsordning A→B→C (ej konfigurerbar)
- Inga rörlednings-kopplingar valideras under scenariot (bara komponentklick)
- Debugläge blockerar inte Prov-Läge — instruktör behöver manuellt säkerställa att debugläge är av under examination

### Planerade förbättringar
1. **Flamanimation:** Partikeleffekt eller sprite-animation för tända brännare
2. **Felsteg:** Steg som simulerar ett fel (t.ex. pilot slocknar) — studenten måste felsöka
3. **Tidsstyrning:** Realistiska väntetider med processtemperaturkurva
4. **HDS/NHT-ugn:** Separat läromodul för hydrotreater-ugn med annan ventillogik
5. **Rapport:** Exporterbar PDF-rapport med genomförda steg och tidsstämplar
6. **Fler sektioner:** Konfigurerbar ugn (2–6 sektioner)
7. **Nödstopp-integrering:** ESD-sekvens som del av träningsmodulen

---

## Filreferenser

| Fil | Rad (ca) | Innehåll |
|-----|----------|----------|
| `js/components.js` | `furnace_training`-definition | Geometri, initialFurnaceState, alla sub-meshar med furnaceKey |
| `js/components.js` | `v_xxx4_drum`-definition | Geometri, levelBand, drainAssembly |
| `js/sequences.js` | `FURNACE_SCENARIOS` | furnace_startup (52 steg), preload-data |
| `js/main.js` | `handleFurnaceElementClick()` | Steg-validering för furnace_interact/verify/ccr/timer |
| `js/main.js` | `updateFurnaceElementVisual()` | Färguppdatering per furnaceKey |
| `js/main.js` | `startFurnaceScenario()` | Preload, scenarioLocked, kamera-frame |
| `js/main.js` | `debugJumpToStep()` | Debugläge – hoppa till steg |
| `js/main.js` | canvas click-handler | Rekursiv intersectObject-logik |
| `index.html` | `#seq-debug-bar` | Debug-kontroller (input + knappar) |
| `css/styles.css` | `.seq-debug-*` | Debugläge-styling |
