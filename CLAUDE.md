# Process Builder 3D

## Projektbeskrivning
Ett interaktivt 3D-verktyg för att manuellt bygga och simulera processanläggningar (raffinaderier, kemiska processer). Användaren placerar komponenter som pumpar, ventiler, tankar och rör i en 3D-miljö och kopplar ihop dem för att skapa fungerande processer.

## Syfte
Utbildningsverktyg för studenter inom processteknik att lära sig genom att aktivt bygga processer istället för att bara titta på färdiga ritningar. Fokus på förståelse genom praktiskt byggande och simulering.

## Teknisk Stack
- **Frontend:** HTML + JavaScript med Three.js för 3D-rendering
- **Interaktion:** Drag-and-drop, snap-to-grid, smart koppling
- **Simulering (framtida):** JavaScript-baserad processimulering

## Projektmål - Fas 1 (Grundläggande byggsystem)
1. **Komponent-bibliotek:**
   - Pumpar (centrifugal, positiv displacement)
   - Ventiler (gate, globe, check, control)
   - Tankar (lagring, reaktor)
   - Värmeväxlare
   - Rör (pipes)
   
2. **3D-miljö:**
   - Grid-baserad arbetsmiljö
   - Roterbar kamera (orbit controls)
   - Zoom in/ut
   - Pan (panorera)

3. **Komponent-placering:**
   - Drag-and-drop från verktygspalett
   - Klicka i 3D-miljö för att placera
   - Flytta placerade komponenter
   - Ta bort komponenter

4. **Grundläggande koppling:**
   - Klicka på utport på komponent A
   - Klicka på inport på komponent B
   - Automatisk rörgenerering mellan punkter
   - Visa kopplingar visuellt

## Projektmål - Fas 2 (Intelligent koppling)
- Snap-to-grid för komponenter
- Automatisk detektering av närliggande portar
- Validering av kopplingar (rätt typ, riktning)
- Visuell feedback (grönt = OK, rött = fel)

## Projektmål - Fas 3 (Enkel simulering)
- Flödesriktning (animerade pilar längs rör)
- Färgkodning (temperatur: blå = kallt, rött = varmt)
- On/Off status för komponenter
- Grundläggande processparametrar (flöde, tryck, temp)

## Projektmål - Fas 4 (Avancerad simulering)
- Uppstartssekvenser (steg-för-steg guide)
- Nödstopp-simulering
- Felsökningsscenarier
- Export till P&ID-format

## Filstruktur
```
process-builder-3d/
├── CLAUDE.md                  # Projektinstruktioner för Claude
├── PROGRESS.md                # Detaljerad projektstatus och arbetslogg
├── index.html                 # Huvud-HTML
├── css/
│   └── styles.css             # All styling
├── js/
│   ├── main.js                # Appens motor: scen, kopplingar, media-modal,
│   │                          # resolvePortDefaultMedia(), export
│   ├── components.js          # 52 komponentdefinitioner med 3D-geometri
│   │                          # och defaultMedia på portar
│   ├── componentLibrary.js    # Vänster panel: flikar, sökning, kort
│   ├── media.js               # 31 mediatyper (färg, fas, faroklass)
│   ├── pid-export.js          # P&ID-export till SVG
│   └── sequences.js           # Uppstartssekvenser (påbörjad)
├── process description/       # Processbeskrivningar som referensmaterial
└── data/
    └── saved-processes/       # Sparade processkonfigurationer
```

## Användargränssnitt (UI)
- **Vänster panel:** Komponent-bibliotek (drag-and-drop)
- **Mitten:** 3D-arbetsyta
- **Höger panel:** Komponent-egenskaper (när vald)
- **Topp-toolbar:** Spara, Ladda, Simulera, Export
- **Botten:** Status och tips

## Tekniska krav
- Webbläsarbaserat (Chrome, Firefox, Edge)
- Three.js från CDN (ingen npm installation för fas 1)
- Responsivt (minst 1280x720)
- Local storage för att spara processer

## Utvecklingsfilosofi
- Börja minimalt och bygg iterativt
- Fokus på användarvänlighet och intuitivt gränssnitt
- Validera kopplingar direkt (feedback i realtid)
- Pedagogiskt - hjälp användaren lära sig rätt sätt

## Användarflöde (typiskt)
1. Öppna applikationen
2. Dra pump från bibliotek till arbetsytan
3. Dra tank från bibliotek
4. Klicka på pumpens utport
5. Klicka på tankens inport
6. Rör skapas automatiskt
7. Lägg till fler komponenter
8. Tryck "Simulera" för att se flöde
9. Spara process för senare

## Komponentspecifikationer (exempel)
```javascript
{
  type: "pump",
  name: "Centrifugal Pump P-101",
  ports: {
    inlet: { position: [-1, 0, 0], type: "liquid_in" },
    outlet: { position: [1, 0, 0], type: "liquid_out" }
  },
  parameters: {
    flowRate: 100, // m³/h
    pressure: 5,   // bar
    power: 15      // kW
  }
}
```

## Aktuell Status
Fas 1 och Fas 2 är i stort sett klara. Applikationen är fullt körbar med:
- 52 komponenter med detaljerade 3D-modeller
- 31 mediatyper, automatiskt mediaval på ~30 portar
- Manuell och auto-koppling av rörledningar
- P&ID-export (SVG)

## Nästa prioriterade steg
1. Spara/ladda processer via LocalStorage
2. Mediakompabilitetskontroll vid koppling
3. Komponentetiketter (tag-nummer) i 3D-vyn
4. Enkel flödessimulering (Fas 3)

## Övrig Information
Detaljerad projektstatus, arbetslogg och komponentöversikt finns i PROGRESS.md