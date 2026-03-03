/**
 * sequences.js - Fördefinierade uppstartssekvenser för Process Builder 3D
 * Varje sekvens har krav på komponenttyper och steg-för-steg instruktioner.
 */

const STARTUP_SEQUENCES = {
    pump_tank_system: {
        name: 'Pump-Tank System',
        description: 'Starta ett grundläggande pump-ventil-tank system steg för steg.',
        icon: '\u2699',
        requiredTypes: ['centrifugal_pump', 'gate_valve', 'storage_tank'],
        steps: [
            {
                instruction: 'Starta simuleringen',
                detail: 'Klicka på "Simulera"-knappen i verktygsfältet för att aktivera simuleringsläget.',
                action: { type: 'start_simulation' },
                targetButton: 'btn-simulate'
            },
            {
                instruction: 'Öppna ventilen till 100%',
                detail: 'Dubbelklicka på slidventilen för att slå på den. Kontrollera att öppningen är 100%.',
                action: { type: 'toggle_running', componentType: 'gate_valve', componentIndex: 0 },
                targetComponent: { type: 'gate_valve', index: 0 }
            },
            {
                instruction: 'Starta pumpen',
                detail: 'Dubbelklicka på centrifugalpumpen för att slå på den.',
                action: { type: 'toggle_running', componentType: 'centrifugal_pump', componentIndex: 0 },
                targetComponent: { type: 'centrifugal_pump', index: 0 }
            },
            {
                instruction: 'Verifiera flöde',
                detail: 'Kontrollera att flödespartiklar rör sig genom rören. Alla komponenter i kedjan måste vara på.',
                action: { type: 'verify_flow' }
            },
            {
                instruction: 'Kontrollera tanknivå',
                detail: 'Välj lagringstanken och kontrollera att nivåparametern visar ett värde över 0%.',
                action: { type: 'check_parameter', componentType: 'storage_tank', componentIndex: 0, param: 'level', condition: 'gt', value: 0 },
                targetComponent: { type: 'storage_tank', index: 0 }
            }
        ]
    },

    heat_exchanger_loop: {
        name: 'Värmeväxlarloop',
        description: 'Starta en enkel värmeväxlarkrets med pump och temperaturkontroll.',
        icon: '\u2194',
        requiredTypes: ['centrifugal_pump', 'heat_exchanger'],
        steps: [
            {
                instruction: 'Starta simuleringen',
                detail: 'Klicka på "Simulera"-knappen för att aktivera simuleringsläget.',
                action: { type: 'start_simulation' },
                targetButton: 'btn-simulate'
            },
            {
                instruction: 'Starta pumpen',
                detail: 'Dubbelklicka på centrifugalpumpen för att starta flödet genom systemet.',
                action: { type: 'toggle_running', componentType: 'centrifugal_pump', componentIndex: 0 },
                targetComponent: { type: 'centrifugal_pump', index: 0 }
            },
            {
                instruction: 'Slå på värmeväxlaren',
                detail: 'Dubbelklicka på värmeväxlaren för att aktivera den.',
                action: { type: 'toggle_running', componentType: 'heat_exchanger', componentIndex: 0 },
                targetComponent: { type: 'heat_exchanger', index: 0 }
            },
            {
                instruction: 'Verifiera flöde',
                detail: 'Kontrollera att flödespartiklar rör sig genom rören mellan pump och värmeväxlare.',
                action: { type: 'verify_flow' }
            },
            {
                instruction: 'Justera temperaturen',
                detail: 'Välj värmeväxlaren och ändra "Varm ut"-parametern till 50°C eller lägre.',
                action: { type: 'set_parameter', componentType: 'heat_exchanger', componentIndex: 0, param: 'hotOut', condition: 'lte', value: 50 },
                targetComponent: { type: 'heat_exchanger', index: 0 }
            }
        ]
    }
};

/**
 * FAULT_SCENARIOS - Fördefinierade felsökningsscenarier
 * Varje scenario injicerar fel som användaren ska diagnostisera och åtgärda.
 */
