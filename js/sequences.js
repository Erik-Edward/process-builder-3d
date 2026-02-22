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
