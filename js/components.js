/**
 * components.js - Komponentdefinitioner för Process Builder 3D
 * Definierar alla tillgängliga processkomponenter med egenskaper, portar och 3D-geometri.
 */

const COMPONENT_DEFINITIONS = {
    // --- Pumpar ---
    centrifugal_pump: {
        type: 'pump',
        subtype: 'centrifugal',
        name: 'Centrifugalpump',
        icon: '\u2699',
        category: 'Pumpar',
        description: 'Standard centrifugalpump',
        ports: {
            inlet:  { position: [-0.6, 0, 0], direction: [-1, 0, 0], type: 'liquid_in' },
            outlet: { position: [0.6, 0, 0],  direction: [1, 0, 0],  type: 'liquid_out' }
        },
        parameters: {
            flowRate: { value: 100, unit: 'm\u00b3/h', label: 'Fl\u00f6de' },
            pressure: { value: 5,   unit: 'bar',  label: 'Tryck' },
            power:    { value: 15,  unit: 'kW',   label: 'Effekt' }
        },
        color: 0x4fc3f7,
        buildMesh(THREE) {
            const group = new THREE.Group();
            // Pump body - cylinder
            const body = new THREE.Mesh(
                new THREE.CylinderGeometry(0.35, 0.35, 0.5, 24),
                new THREE.MeshStandardMaterial({ color: this.color })
            );
            body.rotation.z = Math.PI / 2;
            group.add(body);
            // Inlet pipe
            const inlet = new THREE.Mesh(
                new THREE.CylinderGeometry(0.1, 0.1, 0.3, 12),
                new THREE.MeshStandardMaterial({ color: 0x78909c })
            );
            inlet.rotation.z = Math.PI / 2;
            inlet.position.set(-0.5, 0, 0);
            group.add(inlet);
            // Outlet pipe
            const outlet = new THREE.Mesh(
                new THREE.CylinderGeometry(0.1, 0.1, 0.3, 12),
                new THREE.MeshStandardMaterial({ color: 0x78909c })
            );
            outlet.rotation.z = Math.PI / 2;
            outlet.position.set(0.5, 0, 0);
            group.add(outlet);
            return group;
        }
    },

    positive_displacement_pump: {
        type: 'pump',
        subtype: 'positive_displacement',
        name: 'Kolvpump',
        icon: '⛽',
        category: 'Pumpar',
        description: 'Positiv deplacementpump (kolv/membran)',
        ports: {
            inlet:  { position: [-0.6, 0, 0], direction: [-1, 0, 0], type: 'liquid_in' },
            outlet: { position: [0.6, 0, 0],  direction: [1, 0, 0],  type: 'liquid_out' }
        },
        parameters: {
            flowRate: { value: 20,  unit: 'm³/h', label: 'Flöde' },
            pressure: { value: 20,  unit: 'bar',  label: 'Tryck' },
            power:    { value: 10,  unit: 'kW',   label: 'Effekt' },
            strokes:  { value: 120, unit: 'rpm',  label: 'Slaghastighet' }
        },
        color: 0x29b6f6,
        buildMesh(THREE) {
            const group = new THREE.Group();
            // Rectangular pump body (box shape distinguishes from centrifugal)
            const body = new THREE.Mesh(
                new THREE.BoxGeometry(0.5, 0.45, 0.45),
                new THREE.MeshStandardMaterial({ color: this.color })
            );
            group.add(body);
            // Piston cylinder on top
            const cylinder = new THREE.Mesh(
                new THREE.CylinderGeometry(0.12, 0.12, 0.3, 12),
                new THREE.MeshStandardMaterial({ color: 0x90caf9 })
            );
            cylinder.position.set(0, 0.35, 0);
            group.add(cylinder);
            // Piston rod
            const rod = new THREE.Mesh(
                new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8),
                new THREE.MeshStandardMaterial({ color: 0xeeeeee })
            );
            rod.position.set(0, 0.55, 0);
            group.add(rod);
            // Inlet pipe stub
            const inlet = new THREE.Mesh(
                new THREE.CylinderGeometry(0.1, 0.1, 0.3, 12),
                new THREE.MeshStandardMaterial({ color: 0x78909c })
            );
            inlet.rotation.z = Math.PI / 2;
            inlet.position.set(-0.5, 0, 0);
            group.add(inlet);
            // Outlet pipe stub
            const outlet = new THREE.Mesh(
                new THREE.CylinderGeometry(0.1, 0.1, 0.3, 12),
                new THREE.MeshStandardMaterial({ color: 0x78909c })
            );
            outlet.rotation.z = Math.PI / 2;
            outlet.position.set(0.5, 0, 0);
            group.add(outlet);
            return group;
        }
    },

    // --- Kompressorer ---
    compressor: {
        type: 'compressor',
        subtype: 'centrifugal',
        name: 'Kompressor',
        icon: '⚙',
        category: 'Pumpar',
        description: 'Centrifugalkompressor för gas',
        ports: {
            suction:   { position: [0, 0.5, 0],    direction: [0, 1, 0],  type: 'liquid_in' },
            discharge: { position: [0.55, -0.2, 0], direction: [1, 0, 0],  type: 'liquid_out' }
        },
        parameters: {
            flowRate:    { value: 5000, unit: 'Nm³/h', label: 'Flöde' },
            pressureIn:  { value: 1,    unit: 'bar',   label: 'Tryck in' },
            pressureOut: { value: 8,    unit: 'bar',   label: 'Tryck ut' },
            power:       { value: 250,  unit: 'kW',    label: 'Effekt' }
        },
        color: 0x42a5f5,
        buildMesh(THREE) {
            const group = new THREE.Group();
            // Compressor body (horizontal cylinder)
            const body = new THREE.Mesh(
                new THREE.CylinderGeometry(0.4, 0.4, 0.6, 24),
                new THREE.MeshStandardMaterial({ color: this.color })
            );
            body.rotation.z = Math.PI / 2;
            group.add(body);
            // Fin rings (3 rings around the body)
            const finMat = new THREE.MeshStandardMaterial({ color: 0x90caf9 });
            for (let i = -1; i <= 1; i++) {
                const fin = new THREE.Mesh(
                    new THREE.TorusGeometry(0.42, 0.025, 8, 24),
                    finMat
                );
                fin.rotation.y = Math.PI / 2;
                fin.position.x = i * 0.18;
                group.add(fin);
            }
            // Suction nozzle (top)
            const nMat = new THREE.MeshStandardMaterial({ color: 0x78909c });
            const suctionN = new THREE.Mesh(
                new THREE.CylinderGeometry(0.12, 0.12, 0.2, 12),
                nMat
            );
            suctionN.position.set(0, 0.5, 0);
            group.add(suctionN);
            // Discharge nozzle (side, lower)
            const dischargeN = new THREE.Mesh(
                new THREE.CylinderGeometry(0.1, 0.1, 0.2, 12),
                nMat
            );
            dischargeN.rotation.z = Math.PI / 2;
            dischargeN.position.set(0.45, -0.2, 0);
            group.add(dischargeN);
            // Base plate
            const base = new THREE.Mesh(
                new THREE.BoxGeometry(0.7, 0.05, 0.5),
                new THREE.MeshStandardMaterial({ color: 0x455a64 })
            );
            base.position.y = -0.35;
            group.add(base);
            return group;
        }
    },

    // --- Ventiler ---
    gate_valve: {
        type: 'valve',
        subtype: 'gate',
        name: 'Slidventil',
        icon: '\u2716',
        category: 'Ventiler',
        description: 'Manuell slidventil f\u00f6r p\u00e5/av',
        ports: {
            inlet:  { position: [-0.18, 0, 0], direction: [-1, 0, 0], type: 'liquid_in' },
            outlet: { position: [0.18, 0, 0],  direction: [1, 0, 0],  type: 'liquid_out' }
        },
        parameters: {
            opening:   { value: 100, unit: '%',    label: '\u00d6ppning' },
            size:      { value: 50,  unit: 'mm',   label: 'Storlek' },
            pDrop:     { value: 0.2, unit: 'bar',  label: 'Tryckfall' }
        },
        color: 0xef5350,
        buildMesh(THREE) {
            const group = new THREE.Group();
            const left = new THREE.Mesh(
                new THREE.ConeGeometry(0.12, 0.18, 4),
                new THREE.MeshStandardMaterial({ color: this.color })
            );
            left.rotation.z = Math.PI / 2;
            left.position.set(-0.07, 0, 0);
            group.add(left);
            const right = new THREE.Mesh(
                new THREE.ConeGeometry(0.12, 0.18, 4),
                new THREE.MeshStandardMaterial({ color: this.color })
            );
            right.rotation.z = -Math.PI / 2;
            right.position.set(0.07, 0, 0);
            group.add(right);
            const stem = new THREE.Mesh(
                new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8),
                new THREE.MeshStandardMaterial({ color: 0x90a4ae })
            );
            stem.position.set(0, 0.18, 0);
            group.add(stem);
            const wheel = new THREE.Mesh(
                new THREE.TorusGeometry(0.06, 0.012, 8, 16),
                new THREE.MeshStandardMaterial({ color: 0x90a4ae })
            );
            wheel.position.set(0, 0.28, 0);
            group.add(wheel);
            return group;
        }
    },

    control_valve: {
        type: 'valve',
        subtype: 'control',
        name: 'Reglerventil',
        icon: '\u25c7',
        category: 'Ventiler',
        description: 'Automatisk reglerventil',
        ports: {
            inlet:  { position: [-0.18, 0, 0], direction: [-1, 0, 0], type: 'liquid_in' },
            outlet: { position: [0.18, 0, 0],  direction: [1, 0, 0],  type: 'liquid_out' }
        },
        parameters: {
            opening:   { value: 50,  unit: '%',   label: '\u00d6ppning' },
            cv:        { value: 120, unit: '',    label: 'Cv-v\u00e4rde' },
            setpoint:  { value: 3.5, unit: 'bar', label: 'B\u00f6rv\u00e4rde' }
        },
        color: 0xffa726,
        buildMesh(THREE) {
            const group = new THREE.Group();
            const left = new THREE.Mesh(
                new THREE.ConeGeometry(0.12, 0.18, 4),
                new THREE.MeshStandardMaterial({ color: this.color })
            );
            left.rotation.z = Math.PI / 2;
            left.position.set(-0.07, 0, 0);
            group.add(left);
            const right = new THREE.Mesh(
                new THREE.ConeGeometry(0.12, 0.18, 4),
                new THREE.MeshStandardMaterial({ color: this.color })
            );
            right.rotation.z = -Math.PI / 2;
            right.position.set(0.07, 0, 0);
            group.add(right);
            const stem = new THREE.Mesh(
                new THREE.CylinderGeometry(0.02, 0.02, 0.18, 8),
                new THREE.MeshStandardMaterial({ color: 0x78909c })
            );
            stem.position.set(0, 0.16, 0);
            group.add(stem);
            const actuator = new THREE.Mesh(
                new THREE.CylinderGeometry(0.08, 0.08, 0.12, 16),
                new THREE.MeshStandardMaterial({ color: 0x546e7a })
            );
            actuator.position.set(0, 0.3, 0);
            group.add(actuator);
            return group;
        }
    },

    check_valve: {
        type: 'valve',
        subtype: 'check',
        name: 'Backventil',
        icon: '▷',
        category: 'Ventiler',
        description: 'Backventil (tillåter flöde i en riktning)',
        ports: {
            inlet:  { position: [-0.18, 0, 0], direction: [-1, 0, 0], type: 'liquid_in' },
            outlet: { position: [0.18, 0, 0],  direction: [1, 0, 0],  type: 'liquid_out' }
        },
        parameters: {
            size:             { value: 50,   unit: 'mm',  label: 'Storlek' },
            pDrop:            { value: 0.1,  unit: 'bar', label: 'Tryckfall' },
            crackingPressure: { value: 0.05, unit: 'bar', label: 'Öppningstryck' }
        },
        color: 0x26a69a,
        buildMesh(THREE) {
            const group = new THREE.Group();
            const left = new THREE.Mesh(
                new THREE.ConeGeometry(0.12, 0.18, 4),
                new THREE.MeshStandardMaterial({ color: this.color })
            );
            left.rotation.z = Math.PI / 2;
            left.position.set(-0.07, 0, 0);
            group.add(left);
            const right = new THREE.Mesh(
                new THREE.ConeGeometry(0.12, 0.18, 4),
                new THREE.MeshStandardMaterial({ color: this.color })
            );
            right.rotation.z = -Math.PI / 2;
            right.position.set(0.07, 0, 0);
            group.add(right);
            const arrow = new THREE.Mesh(
                new THREE.ConeGeometry(0.04, 0.1, 3),
                new THREE.MeshStandardMaterial({ color: 0xffffff })
            );
            arrow.rotation.z = -Math.PI / 2;
            arrow.position.set(0.03, 0.1, 0);
            group.add(arrow);
            return group;
        }
    },

    globe_valve: {
        type: 'valve',
        subtype: 'globe',
        name: 'Globventil',
        icon: '◉',
        category: 'Ventiler',
        description: 'Globventil för flödesreglering',
        ports: {
            inlet:  { position: [-0.18, 0, 0], direction: [-1, 0, 0], type: 'liquid_in' },
            outlet: { position: [0.18, 0, 0],  direction: [1, 0, 0],  type: 'liquid_out' }
        },
        parameters: {
            opening:   { value: 100, unit: '%',    label: 'Öppning' },
            size:      { value: 50,  unit: 'mm',   label: 'Storlek' },
            pDrop:     { value: 0.5, unit: 'bar',  label: 'Tryckfall' },
            cv:        { value: 80,  unit: '',     label: 'Cv-värde' }
        },
        color: 0xec407a,
        buildMesh(THREE) {
            const group = new THREE.Group();
            const globe = new THREE.Mesh(
                new THREE.SphereGeometry(0.1, 16, 12),
                new THREE.MeshStandardMaterial({ color: this.color })
            );
            group.add(globe);
            const pipeMat = new THREE.MeshStandardMaterial({ color: 0x78909c });
            const inletPipe = new THREE.Mesh(
                new THREE.CylinderGeometry(0.035, 0.035, 0.15, 12),
                pipeMat
            );
            inletPipe.rotation.z = Math.PI / 2;
            inletPipe.position.set(-0.13, 0, 0);
            group.add(inletPipe);
            const outletPipe = new THREE.Mesh(
                new THREE.CylinderGeometry(0.035, 0.035, 0.15, 12),
                pipeMat
            );
            outletPipe.rotation.z = Math.PI / 2;
            outletPipe.position.set(0.13, 0, 0);
            group.add(outletPipe);
            const stem = new THREE.Mesh(
                new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8),
                new THREE.MeshStandardMaterial({ color: 0x90a4ae })
            );
            stem.position.set(0, 0.18, 0);
            group.add(stem);
            const wheel = new THREE.Mesh(
                new THREE.TorusGeometry(0.06, 0.012, 8, 16),
                new THREE.MeshStandardMaterial({ color: 0x90a4ae })
            );
            wheel.position.set(0, 0.28, 0);
            group.add(wheel);
            return group;
        }
    },

    // --- Tankar ---
    storage_tank: {
        type: 'tank',
        subtype: 'storage',
        name: 'Lagringstank',
        icon: '\u25a3',
        category: 'Tankar',
        description: 'Vertikal lagringstank',
        ports: {
            inlet:  { position: [0.5, 0.4, 0],   direction: [1, 0, 0],   type: 'liquid_in' },
            outlet: { position: [-0.5, -0.4, 0],  direction: [-1, 0, 0],  type: 'liquid_out' },
            vent:   { position: [0, 0.85, 0],      direction: [0, 1, 0],   type: 'liquid_out' },
            drain:  { position: [0, -0.7, 0.45],   direction: [0, 0, 1],   type: 'liquid_out' }
        },
        parameters: {
            volume:    { value: 50,  unit: 'm\u00b3',   label: 'Volym' },
            level:     { value: 60,  unit: '%',    label: 'Niv\u00e5' },
            pressure:  { value: 1,   unit: 'bar',  label: 'Tryck' },
            temp:      { value: 25,  unit: '\u00b0C',    label: 'Temperatur' }
        },
        color: 0x66bb6a,
        buildMesh(THREE) {
            const group = new THREE.Group();
            // Tank body
            const body = new THREE.Mesh(
                new THREE.CylinderGeometry(0.45, 0.45, 1.2, 24),
                new THREE.MeshStandardMaterial({ color: this.color, transparent: true, opacity: 0.85 })
            );
            body.position.y = 0.1;
            group.add(body);

            // Tank top dome
            const top = new THREE.Mesh(
                new THREE.SphereGeometry(0.45, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
                new THREE.MeshStandardMaterial({ color: this.color, transparent: true, opacity: 0.85 })
            );
            top.position.y = 0.7;
            group.add(top);

            // Legs
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 2) {
                const leg = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.03, 0.03, 0.4, 6),
                    new THREE.MeshStandardMaterial({ color: 0x78909c })
                );
                leg.position.set(Math.cos(angle) * 0.35, -0.7, Math.sin(angle) * 0.35);
                group.add(leg);
            }
            return group;
        }
    },

    reactor: {
        type: 'tank',
        subtype: 'reactor',
        name: 'Reaktor',
        icon: '\u2622',
        category: 'Reaktorer',
        description: 'Omr\u00f6rd tankreaktor (CSTR)',
        ports: {
            feed_in:    { position: [0.55, 0.3, 0],    direction: [1, 0, 0],   type: 'liquid_in' },
            gas_in:     { position: [0, 0.9, 0],        direction: [0, 1, 0],   type: 'liquid_in' },
            product_out:{ position: [0.55, -0.3, 0],    direction: [1, 0, 0],   type: 'liquid_out' },
            vent_out:   { position: [-0.55, 0.5, 0],    direction: [-1, 0, 0],  type: 'liquid_out' }
        },
        parameters: {
            volume:    { value: 10,   unit: 'm\u00b3',   label: 'Volym' },
            temp:      { value: 80,   unit: '\u00b0C',    label: 'Temperatur' },
            pressure:  { value: 3,    unit: 'bar',  label: 'Tryck' },
            agitator:  { value: 150,  unit: 'rpm',  label: 'Omr\u00f6rarhastighet' }
        },
        color: 0xab47bc,
        buildMesh(THREE) {
            const group = new THREE.Group();
            // Reactor body
            const body = new THREE.Mesh(
                new THREE.CylinderGeometry(0.5, 0.5, 1.4, 24),
                new THREE.MeshStandardMaterial({ color: this.color, transparent: true, opacity: 0.85 })
            );
            body.position.y = 0.1;
            group.add(body);

            // Dome top
            const top = new THREE.Mesh(
                new THREE.SphereGeometry(0.5, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
                new THREE.MeshStandardMaterial({ color: this.color, transparent: true, opacity: 0.85 })
            );
            top.position.y = 0.8;
            group.add(top);

            // Agitator shaft
            const shaft = new THREE.Mesh(
                new THREE.CylinderGeometry(0.03, 0.03, 1.0, 8),
                new THREE.MeshStandardMaterial({ color: 0xeeeeee })
            );
            shaft.position.y = 0.3;
            group.add(shaft);

            // Agitator blade
            const blade = new THREE.Mesh(
                new THREE.BoxGeometry(0.6, 0.02, 0.1),
                new THREE.MeshStandardMaterial({ color: 0xeeeeee })
            );
            blade.position.y = -0.1;
            group.add(blade);

            // Legs
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 2) {
                const leg = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.03, 0.03, 0.4, 6),
                    new THREE.MeshStandardMaterial({ color: 0x78909c })
                );
                leg.position.set(Math.cos(angle) * 0.4, -0.8, Math.sin(angle) * 0.4);
                group.add(leg);
            }
            return group;
        }
    },

    distillation_column: {
        type: 'column',
        subtype: 'distillation',
        name: 'Destillationskolonn',
        icon: '\u2B22',
        category: 'Kolonner',
        description: 'Destillationskolonn med brickor',
        ports: {
            feed_in:      { position: [0.5, 0, 0],      direction: [1, 0, 0],  type: 'liquid_in' },
            reflux_in:    { position: [-0.5, 0.9, 0],    direction: [-1, 0, 0], type: 'liquid_in' },
            reboiler_out: { position: [0.5, -0.6, 0],    direction: [1, 0, 0],  type: 'liquid_out' },
            reboiler_in:  { position: [-0.5, -0.6, 0],   direction: [-1, 0, 0], type: 'liquid_in' },
            top_out:      { position: [0, 1.2, 0],       direction: [0, 1, 0],  type: 'liquid_out' },
            bottom_out:   { position: [0.5, -0.8, 0],    direction: [1, 0, 0],  type: 'liquid_out' }
        },
        parameters: {
            stages:      { value: 20,   unit: '',    label: 'Antal brickor' },
            pressure:    { value: 1.2,  unit: 'bar', label: 'Tryck' },
            topTemp:     { value: 78,   unit: '\u00b0C',  label: 'Topp-temp' },
            bottomTemp:  { value: 110,  unit: '\u00b0C',  label: 'Botten-temp' },
            refluxRatio: { value: 2.5,  unit: '',    label: '\u00c5terfl\u00f6desf\u00f6rh\u00e5llande' }
        },
        color: 0x7e57c2,
        buildMesh(THREE) {
            const group = new THREE.Group();
            // Tall column body
            const body = new THREE.Mesh(
                new THREE.CylinderGeometry(0.35, 0.35, 2.0, 24),
                new THREE.MeshStandardMaterial({ color: this.color, transparent: true, opacity: 0.85 })
            );
            body.position.y = 0.2;
            group.add(body);

            // Spherical top dome
            const top = new THREE.Mesh(
                new THREE.SphereGeometry(0.35, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
                new THREE.MeshStandardMaterial({ color: this.color, transparent: true, opacity: 0.85 })
            );
            top.position.y = 1.2;
            group.add(top);

            // Tray rims (4 rings around the column)
            const rimMat = new THREE.MeshStandardMaterial({ color: 0xb39ddb });
            for (let i = 0; i < 4; i++) {
                const rim = new THREE.Mesh(
                    new THREE.TorusGeometry(0.37, 0.02, 8, 24),
                    rimMat
                );
                rim.position.y = -0.4 + i * 0.5;
                group.add(rim);
            }

            // Legs
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 2) {
                const leg = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.03, 0.03, 0.5, 6),
                    new THREE.MeshStandardMaterial({ color: 0x78909c })
                );
                leg.position.set(Math.cos(angle) * 0.3, -1.05, Math.sin(angle) * 0.3);
                group.add(leg);
            }
            return group;
        }
    },

    // --- V\u00e4rmev\u00e4xlare ---
    // --- Ugnar ---
    process_furnace: {
        type: 'furnace',
        subtype: 'process',
        name: 'Processugn',
        icon: '🔥',
        category: 'Ugnar',
        description: 'Rörugn för uppvärmning av processflöden',
        ports: {
            inlet:    { position: [-0.7, 0, 0],    direction: [-1, 0, 0], type: 'liquid_in' },
            outlet:   { position: [0.7, 0, 0],     direction: [1, 0, 0],  type: 'liquid_out' },
            fuel_in:  { position: [0, -0.4, 0.65], direction: [0, 0, 1],  type: 'liquid_in', defaultMedia: 'fuel_gas' }
        },
        parameters: {
            duty:    { value: 2000, unit: 'kW',  label: 'Värmeeffekt' },
            tempOut: { value: 350,  unit: '°C',  label: 'Uttemp' },
            fuelRate:{ value: 120,  unit: 'kg/h', label: 'Bränsleflöde' },
            efficiency: { value: 85, unit: '%',  label: 'Verkningsgrad' }
        },
        color: 0xff5722,
        buildMesh(THREE) {
            const group = new THREE.Group();
            // Furnace body
            const body = new THREE.Mesh(
                new THREE.BoxGeometry(1.0, 0.8, 1.2),
                new THREE.MeshStandardMaterial({ color: this.color })
            );
            group.add(body);
            // Firebox glow (front face)
            const glow = new THREE.Mesh(
                new THREE.PlaneGeometry(0.5, 0.4),
                new THREE.MeshStandardMaterial({ color: 0xff8a00, emissive: 0xff6600, emissiveIntensity: 0.6 })
            );
            glow.position.set(0, -0.05, 0.601);
            group.add(glow);
            // Stack/chimney
            const stack = new THREE.Mesh(
                new THREE.CylinderGeometry(0.1, 0.12, 0.5, 12),
                new THREE.MeshStandardMaterial({ color: 0x78909c })
            );
            stack.position.set(0, 0.65, 0);
            group.add(stack);
            // Floor burners in a row along Z
            const burnerMat = new THREE.MeshStandardMaterial({ color: 0xff8a00, emissive: 0xff6600, emissiveIntensity: 0.4 });
            for (const zOff of [-0.3, 0, 0.3]) {
                const burner = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.04, 0.05, 0.07, 8),
                    burnerMat
                );
                burner.position.set(0, -0.43, zOff);
                group.add(burner);
            }
            // Inlet/outlet nozzles
            const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x78909c });
            const nozzleGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.3, 8);
            const nIn = new THREE.Mesh(nozzleGeo, nozzleMat);
            nIn.rotation.z = Math.PI / 2;
            nIn.position.set(-0.6, 0, 0);
            group.add(nIn);
            const nOut = new THREE.Mesh(nozzleGeo, nozzleMat);
            nOut.rotation.z = Math.PI / 2;
            nOut.position.set(0.6, 0, 0);
            group.add(nOut);
            // Fuel nozzle (front)
            const nozzleGeoZ = new THREE.CylinderGeometry(0.08, 0.08, 0.3, 8);
            const nFuel = new THREE.Mesh(nozzleGeoZ, nozzleMat);
            nFuel.rotation.x = Math.PI / 2;
            nFuel.position.set(0, -0.4, 0.65);
            group.add(nFuel);
            return group;
        }
    },

    cracking_furnace: {
        type: 'furnace',
        subtype: 'cracking',
        name: 'Krackningsugn',
        icon: '🔥',
        category: 'Ugnar',
        description: 'Högtemperaturugn för termisk krackning',
        ports: {
            inlet:    { position: [-0.7, 0, 0],    direction: [-1, 0, 0], type: 'liquid_in' },
            outlet:   { position: [0.7, 0, 0],     direction: [1, 0, 0],  type: 'liquid_out' },
            fuel_in:  { position: [0, -0.4, 0.65], direction: [0, 0, 1],  type: 'liquid_in', defaultMedia: 'fuel_gas' }
        },
        parameters: {
            duty:    { value: 5000, unit: 'kW',  label: 'Värmeeffekt' },
            tempOut: { value: 850,  unit: '°C',  label: 'Uttemp' },
            residence: { value: 0.5, unit: 's',  label: 'Uppehållstid' },
            coilPressure: { value: 2, unit: 'bar', label: 'Rörtryck' }
        },
        color: 0xd84315,
        buildMesh(THREE) {
            const group = new THREE.Group();
            // Tall furnace body
            const body = new THREE.Mesh(
                new THREE.BoxGeometry(0.9, 1.1, 1.2),
                new THREE.MeshStandardMaterial({ color: this.color })
            );
            body.position.y = 0.1;
            group.add(body);
            // Radiation section glow
            const glow = new THREE.Mesh(
                new THREE.PlaneGeometry(0.6, 0.5),
                new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: 0xff3300, emissiveIntensity: 0.7 })
            );
            glow.position.set(0, -0.1, 0.601);
            group.add(glow);
            // Convection section (top, lighter color)
            const conv = new THREE.Mesh(
                new THREE.BoxGeometry(0.9, 0.3, 1.2),
                new THREE.MeshStandardMaterial({ color: 0xbf360c })
            );
            conv.position.set(0, 0.8, 0);
            group.add(conv);
            // Single stack (centered)
            const stackMat = new THREE.MeshStandardMaterial({ color: 0x78909c });
            const stack = new THREE.Mesh(
                new THREE.CylinderGeometry(0.09, 0.11, 0.55, 10),
                stackMat
            );
            stack.position.set(0, 1.2, 0);
            group.add(stack);
            // Floor burners in a row along Z
            const burnerMat = new THREE.MeshStandardMaterial({ color: 0xff8a00, emissive: 0xff6600, emissiveIntensity: 0.4 });
            for (const zOff of [-0.35, 0, 0.35]) {
                const burner = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.04, 0.05, 0.07, 8),
                    burnerMat
                );
                burner.position.set(0, -0.5, zOff);
                group.add(burner);
            }
            // Nozzles
            const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x78909c });
            const nozzleGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.3, 8);
            const nIn = new THREE.Mesh(nozzleGeo, nozzleMat);
            nIn.rotation.z = Math.PI / 2;
            nIn.position.set(-0.6, -0.2, 0);
            group.add(nIn);
            const nOut = new THREE.Mesh(nozzleGeo, nozzleMat);
            nOut.rotation.z = Math.PI / 2;
            nOut.position.set(0.6, 0.3, 0);
            group.add(nOut);
            const nFuel = new THREE.Mesh(nozzleGeo, nozzleMat);
            nFuel.rotation.x = Math.PI / 2;
            nFuel.position.set(0, -0.4, 0.65);
            group.add(nFuel);
            return group;
        }
    },

    calcination_kiln: {
        type: 'furnace',
        subtype: 'kiln',
        name: 'Kalcineringsugn',
        icon: '🏭',
        category: 'Ugnar',
        description: 'Roterande ugn för kalcinering och torkning',
        ports: {
            inlet:   { position: [-0.8, 0, 0],     direction: [-1, 0, 0], type: 'liquid_in' },
            outlet:  { position: [0.8, 0, 0],      direction: [1, 0, 0],  type: 'liquid_out' },
            fuel_in: { position: [0, -0.3, 0.45],  direction: [0, 0, 1],  type: 'liquid_in', defaultMedia: 'fuel_gas' }
        },
        parameters: {
            duty:    { value: 3000, unit: 'kW',  label: 'Värmeeffekt' },
            tempOut: { value: 900,  unit: '°C',  label: 'Uttemp' },
            rpm:     { value: 3,    unit: 'rpm', label: 'Rotationshastighet' },
            length:  { value: 15,   unit: 'm',   label: 'Längd' }
        },
        color: 0xe64a19,
        buildMesh(THREE) {
            const group = new THREE.Group();
            // Rotating drum (tilted cylinder)
            const drum = new THREE.Mesh(
                new THREE.CylinderGeometry(0.35, 0.3, 1.4, 16),
                new THREE.MeshStandardMaterial({ color: this.color })
            );
            drum.rotation.z = Math.PI / 2;
            drum.rotation.x = 0.1; // slight tilt
            group.add(drum);
            // Support rings
            const ringMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63 });
            for (const x of [-0.4, 0.4]) {
                const ring = new THREE.Mesh(
                    new THREE.TorusGeometry(0.36, 0.04, 8, 24),
                    ringMat
                );
                ring.rotation.y = Math.PI / 2;
                ring.position.set(x, 0, 0);
                group.add(ring);
            }
            // Support stands
            const standMat = new THREE.MeshStandardMaterial({ color: 0x78909c });
            for (const x of [-0.4, 0.4]) {
                const stand = new THREE.Mesh(
                    new THREE.BoxGeometry(0.08, 0.3, 0.08),
                    standMat
                );
                stand.position.set(x, -0.3, 0.3);
                group.add(stand);
                const stand2 = new THREE.Mesh(
                    new THREE.BoxGeometry(0.08, 0.3, 0.08),
                    standMat
                );
                stand2.position.set(x, -0.3, -0.3);
                group.add(stand2);
            }
            return group;
        }
    },

    multi_pass_furnace: {
        type: 'furnace',
        subtype: 'multi_pass',
        name: 'Flerpassugn (A-F)',
        icon: '🔥',
        category: 'Ugnar',
        description: 'Stor boxugn med 6 sektioner (A-F). Separata in/utgångar för varje pass – lämplig för satsning, uppkokare, överhettare och sidoströmmar. Har egna skotstensutlopp.',
        ports: {
            pass_a_in:  { position: [-1.5, 0.25, 0],   direction: [-1, 0, 0], type: 'liquid_in' },
            pass_a_out: { position: [1.5, 0.25, 0],    direction: [1, 0, 0],  type: 'liquid_out' },
            pass_b_in:  { position: [-1.5, 0.08, 0],   direction: [-1, 0, 0], type: 'liquid_in' },
            pass_b_out: { position: [1.5, 0.08, 0],    direction: [1, 0, 0],  type: 'liquid_out' },
            pass_c_in:  { position: [-1.5, -0.08, 0],  direction: [-1, 0, 0], type: 'liquid_in' },
            pass_c_out: { position: [1.5, -0.08, 0],   direction: [1, 0, 0],  type: 'liquid_out' },
            pass_d_in:  { position: [0, 0.25, -0.75],  direction: [0, 0, -1], type: 'liquid_in' },
            pass_d_out: { position: [0, 0.25, 0.75],   direction: [0, 0, 1],  type: 'liquid_out' },
            pass_e_in:  { position: [0, 0.08, -0.75],  direction: [0, 0, -1], type: 'liquid_in' },
            pass_e_out: { position: [0, 0.08, 0.75],   direction: [0, 0, 1],  type: 'liquid_out' },
            pass_f_in:  { position: [0, -0.08, -0.75], direction: [0, 0, -1], type: 'liquid_in' },
            pass_f_out: { position: [0, -0.08, 0.75],  direction: [0, 0, 1],  type: 'liquid_out' },
            fuel_in:    { position: [0, -0.5, 0.75],   direction: [0, 0, 1],  type: 'liquid_in', defaultMedia: 'fuel_gas' }
        },
        parameters: {
            duty:       { value: 12000, unit: 'kW',  label: 'Total värmeeffekt' },
            passes:     { value: 6,     unit: 'st',  label: 'Antal pass' },
            tempOut_A:  { value: 310,   unit: '°C',  label: 'Uttemp Pass A' },
            tempOut_B:  { value: 295,   unit: '°C',  label: 'Uttemp Pass B' },
            tempOut_C:  { value: 280,   unit: '°C',  label: 'Uttemp Pass C' },
            tempOut_D:  { value: 265,   unit: '°C',  label: 'Uttemp Pass D' },
            tempOut_E:  { value: 250,   unit: '°C',  label: 'Uttemp Pass E' },
            tempOut_F:  { value: 235,   unit: '°C',  label: 'Uttemp Pass F' },
            efficiency: { value: 89,    unit: '%',   label: 'Verkningsgrad' }
        },
        color: 0xd84315,
        buildMesh(THREE) {
            const group = new THREE.Group();
            const bodyMat = new THREE.MeshStandardMaterial({ color: this.color });
            const sectionMat = new THREE.MeshStandardMaterial({ color: 0xbf360c });
            const dividerMat = new THREE.MeshStandardMaterial({ color: 0x5d4037 });
            const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x78909c });
            const glowMat = new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: 0xff3300, emissiveIntensity: 0.6 });

            // Main furnace body - wide 6-section box
            const body = new THREE.Mesh(
                new THREE.BoxGeometry(2.8, 1.0, 1.4),
                bodyMat
            );
            group.add(body);

            // Convection section on top
            const conv = new THREE.Mesh(
                new THREE.BoxGeometry(2.8, 0.25, 1.4),
                sectionMat
            );
            conv.position.y = 0.625;
            group.add(conv);

            // 5 internal dividers creating 6 cells, each 0.467 wide
            const divPositions = [-0.933, -0.467, 0, 0.467, 0.933];
            for (const xPos of divPositions) {
                const divider = new THREE.Mesh(
                    new THREE.BoxGeometry(0.04, 0.85, 1.36),
                    dividerMat
                );
                divider.position.set(xPos, 0.05, 0);
                group.add(divider);
            }

            // 6 firebox glows on front face (section centers)
            const sectionCenters = [-1.167, -0.7, -0.233, 0.233, 0.7, 1.167];
            for (const xc of sectionCenters) {
                const glow = new THREE.Mesh(
                    new THREE.PlaneGeometry(0.33, 0.4),
                    glowMat
                );
                glow.position.set(xc, -0.1, 0.701);
                group.add(glow);
            }

            // Single stack (centered)
            const stackMat = new THREE.MeshStandardMaterial({ color: 0x78909c });
            const stack = new THREE.Mesh(
                new THREE.CylinderGeometry(0.13, 0.17, 0.7, 10),
                stackMat
            );
            stack.position.set(0, 1.08, 0);
            group.add(stack);

            // Nozzles for passes A-C (left/right sides at 3 y-levels)
            const nozzleGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.3, 8);
            const yLevels = [0.25, 0.08, -0.08];
            const passLabels = ['A', 'B', 'C'];
            for (let i = 0; i < 3; i++) {
                const nIn = new THREE.Mesh(nozzleGeo, nozzleMat);
                nIn.rotation.z = Math.PI / 2;
                nIn.position.set(-1.45, yLevels[i], 0);
                group.add(nIn);
                const nOut = new THREE.Mesh(nozzleGeo, nozzleMat);
                nOut.rotation.z = Math.PI / 2;
                nOut.position.set(1.45, yLevels[i], 0);
                group.add(nOut);
            }

            // Nozzles for passes D-F (front/back)
            for (let i = 0; i < 3; i++) {
                const nIn = new THREE.Mesh(nozzleGeo, nozzleMat);
                nIn.rotation.x = Math.PI / 2;
                nIn.position.set(0, yLevels[i], -0.7);
                group.add(nIn);
                const nOut = new THREE.Mesh(nozzleGeo, nozzleMat);
                nOut.rotation.x = Math.PI / 2;
                nOut.position.set(0, yLevels[i], 0.7);
                group.add(nOut);
            }

            const nFuel = new THREE.Mesh(nozzleGeo, nozzleMat);
            nFuel.rotation.x = Math.PI / 2;
            nFuel.position.set(0, -0.45, 0.7);
            group.add(nFuel);

            return group;
        }
    },

    cabin_furnace: {
        type: 'furnace',
        subtype: 'cabin',
        name: 'Kabinugn',
        icon: '🔥',
        category: 'Ugnar',
        description: 'Bred kabinugn med 2 celler och horisontella rör. Naturlig drag med centralt placerad skorsten.',
        ports: {
            cell1_in:  { position: [-0.9, 0.15, 0],   direction: [-1, 0, 0], type: 'liquid_in' },
            cell1_out: { position: [-0.9, -0.1, 0],   direction: [-1, 0, 0], type: 'liquid_out' },
            cell2_in:  { position: [0.9, 0.15, 0],    direction: [1, 0, 0],  type: 'liquid_in' },
            cell2_out: { position: [0.9, -0.1, 0],    direction: [1, 0, 0],  type: 'liquid_out' },
            fuel_in:   { position: [0, -0.5, 0.5],    direction: [0, 0, 1],  type: 'liquid_in', defaultMedia: 'fuel_gas' }
        },
        parameters: {
            duty:       { value: 5000, unit: 'kW',  label: 'Total värmeeffekt' },
            cells:      { value: 2,    unit: 'st',  label: 'Antal celler' },
            tempOut:    { value: 320,  unit: '°C',  label: 'Uttemp' },
            draftType:  { value: 'Naturlig', unit: '',  label: 'Dragtyp' },
            efficiency: { value: 86,   unit: '%',   label: 'Verkningsgrad' }
        },
        color: 0xbf360c,
        buildMesh(THREE) {
            const group = new THREE.Group();
            const bodyMat = new THREE.MeshStandardMaterial({ color: this.color });
            const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x78909c });
            const glowMat = new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: 0xff3300, emissiveIntensity: 0.5 });

            // Wide cabin body (lower firebox)
            const body = new THREE.Mesh(
                new THREE.BoxGeometry(1.6, 0.7, 0.9),
                bodyMat
            );
            body.position.y = -0.1;
            group.add(body);

            // Slanted upper walls (cabin roof shape) using custom geometry
            const roofGeo = new THREE.BufferGeometry();
            const hw = 0.8, hd = 0.45, hBot = 0.25, hTop = 0.45, ridge = 0.25;
            const roofVerts = new Float32Array([
                // Front face
                -hw, hBot, hd,   hw, hBot, hd,   ridge, hTop, hd,  -ridge, hTop, hd,
                // Back face
                -hw, hBot, -hd,  -ridge, hTop, -hd,  ridge, hTop, -hd,  hw, hBot, -hd,
                // Left slope
                -hw, hBot, -hd,  -hw, hBot, hd,  -ridge, hTop, hd,  -ridge, hTop, -hd,
                // Right slope
                hw, hBot, hd,   hw, hBot, -hd,   ridge, hTop, -hd,   ridge, hTop, hd,
                // Top
                -ridge, hTop, -hd,  -ridge, hTop, hd,  ridge, hTop, hd,  ridge, hTop, -hd,
                // Bottom
                -hw, hBot, -hd,  hw, hBot, -hd,  hw, hBot, hd,  -hw, hBot, hd
            ]);
            const roofIdx = new Uint16Array([
                0,1,2, 0,2,3,  4,5,6, 4,6,7,  8,9,10, 8,10,11,
                12,13,14, 12,14,15,  16,17,18, 16,18,19,  20,21,22, 20,22,23
            ]);
            roofGeo.setAttribute('position', new THREE.BufferAttribute(roofVerts, 3));
            roofGeo.setIndex(new THREE.BufferAttribute(roofIdx, 1));
            roofGeo.computeVertexNormals();
            const roof = new THREE.Mesh(roofGeo, bodyMat);
            group.add(roof);

            // Convection section (on top of ridge)
            const conv = new THREE.Mesh(
                new THREE.BoxGeometry(1.6, 0.15, ridge * 2),
                new THREE.MeshStandardMaterial({ color: 0x8d6e63 })
            );
            conv.position.y = hTop + 0.075;
            group.add(conv);

            // Center divider wall
            const divider = new THREE.Mesh(
                new THREE.BoxGeometry(0.05, 0.85, 0.86),
                new THREE.MeshStandardMaterial({ color: 0x4e342e })
            );
            group.add(divider);

            // Firebox glows (2 cells)
            for (const xOff of [-0.4, 0.4]) {
                const glow = new THREE.Mesh(
                    new THREE.PlaneGeometry(0.5, 0.4),
                    glowMat
                );
                glow.position.set(xOff, -0.1, 0.451);
                group.add(glow);
            }

            // Horizontal tube indicators inside (visible on sides)
            const tubeMat = new THREE.MeshStandardMaterial({ color: 0x90a4ae });
            for (const xOff of [-0.4, 0.4]) {
                for (let row = 0; row < 3; row++) {
                    const tube = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.03, 0.03, 0.7, 6),
                        tubeMat
                    );
                    tube.rotation.x = Math.PI / 2;
                    tube.position.set(xOff, 0.15 - row * 0.15, 0);
                    group.add(tube);
                }
            }

            // Single central stack
            const stack = new THREE.Mesh(
                new THREE.CylinderGeometry(0.12, 0.15, 0.7, 12),
                new THREE.MeshStandardMaterial({ color: 0x78909c })
            );
            stack.position.set(0, 1.0, 0);
            group.add(stack);

            // Draft damper rings on stack
            for (const yOff of [0.75, 0.85]) {
                const ring = new THREE.Mesh(
                    new THREE.TorusGeometry(0.14, 0.015, 6, 16),
                    new THREE.MeshStandardMaterial({ color: 0x546e7a })
                );
                ring.position.set(0, yOff, 0);
                group.add(ring);
            }

            // Nozzles
            const nozzleGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.25, 8);
            // Cell 1 nozzles (left side)
            const n1in = new THREE.Mesh(nozzleGeo, nozzleMat);
            n1in.rotation.z = Math.PI / 2;
            n1in.position.set(-0.85, 0.15, 0);
            group.add(n1in);
            const n1out = new THREE.Mesh(nozzleGeo, nozzleMat);
            n1out.rotation.z = Math.PI / 2;
            n1out.position.set(-0.85, -0.1, 0);
            group.add(n1out);
            // Cell 2 nozzles (right side)
            const n2in = new THREE.Mesh(nozzleGeo, nozzleMat);
            n2in.rotation.z = Math.PI / 2;
            n2in.position.set(0.85, 0.15, 0);
            group.add(n2in);
            const n2out = new THREE.Mesh(nozzleGeo, nozzleMat);
            n2out.rotation.z = Math.PI / 2;
            n2out.position.set(0.85, -0.1, 0);
            group.add(n2out);

            // Fuel nozzle (bottom front)
            const nFuel = new THREE.Mesh(nozzleGeo, nozzleMat);
            nFuel.rotation.x = Math.PI / 2;
            nFuel.position.set(0, -0.45, 0.5);
            group.add(nFuel);

            return group;
        }
    },

    cylindrical_furnace: {
        type: 'furnace',
        subtype: 'cylindrical',
        name: 'Cylindrisk ugn',
        icon: '🔥',
        category: 'Ugnar',
        description: 'Vertikal cylindrisk ugn med helixformade rör längs insidan. Kompakt design, vanlig för lägre kapaciteter.',
        ports: {
            inlet:    { position: [0, 0.4, 0.55],    direction: [0, 0, 1],  type: 'liquid_in' },
            outlet:   { position: [0, -0.1, 0.55],   direction: [0, 0, 1],  type: 'liquid_out' },
            fuel_in:  { position: [0.55, -0.4, 0],    direction: [1, 0, 0],  type: 'liquid_in', defaultMedia: 'fuel_gas' }
        },
        parameters: {
            duty:       { value: 1500, unit: 'kW',  label: 'Värmeeffekt' },
            tempOut:    { value: 280,  unit: '°C',  label: 'Uttemp' },
            coilType:   { value: 'Helix', unit: '', label: 'Rörtyp' },
            diameter:   { value: 3,    unit: 'm',   label: 'Diameter' },
            efficiency: { value: 82,   unit: '%',   label: 'Verkningsgrad' }
        },
        color: 0xe64a19,
        buildMesh(THREE) {
            const group = new THREE.Group();

            // Cylindrical body
            const body = new THREE.Mesh(
                new THREE.CylinderGeometry(0.5, 0.5, 1.1, 20),
                new THREE.MeshStandardMaterial({ color: this.color })
            );
            group.add(body);

            // Domed top (convection section)
            const dome = new THREE.Mesh(
                new THREE.SphereGeometry(0.5, 20, 10, 0, Math.PI * 2, 0, Math.PI / 3),
                new THREE.MeshStandardMaterial({ color: 0xbf360c })
            );
            dome.position.y = 0.55;
            group.add(dome);

            // Stack on top
            const stack = new THREE.Mesh(
                new THREE.CylinderGeometry(0.1, 0.13, 0.5, 10),
                new THREE.MeshStandardMaterial({ color: 0x78909c })
            );
            stack.position.y = 1.0;
            group.add(stack);

            // Firebox glow at bottom (circular, inside bottom cap)
            const glow = new THREE.Mesh(
                new THREE.CircleGeometry(0.3, 16),
                new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: 0xff3300, emissiveIntensity: 0.6 })
            );
            glow.rotation.x = -Math.PI / 2;
            glow.position.y = -0.54;
            group.add(glow);

            // Burner ring at bottom – horizontal so it sits flat on the floor
            const burnerRing = new THREE.Mesh(
                new THREE.TorusGeometry(0.35, 0.03, 8, 20),
                new THREE.MeshStandardMaterial({ color: 0xff8a00, emissive: 0xff6600, emissiveIntensity: 0.3 })
            );
            burnerRing.rotation.x = Math.PI / 2;
            burnerRing.position.y = -0.5;
            group.add(burnerRing);

            // Nozzles
            const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x78909c });
            const nozzleGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.25, 8);
            // Inlet (front top)
            const nIn = new THREE.Mesh(nozzleGeo, nozzleMat);
            nIn.rotation.x = Math.PI / 2;
            nIn.position.set(0, 0.4, 0.5);
            group.add(nIn);
            // Outlet (front bottom)
            const nOut = new THREE.Mesh(nozzleGeo, nozzleMat);
            nOut.rotation.x = Math.PI / 2;
            nOut.position.set(0, -0.1, 0.5);
            group.add(nOut);
            // Fuel (right side bottom)
            const nFuel = new THREE.Mesh(nozzleGeo, nozzleMat);
            nFuel.rotation.z = Math.PI / 2;
            nFuel.position.set(0.5, -0.4, 0);
            group.add(nFuel);

            return group;
        }
    },

    dual_fired_furnace: {
        type: 'furnace',
        subtype: 'dual_fired',
        name: 'Dubbeleldad ugn',
        icon: '🔥',
        category: 'Ugnar',
        description: 'Boxugn eldad från båda sidor med central rörvägg. Hög kapacitet med jämn värmefördelning. 2 pass.',
        ports: {
            pass1_in:   { position: [-0.85, 0.2, 0],   direction: [-1, 0, 0], type: 'liquid_in' },
            pass1_out:  { position: [0.85, 0.2, 0],    direction: [1, 0, 0],  type: 'liquid_out' },
            pass2_in:   { position: [-0.85, -0.1, 0],  direction: [-1, 0, 0], type: 'liquid_in' },
            pass2_out:  { position: [0.85, -0.1, 0],   direction: [1, 0, 0],  type: 'liquid_out' },
            fuel_in_1:  { position: [0, -0.5, 0.8],    direction: [0, 0, 1],  type: 'liquid_in', defaultMedia: 'fuel_gas' },
            fuel_in_2:  { position: [0, -0.5, -0.8],   direction: [0, 0, -1], type: 'liquid_in', defaultMedia: 'fuel_gas' }
        },
        parameters: {
            duty:       { value: 6000, unit: 'kW',  label: 'Total värmeeffekt' },
            passes:     { value: 2,    unit: 'st',  label: 'Antal pass' },
            tempOut:    { value: 350,  unit: '°C',  label: 'Uttemp' },
            wallTemp:   { value: 450,  unit: '°C',  label: 'Rörväggstemp' },
            efficiency: { value: 90,   unit: '%',   label: 'Verkningsgrad' }
        },
        color: 0xc62828,
        buildMesh(THREE) {
            const group = new THREE.Group();
            const bodyMat = new THREE.MeshStandardMaterial({ color: this.color });
            const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x78909c });
            const glowMat = new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: 0xff3300, emissiveIntensity: 0.6 });

            // Main body – deeper Z for realistic burner row
            const body = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 1.0, 1.5),
                bodyMat
            );
            group.add(body);

            // Convection section
            const conv = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 0.2, 1.5),
                new THREE.MeshStandardMaterial({ color: 0x8d6e63 })
            );
            conv.position.y = 0.6;
            group.add(conv);

            // Central tube wall (vertical tubes running through center)
            const tubeMat = new THREE.MeshStandardMaterial({ color: 0xbcaaa4 });
            for (let i = 0; i < 8; i++) {
                const tube = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.025, 0.025, 0.85, 6),
                    tubeMat
                );
                tube.position.set(-0.55 + i * 0.155, 0, 0);
                group.add(tube);
            }

            // Firebox glows on both sides (front and back)
            for (const zOff of [0.751, -0.751]) {
                const glow = new THREE.Mesh(
                    new THREE.PlaneGeometry(1.2, 0.5),
                    glowMat
                );
                glow.position.set(0, -0.1, zOff);
                if (zOff < 0) glow.rotation.y = Math.PI;
                group.add(glow);
            }

            // Burner row on both sides (5 burners × 2 sides = 10 burners along Z)
            const burnerMat = new THREE.MeshStandardMaterial({ color: 0xff8a00, emissive: 0xff6600, emissiveIntensity: 0.4 });
            for (const zOff of [0.55, -0.55]) {
                for (const xOff of [-0.5, -0.25, 0, 0.25, 0.5]) {
                    const burner = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.04, 0.05, 0.08, 8),
                        burnerMat
                    );
                    burner.position.set(xOff, -0.5, zOff);
                    group.add(burner);
                }
            }

            // Single stack (centered)
            const stackMat = new THREE.MeshStandardMaterial({ color: 0x78909c });
            const stack = new THREE.Mesh(
                new THREE.CylinderGeometry(0.12, 0.14, 0.6, 10),
                stackMat
            );
            stack.position.set(0, 0.98, 0);
            group.add(stack);

            // Nozzles - pass 1 & 2 (left/right)
            const nozzleGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.25, 8);
            const n1in = new THREE.Mesh(nozzleGeo, nozzleMat);
            n1in.rotation.z = Math.PI / 2;
            n1in.position.set(-0.8, 0.2, 0);
            group.add(n1in);
            const n1out = new THREE.Mesh(nozzleGeo, nozzleMat);
            n1out.rotation.z = Math.PI / 2;
            n1out.position.set(0.8, 0.2, 0);
            group.add(n1out);
            const n2in = new THREE.Mesh(nozzleGeo, nozzleMat);
            n2in.rotation.z = Math.PI / 2;
            n2in.position.set(-0.8, -0.1, 0);
            group.add(n2in);
            const n2out = new THREE.Mesh(nozzleGeo, nozzleMat);
            n2out.rotation.z = Math.PI / 2;
            n2out.position.set(0.8, -0.1, 0);
            group.add(n2out);

            // Fuel nozzles (bottom, front and back)
            const nFuel1 = new THREE.Mesh(nozzleGeo, nozzleMat);
            nFuel1.rotation.x = Math.PI / 2;
            nFuel1.position.set(0, -0.45, 0.78);
            group.add(nFuel1);
            const nFuel2 = new THREE.Mesh(nozzleGeo, nozzleMat);
            nFuel2.rotation.x = Math.PI / 2;
            nFuel2.position.set(0, -0.45, -0.78);
            group.add(nFuel2);

            return group;
        }
    },

    natural_draft_furnace: {
        type: 'furnace',
        subtype: 'natural_draft',
        name: 'Självdragsugn (A-E)',
        icon: '🔥',
        category: 'Ugnar',
        description: 'Bred självdragsugn med spjäll för luftreglering. Förbränningsluften sugs in under ugnen. 5 sektioner (A-E) för hög kapacitet. Dubbla skorstenar.',
        ports: {
            pass_a_in:  { position: [-1.2, 0.3, 0],   direction: [-1, 0, 0], type: 'liquid_in' },
            pass_a_out: { position: [1.2, 0.3, 0],    direction: [1, 0, 0],  type: 'liquid_out' },
            pass_b_in:  { position: [-1.2, 0.15, 0],  direction: [-1, 0, 0], type: 'liquid_in' },
            pass_b_out: { position: [1.2, 0.15, 0],   direction: [1, 0, 0],  type: 'liquid_out' },
            pass_c_in:  { position: [-1.2, 0.0, 0],   direction: [-1, 0, 0], type: 'liquid_in' },
            pass_c_out: { position: [1.2, 0.0, 0],    direction: [1, 0, 0],  type: 'liquid_out' },
            pass_d_in:  { position: [-1.2, -0.15, 0], direction: [-1, 0, 0], type: 'liquid_in' },
            pass_d_out: { position: [1.2, -0.15, 0],  direction: [1, 0, 0],  type: 'liquid_out' },
            pass_e_in:  { position: [-1.2, -0.3, 0],  direction: [-1, 0, 0], type: 'liquid_in' },
            pass_e_out: { position: [1.2, -0.3, 0],   direction: [1, 0, 0],  type: 'liquid_out' },
            fuel_in:    { position: [0, -0.55, 0.75], direction: [0, 0, 1],  type: 'liquid_in', defaultMedia: 'fuel_gas' }
        },
        parameters: {
            duty:       { value: 6500, unit: 'kW',  label: 'Total värmeeffekt' },
            passes:     { value: 5,    unit: 'st',  label: 'Antal sektioner' },
            tempOut_A:  { value: 310,  unit: '°C',  label: 'Uttemp Sektion A' },
            tempOut_B:  { value: 295,  unit: '°C',  label: 'Uttemp Sektion B' },
            tempOut_C:  { value: 278,  unit: '°C',  label: 'Uttemp Sektion C' },
            tempOut_D:  { value: 260,  unit: '°C',  label: 'Uttemp Sektion D' },
            tempOut_E:  { value: 240,  unit: '°C',  label: 'Uttemp Sektion E' },
            draftType:  { value: 'Naturlig', unit: '', label: 'Dragtyp' },
            o2:         { value: 3,    unit: '%',   label: 'O₂ i rökgas' },
            efficiency: { value: 86,   unit: '%',   label: 'Verkningsgrad' }
        },
        color: 0xff5722,
        buildMesh(THREE) {
            const group = new THREE.Group();
            const bodyMat = new THREE.MeshStandardMaterial({ color: this.color });
            const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x78909c });
            const glowMat = new THREE.MeshStandardMaterial({ color: 0xff8a00, emissive: 0xff6600, emissiveIntensity: 0.5 });
            const damperMat = new THREE.MeshStandardMaterial({ color: 0x607d8b });

            // Main body - wider for 5 sections
            const body = new THREE.Mesh(
                new THREE.BoxGeometry(2.2, 1.1, 1.4),
                bodyMat
            );
            group.add(body);

            // Convection section (top, lighter)
            const conv = new THREE.Mesh(
                new THREE.BoxGeometry(2.2, 0.3, 1.4),
                new THREE.MeshStandardMaterial({ color: 0xbf360c })
            );
            conv.position.y = 0.7;
            group.add(conv);

            // Air dampers (spjäll) - 8 louvers along front
            for (let i = 0; i < 8; i++) {
                const damper = new THREE.Mesh(
                    new THREE.BoxGeometry(0.19, 0.015, 0.08),
                    damperMat
                );
                damper.position.set(-0.83 + i * 0.237, -0.55, 0.71);
                damper.rotation.x = 0.3;
                group.add(damper);
            }

            // Damper frame
            const frameMat = new THREE.MeshStandardMaterial({ color: 0x455a64 });
            const frameH = new THREE.Mesh(new THREE.BoxGeometry(1.96, 0.02, 0.02), frameMat);
            frameH.position.set(0, -0.48, 0.71);
            group.add(frameH);
            const frameH2 = new THREE.Mesh(new THREE.BoxGeometry(1.96, 0.02, 0.02), frameMat);
            frameH2.position.set(0, -0.56, 0.71);
            group.add(frameH2);

            // 4 internal dividers creating 5 cells, each 0.44 wide
            const divMat = new THREE.MeshStandardMaterial({ color: 0x5d4037 });
            for (const xOff of [-0.66, -0.22, 0.22, 0.66]) {
                const div = new THREE.Mesh(
                    new THREE.BoxGeometry(0.04, 0.95, 1.36),
                    divMat
                );
                div.position.set(xOff, 0.03, 0);
                group.add(div);
            }

            // 5 firebox glows (section centers at ±0.88, ±0.44, 0)
            for (const xOff of [-0.88, -0.44, 0, 0.44, 0.88]) {
                const glow = new THREE.Mesh(
                    new THREE.PlaneGeometry(0.3, 0.4),
                    glowMat
                );
                glow.position.set(xOff, -0.1, 0.701);
                group.add(glow);
            }

            // Single stack (centered, tall for natural draft)
            const stackMat = new THREE.MeshStandardMaterial({ color: 0x78909c });
            const stack = new THREE.Mesh(
                new THREE.CylinderGeometry(0.14, 0.18, 0.9, 12),
                stackMat
            );
            stack.position.set(0, 1.28, 0);
            group.add(stack);

            // Stack damper (single)
            const stackDamper = new THREE.Mesh(
                new THREE.BoxGeometry(0.28, 0.015, 0.28),
                damperMat
            );
            stackDamper.position.set(0, 0.9, 0);
            stackDamper.rotation.z = 0.15;
            group.add(stackDamper);

            // O2 sensor on stack
            const sensor = new THREE.Mesh(
                new THREE.BoxGeometry(0.06, 0.06, 0.06),
                new THREE.MeshStandardMaterial({ color: 0x4caf50 })
            );
            sensor.position.set(0.2, 1.1, 0);
            group.add(sensor);

            // Nozzles - 5 passes (left/right at 5 y-levels)
            const nozzleGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.25, 8);
            const yPositions = [0.3, 0.15, 0.0, -0.15, -0.3];
            for (const yp of yPositions) {
                const nIn = new THREE.Mesh(nozzleGeo, nozzleMat);
                nIn.rotation.z = Math.PI / 2;
                nIn.position.set(-1.15, yp, 0);
                group.add(nIn);
                const nOut = new THREE.Mesh(nozzleGeo, nozzleMat);
                nOut.rotation.z = Math.PI / 2;
                nOut.position.set(1.15, yp, 0);
                group.add(nOut);
            }

            // Fuel nozzle
            const nFuel = new THREE.Mesh(nozzleGeo, nozzleMat);
            nFuel.rotation.x = Math.PI / 2;
            nFuel.position.set(0, -0.5, 0.75);
            group.add(nFuel);

            return group;
        }
    },

    crude_charge_heater: {
        type: 'furnace',
        subtype: 'crude_charge',
        name: 'Råoljeugn',
        icon: '🔥',
        category: 'Ugnar',
        description: 'Stor ugn för uppvärmning av avsaltad råolja till ~370°C innan atmosfärisk destillation. Hög kapacitet med shield-sektion mellan strålnings- och konvektionszon.',
        ports: {
            crude_in:   { position: [-1.0, 0, 0],    direction: [-1, 0, 0], type: 'liquid_in' },
            crude_out:  { position: [1.0, 0.3, 0],   direction: [1, 0, 0],  type: 'liquid_out' },
            preheat_in: { position: [-1.0, 0.4, 0],  direction: [-1, 0, 0], type: 'liquid_in' },
            preheat_out:{ position: [1.0, 0.6, 0],   direction: [1, 0, 0],  type: 'liquid_out' },
            fuel_in:    { position: [0, -0.55, 0.78], direction: [0, 0, 1],  type: 'liquid_in', defaultMedia: 'fuel_gas' },
            steam_in:   { position: [0.5, 0.8, 0.78], direction: [0, 0, 1],  type: 'liquid_in', defaultMedia: 'steam_mp' }
        },
        parameters: {
            duty:       { value: 15000, unit: 'kW',  label: 'Värmeeffekt' },
            tempIn:     { value: 250,   unit: '°C',  label: 'Intemp' },
            tempOut:    { value: 370,   unit: '°C',  label: 'Uttemp (COT)' },
            flowRate:   { value: 500,   unit: 'm³/h', label: 'Flöde' },
            fuelType:   { value: 'Bränngas', unit: '', label: 'Bränsle' },
            efficiency: { value: 90,    unit: '%',   label: 'Verkningsgrad' }
        },
        color: 0xd84315,
        buildMesh(THREE) {
            const group = new THREE.Group();
            const bodyMat = new THREE.MeshStandardMaterial({ color: this.color });
            const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x78909c });
            const glowMat = new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: 0xff3300, emissiveIntensity: 0.6 });

            // Large radiation section
            const body = new THREE.Mesh(
                new THREE.BoxGeometry(1.8, 1.1, 1.5),
                bodyMat
            );
            group.add(body);

            // Shield section (between radiant and convection)
            const shieldMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63 });
            const shield = new THREE.Mesh(
                new THREE.BoxGeometry(1.8, 0.15, 1.5),
                shieldMat
            );
            shield.position.y = 0.625;
            group.add(shield);

            // Shield tubes (bare tubes protecting convection)
            const tubeMat = new THREE.MeshStandardMaterial({ color: 0xbcaaa4 });
            for (let i = 0; i < 6; i++) {
                const tube = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.03, 0.03, 1.4, 6),
                    tubeMat
                );
                tube.rotation.x = Math.PI / 2;
                tube.position.set(-0.6 + i * 0.24, 0.62, 0);
                group.add(tube);
            }

            // Convection section with finned tube indicators
            const convMat = new THREE.MeshStandardMaterial({ color: 0xa1887f });
            const conv = new THREE.Mesh(
                new THREE.BoxGeometry(1.8, 0.35, 1.5),
                convMat
            );
            conv.position.y = 0.88;
            group.add(conv);

            // Finned tube indicators in convection
            for (let i = 0; i < 4; i++) {
                const fin = new THREE.Mesh(
                    new THREE.BoxGeometry(1.6, 0.02, 0.08),
                    tubeMat
                );
                fin.position.set(0, 0.74 + i * 0.08, 0);
                group.add(fin);
            }

            // Dual firebox glow panels
            for (const xOff of [-0.45, 0.45]) {
                const glow = new THREE.Mesh(
                    new THREE.PlaneGeometry(0.6, 0.5),
                    glowMat
                );
                glow.position.set(xOff, -0.1, 0.751);
                group.add(glow);
            }

            // Floor burners in 2 rows along Z (5 × 2 = 10 burners)
            const burnerMat = new THREE.MeshStandardMaterial({ color: 0xff8a00, emissive: 0xff6600, emissiveIntensity: 0.4 });
            for (const xOff of [-0.6, -0.3, 0, 0.3]) {
                for (const zOff of [-0.35, 0.35]) {
                    const burner = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.055, 0.065, 0.08, 8),
                        burnerMat
                    );
                    burner.position.set(xOff, -0.55, zOff);
                    group.add(burner);
                }
            }

            // Large stack
            const stackMat = new THREE.MeshStandardMaterial({ color: 0x78909c });
            const stack = new THREE.Mesh(
                new THREE.CylinderGeometry(0.14, 0.17, 0.7, 12),
                stackMat
            );
            stack.position.set(0, 1.4, 0);
            group.add(stack);

            // Nozzles
            const nozzleGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.3, 8);
            const nCrIn = new THREE.Mesh(nozzleGeo, nozzleMat);
            nCrIn.rotation.z = Math.PI / 2;
            nCrIn.position.set(-0.95, 0, 0);
            group.add(nCrIn);
            const nCrOut = new THREE.Mesh(nozzleGeo, nozzleMat);
            nCrOut.rotation.z = Math.PI / 2;
            nCrOut.position.set(0.95, 0.3, 0);
            group.add(nCrOut);
            const nPrIn = new THREE.Mesh(nozzleGeo, nozzleMat);
            nPrIn.rotation.z = Math.PI / 2;
            nPrIn.position.set(-0.95, 0.4, 0);
            group.add(nPrIn);
            const nPrOut = new THREE.Mesh(nozzleGeo, nozzleMat);
            nPrOut.rotation.z = Math.PI / 2;
            nPrOut.position.set(0.95, 0.6, 0);
            group.add(nPrOut);
            const nFuel = new THREE.Mesh(nozzleGeo, nozzleMat);
            nFuel.rotation.x = Math.PI / 2;
            nFuel.position.set(0, -0.5, 0.78);
            group.add(nFuel);
            const nSteam = new THREE.Mesh(nozzleGeo, nozzleMat);
            nSteam.rotation.x = Math.PI / 2;
            nSteam.position.set(0.5, 0.8, 0.78);
            group.add(nSteam);

            return group;
        }
    },

    vacuum_heater: {
        type: 'furnace',
        subtype: 'vacuum',
        name: 'Vakuumugn',
        icon: '🔥',
        category: 'Ugnar',
        description: 'Ugn för uppvärmning av tung restolja vid lågt tryck och hög temperatur (~425°C). Stor rörborrning för hantering av höga flödeshastigheter.',
        ports: {
            feed_in:    { position: [-1.0, 0.1, 0],   direction: [-1, 0, 0], type: 'liquid_in' },
            product_out:{ position: [1.0, 0.3, 0],    direction: [1, 0, 0],  type: 'liquid_out' },
            steam_in:   { position: [-1.0, 0.4, 0],   direction: [-1, 0, 0], type: 'liquid_in', defaultMedia: 'steam_mp' },
            fuel_in:    { position: [0, -0.55, 0.8],   direction: [0, 0, 1],  type: 'liquid_in', defaultMedia: 'fuel_gas' }
        },
        parameters: {
            duty:       { value: 12000, unit: 'kW',   label: 'Värmeeffekt' },
            tempOut:    { value: 425,   unit: '°C',   label: 'Uttemp (COT)' },
            pressure:   { value: 0.15,  unit: 'barg', label: 'Arbetstryck' },
            tubeSize:   { value: 8,     unit: 'inch', label: 'Rördimension' },
            efficiency: { value: 87,    unit: '%',    label: 'Verkningsgrad' }
        },
        color: 0xc62828,
        buildMesh(THREE) {
            const group = new THREE.Group();
            const bodyMat = new THREE.MeshStandardMaterial({ color: this.color });
            const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x78909c });
            const glowMat = new THREE.MeshStandardMaterial({ color: 0xff5500, emissive: 0xff3300, emissiveIntensity: 0.7 });

            // Tall radiation section (needs large volume for low pressure)
            const body = new THREE.Mesh(
                new THREE.BoxGeometry(1.8, 1.3, 1.5),
                bodyMat
            );
            body.position.y = 0.1;
            group.add(body);

            // Convection section
            const conv = new THREE.Mesh(
                new THREE.BoxGeometry(1.8, 0.3, 1.5),
                new THREE.MeshStandardMaterial({ color: 0x8d6e63 })
            );
            conv.position.y = 0.9;
            group.add(conv);

            // Large-bore tubes visible on sides (thicker than normal)
            const tubeMat = new THREE.MeshStandardMaterial({ color: 0x90a4ae });
            for (let i = 0; i < 4; i++) {
                const tube = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.06, 0.06, 1.3, 8),
                    tubeMat
                );
                tube.rotation.x = Math.PI / 2;
                tube.position.set(-0.4 + i * 0.27, 0.1, 0);
                group.add(tube);
            }

            // Firebox glow
            const glow = new THREE.Mesh(
                new THREE.PlaneGeometry(1.4, 0.6),
                glowMat
            );
            glow.position.set(0, -0.15, 0.751);
            group.add(glow);

            // Vacuum indicator label area (dark panel)
            const vacPanel = new THREE.Mesh(
                new THREE.PlaneGeometry(0.3, 0.15),
                new THREE.MeshStandardMaterial({ color: 0x1a237e })
            );
            vacPanel.position.set(0.6, 0.5, 0.752);
            group.add(vacPanel);

            // Stack
            const stack = new THREE.Mesh(
                new THREE.CylinderGeometry(0.13, 0.16, 0.7, 12),
                new THREE.MeshStandardMaterial({ color: 0x78909c })
            );
            stack.position.set(0, 1.4, 0);
            group.add(stack);

            // Nozzles (larger bore)
            const nozzleGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.3, 8);
            const nFeedIn = new THREE.Mesh(nozzleGeo, nozzleMat);
            nFeedIn.rotation.z = Math.PI / 2;
            nFeedIn.position.set(-0.95, 0.1, 0);
            group.add(nFeedIn);
            const nProdOut = new THREE.Mesh(nozzleGeo, nozzleMat);
            nProdOut.rotation.z = Math.PI / 2;
            nProdOut.position.set(0.95, 0.3, 0);
            group.add(nProdOut);
            const nSteam = new THREE.Mesh(nozzleGeo, nozzleMat);
            nSteam.rotation.z = Math.PI / 2;
            nSteam.position.set(-0.95, 0.4, 0);
            group.add(nSteam);
            const nFuel = new THREE.Mesh(nozzleGeo, nozzleMat);
            nFuel.rotation.x = Math.PI / 2;
            nFuel.position.set(0, -0.5, 0.78);
            group.add(nFuel);

            return group;
        }
    },

    coker_heater: {
        type: 'furnace',
        subtype: 'coker',
        name: 'Kokerugn',
        icon: '🔥',
        category: 'Ugnar',
        description: 'Ugn för delayed coking. Värmer tung restolja till krackningstemperatur (~500°C). Designad för att hantera koksavlagringar i rören med regelbunden avkoksning.',
        ports: {
            feed_in:    { position: [-1.0, -0.1, 0],  direction: [-1, 0, 0], type: 'liquid_in' },
            product_out:{ position: [1.0, 0.2, 0],    direction: [1, 0, 0],  type: 'liquid_out' },
            steam_in:   { position: [-1.0, 0.3, 0],   direction: [-1, 0, 0], type: 'liquid_in', defaultMedia: 'steam_hp' },
            decoke_in:  { position: [0, -0.55, 0.8],   direction: [0, 0, 1],  type: 'liquid_in' },
            fuel_in:    { position: [0, -0.55, -0.8],  direction: [0, 0, -1], type: 'liquid_in', defaultMedia: 'fuel_gas' }
        },
        parameters: {
            duty:       { value: 10000, unit: 'kW',  label: 'Värmeeffekt' },
            tempOut:    { value: 500,   unit: '°C',  label: 'Uttemp (COT)' },
            cokeRate:   { value: 0.5,   unit: 'mm/dag', label: 'Koksbildning' },
            decokeInt:  { value: 90,    unit: 'dagar', label: 'Avkoksningsintervall' },
            passes:     { value: 2,     unit: 'st',  label: 'Antal pass' },
            efficiency: { value: 85,    unit: '%',   label: 'Verkningsgrad' }
        },
        color: 0x4e342e,
        buildMesh(THREE) {
            const group = new THREE.Group();
            const bodyMat = new THREE.MeshStandardMaterial({ color: this.color });
            const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x78909c });
            const glowMat = new THREE.MeshStandardMaterial({ color: 0xff5500, emissive: 0xff3300, emissiveIntensity: 0.7 });

            // Heavy-duty body (extra thick walls for coke handling)
            const body = new THREE.Mesh(
                new THREE.BoxGeometry(1.6, 1.2, 1.5),
                bodyMat
            );
            body.position.y = 0.05;
            group.add(body);

            // Convection section
            const conv = new THREE.Mesh(
                new THREE.BoxGeometry(1.6, 0.25, 1.5),
                new THREE.MeshStandardMaterial({ color: 0x3e2723 })
            );
            conv.position.y = 0.78;
            group.add(conv);

            // Two-pass coils (left and right halves)
            const tubeMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63 });
            for (const xOff of [-0.35, 0.35]) {
                for (let i = 0; i < 5; i++) {
                    const tube = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.04, 0.04, 1.3, 6),
                        tubeMat
                    );
                    tube.rotation.x = Math.PI / 2;
                    tube.position.set(xOff, -0.2 + i * 0.15, 0);
                    group.add(tube);
                }
            }

            // Center wall between passes
            const centerWall = new THREE.Mesh(
                new THREE.BoxGeometry(0.06, 1.0, 1.4),
                new THREE.MeshStandardMaterial({ color: 0x5d4037 })
            );
            centerWall.position.y = 0.05;
            group.add(centerWall);

            // Coke buildup indicators (dark deposits on tubes, bottom half)
            const cokeMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
            for (const xOff of [-0.35, 0.35]) {
                const coke = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.06, 0.05, 0.3, 6),
                    cokeMat
                );
                coke.rotation.x = Math.PI / 2;
                coke.position.set(xOff, -0.2, 0);
                group.add(coke);
            }

            // Firebox glows
            for (const xOff of [-0.35, 0.35]) {
                const glow = new THREE.Mesh(
                    new THREE.PlaneGeometry(0.5, 0.5),
                    glowMat
                );
                glow.position.set(xOff, -0.15, 0.751);
                group.add(glow);
            }

            // Single stack (centered)
            const stackMat = new THREE.MeshStandardMaterial({ color: 0x78909c });
            const stack = new THREE.Mesh(
                new THREE.CylinderGeometry(0.12, 0.15, 0.65, 10),
                stackMat
            );
            stack.position.set(0, 1.2, 0);
            group.add(stack);

            // Nozzles
            const nozzleGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.3, 8);
            const nFeedIn = new THREE.Mesh(nozzleGeo, nozzleMat);
            nFeedIn.rotation.z = Math.PI / 2;
            nFeedIn.position.set(-0.95, -0.1, 0);
            group.add(nFeedIn);
            const nProdOut = new THREE.Mesh(nozzleGeo, nozzleMat);
            nProdOut.rotation.z = Math.PI / 2;
            nProdOut.position.set(0.95, 0.2, 0);
            group.add(nProdOut);
            const nSteam = new THREE.Mesh(nozzleGeo, nozzleMat);
            nSteam.rotation.z = Math.PI / 2;
            nSteam.position.set(-0.95, 0.3, 0);
            group.add(nSteam);
            // Decoke inlet (front bottom)
            const nDecoke = new THREE.Mesh(nozzleGeo, nozzleMat);
            nDecoke.rotation.x = Math.PI / 2;
            nDecoke.position.set(0, -0.5, 0.78);
            group.add(nDecoke);
            const nFuel = new THREE.Mesh(nozzleGeo, nozzleMat);
            nFuel.rotation.x = Math.PI / 2;
            nFuel.position.set(0, -0.5, -0.78);
            group.add(nFuel);

            return group;
        }
    },

    reboiler_furnace: {
        type: 'furnace',
        subtype: 'reboiler',
        name: 'Uppkokarugn',
        icon: '🔥',
        category: 'Ugnar',
        description: 'Eldad uppkokare som förångar vätska från kolonners botten för att driva separationen. Typiskt kopplad till stabiliserare eller splitters.',
        ports: {
            liquid_in:  { position: [-0.7, -0.15, 0], direction: [-1, 0, 0], type: 'liquid_in' },
            vapor_out:  { position: [0.7, 0.15, 0],   direction: [1, 0, 0],  type: 'liquid_out' },
            fuel_in:    { position: [0, -0.4, 0.7],    direction: [0, 0, 1],  type: 'liquid_in', defaultMedia: 'fuel_gas' }
        },
        parameters: {
            duty:       { value: 1500, unit: 'kW',  label: 'Värmeeffekt' },
            tempOut:    { value: 200,  unit: '°C',  label: 'Uttemp' },
            vaporFrac:  { value: 30,   unit: '%',   label: 'Ångfraktion' },
            efficiency: { value: 83,   unit: '%',   label: 'Verkningsgrad' }
        },
        color: 0xe65100,
        buildMesh(THREE) {
            const group = new THREE.Group();
            const bodyMat = new THREE.MeshStandardMaterial({ color: this.color });
            const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x78909c });
            const glowMat = new THREE.MeshStandardMaterial({ color: 0xff8a00, emissive: 0xff6600, emissiveIntensity: 0.5 });

            // Compact body (smaller than process furnace)
            const body = new THREE.Mesh(
                new THREE.BoxGeometry(1.0, 0.7, 1.3),
                bodyMat
            );
            group.add(body);

            // Convection section
            const conv = new THREE.Mesh(
                new THREE.BoxGeometry(1.0, 0.15, 1.3),
                new THREE.MeshStandardMaterial({ color: 0xbf360c })
            );
            conv.position.y = 0.425;
            group.add(conv);

            // U-tube coil indicator (single pass, return)
            const tubeMat = new THREE.MeshStandardMaterial({ color: 0x90a4ae });
            // Horizontal tubes
            for (let i = 0; i < 3; i++) {
                const tube = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.03, 0.03, 1.1, 6),
                    tubeMat
                );
                tube.rotation.x = Math.PI / 2;
                tube.position.set(0, -0.05 + i * 0.1, 0);
                group.add(tube);
            }
            // U-bend indicators
            for (let i = 0; i < 3; i++) {
                const bend = new THREE.Mesh(
                    new THREE.TorusGeometry(0.05, 0.02, 6, 8, Math.PI),
                    tubeMat
                );
                bend.rotation.y = Math.PI / 2;
                bend.position.set(0, -0.05 + i * 0.1, 0.55);
                group.add(bend);
            }

            // Firebox glow
            const glow = new THREE.Mesh(
                new THREE.PlaneGeometry(0.6, 0.35),
                glowMat
            );
            glow.position.set(0, -0.05, 0.651);
            group.add(glow);

            // Floor burners in a row along Z
            const burnerMat = new THREE.MeshStandardMaterial({ color: 0xff8a00, emissive: 0xff6600, emissiveIntensity: 0.4 });
            for (const zOff of [-0.35, 0, 0.35]) {
                const burner = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.04, 0.05, 0.07, 8),
                    burnerMat
                );
                burner.position.set(0, -0.38, zOff);
                group.add(burner);
            }

            // Small stack
            const stack = new THREE.Mesh(
                new THREE.CylinderGeometry(0.08, 0.1, 0.4, 10),
                new THREE.MeshStandardMaterial({ color: 0x78909c })
            );
            stack.position.set(0, 0.7, 0);
            group.add(stack);

            // Nozzles
            const nozzleGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.25, 8);
            const nIn = new THREE.Mesh(nozzleGeo, nozzleMat);
            nIn.rotation.z = Math.PI / 2;
            nIn.position.set(-0.6, -0.15, 0);
            group.add(nIn);
            const nOut = new THREE.Mesh(nozzleGeo, nozzleMat);
            nOut.rotation.z = Math.PI / 2;
            nOut.position.set(0.6, 0.15, 0);
            group.add(nOut);
            const nFuel = new THREE.Mesh(nozzleGeo, nozzleMat);
            nFuel.rotation.x = Math.PI / 2;
            nFuel.position.set(0, -0.35, 0.68);
            group.add(nFuel);

            return group;
        }
    },

    smr_furnace: {
        type: 'furnace',
        subtype: 'smr',
        name: 'Ångreformerugn (SMR)',
        icon: '🔥',
        category: 'Ugnar',
        description: 'Steam Methane Reformer - ugn med långa katalysatorfyllda rör för vätgasproduktion. Metan + ånga → H₂ + CO. Kan eldas från toppen, sidan eller terrass.',
        ports: {
            feed_in:    { position: [-1.0, 0.2, 0],   direction: [-1, 0, 0], type: 'liquid_in' },
            syngas_out: { position: [1.0, -0.2, 0],   direction: [1, 0, 0],  type: 'liquid_out' },
            steam_in:   { position: [-1.0, -0.2, 0],  direction: [-1, 0, 0], type: 'liquid_in', defaultMedia: 'steam_hp' },
            fluegas_out:{ position: [0, 1.1, 0],      direction: [0, 1, 0],  type: 'liquid_out', defaultMedia: 'flue_gas' },
            fuel_in:    { position: [0.5, -0.6, 0.75], direction: [0, 0, 1],  type: 'liquid_in', defaultMedia: 'fuel_gas' }
        },
        parameters: {
            duty:       { value: 20000, unit: 'kW',  label: 'Värmeeffekt' },
            tempOut:    { value: 850,   unit: '°C',  label: 'Uttemp' },
            steamRatio: { value: 3.0,   unit: 'mol/mol', label: 'Ånga/kol-kvot' },
            h2Prod:     { value: 5000,  unit: 'Nm³/h', label: 'H₂-produktion' },
            tubeCount:  { value: 200,   unit: 'st',  label: 'Antal reformerrör' },
            efficiency: { value: 88,    unit: '%',   label: 'Verkningsgrad' }
        },
        color: 0xad1457,
        buildMesh(THREE) {
            const group = new THREE.Group();
            const bodyMat = new THREE.MeshStandardMaterial({ color: this.color });
            const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x78909c });
            const glowMat = new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: 0xff3300, emissiveIntensity: 0.6 });

            // Large tall body (reformer box)
            const body = new THREE.Mesh(
                new THREE.BoxGeometry(1.8, 1.4, 1.4),
                bodyMat
            );
            body.position.y = 0.15;
            group.add(body);

            // Convection section
            const conv = new THREE.Mesh(
                new THREE.BoxGeometry(1.8, 0.3, 1.4),
                new THREE.MeshStandardMaterial({ color: 0x880e4f })
            );
            conv.position.y = 1.0;
            group.add(conv);

            // Catalyst-filled tubes (vertical, taller than normal)
            const catTubeMat = new THREE.MeshStandardMaterial({ color: 0xbcaaa4 });
            for (let col = 0; col < 6; col++) {
                for (let row = 0; row < 3; row++) {
                    const tube = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.03, 0.03, 1.1, 6),
                        catTubeMat
                    );
                    tube.position.set(-0.6 + col * 0.24, 0.1, -0.4 + row * 0.4);
                    group.add(tube);
                }
            }

            // Catalyst fill indicator (slightly thicker section inside tubes)
            const catFillMat = new THREE.MeshStandardMaterial({ color: 0x6d4c41, transparent: true, opacity: 0.6 });
            for (let col = 0; col < 3; col++) {
                const fill = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.05, 0.05, 0.8, 6),
                    catFillMat
                );
                fill.position.set(-0.6 + col * 0.48, 0, 0);
                group.add(fill);
            }

            // Side-wall burner indicators
            const burnerMat = new THREE.MeshStandardMaterial({ color: 0xff8a00, emissive: 0xff6600, emissiveIntensity: 0.4 });
            for (let i = 0; i < 4; i++) {
                for (const zOff of [0.701, -0.701]) {
                    const burner = new THREE.Mesh(
                        new THREE.SphereGeometry(0.04, 8, 8),
                        burnerMat
                    );
                    burner.position.set(-0.5 + i * 0.33, -0.1, zOff);
                    group.add(burner);
                }
            }

            // Firebox glow
            const glow = new THREE.Mesh(
                new THREE.PlaneGeometry(1.5, 0.8),
                glowMat
            );
            glow.position.set(0, -0.05, 0.702);
            group.add(glow);

            // Stack
            const stack = new THREE.Mesh(
                new THREE.CylinderGeometry(0.15, 0.18, 0.7, 12),
                new THREE.MeshStandardMaterial({ color: 0x78909c })
            );
            stack.position.set(0, 1.5, 0);
            group.add(stack);

            // Nozzles
            const nozzleGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.3, 8);
            // Feed in (left, upper)
            const nFeed = new THREE.Mesh(nozzleGeo, nozzleMat);
            nFeed.rotation.z = Math.PI / 2;
            nFeed.position.set(-0.95, 0.2, 0);
            group.add(nFeed);
            // Syngas out (right, lower)
            const nSyn = new THREE.Mesh(nozzleGeo, nozzleMat);
            nSyn.rotation.z = Math.PI / 2;
            nSyn.position.set(0.95, -0.2, 0);
            group.add(nSyn);
            // Steam in (left, lower)
            const nSteam = new THREE.Mesh(nozzleGeo, nozzleMat);
            nSteam.rotation.z = Math.PI / 2;
            nSteam.position.set(-0.95, -0.2, 0);
            group.add(nSteam);
            // Flue gas out (top)
            const nFlue = new THREE.Mesh(nozzleGeo, nozzleMat);
            nFlue.position.set(0, 1.1, 0);
            group.add(nFlue);
            // Fuel (right bottom front)
            const nFuel = new THREE.Mesh(nozzleGeo, nozzleMat);
            nFuel.rotation.x = Math.PI / 2;
            nFuel.position.set(0.5, -0.55, 0.75);
            group.add(nFuel);

            return group;
        }
    },

    // --- Ugnar utan eget stack (ansluts till centralskorsten) ---

    crude_charge_heater_shared: {
        type: 'furnace',
        subtype: 'crude_charge_shared',
        name: 'Råoljeugn (Gem. stack)',
        icon: '🔥',
        category: 'Ugnar',
        description: 'Råoljeugn utan eget stack – rökgaserna leds via kanal till centralskorsten. Annars identisk med Råoljeugnen: shield-sektion och konvektionszon.',
        ports: {
            crude_in:    { position: [-1.0, 0, 0],    direction: [-1, 0, 0], type: 'liquid_in' },
            crude_out:   { position: [1.0, 0.3, 0],   direction: [1, 0, 0],  type: 'liquid_out' },
            preheat_in:  { position: [-1.0, 0.4, 0],  direction: [-1, 0, 0], type: 'liquid_in' },
            preheat_out: { position: [1.0, 0.6, 0],   direction: [1, 0, 0],  type: 'liquid_out' },
            fuel_in:     { position: [0, -0.55, 0.5],  direction: [0, 0, 1],  type: 'liquid_in', defaultMedia: 'fuel_gas' },
            steam_in:    { position: [0.5, 0.8, 0.5],  direction: [0, 0, 1],  type: 'liquid_in', defaultMedia: 'steam_mp' },
            flue_gas_out:{ position: [0, 1.2, 0],      direction: [0, 1, 0],  type: 'liquid_out', defaultMedia: 'flue_gas' }
        },
        parameters: {
            duty:       { value: 15000, unit: 'kW',  label: 'Värmeeffekt' },
            tempIn:     { value: 250,   unit: '°C',  label: 'Intemp' },
            tempOut:    { value: 370,   unit: '°C',  label: 'Uttemp (COT)' },
            flowRate:   { value: 500,   unit: 'm³/h', label: 'Flöde' },
            fuelType:   { value: 'Bränngas', unit: '', label: 'Bränsle' },
            efficiency: { value: 90,    unit: '%',   label: 'Verkningsgrad' }
        },
        color: 0xd84315,
        buildMesh(THREE) {
            const group = new THREE.Group();
            const bodyMat = new THREE.MeshStandardMaterial({ color: this.color });
            const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x78909c });
            const glowMat = new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: 0xff3300, emissiveIntensity: 0.6 });

            // Large radiation section
            const body = new THREE.Mesh(
                new THREE.BoxGeometry(1.8, 1.1, 1.0),
                bodyMat
            );
            group.add(body);

            // Shield section
            const shieldMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63 });
            const shield = new THREE.Mesh(
                new THREE.BoxGeometry(1.8, 0.15, 1.0),
                shieldMat
            );
            shield.position.y = 0.625;
            group.add(shield);

            // Shield tubes
            const tubeMat = new THREE.MeshStandardMaterial({ color: 0xbcaaa4 });
            for (let i = 0; i < 6; i++) {
                const tube = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.03, 0.03, 0.9, 6),
                    tubeMat
                );
                tube.rotation.x = Math.PI / 2;
                tube.position.set(-0.6 + i * 0.24, 0.62, 0);
                group.add(tube);
            }

            // Convection section
            const convMat = new THREE.MeshStandardMaterial({ color: 0xa1887f });
            const conv = new THREE.Mesh(
                new THREE.BoxGeometry(1.8, 0.35, 1.0),
                convMat
            );
            conv.position.y = 0.88;
            group.add(conv);

            // Finned tubes in convection
            for (let i = 0; i < 4; i++) {
                const fin = new THREE.Mesh(
                    new THREE.BoxGeometry(1.6, 0.02, 0.08),
                    tubeMat
                );
                fin.position.set(0, 0.74 + i * 0.08, 0);
                group.add(fin);
            }

            // Firebox glows
            for (const xOff of [-0.45, 0.45]) {
                const glow = new THREE.Mesh(
                    new THREE.PlaneGeometry(0.6, 0.5),
                    glowMat
                );
                glow.position.set(xOff, -0.1, 0.501);
                group.add(glow);
            }

            // Floor burners
            const burnerMat = new THREE.MeshStandardMaterial({ color: 0xff8a00, emissive: 0xff6600, emissiveIntensity: 0.4 });
            for (const xOff of [-0.5, -0.2, 0.1, 0.4]) {
                const burner = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.06, 0.07, 0.08, 8),
                    burnerMat
                );
                burner.position.set(xOff, -0.55, 0);
                group.add(burner);
            }

            // Flue gas outlet duct (replaces stack) – short rectangular duct on top
            const ductMat = new THREE.MeshStandardMaterial({ color: 0x546e7a });
            const duct = new THREE.Mesh(
                new THREE.BoxGeometry(0.35, 0.25, 0.35),
                ductMat
            );
            duct.position.set(0, 1.19, 0);
            group.add(duct);
            // Flue gas nozzle pointing up
            const flueNozzle = new THREE.Mesh(
                new THREE.CylinderGeometry(0.12, 0.14, 0.2, 10),
                nozzleMat
            );
            flueNozzle.position.set(0, 1.35, 0);
            group.add(flueNozzle);

            // Process nozzles
            const nozzleGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.3, 8);
            const nCrIn = new THREE.Mesh(nozzleGeo, nozzleMat);
            nCrIn.rotation.z = Math.PI / 2;
            nCrIn.position.set(-0.95, 0, 0);
            group.add(nCrIn);
            const nCrOut = new THREE.Mesh(nozzleGeo, nozzleMat);
            nCrOut.rotation.z = Math.PI / 2;
            nCrOut.position.set(0.95, 0.3, 0);
            group.add(nCrOut);
            const nPrIn = new THREE.Mesh(nozzleGeo, nozzleMat);
            nPrIn.rotation.z = Math.PI / 2;
            nPrIn.position.set(-0.95, 0.4, 0);
            group.add(nPrIn);
            const nPrOut = new THREE.Mesh(nozzleGeo, nozzleMat);
            nPrOut.rotation.z = Math.PI / 2;
            nPrOut.position.set(0.95, 0.6, 0);
            group.add(nPrOut);
            const nFuel = new THREE.Mesh(nozzleGeo, nozzleMat);
            nFuel.rotation.x = Math.PI / 2;
            nFuel.position.set(0, -0.5, 0.5);
            group.add(nFuel);
            const nSteam = new THREE.Mesh(nozzleGeo, nozzleMat);
            nSteam.rotation.x = Math.PI / 2;
            nSteam.position.set(0.5, 0.8, 0.5);
            group.add(nSteam);

            return group;
        }
    },

    dual_fired_furnace_shared: {
        type: 'furnace',
        subtype: 'dual_fired_shared',
        name: 'Dubbeleldad ugn (Gem. stack)',
        icon: '🔥',
        category: 'Ugnar',
        description: 'Boxugn eldad från båda sidor utan eget stack. Rökgaserna samlas i gemensam breaching och leds till centralskorsten. 2 pass, hög kapacitet.',
        ports: {
            pass1_in:    { position: [-0.85, 0.2, 0],  direction: [-1, 0, 0], type: 'liquid_in' },
            pass1_out:   { position: [0.85, 0.2, 0],   direction: [1, 0, 0],  type: 'liquid_out' },
            pass2_in:    { position: [-0.85, -0.1, 0], direction: [-1, 0, 0], type: 'liquid_in' },
            pass2_out:   { position: [0.85, -0.1, 0],  direction: [1, 0, 0],  type: 'liquid_out' },
            fuel_in_1:   { position: [0, -0.5, 0.55],  direction: [0, 0, 1],  type: 'liquid_in', defaultMedia: 'fuel_gas' },
            fuel_in_2:   { position: [0, -0.5, -0.55], direction: [0, 0, -1], type: 'liquid_in', defaultMedia: 'fuel_gas' },
            flue_gas_out:{ position: [0, 0.82, 0],      direction: [0, 1, 0],  type: 'liquid_out', defaultMedia: 'flue_gas' }
        },
        parameters: {
            duty:       { value: 6000, unit: 'kW',  label: 'Total värmeeffekt' },
            passes:     { value: 2,    unit: 'st',  label: 'Antal pass' },
            tempOut:    { value: 350,  unit: '°C',  label: 'Uttemp' },
            wallTemp:   { value: 450,  unit: '°C',  label: 'Rörväggstemp' },
            efficiency: { value: 90,   unit: '%',   label: 'Verkningsgrad' }
        },
        color: 0xc62828,
        buildMesh(THREE) {
            const group = new THREE.Group();
            const bodyMat = new THREE.MeshStandardMaterial({ color: this.color });
            const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x78909c });
            const glowMat = new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: 0xff3300, emissiveIntensity: 0.6 });

            const body = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 1.0, 1.0),
                bodyMat
            );
            group.add(body);

            const conv = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 0.2, 1.0),
                new THREE.MeshStandardMaterial({ color: 0x8d6e63 })
            );
            conv.position.y = 0.6;
            group.add(conv);

            // Central tube wall
            const tubeMat = new THREE.MeshStandardMaterial({ color: 0xbcaaa4 });
            for (let i = 0; i < 8; i++) {
                const tube = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.025, 0.025, 0.85, 6),
                    tubeMat
                );
                tube.position.set(-0.55 + i * 0.155, 0, 0);
                group.add(tube);
            }

            // Firebox glows front and back
            for (const zOff of [0.501, -0.501]) {
                const glow = new THREE.Mesh(
                    new THREE.PlaneGeometry(1.2, 0.5),
                    glowMat
                );
                glow.position.set(0, -0.1, zOff);
                if (zOff < 0) glow.rotation.y = Math.PI;
                group.add(glow);
            }

            // Burners
            const burnerMat = new THREE.MeshStandardMaterial({ color: 0xff8a00, emissive: 0xff6600, emissiveIntensity: 0.4 });
            for (const zOff of [0.35, -0.35]) {
                for (const xOff of [-0.4, 0, 0.4]) {
                    const burner = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.05, 0.06, 0.1, 8),
                        burnerMat
                    );
                    burner.position.set(xOff, -0.5, zOff);
                    group.add(burner);
                }
            }

            // Flue gas outlet duct on top (replaces dual stacks)
            const ductMat = new THREE.MeshStandardMaterial({ color: 0x546e7a });
            const duct = new THREE.Mesh(
                new THREE.BoxGeometry(0.6, 0.18, 0.5),
                ductMat
            );
            duct.position.set(0, 0.79, 0);
            group.add(duct);
            const flueNozzle = new THREE.Mesh(
                new THREE.CylinderGeometry(0.12, 0.14, 0.18, 10),
                nozzleMat
            );
            flueNozzle.position.set(0, 0.92, 0);
            group.add(flueNozzle);

            // Process nozzles
            const nozzleGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.25, 8);
            for (const [y, side] of [[0.2, 1], [-0.1, 1]]) {
                const nIn = new THREE.Mesh(nozzleGeo, nozzleMat);
                nIn.rotation.z = Math.PI / 2;
                nIn.position.set(-0.8, y, 0);
                group.add(nIn);
                const nOut = new THREE.Mesh(nozzleGeo, nozzleMat);
                nOut.rotation.z = Math.PI / 2;
                nOut.position.set(0.8, y, 0);
                group.add(nOut);
            }
            const nFuel1 = new THREE.Mesh(nozzleGeo, nozzleMat);
            nFuel1.rotation.x = Math.PI / 2;
            nFuel1.position.set(0, -0.45, 0.5);
            group.add(nFuel1);
            const nFuel2 = new THREE.Mesh(nozzleGeo, nozzleMat);
            nFuel2.rotation.x = Math.PI / 2;
            nFuel2.position.set(0, -0.45, -0.5);
            group.add(nFuel2);

            return group;
        }
    },

    coker_heater_shared: {
        type: 'furnace',
        subtype: 'coker_shared',
        name: 'Kokerugn (Gem. stack)',
        icon: '🔥',
        category: 'Ugnar',
        description: 'Kokerugn för delayed coking utan eget stack. Rökgaser leds via breaching till centralskorsten. 2 pass, designad för koksavlagringar med avkoksning.',
        ports: {
            feed_in:     { position: [-1.0, -0.1, 0], direction: [-1, 0, 0], type: 'liquid_in' },
            product_out: { position: [1.0, 0.2, 0],   direction: [1, 0, 0],  type: 'liquid_out' },
            steam_in:    { position: [-1.0, 0.3, 0],  direction: [-1, 0, 0], type: 'liquid_in', defaultMedia: 'steam_hp' },
            decoke_in:   { position: [0, -0.55, 0.5],  direction: [0, 0, 1],  type: 'liquid_in' },
            fuel_in:     { position: [0, -0.55, -0.5], direction: [0, 0, -1], type: 'liquid_in', defaultMedia: 'fuel_gas' },
            flue_gas_out:{ position: [0, 1.0, 0],       direction: [0, 1, 0],  type: 'liquid_out', defaultMedia: 'flue_gas' }
        },
        parameters: {
            duty:       { value: 10000, unit: 'kW',     label: 'Värmeeffekt' },
            tempOut:    { value: 500,   unit: '°C',     label: 'Uttemp (COT)' },
            cokeRate:   { value: 0.5,   unit: 'mm/dag', label: 'Koksbildning' },
            decokeInt:  { value: 90,    unit: 'dagar',  label: 'Avkoksningsintervall' },
            passes:     { value: 2,     unit: 'st',     label: 'Antal pass' },
            efficiency: { value: 85,    unit: '%',      label: 'Verkningsgrad' }
        },
        color: 0x4e342e,
        buildMesh(THREE) {
            const group = new THREE.Group();
            const bodyMat = new THREE.MeshStandardMaterial({ color: this.color });
            const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x78909c });
            const glowMat = new THREE.MeshStandardMaterial({ color: 0xff5500, emissive: 0xff3300, emissiveIntensity: 0.7 });

            const body = new THREE.Mesh(
                new THREE.BoxGeometry(1.6, 1.2, 1.0),
                bodyMat
            );
            body.position.y = 0.05;
            group.add(body);

            const conv = new THREE.Mesh(
                new THREE.BoxGeometry(1.6, 0.25, 1.0),
                new THREE.MeshStandardMaterial({ color: 0x3e2723 })
            );
            conv.position.y = 0.78;
            group.add(conv);

            // Two-pass coils
            const tubeMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63 });
            for (const xOff of [-0.35, 0.35]) {
                for (let i = 0; i < 5; i++) {
                    const tube = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.04, 0.04, 0.8, 6),
                        tubeMat
                    );
                    tube.rotation.x = Math.PI / 2;
                    tube.position.set(xOff, -0.2 + i * 0.15, 0);
                    group.add(tube);
                }
            }

            const centerWall = new THREE.Mesh(
                new THREE.BoxGeometry(0.06, 1.0, 0.9),
                new THREE.MeshStandardMaterial({ color: 0x5d4037 })
            );
            centerWall.position.y = 0.05;
            group.add(centerWall);

            // Coke deposits
            const cokeMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
            for (const xOff of [-0.35, 0.35]) {
                const coke = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.06, 0.05, 0.3, 6),
                    cokeMat
                );
                coke.rotation.x = Math.PI / 2;
                coke.position.set(xOff, -0.2, 0);
                group.add(coke);
            }

            for (const xOff of [-0.35, 0.35]) {
                const glow = new THREE.Mesh(
                    new THREE.PlaneGeometry(0.5, 0.5),
                    glowMat
                );
                glow.position.set(xOff, -0.15, 0.501);
                group.add(glow);
            }

            // Flue gas outlet duct on top (replaces dual stacks)
            const ductMat = new THREE.MeshStandardMaterial({ color: 0x546e7a });
            const duct = new THREE.Mesh(
                new THREE.BoxGeometry(0.5, 0.18, 0.5),
                ductMat
            );
            duct.position.set(0, 0.99, 0);
            group.add(duct);
            const flueNozzle = new THREE.Mesh(
                new THREE.CylinderGeometry(0.12, 0.14, 0.18, 10),
                nozzleMat
            );
            flueNozzle.position.set(0, 1.11, 0);
            group.add(flueNozzle);

            // Process nozzles
            const nozzleGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.3, 8);
            const nFeedIn = new THREE.Mesh(nozzleGeo, nozzleMat);
            nFeedIn.rotation.z = Math.PI / 2;
            nFeedIn.position.set(-0.95, -0.1, 0);
            group.add(nFeedIn);
            const nProdOut = new THREE.Mesh(nozzleGeo, nozzleMat);
            nProdOut.rotation.z = Math.PI / 2;
            nProdOut.position.set(0.95, 0.2, 0);
            group.add(nProdOut);
            const nSteam = new THREE.Mesh(nozzleGeo, nozzleMat);
            nSteam.rotation.z = Math.PI / 2;
            nSteam.position.set(-0.95, 0.3, 0);
            group.add(nSteam);
            const nDecoke = new THREE.Mesh(nozzleGeo, nozzleMat);
            nDecoke.rotation.x = Math.PI / 2;
            nDecoke.position.set(0, -0.5, 0.5);
            group.add(nDecoke);
            const nFuel = new THREE.Mesh(nozzleGeo, nozzleMat);
            nFuel.rotation.x = Math.PI / 2;
            nFuel.position.set(0, -0.5, -0.5);
            group.add(nFuel);

            return group;
        }
    },

    multi_pass_furnace_shared: {
        type: 'furnace',
        subtype: 'multi_pass_shared',
        name: 'Flerpassugn (Gem. stack)',
        icon: '🔥',
        category: 'Ugnar',
        description: 'Bred 6-sektionsugn (A-F) utan eget stack. Rökgaserna samlas i gemensam öppning på taket och leds till centralskorsten via kanaler.',
        ports: {
            pass_a_in:   { position: [-1.5, 0.25, 0],   direction: [-1, 0, 0], type: 'liquid_in' },
            pass_a_out:  { position: [1.5, 0.25, 0],    direction: [1, 0, 0],  type: 'liquid_out' },
            pass_b_in:   { position: [-1.5, 0.08, 0],   direction: [-1, 0, 0], type: 'liquid_in' },
            pass_b_out:  { position: [1.5, 0.08, 0],    direction: [1, 0, 0],  type: 'liquid_out' },
            pass_c_in:   { position: [-1.5, -0.08, 0],  direction: [-1, 0, 0], type: 'liquid_in' },
            pass_c_out:  { position: [1.5, -0.08, 0],   direction: [1, 0, 0],  type: 'liquid_out' },
            pass_d_in:   { position: [0, 0.25, -0.55],  direction: [0, 0, -1], type: 'liquid_in' },
            pass_d_out:  { position: [0, 0.25, 0.55],   direction: [0, 0, 1],  type: 'liquid_out' },
            pass_e_in:   { position: [0, 0.08, -0.55],  direction: [0, 0, -1], type: 'liquid_in' },
            pass_e_out:  { position: [0, 0.08, 0.55],   direction: [0, 0, 1],  type: 'liquid_out' },
            pass_f_in:   { position: [0, -0.08, -0.55], direction: [0, 0, -1], type: 'liquid_in' },
            pass_f_out:  { position: [0, -0.08, 0.55],  direction: [0, 0, 1],  type: 'liquid_out' },
            fuel_in:     { position: [0, -0.5, 0.55],   direction: [0, 0, 1],  type: 'liquid_in', defaultMedia: 'fuel_gas' },
            flue_gas_out:{ position: [0, 0.8, 0],        direction: [0, 1, 0],  type: 'liquid_out', defaultMedia: 'flue_gas' }
        },
        parameters: {
            duty:       { value: 12000, unit: 'kW',  label: 'Total värmeeffekt' },
            passes:     { value: 6,     unit: 'st',  label: 'Antal pass' },
            tempOut_A:  { value: 310,   unit: '°C',  label: 'Uttemp Pass A' },
            tempOut_B:  { value: 295,   unit: '°C',  label: 'Uttemp Pass B' },
            tempOut_C:  { value: 280,   unit: '°C',  label: 'Uttemp Pass C' },
            tempOut_D:  { value: 265,   unit: '°C',  label: 'Uttemp Pass D' },
            tempOut_E:  { value: 250,   unit: '°C',  label: 'Uttemp Pass E' },
            tempOut_F:  { value: 235,   unit: '°C',  label: 'Uttemp Pass F' },
            efficiency: { value: 89,    unit: '%',   label: 'Verkningsgrad' }
        },
        color: 0xd84315,
        buildMesh(THREE) {
            const group = new THREE.Group();
            const bodyMat = new THREE.MeshStandardMaterial({ color: this.color });
            const sectionMat = new THREE.MeshStandardMaterial({ color: 0xbf360c });
            const dividerMat = new THREE.MeshStandardMaterial({ color: 0x5d4037 });
            const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x78909c });
            const glowMat = new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: 0xff3300, emissiveIntensity: 0.6 });

            const body = new THREE.Mesh(
                new THREE.BoxGeometry(2.8, 1.0, 1.0),
                bodyMat
            );
            group.add(body);

            const conv = new THREE.Mesh(
                new THREE.BoxGeometry(2.8, 0.25, 1.0),
                sectionMat
            );
            conv.position.y = 0.625;
            group.add(conv);

            for (const xPos of [-0.933, -0.467, 0, 0.467, 0.933]) {
                const divider = new THREE.Mesh(
                    new THREE.BoxGeometry(0.04, 0.85, 0.96),
                    dividerMat
                );
                divider.position.set(xPos, 0.05, 0);
                group.add(divider);
            }

            for (const xc of [-1.167, -0.7, -0.233, 0.233, 0.7, 1.167]) {
                const glow = new THREE.Mesh(
                    new THREE.PlaneGeometry(0.33, 0.4),
                    glowMat
                );
                glow.position.set(xc, -0.1, 0.501);
                group.add(glow);
            }

            // Wide flue gas collector duct on top (no stacks)
            const ductMat = new THREE.MeshStandardMaterial({ color: 0x546e7a });
            const duct = new THREE.Mesh(
                new THREE.BoxGeometry(1.2, 0.18, 0.6),
                ductMat
            );
            duct.position.set(0, 0.79, 0);
            group.add(duct);
            // Central flue gas outlet nozzle
            const flueNozzle = new THREE.Mesh(
                new THREE.CylinderGeometry(0.15, 0.18, 0.2, 10),
                nozzleMat
            );
            flueNozzle.position.set(0, 0.93, 0);
            group.add(flueNozzle);

            // Nozzles for passes A-C (left/right)
            const nozzleGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.3, 8);
            const yLevels = [0.25, 0.08, -0.08];
            for (let i = 0; i < 3; i++) {
                const nIn = new THREE.Mesh(nozzleGeo, nozzleMat);
                nIn.rotation.z = Math.PI / 2;
                nIn.position.set(-1.45, yLevels[i], 0);
                group.add(nIn);
                const nOut = new THREE.Mesh(nozzleGeo, nozzleMat);
                nOut.rotation.z = Math.PI / 2;
                nOut.position.set(1.45, yLevels[i], 0);
                group.add(nOut);
            }

            // Nozzles for passes D-F (front/back)
            for (let i = 0; i < 3; i++) {
                const nIn = new THREE.Mesh(nozzleGeo, nozzleMat);
                nIn.rotation.x = Math.PI / 2;
                nIn.position.set(0, yLevels[i], -0.5);
                group.add(nIn);
                const nOut = new THREE.Mesh(nozzleGeo, nozzleMat);
                nOut.rotation.x = Math.PI / 2;
                nOut.position.set(0, yLevels[i], 0.5);
                group.add(nOut);
            }

            const nFuel = new THREE.Mesh(nozzleGeo, nozzleMat);
            nFuel.rotation.x = Math.PI / 2;
            nFuel.position.set(0, -0.45, 0.5);
            group.add(nFuel);

            return group;
        }
    },

    // --- Centralskorsten ---

    central_stack: {
        type: 'stack',
        subtype: 'central',
        name: 'Centralskorsten',
        icon: '🏭',
        category: 'Ugnar',
        description: 'Gemensam industriskorsten som tar emot rökgaser från flera ugnar via breaching-kanaler. Högt drag tack vare naturlig konvektion i den höga skorstenspipan.',
        ports: {
            gas_in_1: { position: [-0.78, -0.8, 0],   direction: [-1, 0, 0], type: 'liquid_in', defaultMedia: 'flue_gas' },
            gas_in_2: { position: [0.78, -0.8, 0],    direction: [1, 0, 0],  type: 'liquid_in', defaultMedia: 'flue_gas' },
            gas_in_3: { position: [0, -0.8, -0.78],   direction: [0, 0, -1], type: 'liquid_in', defaultMedia: 'flue_gas' },
            gas_in_4: { position: [0, -0.8, 0.78],    direction: [0, 0, 1],  type: 'liquid_in', defaultMedia: 'flue_gas' }
        },
        parameters: {
            height:        { value: 60,    unit: 'm',      label: 'Höjd' },
            capacity:      { value: 80000, unit: 'Nm³/h',  label: 'Kapacitet' },
            draftPressure: { value: -18,   unit: 'mmH₂O',  label: 'Dragkraft' },
            exitTemp:      { value: 160,   unit: '°C',     label: 'Avgastemperatur' },
            material:      { value: 'Stål', unit: '',      label: 'Material' }
        },
        color: 0x78909c,
        buildMesh(THREE) {
            const group = new THREE.Group();
            const stackMat = new THREE.MeshStandardMaterial({ color: this.color });
            const baseMat = new THREE.MeshStandardMaterial({ color: 0x546e7a });
            const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x607d8b });
            const inletMat = new THREE.MeshStandardMaterial({ color: 0x455a64 });

            // Wide breaching base box (rökgassamlaren)
            const base = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 0.5, 1.5),
                baseMat
            );
            base.position.y = -0.8;
            group.add(base);

            // Base corner reinforcements
            const cornerMat = new THREE.MeshStandardMaterial({ color: 0x37474f });
            for (const [cx, cz] of [[-0.67, -0.67], [0.67, -0.67], [-0.67, 0.67], [0.67, 0.67]]) {
                const corner = new THREE.Mesh(
                    new THREE.BoxGeometry(0.15, 0.54, 0.15),
                    cornerMat
                );
                corner.position.set(cx, -0.8, cz);
                group.add(corner);
            }

            // Gas inlet flanges (4 sides of base)
            for (const [ix, iz] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
                const flange = new THREE.Mesh(
                    new THREE.BoxGeometry(0.30, 0.30, 0.10),
                    inletMat
                );
                flange.position.set(ix !== 0 ? (ix > 0 ? 0.8 : -0.8) : 0,
                                    -0.8,
                                    iz !== 0 ? (iz > 0 ? 0.8 : -0.8) : 0);
                if (iz !== 0) flange.rotation.y = Math.PI / 2;
                group.add(flange);
            }

            // Transition piece (base → chimney body, octagonal feel)
            const transition = new THREE.Mesh(
                new THREE.CylinderGeometry(0.35, 0.58, 0.5, 8),
                baseMat
            );
            transition.position.y = -0.4;
            group.add(transition);

            // Main chimney stack (tall cylinder, slightly tapering)
            const chimney = new THREE.Mesh(
                new THREE.CylinderGeometry(0.22, 0.36, 4.5, 16),
                stackMat
            );
            chimney.position.y = 1.9;
            group.add(chimney);

            // Platform ring at ~1/4 height
            const platMat = new THREE.MeshStandardMaterial({ color: 0x546e7a });
            const platform = new THREE.Mesh(
                new THREE.CylinderGeometry(0.46, 0.46, 0.05, 16),
                platMat
            );
            platform.position.y = 0.4;
            group.add(platform);

            // Platform ring at ~1/2 height
            const platform2 = new THREE.Mesh(
                new THREE.CylinderGeometry(0.38, 0.38, 0.05, 16),
                platMat
            );
            platform2.position.y = 2.0;
            group.add(platform2);

            // Platform ring at ~3/4 height
            const platform3 = new THREE.Mesh(
                new THREE.CylinderGeometry(0.30, 0.30, 0.05, 16),
                platMat
            );
            platform3.position.y = 3.6;
            group.add(platform3);

            // Guy wire anchors (3 thin braces from lower platform)
            const wireMat = new THREE.MeshStandardMaterial({ color: 0x90a4ae });
            for (let i = 0; i < 3; i++) {
                const angle = (i / 3) * Math.PI * 2;
                const wire = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.010, 0.010, 1.1, 4),
                    wireMat
                );
                wire.position.set(
                    Math.cos(angle) * 0.30,
                    0.4,
                    Math.sin(angle) * 0.30
                );
                wire.rotation.z = Math.PI / 2 - 0.85;
                wire.rotation.y = angle;
                group.add(wire);
            }

            // Stack cap / cowl at the very top
            const cap = new THREE.Mesh(
                new THREE.CylinderGeometry(0.30, 0.22, 0.15, 12),
                new THREE.MeshStandardMaterial({ color: 0x37474f })
            );
            cap.position.y = 4.23;
            group.add(cap);

            // Lightning rod
            const rod = new THREE.Mesh(
                new THREE.CylinderGeometry(0.010, 0.010, 0.35, 4),
                new THREE.MeshStandardMaterial({ color: 0xffca28 })
            );
            rod.position.y = 4.48;
            group.add(rod);

            // Gas inlet nozzles on sides of base box
            const nozzleGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.30, 8);
            const nozzlePositions = [
                { pos: [-0.85, -0.8, 0], rot: [0, 0, Math.PI / 2] },
                { pos: [0.85, -0.8, 0],  rot: [0, 0, Math.PI / 2] },
                { pos: [0, -0.8, -0.85], rot: [Math.PI / 2, 0, 0] },
                { pos: [0, -0.8, 0.85],  rot: [Math.PI / 2, 0, 0] }
            ];
            for (const np of nozzlePositions) {
                const n = new THREE.Mesh(nozzleGeo, nozzleMat);
                n.rotation.set(...np.rot);
                n.position.set(...np.pos);
                group.add(n);
            }

            return group;
        }
    },

    // --- Kylning ---
    air_cooler: {
        type: 'cooler',
        subtype: 'air',
        name: 'Luftkylare',
        icon: '❄',
        category: 'Kylning',
        description: 'Fläktkyld luftväxlare (fin-fan cooler)',
        ports: {
            inlet:  { position: [-0.6, 0, 0], direction: [-1, 0, 0], type: 'liquid_in' },
            outlet: { position: [0.6, 0, 0],  direction: [1, 0, 0],  type: 'liquid_out' }
        },
        parameters: {
            duty:    { value: 300,  unit: 'kW',  label: 'Kyleffekt' },
            tempOut: { value: 40,   unit: '°C',  label: 'Uttemp' },
            fanSpeed:{ value: 1200, unit: 'rpm', label: 'Fläkthastighet' },
            airTemp: { value: 20,   unit: '°C',  label: 'Lufttemp' }
        },
        color: 0x4dd0e1,
        buildMesh(THREE) {
            const group = new THREE.Group();
            // Header box (tube bundle housing)
            const header = new THREE.Mesh(
                new THREE.BoxGeometry(1.0, 0.2, 0.6),
                new THREE.MeshStandardMaterial({ color: this.color })
            );
            header.position.y = 0.3;
            group.add(header);
            // Fan shroud (cylinder below)
            const shroud = new THREE.Mesh(
                new THREE.CylinderGeometry(0.35, 0.35, 0.15, 24),
                new THREE.MeshStandardMaterial({ color: 0xb0bec5 })
            );
            shroud.position.y = 0.05;
            group.add(shroud);
            // Fan blades
            const bladeMat = new THREE.MeshStandardMaterial({ color: 0x90a4ae });
            for (let i = 0; i < 4; i++) {
                const blade = new THREE.Mesh(
                    new THREE.BoxGeometry(0.28, 0.02, 0.06),
                    bladeMat
                );
                blade.rotation.y = (i * Math.PI) / 4;
                blade.position.y = 0.05;
                group.add(blade);
            }
            // Support legs
            const legMat = new THREE.MeshStandardMaterial({ color: 0x78909c });
            for (const [x, z] of [[-0.4, 0.25], [0.4, 0.25], [-0.4, -0.25], [0.4, -0.25]]) {
                const leg = new THREE.Mesh(
                    new THREE.BoxGeometry(0.05, 0.4, 0.05),
                    legMat
                );
                leg.position.set(x, -0.1, z);
                group.add(leg);
            }
            // Nozzles
            const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x78909c });
            const nozzleGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.2, 8);
            const nIn = new THREE.Mesh(nozzleGeo, nozzleMat);
            nIn.rotation.z = Math.PI / 2;
            nIn.position.set(-0.55, 0.3, 0);
            group.add(nIn);
            const nOut = new THREE.Mesh(nozzleGeo, nozzleMat);
            nOut.rotation.z = Math.PI / 2;
            nOut.position.set(0.55, 0.3, 0);
            group.add(nOut);
            return group;
        }
    },

    cooling_tower: {
        type: 'cooler',
        subtype: 'tower',
        name: 'Kyltorn',
        icon: '🌊',
        category: 'Kylning',
        description: 'Evaporativt kyltorn för kylvattensystem',
        ports: {
            warm_in:    { position: [0, 0.9, 0],     direction: [0, 1, 0],   type: 'liquid_in', defaultMedia: 'cooling_water' },
            makeup_in:  { position: [-0.5, -0.35, 0], direction: [-1, 0, 0],  type: 'liquid_in', defaultMedia: 'cooling_water' },
            cool_out:   { position: [0.5, -0.4, 0],   direction: [1, 0, 0],   type: 'liquid_out', defaultMedia: 'cooling_water' }
        },
        parameters: {
            duty:     { value: 1000, unit: 'kW',  label: 'Kyleffekt' },
            tempOut:  { value: 28,   unit: '°C',  label: 'Uttemp' },
            wetBulb:  { value: 22,   unit: '°C',  label: 'Våttemp' },
            flowRate: { value: 200,  unit: 'm³/h', label: 'Kylvattenflöde' }
        },
        color: 0x26c6da,
        buildMesh(THREE) {
            const group = new THREE.Group();
            // Tower body - tapered cylinder (hyperboloid shape)
            const body = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3, 0.45, 1.2, 16),
                new THREE.MeshStandardMaterial({ color: this.color, transparent: true, opacity: 0.85 })
            );
            body.position.y = 0.2;
            group.add(body);
            // Top lip/rim
            const rim = new THREE.Mesh(
                new THREE.TorusGeometry(0.31, 0.03, 8, 24),
                new THREE.MeshStandardMaterial({ color: 0x00acc1 })
            );
            rim.rotation.x = Math.PI / 2;
            rim.position.y = 0.8;
            group.add(rim);
            // Fill media (internal grating)
            const fill = new THREE.Mesh(
                new THREE.CylinderGeometry(0.25, 0.35, 0.4, 12, 1, true),
                new THREE.MeshStandardMaterial({ color: 0x80deea, wireframe: true })
            );
            fill.position.y = 0.1;
            group.add(fill);
            // Basin at bottom
            const basin = new THREE.Mesh(
                new THREE.CylinderGeometry(0.5, 0.5, 0.15, 16),
                new THREE.MeshStandardMaterial({ color: 0x546e7a })
            );
            basin.position.y = -0.35;
            group.add(basin);
            // Outlet nozzle
            const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x78909c });
            const nOut = new THREE.Mesh(
                new THREE.CylinderGeometry(0.06, 0.06, 0.25, 8),
                nozzleMat
            );
            nOut.rotation.z = Math.PI / 2;
            nOut.position.set(0.45, -0.35, 0);
            group.add(nOut);
            return group;
        }
    },

    heat_exchanger: {
        type: 'heat_exchanger',
        subtype: 'shell_tube',
        name: 'V\u00e4rmev\u00e4xlare',
        icon: '\u2194',
        category: 'V\u00e4rme\u00f6verf\u00f6ring',
        description: 'Shell & tube v\u00e4rmev\u00e4xlare',
        ports: {
            shell_in:  { position: [-0.7, 0.2, 0],  direction: [-1, 0, 0], type: 'liquid_in' },
            shell_out: { position: [0.7, -0.2, 0],   direction: [1, 0, 0],  type: 'liquid_out' },
            tube_in:   { position: [-0.7, -0.2, 0],  direction: [-1, 0, 0], type: 'liquid_in' },
            tube_out:  { position: [0.7, 0.2, 0],    direction: [1, 0, 0],  type: 'liquid_out' }
        },
        parameters: {
            duty:      { value: 500,  unit: 'kW',  label: 'V\u00e4rmeeffekt' },
            hotIn:     { value: 90,   unit: '\u00b0C',   label: 'Varm in' },
            hotOut:    { value: 60,   unit: '\u00b0C',   label: 'Varm ut' },
            coldIn:    { value: 20,   unit: '\u00b0C',   label: 'Kall in' },
            coldOut:   { value: 45,   unit: '\u00b0C',   label: 'Kall ut' }
        },
        color: 0xffee58,
        buildMesh(THREE) {
            const group = new THREE.Group();
            // Shell
            const shell = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3, 0.3, 1.2, 24),
                new THREE.MeshStandardMaterial({ color: this.color })
            );
            shell.rotation.z = Math.PI / 2;
            group.add(shell);

            // End caps
            for (const x of [-0.6, 0.6]) {
                const cap = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.32, 0.32, 0.08, 24),
                    new THREE.MeshStandardMaterial({ color: 0xf9a825 })
                );
                cap.rotation.z = Math.PI / 2;
                cap.position.x = x;
                group.add(cap);
            }

            // Nozzles
            const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x78909c });
            const nozzleGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.2, 8);
            const positions = [
                [-0.4, 0.3, 0], [0.4, -0.3, 0],
                [-0.4, -0.3, 0], [0.4, 0.3, 0]
            ];
            for (const [x, y, z] of positions) {
                const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
                nozzle.position.set(x, y, z);
                group.add(nozzle);
            }
            return group;
        }
    },

    // --- Kolonner ---
    stripper_column: {
        type: 'column',
        subtype: 'stripper',
        name: 'Stripper',
        icon: '⬆',
        category: 'Kolonner',
        description: 'Strippkolonn för avlägsnande av lätta komponenter med ånga',
        ports: {
            feed_in:    { position: [0.45, 0, 0],   direction: [1, 0, 0],  type: 'liquid_in' },
            steam_in:   { position: [0, -0.7, 0.4],  direction: [0, 0, 1],  type: 'liquid_in', defaultMedia: 'steam_lp' },
            top_out:    { position: [0, 1.0, 0],      direction: [0, 1, 0],  type: 'liquid_out' },
            bottom_out: { position: [0, -0.7, -0.4],  direction: [0, 0, -1], type: 'liquid_out' }
        },
        parameters: {
            stages:    { value: 10,  unit: '',    label: 'Antal steg' },
            pressure:  { value: 1.5, unit: 'bar', label: 'Tryck' },
            steamRate: { value: 500, unit: 'kg/h', label: 'Ångflöde' }
        },
        color: 0x9575cd,
        buildMesh(THREE) {
            const group = new THREE.Group();
            const body = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3, 0.3, 1.6, 24),
                new THREE.MeshStandardMaterial({ color: this.color, transparent: true, opacity: 0.85 })
            );
            body.position.y = 0.1;
            group.add(body);
            const top = new THREE.Mesh(
                new THREE.SphereGeometry(0.3, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
                new THREE.MeshStandardMaterial({ color: this.color, transparent: true, opacity: 0.85 })
            );
            top.position.y = 0.9;
            group.add(top);
            const rimMat = new THREE.MeshStandardMaterial({ color: 0xb39ddb });
            for (let i = 0; i < 3; i++) {
                const rim = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.02, 8, 24), rimMat);
                rim.position.y = -0.3 + i * 0.5;
                group.add(rim);
            }
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 2) {
                const leg = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.025, 0.025, 0.4, 6),
                    new THREE.MeshStandardMaterial({ color: 0x78909c })
                );
                leg.position.set(Math.cos(angle) * 0.25, -0.9, Math.sin(angle) * 0.25);
                group.add(leg);
            }
            return group;
        }
    },

    absorber_column: {
        type: 'column',
        subtype: 'absorber',
        name: 'Absorber',
        icon: '⬇',
        category: 'Kolonner',
        description: 'Absorptionskolonn för gasrening (t.ex. aminsystem)',
        ports: {
            gas_in:     { position: [0, -0.7, 0.4],  direction: [0, 0, 1],  type: 'liquid_in' },
            solvent_in: { position: [0, 1.0, 0],       direction: [0, 1, 0],  type: 'liquid_in', defaultMedia: 'amine_lean' },
            gas_out:    { position: [0, 1.0, 0.3],     direction: [0, 1, 0],  type: 'liquid_out' },
            rich_out:   { position: [0.4, -0.7, 0],    direction: [1, 0, 0],  type: 'liquid_out', defaultMedia: 'amine_rich' }
        },
        parameters: {
            stages:   { value: 15,  unit: '',     label: 'Antal steg' },
            pressure: { value: 30,  unit: 'bar',  label: 'Tryck' },
            gasFlow:  { value: 8000, unit: 'Nm³/h', label: 'Gasflöde' }
        },
        color: 0x7986cb,
        buildMesh(THREE) {
            const group = new THREE.Group();
            const body = new THREE.Mesh(
                new THREE.CylinderGeometry(0.32, 0.32, 1.6, 24),
                new THREE.MeshStandardMaterial({ color: this.color, transparent: true, opacity: 0.85 })
            );
            body.position.y = 0.1;
            group.add(body);
            const top = new THREE.Mesh(
                new THREE.SphereGeometry(0.32, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
                new THREE.MeshStandardMaterial({ color: this.color, transparent: true, opacity: 0.85 })
            );
            top.position.y = 0.9;
            group.add(top);
            // Packing section (wireframe)
            const packing = new THREE.Mesh(
                new THREE.CylinderGeometry(0.28, 0.28, 0.8, 12, 4, true),
                new THREE.MeshStandardMaterial({ color: 0x9fa8da, wireframe: true })
            );
            packing.position.y = 0.2;
            group.add(packing);
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 2) {
                const leg = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.025, 0.025, 0.4, 6),
                    new THREE.MeshStandardMaterial({ color: 0x78909c })
                );
                leg.position.set(Math.cos(angle) * 0.27, -0.9, Math.sin(angle) * 0.27);
                group.add(leg);
            }
            return group;
        }
    },

    // --- Separering ---
    three_phase_separator: {
        type: 'separator',
        subtype: 'three_phase',
        name: 'Trefasseparator',
        icon: '⊜',
        category: 'Separering',
        description: 'Horisontell trefasseparator (olja/vatten/gas)',
        ports: {
            feed_in:   { position: [-1.1, 0.15, 0],  direction: [-1, 0, 0], type: 'liquid_in' },
            gas_out:   { position: [0, 0.50, 0],      direction: [0, 1, 0],  type: 'liquid_out' },
            oil_out:   { position: [1.1, 0.10, 0],    direction: [1, 0, 0],  type: 'liquid_out' },
            water_out: { position: [1.1, -0.15, 0],   direction: [1, 0, 0],  type: 'liquid_out' },
            drain:     { position: [0, -0.40, 0.3],   direction: [0, 0, 1],  type: 'liquid_out' }
        },
        parameters: {
            pressure: { value: 8,    unit: 'bar',   label: 'Tryck' },
            temp:     { value: 60,   unit: '°C',    label: 'Temperatur' },
            oilFlow:  { value: 50,   unit: 'm³/h',  label: 'Oljeflöde' },
            gasFlow:  { value: 2000, unit: 'Nm³/h', label: 'Gasflöde' }
        },
        color: 0x78909c,
        buildMesh(THREE) {
            const group = new THREE.Group();
            // Horizontal drum
            const body = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3, 0.3, 1.4, 24),
                new THREE.MeshStandardMaterial({ color: this.color })
            );
            body.rotation.z = Math.PI / 2;
            group.add(body);
            // End caps (ellipsoidal)
            const capMat = new THREE.MeshStandardMaterial({ color: 0x90a4ae });
            for (const x of [-0.7, 0.7]) {
                const cap = new THREE.Mesh(
                    new THREE.SphereGeometry(0.3, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
                    capMat
                );
                cap.rotation.z = x < 0 ? Math.PI / 2 : -Math.PI / 2;
                cap.position.x = x;
                group.add(cap);
            }
            // Saddle supports
            const saddleMat = new THREE.MeshStandardMaterial({ color: 0x546e7a });
            for (const x of [-0.35, 0.35]) {
                const saddle = new THREE.Mesh(
                    new THREE.BoxGeometry(0.08, 0.25, 0.5),
                    saddleMat
                );
                saddle.position.set(x, -0.38, 0);
                group.add(saddle);
            }
            // Gas outlet nozzle (top)
            const nMat = new THREE.MeshStandardMaterial({ color: 0x78909c });
            const gasN = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.2, 8), nMat);
            gasN.position.set(0, 0.35, 0);
            group.add(gasN);
            return group;
        }
    },

    drum: {
        type: 'vessel',
        subtype: 'drum',
        name: 'Drum/Ackumulator',
        icon: '⊖',
        category: 'Separering',
        description: 'Horisontell tryckbehållare (reflux drum, knockout drum)',
        ports: {
            inlet:      { position: [-0.95, 0.15, 0],  direction: [-1, 0, 0], type: 'liquid_in' },
            vapor_out:  { position: [0, 0.35, 0],       direction: [0, 1, 0],  type: 'liquid_out' },
            liquid_out: { position: [0.95, -0.10, 0],   direction: [1, 0, 0],  type: 'liquid_out' },
            drain:      { position: [0, -0.35, 0.25],   direction: [0, 0, 1],  type: 'liquid_out' }
        },
        parameters: {
            volume:   { value: 8,   unit: 'm³',  label: 'Volym' },
            pressure: { value: 3,   unit: 'bar', label: 'Tryck' },
            level:    { value: 50,  unit: '%',   label: 'Nivå' }
        },
        color: 0x90a4ae,
        buildMesh(THREE) {
            const group = new THREE.Group();
            const body = new THREE.Mesh(
                new THREE.CylinderGeometry(0.25, 0.25, 1.2, 24),
                new THREE.MeshStandardMaterial({ color: this.color })
            );
            body.rotation.z = Math.PI / 2;
            group.add(body);
            const capMat = new THREE.MeshStandardMaterial({ color: 0xb0bec5 });
            for (const x of [-0.6, 0.6]) {
                const cap = new THREE.Mesh(
                    new THREE.SphereGeometry(0.25, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
                    capMat
                );
                cap.rotation.z = x < 0 ? Math.PI / 2 : -Math.PI / 2;
                cap.position.x = x;
                group.add(cap);
            }
            const saddleMat = new THREE.MeshStandardMaterial({ color: 0x546e7a });
            for (const x of [-0.3, 0.3]) {
                const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.2, 0.4), saddleMat);
                saddle.position.set(x, -0.35, 0);
                group.add(saddle);
            }
            return group;
        }
    },

    filter: {
        type: 'separator',
        subtype: 'filter',
        name: 'Filter',
        icon: '⊞',
        category: 'Separering',
        description: 'Processfilter för partikelborttagning',
        ports: {
            inlet:  { position: [-0.4, 0, 0], direction: [-1, 0, 0], type: 'liquid_in' },
            outlet: { position: [0.4, 0, 0],  direction: [1, 0, 0],  type: 'liquid_out' }
        },
        parameters: {
            size:     { value: 100, unit: 'mm',  label: 'Storlek' },
            pDrop:    { value: 0.3, unit: 'bar', label: 'Tryckfall' },
            meshSize: { value: 50,  unit: 'µm',  label: 'Filterstorlek' }
        },
        color: 0xbcaaa4,
        buildMesh(THREE) {
            const group = new THREE.Group();
            // Vertical filter housing
            const body = new THREE.Mesh(
                new THREE.CylinderGeometry(0.25, 0.25, 0.7, 16),
                new THREE.MeshStandardMaterial({ color: this.color })
            );
            group.add(body);
            // Top lid
            const lid = new THREE.Mesh(
                new THREE.CylinderGeometry(0.27, 0.27, 0.05, 16),
                new THREE.MeshStandardMaterial({ color: 0x8d6e63 })
            );
            lid.position.y = 0.37;
            group.add(lid);
            // Handle on top
            const handle = new THREE.Mesh(
                new THREE.TorusGeometry(0.08, 0.015, 6, 12),
                new THREE.MeshStandardMaterial({ color: 0x78909c })
            );
            handle.position.y = 0.44;
            group.add(handle);
            // Nozzles
            const nMat = new THREE.MeshStandardMaterial({ color: 0x78909c });
            const nGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.2, 8);
            const nIn = new THREE.Mesh(nGeo, nMat);
            nIn.rotation.z = Math.PI / 2; nIn.position.set(-0.35, 0, 0);
            group.add(nIn);
            const nOut = new THREE.Mesh(nGeo, nMat);
            nOut.rotation.z = Math.PI / 2; nOut.position.set(0.35, 0, 0);
            group.add(nOut);
            return group;
        }
    },

    // --- Lagring ---
    floating_roof_tank: {
        type: 'tank',
        subtype: 'floating_roof',
        name: 'Flytande tak-tank',
        icon: '⊙',
        category: 'Tankar',
        description: 'Stor lagringstank med flytande tak (API 650)',
        ports: {
            inlet:  { position: [0.7, -0.2, 0],   direction: [1, 0, 0],   type: 'liquid_in' },
            outlet: { position: [-0.7, -0.4, 0],  direction: [-1, 0, 0],  type: 'liquid_out' },
            drain:  { position: [0, -0.5, 0.6],   direction: [0, 0, 1],   type: 'liquid_out' }
        },
        parameters: {
            volume:   { value: 5000, unit: 'm³', label: 'Volym' },
            level:    { value: 65,   unit: '%',   label: 'Nivå' },
            diameter: { value: 20,   unit: 'm',   label: 'Diameter' }
        },
        color: 0x8d6e63,
        buildMesh(THREE) {
            const group = new THREE.Group();
            // Large open-top tank
            const body = new THREE.Mesh(
                new THREE.CylinderGeometry(0.6, 0.6, 1.0, 32, 1, true),
                new THREE.MeshStandardMaterial({ color: this.color, side: THREE.DoubleSide })
            );
            body.position.y = 0;
            group.add(body);
            // Bottom plate
            const bottom = new THREE.Mesh(
                new THREE.CircleGeometry(0.6, 32),
                new THREE.MeshStandardMaterial({ color: 0x6d4c41 })
            );
            bottom.rotation.x = -Math.PI / 2;
            bottom.position.y = -0.5;
            group.add(bottom);
            // Floating roof (disc at ~65% height)
            const roof = new THREE.Mesh(
                new THREE.CylinderGeometry(0.57, 0.57, 0.04, 32),
                new THREE.MeshStandardMaterial({ color: 0xa1887f })
            );
            roof.position.y = 0.15;
            group.add(roof);
            // Wind girder (rim at top)
            const girder = new THREE.Mesh(
                new THREE.TorusGeometry(0.6, 0.02, 8, 32),
                new THREE.MeshStandardMaterial({ color: 0x78909c })
            );
            girder.rotation.x = Math.PI / 2;
            girder.position.y = 0.5;
            group.add(girder);
            // Staircase (simplified as angled cylinder)
            const stairMat = new THREE.MeshStandardMaterial({ color: 0x78909c });
            const stair = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.3, 6), stairMat);
            stair.rotation.z = -0.3;
            stair.position.set(0.55, 0.1, 0.2);
            group.add(stair);
            return group;
        }
    },

    sphere_tank: {
        type: 'tank',
        subtype: 'sphere',
        name: 'Sfärtank',
        icon: '◎',
        category: 'Tankar',
        description: 'Horton-sfär för LPG-lagring under tryck',
        ports: {
            inlet:     { position: [0, 0.65, 0],    direction: [0, 1, 0],   type: 'liquid_in' },
            outlet:    { position: [0.5, -0.15, 0],  direction: [1, 0, 0],   type: 'liquid_out' },
            drain:     { position: [0, -0.3, 0.5],   direction: [0, 0, 1],   type: 'liquid_out' },
            relief:    { position: [0, 0.75, 0],      direction: [0, 1, 0],   type: 'liquid_out' }
        },
        parameters: {
            volume:   { value: 500,  unit: 'm³',  label: 'Volym' },
            pressure: { value: 15,   unit: 'bar', label: 'Tryck' },
            level:    { value: 50,   unit: '%',   label: 'Nivå' },
            temp:     { value: 20,   unit: '°C',  label: 'Temperatur' }
        },
        color: 0xbdbdbd,
        buildMesh(THREE) {
            const group = new THREE.Group();
            // Sphere body
            const sphere = new THREE.Mesh(
                new THREE.SphereGeometry(0.55, 24, 16),
                new THREE.MeshStandardMaterial({ color: this.color })
            );
            sphere.position.y = 0.2;
            group.add(sphere);
            // Equator band
            const band = new THREE.Mesh(
                new THREE.TorusGeometry(0.56, 0.015, 8, 32),
                new THREE.MeshStandardMaterial({ color: 0x9e9e9e })
            );
            band.rotation.x = Math.PI / 2;
            band.position.y = 0.2;
            group.add(band);
            // Support legs (8 angled legs)
            const legMat = new THREE.MeshStandardMaterial({ color: 0x78909c });
            for (let i = 0; i < 8; i++) {
                const a = (i / 8) * Math.PI * 2;
                const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.7, 6), legMat);
                leg.position.set(Math.cos(a) * 0.35, -0.35, Math.sin(a) * 0.35);
                // Tilt outward slightly
                leg.rotation.z = Math.cos(a) * 0.15;
                leg.rotation.x = -Math.sin(a) * 0.15;
                group.add(leg);
            }
            return group;
        }
    },

    // --- Bränngasbehållare ---
    fuel_gas_drum: {
        type: 'tank',
        subtype: 'fuel_gas',
        name: 'Bränngasbehållare',
        icon: '◑',
        category: 'Tankar',
        description: 'Horisontell trycktank för bränngas (fuel gas). Samlar och buffrar bränngasflödet till ugnar, pannor och gasbrännare. Vanligtvis gul färg som faromärkning.',
        ports: {
            gas_in:   { position: [-1.05, 0.15, 0],  direction: [-1, 0, 0], type: 'liquid_in',  defaultMedia: 'fuel_gas' },
            gas_out:  { position: [1.05, 0.15, 0],   direction: [1, 0, 0],  type: 'liquid_out', defaultMedia: 'fuel_gas' },
            drain:    { position: [0, -0.38, 0.28],   direction: [0, 0, 1],  type: 'liquid_out' },
            relief:   { position: [0, 0.45, 0],       direction: [0, 1, 0],  type: 'liquid_out', defaultMedia: 'fuel_gas' }
        },
        parameters: {
            volume:   { value: 15,   unit: 'm³',   label: 'Volym' },
            pressure: { value: 3.5,  unit: 'barg', label: 'Tryck' },
            temp:     { value: 50,   unit: '°C',   label: 'Temperatur' },
            level:    { value: 40,   unit: '%',    label: 'Vätskenivå' }
        },
        color: 0xfdd835,
        buildMesh(THREE) {
            const group = new THREE.Group();
            const bodyMat = new THREE.MeshStandardMaterial({ color: this.color });
            const capMat  = new THREE.MeshStandardMaterial({ color: 0xf9a825 });
            const nMat    = new THREE.MeshStandardMaterial({ color: 0x78909c });

            // Horisontell cylinderkropp
            const body = new THREE.Mesh(
                new THREE.CylinderGeometry(0.32, 0.32, 1.8, 24),
                bodyMat
            );
            body.rotation.z = Math.PI / 2;
            group.add(body);

            // Ändlock (halvsfäriska)
            for (const x of [-0.9, 0.9]) {
                const cap = new THREE.Mesh(
                    new THREE.SphereGeometry(0.32, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
                    capMat
                );
                cap.rotation.z = x < 0 ? Math.PI / 2 : -Math.PI / 2;
                cap.position.x = x;
                group.add(cap);
            }

            // Svart farumärkning (diagonal rand)
            for (const x of [-0.45, 0, 0.45]) {
                const band = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.323, 0.323, 0.07, 24),
                    new THREE.MeshStandardMaterial({ color: 0x212121 })
                );
                band.rotation.z = Math.PI / 2;
                band.position.x = x;
                group.add(band);
            }

            // Saddelstöd
            const saddleMat = new THREE.MeshStandardMaterial({ color: 0x78909c });
            for (const x of [-0.45, 0.45]) {
                const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.28, 0.55), saddleMat);
                saddle.position.set(x, -0.42, 0);
                group.add(saddle);
            }

            // Gas inlet nozzle (vänster ändlock)
            const nIn = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.22, 8), nMat);
            nIn.rotation.z = Math.PI / 2;
            nIn.position.set(-1.01, 0.15, 0);
            group.add(nIn);

            // Gas outlet nozzle (höger ändlock)
            const nOut = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.22, 8), nMat);
            nOut.rotation.z = Math.PI / 2;
            nOut.position.set(1.01, 0.15, 0);
            group.add(nOut);

            // PSV/relief nozzle (topp)
            const nRelief = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.2, 8), nMat);
            nRelief.position.set(0, 0.42, 0);
            group.add(nRelief);

            return group;
        }
    },

    // --- Säkerhet & Hjälpsystem ---
    flare_stack: {
        type: 'safety',
        subtype: 'flare',
        name: 'Fackla',
        icon: '🔥',
        category: 'Säkerhet',
        description: 'Säkerhetsfackla för förbränning av övertrycksgas',
        ports: {
            inlet: { position: [0, -0.5, 0.3], direction: [0, 0, 1], type: 'liquid_in', defaultMedia: 'flare_gas' }
        },
        parameters: {
            capacity: { value: 50000, unit: 'kg/h', label: 'Kapacitet' },
            height:   { value: 60,    unit: 'm',    label: 'Höjd' },
            tipDia:   { value: 0.6,   unit: 'm',    label: 'Toppdiameter' }
        },
        color: 0xff8f00,
        buildMesh(THREE) {
            const group = new THREE.Group();
            // Tall stack (narrow cylinder)
            const stack = new THREE.Mesh(
                new THREE.CylinderGeometry(0.06, 0.1, 2.5, 12),
                new THREE.MeshStandardMaterial({ color: 0x78909c })
            );
            stack.position.y = 0.75;
            group.add(stack);
            // Flame tip
            const flame = new THREE.Mesh(
                new THREE.ConeGeometry(0.12, 0.3, 8),
                new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: 0xff3300, emissiveIntensity: 0.8 })
            );
            flame.position.y = 2.15;
            group.add(flame);
            // Flame glow (wider, transparent)
            const glow = new THREE.Mesh(
                new THREE.ConeGeometry(0.2, 0.4, 8),
                new THREE.MeshStandardMaterial({ color: 0xffab00, emissive: 0xff6600, emissiveIntensity: 0.4, transparent: true, opacity: 0.4 })
            );
            glow.position.y = 2.2;
            group.add(glow);
            // Guy wires (3 angled lines)
            const wireMat = new THREE.MeshStandardMaterial({ color: 0x546e7a });
            for (let i = 0; i < 3; i++) {
                const a = (i / 3) * Math.PI * 2;
                const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 2.0, 4), wireMat);
                wire.position.set(Math.cos(a) * 0.4, 0.5, Math.sin(a) * 0.4);
                wire.rotation.z = Math.cos(a) * 0.4;
                wire.rotation.x = -Math.sin(a) * 0.4;
                group.add(wire);
            }
            // Base platform
            const base = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3, 0.3, 0.06, 16),
                new THREE.MeshStandardMaterial({ color: 0x546e7a })
            );
            base.position.y = -0.5;
            group.add(base);
            return group;
        }
    },

    psv: {
        type: 'safety',
        subtype: 'psv',
        name: 'Säkerhetsventil (PSV)',
        icon: '⚠',
        category: 'Säkerhet',
        description: 'Trycksäkerhetsventil (Pressure Safety Valve)',
        ports: {
            inlet:  { position: [0.12, -0.06, 0], direction: [1, 0, 0],  type: 'liquid_in' },
            outlet: { position: [0, 0.2, 0],      direction: [0, 1, 0],  type: 'liquid_out' }
        },
        parameters: {
            setPoint:  { value: 10,  unit: 'bar', label: 'Öppningstryck' },
            size:      { value: 100, unit: 'mm',  label: 'Storlek' },
            capacity:  { value: 5000, unit: 'kg/h', label: 'Kapacitet' }
        },
        color: 0xf44336,
        buildMesh(THREE) {
            const group = new THREE.Group();
            const body = new THREE.Mesh(
                new THREE.CylinderGeometry(0.07, 0.09, 0.18, 12),
                new THREE.MeshStandardMaterial({ color: this.color })
            );
            group.add(body);
            const bonnet = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.07, 0.12, 12),
                new THREE.MeshStandardMaterial({ color: 0xd32f2f })
            );
            bonnet.position.y = 0.14;
            group.add(bonnet);
            const lever = new THREE.Mesh(
                new THREE.BoxGeometry(0.15, 0.01, 0.015),
                new THREE.MeshStandardMaterial({ color: 0x78909c })
            );
            lever.position.set(0.05, 0.2, 0);
            group.add(lever);
            const flange = new THREE.Mesh(
                new THREE.CylinderGeometry(0.1, 0.1, 0.015, 12),
                new THREE.MeshStandardMaterial({ color: 0x78909c })
            );
            flange.position.y = -0.1;
            group.add(flange);
            return group;
        }
    },

    // --- Instrument ---
    flow_meter: {
        type: 'instrument',
        subtype: 'flow',
        name: 'Flödesmätare',
        icon: '◈',
        category: 'Instrument',
        description: 'Inline flödesmätare (orifice/vortex)',
        ports: {
            inlet:  { position: [-0.18, 0, 0], direction: [-1, 0, 0], type: 'liquid_in' },
            outlet: { position: [0.18, 0, 0],  direction: [1, 0, 0],  type: 'liquid_out' }
        },
        parameters: {
            range:   { value: 100, unit: 'm³/h', label: 'Mätområde' },
            signal:  { value: 50,  unit: '%',    label: 'Signal' }
        },
        color: 0x00bcd4,
        buildMesh(THREE) {
            const group = new THREE.Group();
            const pipe = new THREE.Mesh(
                new THREE.CylinderGeometry(0.04, 0.04, 0.25, 12),
                new THREE.MeshStandardMaterial({ color: 0x78909c })
            );
            pipe.rotation.z = Math.PI / 2;
            group.add(pipe);
            const housing = new THREE.Mesh(
                new THREE.BoxGeometry(0.08, 0.1, 0.06),
                new THREE.MeshStandardMaterial({ color: this.color })
            );
            housing.position.y = 0.12;
            group.add(housing);
            const stem = new THREE.Mesh(
                new THREE.CylinderGeometry(0.015, 0.015, 0.08, 8),
                new THREE.MeshStandardMaterial({ color: 0x78909c })
            );
            stem.position.y = 0.06;
            group.add(stem);
            const display = new THREE.Mesh(
                new THREE.PlaneGeometry(0.05, 0.04),
                new THREE.MeshStandardMaterial({ color: 0x00e676, emissive: 0x00c853, emissiveIntensity: 0.3 })
            );
            display.position.set(0, 0.14, 0.035);
            group.add(display);
            return group;
        }
    },

    static_mixer: {
        type: 'instrument',
        subtype: 'mixer',
        name: 'Statisk blandare',
        icon: '⟲',
        category: 'Instrument',
        description: 'Inline statisk blandare för vätskor/gaser',
        ports: {
            inlet_a: { position: [-0.45, 0, 0],   direction: [-1, 0, 0], type: 'liquid_in' },
            inlet_b: { position: [0, 0.25, 0],     direction: [0, 1, 0],  type: 'liquid_in' },
            outlet:  { position: [0.45, 0, 0],     direction: [1, 0, 0],  type: 'liquid_out' }
        },
        parameters: {
            elements: { value: 12, unit: '',    label: 'Antal element' },
            pDrop:    { value: 0.5, unit: 'bar', label: 'Tryckfall' }
        },
        color: 0x26a69a,
        buildMesh(THREE) {
            const group = new THREE.Group();
            // Main pipe section
            const pipe = new THREE.Mesh(
                new THREE.CylinderGeometry(0.12, 0.12, 0.7, 16),
                new THREE.MeshStandardMaterial({ color: this.color, transparent: true, opacity: 0.7 })
            );
            pipe.rotation.z = Math.PI / 2;
            group.add(pipe);
            // Internal mixing elements (twisted planes)
            const mixMat = new THREE.MeshStandardMaterial({ color: 0x80cbc4, side: THREE.DoubleSide });
            for (let i = 0; i < 3; i++) {
                const elem = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.08), mixMat);
                elem.rotation.z = Math.PI / 2;
                elem.rotation.y = (i * Math.PI) / 3;
                elem.position.x = -0.15 + i * 0.15;
                group.add(elem);
            }
            // Flanges
            const flangeMat = new THREE.MeshStandardMaterial({ color: 0x78909c });
            for (const x of [-0.35, 0.35]) {
                const f = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.03, 12), flangeMat);
                f.rotation.z = Math.PI / 2;
                f.position.x = x;
                group.add(f);
            }
            // Branch inlet nozzle
            const nozzle = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.05, 0.2, 8),
                new THREE.MeshStandardMaterial({ color: 0x78909c })
            );
            nozzle.position.set(0, 0.2, 0);
            group.add(nozzle);
            return group;
        }
    },

    // --- Vakuum & Övrigt ---
    ejector: {
        type: 'equipment',
        subtype: 'ejector',
        name: 'Ejektor',
        icon: '⇶',
        category: 'Övrigt',
        description: 'Ångejektor för vakuumsystem',
        ports: {
            motive_in:  { position: [-0.5, 0.15, 0], direction: [-1, 0, 0], type: 'liquid_in' },
            suction_in: { position: [0, 0.3, 0],      direction: [0, 1, 0],  type: 'liquid_in' },
            outlet:     { position: [0.5, 0, 0],       direction: [1, 0, 0],  type: 'liquid_out' }
        },
        parameters: {
            suctionP: { value: 0.1,  unit: 'bar',  label: 'Sugstryck' },
            motiveP:  { value: 10,   unit: 'bar',  label: 'Drivtryck' },
            steamRate: { value: 200, unit: 'kg/h', label: 'Ångförbrukning' }
        },
        color: 0x607d8b,
        buildMesh(THREE) {
            const group = new THREE.Group();
            // Converging nozzle (left, narrow)
            const nozzle = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.12, 0.4, 12),
                new THREE.MeshStandardMaterial({ color: this.color })
            );
            nozzle.rotation.z = Math.PI / 2;
            nozzle.position.x = -0.3;
            group.add(nozzle);
            // Mixing chamber (center)
            const mixing = new THREE.Mesh(
                new THREE.CylinderGeometry(0.08, 0.08, 0.3, 12),
                new THREE.MeshStandardMaterial({ color: 0x78909c })
            );
            mixing.rotation.z = Math.PI / 2;
            group.add(mixing);
            // Diffuser (right, expanding)
            const diffuser = new THREE.Mesh(
                new THREE.CylinderGeometry(0.15, 0.08, 0.4, 12),
                new THREE.MeshStandardMaterial({ color: this.color })
            );
            diffuser.rotation.z = Math.PI / 2;
            diffuser.position.x = 0.3;
            group.add(diffuser);
            // Suction inlet (top)
            const suction = new THREE.Mesh(
                new THREE.CylinderGeometry(0.06, 0.06, 0.2, 8),
                new THREE.MeshStandardMaterial({ color: 0x78909c })
            );
            suction.position.set(0, 0.2, 0);
            group.add(suction);
            return group;
        }
    },

    // --- Nya komponenter ---
    knockout_drum: {
        type: 'vessel',
        subtype: 'knockout',
        name: 'K.O. Behållare',
        icon: '⊘',
        category: 'Separering',
        description: 'Knockout-behållare (vertikal) för att skydda kompressorer från vätskemedfölj',
        ports: {
            inlet:      { position: [0.55, -0.2, 0],   direction: [1, 0, 0],  type: 'liquid_in' },
            gas_out:    { position: [0, 1.15, 0],       direction: [0, 1, 0],  type: 'liquid_out' },
            liquid_out: { position: [0.55, -0.65, 0],  direction: [1, 0, 0],  type: 'liquid_out' }
        },
        parameters: {
            volume:   { value: 5,   unit: 'm³',  label: 'Volym' },
            pressure: { value: 30,  unit: 'bar', label: 'Tryck' },
            level:    { value: 20,  unit: '%',   label: 'Vätske\u00adnivå' }
        },
        color: 0x78909c,
        buildMesh(THREE) {
            const group = new THREE.Group();
            // Vertical cylindrical body
            const body = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3, 0.3, 1.4, 24),
                new THREE.MeshStandardMaterial({ color: this.color })
            );
            body.position.y = 0.1;
            group.add(body);
            // Top dome (torispherical head)
            const topDome = new THREE.Mesh(
                new THREE.SphereGeometry(0.3, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
                new THREE.MeshStandardMaterial({ color: 0x90a4ae })
            );
            topDome.position.y = 0.8;
            group.add(topDome);
            // Bottom dome
            const botDome = new THREE.Mesh(
                new THREE.SphereGeometry(0.3, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
                new THREE.MeshStandardMaterial({ color: 0x90a4ae })
            );
            botDome.rotation.x = Math.PI;
            botDome.position.y = -0.6;
            group.add(botDome);
            // Demister pad (internal mesh, visible as ring)
            const demister = new THREE.Mesh(
                new THREE.TorusGeometry(0.2, 0.04, 8, 24),
                new THREE.MeshStandardMaterial({ color: 0xb0bec5, wireframe: true })
            );
            demister.rotation.x = Math.PI / 2;
            demister.position.y = 0.45;
            group.add(demister);
            // Nozzles
            const nMat = new THREE.MeshStandardMaterial({ color: 0x546e7a });
            // Inlet nozzle (side)
            const nIn = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.2, 8), nMat);
            nIn.rotation.z = Math.PI / 2;
            nIn.position.set(0.4, -0.2, 0);
            group.add(nIn);
            // Gas outlet nozzle (top)
            const nGas = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.2, 8), nMat);
            nGas.position.set(0, 0.95, 0);
            group.add(nGas);
            // Liquid outlet nozzle (bottom side)
            const nLiq = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.2, 8), nMat);
            nLiq.rotation.z = Math.PI / 2;
            nLiq.position.set(0.4, -0.65, 0);
            group.add(nLiq);
            // Support skirt
            const skirt = new THREE.Mesh(
                new THREE.CylinderGeometry(0.32, 0.35, 0.2, 24, 1, true),
                new THREE.MeshStandardMaterial({ color: 0x455a64 })
            );
            skirt.position.y = -0.8;
            group.add(skirt);
            return group;
        }
    },

    piston_compressor: {
        type: 'compressor',
        subtype: 'piston',
        name: 'Kolvkompressor',
        icon: '⚙',
        category: 'Pumpar',
        description: 'Kolvkompressor (reciprocerande) för gasservice',
        ports: {
            suction:   { position: [0, 0.55, 0],    direction: [0, 1, 0],  type: 'liquid_in' },
            discharge: { position: [0.55, -0.1, 0],  direction: [1, 0, 0],  type: 'liquid_out' }
        },
        parameters: {
            flowRate:    { value: 2000, unit: 'Nm³/h', label: 'Flöde' },
            pressureIn:  { value: 3,    unit: 'bar',   label: 'Sugtryck' },
            pressureOut: { value: 30,   unit: 'bar',   label: 'Utloppstryck' },
            power:       { value: 500,  unit: 'kW',    label: 'Effekt' },
            cylinders:   { value: 2,    unit: 'st',    label: 'Antal cylindrar' }
        },
        color: 0x5c6bc0,
        buildMesh(THREE) {
            const group = new THREE.Group();
            // Crankcase (main rectangular body)
            const crankcase = new THREE.Mesh(
                new THREE.BoxGeometry(0.8, 0.5, 0.5),
                new THREE.MeshStandardMaterial({ color: this.color })
            );
            group.add(crankcase);
            // Cylinders (two vertical cylinders on top)
            const cylMat = new THREE.MeshStandardMaterial({ color: 0x7986cb });
            for (const x of [-0.2, 0.2]) {
                const cyl = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.12, 0.12, 0.35, 16),
                    cylMat
                );
                cyl.position.set(x, 0.42, 0);
                group.add(cyl);
                // Cylinder head
                const head = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.14, 0.14, 0.06, 16),
                    new THREE.MeshStandardMaterial({ color: 0x9fa8da })
                );
                head.position.set(x, 0.62, 0);
                group.add(head);
            }
            // Suction nozzle (top, between cylinders)
            const nMat = new THREE.MeshStandardMaterial({ color: 0x78909c });
            const nSuc = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.15, 8), nMat);
            nSuc.position.set(0, 0.58, 0);
            group.add(nSuc);
            // Discharge nozzle (side, lower)
            const nDis = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.2, 8), nMat);
            nDis.rotation.z = Math.PI / 2;
            nDis.position.set(0.5, -0.1, 0);
            group.add(nDis);
            // Flywheel (on the side)
            const flywheel = new THREE.Mesh(
                new THREE.CylinderGeometry(0.2, 0.2, 0.04, 24),
                new THREE.MeshStandardMaterial({ color: 0x455a64 })
            );
            flywheel.rotation.x = Math.PI / 2;
            flywheel.position.set(0, 0, 0.3);
            group.add(flywheel);
            // Base plate
            const base = new THREE.Mesh(
                new THREE.BoxGeometry(0.9, 0.06, 0.6),
                new THREE.MeshStandardMaterial({ color: 0x455a64 })
            );
            base.position.y = -0.28;
            group.add(base);
            return group;
        }
    },

    shell_tube_hx: {
        type: 'heat_exchanger',
        subtype: 'shell_tube_large',
        name: 'Tubvärmeväxlare',
        icon: '↔',
        category: 'Värmeöverföring',
        description: 'Shell-and-tube värmeväxlare med synliga tubplåtar och bafflar',
        ports: {
            shell_in:  { position: [-0.9, 0.25, 0],  direction: [-1, 0, 0], type: 'liquid_in' },
            shell_out: { position: [0.9, -0.25, 0],   direction: [1, 0, 0],  type: 'liquid_out' },
            tube_in:   { position: [-0.9, -0.25, 0],  direction: [-1, 0, 0], type: 'liquid_in' },
            tube_out:  { position: [0.9, 0.25, 0],    direction: [1, 0, 0],  type: 'liquid_out' }
        },
        parameters: {
            duty:      { value: 2000, unit: 'kW',  label: 'Värmeeffekt' },
            area:      { value: 80,   unit: 'm²',  label: 'Värmeyta' },
            hotIn:     { value: 150,  unit: '°C',  label: 'Varm in' },
            hotOut:    { value: 80,   unit: '°C',  label: 'Varm ut' },
            coldIn:    { value: 30,   unit: '°C',  label: 'Kall in' },
            coldOut:   { value: 90,   unit: '°C',  label: 'Kall ut' },
            passes:    { value: 2,    unit: '',     label: 'Tubpass' }
        },
        color: 0xfdd835,
        buildMesh(THREE) {
            const group = new THREE.Group();
            // Shell body (larger than generic HX)
            const shell = new THREE.Mesh(
                new THREE.CylinderGeometry(0.35, 0.35, 1.6, 24),
                new THREE.MeshStandardMaterial({ color: this.color })
            );
            shell.rotation.z = Math.PI / 2;
            group.add(shell);
            // Tube sheets (thick discs at each end)
            const tsMat = new THREE.MeshStandardMaterial({ color: 0xf9a825 });
            for (const x of [-0.8, 0.8]) {
                const ts = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.36, 0.36, 0.06, 24),
                    tsMat
                );
                ts.rotation.z = Math.PI / 2;
                ts.position.x = x;
                group.add(ts);
            }
            // Channel heads (bonnets at each end)
            const chMat = new THREE.MeshStandardMaterial({ color: 0xfbc02d });
            for (const x of [-0.9, 0.9]) {
                const ch = new THREE.Mesh(
                    new THREE.SphereGeometry(0.35, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
                    chMat
                );
                ch.rotation.z = x < 0 ? Math.PI / 2 : -Math.PI / 2;
                ch.position.x = x;
                group.add(ch);
            }
            // Baffles (internal discs visible through shell)
            const bafMat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, transparent: true, opacity: 0.3 });
            for (let i = -2; i <= 2; i++) {
                const baf = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.33, 0.33, 0.015, 24),
                    bafMat
                );
                baf.rotation.z = Math.PI / 2;
                baf.position.x = i * 0.3;
                group.add(baf);
            }
            // Nozzles
            const nMat = new THREE.MeshStandardMaterial({ color: 0x78909c });
            const nGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.2, 8);
            // Shell side nozzles (top/bottom offset)
            const nShIn = new THREE.Mesh(nGeo, nMat);
            nShIn.position.set(-0.5, 0.4, 0);
            group.add(nShIn);
            const nShOut = new THREE.Mesh(nGeo, nMat);
            nShOut.position.set(0.5, -0.4, 0);
            group.add(nShOut);
            // Tube side nozzles (on channel heads)
            const nTuIn = new THREE.Mesh(nGeo, nMat);
            nTuIn.position.set(-0.5, -0.4, 0);
            group.add(nTuIn);
            const nTuOut = new THREE.Mesh(nGeo, nMat);
            nTuOut.position.set(0.5, 0.4, 0);
            group.add(nTuOut);
            // Saddle supports
            const sadMat = new THREE.MeshStandardMaterial({ color: 0x546e7a });
            for (const x of [-0.45, 0.45]) {
                const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.25, 0.5), sadMat);
                saddle.position.set(x, -0.47, 0);
                group.add(saddle);
            }
            return group;
        }
    },

    plate_hx: {
        type: 'heat_exchanger',
        subtype: 'plate',
        name: 'Plattvärmeväxlare',
        icon: '≡',
        category: 'Värmeöverföring',
        description: 'Plattvärmeväxlare med pressade plattor och packningar',
        ports: {
            hot_in:   { position: [-0.3, 0.55, 0],   direction: [0, 1, 0],   type: 'liquid_in' },
            hot_out:  { position: [0.45, -0.3, 0],    direction: [1, 0, 0],   type: 'liquid_out' },
            cold_in:  { position: [0.3, 0.55, 0],     direction: [0, 1, 0],   type: 'liquid_in' },
            cold_out: { position: [-0.45, -0.3, 0],   direction: [-1, 0, 0],  type: 'liquid_out' }
        },
        parameters: {
            duty:     { value: 800,  unit: 'kW',  label: 'Värmeeffekt' },
            area:     { value: 40,   unit: 'm²',  label: 'Värmeyta' },
            hotIn:    { value: 80,   unit: '°C',  label: 'Varm in' },
            hotOut:   { value: 50,   unit: '°C',  label: 'Varm ut' },
            coldIn:   { value: 20,   unit: '°C',  label: 'Kall in' },
            coldOut:  { value: 55,   unit: '°C',  label: 'Kall ut' },
            plates:   { value: 50,   unit: 'st',  label: 'Antal plattor' }
        },
        color: 0x26c6da,
        buildMesh(THREE) {
            const group = new THREE.Group();
            // Frame plates (front and back)
            const frameMat = new THREE.MeshStandardMaterial({ color: 0x00838f });
            const frontFrame = new THREE.Mesh(
                new THREE.BoxGeometry(0.55, 0.9, 0.06),
                frameMat
            );
            frontFrame.position.z = 0.2;
            group.add(frontFrame);
            const backFrame = new THREE.Mesh(
                new THREE.BoxGeometry(0.55, 0.9, 0.06),
                frameMat
            );
            backFrame.position.z = -0.2;
            group.add(backFrame);
            // Stacked plates (multiple thin plates between frames)
            const plateMat = new THREE.MeshStandardMaterial({ color: this.color });
            for (let i = -3; i <= 3; i++) {
                const plate = new THREE.Mesh(
                    new THREE.BoxGeometry(0.45, 0.8, 0.015),
                    plateMat
                );
                plate.position.z = i * 0.05;
                group.add(plate);
            }
            // Tie bolts (top and bottom rods connecting frames)
            const boltMat = new THREE.MeshStandardMaterial({ color: 0x546e7a });
            for (const [x, y] of [[-0.22, 0.38], [0.22, 0.38], [-0.22, -0.38], [0.22, -0.38]]) {
                const bolt = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.015, 0.015, 0.46, 6),
                    boltMat
                );
                bolt.rotation.x = Math.PI / 2;
                bolt.position.set(x, y, 0);
                group.add(bolt);
            }
            // Nozzles
            const nMat = new THREE.MeshStandardMaterial({ color: 0x78909c });
            // Hot in (top left, vertical)
            const nHotIn = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.15, 8), nMat);
            nHotIn.position.set(-0.15, 0.52, 0.2);
            group.add(nHotIn);
            // Hot out (right side, lower)
            const nHotOut = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.15, 8), nMat);
            nHotOut.rotation.z = Math.PI / 2;
            nHotOut.position.set(0.35, -0.3, 0.2);
            group.add(nHotOut);
            // Cold in (top right, vertical)
            const nColdIn = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.15, 8), nMat);
            nColdIn.position.set(0.15, 0.52, 0.2);
            group.add(nColdIn);
            // Cold out (left side, lower)
            const nColdOut = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.15, 8), nMat);
            nColdOut.rotation.z = Math.PI / 2;
            nColdOut.position.set(-0.35, -0.3, 0.2);
            group.add(nColdOut);
            // Support legs
            const legMat = new THREE.MeshStandardMaterial({ color: 0x455a64 });
            for (const x of [-0.2, 0.2]) {
                const leg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.15, 0.35), legMat);
                leg.position.set(x, -0.52, 0);
                group.add(leg);
            }
            return group;
        }
    },

    // --- Turbinkompressor ---
    turbine_compressor: {
        type: 'compressor',
        subtype: 'turbine_driven',
        name: 'Turbinkompressor',
        icon: '⚙',
        category: 'Pumpar',
        description: 'Ångturbin-driven centrifugalkompressor. Turbinen drivs av högtrycksånga (HT-ånga) och komprimerar/recirkulerar vätgasrik gas i HDS-loopar och liknande processer.',
        ports: {
            steam_in:  { position: [-0.52, 0.38, 0],  direction: [0, 1, 0],   type: 'liquid_in', defaultMedia: 'steam_hp' },
            steam_out: { position: [-0.52, -0.38, 0], direction: [0, -1, 0],  type: 'liquid_out', defaultMedia: 'steam_lp' },
            gas_in:    { position: [0.50, 0.44, 0],   direction: [0, 1, 0],   type: 'liquid_in' },
            gas_out:   { position: [0.85, -0.22, 0],  direction: [1, 0, 0],   type: 'liquid_out' }
        },
        parameters: {
            steamFlow:    { value: 8,     unit: 't/h',    label: 'Ångförbrukning' },
            steamPressIn: { value: 40,    unit: 'barg',   label: 'Ångtryck in' },
            steamPressOut:{ value: 3.5,   unit: 'barg',   label: 'Ångtryck ut' },
            gasFlow:      { value: 80000, unit: 'Nm³/h',  label: 'Gasflöde' },
            pressureIn:   { value: 28,    unit: 'barg',   label: 'Gas in-tryck' },
            pressureOut:  { value: 32,    unit: 'barg',   label: 'Gas ut-tryck' },
            power:        { value: 1200,  unit: 'kW',     label: 'Axeleffekt' }
        },
        color: 0x1565c0,
        buildMesh(THREE) {
            const group = new THREE.Group();
            const nMat = new THREE.MeshStandardMaterial({ color: 0x78909c });

            // --- Turbindel (vänster, mörkgrå) ---
            const turbineMat = new THREE.MeshStandardMaterial({ color: 0x37474f });
            const turbineBody = new THREE.Mesh(
                new THREE.CylinderGeometry(0.30, 0.30, 0.52, 20),
                turbineMat
            );
            turbineBody.rotation.z = Math.PI / 2;
            turbineBody.position.x = -0.48;
            group.add(turbineBody);

            // Turbinens ändlock
            const tCapMat = new THREE.MeshStandardMaterial({ color: 0x455a64 });
            for (const x of [-0.74, -0.22]) {
                const cap = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.31, 0.31, 0.05, 20),
                    tCapMat
                );
                cap.rotation.z = Math.PI / 2;
                cap.position.x = x;
                group.add(cap);
            }

            // Ångintag (topp)
            const nSteamIn = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.22, 10), nMat);
            nSteamIn.position.set(-0.48, 0.38, 0);
            group.add(nSteamIn);

            // Ångutlopp/exhaust (botten)
            const nSteamOut = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.22, 10), nMat);
            nSteamOut.position.set(-0.48, -0.38, 0);
            group.add(nSteamOut);

            // Turbinens styrskenor (dekorativa)
            const ribMat = new THREE.MeshStandardMaterial({ color: 0x546e7a });
            for (const x of [-0.62, -0.48, -0.34]) {
                const rib = new THREE.Mesh(
                    new THREE.TorusGeometry(0.305, 0.016, 6, 20),
                    ribMat
                );
                rib.rotation.y = Math.PI / 2;
                rib.position.x = x;
                group.add(rib);
            }

            // --- Kopplingaxel ---
            const shaftMat = new THREE.MeshStandardMaterial({ color: 0x90a4ae });
            const shaft = new THREE.Mesh(
                new THREE.CylinderGeometry(0.045, 0.045, 0.24, 10),
                shaftMat
            );
            shaft.rotation.z = Math.PI / 2;
            shaft.position.x = 0;
            group.add(shaft);

            // Kopplingsdisk
            const coupling = new THREE.Mesh(
                new THREE.CylinderGeometry(0.10, 0.10, 0.06, 16),
                new THREE.MeshStandardMaterial({ color: 0x607d8b })
            );
            coupling.rotation.z = Math.PI / 2;
            coupling.position.x = 0;
            group.add(coupling);

            // --- Kompressordel (höger, blå) ---
            const compMat = new THREE.MeshStandardMaterial({ color: this.color });
            const compBody = new THREE.Mesh(
                new THREE.CylinderGeometry(0.34, 0.34, 0.52, 24),
                compMat
            );
            compBody.rotation.z = Math.PI / 2;
            compBody.position.x = 0.50;
            group.add(compBody);

            // Kompressorns finringar
            const finMat = new THREE.MeshStandardMaterial({ color: 0x42a5f5 });
            for (const x of [0.32, 0.50, 0.68]) {
                const fin = new THREE.Mesh(
                    new THREE.TorusGeometry(0.36, 0.022, 8, 24),
                    finMat
                );
                fin.rotation.y = Math.PI / 2;
                fin.position.x = x;
                group.add(fin);
            }

            // Kompressorns ändlock
            const cCapMat = new THREE.MeshStandardMaterial({ color: 0x0d47a1 });
            for (const x of [0.24, 0.76]) {
                const cap = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.35, 0.35, 0.05, 20),
                    cCapMat
                );
                cap.rotation.z = Math.PI / 2;
                cap.position.x = x;
                group.add(cap);
            }

            // Gassug (topp)
            const nGasIn = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 0.22, 12), nMat);
            nGasIn.position.set(0.50, 0.44, 0);
            group.add(nGasIn);

            // Gastryck-utlopp (sida, nedre höger)
            const nGasOut = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.22, 12), nMat);
            nGasOut.rotation.z = Math.PI / 2;
            nGasOut.position.set(0.82, -0.22, 0);
            group.add(nGasOut);

            // Gemensam bottenplatta
            const baseMat = new THREE.MeshStandardMaterial({ color: 0x263238 });
            const base = new THREE.Mesh(
                new THREE.BoxGeometry(1.35, 0.06, 0.62),
                baseMat
            );
            base.position.y = -0.37;
            group.add(base);

            // Fundamentbultar (4 hörn)
            const boltMat = new THREE.MeshStandardMaterial({ color: 0x546e7a });
            for (const [bx, bz] of [[-0.58, 0.26], [-0.58, -0.26], [0.58, 0.26], [0.58, -0.26]]) {
                const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.12, 6), boltMat);
                bolt.position.set(bx, -0.40, bz);
                group.add(bolt);
            }

            return group;
        }
    },

    // --- Klorabsorber ---
    chlorine_absorber: {
        type: 'column',
        subtype: 'chlorine_absorber',
        name: 'Klorabsorber',
        icon: '⬇',
        category: 'Kolonner',
        description: 'Packad absorber för avskiljning av HCl och Cl₂ från processgaser. Används typiskt efter katalytisk reformering (CCR). Tvättas med NaOH-lösning.',
        ports: {
            gas_in:     { position: [0, -0.75, 0.28],   direction: [0, 0, 1],  type: 'liquid_in' },
            gas_out:    { position: [0, 0.92, 0],        direction: [0, 1, 0],  type: 'liquid_out' },
            caustic_in: { position: [-0.28, 0.65, 0],   direction: [-1, 0, 0], type: 'liquid_in' },
            spent_out:  { position: [0.28, -0.78, 0],   direction: [1, 0, 0],  type: 'liquid_out', defaultMedia: 'caustic' }
        },
        parameters: {
            packingHeight: { value: 3,    unit: 'm',     label: 'Packningshöjd' },
            pressure:      { value: 25,   unit: 'barg',  label: 'Tryck' },
            gasFlow:       { value: 5000, unit: 'Nm³/h', label: 'Gasflöde' },
            caustConc:     { value: 10,   unit: 'vikt%', label: 'NaOH-halt' },
            hclIn:         { value: 500,  unit: 'ppm',   label: 'HCl in' },
            hclOut:        { value: 1,    unit: 'ppm',   label: 'HCl ut' }
        },
        color: 0x80cbc4,
        buildMesh(THREE) {
            const group = new THREE.Group();
            const bodyMat = new THREE.MeshStandardMaterial({ color: this.color });
            const nMat = new THREE.MeshStandardMaterial({ color: 0x78909c });

            // Manteln
            const body = new THREE.Mesh(
                new THREE.CylinderGeometry(0.25, 0.25, 1.5, 20),
                bodyMat
            );
            body.position.y = 0.05;
            group.add(body);

            // Övre hvälvt huvud
            const topHead = new THREE.Mesh(
                new THREE.SphereGeometry(0.25, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2),
                bodyMat
            );
            topHead.position.y = 0.80;
            group.add(topHead);

            // Undre huvud
            const botHead = new THREE.Mesh(
                new THREE.SphereGeometry(0.25, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
                bodyMat
            );
            botHead.position.y = -0.70;
            group.add(botHead);

            // Packningsbädd (wireframe)
            const packing = new THREE.Mesh(
                new THREE.CylinderGeometry(0.22, 0.22, 0.85, 12, 4, true),
                new THREE.MeshStandardMaterial({ color: 0x4db6ac, wireframe: true })
            );
            packing.position.y = 0.15;
            group.add(packing);

            // Dimavskiljare (mist eliminator)
            const mist = new THREE.Mesh(
                new THREE.CylinderGeometry(0.22, 0.22, 0.06, 16, 2, true),
                new THREE.MeshStandardMaterial({ color: 0xb2dfdb, wireframe: true })
            );
            mist.position.y = 0.63;
            group.add(mist);

            // Vätskefördelare (distributor plate)
            const distrib = new THREE.Mesh(
                new THREE.CylinderGeometry(0.23, 0.23, 0.025, 16),
                new THREE.MeshStandardMaterial({ color: 0x546e7a })
            );
            distrib.position.y = 0.62;
            group.add(distrib);

            // Gasintagsmunstycke (botten, sida)
            const nGasIn = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.20, 10), nMat);
            nGasIn.rotation.x = Math.PI / 2;
            nGasIn.position.set(0, -0.72, 0.28);
            group.add(nGasIn);

            // Gasutloppsmunstycke (topp)
            const nGasOut = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.20, 10), nMat);
            nGasOut.position.set(0, 0.92, 0);
            group.add(nGasOut);

            // NaOH-intag (övre sida)
            const nCausIn = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.18, 10), nMat);
            nCausIn.rotation.z = Math.PI / 2;
            nCausIn.position.set(-0.30, 0.65, 0);
            group.add(nCausIn);

            // Förbrukad lut-utlopp (undre sida)
            const nSpent = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.18, 10), nMat);
            nSpent.rotation.z = Math.PI / 2;
            nSpent.position.set(0.30, -0.76, 0);
            group.add(nSpent);

            // Stödbens (3 st)
            const legMat = new THREE.MeshStandardMaterial({ color: 0x546e7a });
            for (let i = 0; i < 3; i++) {
                const angle = (i / 3) * Math.PI * 2;
                const leg = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.025, 0.025, 0.35, 6),
                    legMat
                );
                leg.position.set(Math.cos(angle) * 0.22, -1.00, Math.sin(angle) * 0.22);
                group.add(leg);
            }

            // Nivåglas (sida)
            const sight = new THREE.Mesh(
                new THREE.BoxGeometry(0.04, 0.15, 0.04),
                new THREE.MeshStandardMaterial({ color: 0xb2ebf2, transparent: true, opacity: 0.7 })
            );
            sight.position.set(0.26, -0.35, 0.05);
            group.add(sight);

            return group;
        }
    },

    // --- H2S-skrubber ---
    h2s_scrubber: {
        type: 'vessel',
        subtype: 'h2s_scrubber',
        name: 'H₂S-skrubber',
        icon: '☠',
        category: 'Separering',
        description: 'Kaustisk skrubber för avskiljning av H₂S och merkapaner från gasströmmar med NaOH-lösning. Kompakt enhet för slutrening. Det svarta bandet markerar H₂S-fara.',
        ports: {
            gas_in:     { position: [-0.46, -0.52, 0], direction: [-1, 0, 0], type: 'liquid_in' },
            gas_out:    { position: [0, 1.02, 0],       direction: [0, 1, 0],  type: 'liquid_out' },
            caustic_in: { position: [0.46, 0.42, 0],   direction: [1, 0, 0],  type: 'liquid_in' },
            spent_out:  { position: [-0.28, -0.94, 0],   direction: [-1, 0, 0], type: 'liquid_out', defaultMedia: 'caustic' }
        },
        parameters: {
            pressure:  { value: 5,    unit: 'barg',  label: 'Tryck' },
            temp:      { value: 40,   unit: '°C',    label: 'Temperatur' },
            gasFlow:   { value: 2000, unit: 'Nm³/h', label: 'Gasflöde' },
            caustConc: { value: 12,   unit: 'vikt%', label: 'NaOH-halt' },
            h2sIn:     { value: 2000, unit: 'ppm',   label: 'H₂S in' },
            h2sOut:    { value: 5,    unit: 'ppm',   label: 'H₂S ut' }
        },
        color: 0xf9a825,
        buildMesh(THREE) {
            const group = new THREE.Group();
            const bodyMat = new THREE.MeshStandardMaterial({ color: this.color });
            const nMat = new THREE.MeshStandardMaterial({ color: 0x78909c });

            // Manteln (vertikal cylinder)
            const body = new THREE.Mesh(
                new THREE.CylinderGeometry(0.24, 0.24, 1.4, 20),
                bodyMat
            );
            group.add(body);

            // Övre elliptiskt huvud
            const topHead = new THREE.Mesh(
                new THREE.SphereGeometry(0.24, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2),
                bodyMat
            );
            topHead.position.y = 0.70;
            group.add(topHead);

            // Undre konisk sump
            const sump = new THREE.Mesh(
                new THREE.CylinderGeometry(0.09, 0.24, 0.28, 16),
                new THREE.MeshStandardMaterial({ color: 0xe65100 })
            );
            sump.position.y = -0.84;
            group.add(sump);

            // Spraymunstycken (3 huvuden inne i topp)
            const sprayMat = new THREE.MeshStandardMaterial({ color: 0x78909c });
            for (const [sx, sz] of [[0, 0], [-0.10, 0.10], [0.10, -0.10]]) {
                const spray = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), sprayMat);
                spray.position.set(sx, 0.45, sz);
                group.add(spray);
                const arm = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.012, 0.012, 0.14, 6),
                    sprayMat
                );
                arm.rotation.z = Math.PI / 2;
                arm.position.set(sx * 0.5, 0.45, sz * 0.5);
                group.add(arm);
            }

            // Central spraylanse
            const sprayPipe = new THREE.Mesh(
                new THREE.CylinderGeometry(0.015, 0.015, 0.35, 8),
                sprayMat
            );
            sprayPipe.position.y = 0.30;
            group.add(sprayPipe);

            // Dimavskiljare (topp)
            const mist = new THREE.Mesh(
                new THREE.CylinderGeometry(0.21, 0.21, 0.07, 16, 2, true),
                new THREE.MeshStandardMaterial({ color: 0x90a4ae, wireframe: true })
            );
            mist.position.y = 0.60;
            group.add(mist);

            // Svart faroband (H₂S-markering)
            const hazardBand = new THREE.Mesh(
                new THREE.CylinderGeometry(0.245, 0.245, 0.08, 20),
                new THREE.MeshStandardMaterial({ color: 0x212121 })
            );
            hazardBand.position.y = -0.25;
            group.add(hazardBand);

            // Gasintag (sida, nedre)
            const nGasIn = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.18, 10), nMat);
            nGasIn.rotation.z = Math.PI / 2;
            nGasIn.position.set(-0.30, -0.50, 0);
            group.add(nGasIn);

            // Gasutlopp (topp)
            const nGasOut = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.18, 10), nMat);
            nGasOut.position.set(0, 0.84, 0);
            group.add(nGasOut);

            // NaOH-intag (övre sida)
            const nCausIn = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.18, 10), nMat);
            nCausIn.rotation.z = Math.PI / 2;
            nCausIn.position.set(0.30, 0.40, 0);
            group.add(nCausIn);

            // Förbrukad lut-dräning (sida av sump)
            const nSpent = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.18, 10), nMat);
            nSpent.rotation.z = Math.PI / 2;
            nSpent.position.set(-0.21, -0.94, 0);
            group.add(nSpent);

            // Stödben (3 st)
            const legMat = new THREE.MeshStandardMaterial({ color: 0x546e7a });
            for (let i = 0; i < 3; i++) {
                const angle = (i / 3) * Math.PI * 2 + Math.PI / 6;
                const leg = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.025, 0.025, 0.30, 6),
                    legMat
                );
                leg.position.set(Math.cos(angle) * 0.21, -1.10, Math.sin(angle) * 0.21);
                group.add(leg);
            }

            return group;
        }
    },

    // --- Avluftare ---
    deaerator: {
        type: 'vessel',
        subtype: 'deaerator',
        name: 'Avluftare',
        icon: '💧',
        category: 'Utilities',
        description: 'Bricka-/sprayavluftare som avlägsnar löst syre ur pannmatarvatten (BFW) med hjälp av LP-ånga. Förhindrar korrosion i ångpannor och rörledningar.',
        ports: {
            bfw_in:    { position: [-0.75, 0.55, 0],  direction: [-1, 0, 0], type: 'liquid_in',  defaultMedia: 'boiler_feed_water' },
            steam_in:  { position: [0.3, 0.35, 0.35], direction: [0, 0, 1],  type: 'liquid_in',  defaultMedia: 'steam_lp' },
            bfw_out:   { position: [0.75, -0.35, 0],  direction: [1, 0, 0],  type: 'liquid_out', defaultMedia: 'boiler_feed_water' },
            vent_out:  { position: [0, 0.8, 0],        direction: [0, 1, 0],  type: 'liquid_out' }
        },
        parameters: {
            pressure:  { value: 1.2,   unit: 'barg',  label: 'Drifttryck' },
            temp:      { value: 120,   unit: '°C',    label: 'Drifttemperatur' },
            o2In:      { value: 8000,  unit: 'µg/l',  label: 'O₂ in' },
            o2Out:     { value: 7,     unit: 'µg/l',  label: 'O₂ ut' },
            capacity:  { value: 50,    unit: 'm³/h',  label: 'Kapacitet BFW' }
        },
        color: 0x0288d1,
        buildMesh(THREE) {
            const group = new THREE.Group();
            const tankMat  = new THREE.MeshStandardMaterial({ color: this.color });
            const colMat   = new THREE.MeshStandardMaterial({ color: 0x0277bd });
            const nMat     = new THREE.MeshStandardMaterial({ color: 0x78909c });
            const internMat= new THREE.MeshStandardMaterial({ color: 0x4fc3f7, wireframe: true });

            // Horisontell lagringsdrum (nedre del)
            const tank = new THREE.Mesh(
                new THREE.CylinderGeometry(0.30, 0.30, 1.4, 24),
                tankMat
            );
            tank.rotation.z = Math.PI / 2;
            tank.position.y = -0.12;
            group.add(tank);

            // Ändlock (elliptiska)
            const capMat = new THREE.MeshStandardMaterial({ color: 0x01579b });
            for (const x of [-0.7, 0.7]) {
                const cap = new THREE.Mesh(
                    new THREE.SphereGeometry(0.30, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2),
                    capMat
                );
                cap.rotation.z = x < 0 ? Math.PI / 2 : -Math.PI / 2;
                cap.position.x = x;
                cap.position.y = -0.12;
                group.add(cap);
            }

            // Saddelstöd
            const saddleMat = new THREE.MeshStandardMaterial({ color: 0x455a64 });
            for (const x of [-0.35, 0.35]) {
                const saddle = new THREE.Mesh(
                    new THREE.BoxGeometry(0.08, 0.22, 0.45),
                    saddleMat
                );
                saddle.position.set(x, -0.45, 0);
                group.add(saddle);
            }

            // Vertikal brickkolumn (övre del, där avluftningen sker)
            const col = new THREE.Mesh(
                new THREE.CylinderGeometry(0.18, 0.22, 0.60, 16),
                colMat
            );
            col.position.set(-0.25, 0.48, 0);
            group.add(col);

            // Brickorna (wireframe skivor i kolumnen)
            for (let i = 0; i < 3; i++) {
                const tray = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.16, 0.16, 0.03, 16),
                    internMat
                );
                tray.position.set(-0.25, 0.24 + i * 0.16, 0);
                group.add(tray);
            }

            // Ångfördelningsrör i kolumnens botten
            const steamDist = new THREE.Mesh(
                new THREE.CylinderGeometry(0.015, 0.015, 0.32, 6),
                nMat
            );
            steamDist.rotation.z = Math.PI / 2;
            steamDist.position.set(-0.25, 0.22, 0);
            group.add(steamDist);

            // Ventilationshuv på kolumntoppen
            const hood = new THREE.Mesh(
                new THREE.CylinderGeometry(0.20, 0.18, 0.08, 16),
                new THREE.MeshStandardMaterial({ color: 0x01579b })
            );
            hood.position.set(-0.25, 0.82, 0);
            group.add(hood);

            // Anslutningsrör kolumn → tank
            const connector = new THREE.Mesh(
                new THREE.CylinderGeometry(0.12, 0.12, 0.18, 10),
                colMat
            );
            connector.position.set(-0.25, 0.09, 0);
            group.add(connector);

            // Munstycken
            // BFW-intag (vänster sida av kolumn)
            const nBfwIn = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.20, 10), nMat);
            nBfwIn.rotation.z = Math.PI / 2;
            nBfwIn.position.set(-0.68, 0.55, 0);
            group.add(nBfwIn);

            // Ångintag (fram, nedre kolumn)
            const nSteam = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.18, 10), nMat);
            nSteam.rotation.x = Math.PI / 2;
            nSteam.position.set(0.3, 0.35, 0.35);
            group.add(nSteam);

            // Avluftad BFW-utlopp (höger tank)
            const nBfwOut = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.20, 10), nMat);
            nBfwOut.rotation.z = Math.PI / 2;
            nBfwOut.position.set(0.68, -0.35, 0);
            group.add(nBfwOut);

            // Ventilationsstuts (topp av kolumn)
            const nVent = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.16, 8), nMat);
            nVent.position.set(0, 0.82, 0);
            group.add(nVent);

            // Nivåglas (sida av tank)
            const sight = new THREE.Mesh(
                new THREE.BoxGeometry(0.04, 0.22, 0.04),
                new THREE.MeshStandardMaterial({ color: 0xb2ebf2, transparent: true, opacity: 0.7 })
            );
            sight.position.set(0.12, -0.22, 0.31);
            group.add(sight);

            return group;
        }
    },

    // --- Desalter ---
    desalter: {
        type: 'vessel',
        subtype: 'desalter',
        name: 'Desalter',
        icon: '⚡',
        category: 'Separering',
        description: 'Elektrostatisk råoljedesalter. Råoljan blandas med tvättvatten och passerar ett högspänningsfält (~24 kV) som koalescerar saltlaksdroppar. Minskar salthalt från ~50 PTB till <2 PTB.',
        ports: {
            crude_in:  { position: [-1.20, 0.10, 0],  direction: [-1, 0, 0], type: 'liquid_in',  defaultMedia: 'crude_oil' },
            crude_out: { position: [1.20, 0.10, 0],   direction: [1, 0, 0],  type: 'liquid_out', defaultMedia: 'crude_oil' },
            water_in:  { position: [-0.5, -0.42, 0],  direction: [0, -1, 0], type: 'liquid_in',  defaultMedia: 'process_water' },
            brine_out: { position: [0.5, -0.42, 0],   direction: [0, -1, 0], type: 'liquid_out', defaultMedia: 'sour_water' }
        },
        parameters: {
            voltage:   { value: 24,  unit: 'kV',   label: 'Elektrodspänning' },
            temp:      { value: 130, unit: '°C',   label: 'Temperatur' },
            pressure:  { value: 8,   unit: 'barg', label: 'Tryck' },
            saltIn:    { value: 50,  unit: 'PTB',  label: 'Salthalt in' },
            saltOut:   { value: 2,   unit: 'PTB',  label: 'Salthalt ut' },
            washRatio: { value: 5,   unit: 'vol%', label: 'Tvättvattenkvot' }
        },
        color: 0x5d4037,
        buildMesh(THREE) {
            const group = new THREE.Group();
            const bodyMat    = new THREE.MeshStandardMaterial({ color: this.color });
            const elecMat    = new THREE.MeshStandardMaterial({ color: 0xffca28 });
            const insulMat   = new THREE.MeshStandardMaterial({ color: 0xffffff });
            const nMat       = new THREE.MeshStandardMaterial({ color: 0x78909c });

            // Horisontell tryckkärla (stor)
            const body = new THREE.Mesh(
                new THREE.CylinderGeometry(0.32, 0.32, 1.55, 24),
                bodyMat
            );
            body.rotation.z = Math.PI / 2;
            group.add(body);

            // Ändlock
            const capMat = new THREE.MeshStandardMaterial({ color: 0x4e342e });
            for (const x of [-0.78, 0.78]) {
                const cap = new THREE.Mesh(
                    new THREE.SphereGeometry(0.32, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2),
                    capMat
                );
                cap.rotation.z = x < 0 ? Math.PI / 2 : -Math.PI / 2;
                cap.position.x = x;
                group.add(cap);
            }

            // Saddelstöd
            const saddleMat = new THREE.MeshStandardMaterial({ color: 0x37474f });
            for (const x of [-0.40, 0.40]) {
                const saddle = new THREE.Mesh(
                    new THREE.BoxGeometry(0.09, 0.28, 0.52),
                    saddleMat
                );
                saddle.position.set(x, -0.42, 0);
                group.add(saddle);
            }

            // Elektriska isolatorer (genomföringar på toppen, karakteristiskt för desalter)
            for (const x of [-0.45, 0, 0.45]) {
                // Isolatorkropp (vit porslinssymbol)
                const insul = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.06, 0.08, 0.18, 12),
                    insulMat
                );
                insul.position.set(x, 0.42, 0);
                group.add(insul);

                // Isolatorskivor (flanges)
                for (const dy of [0, 0.06, 0.12]) {
                    const disc = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.10, 0.10, 0.025, 12),
                        insulMat
                    );
                    disc.position.set(x, 0.34 + dy, 0);
                    group.add(disc);
                }

                // Elektrodstav (gul, sträcker sig ner i kärlet)
                const rod = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.012, 0.012, 0.50, 6),
                    elecMat
                );
                rod.position.set(x, 0.14, 0);
                group.add(rod);
            }

            // HV-kabel (förbinder isolatorerna längs toppen)
            const cableMat = new THREE.MeshStandardMaterial({ color: 0x212121 });
            const cable = new THREE.Mesh(
                new THREE.CylinderGeometry(0.015, 0.015, 0.90, 6),
                cableMat
            );
            cable.rotation.z = Math.PI / 2;
            cable.position.set(0, 0.50, 0);
            group.add(cable);

            // HV-transformatorbox (på sidan)
            const transBox = new THREE.Mesh(
                new THREE.BoxGeometry(0.18, 0.22, 0.14),
                new THREE.MeshStandardMaterial({ color: 0x263238 })
            );
            transBox.position.set(0, 0.45, 0.38);
            group.add(transBox);

            // Råolje-intag (vänster, övre)
            const nCrIn = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.22, 10), nMat);
            nCrIn.rotation.z = Math.PI / 2;
            nCrIn.position.set(-0.78, 0.10, 0);
            group.add(nCrIn);

            // Råolje-utlopp (höger, övre)
            const nCrOut = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.22, 10), nMat);
            nCrOut.rotation.z = Math.PI / 2;
            nCrOut.position.set(0.78, 0.10, 0);
            group.add(nCrOut);

            // Tvättvatten-intag (vänster, undre)
            const nWIn = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.18, 10), nMat);
            nWIn.rotation.z = Math.PI / 2;
            nWIn.position.set(-0.45, -0.28, 0);
            group.add(nWIn);

            // Saltlake-utlopp (höger, undre)
            const nBrine = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.18, 10), nMat);
            nBrine.rotation.z = Math.PI / 2;
            nBrine.position.set(0.45, -0.28, 0);
            group.add(nBrine);

            return group;
        }
    },

    // --- Molekylsikt-tork ---
    mol_sieve_dryer: {
        type: 'vessel',
        subtype: 'mol_sieve',
        name: 'Molekylsikt-tork',
        icon: '◈',
        category: 'Separering',
        description: 'Fast packad bädd med zeoliter (4A eller 13X) för djuptorkning av gas- eller vätskeströmmar. Tvåkärlesystem: ett kärl i drift, ett under regenerering med varm N₂.',
        ports: {
            feed_in:    { position: [0, -0.85, 0.32],  direction: [0, 0, 1],  type: 'liquid_in' },
            dry_out:    { position: [0, 1.15, 0],       direction: [0, 1, 0],  type: 'liquid_out' },
            regen_in:   { position: [0.32, 0.70, 0],   direction: [1, 0, 0],  type: 'liquid_in',  defaultMedia: 'nitrogen' },
            regen_out:  { position: [0.32, -0.70, 0],  direction: [1, 0, 0],  type: 'liquid_out', defaultMedia: 'nitrogen' }
        },
        parameters: {
            capacity:   { value: 5000, unit: 'Nm³/h', label: 'Gasflöde' },
            h2oIn:      { value: 500,  unit: 'ppm',   label: 'H₂O in' },
            h2oOut:     { value: 1,    unit: 'ppm',   label: 'H₂O ut' },
            cycleTime:  { value: 8,    unit: 'h',     label: 'Cykeltid' },
            regenTemp:  { value: 250,  unit: '°C',    label: 'Regentemp' },
            bedVolume:  { value: 4,    unit: 'm³',    label: 'Bäddvolym' }
        },
        color: 0x78909c,
        buildMesh(THREE) {
            const group = new THREE.Group();
            const bodyMat = new THREE.MeshStandardMaterial({ color: this.color });
            const nMat    = new THREE.MeshStandardMaterial({ color: 0x607d8b });
            const bedMat  = new THREE.MeshStandardMaterial({ color: 0x8d6e63 });
            const platMat = new THREE.MeshStandardMaterial({ color: 0x546e7a });

            // Manteln (vertikal cylinder)
            const body = new THREE.Mesh(
                new THREE.CylinderGeometry(0.26, 0.26, 1.65, 20),
                bodyMat
            );
            body.position.y = 0.0;
            group.add(body);

            // Övre huvud (elliptiskt)
            const topHead = new THREE.Mesh(
                new THREE.SphereGeometry(0.26, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2),
                bodyMat
            );
            topHead.position.y = 0.825;
            group.add(topHead);

            // Undre huvud (koniskt sump)
            const botHead = new THREE.Mesh(
                new THREE.CylinderGeometry(0.10, 0.26, 0.25, 16),
                new THREE.MeshStandardMaterial({ color: 0x607d8b })
            );
            botHead.position.y = -0.95;
            group.add(botHead);

            // Zeolitbädd (synlig packad lager — brun)
            const bed = new THREE.Mesh(
                new THREE.CylinderGeometry(0.24, 0.24, 1.0, 16),
                bedMat
            );
            bed.position.y = 0.05;
            group.add(bed);

            // Övre och undre stödgaller (sievar)
            for (const y of [-0.45, 0.55]) {
                const screen = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.25, 0.25, 0.04, 16),
                    platMat
                );
                screen.position.y = y;
                group.add(screen);
            }

            // Kolvsymbol: "ADSORPTION" indikator-band (mörkare ring på mitten av kärlet)
            const stateBand = new THREE.Mesh(
                new THREE.CylinderGeometry(0.265, 0.265, 0.12, 20),
                new THREE.MeshStandardMaterial({ color: 0x4caf50, emissive: 0x2e7d32, emissiveIntensity: 0.3 })
            );
            stateBand.position.y = 0.05;
            group.add(stateBand);

            // Yttre isolering (tunn, ljusgrå cylinder runt kärlet — regengvärme kräver isolering)
            const insul = new THREE.Mesh(
                new THREE.CylinderGeometry(0.30, 0.30, 1.65, 20, 1, true),
                new THREE.MeshStandardMaterial({ color: 0xeceff1, transparent: true, opacity: 0.25 })
            );
            insul.position.y = 0.0;
            group.add(insul);

            // Stödben (3 st)
            const legMat = new THREE.MeshStandardMaterial({ color: 0x455a64 });
            for (let i = 0; i < 3; i++) {
                const angle = (i / 3) * Math.PI * 2;
                const leg = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.03, 0.03, 0.35, 6),
                    legMat
                );
                leg.position.set(Math.cos(angle) * 0.24, -1.17, Math.sin(angle) * 0.24);
                group.add(leg);
            }

            // Matningsstuts (botten, sida)
            const nFeedIn = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.20, 10), nMat);
            nFeedIn.rotation.x = Math.PI / 2;
            nFeedIn.position.set(0, -0.82, 0.28);
            group.add(nFeedIn);

            // Torrgas-utlopp (topp)
            const nDryOut = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.20, 10), nMat);
            nDryOut.position.set(0, 0.96, 0);
            group.add(nDryOut);

            // Regengas-intag (övre sida, höger)
            const nRegIn = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.18, 10), nMat);
            nRegIn.rotation.z = Math.PI / 2;
            nRegIn.position.set(0.30, 0.68, 0);
            group.add(nRegIn);

            // Regengas-utlopp (undre sida, höger)
            const nRegOut = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.18, 10), nMat);
            nRegOut.rotation.z = Math.PI / 2;
            nRegOut.position.set(0.30, -0.68, 0);
            group.add(nRegOut);

            // Temperaturgivare (litet instrument på sidan)
            const tSensor = new THREE.Mesh(
                new THREE.BoxGeometry(0.05, 0.05, 0.05),
                new THREE.MeshStandardMaterial({ color: 0xff9800 })
            );
            tSensor.position.set(-0.28, 0.25, 0.10);
            group.add(tSensor);

            return group;
        }
    },

    // --- Anslutningar: Batterigräns ---
    battery_limit_in: {
        type: 'system',
        subtype: 'battery_limit',
        name: 'Batterigräns Intag',
        icon: '↦',
        category: 'Anslutningar',
        description: 'Markerar batterigränsen mot en annan anläggning. Röret KOMMER IN till den aktuella anläggningen härifrån. Fyll i källanläggning och ledningsnummer i egenskaper.',
        ports: {
            outlet: { position: [0.52, 0, 0], direction: [1, 0, 0], type: 'liquid_out' }
        },
        parameters: {
            sourceUnit: { value: 'Från: ?',      unit: '', label: 'Källanläggning' },
            lineNo:     { value: '',              unit: '', label: 'Ledningsnummer' },
            medium:     { value: '',              unit: '', label: 'Medium' }
        },
        color: 0xffd600,
        buildMesh(THREE) {
            const group = new THREE.Group();
            const bodyMat = new THREE.MeshStandardMaterial({ color: this.color });
            const rimMat  = new THREE.MeshStandardMaterial({ color: 0xe65100 });
            const nMat    = new THREE.MeshStandardMaterial({ color: 0x78909c });

            // Diamond body (box rotated 45° around y=0)
            const diamond = new THREE.Mesh(
                new THREE.BoxGeometry(0.55, 0.55, 0.14),
                bodyMat
            );
            diamond.rotation.z = Math.PI / 4;
            group.add(diamond);

            // Orange border ring (slightly larger box, wireframe-like via thin frame)
            const rim = new THREE.Mesh(
                new THREE.BoxGeometry(0.60, 0.60, 0.08),
                rimMat
            );
            rim.rotation.z = Math.PI / 4;
            rim.position.z = 0.03;
            group.add(rim);

            // Arrow shaft pointing right (toward outlet port)
            const shaft = new THREE.Mesh(
                new THREE.CylinderGeometry(0.055, 0.055, 0.32, 8),
                nMat
            );
            shaft.rotation.z = Math.PI / 2;
            shaft.position.x = 0.37;
            group.add(shaft);

            // Arrowhead
            const arrowHead = new THREE.Mesh(
                new THREE.ConeGeometry(0.10, 0.16, 8),
                nMat
            );
            arrowHead.rotation.z = -Math.PI / 2;
            arrowHead.position.x = 0.55;
            group.add(arrowHead);

            return group;
        }
    },

    battery_limit_out: {
        type: 'system',
        subtype: 'battery_limit',
        name: 'Batterigräns Utlopp',
        icon: '↦',
        category: 'Anslutningar',
        description: 'Markerar batterigränsen mot en annan anläggning. Röret LÄMNAR den aktuella anläggningen hit. Fyll i målanläggning och ledningsnummer i egenskaper.',
        ports: {
            inlet: { position: [-0.52, 0, 0], direction: [-1, 0, 0], type: 'liquid_in' }
        },
        parameters: {
            destUnit: { value: 'Till: ?', unit: '', label: 'Målanläggning' },
            lineNo:   { value: '',        unit: '', label: 'Ledningsnummer' },
            medium:   { value: '',        unit: '', label: 'Medium' }
        },
        color: 0xffd600,
        buildMesh(THREE) {
            const group = new THREE.Group();
            const bodyMat = new THREE.MeshStandardMaterial({ color: this.color });
            const rimMat  = new THREE.MeshStandardMaterial({ color: 0xe65100 });
            const nMat    = new THREE.MeshStandardMaterial({ color: 0x78909c });

            // Diamond body
            const diamond = new THREE.Mesh(
                new THREE.BoxGeometry(0.55, 0.55, 0.14),
                bodyMat
            );
            diamond.rotation.z = Math.PI / 4;
            group.add(diamond);

            // Orange border rim
            const rim = new THREE.Mesh(
                new THREE.BoxGeometry(0.60, 0.60, 0.08),
                rimMat
            );
            rim.rotation.z = Math.PI / 4;
            rim.position.z = 0.03;
            group.add(rim);

            // Arrow shaft pointing left (from inlet port into diamond)
            const shaft = new THREE.Mesh(
                new THREE.CylinderGeometry(0.055, 0.055, 0.32, 8),
                nMat
            );
            shaft.rotation.z = Math.PI / 2;
            shaft.position.x = -0.37;
            group.add(shaft);

            // Arrowhead pointing left (leaving the plant)
            const arrowHead = new THREE.Mesh(
                new THREE.ConeGeometry(0.10, 0.16, 8),
                nMat
            );
            arrowHead.rotation.z = Math.PI / 2;
            arrowHead.position.x = -0.55;
            group.add(arrowHead);

            return group;
        }
    },

    // --- Koalescer ---
    coalescer: {
        type: 'vessel',
        subtype: 'coalescer',
        name: 'Koalescer',
        icon: '⊕',
        category: 'Separering',
        description: 'Vertikal koalescer för separation av vatten från gasolin/nafta',
        ports: {
            feed_in:     { position: [-0.42, 0.4, 0],  direction: [-1, 0, 0], type: 'liquid_in',  defaultMedia: 'cracked_gasoline' },
            product_out: { position: [0, 1.05, 0],      direction: [0, 1, 0],  type: 'liquid_out', defaultMedia: 'two_phase_hc' },
            relief_out:  { position: [0.42, 0.7, 0],   direction: [1, 0, 0],  type: 'liquid_out', defaultMedia: 'flare_gas' },
            water_out:   { position: [0, -0.85, 0.32],  direction: [0, 0, 1],  type: 'liquid_out', defaultMedia: 'sour_water' }
        },
        parameters: {
            pressure:   { value: 10, unit: 'bar', label: 'Tryck' },
            temp:       { value: 60, unit: '°C',  label: 'Temperatur' },
            efficiency: { value: 99, unit: '%',   label: 'Vattensep. effektivitet' }
        },
        color: 0x78909c,
        buildMesh(THREE) {
            const group  = new THREE.Group();
            const mat    = new THREE.MeshStandardMaterial({ color: this.color });
            const capMat = new THREE.MeshStandardMaterial({ color: 0x90a4ae });
            const nMat   = new THREE.MeshStandardMaterial({ color: 0x546e7a });

            // Main vertical cylinder body (center at y=0.05, spans y=-0.60 to y=0.70)
            const body = new THREE.Mesh(
                new THREE.CylinderGeometry(0.28, 0.28, 1.30, 24),
                mat
            );
            body.position.y = 0.05;
            group.add(body);

            // Hemisphere top cap (equator at y=0.70, extends to y=0.98)
            const topCap = new THREE.Mesh(
                new THREE.SphereGeometry(0.28, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
                capMat
            );
            topCap.position.y = 0.70;
            group.add(topCap);

            // Hemisphere bottom cap (inverted, equator at y=-0.60, extends to y=-0.88)
            const botCap = new THREE.Mesh(
                new THREE.SphereGeometry(0.28, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
                capMat
            );
            botCap.rotation.z = Math.PI;
            botCap.position.y = -0.60;
            group.add(botCap);

            // Support legs (3 evenly spaced)
            const legMat = new THREE.MeshStandardMaterial({ color: 0x455a64 });
            for (let i = 0; i < 3; i++) {
                const angle = (i / 3) * Math.PI * 2;
                const leg = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.025, 0.025, 0.30, 6),
                    legMat
                );
                leg.position.set(Math.cos(angle) * 0.22, -1.03, Math.sin(angle) * 0.22);
                group.add(leg);
            }

            // Feed inlet nozzle (side, near top)
            const feedN = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.18, 8), nMat);
            feedN.rotation.z = Math.PI / 2;
            feedN.position.set(-0.35, 0.4, 0);
            group.add(feedN);

            // Product outlet nozzle (top center)
            const prodN = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.22, 8), nMat);
            prodN.position.set(0, 0.88, 0);
            group.add(prodN);

            // Relief / safety valve nozzle (upper side) + red RV body
            const rvNoz = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.18, 8), nMat);
            rvNoz.rotation.z = Math.PI / 2;
            rvNoz.position.set(0.35, 0.7, 0);
            group.add(rvNoz);
            const rvBody = new THREE.Mesh(
                new THREE.CylinderGeometry(0.075, 0.075, 0.07, 8),
                new THREE.MeshStandardMaterial({ color: 0xe53935 })
            );
            rvBody.rotation.z = Math.PI / 2;
            rvBody.position.set(0.49, 0.7, 0);
            group.add(rvBody);

            // Sour water outlet nozzle (bottom, exits in Z direction to avoid going below grid)
            const waterN = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.22, 8), nMat);
            waterN.rotation.x = Math.PI / 2;
            waterN.position.set(0, -0.85, 0.22);
            group.add(waterN);

            return group;
        }
    },

    // --- Rekontakteringstank ---
    recontacting_absorber_drum: {
        type: 'vessel',
        subtype: 'recontacting_drum',
        name: 'Rekontakteringstank',
        icon: '⊗',
        category: 'Separering',
        description: 'Horisontell rekontakteringstank med absorptionstorn och survattenpotta',
        ports: {
            gas_in:      { position: [-0.20, 0.32, 0],  direction: [0, 1, 0],  type: 'liquid_in',  defaultMedia: 'two_phase_hc' },
            naphtha_in:  { position: [0.58, 0.90, 0],   direction: [1, 0, 0],  type: 'liquid_in',  defaultMedia: 'raw_gasoline' },
            gas_out:     { position: [0.42, 1.22, 0],   direction: [0, 1, 0],  type: 'liquid_out', defaultMedia: 'recycle_gas' },
            naphtha_out: { position: [0.20, -0.32, 0],  direction: [0, -1, 0], type: 'liquid_out', defaultMedia: 'raw_gasoline' },
            water_out:   { position: [-0.35, -0.78, 0], direction: [0, -1, 0], type: 'liquid_out', defaultMedia: 'sour_water' }
        },
        parameters: {
            pressure:   { value: 12, unit: 'bar', label: 'Tryck' },
            temp:       { value: 45, unit: '°C',  label: 'Temperatur' },
            h2sRemoval: { value: 98, unit: '%',   label: 'H₂S-reduktion' }
        },
        color: 0x607d8b,
        buildMesh(THREE) {
            const group    = new THREE.Group();
            const mat      = new THREE.MeshStandardMaterial({ color: this.color });
            const capMat   = new THREE.MeshStandardMaterial({ color: 0x78909c });
            const nMat     = new THREE.MeshStandardMaterial({ color: 0x546e7a });

            // Horizontal drum body (spans x: -0.70 to +0.70, y: -0.28 to +0.28)
            const body = new THREE.Mesh(
                new THREE.CylinderGeometry(0.28, 0.28, 1.40, 24),
                mat
            );
            body.rotation.z = Math.PI / 2;
            group.add(body);

            // Drum end caps
            for (const x of [-0.70, 0.70]) {
                const cap = new THREE.Mesh(
                    new THREE.SphereGeometry(0.28, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
                    capMat
                );
                cap.rotation.z = x < 0 ? Math.PI / 2 : -Math.PI / 2;
                cap.position.x = x;
                group.add(cap);
            }

            // Saddle supports
            const saddleMat = new THREE.MeshStandardMaterial({ color: 0x455a64 });
            for (const x of [-0.35, 0.35]) {
                const saddle = new THREE.Mesh(
                    new THREE.BoxGeometry(0.08, 0.22, 0.45),
                    saddleMat
                );
                saddle.position.set(x, -0.36, 0);
                group.add(saddle);
            }

            // Vertical absorber tower on right side (center at x=0.42, y=0.68, spans y: 0.28 to 1.08)
            const towerMat = new THREE.MeshStandardMaterial({ color: 0x9575cd, transparent: true, opacity: 0.85 });
            const tower = new THREE.Mesh(
                new THREE.CylinderGeometry(0.12, 0.12, 0.80, 16),
                towerMat
            );
            tower.position.set(0.42, 0.68, 0);
            group.add(tower);

            // Tower packing (wireframe)
            const packing = new THREE.Mesh(
                new THREE.CylinderGeometry(0.10, 0.10, 0.50, 12, 3, true),
                new THREE.MeshStandardMaterial({ color: 0xb39ddb, wireframe: true })
            );
            packing.position.set(0.42, 0.60, 0);
            group.add(packing);

            // Tower top hemisphere (equator at y=1.08, extends to y=1.20)
            const towerTop = new THREE.Mesh(
                new THREE.SphereGeometry(0.12, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2),
                capMat
            );
            towerTop.position.set(0.42, 1.08, 0);
            group.add(towerTop);

            // Sour water boot below drum (center at x=-0.35, y=-0.47, spans y: -0.28 to -0.66)
            const boot = new THREE.Mesh(
                new THREE.CylinderGeometry(0.09, 0.09, 0.38, 12),
                new THREE.MeshStandardMaterial({ color: 0x607d8b })
            );
            boot.position.set(-0.35, -0.47, 0);
            group.add(boot);

            // Boot bottom hemisphere (inverted, equator at y=-0.66, extends to y=-0.75)
            const bootBot = new THREE.Mesh(
                new THREE.SphereGeometry(0.09, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
                capMat
            );
            bootBot.rotation.z = Math.PI;
            bootBot.position.set(-0.35, -0.66, 0);
            group.add(bootBot);

            // Gas inlet nozzle (drum top, left of tower)
            const gasInN = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.16, 8), nMat);
            gasInN.position.set(-0.20, 0.34, 0);
            group.add(gasInN);

            // Naphtha inlet nozzle (tower side near top)
            const naphthaInN = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.16, 8), nMat);
            naphthaInN.rotation.z = Math.PI / 2;
            naphthaInN.position.set(0.54, 0.90, 0);
            group.add(naphthaInN);

            // Naphtha outlet nozzle (drum bottom)
            const naphthaOutN = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.16, 8), nMat);
            naphthaOutN.position.set(0.20, -0.34, 0);
            group.add(naphthaOutN);

            return group;
        }
    },

    // ===== LÄROMODULER =====

    furnace_training: {
        type: 'furnace_training',
        name: 'Processugn F-XXX1',
        icon: '🔥',
        category: 'Läromoduler',
        description: 'Interaktiv självdragsugn (3 sektioner A/B/C, 6 brännare/sektion). Används i tändningsläromodulen.',
        ports: {},
        parameters: {
            temp_A:  { value: 0,  unit: '°C',     label: 'Temp sektion A' },
            temp_B:  { value: 0,  unit: '°C',     label: 'Temp sektion B' },
            temp_C:  { value: 0,  unit: '°C',     label: 'Temp sektion C' },
            o2_flue: { value: 21, unit: '%',       label: 'O₂ rökgaser' },
            draft:   { value: 0,  unit: 'mmH₂O',  label: 'Drag' }
        },
        initialFurnaceState: {
            TSO_AA: 'closed', TSO_AB: 'closed',
            TSO_BA: 'closed', TSO_BB: 'closed',
            TSO_CA: 'closed', TSO_CB: 'closed',
            KIKV_A1: 'closed', KIKV_A2: 'closed', KIKV_A3: 'closed',
            KIKV_A4: 'closed', KIKV_A5: 'closed', KIKV_A6: 'closed',
            KIKV_B1: 'closed', KIKV_B2: 'closed', KIKV_B3: 'closed',
            KIKV_B4: 'closed', KIKV_B5: 'closed', KIKV_B6: 'closed',
            KIKV_C1: 'closed', KIKV_C2: 'closed', KIKV_C3: 'closed',
            KIKV_C4: 'closed', KIKV_C5: 'closed', KIKV_C6: 'closed',
            BLEED_A: 'closed', BLEED_B: 'closed', BLEED_C: 'closed',
            FLUE_DAMPER: 'closed',
            PRIM_AIR_A: 'closed', PRIM_AIR_B: 'closed', PRIM_AIR_C: 'closed',
            SEC_AIR_A:  'closed', SEC_AIR_B:  'closed', SEC_AIR_C:  'closed',
            STEAM: 'off',
            PILOT_A: 'unlit', PILOT_B: 'unlit', PILOT_C: 'unlit',
            BURNER_A1: false, BURNER_A2: false, BURNER_A3: false,
            BURNER_A4: false, BURNER_A5: false, BURNER_A6: false,
            BURNER_B1: false, BURNER_B2: false, BURNER_B3: false,
            BURNER_B4: false, BURNER_B5: false, BURNER_B6: false,
            BURNER_C1: false, BURNER_C2: false, BURNER_C3: false,
            BURNER_C4: false, BURNER_C5: false, BURNER_C6: false,
            CCR_FUEL_MANUAL: false,
            CCR_PRESSURIZE_A: false, CCR_PRESSURIZE_B: false, CCR_PRESSURIZE_C: false,
            HATCH_A: 'closed', HATCH_B: 'closed', HATCH_C: 'closed',
            CCR_LOGGED: false
        },
        buildMesh(THREE) {
            const group = new THREE.Group();

            const LIFT   = 2.0;
            const FW     = 7.5;
            const FH     = 3.2;
            const FD     = 4.0;
            const FCY    = LIFT + FH / 2;   // 3.6
            const CONVH  = 1.2;
            const HDR_Y  = LIFT - 0.3;      // 1.7  — main header height
            const SUB_Y  = 1.0;             // section distribution header height (lowered for TSO clearance)
            const FEED_H = LIFT - SUB_Y;    // 1.0  — feed pipe height
            const HDR_Z  = FD / 2 + 0.10;  // 2.1  — just in front of support legs (legs at z=1.85)
            // Sub-header spans from back-leg z to front header z
            const SUB_Z_BACK    = -FD / 2 + 0.15;           // -1.85
            const SUB_HDR_LEN   = HDR_Z - SUB_Z_BACK;       //  3.95
            const SUB_HDR_CEN_Z = (HDR_Z + SUB_Z_BACK) / 2; //  0.125

            // ── Materials ──────────────────────────────────────────────────
            const fireboxMat    = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9 });
            const glassMat      = new THREE.MeshStandardMaterial({
                color: 0xb3d1f0, transparent: true, opacity: 0.18, depthWrite: false
            });
            const convMat       = new THREE.MeshStandardMaterial({ color: 0x546e7a, roughness: 0.8 });
            const stackMat      = new THREE.MeshStandardMaterial({ color: 0x424242 });
            const divMat        = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.9 });
            const tsoMat        = new THREE.MeshStandardMaterial({ color: 0x78909c }); // neutral — overridden by updateFurnaceElementVisual
            const stemMat       = new THREE.MeshStandardMaterial({ color: 0xbdbdbd });
            const kikvMat       = new THREE.MeshStandardMaterial({ color: 0x90a4ae });
            const burnerIndMat  = new THREE.MeshStandardMaterial({ color: 0x455a64 });
            const pilotMat      = new THREE.MeshStandardMaterial({ color: 0x78909c });
            const airMat        = new THREE.MeshStandardMaterial({ color: 0x607d8b });
            const damperMat     = new THREE.MeshStandardMaterial({ color: 0x78909c });
            const fuelMat       = new THREE.MeshStandardMaterial({ color: 0xffd54f });
            const steelMat      = new THREE.MeshStandardMaterial({ color: 0x78909c, roughness: 0.6 });
            const hatchPlateMat = new THREE.MeshStandardMaterial({ color: 0x6d4c41, roughness: 0.85 });
            const hatchFrameMat = new THREE.MeshStandardMaterial({ color: 0x546e7a, roughness: 0.6 });
            const tubeMat       = new THREE.MeshStandardMaterial({ color: 0xb0bec5 });

            // ── Steel support frame (8 legs: 4 corners + 4 at section dividers x=±1.25) ──
            // Centre legs at x=0 removed — they clashed with section B sub-header
            const legXZ = [
                [-FW/2+0.15,  FD/2-0.15], [ FW/2-0.15,  FD/2-0.15],  // front corners
                [-FW/2+0.15, -FD/2+0.15], [ FW/2-0.15, -FD/2+0.15],  // back corners
                [-1.25,  FD/2-0.15],       [ 1.25,  FD/2-0.15],       // front dividers
                [-1.25, -FD/2+0.15],       [ 1.25, -FD/2+0.15]        // back dividers
            ];
            for (const [lx, lz] of legXZ) {
                const leg = new THREE.Mesh(new THREE.BoxGeometry(0.14, LIFT, 0.14), steelMat);
                leg.position.set(lx, LIFT/2, lz);
                group.add(leg);
            }
            for (const lz of [FD/2-0.15, -FD/2+0.15]) {
                const b = new THREE.Mesh(new THREE.BoxGeometry(FW, 0.14, 0.14), steelMat);
                b.position.set(0, LIFT-0.07, lz);
                group.add(b);
            }
            for (const lx of [-FW/2+0.15, FW/2-0.15]) {
                const b = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, FD), steelMat);
                b.position.set(lx, LIFT-0.07, 0);
                group.add(b);
            }

            // ── Firebox — multi-material: face 4 (+z front) = glass ────────
            // BoxGeometry material order: +x, -x, +y, -y, +z(front), -z(back)
            const firebox = new THREE.Mesh(
                new THREE.BoxGeometry(FW, FH, FD),
                [fireboxMat, fireboxMat, fireboxMat, fireboxMat, glassMat, fireboxMat]
            );
            firebox.position.set(0, FCY, 0);
            group.add(firebox);

            // ── Convection section ─────────────────────────────────────────
            const conv = new THREE.Mesh(new THREE.BoxGeometry(FW, CONVH, FD), convMat);
            conv.position.set(0, LIFT + FH + CONVH/2, 0);
            group.add(conv);

            // ── Single large chimney ───────────────────────────────────────
            const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 3.0, 12), stackMat);
            stack.position.set(0, LIFT + FH + CONVH + 1.5, 0);
            group.add(stack);

            // ── Section dividers ───────────────────────────────────────────
            for (const dx of [-1.25, 1.25]) {
                const div = new THREE.Mesh(new THREE.BoxGeometry(0.08, FH, FD), divMat);
                div.position.set(dx, FCY, 0);
                group.add(div);
            }

            // ── FLUE_DAMPER assembly on chimney ───────────────────────────
            // Damper in chimney bore; counterweight arm on right side of chimney.
            // Wire routes RIGHTWARD (+x, above convection roof) then drops straight
            // down outside the furnace RIGHT face (same side as STEAM nozzle).
            // "Fail to open": counterweight holds damper open if wire is released.
            const STACK_BOT  = LIFT + FH + CONVH;  // 6.4  — chimney bottom (world y)
            const DAMPER_Y   = STACK_BOT + 0.85;   // 7.25 — lower quarter of chimney
            const CW_X       = 0.83;               // right side, just outside chimney (r≈0.52)
            const CW_RIGHT_X = FW / 2 + 0.5;       // 4.25 — outside furnace right face (FW/2=3.75)

            // Spjällskiva (disc inside chimney bore, slightly tilted = "closed" indicator)
            const damperDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.07, 14), damperMat);
            damperDisc.position.set(0, DAMPER_Y, 0);
            damperDisc.rotation.z = Math.PI * 0.08; // ~15° tilt — partially closed indication
            damperDisc.userData.furnaceKey = 'FLUE_DAMPER';
            group.add(damperDisc);

            // Axel (protrudes both sides through chimney wall, horizontal along X)
            const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1.5, 6), steelMat);
            axle.rotation.z = Math.PI / 2;
            axle.position.set(0, DAMPER_Y, 0);
            group.add(axle); // visual only

            // Motviktsarm (extends upward from axle right end, outside chimney)
            const cwArm = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.72, 0.05), steelMat);
            cwArm.position.set(CW_X, DAMPER_Y + 0.30, 0);
            cwArm.userData.furnaceKey = 'FLUE_DAMPER';
            group.add(cwArm);

            // Motviktsblock (heavy counterweight at top of arm — dark grey)
            const cwBlock = new THREE.Mesh(
                new THREE.BoxGeometry(0.26, 0.18, 0.14),
                new THREE.MeshStandardMaterial({ color: 0x263238, roughness: 0.85 })
            );
            cwBlock.position.set(CW_X, DAMPER_Y + 0.72, 0);
            cwBlock.userData.furnaceKey = 'FLUE_DAMPER';
            group.add(cwBlock);

            // Spänntråd – horisontell sektion: från armen RÄTTUT (+x) till ugnens högra sida.
            // Löper i fri luft ovanför konvektionssektionens tak (y=6.4 < DAMPER_Y=7.25).
            const wireHLen  = CW_RIGHT_X - CW_X;   // 3.42 enheter åt höger
            const wireHMesh = new THREE.Mesh(
                new THREE.CylinderGeometry(0.010, 0.010, wireHLen, 4),
                steelMat
            );
            wireHMesh.rotation.z = Math.PI / 2; // horisontell längs X
            wireHMesh.position.set((CW_X + CW_RIGHT_X) / 2, DAMPER_Y, 0);
            group.add(wireHMesh); // visual only

            // Styrrulle (guide sheave) vid hörnet där tråden byter riktning horisontell → vertikal
            const sheave = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.06, 8), steelMat);
            sheave.rotation.x = Math.PI / 2; // axel längs Z
            sheave.position.set(CW_RIGHT_X, DAMPER_Y, 0);
            group.add(sheave); // visual only

            // Spänntråd – vertikal sektion: löper rakt NER utanför ugnens högra sida till vinschen
            const WINCH_Y  = 0.32;
            const wireVLen = DAMPER_Y - WINCH_Y;
            const wireVMesh = new THREE.Mesh(
                new THREE.CylinderGeometry(0.010, 0.010, wireVLen, 4),
                steelMat
            );
            wireVMesh.position.set(CW_RIGHT_X, (DAMPER_Y + WINCH_Y) / 2, 0);
            group.add(wireVMesh); // visual only

            // Handvinsch / Spjälltrumma — utanför ugnen på HÖGRA sidan (STEAM-sidan)
            // Monteringsstolpe
            const winchPost = new THREE.Mesh(new THREE.BoxGeometry(0.07, WINCH_Y * 2, 0.07), steelMat);
            winchPost.position.set(CW_RIGHT_X, WINCH_Y, 0);
            group.add(winchPost);

            // Trumma (horisontell cylinder, axel längs Z — operatören vevar framifrån)
            const winchDrum = new THREE.Mesh(
                new THREE.CylinderGeometry(0.09, 0.09, 0.24, 10),
                new THREE.MeshStandardMaterial({ color: 0x546e7a })
            );
            winchDrum.rotation.x = Math.PI / 2; // axel längs Z
            winchDrum.position.set(CW_RIGHT_X, WINCH_Y, 0);
            winchDrum.userData.furnaceKey = 'FLUE_DAMPER';
            group.add(winchDrum);

            // Vevarm (sticker ut framåt +z från trumman — operatören vevar framifrån)
            const crankArm = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.18, 5), steelMat);
            crankArm.rotation.x = Math.PI / 2; // längs Z
            crankArm.position.set(CW_RIGHT_X, WINCH_Y + 0.09, 0.18);
            crankArm.userData.furnaceKey = 'FLUE_DAMPER';
            group.add(crankArm);

            // T-handtag (vertikalt grepp i änden av vevens arm)
            const crankT = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.15, 5), steelMat);
            crankT.position.set(CW_RIGHT_X, WINCH_Y + 0.09, 0.27);
            crankT.userData.furnaceKey = 'FLUE_DAMPER';
            group.add(crankT);

            // ── STEAM nozzle (right face) ──────────────────────────────────
            const steam = new THREE.Mesh(
                new THREE.CylinderGeometry(0.06, 0.085, 0.28, 8),
                new THREE.MeshStandardMaterial({ color: 0x80cbc4 })
            );
            steam.rotation.z = Math.PI/2;
            steam.position.set(FW/2 + 0.14, FCY, 0);
            steam.userData.furnaceKey = 'STEAM';
            group.add(steam);

            // ── Main fuel gas header (front edge, x-axis) ────────────────
            const fuelHdr = new THREE.Mesh(
                new THREE.CylinderGeometry(0.065, 0.065, FW + 0.4, 8), fuelMat
            );
            fuelHdr.rotation.z = Math.PI/2;
            fuelHdr.position.set(0, HDR_Y, HDR_Z);
            group.add(fuelHdr);
            // Inlet stub extending right (toward V-XXX4 drum)
            const fuelStub = new THREE.Mesh(
                new THREE.CylinderGeometry(0.06, 0.06, 1.5, 8), fuelMat
            );
            fuelStub.rotation.z = Math.PI/2;
            fuelStub.position.set(FW/2 + 1.05, HDR_Y, HDR_Z);
            group.add(fuelStub);

            // Per-section BLEED valves are added inside SEC_DEFS.forEach below

            // ── Per-section elements ───────────────────────────────────────
            const SEC_DEFS = [
                { sec: 'A', xOff: -2.5, secCol: 0xb71c1c },
                { sec: 'B', xOff:  0,   secCol: 0x1b5e20 },
                { sec: 'C', xOff:  2.5, secCol: 0x0d47a1 }
            ];
            const BZ = [-1.5, -0.9, -0.3, 0.3, 0.9, 1.5];
            // Burner indicator rows: [absolute-y, [relative-x offsets]]
            const BIND_ROWS = [
                [LIFT + 1.24, [-0.55, 0, 0.55]],   // burners 1-3
                [LIFT + 1.84, [-0.55, 0, 0.55]]    // burners 4-6
            ];

            SEC_DEFS.forEach(({ sec, xOff, secCol }) => {

                // ── Colour stripe (top of front face) ─────────────────────
                const stripe = new THREE.Mesh(
                    new THREE.BoxGeometry(2.3, 0.1, 0.03),
                    new THREE.MeshStandardMaterial({ color: secCol, emissive: secCol, emissiveIntensity: 0.3 })
                );
                stripe.position.set(xOff, LIFT + FH - 0.10, FD/2 + 0.01);
                group.add(stripe);

                // ── Section label sprite — small plain dark badge ──────────
                const lc   = document.createElement('canvas');
                lc.width   = 128; lc.height = 64;
                const lctx = lc.getContext('2d');
                lctx.fillStyle = 'rgba(0,0,0,0.55)';
                lctx.fillRect(0, 0, 128, 64);
                lctx.fillStyle = 'white';
                lctx.font = 'bold 46px Arial';
                lctx.textAlign = 'center'; lctx.textBaseline = 'middle';
                lctx.fillText(sec, 64, 32);
                const lSprite = new THREE.Sprite(
                    new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(lc) })
                );
                lSprite.position.set(xOff, LIFT + FH + 0.18, FD/2 + 0.65);
                lSprite.scale.set(0.55, 0.28, 1.0);
                group.add(lSprite);

                // ── Process radiant tubes near ceiling (purely visual) ─────
                const tubeY = LIFT + FH - 0.22;  // 4.98
                for (const tz of [-1.4, -0.7, 0, 0.7, 1.4]) {
                    const tube = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.04, 0.04, 2.2, 8), tubeMat
                    );
                    tube.rotation.z = Math.PI / 2;  // align along x-axis
                    tube.position.set(xOff, tubeY, tz);
                    group.add(tube);
                }
                // Front-to-back manifolds connecting the tubes at section edges
                for (const mx of [xOff - 1.08, xOff + 1.08]) {
                    const manifold = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.05, 0.05, FD - 0.5, 8), tubeMat
                    );
                    manifold.rotation.x = Math.PI / 2;  // align along z-axis
                    manifold.position.set(mx, tubeY, 0);
                    group.add(manifold);
                }

                // ── Underside air register boxes — one PRIM+SEC package BESIDE each burner ──
                // Box sits at x = xOff + AIR_DX (moved to the RIGHT to clear the burner/pilot area)
                // Two stacked boxes: SEC_AIR (upper) + PRIM_AIR (lower), divided by a plate
                const AIR_DX    = 0.90;  // x-offset from burner feed pipe centre (moved right)
                const regFrMat  = new THREE.MeshStandardMaterial({ color: 0x546e7a, roughness: 0.8 });
                const BOX_W     = 0.18;  // width in x
                const BOX_D     = 0.13;  // depth in z
                const BOX_H     = 0.09;  // height of each section
                for (let b = 0; b < 6; b++) {
                    const bz = BZ[b];
                    const rx = xOff + AIR_DX;

                    // Thin mounting bracket from firebox floor to register assembly
                    const bracket = new THREE.Mesh(
                        new THREE.BoxGeometry(0.05, 0.04, 0.05), regFrMat
                    );
                    bracket.position.set(rx, LIFT - 0.02, bz);
                    group.add(bracket);

                    // SEC_AIR box (upper section, closer to firebox floor)
                    const secBox = new THREE.Mesh(
                        new THREE.BoxGeometry(BOX_W, BOX_H, BOX_D), airMat.clone()
                    );
                    secBox.position.set(rx, LIFT - 0.065, bz);
                    secBox.userData.furnaceKey = `SEC_AIR_${sec}`;
                    group.add(secBox);
                    // Louver detail — thin horizontal slit across SEC box face
                    const secLouver = new THREE.Mesh(
                        new THREE.BoxGeometry(BOX_W + 0.01, 0.012, BOX_D + 0.01), regFrMat
                    );
                    secLouver.position.set(rx, LIFT - 0.065, bz);
                    group.add(secLouver);

                    // Divider plate separating SEC from PRIM
                    const divPlate = new THREE.Mesh(
                        new THREE.BoxGeometry(BOX_W + 0.02, 0.014, BOX_D + 0.02), regFrMat
                    );
                    divPlate.position.set(rx, LIFT - 0.115, bz);
                    group.add(divPlate);

                    // PRIM_AIR box (lower section, below SEC_AIR)
                    const primBox = new THREE.Mesh(
                        new THREE.BoxGeometry(BOX_W, BOX_H, BOX_D), airMat.clone()
                    );
                    primBox.position.set(rx, LIFT - 0.165, bz);
                    primBox.userData.furnaceKey = `PRIM_AIR_${sec}`;
                    group.add(primBox);
                    // Louver detail — thin horizontal slit across PRIM box face
                    const primLouver = new THREE.Mesh(
                        new THREE.BoxGeometry(BOX_W + 0.01, 0.012, BOX_D + 0.01), regFrMat
                    );
                    primLouver.position.set(rx, LIFT - 0.165, bz);
                    group.add(primLouver);
                }

                // ── PILOT — Fristående portabel tändbrännare (gasoltube + sond) ──────
                // Monteras bredvid brännare 1 (z = BZ[0] = -1.5).
                // Piloten är en separat portabel enhet — inte en del av ugnskonstruktionen.
                // PILOT_X offset -0.15 från xOff så sonden INTE går igenom subheadern (vid x=xOff).
                // Klickbara delar: sond-spetsen, kopplingen och gasoltubens ventil.
                const PILOT_Z    = BZ[0];           // centrerat med brännare 1 — sonden går inuti ringmuren
                const PILOT_X    = xOff - 0.08;    // 0.08 från sub-header (r=0.05+rod r=0.012=0.062 → OK), inuti ring (r<RING_INNER 0.10)
                const BOTTLE_X   = xOff - 0.45;    // gasoltub längre åt vänster, tydligt åtskild
                const gasBotMat  = new THREE.MeshStandardMaterial({ color: 0xe64a19, roughness: 0.5 }); // orange-röd gasoltub
                const gasValvMat = new THREE.MeshStandardMaterial({ color: 0xffd54f }); // mässing-gul ventil

                // Sondens infällningsrör — startar OVANFÖR subheadern (y > SUB_Y=1.0) upp till eldstadsgolvet.
                // Ingen stav nedanför kopplingslådan.
                const ROD_BOT = SUB_Y + 0.12;     // 1.12 — precis ovanför subheaderns överkant
                const ROD_LEN = LIFT - ROD_BOT;   // 0.88
                const pilotRod = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.012, 0.012, ROD_LEN, 6), pilotMat.clone()
                );
                pilotRod.position.set(PILOT_X, ROD_BOT + ROD_LEN / 2, PILOT_Z);
                group.add(pilotRod); // visuell — ingen furnaceKey

                // Tändhuvud/flamspets vid sondtoppen (orange kon = pilotlåga)
                const igHead = new THREE.Mesh(
                    new THREE.ConeGeometry(0.028, 0.10, 8),
                    new THREE.MeshStandardMaterial({ color: 0xff9800 })
                );
                igHead.position.set(PILOT_X, LIFT - 0.02, PILOT_Z);
                igHead.userData.furnaceKey = `PILOT_${sec}`;
                group.add(igHead);

                // Gaskoppling (lådan vid sondstaven, i nivå med gasoltubens ventil)
                const COUPLING_Y = 0.42;  // matchar toppen av gasventilen (y=0.39+0.03)
                const gasCoupling = new THREE.Mesh(
                    new THREE.BoxGeometry(0.10, 0.07, 0.10), gasBotMat
                );
                gasCoupling.position.set(PILOT_X, COUPLING_Y, PILOT_Z);
                gasCoupling.userData.furnaceKey = `PILOT_${sec}`;
                group.add(gasCoupling);

                // Gasslang (horisontell från kopplingslådan till gasoltubens ventil — samma y)
                const HOSE_LEN = Math.abs(PILOT_X - BOTTLE_X);  // 0.30
                const hose = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.009, 0.009, HOSE_LEN, 4), pilotMat.clone()
                );
                hose.rotation.z = Math.PI / 2;
                hose.position.set((PILOT_X + BOTTLE_X) / 2, COUPLING_Y, PILOT_Z);
                group.add(hose); // visuell

                // Vertikalt kopplingrör: fyller gapet från kopplingslådan (COUPLING_Y) upp till sondstaven (ROD_BOT)
                const connLen = ROD_BOT - COUPLING_Y;   // 1.12 - 0.42 = 0.70
                const connector = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.010, 0.010, connLen, 6), pilotMat.clone()
                );
                connector.position.set(PILOT_X, COUPLING_Y + connLen / 2, PILOT_Z);
                group.add(connector); // visuell

                // Gasoltub (stående orange-röd cylinder på golvet)
                const gasBot = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.065, 0.065, 0.30, 10), gasBotMat
                );
                gasBot.position.set(BOTTLE_X, 0.18, PILOT_Z);
                gasBot.userData.furnaceKey = `PILOT_${sec}`;
                group.add(gasBot);

                // Gasoltubens toppdel (halvsfär) — avrundad topp
                const botTop = new THREE.Mesh(
                    new THREE.SphereGeometry(0.065, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2),
                    gasBotMat
                );
                botTop.position.set(BOTTLE_X, 0.33, PILOT_Z);
                group.add(botTop); // visuell

                // Gasventil (mässingsgul, sitter på toppen av tuben — klickbar)
                const gasValve = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.025, 0.050, 0.06, 8), gasValvMat
                );
                gasValve.position.set(BOTTLE_X, 0.39, PILOT_Z);
                gasValve.userData.furnaceKey = `PILOT_${sec}`;
                group.add(gasValve);

                // Handtag på gasventilen (T-formad vridknopp)
                const valveHandle = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.010, 0.010, 0.14, 5), gasValvMat
                );
                valveHandle.rotation.z = Math.PI / 2;
                valveHandle.position.set(BOTTLE_X, 0.39, PILOT_Z);
                valveHandle.userData.furnaceKey = `PILOT_${sec}`;
                group.add(valveHandle);

                // ── KIKV valves on front face (2 rows × 3 cols = 6/section) ─
                // Row 1 at y=LIFT+0.62 (KIKV_X1..X3), row 2 at y=LIFT+0.80 (KIKV_X4..X6)
                const KIKV_ROWS = [
                    { ky: LIFT + 0.62, idxStart: 1 },
                    { ky: LIFT + 0.80, idxStart: 4 }
                ];
                const KIKV_X = [xOff - 0.45, xOff, xOff + 0.45];
                KIKV_ROWS.forEach(({ ky, idxStart }) => {
                    KIKV_X.forEach((kx, col) => {
                        const fKey = `KIKV_${sec}${idxStart + col}`;
                        // Housing body
                        const housing = new THREE.Mesh(
                            new THREE.BoxGeometry(0.10, 0.10, 0.08), kikvMat.clone()
                        );
                        housing.position.set(kx, ky, FD/2 + 0.04);
                        group.add(housing);
                        // Stem protruding outward in z (furnaceKey for click)
                        const kStem = new THREE.Mesh(
                            new THREE.CylinderGeometry(0.02, 0.02, 0.10, 6), stemMat
                        );
                        kStem.rotation.x = Math.PI / 2;
                        kStem.position.set(kx, ky, FD/2 + 0.10);
                        kStem.userData.furnaceKey = fKey;
                        group.add(kStem);
                        // T-handle (perpendicular, along x — also clickable)
                        const kHandle = new THREE.Mesh(
                            new THREE.CylinderGeometry(0.015, 0.015, 0.16, 6), kikvMat.clone()
                        );
                        kHandle.rotation.z = Math.PI / 2;
                        kHandle.position.set(kx, ky, FD/2 + 0.15);
                        kHandle.userData.furnaceKey = fKey;
                        group.add(kHandle);

                        // ── KIKV label sprite ──────────────────────────────────
                        const klc = document.createElement('canvas');
                        klc.width = 64; klc.height = 32;
                        const klctx = klc.getContext('2d');
                        klctx.fillStyle = 'rgba(20,20,20,0.82)';
                        klctx.fillRect(0, 0, 64, 32);
                        klctx.fillStyle = '#ffffff';
                        klctx.font = 'bold 20px Arial';
                        klctx.textAlign = 'center'; klctx.textBaseline = 'middle';
                        klctx.fillText(`${sec}${idxStart + col}`, 32, 16);
                        const klSprite = new THREE.Sprite(
                            new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(klc) })
                        );
                        klSprite.position.set(kx, ky + 0.12, FD/2 + 0.15);
                        klSprite.scale.set(0.20, 0.10, 1.0);
                        group.add(klSprite);
                    });
                });

                // ── Inspection hatch (y = LIFT+1.54, height 1.2) ──────────
                const hFrame = new THREE.Mesh(
                    new THREE.BoxGeometry(2.05, 1.2, 0.03), hatchFrameMat.clone()
                );
                hFrame.position.set(xOff, LIFT + 1.54, FD/2 + 0.012);
                group.add(hFrame);
                const hatch = new THREE.Mesh(
                    new THREE.BoxGeometry(1.9, 1.05, 0.04), hatchPlateMat.clone()
                );
                hatch.position.set(xOff, LIFT + 1.54, FD/2 + 0.028);
                hatch.userData.furnaceKey = `HATCH_${sec}`;
                group.add(hatch);
                const hHandle = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.04, 0.04, 0.28, 8), hatchFrameMat.clone()
                );
                hHandle.rotation.z = Math.PI / 2;
                hHandle.position.set(xOff - 0.7, LIFT + 1.54, FD/2 + 0.052);
                hHandle.userData.furnaceKey = `HATCH_${sec}`;
                group.add(hHandle);
                // Burner indicator discs inside hatch area
                let bIdx = 0;
                for (const [by, bxArr] of BIND_ROWS) {
                    for (const bxRel of bxArr) {
                        const burnerInd = new THREE.Mesh(
                            new THREE.CylinderGeometry(0.1, 0.1, 0.06, 12), burnerIndMat.clone()
                        );
                        burnerInd.position.set(xOff + bxRel, by, FD/2 + 0.058);
                        burnerInd.userData.furnaceKey = `BURNER_${sec}${bIdx + 1}`;
                        group.add(burnerInd);
                        bIdx++;
                    }
                }

                // ── Underspace: section distribution header + TSO A/B + feed pipes ──
                // Distribution sub-header (z-axis, full depth)
                // Distribution sub-header (z-axis, back-to-front, ending at main header z)
                const subHdr = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.05, 0.05, SUB_HDR_LEN, 8), fuelMat
                );
                subHdr.rotation.x = Math.PI / 2;
                subHdr.position.set(xOff, SUB_Y, SUB_HDR_CEN_Z);
                group.add(subHdr);

                // ── BLEED valve — tees off top of section sub-header at back end ──
                // Valve body sits on top of sub-header; vent pipe rises upward (bränngas till atmosfär)
                const bleedMat = new THREE.MeshStandardMaterial({ color: 0xffa726 });
                // Short vertical stub from sub-header up to valve body
                const bleedStub = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.025, 0.025, 0.13, 6), bleedMat.clone()
                );
                bleedStub.position.set(xOff, SUB_Y + 0.065, SUB_Z_BACK);
                group.add(bleedStub);
                // Valve body (clickable orange box)
                const bleedBody = new THREE.Mesh(
                    new THREE.BoxGeometry(0.15, 0.15, 0.15), bleedMat.clone()
                );
                bleedBody.position.set(xOff, SUB_Y + 0.205, SUB_Z_BACK);
                bleedBody.userData.furnaceKey = `BLEED_${sec}`;
                group.add(bleedBody);
                // Vent pipe rising upward from valve body
                const bleedVent = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.022, 0.022, 0.40, 6), bleedMat.clone()
                );
                bleedVent.position.set(xOff, SUB_Y + 0.48, SUB_Z_BACK);
                group.add(bleedVent);
                // Vent cap (open to atmosphere — wider flared top)
                const bleedCap = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.038, 0.022, 0.04, 6), bleedMat.clone()
                );
                bleedCap.position.set(xOff, SUB_Y + 0.70, SUB_Z_BACK);
                group.add(bleedCap);

                // TSO A (drift/duty) and TSO B (standby) — parallel vertical branches
                // Both at z=HDR_Z, x = xOff ± BRANCH_DX
                const BRANCH_DX  = 0.28;
                const BRANCH_H   = HDR_Y - SUB_Y;        // 0.7 — plenty of clearance
                const BRANCH_MID = (HDR_Y + SUB_Y) / 2;  // 1.35

                // Cross-connector at SUB_Y merging both branches into sub-header
                const crossConn = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.04, 0.04, BRANCH_DX * 2 + 0.1, 6), fuelMat
                );
                crossConn.rotation.z = Math.PI / 2;
                crossConn.position.set(xOff, SUB_Y, HDR_Z);
                group.add(crossConn);

                const actuatorMat = new THREE.MeshStandardMaterial({ color: 0x455a64, roughness: 0.5 });
                const indicMat    = new THREE.MeshStandardMaterial({ color: 0xffeb3b, emissive: 0xffeb3b, emissiveIntensity: 0.3 });

                [['A', xOff - BRANCH_DX], ['B', xOff + BRANCH_DX]].forEach(([ab, bx]) => {
                    const fKey = `TSO_${sec}${ab}`;

                    // Vertical branch pipe (full height of branch)
                    const branchPipe = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.04, 0.04, BRANCH_H + 0.04, 6), fuelMat
                    );
                    branchPipe.position.set(bx, BRANCH_MID, HDR_Z);
                    group.add(branchPipe);

                    // ── Actuated on/off valve body ─────────────────────────────
                    // Lower pipe flange (inlet side) — carries furnaceKey for colour update
                    const flangeBot = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.115, 0.115, 0.035, 10), tsoMat.clone()
                    );
                    flangeBot.position.set(bx, BRANCH_MID - 0.12, HDR_Z);
                    flangeBot.userData.furnaceKey = fKey;
                    group.add(flangeBot);

                    // Valve body cylinder (between flanges) — carries furnaceKey
                    const valveBody = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.082, 0.082, 0.20, 10), tsoMat.clone()
                    );
                    valveBody.position.set(bx, BRANCH_MID, HDR_Z);
                    valveBody.userData.furnaceKey = fKey;
                    group.add(valveBody);

                    // Upper pipe flange (outlet side) — carries furnaceKey
                    const flangeTop = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.115, 0.115, 0.035, 10), tsoMat.clone()
                    );
                    flangeTop.position.set(bx, BRANCH_MID + 0.12, HDR_Z);
                    flangeTop.userData.furnaceKey = fKey;
                    group.add(flangeTop);

                    // ── Pneumatic actuator — side-mounted, protrudes in +z ─────
                    // Actuator yoke (connects valve body to actuator)
                    const yoke = new THREE.Mesh(
                        new THREE.BoxGeometry(0.06, 0.06, 0.12), actuatorMat
                    );
                    yoke.position.set(bx, BRANCH_MID, HDR_Z + 0.10);
                    group.add(yoke);

                    // Actuator cylinder body (spring-return / pneumatic canister)
                    const actCyl = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.062, 0.062, 0.22, 12), actuatorMat
                    );
                    actCyl.rotation.x = Math.PI / 2;
                    actCyl.position.set(bx, BRANCH_MID, HDR_Z + 0.24);
                    group.add(actCyl);

                    // Front end cap (flat disc closing the cylinder)
                    const endCap = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.068, 0.068, 0.022, 12), actuatorMat
                    );
                    endCap.rotation.x = Math.PI / 2;
                    endCap.position.set(bx, BRANCH_MID, HDR_Z + 0.361);
                    group.add(endCap);

                    // Position indicator rod (yellow nub — shows open/closed)
                    const indicator = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.014, 0.014, 0.07, 6), indicMat
                    );
                    indicator.rotation.x = Math.PI / 2;
                    indicator.position.set(bx, BRANCH_MID, HDR_Z + 0.42);
                    group.add(indicator);

                    // ── Flow-direction arrow (Group — rotated by updateFurnaceElementVisual) ──
                    // Arrow points DOWN = open/with-flow; SIDEWAYS = closed/blocked
                    const arrowGroup = new THREE.Group();
                    arrowGroup.userData.tsoArrowKey = fKey;
                    const arrowMat = new THREE.MeshStandardMaterial({
                        color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.7
                    });
                    // Arrow head (cone, apex at +y by default)
                    const arrowCone = new THREE.Mesh(
                        new THREE.ConeGeometry(0.034, 0.085, 6), arrowMat
                    );
                    arrowCone.position.set(0, 0.045, 0);
                    arrowGroup.add(arrowCone);
                    // Arrow shaft
                    const arrowShaft = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.013, 0.013, 0.065, 6), arrowMat
                    );
                    arrowShaft.position.set(0, -0.012, 0);
                    arrowGroup.add(arrowShaft);
                    // Initial state = 'closed' → arrow points sideways (+x): rotate group -90° around z
                    arrowGroup.rotation.z = -Math.PI / 2;
                    // On the front face of the actuator end cap (z = HDR_Z+0.46)
                    arrowGroup.position.set(bx, BRANCH_MID, HDR_Z + 0.46);
                    group.add(arrowGroup);
                });

                // ── Burner floor walls — cirkulär eldfast ring runt varje brännaröppning ──
                // Cylindrisk vägg (öppen) + annulär topplatta bildar en rund mur på eldstadsgolvet.
                // RING_INNER = 0.10 ger plats för feedröret (r=0.028) OCH pilotsonden (offset 0.08 < 0.10).
                const RING_OUTER  = 0.15;
                const RING_INNER  = 0.10;
                const RING_H      = 0.10;
                const refracMat   = new THREE.MeshStandardMaterial({ color: 0x6d4c41, roughness: 0.9, side: THREE.DoubleSide });
                const refracCapMat= new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9 });
                for (let b = 0; b < 6; b++) {
                    const bz = BZ[b];
                    // Cylindrisk ytterväggsyta (open-ended)
                    const ring = new THREE.Mesh(
                        new THREE.CylinderGeometry(RING_OUTER, RING_OUTER, RING_H, 16, 1, true), refracMat
                    );
                    ring.position.set(xOff, LIFT + RING_H / 2, bz);
                    group.add(ring);
                    // Annulär topplatta (RingGeometry i horisontellt läge)
                    const cap = new THREE.Mesh(
                        new THREE.RingGeometry(RING_INNER, RING_OUTER, 16), refracCapMat
                    );
                    cap.rotation.x = -Math.PI / 2;
                    cap.position.set(xOff, LIFT + RING_H, bz);
                    group.add(cap);
                }

                // Feed pipes (6 per section) — each is the clickable "burner" element
                // furnaceKey = BURNER_secN so user can click the visible feed pipe directly
                for (let b = 0; b < 6; b++) {
                    const feed = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.028, 0.028, FEED_H, 6),
                        new THREE.MeshStandardMaterial({ color: 0x9e9e9e })
                    );
                    feed.position.set(xOff, SUB_Y + FEED_H / 2, BZ[b]);
                    feed.userData.furnaceKey = `BURNER_${sec}${b + 1}`;
                    group.add(feed);
                }
            });

            return group;
        }
    },

    v_xxx4_drum: {
        type: 'v_xxx4_drum',
        name: 'V-XXX4 Bränslegastrumma',
        icon: '🛢',
        category: 'Läromoduler',
        description: 'Stående bränslegastrumma med nivåindikator. Klicka på inspektionsknappen för att avläsa vätskenivån.',
        ports: {},
        parameters: {
            level: { value: 0, unit: '%', label: 'Vätskenivå' }
        },
        initialFurnaceState: {
            V_XXX4_INSPECT: false,
            DRAIN_V_XXX4: 'closed'
        },
        buildMesh(THREE) {
            const group = new THREE.Group();

            const R     = 0.7;              // cylinder radius
            const TH    = 2.8;              // cylinder height
            const LEG_H = 1.4;              // support skirt height
            const CY    = LEG_H + TH / 2;  // body centre y = 2.8
            const HDR_Y = 1.7;              // matches furnace fuel header height

            const drumMat  = new THREE.MeshStandardMaterial({ color: 0x607d8b, roughness: 0.6 });
            const capMat   = new THREE.MeshStandardMaterial({ color: 0x546e7a });
            const fuelMat  = new THREE.MeshStandardMaterial({ color: 0xffd54f });
            const inspMat  = new THREE.MeshStandardMaterial({ color: 0xffd54f, emissive: 0xffd54f, emissiveIntensity: 0.4 });
            const levelMat = new THREE.MeshStandardMaterial({ color: 0xffd54f, emissive: 0xffd54f, emissiveIntensity: 0.45 });
            const skirtMat = new THREE.MeshStandardMaterial({ color: 0x546e7a, side: THREE.DoubleSide });

            // Vertical cylinder body
            const body = new THREE.Mesh(new THREE.CylinderGeometry(R, R, TH, 16), drumMat);
            body.position.set(0, CY, 0);
            group.add(body);

            // Dome top (hemisphere)
            const dome = new THREE.Mesh(
                new THREE.SphereGeometry(R, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
                capMat
            );
            dome.position.set(0, LEG_H + TH, 0);
            group.add(dome);

            // Bottom ellipsoidal cap
            const btmCap = new THREE.Mesh(
                new THREE.SphereGeometry(R, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
                capMat
            );
            btmCap.position.set(0, LEG_H, 0);
            group.add(btmCap);

            // Support skirt (open cylinder as legs)
            const skirt = new THREE.Mesh(
                new THREE.CylinderGeometry(R + 0.04, R + 0.06, LEG_H, 16, 1, true),
                skirtMat
            );
            skirt.position.set(0, LEG_H / 2, 0);
            group.add(skirt);

            // Base ring / saddle plate
            const base = new THREE.Mesh(
                new THREE.CylinderGeometry(R + 0.12, R + 0.12, 0.07, 16),
                new THREE.MeshStandardMaterial({ color: 0x424242 })
            );
            base.position.set(0, 0.035, 0);
            group.add(base);

            // Gas outlet nozzle (horizontal, points LEFT toward furnace fuel header)
            // At HDR_Y=1.7 to match furnace, extends from tank wall to furnace stub tip
            const nozzle = new THREE.Mesh(
                new THREE.CylinderGeometry(0.065, 0.065, 1.8, 8), fuelMat
            );
            nozzle.rotation.z = Math.PI / 2;
            nozzle.position.set(-(R + 0.9), HDR_Y, 0);  // z=0 local; drum placed at world z=HDR_Z=2.1
            group.add(nozzle);

            // Level indicator glass (yellow vertical band — clickable: avläs nivå)
            const levelBand = new THREE.Mesh(
                new THREE.BoxGeometry(0.07, TH * 0.65, 0.07), levelMat
            );
            levelBand.position.set(R + 0.04, CY, 0);
            levelBand.userData.furnaceKey = 'V_XXX4_INSPECT';  // large easy-to-click target
            group.add(levelBand);

            // Inspection instrument nozzle (also clickable)
            const inspectMesh = new THREE.Mesh(
                new THREE.CylinderGeometry(0.1, 0.1, 0.12, 8), inspMat
            );
            inspectMesh.rotation.z = Math.PI / 2;
            inspectMesh.position.set(R + 0.1, CY + 0.7, 0);
            inspectMesh.userData.furnaceKey = 'V_XXX4_INSPECT';
            group.add(inspectMesh);

            // ── Drain valve + flare pipe — on front face (+z) of drum ────────
            // Positioned outside drum wall so the valve is always clickable.
            const drainMat  = new THREE.MeshStandardMaterial({ color: 0xffa726 });
            const flareMat  = new THREE.MeshStandardMaterial({ color: 0x9e9e9e });
            const DRAIN_Y   = LEG_H - 0.25;  // 1.15 — near drum base, still above skirt bottom
            const DRAIN_Z0  = R;              // 0.70 — drum wall on +z side
            const DRAIN_ZV  = R + 0.22;      // 0.92 — valve body centre (outside drum)
            // Short horizontal stub from drum wall to valve body
            const drainStub = new THREE.Mesh(
                new THREE.CylinderGeometry(0.04, 0.04, 0.24, 6), drainMat.clone()
            );
            drainStub.rotation.x = Math.PI / 2;
            drainStub.position.set(0, DRAIN_Y, (DRAIN_Z0 + DRAIN_ZV) / 2);  // z = 0.81
            group.add(drainStub);
            // Drain valve body (clickable — DRAIN_V_XXX4) — fully outside drum wall
            const drainValve = new THREE.Mesh(
                new THREE.BoxGeometry(0.18, 0.18, 0.18), drainMat.clone()
            );
            drainValve.position.set(0, DRAIN_Y, DRAIN_ZV);  // z = 0.92
            drainValve.userData.furnaceKey = 'DRAIN_V_XXX4';
            group.add(drainValve);
            // Horizontal flare pipe continuing forward (+z) from valve
            const flareH = new THREE.Mesh(
                new THREE.CylinderGeometry(0.03, 0.03, 1.0, 6), flareMat
            );
            flareH.rotation.x = Math.PI / 2;
            flareH.position.set(0, DRAIN_Y, DRAIN_ZV + 0.59);  // z = 1.51, pipe from 1.01 to 2.01
            group.add(flareH);
            // Flare cap (open end to atmosphere/flare)
            const flareCap = new THREE.Mesh(
                new THREE.CylinderGeometry(0.055, 0.03, 0.06, 6), drainMat.clone()
            );
            flareCap.rotation.x = Math.PI / 2;
            flareCap.position.set(0, DRAIN_Y, DRAIN_ZV + 1.12);  // z = 2.04
            group.add(flareCap);

            return group;
        }
    }
};
