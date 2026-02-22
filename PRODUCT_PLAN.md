# Process Builder 3D – Produktplan och Kommersialiseringsstrategi

> Senast uppdaterad: 2026-02-23

---

## 1. Produktöversikt

**Process Builder 3D** är ett interaktivt 3D-verktyg för att bygga, visualisera och simulera processanläggningar (raffinaderier, petrokemisk industri). Användaren placerar komponenter (pumpar, ventiler, kolonner, ugnar, tankar) i en 3D-miljö och kopplar ihop dem – precis som i verkligheten.

### Kärnvärde
- **Lär sig genom att göra** – studenten/operatören bygger processen med egna händer istället för att titta på statiska P&ID-ritningar
- **Omedelbar visuell feedback** – ser direkt om en koppling är rätt eller fel
- **Branschspecifika komponenter** – färdiga 3D-modeller av utrustning som faktiskt används i raffinerier och petrokemiska anläggningar

---

## 2. Målgrupper

### Primär 1 – Petrokemiska industrier (in-house utbildning)
Stora raffinaderier och petrokemiska anläggningar med egna utbildningsprogram för:
- Operatörer (nyutbildade + recertifiering)
- Process- och underhållsingenjörer
- HSE-personal som ska förstå processflöden

**Deras behov:**
- Kan köras offline / på stängt intranät (air-gapped nätverk)
- Skräddarsys med anläggningsspecifika komponenter
- Ingen extern cloud (av säkerhetsskäl)
- Enkelt att administrera utan IT-avdelning

### Primär 2 – Industriell utbildning (in-house)
Industriföretag som utbildar egna operatörer och ingenjörer utanför raffinaderiet – t.ex. via interna training centers.

**Deras behov:**
- Tillgängligt från alla datorer på intranätet
- Centralt administrerat
- Möjlighet att spara och dela utbildningsscenarier

---

## 3. Produktvarianter och Driftsättning

Verktyget är tekniskt sett en **statisk webbapplikation** (HTML + JavaScript + Three.js). Det gör att samma kodbas kan paketeras på tre sätt utan att ändra kärnan.

---

