/**
 * media.js - Mediadefinitioner för Process Builder 3D
 * Definierar alla medietyper med färg, fas, egenskaper och faroklassning.
 */

const MEDIA_DEFINITIONS = {
    // --- Kolväten (råmaterial & produkter) ---
    straight_run_gasoline: {
        name: 'Straight-run bensin',
        shortName: 'SR-bensin',
        phase: 'liquid',
        category: 'Kolväten',
        color: 0x8bc34a,       // grön
        hazard: 'flammable',
        description: 'Rå bensinfraktion direkt från råoljadestillation',
        properties: {
            density: { value: 720, unit: 'kg/m³' },
            boilingRange: { value: '30-200', unit: '°C' },
            viscosity: { value: 0.5, unit: 'cP' }
        }
    },
    cracked_gasoline: {
        name: 'Krackad bensin',
        shortName: 'Kr. bensin',
        phase: 'liquid',
        category: 'Kolväten',
        color: 0x9ccc65,
        hazard: 'flammable',
        description: 'Bensinfraktion från krackningsprocess, innehåller olefiner',
        properties: {
            density: { value: 740, unit: 'kg/m³' },
            boilingRange: { value: '30-210', unit: '°C' },
            sulfur: { value: 1500, unit: 'ppm' }
        }
    },
    raw_gasoline: {
        name: 'Råbensin',
        shortName: 'Råbensin',
        phase: 'liquid',
        category: 'Kolväten',
        color: 0x7cb342,
        hazard: 'flammable',
        description: 'Avsvavlad men ej stabiliserad bensin',
        properties: {
            density: { value: 710, unit: 'kg/m³' },
            pressure: { value: 4.5, unit: 'barg' }
        }
    },
    whole_gasoline: {
        name: 'Helbensin',
        shortName: 'Helbensin',
        phase: 'liquid',
        category: 'Kolväten',
        color: 0x4caf50,
        hazard: 'flammable',
        description: 'Stabiliserad avsvavlad bensin (bottenprodukt från stabiliserare)',
        properties: {
            density: { value: 730, unit: 'kg/m³' },
            sulfur: { value: 10, unit: 'ppm' }
        }
    },
    light_gasoline: {
        name: 'Lättbensin',
        shortName: 'Lättbensin',
        phase: 'liquid',
        category: 'Kolväten',
        color: 0x66bb6a,
        hazard: 'flammable',
        description: 'Lätt bensinfraktion till 500/600-anläggningen',
        properties: {
            density: { value: 660, unit: 'kg/m³' },
            boilingRange: { value: '30-100', unit: '°C' }
        }
    },
    heavy_gasoline: {
        name: 'Tungbensin',
        shortName: 'Tungbensin',
        phase: 'liquid',
        category: 'Kolväten',
        color: 0x2e7d32,
        hazard: 'flammable',
        description: 'Tung bensinfraktion till reformering (1800-anl.)',
        properties: {
            density: { value: 770, unit: 'kg/m³' },
            boilingRange: { value: '100-200', unit: '°C' }
        }
    },
    lpg: {
        name: 'LPG',
        shortName: 'LPG',
        phase: 'liquid',
        category: 'Kolväten',
        color: 0xff9800,
        hazard: 'flammable',
        description: 'Flytande petroleumgas (propan/butan)',
        properties: {
            density: { value: 550, unit: 'kg/m³' },
            boilingRange: { value: '-42 till 0', unit: '°C' },
            pressure: { value: 15, unit: 'barg' }
        }
    },
    crude_oil: {
        name: 'Råolja',
        shortName: 'Råolja',
        phase: 'liquid',
        category: 'Kolväten',
        color: 0x3e2723,
        hazard: 'flammable',
        description: 'Obehandlad råolja',
        properties: {
            density: { value: 850, unit: 'kg/m³' },
            viscosity: { value: 10, unit: 'cP' }
        }
    },
    diesel: {
        name: 'Diesel',
        shortName: 'Diesel',
        phase: 'liquid',
        category: 'Kolväten',
        color: 0x795548,
        hazard: 'flammable',
        description: 'Dieselfraktion',
        properties: {
            density: { value: 840, unit: 'kg/m³' },
            boilingRange: { value: '200-350', unit: '°C' }
        }
    },
    kerosene: {
        name: 'Fotogen/Jet fuel',
        shortName: 'Fotogen',
        phase: 'liquid',
        category: 'Kolväten',
        color: 0xa1887f,
        hazard: 'flammable',
        description: 'Fotogen-/jetbränslefraktion',
        properties: {
            density: { value: 800, unit: 'kg/m³' },
            boilingRange: { value: '150-250', unit: '°C' }
        }
    },
    residue: {
        name: 'Restolja',
        shortName: 'Restolja',
        phase: 'liquid',
        category: 'Kolväten',
        color: 0x212121,
        hazard: 'flammable',
        description: 'Tung restolja/bottenfraktion',
        properties: {
            density: { value: 950, unit: 'kg/m³' },
            viscosity: { value: 500, unit: 'cP' }
        }
    },

    // --- Gaser ---
    hydrogen: {
        name: 'Vätgas',
        shortName: 'H₂',
        phase: 'gas',
        category: 'Gaser',
        color: 0x81d4fa,
        hazard: 'flammable',
        description: 'Vätgas för hydrobehandling',
        properties: {
            pressure: { value: 30, unit: 'barg' },
            purity: { value: 90, unit: 'mol%' }
        }
    },
    hydrogen_sulfide: {
        name: 'Vätesulfid',
        shortName: 'H₂S',
        phase: 'gas',
        category: 'Gaser',
        color: 0xffeb3b,
        hazard: 'toxic',
        description: 'Giftig sur gas, bildas vid avsvavling',
        properties: {
            density: { value: 1.36, unit: 'kg/m³' },
            toxicity: { value: 'Mycket giftig', unit: '' }
        }
    },
    fuel_gas: {
        name: 'Bränngas',
        shortName: 'Bränngas',
        phase: 'gas',
        category: 'Gaser',
        color: 0xef5350,
        hazard: 'flammable',
        description: 'Blandning av lätta kolväten för förbränning',
        properties: {
            pressure: { value: 3.5, unit: 'barg' },
            heatValue: { value: 46, unit: 'MJ/kg' }
        }
    },
    recycle_gas: {
        name: 'Recirkulationsgas',
        shortName: 'Rec. gas',
        phase: 'gas',
        category: 'Gaser',
        color: 0x4fc3f7,
        hazard: 'flammable',
        description: 'Recirkulerad vätgasrik gas i HDS-loop',
        properties: {
            pressure: { value: 30, unit: 'barg' },
            h2Content: { value: 75, unit: 'mol%' }
        }
    },
    flare_gas: {
        name: 'Fackelgas',
        shortName: 'Fackelgas',
        phase: 'gas',
        category: 'Gaser',
        color: 0xff7043,
        hazard: 'flammable',
        description: 'Gas till fackelsystem vid nöd/avlastning',
        properties: {}
    },
    flue_gas: {
        name: 'Rökgas',
        shortName: 'Rökgas',
        phase: 'gas',
        category: 'Gaser',
        color: 0x90a4ae,
        hazard: 'none',
        description: 'Förbränningsrökgas från ugnar och pannor till centralskorsten',
        properties: {
            temp: { value: 160, unit: '°C' },
            o2:   { value: 3,   unit: '%' }
        }
    },

    // --- Tvåfas ---
    two_phase_hc: {
        name: 'Tvåfas (gas+vätska)',
        shortName: 'Tvåfas',
        phase: 'two_phase',
        category: 'Blandningar',
        color: 0xaed581,
        hazard: 'flammable',
        description: 'Blandning av gas- och vätskefas kolväten + vätgas',
        properties: {
            pressure: { value: 30, unit: 'barg' },
            temp: { value: 300, unit: '°C' }
        }
    },

    // --- Kemikalier ---
    amine_lean: {
        name: 'Amin (mager)',
        shortName: 'Mager amin',
        phase: 'liquid',
        category: 'Kemikalier',
        color: 0xce93d8,
        hazard: 'corrosive',
        description: 'Renad aminlösning (MEA/DEA) för H₂S-absorption',
        properties: {
            concentration: { value: 30, unit: 'vikt%' },
            density: { value: 1020, unit: 'kg/m³' }
        }
    },
    amine_rich: {
        name: 'Amin (rik)',
        shortName: 'Rik amin',
        phase: 'liquid',
        category: 'Kemikalier',
        color: 0xab47bc,
        hazard: 'toxic',
        description: 'H₂S-mättad aminlösning',
        properties: {
            h2sLoading: { value: 0.4, unit: 'mol/mol' },
            density: { value: 1040, unit: 'kg/m³' }
        }
    },
    caustic: {
        name: 'Natronlut',
        shortName: 'NaOH',
        phase: 'liquid',
        category: 'Kemikalier',
        color: 0xf48fb1,
        hazard: 'corrosive',
        description: 'Natriumhydroxidlösning för neutralisering',
        properties: {
            concentration: { value: 10, unit: 'vikt%' }
        }
    },

    // --- Vatten & avfall ---
    sour_water: {
        name: 'Survatten',
        shortName: 'Survatten',
        phase: 'liquid',
        category: 'Vatten',
        color: 0xfdd835,
        hazard: 'toxic',
        description: 'Vatten med löst H₂S, skickas till survattenstripper',
        properties: {
            h2sContent: { value: 5000, unit: 'ppm' },
            pH: { value: 4, unit: '' }
        }
    },
    cooling_water: {
        name: 'Kylvatten',
        shortName: 'Kylvatten',
        phase: 'liquid',
        category: 'Vatten',
        color: 0x29b6f6,
        hazard: 'none',
        description: 'Cirkulerande kylvatten',
        properties: {
            tempSupply: { value: 28, unit: '°C' },
            tempReturn: { value: 40, unit: '°C' }
        }
    },
    boiler_feed_water: {
        name: 'Matarvatten',
        shortName: 'BFW',
        phase: 'liquid',
        category: 'Vatten',
        color: 0x0288d1,
        hazard: 'none',
        description: 'Avjoniserat matarvatten till ångpannor',
        properties: {
            conductivity: { value: 0.5, unit: 'µS/cm' }
        }
    },
    process_water: {
        name: 'Processvatten',
        shortName: 'Processvatten',
        phase: 'liquid',
        category: 'Vatten',
        color: 0x4dd0e1,
        hazard: 'none',
        description: 'Vatten för processbehov',
        properties: {}
    },

    // --- Utilities ---
    steam_hp: {
        name: 'Högtrycksånga',
        shortName: 'HP-ånga',
        phase: 'gas',
        category: 'Utilities',
        color: 0xeceff1,
        hazard: 'none',
        description: 'Högtrycksånga (~40 barg)',
        properties: {
            pressure: { value: 40, unit: 'barg' },
            temp: { value: 400, unit: '°C' }
        }
    },
    steam_mp: {
        name: 'Medeltrycksånga',
        shortName: 'MP-ånga',
        phase: 'gas',
        category: 'Utilities',
        color: 0xcfd8dc,
        hazard: 'none',
        description: 'Medeltrycksånga (~10 barg)',
        properties: {
            pressure: { value: 10, unit: 'barg' },
            temp: { value: 200, unit: '°C' }
        }
    },
    steam_lp: {
        name: 'Lågtrycksånga',
        shortName: 'LP-ånga',
        phase: 'gas',
        category: 'Utilities',
        color: 0xb0bec5,
        hazard: 'none',
        description: 'Lågtrycksånga (~3.5 barg)',
        properties: {
            pressure: { value: 3.5, unit: 'barg' },
            temp: { value: 150, unit: '°C' }
        }
    },
    instrument_air: {
        name: 'Instrumentluft',
        shortName: 'IA',
        phase: 'gas',
        category: 'Utilities',
        color: 0x90caf9,
        hazard: 'none',
        description: 'Torr, oljefri tryckluft för instrument och ställdon',
        properties: {
            pressure: { value: 6, unit: 'barg' },
            dewPoint: { value: -40, unit: '°C' }
        }
    },
    nitrogen: {
        name: 'Kvävgas',
        shortName: 'N₂',
        phase: 'gas',
        category: 'Utilities',
        color: 0x90a4ae,
        hazard: 'none',
        description: 'Inert gas för spolning och blanketing',
        properties: {
            pressure: { value: 8, unit: 'barg' },
            purity: { value: 99.9, unit: '%' }
        }
    },

    // --- Generisk ---
    unknown: {
        name: 'Ej definierad',
        shortName: '?',
        phase: 'unknown',
        category: 'Övrigt',
        color: 0x9e9e9e,
        hazard: 'none',
        description: 'Media ej vald',
        properties: {}
    }
};

// Hazard display info
const HAZARD_INFO = {
    none:      { label: '',              icon: '',  color: '#9e9e9e' },
    flammable: { label: 'Brandfarlig',   icon: '🔥', color: '#ff5722' },
    toxic:     { label: 'Giftig',        icon: '☠',  color: '#fdd835' },
    corrosive: { label: 'Frätande',      icon: '⚗',  color: '#e040fb' }
};

// Phase display info
const PHASE_INFO = {
    liquid:    { label: 'Vätska',    icon: '💧', color: '#29b6f6' },
    gas:       { label: 'Gas',       icon: '💨', color: '#eceff1' },
    two_phase: { label: 'Tvåfas',    icon: '🌊', color: '#aed581' },
    unknown:   { label: 'Okänd',     icon: '?',  color: '#9e9e9e' }
};

// Helper: get sorted media list grouped by category
function getMediaByCategory() {
    const cats = {};
    for (const [key, def] of Object.entries(MEDIA_DEFINITIONS)) {
        if (key === 'unknown') continue;
        const cat = def.category || 'Övrigt';
        if (!cats[cat]) cats[cat] = [];
        cats[cat].push({ key, ...def });
    }
    return cats;
}
