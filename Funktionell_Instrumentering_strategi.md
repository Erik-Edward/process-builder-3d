# Strategiskt Beslutsunderlag: Funktionell Instrumentering i Process Builder 3D

> Senast uppdaterad: 2026-02-28

---

## 1. Bakgrund och Syfte

Process Builder 3D har idag en stark visuell grund (Fas A) och interaktiva utbildningsprocedurer (Fas B). För att ta produkten från ett utbildningsverktyg till en **interaktiv träningssimulator** krävs en logikmotor för instrumentering. Syftet är att ge operatören omedelbar orsak-och-verkan-respons utan att drunkna i komplexiteten hos en fullskalig processimulator.

---

## 2. Strategiskt Vägval: "Functional Tier"

Vi bygger **inte** en matematisk kopia av ett kontrollsystem (DCS). Istället implementerar vi **Funktionell Instrumentering** — en välkänd kategori inom industriell träning som kallas "functional simulators".

| Verktyg | Typ | Kostnad | Vår position |
|---|---|---|---|
| PowerPoint / statiska ritningar | Passivt | Låg | För enkelt |
| **Process Builder 3D (Fas C+)** | **Funktionell simulator** | **Medel** | **← Vår nisch** |
| Aspen HYSYS / DCS-träningssystem | Fullskalig fysikbaserad simulator | Miljoner/site | För komplext och dyrt |

**Principen:**
- **Om–Då-logik** (event-based) istället för differentialekvationer
- Värden rör sig linjärt mot målvärden vid statusförändringar — inte exakt fysik, men pedagogiskt korrekt beteende
- Operatören förstår *logiken* bakom anläggningen, inte bara utseendet

---

## 3. Tekniska Komponenter

### A. Processvariabel-motor (processEngine)

En JavaScript `setInterval`-loop (500 ms tick) som räknar om aktiva processvariabler (PV) för komponenter i ett aktivt scenario. Motorn körs **bara** under pågående scenario — inte på hela arbetsytan — för att hålla prestandan acceptabel.

**Designprincip:** Ingen generell scriptmotor byggs i första iteration. Logiken skrivs direkt som JavaScript-funktioner per scenario, i samma mönster som `furnaceState` och `FURNACE_SCENARIOS` redan använder. Det är redan en embryonal event-baserad motor.

**Nyckel-PV:er (startar med ugnsscenariots komponenter):**

| PV | Komponent | Styrs av |
|---|---|---|
| Bränslegastryck | V-XXX4 → brännare | BLEED_A öppen + TSO_AA öppen |
| Kammartemperatur | Ugn F-XXX1 | Antal aktiva brännare |
| Ugnsdrag (undertryck) | FLUE_DAMPER | Spjällposition |
| Flamdetektering | PILOT_A | Tänd pilot → enablear TSO-öppning |

### B. Instrumentvisning (HTML-overlay)

Processvariabler visas i en **HTML-panel** positionerad bredvid 3D-vyns sekvens-panel — inte som Three.js-sprites. Detta följer samma mönster som `#sequence-panel` och `#port-tooltip` och kräver ingen extra Three.js-komplexitet.

Panelen visar aktiva PV:er som analoga mätarstreck eller numeriska värden med enhet (bar, °C, mmH₂O). Värdena uppdateras vid varje tick.

### C. Larm och Gränsvärden

**H/L-larm:** När ett PV överskrider konfigurerade gränsvärden (High/Low) triggas:
- Visuell indikation: rött blinkande badge i instrumentpanelen
- Statusrads-meddelande
- (Framtida) auditiv signal

**Pedagogiskt värde:** Operatören tränas i att prioritera och agera på larm i en säker miljö — en direkt förberedelse för verkliga DCS-larm.

### D. Interlock-logik (Säkerhet)

**Förreglingar** är "hård" logik som förhindrar farliga handlingsföljder. Dessa kopplas till scenariots steg-validering — ett steg kan inte avanceras om ett interlock-villkor inte är uppfyllt.

*Exempel för ugnsscenariots tändsekvens:*
- Gasventil (TSO_AA) kan inte öppnas om inte PILOT_A är tänd (`furnaceState.PILOT_A !== 'lit'`)
- Brännare (KIKV_A1) kan inte öppnas om bränslegas saknar tillräckligt tryck
- BLEED_A måste stängas innan mer än 3 KIKV-ventiler öppnas

---

## 4. Implementationsplan (tre iterationer)

### Iteration 1 — Bevisa konceptet med ugnsscenariots

*Mål: Validera UX och teknisk arkitektur innan generalisering.*

1. `processEngine` — enkel tick-loop, aktiveras vid `startFurnaceScenario()`
2. 3–4 PV:er kopplade till ugnsscenariots komponenter (tryck, temp, drag, flamdetektion)
3. HTML instrumentpanel (`#instrument-panel`) vid sidan av sekvens-panelen
4. Larm-badge för minst ett gränsvärde (övertryck, övertemperatur)
5. Minst ett interlock som blockerar fel handlingsföljd

### Iteration 2 — Generaliserad PV-modell och What-If-läge

6. PV-modell definieras per komponenttyp i `components.js` (liknande `initialFurnaceState`)
7. Topologitraversering av `pipes[]`-grafen — motor vet vad som flödar vart
8. "What-if"-läge utanför scenario: användaren manövrerar fritt och ser PV-konsekvenser i realtid
9. Larmhantering generaliserad för alla aktiva PV:er

### Iteration 3 — Scenarioredigerare och fler komponenter

10. Scenario-editor: kursutvecklare kan definiera PV-kopplingar och interlock-regler utan att programmera
11. PV-logik för fler komponenttyper (pumpar, kolonner, separatorer)
12. Exporterbar träningsrapport med tidsstämplad larmhistorik

---

## 5. Affärsmässiga Fördelar

### Prispunkt och tiering

| Produktnivå | Innehåll | Riktvärde |
|---|---|---|
| **Standard** (nuläge) | 3D-byggverktyg + guidade procedurer | 150 000 – 400 000 SEK |
| **Professional / Simulation Tier** | + Funktionell instrumentering + interlocks | ~450 000 SEK |
| **Enterprise** | + Scenarioredigerare + rapportexport | 500 000 – 1 200 000 SEK |

### Utökad målgrupp

Med instrumentering blir verktyget relevant utöver operatörsutbildning:
- **Processingenjörer** — "What-if"-testning av procedurer och driftsättningsplaner
- **HSE-ansvariga** — validering av säkerhetsrutiner och interlock-logik
- **Produktionschefer** — träning i incidenthantering utan risk för verklig produktion

### ROI-argument mot kund

Ett undvikt produktionsstopp på ett raffineringsföretag kostar typiskt 1–10 MSEK/dygn. Ett träningssystem som bevisbart minskar felhandlingar motiverar investeringen på <1 månads undvikt stopp.

---

## 6. Tekniska Risker och Motåtgärder

| Risk | Motåtgärd |
|---|---|
| Scope creep — generell scriptmotor för tidigt | Börja med hårdkodad logik per scenario; generalisera i iteration 2 |
| Prestanda — tick-loop på 50+ komponenter | Kör motor bara under aktivt scenario; begränsa till aktiva PV:er |
| Kalibreringssvårighet — värden som inte "känns rätt" | Iterera på parametrar med testanvändare; inga exakta fysiktal krävs |
| Komplexitet i topologitraversering | Bygg enkel riktad graf från `pipes[]` vid scenariostart, cacheac under körning |