const FAULT_SCENARIOS = {
    pump_failure_scenario: {
        name: 'Pumpavbrott',
        description: 'Pumpen slutar plötsligt fungera. Identifiera felet, gör nödstopp och återställ systemet.',
        icon: '🔧',
        difficulty: 'Enkel',
        requiredTypes: ['centrifugal_pump', 'storage_tank'],
        requiresPipes: true,
        faults: [
            { type: 'pump_failure', componentType: 'centrifugal_pump', componentIndex: 0, delay: 2 }
        ],
        steps: [
            {
                instruction: 'Starta simuleringen',
                detail: 'Klicka på "Simulera"-knappen för att aktivera simuleringsläget.',
                action: { type: 'start_simulation' },
                targetButton: 'btn-simulate'
            },
            {
                instruction: 'Starta pumpen',
                detail: 'Dubbelklicka på centrifugalpumpen för att starta flödet.',
                action: { type: 'toggle_running', componentType: 'centrifugal_pump', componentIndex: 0 },
                targetComponent: { type: 'centrifugal_pump', index: 0 }
            },
            {
                instruction: 'Identifiera felet',
                detail: 'Pumpen har slutat fungera! Klicka på den felaktiga komponenten (orange glow).',
                action: { type: 'identify_fault', faultType: 'pump_failure' },
                hint: 'Leta efter komponenten som lyser orange/rött.'
            },
            {
                instruction: 'Aktivera nödstopp',
                detail: 'Tryck på NÖDSTOPP-knappen eller Space för att säkra systemet.',
                action: { type: 'emergency_stop' },
                targetButton: 'btn-emergency'
            },
            {
                instruction: 'Återställ nödstoppet',
                detail: 'Klicka "Återställ" i nödstopp-dialogen för att kunna starta om.',
                action: { type: 'reset_emergency' }
            },
            {
                instruction: 'Starta simuleringen igen',
                detail: 'Klicka på "Simulera"-knappen för att starta om systemet.',
                action: { type: 'start_simulation' },
                targetButton: 'btn-simulate'
            },
            {
                instruction: 'Starta pumpen igen',
                detail: 'Dubbelklicka på pumpen för att verifiera att den fungerar igen.',
                action: { type: 'toggle_running', componentType: 'centrifugal_pump', componentIndex: 0 },
                targetComponent: { type: 'centrifugal_pump', index: 0 }
            }
        ]
    },

    valve_stuck_scenario: {
        name: 'Ventil fastnar',
        description: 'En ventil fastnar i stängt läge och blockerar flödet. Hitta och åtgärda problemet.',
        icon: '🔩',
        difficulty: 'Medel',
        requiredTypes: ['centrifugal_pump', 'gate_valve', 'storage_tank'],
        requiresPipes: true,
        faults: [
            { type: 'valve_stuck', componentType: 'gate_valve', componentIndex: 0, delay: 3 }
        ],
        steps: [
            {
                instruction: 'Starta simuleringen',
                detail: 'Klicka på "Simulera"-knappen för att aktivera simuleringsläget.',
                action: { type: 'start_simulation' },
                targetButton: 'btn-simulate'
            },
            {
                instruction: 'Öppna ventilen',
                detail: 'Dubbelklicka på slidventilen för att öppna den.',
                action: { type: 'toggle_running', componentType: 'gate_valve', componentIndex: 0 },
                targetComponent: { type: 'gate_valve', index: 0 }
            },
            {
                instruction: 'Starta pumpen',
                detail: 'Dubbelklicka på centrifugalpumpen för att starta flödet.',
                action: { type: 'toggle_running', componentType: 'centrifugal_pump', componentIndex: 0 },
                targetComponent: { type: 'centrifugal_pump', index: 0 }
            },
            {
                instruction: 'Identifiera problemet',
                detail: 'Ventilen har fastnat stängd! Flödet blockeras. Klicka på den felaktiga ventilen.',
                action: { type: 'identify_fault', faultType: 'valve_stuck' },
                hint: 'Ventilen lyser orange — den har fastnat i stängt läge.'
            },
            {
                instruction: 'Tvinga öppna ventilen',
                detail: 'Välj ventilen och ändra öppningsgraden till minst 50% i egenskapspanelen.',
                action: { type: 'set_parameter', componentType: 'gate_valve', componentIndex: 0, param: 'opening', condition: 'gte', value: 50 },
                targetComponent: { type: 'gate_valve', index: 0 },
                hint: 'Ändra "Öppning" i egenskapspanelen till höger.'
            },
            {
                instruction: 'Verifiera flöde',
                detail: 'Kontrollera att flödespartiklar rör sig genom rören igen.',
                action: { type: 'verify_flow' }
            }
        ]
    },

    pd_pump_failure_scenario: {
        name: 'Kolvpump havererar',
        description: 'En kolvpump stannar under drift. Kolvpumpar används för högtrycksflöden — ett plötsligt stopp kan ge farliga trycktoppar.',
        icon: '⛽',
        difficulty: 'Enkel',
        requiredTypes: ['positive_displacement_pump', 'storage_tank'],
        requiresPipes: true,
        faults: [
            { type: 'pump_failure', componentType: 'positive_displacement_pump', componentIndex: 0, delay: 2 }
        ],
        steps: [
            {
                instruction: 'Starta simuleringen',
                detail: 'Klicka på "Simulera"-knappen för att aktivera simuleringsläget.',
                action: { type: 'start_simulation' },
                targetButton: 'btn-simulate'
            },
            {
                instruction: 'Starta kolvpumpen',
                detail: 'Dubbelklicka på kolvpumpen för att starta flödet.',
                action: { type: 'toggle_running', componentType: 'positive_displacement_pump', componentIndex: 0 },
                targetComponent: { type: 'positive_displacement_pump', index: 0 }
            },
            {
                instruction: 'Identifiera felet',
                detail: 'Kolvpumpen har stannat! Ett plötsligt pumpstopp i ett högtryckssystem kan orsaka trycktoppar uppströms. Klicka på den felaktiga pumpen (orange glow).',
                action: { type: 'identify_fault', faultType: 'pump_failure' },
                hint: 'Kolvpumpen lyser orange — den har havererat.'
            },
            {
                instruction: 'Aktivera nödstopp',
                detail: 'Tryck på NÖDSTOPP för att isolera systemet och förhindra tryckhöjning.',
                action: { type: 'emergency_stop' },
                targetButton: 'btn-emergency'
            },
            {
                instruction: 'Återställ nödstoppet',
                detail: 'Klicka "Återställ" i nödstopp-dialogen när systemet är säkrat.',
                action: { type: 'reset_emergency' }
            },
            {
                instruction: 'Starta simuleringen igen',
                detail: 'Klicka på "Simulera" för att starta om efter kontroll.',
                action: { type: 'start_simulation' },
                targetButton: 'btn-simulate'
            },
            {
                instruction: 'Starta kolvpumpen igen',
                detail: 'Dubbelklicka på kolvpumpen — pumpen är nu utbytt och kan startas.',
                action: { type: 'toggle_running', componentType: 'positive_displacement_pump', componentIndex: 0 },
                targetComponent: { type: 'positive_displacement_pump', index: 0 }
            }
        ]
    },

    control_valve_stuck_scenario: {
        name: 'Reglerventil tappar kontroll',
        description: 'En automatisk reglerventil fastnar i stängt läge och förlorar processkontrollen. Identifiera, manuellt åsidosätt och återställ flödet.',
        icon: '◇',
        difficulty: 'Medel',
        requiredTypes: ['centrifugal_pump', 'control_valve', 'storage_tank'],
        requiresPipes: true,
        faults: [
            { type: 'valve_stuck', componentType: 'control_valve', componentIndex: 0, delay: 3 }
        ],
        steps: [
            {
                instruction: 'Starta simuleringen',
                detail: 'Klicka på "Simulera"-knappen för att aktivera simuleringsläget.',
                action: { type: 'start_simulation' },
                targetButton: 'btn-simulate'
            },
            {
                instruction: 'Öppna reglerventilen',
                detail: 'Dubbelklicka på reglerventilen för att aktivera den.',
                action: { type: 'toggle_running', componentType: 'control_valve', componentIndex: 0 },
                targetComponent: { type: 'control_valve', index: 0 }
            },
            {
                instruction: 'Starta pumpen',
                detail: 'Dubbelklicka på centrifugalpumpen för att starta flödet.',
                action: { type: 'toggle_running', componentType: 'centrifugal_pump', componentIndex: 0 },
                targetComponent: { type: 'centrifugal_pump', index: 0 }
            },
            {
                instruction: 'Identifiera problemet',
                detail: 'Reglerventilen har fastnat stängd! Styrautomatiken har förlorat kontrollen. Klicka på den felaktiga ventilen.',
                action: { type: 'identify_fault', faultType: 'valve_stuck' },
                hint: 'Reglerventilen lyser orange — den har fastnat i stängt läge trots styrsignalen.'
            },
            {
                instruction: 'Manuellt åsidosätt ventilen',
                detail: 'Välj reglerventilen och ändra öppningsgraden till minst 50% i egenskapspanelen. Detta simulerar manuell override av automatiken.',
                action: { type: 'set_parameter', componentType: 'control_valve', componentIndex: 0, param: 'opening', condition: 'gte', value: 50 },
                targetComponent: { type: 'control_valve', index: 0 },
                hint: 'Ändra "Öppning" till minst 50% i egenskapspanelen till höger.'
            },
            {
                instruction: 'Verifiera att flödet återställts',
                detail: 'Kontrollera att flödespartiklar rör sig igen. Reglerventilen är nu manuellt styrd tills automatiken kan repareras.',
                action: { type: 'verify_flow' }
            }
        ]
    },

    overheat_scenario: {
        name: 'Överhettning',
        description: 'Värmeväxlaren överhettas. Identifiera, nödstopp, justera och starta om.',
        icon: '🌡',
        difficulty: 'Svår',
        requiredTypes: ['centrifugal_pump', 'heat_exchanger'],
        requiresPipes: true,
        faults: [
            { type: 'overheat', componentType: 'heat_exchanger', componentIndex: 0, delay: 3 }
        ],
        steps: [
            {
                instruction: 'Starta simuleringen',
                detail: 'Klicka på "Simulera"-knappen för att aktivera simuleringsläget.',
                action: { type: 'start_simulation' },
                targetButton: 'btn-simulate'
            },
            {
                instruction: 'Starta pumpen',
                detail: 'Dubbelklicka på centrifugalpumpen för att starta flödet.',
                action: { type: 'toggle_running', componentType: 'centrifugal_pump', componentIndex: 0 },
                targetComponent: { type: 'centrifugal_pump', index: 0 }
            },
            {
                instruction: 'Slå på värmeväxlaren',
                detail: 'Dubbelklicka på värmeväxlaren för att aktivera den.',
                action: { type: 'toggle_running', componentType: 'heat_exchanger', componentIndex: 0 },
                targetComponent: { type: 'heat_exchanger', index: 0 }
            },
            {
                instruction: 'Identifiera överhettning',
                detail: 'Värmeväxlaren överhettas! Temperaturen rusar. Klicka på den överhettade komponenten.',
                action: { type: 'identify_fault', faultType: 'overheat' },
                hint: 'Komponenten med orange/rött pulserande ljus överhettas.'
            },
            {
                instruction: 'Aktivera nödstopp',
                detail: 'Tryck på NÖDSTOPP-knappen eller Space för att säkra systemet.',
                action: { type: 'emergency_stop' },
                targetButton: 'btn-emergency'
            },
            {
                instruction: 'Återställ nödstoppet',
                detail: 'Klicka "Återställ" i nödstopp-dialogen.',
                action: { type: 'reset_emergency' }
            },
            {
                instruction: 'Sänk temperaturen',
                detail: 'Välj värmeväxlaren och sänk "Varm ut"-temperaturen till 50°C eller lägre.',
                action: { type: 'set_parameter', componentType: 'heat_exchanger', componentIndex: 0, param: 'hotOut', condition: 'lte', value: 50 },
                targetComponent: { type: 'heat_exchanger', index: 0 },
                hint: 'Ändra "Varm ut" i egenskapspanelen.'
            },
            {
                instruction: 'Starta simuleringen igen',
                detail: 'Klicka på "Simulera" för att starta om.',
                action: { type: 'start_simulation' },
                targetButton: 'btn-simulate'
            },
            {
                instruction: 'Starta pumpen',
                detail: 'Dubbelklicka på centrifugalpumpen för att starta flödet.',
                action: { type: 'toggle_running', componentType: 'centrifugal_pump', componentIndex: 0 },
                targetComponent: { type: 'centrifugal_pump', index: 0 }
            },
            {
                instruction: 'Starta värmeväxlaren',
                detail: 'Dubbelklicka på värmeväxlaren för att aktivera den. Temperaturen bör nu vara under kontroll.',
                action: { type: 'toggle_running', componentType: 'heat_exchanger', componentIndex: 0 },
                targetComponent: { type: 'heat_exchanger', index: 0 }
            },
            {
                instruction: 'Verifiera att flödet är återställt',
                detail: 'Kontrollera att partiklar flödar igen. Systemet är nu återstartat under kontrollerade förhållanden.',
                action: { type: 'verify_flow' }
            }
        ]
    }
};