### Variant A – Lokalt Program (Desktop)
**Teknologi:** [Electron](https://www.electronjs.org/) – en Node.js-wrapper som paketerar webbappen till en körbar `.exe` (Windows) eller motsvarande (Linux/macOS).

**Passar:** Individuella licenser, offline-krav, air-gapped anläggningar

**Egenskaper:**
- Installeras som ett vanligt Windows-program (`setup.exe`)
- Kräver ingen internet-anslutning efter installation
- Sparar processer lokalt (LocalStorage / JSON-filer)
- Enkel uppdatering via ny installationsfil
- Fungerar på industriella datorer utan administratörsrättigheter (portable version)

**Packaging:**
```
ProcessBuilder3D-Setup-v1.2.exe       ← installationsversion
ProcessBuilder3D-Portable-v1.2.zip   ← portable, kräver ingen installation
```

**Teknisk insats för Electron-wrapper:** 1–2 dagars arbete (standard Electron boilerplate + ikoner + installer-konfiguration med NSIS/electron-builder).

---

### Variant B – Intranätsserver
**Teknologi:** En enkel webbserver (nginx eller Apache) som serverar de statiska filerna. Alternativt en **Docker-container** för ännu enklare driftsättning.

**Passar:** Avdelningar och training centers som vill ge tillgång till alla datorer på nätverket

**Egenskaper:**
- Användare öppnar `http://processbuilder.company.internal/` i sin vanliga webbläsare
- Ingen programinstallation på varje dator
- Central administration (uppdatera servern = alla får ny version direkt)
- Processer sparas per användare i webbläsarens LocalStorage (eller framtida server-backend)
- Kan konfigureras med LDAP/AD-inloggning (framtida tillägg)

**Packaging:**
```
processbuilder3d-server-v1.2.tar.gz    ← nginx-konfiguration + applikationsfiler
processbuilder3d-docker-v1.2.tar       ← Docker-image, driftsätt med en rad:
                                           docker run -p 80:80 processbuilder3d:1.2
```

**Teknisk insats för Docker-packaging:** < 1 dag (Dockerfile med nginx + COPY av statiska filer).

---

### Variant C – Molnbaserat / SaaS (framtida)
**Teknologi:** Hostad version på Azure / AWS med autentisering.

**Passar:** Konsultbolag, mindre utbildningsorganisationer, pilotprojekt

**Status:** Ej prioriterat i nuläget. Kräver back-end för användarhantering och molnlagring av processer. Planeras i en framtida version när lokalt- och intranätvarianterna är mogna.

---

## 4. Licensmodell

### Grundprincip: Engångslicens + Underhållsavtal

| Licenselement | Beskrivning |
|---|---|
| **Baslic ens (engångskostnad)** | Rätt att använda programvaran på ett definierat antal användare/maskiner/site |
| **Underhållsavtal (årsvis)** | Tillgång till uppdateringar, nya komponenter, buggfixar och support |
| **Utan underhållsavtal** | Kunden behåller nuvarande version men får inga uppdateringar |

### Licensnivåer

| Nivå | Passar | Användare | Variants |
|---|---|---|---|
| **Site License** | En anläggning/site | Obegränsat inom siten | A (lokal) eller B (intranät) |
| **Enterprise License** | Hela organisationen | Obegränsat, alla anläggningar | B (intranät) + central admin |
| **Pilotlicens** | Utvärdering | 5 användare, 3 månader | A (lokal) |

### Prisintervall (riktmärken)

> Exakta priser sätts i samråd med marknaden. Dessa är riktlinjer baserade på jämförbara industriutbildningsverktyg.

| Licensnivå | Engångskostnad | Underhållsavtal/år |
|---|---|---|
| Pilotlicens | Gratis eller symbolisk | — |
| Site License | 150 000 – 400 000 SEK | 20–30% av licenskostnad |
| Enterprise License | 500 000 – 1 200 000 SEK | 20–30% av licenskostnad |

**Tilläggstjänster (arvodesbaserade):**
- Skräddarsydda komponenter för kundens specifika anläggning
- Färdiga utbildningsscenarier (t.ex. "Starta upp HDS-enheten")
- On-site utbildning och implementation

---

## 5. Teknisk Roadmap mot Säljbar Version

Nuläge är en funktionell prototyp. Nedan beskrivs vad som behöver adderas för en säljbar v1.0.

### Fas A – Kärnfunktioner (pågår)
- [x] 52 komponenter med 3D-modeller
- [x] 31 mediatyper + automatiskt mediaval
- [x] Kopplingslogik + P&ID-export
- [ ] **Spara/ladda processer** (Steg 1 – pågår nu)
- [ ] Komponentetiketter i 3D (taggnummer)
- [ ] Mediakompabilitetskontroll

### Fas B – Utbildningsfunktioner
- [ ] Guidade övningar / scenarion (fördefinierade uppgifter)
- [ ] Enkel flödessimulering (animerade pilar, on/off)
- [ ] Uppstartssekvenser steg-för-steg

### Fas C – Produktifiering
- [ ] Electron-wrapper (Variant A – lokal app)
- [ ] Docker-packaging (Variant B – intranät)
- [ ] Splash screen, om-dialog, licenshantering
- [ ] Inbyggd hjälp / dokumentation
- [ ] Installationspaket och release-pipeline

### Fas D – Marknadsintroduktion
- [ ] Pilotprojekt med 1–2 industripartners (gratis/symbolisk kostnad)
- [ ] Referenscase och testimonials
- [ ] Säljmaterial (produktblad, demo-video, webbsida)
- [ ] Prissättning validerad mot marknaden

---

## 6. Konkurrensanalys (kort)

| Konkurrent | Typ | Begränsning jämfört med Process Builder 3D |
|---|---|---|
| AspenTech HYSYS | Simuleringsprogramvara | Inte ett pedagogiskt byggverktyg; komplex, dyr |
| Aveva P&ID | P&ID-ritning | 2D-ritning, inte interaktivt 3D |
| Interna PowerPoint/ritningar | Statiskt material | Ingen interaktivitet alls |
| Unity/VR-simulatorer | Spelmotor-baserat | Extremt dyrt att producera, kräver specialhårdvara |

**Vår nisch:** Enkelt, branschspecifikt, interaktivt 3D-verktyg som körs i webbläsaren utan specialinstallation.

---

## 7. Go-to-Market (prioritet)

1. **Pilotpartner** – Identifiera ett raffineringsföretag med eget training center. Erbjud gratis pilotlicens mot feedback och referens.
2. **Branschkonferenser** – Presentera på t.ex. SPPF, nordiska petrokemiska mässor.
3. **Direktförsäljning** – Kontakta HSE/utbildningsansvariga på Preem, St1, Nynas, Borealis etc.
4. **Konsultpartner** – Samarbeta med EPC-bolag eller utbildningskonsulter som kan sälja vidare.
