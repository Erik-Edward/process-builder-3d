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
                instruction: 'Starta pumpen och värmeväxlaren',
                detail: 'Dubbelklicka på pumpen och värmeväxlaren för att starta systemet igen.',
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