/**
 * GUIDED_EXERCISES - Byggövningar där studenten konstruerar en process från grunden.
 * Nya action-typer: place_component, connect_components.
 */
const GUIDED_EXERCISES = {

    pump_system_build: {
        name: 'Bygg ett pumpsystem',
        description: 'Placera och koppla ihop en pump, en ventil och en lagringstank.',
        icon: '🔧',
        difficulty: 'Enkel',
        isExercise: true,
        steps: [
            {
                instruction: 'Placera en centrifugalpump',
                detail: 'Välj "Centrifugalpump" i komponentbiblioteket (vänster panel) och klicka på arbetsytan för att placera.',
                action: { type: 'place_component', componentType: 'centrifugal_pump', minCount: 1 }
            },
            {
                instruction: 'Placera en slidventil',
                detail: 'Välj "Slidventil" och placera den på arbetsytan — den ska sitta i flödesvägen efter pumpen.',
                action: { type: 'place_component', componentType: 'gate_valve', minCount: 1 }
            },
            {
                instruction: 'Placera en lagringstank',
                detail: 'Välj "Lagringstank" och placera den som slutpunkt i flödet.',
                action: { type: 'place_component', componentType: 'storage_tank', minCount: 1 }
            },
            {
                instruction: 'Koppla pump → ventil',
                detail: 'Klicka på pumpens utport (röd kula) och sedan på ventilens inport (blå kula). Ett rör skapas automatiskt.',
                action: { type: 'connect_components', fromType: 'pump', toType: 'valve' },
                hint: 'Röda kulor = utportar, blå kulor = inportar. Klicka på en röd kula för att börja koppla.'
            },
            {
                instruction: 'Koppla ventil → tank',
                detail: 'Klicka på ventilens utport och sedan på tankens inport.',
                action: { type: 'connect_components', fromType: 'valve', toType: 'tank' },
                hint: 'Om rören inte syns: kontrollera att du klickar exakt på port-kulan (liten sfär).'
            },
            {
                instruction: 'Starta simuleringen',
                detail: 'Klicka på "Simulera" i verktygsfältet. Alla komponenter slås på automatiskt.',
                action: { type: 'start_simulation' }
            },
            {
                instruction: 'Verifiera flöde',
                detail: 'Kontrollera att flödespartiklar rör sig längs rören: pump → ventil → tank.',
                action: { type: 'verify_flow' }
            }
        ]
    },

    distillation_build: {
        name: 'Enkel destillationsenhet',
        description: 'Bygg ett destillationsflöde: pump → processugn → destillationskolumn → produkttankar.',
        icon: '⚗',
        difficulty: 'Medel',
        isExercise: true,
        steps: [
            {
                instruction: 'Placera en centrifugalpump',
                detail: 'Pumpen driver råoljan in i ugnen. Placera den på arbetsytan.',
                action: { type: 'place_component', componentType: 'centrifugal_pump', minCount: 1 }
            },
            {
                instruction: 'Placera en processugn',
                detail: 'Ugnen värmer råoljan till ca 350°C innan destillation. Hitta den under kategorin "Ugnar".',
                action: { type: 'place_component', componentType: 'process_furnace', minCount: 1 }
            },
            {
                instruction: 'Placera en destillationskolumn',
                detail: 'Kolumnen separerar den uppvärmda råoljan i lättare (topp) och tyngre (botten) fraktioner.',
                action: { type: 'place_component', componentType: 'distillation_column', minCount: 1 }
            },
            {
                instruction: 'Placera minst två lagringstankar',
                detail: 'En tank för topprodukten (t.ex. bensin) och en för bottenprodukten (t.ex. residue).',
                action: { type: 'place_component', componentType: 'storage_tank', minCount: 2 }
            },
            {
                instruction: 'Koppla pump → ugn',
                detail: 'Klicka på pumpens utport och sedan på ugnens inport (charge_in).',
                action: { type: 'connect_components', fromType: 'pump', toType: 'furnace' },
                hint: 'Processugnen tar emot via "charge_in". Scrolla för att zooma in och se portar tydligare.'
            },
            {
                instruction: 'Koppla ugn → kolumn',
                detail: 'Klicka på ugnens utport (charge_out) och sedan på kolumnens inport (feed_in).',
                action: { type: 'connect_components', fromType: 'furnace', toType: 'column' },
                hint: 'Processugnen har "charge_out" som utport. Destillationskolumnen tar emot via "feed_in".'
            },
            {
                instruction: 'Koppla kolumn → produkttank',
                detail: 'Koppla kolumnens top_out (lättfraktion) och/eller bottom_out (tungfraktion) till en lagringstank.',
                action: { type: 'connect_components', fromType: 'column', toType: 'tank' },
                hint: 'Kolumnen har top_out och bottom_out. Koppla minst en av dem till en lagringstank.'
            },
            {
                instruction: 'Starta simuleringen',
                detail: 'Klicka "Simulera". Flödet: pump → ugn → kolumn → produkttankar.',
                action: { type: 'start_simulation' }
            },
            {
                instruction: 'Verifiera flöde',
                detail: 'Partiklar flödar genom hela kedjan. Bra — du har byggt en grundläggande destillationsenhet!',
                action: { type: 'verify_flow' }
            }
        ]
    },

    separator_build: {
        name: 'Pump–Värmeväxlare–Separator',
        description: 'Bygg ett separationssystem: pump → värmeväxlare → trefasseparator.',
        icon: '⊜',
        difficulty: 'Medel',
        isExercise: true,
        steps: [
            {
                instruction: 'Placera en centrifugalpump',
                detail: 'Pumpen driver flödet in i systemet.',
                action: { type: 'place_component', componentType: 'centrifugal_pump', minCount: 1 }
            },
            {
                instruction: 'Placera en värmeväxlare',
                detail: 'Värmeväxlaren konditionerar strömmen innan separering. Hitta den under "Värmeöverföring".',
                action: { type: 'place_component', componentType: 'heat_exchanger', minCount: 1 }
            },
            {
                instruction: 'Placera en trefasseparator',
                detail: 'Trefasseparatorn (under "Separering") delar inflödet i gas (topp), olja (mitten) och vatten (botten).',
                action: { type: 'place_component', componentType: 'three_phase_separator', minCount: 1 }
            },
            {
                instruction: 'Koppla pump → värmeväxlare',
                detail: 'Klicka på pumpens utport och sedan på värmeväxlarens inport.',
                action: { type: 'connect_components', fromType: 'pump', toType: 'heat_exchanger' },
                hint: 'Värmeväxlaren har "tube_in" och "shell_in" som inportar. Koppla pumpen till en av dem.'
            },
            {
                instruction: 'Koppla värmeväxlare → separator',
                detail: 'Klicka på värmeväxlarens utport och sedan på separatorns inport (feed_in).',
                action: { type: 'connect_components', fromType: 'heat_exchanger', toType: 'separator' },
                hint: 'Välj "tube_out" eller "shell_out" från värmeväxlaren → separatorns "feed_in".'
            },
            {
                instruction: 'Starta simuleringen',
                detail: 'Klicka "Simulera" för att se hur flödet delas i tre faser i separatorn.',
                action: { type: 'start_simulation' }
            },
            {
                instruction: 'Verifiera flöde',
                detail: 'Partiklar ska röra sig pump → värmeväxlare → separator. I simuleringsgrafen delas flödet 30% gas / 40% olja / 30% vatten.',
                action: { type: 'verify_flow' }
            }
        ]
    }
};

/**
 * FURNACE_CONFIG — Kundspecifika processvärden för ugnsläromodulen.
 * Ändra dessa värden för att anpassa modulen till en specifik anläggning.
 * Alla värden nedan är generiska standardvärden.
 */
const FURNACE_CONFIG = {
    purgeDurationSec:   30,     // Minsta urångningstid med ånga (sekunder)
    ignitePressure:    '0,4',   // Trycksättningstryck via TSO-ventil (bar)
    operatingDraft:    '−2',    // Målvärde för eldstadens undertryck (mmH₂O)
};

/**
 * FURNACE_SCENARIOS - Interaktiva läromoduler för ugnsuppstart.
 * Använder furnace_interact / furnace_verify / furnace_ccr / furnace_timer action-typer.
 * Scenario-preload placerar ugn + V-XXX4 automatiskt på arbetsytan.
 */
const FURNACE_SCENARIOS = {
    furnace_startup: {
        name: 'Uppstart ugn F-XXX1 — Sektion A',
        description: 'Steg-för-steg tändning av sektion A i självdragsugnen F-XXX1. Inkl. förberedelse, ångvädring av eldstaden, tändning av pilotrör och successiv öppning av brännare A1–A6.',
        icon: '🔥',
        difficulty: 'Avancerad',
        isFurnaceScenario: true,
        preload: {
            components: [
                { type: 'furnace_training', id: 1, x: 0,  z: 0, rotation: 0 },
                { type: 'v_xxx4_drum',      id: 2, x: 6.5, z: 2.8, rotation: 0 }
            ],
            pipes: []
        },
        steps: [
            // =========================================================
            // FAS 1 — FÖRBEREDELSER (steg 1–3)
            // =========================================================
            {
                instruction: '[FAS 1] Verifiera TSO_AA stängd',
                detail: 'Sektion A: Kontrollera att TSO_AA (drift-ventil, sektion A) är i stängt läge. Klicka på TSO_AA för att bekräfta.',
                action: { type: 'furnace_verify', componentType: 'furnace_training', key: 'TSO_AA', expectedState: 'closed' }
            },
            {
                instruction: '[FAS 1] Verifiera TSO_AB stängd',
                detail: 'Kontrollera att TSO_AB (standby-ventil, sektion A) är stängd. Klicka på TSO_AB för att bekräfta.',
                action: { type: 'furnace_verify', componentType: 'furnace_training', key: 'TSO_AB', expectedState: 'closed' }
            },
            {
                instruction: '[FAS 1] Verifiera kikventiler sektion A stängda',
                detail: 'Kontrollera att alla 6 brännarkikventiler (KIKV_A1–A6) i sektion A är stängda. Klicka på KIKV_A1 för att bekräfta kontrollen.',
                action: { type: 'furnace_verify', componentType: 'furnace_training', key: 'KIKV_A1', expectedState: 'closed' }
            },

            // =========================================================
            // FAS 2 — VÄDRING / ÅNGURÅNGNING (steg 4–13)
            // =========================================================
            {
                instruction: '[FAS 2] Öppna rökgasspjäll (FLUE_DAMPER)',
                detail: 'Öppna rökgasspjället för att möjliggöra naturlig ventilation av ugnen. Klicka på handvinschen (trumman) vid skorstenens bas (höger sida) eller på motviktsblocket vid skorstenens spjäll.',
                action: { type: 'furnace_interact', componentType: 'furnace_training', key: 'FLUE_DAMPER', targetState: 'open' }
            },
            {
                instruction: '[FAS 2] Öppna primärluftregister sektion A',
                detail: 'Öppna PRIM_AIR_A för att tillåta luft in i sektion A. Klicka på det vänstra luftregistret (vänster rektangel nedtill i sektion A).',
                action: { type: 'furnace_interact', componentType: 'furnace_training', key: 'PRIM_AIR_A', targetState: 'open' }
            },
            {
                instruction: '[FAS 2] Öppna sekundärluftregister sektion A',
                detail: 'Öppna SEC_AIR_A (höger luftregister i sektion A) för att ge tillräckligt med förbränningsluft.',
                action: { type: 'furnace_interact', componentType: 'furnace_training', key: 'SEC_AIR_A', targetState: 'open' }
            },
            {
                instruction: '[FAS 2] Starta ångurångning (STEAM)',
                detail: 'Öppna ångtillförseln (STEAM) för att påbörja urångning av ugnen. Klicka på ångnozzeln (höger sida av ugnen).',
                action: { type: 'furnace_interact', componentType: 'furnace_training', key: 'STEAM', targetState: 'on' }
            },
            {
                instruction: '[FAS 2] Meddela CCR — logga starttid',
                detail: 'Kontakta CCR (Central Control Room) och meddela att urångning påbörjats. Klicka på CCR-knappen nedan för att logga starttiden.',
                action: { type: 'furnace_ccr', componentType: 'furnace_training', ccrKey: 'CCR_LOGGED', ccrMessage: 'Meddela CCR om urångningsstart och be dem logga klocktiden.' }
            },
            {
                instruction: '[FAS 2] Kontrollera V-XXX4 (bränslegastrumman)',
                detail: 'Kontrollera att bränslegastrumman V-XXX4 inte innehåller kondensatansamling. Klicka på nivåindikatorn (gul rektangel på sidan av V-XXX4).',
                action: { type: 'furnace_verify', componentType: 'v_xxx4_drum', key: 'V_XXX4_INSPECT', expectedState: false }
            },
            {
                instruction: '[FAS 2] Öppna dräneringsventil V-XXX4 (dränera till fackla)',
                detail: 'Öppna DRAIN_V_XXX4 för att dränera eventuellt kondensat ur bränslegastrumman till facklan. Klicka på den orange ventilen nedtill på V-XXX4.',
                action: { type: 'furnace_interact', componentType: 'v_xxx4_drum', key: 'DRAIN_V_XXX4', targetState: 'open' }
            },
            {
                instruction: '[FAS 2] Stäng dräneringsventil V-XXX4',
                detail: 'Stäng DRAIN_V_XXX4 när kondensatet är tömt. Klicka på dräneringsventilen igen för att stänga den.',
                action: { type: 'furnace_interact', componentType: 'v_xxx4_drum', key: 'DRAIN_V_XXX4', targetState: 'closed' }
            },
            {
                instruction: '[FAS 2] Invänta urångning (se driftinstruktion)',
                detail: 'Vänta tills ugnen är ordentligt vädrad. Minsta urångningstid med ånga aktiv ska ha gått enligt anläggningens driftinstruktion. Bekräfta när urångningen är klar.',
                action: { type: 'furnace_ccr', componentType: 'furnace_training', ccrKey: 'PURGE_ACKNOWLEDGED', buttonLabel: '✓ Urångning klar', ccrMessage: 'Bekräfta att urångningstiden har uppfyllts och att ugnen är fri från explosiv gas.' }
            },
            {
                instruction: '[FAS 2] Gasprov — kontrollera brännare A1',
                detail: 'Ta gasprov vid brännare A1 för att verifiera att ingen explosiv gas finns kvar. Klicka på det grå brännarröret (BURNER_A1) på undersidan av ugnen i sektion A.',
                action: { type: 'furnace_verify', componentType: 'furnace_training', key: 'BURNER_A1', expectedState: false }
            },

            // =========================================================
            // FAS 3 — TÄNDNING SEKTION A (steg 14–24)
            // =========================================================
            {
                instruction: '[FAS 3] CCR — bekräfta manuell bränsleblockering',
                detail: 'Be CCR bekräfta att bränslegasreglerventilen är i manuellt läge och stängd. Klicka CCR-knappen nedan när bekräftelse erhållits.',
                action: { type: 'furnace_ccr', componentType: 'furnace_training', ccrKey: 'CCR_FUEL_MANUAL', ccrMessage: 'Vänta på CCR-bekräftelse: bränslegasreglerventil i manuellt läge och stängd.' }
            },
            {
                instruction: '[FAS 3] Öppna BLEED-ventil sektion A (lufta bränslegas)',
                detail: 'Öppna Bleed A-ventilen på sektionens distributionsledning för att lufta ut eventuell kvarvarande gas innan brännarna tänds. Klicka på Bleed A-ventilen (orange, vänster ände av sektion A:s bränsleledning).',
                action: { type: 'furnace_interact', componentType: 'furnace_training', key: 'BLEED_A', targetState: 'open' }
            },
            {
                instruction: '[FAS 3] Tänd pilotrör sektion A',
                detail: 'Tänd tändbrännare A (PILOT_A). Tändbrännaren är en fristående portabel enhet bredvid brännare A1. Öppna gasoltubens ventil och slå på strömmen — klicka på PILOT_A (orange gasoltub eller tändhuvud bredvid brännare A1).',
                action: { type: 'furnace_interact', componentType: 'furnace_training', key: 'PILOT_A', targetState: 'lit' }
            },
            {
                instruction: '[FAS 3] CCR — trycksätt sektion A via TSO_AA',
                detail: 'Be CCR öppna TSO_AA (drift-ventil sektion A) till specificerat trycksättningstryck för att trycksätta bränsleledan till sektion A. Klicka CCR-knappen nedan.',
                action: { type: 'furnace_ccr', componentType: 'furnace_training', ccrKey: 'CCR_PRESSURIZE_A', updatesState: { TSO_AA: 'open' }, ccrMessage: 'Be CCR öppna TSO_AA till specificerat trycksättningstryck. Vänta på bekräftelse att trycket är stabilt.', interlock: { key: 'PILOT_A', requiredState: 'lit', failMessage: 'PILOT_A ej tänd — tänd piloten innan TSO_AA öppnas' } }
            },
            {
                instruction: '[FAS 3] Vänta — trycksättning sektion A (FUEL_PRESSURE ≥ 0.20 bar g)',
                detail: 'TSO_AA är nu öppnad av CCR. Vänta tills bränsleledningens tryck stabiliserat sig till minst 0.20 bar g innan brännarna öppnas. Steget avanceras automatiskt — följ instrumentpanelen.',
                action: { type: 'furnace_wait_pv', pvKey: 'FUEL_PRESSURE', pvMin: 0.20, pvLabel: 'Bränslegastryck', pvUnit: 'bar g' }
            },
            {
                instruction: '[FAS 3] Öppna brännare A1 (KIKV_A1)',
                detail: 'Öppna kikventil KIKV_A1 för att tända brännare 1 i sektion A. Klicka på KIKV_A1.',
                action: { type: 'furnace_interact', componentType: 'furnace_training', key: 'KIKV_A1', targetState: 'open', interlock: { pvKey: 'FUEL_PRESSURE', pvMin: 0.05, failMessage: 'Bränslegastryck för lågt — vänta tills trycket ≥ 0.05 bar g (se instrumentpanelen)' } }
            },
            {
                instruction: '[FAS 3] Öppna brännare A2 (KIKV_A2)',
                detail: 'Öppna kikventil KIKV_A2 för brännare 2 i sektion A. Klicka på KIKV_A2.',
                action: { type: 'furnace_interact', componentType: 'furnace_training', key: 'KIKV_A2', targetState: 'open' }
            },
            {
                instruction: '[FAS 3] Öppna brännare A3 (KIKV_A3)',
                detail: 'Öppna kikventil KIKV_A3 för brännare 3. Nu är 3 brännare aktiva i sektion A.',
                action: { type: 'furnace_interact', componentType: 'furnace_training', key: 'KIKV_A3', targetState: 'open' }
            },
            {
                instruction: '[FAS 3] Stäng BLEED-ventil sektion A (3 brännare aktiva)',
                detail: 'Med 3 brännare tända i sektion A, stäng nu BLEED_A-ventilen. Klicka på BLEED_A för att stänga den.',
                action: { type: 'furnace_interact', componentType: 'furnace_training', key: 'BLEED_A', targetState: 'closed' }
            },
            {
                instruction: '[FAS 3] Öppna brännare A4 (KIKV_A4)',
                detail: 'Öppna KIKV_A4 för brännare 4 i sektion A.',
                action: { type: 'furnace_interact', componentType: 'furnace_training', key: 'KIKV_A4', targetState: 'open' }
            },
            {
                instruction: '[FAS 3] Öppna brännare A5 (KIKV_A5)',
                detail: 'Öppna KIKV_A5 för brännare 5 i sektion A.',
                action: { type: 'furnace_interact', componentType: 'furnace_training', key: 'KIKV_A5', targetState: 'open' }
            },
            {
                instruction: '[FAS 3] Öppna brännare A6 — sektion A klar',
                detail: 'Öppna KIKV_A6 för brännare 6. Alla 6 brännare i sektion A är nu aktiva och ugnen är i drift!',
                action: { type: 'furnace_interact', componentType: 'furnace_training', key: 'KIKV_A6', targetState: 'open' }
            },

            // =========================================================
            // FAS 4 — NORMAL DRIFT (steg 25–26)
            // =========================================================
            {
                instruction: '[FAS 4] Justera primärluft sektion A',
                detail: 'Justera PRIM_AIR_A för optimal förbränning. Klicka på PRIM_AIR_A för att sätta den i justerat driftläge.',
                action: { type: 'furnace_interact', componentType: 'furnace_training', key: 'PRIM_AIR_A', targetState: 'adjusted' }
            },
            {
                instruction: '[FAS 4] Finjustera rökgasspjäll — driftläge',
                detail: 'Finjustera rökgasspjällets öppning för att uppnå angivet undertryck i eldstaden (se driftinstruktion). Klicka på handvinschen eller motviktsblocket vid skorstensspjället. Sektion A är nu i normal drift!',
                action: { type: 'furnace_interact', componentType: 'furnace_training', key: 'FLUE_DAMPER', targetState: 'adjusted' }
            }
        ]
    }
};
