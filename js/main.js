/**
 * main.js - Huvudlogik för Process Builder 3D
 * Sätter upp Three.js-scen, kamera, renderer, kontroller och hanterar användarinteraktion.
 */

(() => {
    // --- Three.js grundsetup ---
    const canvas = document.getElementById('three-canvas');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 2000);
    camera.position.set(15, 12, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // --- Orbit Controls ---
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 2;
    controls.maxDistance = 150;
    controls.maxPolarAngle = Math.PI / 2.05;

    // --- Ljus ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(30, 40, 30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(2048, 2048);
    dirLight.shadow.camera.left = -50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = -50;
    dirLight.shadow.camera.far = 120;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3);
    fillLight.position.set(-20, 15, -20);
    scene.add(fillLight);

    // --- Grid (100x100, with major/minor lines) ---
    const GRID_SIZE = 100;
    // Minor grid: every 1 unit (subtle)
    const gridMinor = new THREE.GridHelper(GRID_SIZE, GRID_SIZE, 0x2a2a4a, 0x2a2a4a);
    scene.add(gridMinor);
    // Major grid: every 10 units (brighter)
    const gridMajor = new THREE.GridHelper(GRID_SIZE, 10, 0x4a4a6a, 0x3a3a5a);
    gridMajor.position.y = 0.005; // slightly above minor to avoid z-fighting
    scene.add(gridMajor);

    // Ground plane (for raycasting)
    const groundGeo = new THREE.PlaneGeometry(GRID_SIZE, GRID_SIZE);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 1 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.name = '__ground';
    scene.add(ground);

    // --- Clock for deltaTime ---
    const clock = new THREE.Clock();

    // --- Simulation state ---
    let simulationRunning = false;
    const FLOW_PARTICLE_COUNT = 5;
    const FLOW_SPEED = 0.15;
    const FLOW_PARTICLE_COLOR = 0x00e5ff;

    // --- Dynamic simulation state ---
    let simGraph = null;       // { sorted: [...compIds], adjOut: Map, adjIn: Map }
    let simInterval = null;
    const SIM_TICK_MS = 200;

    // --- State ---
    const placedComponents = [];
    const selectedComponents = [];
    // Computed shorthand for single-selection (used by keyboard shortcuts, toolbar, properties)
    Object.defineProperty(window, 'selectedPlacedComponent', {
        get() { return selectedComponents.length === 1 ? selectedComponents[0] : null; },
        configurable: true
    });
    let nextId = 1;

    // Ghost preview state
    let ghostMesh = null;
    let ghostType = null;
    let ghostRotation = 0; // 0, 90, 180, 270
    let ghostPlacementHeight = 0; // manual height offset (Shift+scroll)

    // Move mode state
    let movingComponent = null;
    let moveOriginalPos = null;
    let moveOriginalRot = null;

    // Multi-select: move mode state for group
    let movingGroup = null; // array of { comp, origX, origZ, origRot }
    let moveGroupAnchor = null; // { x, z } first click position

    // Selection box (rubber band) state
    let selectionBox = null; // { startX, startY } screen coords
    let selectionBoxEl = null; // DOM element

    // --- Connection state ---
    const pipes = [];
    let pipeNextId = 1;
    let pipeDrawingState = null;
    // { phase, fromComp, fromPort, toComp, toPort, waypoints: [Vector3...],
    //   previewLine, waypointMarkers: [Mesh...], currentHeight: 0 }

    // --- Click vs drag detection via pointer events ---
    // OrbitControls stays fully enabled at all times. We distinguish clicks
    // from camera drags by tracking pointer movement between down and up.
    const DRAG_THRESHOLD_SQ = 36; // 6px squared
    let pointerDownInfo = null; // { x, y, moved }

    let selectedPipe = null;

    // --- Undo/Redo state ---
    const undoStack = [];
    const redoStack = [];
    const MAX_UNDO = 50;
    let restoringSnapshot = false;

    // Fas 2: nearby port highlight tracking
    let nearbyHighlightedMarkers = [];

    // Port marker colors
    const PORT_COLOR_IN = 0x42a5f5;   // blue
    const PORT_COLOR_OUT = 0xef5350;  // red
    const PORT_COLOR_CONNECTED = 0x66bb6a; // green
    const PORT_COLOR_SELECTED = 0xffee58;  // yellow (pulsing)
    const PIPE_COLOR = 0x888899;
    const PIPE_COLOR_SELECTED = 0xffee58;
    const PIPE_COLOR_INCOMPAT  = 0xff3333;  // red  – inkompatibel media
    const PIPE_COLOR_WARNING   = 0xff9900;  // orange – varning (t.ex. fel ångtyp)

    // --- Fas 4: Nödstopp state ---
    let emergencyStopActive = false;

    // --- Fas 4: Sequence state ---
    let activeSequence = null;
    let sequenceStepIndex = 0;
    let sequenceCompleted = false;
    let sequenceValidationInterval = null;
    let sequenceHighlightComp = null;

    // --- Fas 4b: Fault state ---
    let activeFaults = [];
    let faultNextId = 1;
    let hintTimer = null;
    let hintVisible = false;

    // Fas 2: Intelligent koppling
    const PORT_COLOR_COMPATIBLE = 0x69f0ae;
    const PORT_COLOR_INCOMPATIBLE = 0xff5252;
    const NEARBY_PORT_DISTANCE = 1.5;
    const ALIGN_LINE_COLOR = 0x4fc3f7;

    // --- Raycaster ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // --- Resize handling ---
    function resize() {
        const viewport = document.getElementById('viewport');
        const w = viewport.clientWidth;
        const h = viewport.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
    window.addEventListener('resize', resize);
    resize();

    // --- Lift mesh so its bottom sits on the grid (y=0) ---
    function liftToGround(mesh) {
        const box = new THREE.Box3().setFromObject(mesh);
        mesh.position.y = -box.min.y;
    }

    // --- Auto-foundation: add support pillars if bottom ports are too close to grid ---
    const MIN_PORT_CLEARANCE = 0.35; // minimum world-Y for any port
    function addAutoFoundation(mesh, def) {
        if (!def || !def.ports) return;
        // Find lowest port Y in local coordinates
        let lowestPortY = Infinity;
        for (const port of Object.values(def.ports)) {
            if (port.position[1] < lowestPortY) lowestPortY = port.position[1];
        }
        if (lowestPortY === Infinity) return;

        // Current mesh bounding box (before liftToGround)
        const box = new THREE.Box3().setFromObject(mesh);
        const meshBottom = box.min.y;

        // After liftToGround, port world Y = -meshBottom + lowestPortY
        const portWorldY = -meshBottom + lowestPortY;
        if (portWorldY >= MIN_PORT_CLEARANCE) return; // already fine

        const needed = MIN_PORT_CLEARANCE - portWorldY + 0.05; // extra margin

        // Calculate footprint for pillar placement
        const w = box.max.x - box.min.x;
        const d = box.max.z - box.min.z;
        const pillarW = Math.max(0.06, Math.min(0.12, Math.min(w, d) * 0.12));
        const offX = Math.max(pillarW, w * 0.28);
        const offZ = Math.max(pillarW, d * 0.28);

        const foundMat = new THREE.MeshStandardMaterial({ color: 0x616161 });

        // 4 concrete/steel support pillars
        const positions = [[-offX, -offZ], [offX, -offZ], [-offX, offZ], [offX, offZ]];
        for (const [dx, dz] of positions) {
            const pillar = new THREE.Mesh(
                new THREE.BoxGeometry(pillarW, needed, pillarW),
                foundMat
            );
            pillar.position.set(dx, meshBottom - needed / 2, dz);
            mesh.add(pillar);
        }

        // Base plate connecting pillars at ground level
        const plate = new THREE.Mesh(
            new THREE.BoxGeometry(offX * 2 + pillarW * 2, 0.04, offZ * 2 + pillarW * 2),
            foundMat
        );
        plate.position.y = meshBottom - needed;
        mesh.add(plate);

        // Cross beams between pillars (top of foundation)
        const beamMat = new THREE.MeshStandardMaterial({ color: 0x757575 });
        // Front-back beams
        for (const dx of [-offX, offX]) {
            const beam = new THREE.Mesh(
                new THREE.BoxGeometry(pillarW * 0.8, pillarW * 0.6, offZ * 2),
                beamMat
            );
            beam.position.set(dx, meshBottom - 0.02, 0);
            mesh.add(beam);
        }
        // Left-right beams
        for (const dz of [-offZ, offZ]) {
            const beam = new THREE.Mesh(
                new THREE.BoxGeometry(offX * 2, pillarW * 0.6, pillarW * 0.8),
                beamMat
            );
            beam.position.set(0, meshBottom - 0.02, dz);
            mesh.add(beam);
        }
    }

    // --- Ghost preview: create/remove ---
    function createGhost(type) {
        removeGhost();
        const def = COMPONENT_DEFINITIONS[type];
        if (!def) return;

        ghostMesh = def.buildMesh(THREE);
        ghostType = type;
        const isInline = def.type === 'valve' || def.type === 'instrument';
        if (!isInline) {
            addAutoFoundation(ghostMesh, def);
        }
        liftToGround(ghostMesh);
        ghostMesh.userData.defaultGroundY = ghostMesh.position.y;
        ghostPlacementHeight = 0;
        ghostMesh.rotation.y = THREE.MathUtils.degToRad(ghostRotation);

        // Make ghost semi-transparent
        ghostMesh.traverse(child => {
            if (child.isMesh) {
                child.material = child.material.clone();
                child.material.transparent = true;
                child.material.opacity = 0.4;
                child.material.depthWrite = false;
            }
        });

        ghostMesh.visible = false;
        scene.add(ghostMesh);
        document.getElementById('viewport').classList.add('mode-place');
    }

    function removeGhost() {
        if (ghostMesh) {
            scene.remove(ghostMesh);
            ghostMesh = null;
            ghostType = null;
        }
        if (!movingComponent) {
            ghostRotation = 0;
            clearNearbyHighlights();
            hideAlignmentLines();
            document.getElementById('viewport').classList.remove('mode-place');
        }
    }

    // --- Mouse move: update ghost/move position ---
    function getGroundPoint(e) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const groundHits = raycaster.intersectObject(ground);
        if (groundHits.length > 0) {
            const p = groundHits[0].point;
            return { x: Math.round(p.x), z: Math.round(p.z) };
        }
        return null;
    }

    // Pointer tracking: detect click vs drag
    canvas.addEventListener('pointerdown', (e) => {
        pointerDownInfo = { x: e.clientX, y: e.clientY, moved: false };
    });
    canvas.addEventListener('pointermove', (e) => {
        if (pointerDownInfo && !pointerDownInfo.moved) {
            const dx = e.clientX - pointerDownInfo.x;
            const dy = e.clientY - pointerDownInfo.y;
            if (dx * dx + dy * dy > DRAG_THRESHOLD_SQ) {
                pointerDownInfo.moved = true;
            }
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        // Pipe drawing preview (only in drawing phase)
        if (pipeDrawingState && pipeDrawingState.phase === 'drawing') {
            updatePipePreview(e);
            return;
        }

        // Move mode: update the component mesh directly
        if (movingComponent) {
            const pt = getGroundPoint(e);
            if (pt) {
                movingComponent.mesh.position.x = pt.x;
                movingComponent.mesh.position.z = pt.z;
                updateComponentLabelPosition(movingComponent);
                // Fas 2: nearby port detection during move
                const nearby = detectNearbyPorts(
                    new THREE.Vector3(pt.x, movingComponent.mesh.position.y, pt.z),
                    movingComponent.rotation, movingComponent.definition, movingComponent.id
                );
                highlightNearbyPorts(nearby);
                updateAlignmentLines(pt.x, pt.z, movingComponent.id);
            }
            return;
        }

        if (!ghostMesh) return;

        const pt = getGroundPoint(e);
        if (pt) {
            const defaultY = ghostMesh.userData.defaultGroundY || ghostMesh.position.y;
            let targetY = defaultY + ghostPlacementHeight;

            // Port-height snapping: find nearby unconnected port and snap ghost to its height
            if (ghostType) {
                const def = COMPONENT_DEFINITIONS[ghostType];
                const snapResult = findPortHeightSnap(pt.x, pt.z, ghostRotation, def);
                if (snapResult) {
                    targetY = snapResult.snapY;
                }
            }

            ghostMesh.position.set(pt.x, targetY, pt.z);
            ghostMesh.visible = true;
            // Fas 2: nearby port detection during ghost placement
            if (ghostType) {
                const def = COMPONENT_DEFINITIONS[ghostType];
                const nearby = detectNearbyPorts(
                    new THREE.Vector3(pt.x, targetY, pt.z),
                    ghostRotation, def, -1
                );
                highlightNearbyPorts(nearby);
                updateAlignmentLines(pt.x, pt.z, -1);
            }
        } else {
            ghostMesh.visible = false;
            clearNearbyHighlights();
            hideAlignmentLines();
        }
    });

    // Hide ghost when mouse leaves viewport (not during move mode)
    canvas.addEventListener('mouseleave', () => {
        if (ghostMesh && !movingComponent) ghostMesh.visible = false;
    });

    // Prevent context menu during pipe drawing
    canvas.addEventListener('contextmenu', (e) => {
        if (pipeDrawingState) {
            e.preventDefault();
        }
    });

    // Right-click undo: use pointerup (fires AFTER drag), not contextmenu (fires too early on Linux)
    canvas.addEventListener('pointerup', (e) => {
        if (e.button === 2 && pipeDrawingState && pipeDrawingState.phase === 'drawing') {
            const wasDrag = pointerDownInfo && pointerDownInfo.moved;
            if (!wasDrag) {
                undoLastWaypoint();
            }
            pointerDownInfo = null;
        }
    });

    // Shift+scroll: height adjustment during pipe drawing OR component placement
    // Use CAPTURE phase to intercept before OrbitControls (which uses bubble phase)
    canvas.addEventListener('wheel', (e) => {
        if (pipeDrawingState && pipeDrawingState.phase === 'drawing' && e.shiftKey) {
            e.stopPropagation();
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.5 : 0.5;
            pipeDrawingState.currentHeight = Math.max(0, pipeDrawingState.currentHeight + delta);
            pipeDrawingStatusMsg();
        } else if (ghostMesh && e.shiftKey) {
            // Height adjustment during component placement
            e.stopPropagation();
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.5 : 0.5;
            ghostPlacementHeight = Math.max(0, ghostPlacementHeight + delta);
            const defaultY = ghostMesh.userData.defaultGroundY || 0;
            ghostMesh.position.y = defaultY + ghostPlacementHeight;
            setStatus(`Placeringshöjd: ${ghostPlacementHeight.toFixed(1)} (Shift+scroll för att justera)`);
        }
    }, { capture: true, passive: false });

    // --- Click on viewport: place, move-confirm, connect ports, or select component ---
    canvas.addEventListener('click', (e) => {
        const wasDrag = pointerDownInfo && pointerDownInfo.moved;
        pointerDownInfo = null;

        // During pipe drawing, ignore clicks that were camera drags
        if (pipeDrawingState && wasDrag) return;

        const rect = canvas.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        // Move mode: confirm placement
        if (movingComponent) {
            finishMove();
            return;
        }

        const selectedType = ComponentLibrary.getSelected();

        // --- Check for port marker clicks (highest priority when no library selection) ---
        if (!selectedType) {
            // Collect all port markers
            const portMarkers = [];
            for (const comp of placedComponents) {
                comp.mesh.traverse(child => {
                    if (child.userData.isPortMarker) portMarkers.push(child);
                });
            }
            const portHits = raycaster.intersectObjects(portMarkers, false);
            if (portHits.length > 0) {
                const marker = portHits[0].object;
                const info = marker.userData.portInfo;
                handlePortClick(info.componentId, info.portName, info.portType, marker);
                return;
            }

            // Check for pipe clicks (only if not drawing)
            if (!pipeDrawingState) {
                const pipeMeshes = pipes.map(p => p.mesh);
                if (pipeMeshes.length > 0) {
                    const pipeHits = raycaster.intersectObjects(pipeMeshes, false);
                    if (pipeHits.length > 0) {
                        const hitPipe = pipes.find(p => p.id === pipeHits[0].object.userData.pipeId);
                        if (hitPipe) {
                            // If this pipe is already selected, start branching from it
                            if (selectedPipe && selectedPipe.id === hitPipe.id) {
                                startBranchFromPipe(hitPipe, pipeHits[0].point);
                            } else {
                                deselectComponent();
                                selectPipe(hitPipe.id);
                            }
                        }
                        return;
                    }
                }
            }
        }

        // If in pipe drawing mode (drawing phase) and clicking empty space, add waypoint
        if (pipeDrawingState && pipeDrawingState.phase === 'drawing') {
            const pt = getDrawingPlanePoint(e);
            if (pt) {
                addPipeWaypoint(pt);
            }
            return;
        }

        // If in target selection phase, clicking empty space cancels
        if (pipeDrawingState && pipeDrawingState.phase === 'select-target') {
            cancelPipeDrawing();
            return;
        }

        // Check if clicking on an existing component
        const meshes = placedComponents.map(c => c.mesh);
        const hits = raycaster.intersectObjects(meshes, true);

        if (hits.length > 0 && !selectedType) {
            let hitObj = hits[0].object;
            while (hitObj.parent && !hitObj.userData.componentId) {
                hitObj = hitObj.parent;
            }
            if (hitObj.userData.componentId) {
                deselectPipe();
                selectPlacedComponent(hitObj.userData.componentId);
                return;
            }
        }

        // If a library component is selected, place it where the ghost is
        // Skip placement if this was a camera drag (rotating/panning)
        if (selectedType && ghostMesh && ghostMesh.visible && !wasDrag) {
            pushUndo();
            const x = ghostMesh.position.x;
            const z = ghostMesh.position.z;
            // Pass custom Y if ghost is elevated (port-snap or manual height)
            const defaultY = ghostMesh.userData.defaultGroundY || ghostMesh.position.y;
            const customY = (Math.abs(ghostMesh.position.y - defaultY) > 0.01) ? ghostMesh.position.y : undefined;
            placeComponent(selectedType, x, z, ghostRotation, customY);
            ghostPlacementHeight = 0; // reset manual height adjustment
            removeGhost();
        } else if (!selectedType) {
            deselectComponent();
            deselectPipe();
        }
    });

    // --- Double-click to toggle running status ---
    canvas.addEventListener('dblclick', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        const meshes = placedComponents.map(c => c.mesh);
        const hits = raycaster.intersectObjects(meshes, true);
        if (hits.length > 0) {
            let hitObj = hits[0].object;
            while (hitObj.parent && !hitObj.userData.componentId) {
                hitObj = hitObj.parent;
            }
            if (hitObj.userData.componentId) {
                const comp = placedComponents.find(c => c.id === hitObj.userData.componentId);
                if (comp) toggleComponentRunning(comp);
            }
        }
    });

    // --- Handle port click for connections (two-phase pipe drawing) ---
    // Phase 1: Click outport → select source
    // Phase 2: Click inport → select destination, enter waypoint drawing mode
    // Phase 3: Click waypoints, Enter to finish
    function handlePortClick(componentId, portName, portType, marker) {
        const comp = placedComponents.find(c => c.id === componentId);
        if (!comp) return;

        // Check if port is already connected
        if (isPortConnected(comp, portName)) {
            setStatus('Porten är redan kopplad. Ta bort befintlig koppling först.');
            return;
        }

        if (!pipeDrawingState) {
            // Phase 1: Select source outport
            if (portType !== 'liquid_out') {
                setStatus('Börja med att klicka på en utport (röd) för att starta rördragning');
                return;
            }

            marker.material.color.setHex(PORT_COLOR_SELECTED);
            marker.material.emissive.setHex(PORT_COLOR_SELECTED);
            marker.material.emissiveIntensity = 0.6;
            deselectComponent();
            deselectPipe();

            highlightCompatiblePorts(portType, componentId);

            // Create minimal state for phase 1 (target selection)
            pipeDrawingState = {
                phase: 'select-target',
                fromComp: comp,
                fromPort: portName,
                fromPortType: portType
            };
            document.getElementById('viewport').classList.add('mode-connect');
            setStatus(`Vald utport på ${comp.definition.name}. Klicka nu på en inport (blå) för att välja mål. (Esc = avbryt)`);

        } else if (pipeDrawingState.phase === 'select-target') {
            // Phase 2: Select destination inport
            if (pipeDrawingState.fromComp && pipeDrawingState.fromComp.id === componentId) {
                setStatus('Kan inte koppla en komponent till sig själv');
                return;
            }
            if (portType !== 'liquid_in') {
                setStatus('Klicka på en inport (blå) för att välja mål');
                return;
            }

            // Lock destination, transition to waypoint drawing
            marker.material.color.setHex(PORT_COLOR_SELECTED);
            marker.material.emissive.setHex(PORT_COLOR_SELECTED);
            marker.material.emissiveIntensity = 0.6;

            if (pipeDrawingState.isBranch) {
                // Branch mode: start drawing from tee point
                startBranchPipeDrawing(comp, portName);
            } else {
                startPipeDrawing(pipeDrawingState.fromComp, pipeDrawingState.fromPort, comp, portName);
            }

        } else if (pipeDrawingState.phase === 'drawing') {
            // Phase 3: During drawing, ignore port clicks (use Enter to finish)
            setStatus('Tryck Enter för att slutföra röret, eller fortsätt placera waypoints');
        }
    }

    // --- Keyboard shortcuts ---
    window.addEventListener('keydown', (e) => {
        // Undo/Redo
        if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
            e.preventDefault();
            undo();
            return;
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y' || ((e.key === 'z' || e.key === 'Z') && e.shiftKey))) {
            e.preventDefault();
            redo();
            return;
        }
        // Block 3D hotkeys when user is typing in a text/number input field
        // (Escape is still allowed so the user can cancel/blur)
        const targetTag = e.target.tagName;
        if ((targetTag === 'INPUT' || targetTag === 'TEXTAREA') && !e.ctrlKey && !e.metaKey) {
            if (e.key !== 'Escape') return;
        }
        // Space = nödstopp during simulation
        if (e.key === ' ' && simulationRunning && !emergencyStopActive) {
            e.preventDefault();
            activateEmergencyStop();
            return;
        }
        if (e.key === 'Escape') {
            if (pipeDrawingState) {
                cancelPipeDrawing();
            } else if (movingComponent) {
                cancelMove();
            } else if (ghostMesh) {
                removeGhost();
                ComponentLibrary.clearSelection();
                setStatus('Placering avbruten');
            } else if (activeSequence && !sequenceCompleted) {
                cancelSequence();
            } else if (selectedPipe) {
                deselectPipe();
                setStatus('Redo');
            } else if (selectedPlacedComponent) {
                deselectComponent();
            }
        }
        // Pipe drawing: undo last waypoint
        if (e.key === 'Backspace' && pipeDrawingState && pipeDrawingState.phase === 'drawing') {
            e.preventDefault();
            undoLastWaypoint();
            return;
        }
        // Pipe drawing: Enter to finish
        if (e.key === 'Enter' && pipeDrawingState && pipeDrawingState.phase === 'drawing') {
            e.preventDefault();
            finishPipeDrawing();
            return;
        }
        // Pipe drawing: height adjustment Q/E (±0.5), PageUp/PageDown (±2.0)
        if ((e.key === 'q' || e.key === 'Q') && pipeDrawingState && pipeDrawingState.phase === 'drawing') {
            pipeDrawingState.currentHeight = Math.max(0, pipeDrawingState.currentHeight - 0.5);
            pipeDrawingStatusMsg();
            return;
        }
        if ((e.key === 'e' || e.key === 'E') && pipeDrawingState && pipeDrawingState.phase === 'drawing') {
            pipeDrawingState.currentHeight += 0.5;
            pipeDrawingStatusMsg();
            return;
        }
        if (e.key === 'PageDown' && pipeDrawingState && pipeDrawingState.phase === 'drawing') {
            e.preventDefault();
            pipeDrawingState.currentHeight = Math.max(0, pipeDrawingState.currentHeight - 2.0);
            pipeDrawingStatusMsg();
            return;
        }
        if (e.key === 'PageUp' && pipeDrawingState && pipeDrawingState.phase === 'drawing') {
            e.preventDefault();
            pipeDrawingState.currentHeight += 2.0;
            pipeDrawingStatusMsg();
            return;
        }
        if (e.key === 'r' || e.key === 'R') {
            if (movingComponent) {
                // Rotate during move
                movingComponent.rotation = (movingComponent.rotation + 90) % 360;
                movingComponent.mesh.rotation.y = THREE.MathUtils.degToRad(movingComponent.rotation);
                setStatus(`Flytta: ${movingComponent.definition.name} — Rotation: ${movingComponent.rotation}° (Klicka = placera, Esc = avbryt)`);
            } else if (ghostMesh) {
                // Rotate ghost preview
                ghostRotation = (ghostRotation + 90) % 360;
                ghostMesh.rotation.y = THREE.MathUtils.degToRad(ghostRotation);
                setStatus(`Rotation: ${ghostRotation}° — Klicka för att placera (R = rotera, Esc = avbryt)`);
            } else if (selectedPlacedComponent) {
                // Rotate selected placed component
                pushUndo();
                const comp = selectedPlacedComponent;
                comp.rotation = (comp.rotation + 90) % 360;
                comp.mesh.rotation.y = THREE.MathUtils.degToRad(comp.rotation);
                showProperties(comp);
                setStatus(`Roterade ${comp.definition.name} till ${comp.rotation}°`);
            }
        }
        if (e.key === 'm' || e.key === 'M') {
            if (selectedPlacedComponent && !movingComponent && !ghostMesh) {
                startMove(selectedPlacedComponent);
            }
        }
        if (e.key === 'Delete') {
            if (selectedPipe) {
                pushUndo();
                const pipe = selectedPipe;
                removePipe(pipe.id);
                setStatus('Rör borttaget');
            } else if (selectedPlacedComponent && !movingComponent) {
                document.getElementById('btn-delete').click();
            }
        }
    });

    // --- Port markers ---
    function addPortMarkers(comp) {
        const def = comp.definition;
        for (const [portName, port] of Object.entries(def.ports)) {
            const color = port.type === 'liquid_in' ? PORT_COLOR_IN : PORT_COLOR_OUT;
            const geo = new THREE.SphereGeometry(0.12, 12, 12);
            const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.3 });
            const marker = new THREE.Mesh(geo, mat);

            // Position marker at port's local position, adjusted for liftToGround offset
            marker.position.set(port.position[0], port.position[1], port.position[2]);
            marker.userData.isPortMarker = true;
            marker.userData.portInfo = { componentId: comp.id, portName, portType: port.type };

            comp.mesh.add(marker);
        }
    }

    function getPortMarker(comp, portName) {
        let found = null;
        comp.mesh.traverse(child => {
            if (child.userData.isPortMarker && child.userData.portInfo.portName === portName) {
                found = child;
            }
        });
        return found;
    }

    function updatePortMarkerColor(comp, portName) {
        const marker = getPortMarker(comp, portName);
        if (!marker) return;
        const isConnected = comp.connections.some(c => c.portName === portName);
        const port = comp.definition.ports[portName];
        const color = isConnected ? PORT_COLOR_CONNECTED : (port.type === 'liquid_in' ? PORT_COLOR_IN : PORT_COLOR_OUT);
        marker.material.color.setHex(color);
        marker.material.emissive.setHex(color);
    }

    function isPortConnected(comp, portName) {
        return comp.connections.some(c => c.portName === portName);
    }

    // --- Fas 2: Alignment lines ---
    const alignLineMat = new THREE.LineDashedMaterial({ color: ALIGN_LINE_COLOR, dashSize: 0.3, gapSize: 0.15, transparent: true, opacity: 0.6 });
    function makeAlignLine() {
        const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-10, 0.05, 0), new THREE.Vector3(10, 0.05, 0)]);
        const line = new THREE.Line(geo, alignLineMat.clone());
        line.computeLineDistances();
        line.visible = false;
        scene.add(line);
        return line;
    }
    const alignLineX = makeAlignLine(); // shows when Z matches (horizontal line along X)
    const alignLineZ = (() => {
        const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0.05, -10), new THREE.Vector3(0, 0.05, 10)]);
        const line = new THREE.Line(geo, alignLineMat.clone());
        line.computeLineDistances();
        line.visible = false;
        scene.add(line);
        return line;
    })();

    function updateAlignmentLines(posX, posZ, excludeId) {
        let matchX = false, matchZ = false;
        for (const comp of placedComponents) {
            if (comp.id === excludeId) continue;
            if (Math.abs(comp.mesh.position.z - posZ) < 0.01) {
                matchX = true;
                alignLineX.position.z = posZ;
            }
            if (Math.abs(comp.mesh.position.x - posX) < 0.01) {
                matchZ = true;
                alignLineZ.position.x = posX;
            }
        }
        alignLineX.visible = matchX;
        alignLineZ.visible = matchZ;
    }

    function hideAlignmentLines() {
        alignLineX.visible = false;
        alignLineZ.visible = false;
    }

    // --- Fas 2: Highlight compatible/incompatible ports ---
    function highlightCompatiblePorts(selectedPortType, excludeCompId) {
        for (const comp of placedComponents) {
            if (comp.id === excludeCompId) continue;
            for (const [portName, port] of Object.entries(comp.definition.ports)) {
                const marker = getPortMarker(comp, portName);
                if (!marker) continue;
                const connected = isPortConnected(comp, portName);
                const compatible = !connected &&
                    ((selectedPortType === 'liquid_out' && port.type === 'liquid_in') ||
                     (selectedPortType === 'liquid_in' && port.type === 'liquid_out'));
                if (compatible) {
                    marker.material.color.setHex(PORT_COLOR_COMPATIBLE);
                    marker.material.emissive.setHex(PORT_COLOR_COMPATIBLE);
                    marker.material.emissiveIntensity = 0.5;
                } else {
                    marker.material.color.setHex(PORT_COLOR_INCOMPATIBLE);
                    marker.material.emissive.setHex(PORT_COLOR_INCOMPATIBLE);
                    marker.material.emissiveIntensity = 0.15;
                }
            }
        }
    }

    function resetPortHighlights() {
        for (const comp of placedComponents) {
            for (const portName of Object.keys(comp.definition.ports)) {
                updatePortMarkerColor(comp, portName);
            }
        }
    }

    // --- Fas 2: Detect nearby compatible ports ---
    function getPortWorldPositionFromDef(def, portName, compPos, rotationDeg) {
        const port = def.ports[portName];
        const v = new THREE.Vector3(port.position[0], port.position[1], port.position[2]);
        const rotY = THREE.MathUtils.degToRad(rotationDeg || 0);
        v.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
        v.add(compPos);
        return v;
    }

    // --- Port-height snapping for elevated placement ---
    const PORT_SNAP_XZ_DISTANCE = 1.8; // how close in XZ to trigger height snap
    function findPortHeightSnap(gridX, gridZ, rotationDeg, ghostDef) {
        const defaultY = ghostMesh ? (ghostMesh.userData.defaultGroundY || 0) : 0;
        let bestSnap = null;
        let bestDist = PORT_SNAP_XZ_DISTANCE;

        for (const comp of placedComponents) {
            for (const [otherPortName, otherPort] of Object.entries(comp.definition.ports)) {
                if (isPortConnected(comp, otherPortName)) continue;
                const otherWorldPos = getPortWorldPosition(comp, otherPortName);
                // Only snap to ports that are elevated above default ground placement
                if (otherWorldPos.y < defaultY + 0.5) continue;

                // Check each ghost port for compatibility
                for (const [ghostPortName, ghostPort] of Object.entries(ghostDef.ports)) {
                    const compatible = (ghostPort.type === 'liquid_out' && otherPort.type === 'liquid_in') ||
                                       (ghostPort.type === 'liquid_in' && otherPort.type === 'liquid_out');
                    if (!compatible) continue;

                    // Calculate where ghost port would be relative to ghost origin
                    const ghostPortLocal = new THREE.Vector3(ghostPort.position[0], ghostPort.position[1], ghostPort.position[2]);
                    const rotY = THREE.MathUtils.degToRad(rotationDeg || 0);
                    ghostPortLocal.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);

                    // XZ distance between ghost port world pos and target port
                    const ghostPortWorldX = gridX + ghostPortLocal.x;
                    const ghostPortWorldZ = gridZ + ghostPortLocal.z;
                    const dxz = Math.sqrt(
                        (ghostPortWorldX - otherWorldPos.x) ** 2 +
                        (ghostPortWorldZ - otherWorldPos.z) ** 2
                    );

                    if (dxz < bestDist) {
                        // Calculate what Y the ghost needs to be so this port aligns
                        const snapY = otherWorldPos.y - ghostPortLocal.y;
                        bestDist = dxz;
                        bestSnap = { snapY, targetComp: comp.id, targetPort: otherPortName, ghostPort: ghostPortName };
                    }
                }
            }
        }
        return bestSnap;
    }

    function detectNearbyPorts(position, rotationDeg, def, excludeId) {
        const results = [];
        for (const [thisPortName, thisPort] of Object.entries(def.ports)) {
            const thisWorldPos = getPortWorldPositionFromDef(def, thisPortName, position, rotationDeg);
            for (const comp of placedComponents) {
                if (comp.id === excludeId) continue;
                for (const [otherPortName, otherPort] of Object.entries(comp.definition.ports)) {
                    if (isPortConnected(comp, otherPortName)) continue;
                    // Check type compatibility
                    const compatible = (thisPort.type === 'liquid_out' && otherPort.type === 'liquid_in') ||
                                       (thisPort.type === 'liquid_in' && otherPort.type === 'liquid_out');
                    if (!compatible) continue;
                    const otherWorldPos = getPortWorldPosition(comp, otherPortName);
                    const dist = thisWorldPos.distanceTo(otherWorldPos);
                    if (dist < NEARBY_PORT_DISTANCE) {
                        results.push({ thisPort: thisPortName, otherCompId: comp.id, otherPort: otherPortName, distance: dist });
                    }
                }
            }
        }
        return results;
    }

    function highlightNearbyPorts(nearbyPairs) {
        clearNearbyHighlights();
        for (const pair of nearbyPairs) {
            const comp = placedComponents.find(c => c.id === pair.otherCompId);
            if (!comp) continue;
            const marker = getPortMarker(comp, pair.otherPort);
            if (!marker) continue;
            marker.material.color.setHex(0xffffff);
            marker.material.emissive.setHex(PORT_COLOR_COMPATIBLE);
            marker.material.emissiveIntensity = 0.8;
            nearbyHighlightedMarkers.push({ comp, portName: pair.otherPort });
        }
    }

    function clearNearbyHighlights() {
        for (const { comp, portName } of nearbyHighlightedMarkers) {
            updatePortMarkerColor(comp, portName);
        }
        nearbyHighlightedMarkers = [];
    }

    // --- Port world position/direction ---
    function getPortWorldPosition(comp, portName) {
        const marker = getPortMarker(comp, portName);
        if (!marker) return new THREE.Vector3();
        const worldPos = new THREE.Vector3();
        marker.getWorldPosition(worldPos);
        return worldPos;
    }

    function getPortWorldDirection(comp, portName) {
        const port = comp.definition.ports[portName];
        const dir = new THREE.Vector3(port.direction[0], port.direction[1], port.direction[2]);
        // Apply component rotation
        const rotY = comp.mesh.rotation.y;
        dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
        return dir.normalize();
    }

    // --- Pipe routing helpers ---
    const STUB_LEN = 0.8;
    const ELBOW_RADIUS = 0.8;
    const PIPE_RADIUS = 0.06;

    // Remove consecutive near-duplicate points
    function removeDuplicates(points, eps) {
        if (points.length === 0) return points;
        const out = [points[0]];
        for (let i = 1; i < points.length; i++) {
            if (points[i].distanceTo(out[out.length - 1]) > eps) {
                out.push(points[i]);
            }
        }
        return out;
    }

    // Insert guide points at start/end to force clean straight runs from ports
    // before any turns. If the first waypoint is not aligned with the port
    // direction, insert a point that extends the stub line first.
    function insertPortGuides(stubEnd, portDir, waypoints, atStart) {
        if (waypoints.length === 0) return waypoints;

        const target = atStart ? waypoints[0] : waypoints[waypoints.length - 1];
        const diff = target.clone().sub(stubEnd);
        const dist = diff.length();
        if (dist < 0.05) return waypoints; // too close, skip

        const toTarget = diff.normalize();
        const angle = toTarget.angleTo(portDir);

        if (angle > 0.35) { // > ~20 degrees — not aligned, insert guide
            // Project target onto port direction axis
            const projection = target.clone().sub(stubEnd).dot(portDir);
            const runDist = Math.max(0.4, projection);
            const guide = stubEnd.clone().add(portDir.clone().multiplyScalar(runDist));

            if (atStart) {
                return [guide, ...waypoints];
            } else {
                return [...waypoints, guide];
            }
        }
        return waypoints;
    }

    // Build a proper circular fillet arc at a corner point.
    // Uses correct tangent-point + arc-center geometry so the arc
    // smoothly joins the incoming and outgoing straight segments.
    function buildElbowArc(corner, dirIn, dirOut, radius, segments) {
        segments = segments || 12;
        const theta = dirIn.angleTo(dirOut); // turn angle
        if (theta < 0.1) return [corner.clone()]; // nearly straight

        const halfAngle = theta / 2;
        const tanLen = radius / Math.tan(halfAngle); // distance from corner to tangent points

        // Tangent points on incoming and outgoing lines
        const P1 = corner.clone().sub(dirIn.clone().multiplyScalar(tanLen));
        const P2 = corner.clone().add(dirOut.clone().multiplyScalar(tanLen));

        // Arc center lies along the bisector of the turn
        const bisect = new THREE.Vector3().addVectors(
            dirIn.clone().negate(), dirOut
        ).normalize();
        if (bisect.lengthSq() < 0.0001) return [corner.clone()]; // degenerate

        const centerDist = radius / Math.sin(halfAngle);
        const arcCenter = corner.clone().add(bisect.clone().multiplyScalar(centerDist));

        // Rotation axis (perpendicular to turn plane)
        const axis = new THREE.Vector3().crossVectors(dirIn, dirOut).normalize();
        if (axis.lengthSq() < 0.0001) return [corner.clone()];

        // Sweep from P1 to P2 around arcCenter
        const startVec = P1.clone().sub(arcCenter);
        const points = [];
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const pt = startVec.clone().applyAxisAngle(axis, theta * t).add(arcCenter);
            points.push(pt);
        }
        return points;
    }

    // Replace sharp corners with smooth fillet arcs
    function insertElbows(points, radius) {
        if (points.length < 3) return points;
        const out = [points[0]];
        for (let i = 1; i < points.length - 1; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const next = points[i + 1];
            const dirIn = curr.clone().sub(prev).normalize();
            const dirOut = next.clone().sub(curr).normalize();
            const theta = dirIn.angleTo(dirOut);

            if (theta > 0.17) { // > ~10 degrees — a bend
                const distIn = curr.distanceTo(prev);
                const distOut = curr.distanceTo(next);
                const halfAngle = theta / 2;
                // Clamp: tangent length must not exceed 45% of shortest adjacent segment
                const maxTanLen = Math.min(distIn, distOut) * 0.45;
                const r = Math.min(radius, maxTanLen * Math.tan(halfAngle));
                const arcPoints = buildElbowArc(curr, dirIn, dirOut, r, 12);
                out.push(...arcPoints);
            } else {
                out.push(curr);
            }
        }
        out.push(points[points.length - 1]);
        return out;
    }

    // --- Create pipe mesh from waypoints (manual routing) ---
    // Can accept explicit start/end positions and directions for branch pipes
    function createPipeMeshFromWaypoints(fromComp, fromPort, toComp, toPort, waypoints, pipeColor, overrideStart) {
        const startPos = overrideStart ? overrideStart.pos.clone() : getPortWorldPosition(fromComp, fromPort);
        const endPos = getPortWorldPosition(toComp, toPort);
        const startDir = overrideStart ? overrideStart.dir.clone() : getPortWorldDirection(fromComp, fromPort);
        const endDir = getPortWorldDirection(toComp, toPort);

        const EPS = 0.01;

        // Start and end stubs (straight run from port in port direction)
        const stubStart = startPos.clone().add(startDir.clone().multiplyScalar(STUB_LEN));
        const stubEnd = endPos.clone().add(endDir.clone().multiplyScalar(STUB_LEN));

        // Process waypoints: insert guide points for clean port transitions
        let wp = waypoints.map(w => w.clone());
        wp = insertPortGuides(stubStart, startDir, wp, true);
        wp = insertPortGuides(stubEnd, endDir, wp, false);

        // Build full path: port → stub → guided waypoints → stub → port
        const rawPoints = [
            startPos.clone(),
            stubStart,
            ...wp,
            stubEnd,
            endPos.clone()
        ];

        // Clean up, insert elbows, clean again
        const cleaned = removeDuplicates(rawPoints, EPS);
        const elbowed = insertElbows(cleaned, ELBOW_RADIUS);
        const final = removeDuplicates(elbowed, EPS * 0.5);

        // Need at least 2 points for a curve
        if (final.length < 2) {
            final.length = 0;
            final.push(startPos.clone(), endPos.clone());
        }

        // High tension keeps the curve tight to control points;
        // the arc points already provide the smooth bending geometry.
        const curve = new THREE.CatmullRomCurve3(final, false, 'centripetal', 0.8);
        const segments = Math.max(64, final.length * 12);
        const tubeGeo = new THREE.TubeGeometry(curve, segments, PIPE_RADIUS, 8, false);
        const tubeMat = new THREE.MeshStandardMaterial({
            color: pipeColor || PIPE_COLOR,
            metalness: 0.4,
            roughness: 0.5
        });
        const mesh = new THREE.Mesh(tubeGeo, tubeMat);
        mesh.userData.curve = curve;
        return mesh;
    }

    function createPipe(fromComp, fromPort, toComp, toPort, waypoints, mediaKey) {
        // Default to empty waypoints (straight line with stubs)
        const wp = waypoints || [];
        const media = mediaKey || 'unknown';
        const mediaDef = MEDIA_DEFINITIONS[media] || MEDIA_DEFINITIONS.unknown;
        const pipeColor = media !== 'unknown' ? mediaDef.color : PIPE_COLOR;
        const mesh = createPipeMeshFromWaypoints(fromComp, fromPort, toComp, toPort, wp, pipeColor);
        const pipe = {
            id: pipeNextId++,
            from: { componentId: fromComp.id, portName: fromPort },
            to: { componentId: toComp.id, portName: toPort },
            waypoints: wp.map(w => w.clone()),
            media: media,
            mesh,
            curve: mesh.userData.curve,
            particles: [],
            label: null,
            compat: { ok: true, level: 'ok', reason: '' },
            computedFlow: 0,
            computedTemp: 25,
            computedPressure: 0
        };
        mesh.userData.pipeId = pipe.id;
        scene.add(mesh);
        pipes.push(pipe);

        // Create media label on pipe
        if (media !== 'unknown') {
            createPipeLabel(pipe);
        }

        // Record connections on both components
        fromComp.connections.push({ portName: fromPort, pipeId: pipe.id });
        toComp.connections.push({ portName: toPort, pipeId: pipe.id });

        // Update port marker colors to green
        updatePortMarkerColor(fromComp, fromPort);
        updatePortMarkerColor(toComp, toPort);

        // Create flow particles (visible only during simulation)
        createFlowParticles(pipe);

        // Compatibility check (runs after components are registered)
        if (media !== 'unknown') {
            applyPipeCompatColor(pipe);
        }

        invalidateSimGraph();
        return pipe;
    }

    // --- Pipe media label (3D sprite) ---
    function createPipeLabel(pipe) {
        const mediaDef = MEDIA_DEFINITIONS[pipe.media] || MEDIA_DEFINITIONS.unknown;
        const canvas2d = document.createElement('canvas');
        const ctx = canvas2d.getContext('2d');
        canvas2d.width = 256;
        canvas2d.height = 64;

        // Draw background (rounded rect)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.beginPath();
        const rx = 2, ry = 2, rw = 252, rh = 60, rr = 8;
        ctx.moveTo(rx + rr, ry);
        ctx.lineTo(rx + rw - rr, ry);
        ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + rr);
        ctx.lineTo(rx + rw, ry + rh - rr);
        ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - rr, ry + rh);
        ctx.lineTo(rx + rr, ry + rh);
        ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - rr);
        ctx.lineTo(rx, ry + rr);
        ctx.quadraticCurveTo(rx, ry, rx + rr, ry);
        ctx.closePath();
        ctx.fill();

        // Draw colored bar
        const color = '#' + mediaDef.color.toString(16).padStart(6, '0');
        ctx.fillStyle = color;
        ctx.fillRect(6, 6, 6, 52);

        // Draw text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(mediaDef.shortName, 20, 28);

        // Draw phase icon
        const phaseInfo = PHASE_INFO[mediaDef.phase] || PHASE_INFO.unknown;
        ctx.font = '18px sans-serif';
        ctx.fillStyle = '#aaaacc';
        ctx.fillText(phaseInfo.label, 20, 50);

        // Hazard indicator
        if (mediaDef.hazard && mediaDef.hazard !== 'none') {
            const hazInfo = HAZARD_INFO[mediaDef.hazard];
            ctx.fillStyle = hazInfo.color;
            ctx.font = '22px sans-serif';
            ctx.fillText(hazInfo.icon, 220, 30);
        }

        const texture = new THREE.CanvasTexture(canvas2d);
        texture.needsUpdate = true;
        const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(1.5, 0.375, 1);

        // Position at midpoint of pipe curve
        if (pipe.curve) {
            const midPoint = pipe.curve.getPoint(0.5);
            sprite.position.copy(midPoint);
            sprite.position.y += 0.3;
        }

        sprite.userData.isPipeLabel = true;
        scene.add(sprite);
        pipe.label = sprite;
    }

    function removePipeLabel(pipe) {
        if (pipe.label) {
            scene.remove(pipe.label);
            if (pipe.label.material) {
                if (pipe.label.material.map) pipe.label.material.map.dispose();
                pipe.label.material.dispose();
            }
            pipe.label = null;
        }
    }

    // --- Component tag number label (3D sprite) ---
    function createComponentLabel(comp) {
        removeComponentLabel(comp);
        const tag = (comp.tagNumber || '').trim();
        if (!tag) return;

        const canvas2d = document.createElement('canvas');
        canvas2d.width = 256;
        canvas2d.height = 64;
        const ctx = canvas2d.getContext('2d');

        // Rounded background
        ctx.fillStyle = 'rgba(0, 15, 45, 0.80)';
        ctx.beginPath();
        const rr = 10, rw = 252, rh = 60, rx = 2, ry = 2;
        ctx.moveTo(rx + rr, ry);
        ctx.lineTo(rx + rw - rr, ry);
        ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + rr);
        ctx.lineTo(rx + rw, ry + rh - rr);
        ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - rr, ry + rh);
        ctx.lineTo(rx + rr, ry + rh);
        ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - rr);
        ctx.lineTo(rx, ry + rr);
        ctx.quadraticCurveTo(rx, ry, rx + rr, ry);
        ctx.closePath();
        ctx.fill();

        // Border
        ctx.strokeStyle = 'rgba(100, 180, 255, 0.75)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Tag number text
        ctx.fillStyle = '#d8eeff';
        ctx.font = 'bold 30px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(tag, 128, 33);

        const texture = new THREE.CanvasTexture(canvas2d);
        texture.needsUpdate = true;
        const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(2.0, 0.5, 1);
        sprite.userData.isComponentLabel = true;

        updateComponentLabelSpritePosition(comp, sprite);
        scene.add(sprite);
        comp.tagSprite = sprite;
    }

    function removeComponentLabel(comp) {
        if (!comp.tagSprite) return;
        scene.remove(comp.tagSprite);
        if (comp.tagSprite.material) {
            if (comp.tagSprite.material.map) comp.tagSprite.material.map.dispose();
            comp.tagSprite.material.dispose();
        }
        comp.tagSprite = null;
    }

    function updateComponentLabelSpritePosition(comp, sprite) {
        const bbox = new THREE.Box3().setFromObject(comp.mesh);
        sprite.position.set(comp.mesh.position.x, bbox.max.y + 0.6, comp.mesh.position.z);
    }

    function updateComponentLabelPosition(comp) {
        if (!comp.tagSprite) return;
        updateComponentLabelSpritePosition(comp, comp.tagSprite);
    }

    // --- Resolve default media from port definitions ---
    // Returns a mediaKey string if either port has defaultMedia, otherwise null.
    function resolvePortDefaultMedia(fromComp, fromPort, toComp, toPort) {
        const fromDef = fromComp && fromPort ? fromComp.definition.ports[fromPort] : null;
        const toDef   = toComp   && toPort   ? toComp.definition.ports[toPort]     : null;
        return (fromDef && fromDef.defaultMedia) || (toDef && toDef.defaultMedia) || null;
    }

    // --- Media selection modal ---
    function showMediaModal() {
        return new Promise((resolve) => {
            const modal = document.getElementById('media-modal');
            const listEl = document.getElementById('media-card-list');
            const searchInput = document.getElementById('media-search');
            modal.style.display = 'flex';
            searchInput.value = '';
            searchInput.focus();

            function renderMediaList(filter) {
                listEl.innerHTML = '';
                const cats = getMediaByCategory();
                const filterLower = (filter || '').toLowerCase();

                for (const [cat, items] of Object.entries(cats)) {
                    const filtered = filterLower
                        ? items.filter(m => `${m.name} ${m.shortName} ${m.description}`.toLowerCase().includes(filterLower))
                        : items;
                    if (filtered.length === 0) continue;

                    const header = document.createElement('div');
                    header.className = 'category-header';
                    header.textContent = cat;
                    listEl.appendChild(header);

                    for (const item of filtered) {
                        const color = '#' + item.color.toString(16).padStart(6, '0');
                        const hazInfo = HAZARD_INFO[item.hazard] || HAZARD_INFO.none;
                        const phaseInfo = PHASE_INFO[item.phase] || PHASE_INFO.unknown;
                        const card = document.createElement('div');
                        card.className = 'media-card';
                        card.innerHTML = `
                            <div class="media-card-color" style="background:${color}"></div>
                            <div class="media-card-body">
                                <div class="media-card-name">${item.name} ${hazInfo.icon}</div>
                                <div class="media-card-meta">${phaseInfo.icon} ${phaseInfo.label}</div>
                            </div>
                        `;
                        card.addEventListener('click', () => {
                            cleanup();
                            resolve(item.key);
                        });
                        listEl.appendChild(card);
                    }
                }
            }

            renderMediaList('');

            function onSearch(e) { renderMediaList(e.target.value); }
            searchInput.addEventListener('input', onSearch);

            function onClose() { cleanup(); resolve('unknown'); }
            const closeBtn = document.getElementById('btn-close-media-modal');
            closeBtn.addEventListener('click', onClose);

            function onKey(e) {
                if (e.key === 'Escape') { cleanup(); resolve('unknown'); }
            }
            document.addEventListener('keydown', onKey);

            function cleanup() {
                modal.style.display = 'none';
                searchInput.removeEventListener('input', onSearch);
                closeBtn.removeEventListener('click', onClose);
                document.removeEventListener('keydown', onKey);
            }
        });
    }

    // Update pipe media (change color, label, etc.)
    function updatePipeMedia(pipe, newMediaKey) {
        pipe.media = newMediaKey;
        const mediaDef = MEDIA_DEFINITIONS[newMediaKey] || MEDIA_DEFINITIONS.unknown;
        const color = newMediaKey !== 'unknown' ? mediaDef.color : PIPE_COLOR;
        pipe.mesh.material.color.setHex(color);
        pipe.mesh.material.emissive.setHex(0x000000);
        pipe.mesh.material.emissiveIntensity = 0;

        // Update label
        removePipeLabel(pipe);
        if (newMediaKey !== 'unknown') {
            createPipeLabel(pipe);
        }

        // Compatibility check
        applyPipeCompatColor(pipe);
    }

    // =========================================================
    // MEDIAKOMPABILITETSKONTROLL
    // =========================================================

    /**
     * Kontrollerar om pipe-mediat är kompatibelt med de anslutna portarna.
     * Returnerar { ok, level: 'ok'|'warning'|'error', reason }
     */
    function checkPipeCompatibility(pipe) {
        const media = pipe.media;
        if (!media || media === 'unknown') return { ok: true, level: 'ok', reason: '' };

        const mediaDef = MEDIA_DEFINITIONS[media];
        if (!mediaDef) return { ok: true, level: 'ok', reason: '' };

        const fromComp = placedComponents.find(c => c.id === pipe.from.componentId);
        const toComp   = placedComponents.find(c => c.id === pipe.to.componentId);

        const issues = [];

        for (const [comp, portName] of [[fromComp, pipe.from.portName], [toComp, pipe.to.portName]]) {
            if (!comp) continue;
            const portDef = comp.definition.ports[portName];
            if (!portDef) continue;

            if (portDef.defaultMedia) {
                if (portDef.defaultMedia === media) continue; // perfekt matchning

                const expectedDef = MEDIA_DEFINITIONS[portDef.defaultMedia];
                if (!expectedDef) continue;

                // Samma kategori och fas → varning (t.ex. HP-ånga istället för LP-ånga)
                if (expectedDef.category === mediaDef.category && expectedDef.phase === mediaDef.phase) {
                    issues.push({ level: 'warning', text: `"${portName}" förväntar ${expectedDef.name}` });
                } else {
                    // Annan kategori → fel
                    issues.push({ level: 'error', text: `"${portName}" förväntar ${expectedDef.name} — fick ${mediaDef.name}` });
                }
            } else {
                // Inget defaultMedia: portnamns-baserad kontroll
                const pn = portName.toLowerCase();
                const isGasPort    = /fuel_in|flue_gas|steam_in|steam_out|gas_in|syngas|regen_in|regen_out/.test(pn);
                const isWaterPort  = /cooling|bfw|brine|water_in/.test(pn);
                const isAminePort  = /solvent_in|rich_out/.test(pn);
                const isCausticPort = /caustic_in|spent_out/.test(pn);

                if (isGasPort && mediaDef.phase === 'liquid') {
                    issues.push({ level: 'warning', text: `"${portName}" förväntar gas — ${mediaDef.name} är vätska` });
                } else if (isWaterPort && mediaDef.category !== 'Vatten' && mediaDef.category !== 'Utilities') {
                    issues.push({ level: 'warning', text: `"${portName}" förväntar vatten/utility — fick ${mediaDef.name}` });
                } else if (isAminePort && !media.startsWith('amine_')) {
                    issues.push({ level: 'warning', text: `"${portName}" förväntar amin — fick ${mediaDef.name}` });
                } else if (isCausticPort && media !== 'caustic') {
                    issues.push({ level: 'warning', text: `"${portName}" förväntar natronlut — fick ${mediaDef.name}` });
                }
            }
        }

        if (issues.length === 0) return { ok: true, level: 'ok', reason: '' };
        const worstLevel = issues.some(r => r.level === 'error') ? 'error' : 'warning';
        return { ok: false, level: worstLevel, reason: issues.map(r => r.text).join(' | ') };
    }

    /**
     * Tillämpar rätt färg på pipens mesh baserat på kompatibilitetsstatus.
     * Returnerar kompatibilitetsresultatet.
     */
    function applyPipeCompatColor(pipe) {
        const compat = checkPipeCompatibility(pipe);
        pipe.compat = compat;

        if (!compat.ok) {
            const color = compat.level === 'error' ? PIPE_COLOR_INCOMPAT : PIPE_COLOR_WARNING;
            pipe.mesh.material.color.setHex(color);
            pipe.mesh.material.emissive.setHex(compat.level === 'error' ? 0x440000 : 0x331500);
            pipe.mesh.material.emissiveIntensity = 0.25;
        }
        // If ok: color was already set correctly by updatePipeMedia/createPipe caller
        return compat;
    }

    // --- Pipe branching (Tee) ---
    function startBranchFromPipe(parentPipe, hitPoint) {
        if (!parentPipe.curve) return;

        // Find closest point on curve (parameter t ∈ [0,1])
        const steps = 100;
        let bestT = 0.5, bestDist = Infinity;
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const pt = parentPipe.curve.getPoint(t);
            const d = pt.distanceTo(hitPoint);
            if (d < bestDist) { bestDist = d; bestT = t; }
        }

        const teePoint = parentPipe.curve.getPoint(bestT);
        // Get tangent at tee point — perpendicular directions for branching
        const tangent = parentPipe.curve.getTangent(bestT).normalize();

        // Create a tee marker (small ring)
        const teeMarkerGeo = new THREE.TorusGeometry(PIPE_RADIUS * 2.5, PIPE_RADIUS * 0.8, 8, 16);
        const teeMarkerMat = new THREE.MeshStandardMaterial({ color: 0x4fc3f7, emissive: 0x4fc3f7, emissiveIntensity: 0.3 });
        const teeMarker = new THREE.Mesh(teeMarkerGeo, teeMarkerMat);
        teeMarker.position.copy(teePoint);
        // Orient ring perpendicular to tangent
        const up = new THREE.Vector3(0, 1, 0);
        const axis = new THREE.Vector3().crossVectors(up, tangent).normalize();
        if (axis.length() > 0.01) {
            const angle = up.angleTo(tangent);
            teeMarker.setRotationFromAxisAngle(axis, angle);
        }
        scene.add(teeMarker);

        deselectPipe();

        // Choose a default branch direction: perpendicular to tangent and up
        // Prefer Y-up perpendicular for horizontal pipes, or horizontal perpendicular for vertical pipes
        let branchDir;
        if (Math.abs(tangent.y) > 0.8) {
            // Mostly vertical pipe — branch horizontally
            branchDir = new THREE.Vector3(1, 0, 0);
            if (Math.abs(tangent.x) > 0.5) branchDir.set(0, 0, 1);
        } else {
            // Mostly horizontal — branch upward
            branchDir = new THREE.Vector3(0, 1, 0);
        }

        // Enter target selection phase with branch info
        highlightAllInports();
        pipeDrawingState = {
            phase: 'select-target',
            fromComp: null,
            fromPort: null,
            fromPortType: 'liquid_out',
            isBranch: true,
            branchFromPipeId: parentPipe.id,
            branchTeePoint: teePoint.clone(),
            branchTeeParam: bestT,
            branchDir: branchDir,
            teeMarker: teeMarker
        };
        document.getElementById('viewport').classList.add('mode-connect');
        setStatus(`Förgrening från rörledning. Klicka på en inport (blå) för att välja mål. (Esc = avbryt)`);
    }

    function highlightAllInports() {
        for (const comp of placedComponents) {
            comp.mesh.traverse(child => {
                if (child.userData.isPortMarker) {
                    const info = child.userData.portInfo;
                    if (info.portType === 'liquid_in' && !isPortConnected(comp, info.portName)) {
                        child.material.color.setHex(0x4fc3f7);
                        child.material.emissive.setHex(0x4fc3f7);
                        child.material.emissiveIntensity = 0.4;
                    }
                }
            });
        }
    }

    function createBranchPipe(parentPipeId, teePoint, teeParam, toComp, toPort, waypoints, mediaKey) {
        const wp = waypoints || [];
        const media = mediaKey || 'unknown';
        const mediaDef = MEDIA_DEFINITIONS[media] || MEDIA_DEFINITIONS.unknown;
        const pipeColor = media !== 'unknown' ? mediaDef.color : PIPE_COLOR;

        // Determine branch start direction
        const parentPipe = pipes.find(p => p.id === parentPipeId);
        let branchDir = new THREE.Vector3(0, 1, 0);
        if (parentPipe && parentPipe.curve) {
            const tangent = parentPipe.curve.getTangent(teeParam).normalize();
            // Default branch direction: perpendicular to tangent
            if (Math.abs(tangent.y) > 0.8) {
                branchDir.set(1, 0, 0);
            } else {
                branchDir.set(0, 1, 0);
            }
        }

        const overrideStart = { pos: teePoint.clone(), dir: branchDir };
        const mesh = createPipeMeshFromWaypoints(null, null, toComp, toPort, wp, pipeColor, overrideStart);
        const pipe = {
            id: pipeNextId++,
            from: { componentId: '__branch', portName: 'tee' },
            to: { componentId: toComp.id, portName: toPort },
            waypoints: wp.map(w => w.clone()),
            media: media,
            branchFrom: {
                pipeId: parentPipeId,
                teePoint: { x: teePoint.x, y: teePoint.y, z: teePoint.z },
                teeParam: teeParam
            },
            mesh,
            curve: mesh.userData.curve,
            particles: [],
            label: null,
            teeMarker: null,
            compat: { ok: true, level: 'ok', reason: '' },
            computedFlow: 0,
            computedTemp: 25,
            computedPressure: 0
        };
        mesh.userData.pipeId = pipe.id;
        scene.add(mesh);
        pipes.push(pipe);

        // Create tee marker at branch point
        const teeGeo = new THREE.TorusGeometry(PIPE_RADIUS * 2.5, PIPE_RADIUS * 0.8, 8, 16);
        const teeMat = new THREE.MeshStandardMaterial({
            color: pipeColor, metalness: 0.4, roughness: 0.5
        });
        const teeMarkerMesh = new THREE.Mesh(teeGeo, teeMat);
        teeMarkerMesh.position.copy(teePoint);
        // Orient perpendicular to parent pipe
        if (parentPipe && parentPipe.curve) {
            const tangent = parentPipe.curve.getTangent(teeParam);
            const up = new THREE.Vector3(0, 1, 0);
            const axis = new THREE.Vector3().crossVectors(up, tangent).normalize();
            if (axis.lengthSq() > 0.0001) {
                teeMarkerMesh.setRotationFromAxisAngle(axis, up.angleTo(tangent));
            }
        }
        scene.add(teeMarkerMesh);
        pipe.teeMarker = teeMarkerMesh;

        // Media label
        if (media !== 'unknown') {
            createPipeLabel(pipe);
        }

        // Record connection on destination
        toComp.connections.push({ portName: toPort, pipeId: pipe.id });
        updatePortMarkerColor(toComp, toPort);

        createFlowParticles(pipe);

        // Compatibility check
        if (media !== 'unknown') {
            applyPipeCompatColor(pipe);
        }

        invalidateSimGraph();
        return pipe;
    }

    // --- Flow particle functions ---
    function createFlowParticles(pipe) {
        const geo = new THREE.SphereGeometry(0.09, 8, 8);
        // Each pipe gets its own material so temperature colors are independent
        const mat = new THREE.MeshStandardMaterial({
            color: FLOW_PARTICLE_COLOR,
            emissive: FLOW_PARTICLE_COLOR,
            emissiveIntensity: 0.8
        });

        for (let i = 0; i < FLOW_PARTICLE_COUNT; i++) {
            const sphere = new THREE.Mesh(geo, mat);
            const t = i / FLOW_PARTICLE_COUNT;
            const pos = pipe.curve.getPointAt(t);
            sphere.position.copy(pos);
            sphere.visible = simulationRunning;
            sphere.userData.flowT = t;
            scene.add(sphere);
            pipe.particles.push(sphere);
        }
    }

    function removeFlowParticles(pipe) {
        for (const p of pipe.particles) {
            scene.remove(p);
            if (p.geometry) p.geometry.dispose();
            if (p.material) p.material.dispose();
        }
        pipe.particles.length = 0;
    }

    function removePipe(pipeId) {
        const idx = pipes.findIndex(p => p.id === pipeId);
        if (idx < 0) return;
        const pipe = pipes[idx];

        // Remove flow particles, label, and tee marker
        removeFlowParticles(pipe);
        removePipeLabel(pipe);
        if (pipe.teeMarker) {
            scene.remove(pipe.teeMarker);
            if (pipe.teeMarker.geometry) pipe.teeMarker.geometry.dispose();
            if (pipe.teeMarker.material) pipe.teeMarker.material.dispose();
            pipe.teeMarker = null;
        }

        // Remove mesh from scene
        scene.remove(pipe.mesh);
        if (pipe.mesh.geometry) pipe.mesh.geometry.dispose();
        if (pipe.mesh.material) pipe.mesh.material.dispose();

        // Remove connection references from both components
        const fromComp = pipe.branchFrom ? null : placedComponents.find(c => c.id === pipe.from.componentId);
        const toComp = placedComponents.find(c => c.id === pipe.to.componentId);

        if (fromComp) {
            fromComp.connections = fromComp.connections.filter(c => c.pipeId !== pipeId);
            updatePortMarkerColor(fromComp, pipe.from.portName);
        }
        if (toComp) {
            toComp.connections = toComp.connections.filter(c => c.pipeId !== pipeId);
            updatePortMarkerColor(toComp, pipe.to.portName);
        }

        pipes.splice(idx, 1);

        invalidateSimGraph();
        if (selectedPipe && selectedPipe.id === pipeId) {
            selectedPipe = null;
        }
    }

    function removeAllPipesForComponent(compId) {
        const toRemove = pipes.filter(p => p.from.componentId === compId || p.to.componentId === compId);
        for (const pipe of toRemove) {
            removePipe(pipe.id);
        }
    }

    function getPipeBaseColor(pipe) {
        if (pipe.media && pipe.media !== 'unknown') {
            const mediaDef = MEDIA_DEFINITIONS[pipe.media];
            return mediaDef ? mediaDef.color : PIPE_COLOR;
        }
        return PIPE_COLOR;
    }

    function selectPipe(pipeId) {
        deselectPipe();
        const pipe = pipes.find(p => p.id === pipeId);
        if (!pipe) return;
        selectedPipe = pipe;
        pipe.mesh.material.color.setHex(PIPE_COLOR_SELECTED);
        pipe.mesh.material.emissive = new THREE.Color(PIPE_COLOR_SELECTED);
        pipe.mesh.material.emissiveIntensity = 0.3;
        const mediaDef = MEDIA_DEFINITIONS[pipe.media] || MEDIA_DEFINITIONS.unknown;
        const mediaInfo = pipe.media !== 'unknown' ? ` [${mediaDef.shortName}]` : '';
        const tempInfo = simulationRunning && pipe.flowTemp !== undefined ? ` — Temp: ${pipe.flowTemp.toFixed(1)}°C` : '';
        setStatus(`Valt rör: ${pipe.from.componentId}:${pipe.from.portName} → ${pipe.to.componentId}:${pipe.to.portName}${mediaInfo}${tempInfo} (Delete = ta bort)`);
        showPipeProperties(pipe);
    }

    function deselectPipe() {
        if (selectedPipe) {
            selectedPipe.mesh.material.color.setHex(getPipeBaseColor(selectedPipe));
            selectedPipe.mesh.material.emissive = new THREE.Color(0x000000);
            selectedPipe.mesh.material.emissiveIntensity = 0;
            selectedPipe = null;
        }
    }

    // --- Pipe properties panel ---
    function showPipeProperties(pipe) {
        const el = document.getElementById('properties-content');
        const mediaDef = MEDIA_DEFINITIONS[pipe.media] || MEDIA_DEFINITIONS.unknown;
        const phaseInfo = PHASE_INFO[mediaDef.phase] || PHASE_INFO.unknown;
        const hazInfo = HAZARD_INFO[mediaDef.hazard] || HAZARD_INFO.none;
        const color = '#' + mediaDef.color.toString(16).padStart(6, '0');

        const fromComp = placedComponents.find(c => c.id === pipe.from.componentId);
        const toComp = placedComponents.find(c => c.id === pipe.to.componentId);
        const fromName = fromComp ? fromComp.definition.name : pipe.from.componentId;
        const toName = toComp ? toComp.definition.name : pipe.to.componentId;

        let html = `
            <div class="prop-group">
                <div class="prop-group-title">Rörledning</div>
                <div class="prop-row"><span class="prop-label">Från</span><span class="prop-value">${fromName}:${pipe.from.portName}</span></div>
                <div class="prop-row"><span class="prop-label">Till</span><span class="prop-value">${toName}:${pipe.to.portName}</span></div>
                <div class="prop-row"><span class="prop-label">Waypoints</span><span class="prop-value">${pipe.waypoints.length}</span></div>
            </div>
            <div class="prop-group">
                <div class="prop-group-title">Media</div>
                <div class="prop-row">
                    <span class="prop-label">Typ</span>
                    <span class="prop-value" style="display:flex;align-items:center;gap:4px;">
                        <span class="media-dot" style="background:${color};width:10px;height:10px;border-radius:50%;display:inline-block;"></span>
                        ${mediaDef.name}
                    </span>
                </div>
                <div class="prop-row"><span class="prop-label">Fas</span><span class="prop-value">${phaseInfo.icon} ${phaseInfo.label}</span></div>`;

        if (hazInfo.label) {
            html += `<div class="prop-row"><span class="prop-label">Fara</span><span class="prop-value" style="color:${hazInfo.color}">${hazInfo.icon} ${hazInfo.label}</span></div>`;
        }

        // Media properties
        if (mediaDef.properties && Object.keys(mediaDef.properties).length > 0) {
            for (const [key, prop] of Object.entries(mediaDef.properties)) {
                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
                html += `<div class="prop-row"><span class="prop-label">${label}</span><span class="prop-value">${prop.value} ${prop.unit}</span></div>`;
            }
        }

        html += `
                <div class="prop-row" style="margin-top:6px;">
                    <span class="prop-label"></span>
                    <button class="prop-toggle-btn" onclick="window.__changePipeMedia(${pipe.id})" style="background:var(--bg-card);">Ändra media</button>
                </div>
            </div>`;

        // Compatibility status
        const compat = pipe.compat || checkPipeCompatibility(pipe);
        if (!compat.ok) {
            const isError = compat.level === 'error';
            const icon    = isError ? '✕' : '⚠';
            const bg      = isError ? 'rgba(255,50,50,0.12)' : 'rgba(255,150,0,0.12)';
            const border  = isError ? 'rgba(255,50,50,0.4)'  : 'rgba(255,150,0,0.4)';
            const color   = isError ? '#ff6666' : '#ffaa33';
            html += `
            <div class="prop-group" style="border:1px solid ${border};background:${bg};border-radius:7px;padding:10px 12px;margin-top:4px;">
                <div class="prop-group-title" style="color:${color};">${icon} ${isError ? 'Inkompatibel media' : 'Varning'}</div>
                <div style="font-size:11px;color:${color};line-height:1.5;">${compat.reason}</div>
            </div>`;
        } else if (pipe.media && pipe.media !== 'unknown') {
            html += `
            <div class="prop-group" style="border:1px solid rgba(80,200,80,0.3);background:rgba(80,200,80,0.08);border-radius:7px;padding:8px 12px;margin-top:4px;">
                <div class="prop-group-title" style="color:#66cc66;">✓ Kompatibel</div>
            </div>`;
        }

        el.innerHTML = html;
    }

    // --- Pipe drawing alignment guides ---
    const PIPE_ALIGN_COLOR = 0x4fc3f7;
    const PIPE_ALIGN_COLOR_HEIGHT = 0xffab40; // orange for height match
    const PIPE_ALIGN_TOLERANCE = 0.05;

    function createPipeAlignGuides() {
        // X-alignment line (horizontal, along X axis — shown when Z matches)
        const matX = new THREE.LineDashedMaterial({
            color: PIPE_ALIGN_COLOR, dashSize: 0.25, gapSize: 0.12,
            transparent: true, opacity: 0.5
        });
        const geoX = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-10, 0, 0), new THREE.Vector3(10, 0, 0)
        ]);
        const lineX = new THREE.Line(geoX, matX);
        lineX.computeLineDistances();
        lineX.visible = false;
        scene.add(lineX);

        // Z-alignment line (horizontal, along Z axis — shown when X matches)
        const matZ = new THREE.LineDashedMaterial({
            color: PIPE_ALIGN_COLOR, dashSize: 0.25, gapSize: 0.12,
            transparent: true, opacity: 0.5
        });
        const geoZ = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, -10), new THREE.Vector3(0, 0, 10)
        ]);
        const lineZ = new THREE.Line(geoZ, matZ);
        lineZ.computeLineDistances();
        lineZ.visible = false;
        scene.add(lineZ);

        // Y-alignment indicator (horizontal ring at matched height — orange)
        const matY = new THREE.LineDashedMaterial({
            color: PIPE_ALIGN_COLOR_HEIGHT, dashSize: 0.2, gapSize: 0.1,
            transparent: true, opacity: 0.6
        });
        const geoY = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-10, 0, 0), new THREE.Vector3(10, 0, 0)
        ]);
        const lineY = new THREE.Line(geoY, matY);
        lineY.computeLineDistances();
        lineY.visible = false;
        scene.add(lineY);

        return { lineX, lineZ, lineY };
    }

    function destroyPipeAlignGuides(guides) {
        for (const key of ['lineX', 'lineZ', 'lineY']) {
            const obj = guides[key];
            if (obj) {
                scene.remove(obj);
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) obj.material.dispose();
            }
        }
    }

    function updatePipeAlignGuides(cursorX, cursorY, cursorZ) {
        if (!pipeDrawingState || !pipeDrawingState.pipeAlignGuides) return;
        const guides = pipeDrawingState.pipeAlignGuides;
        const tol = PIPE_ALIGN_TOLERANCE;

        // Collect all reference points to check alignment against:
        // 1. Source port position
        // 2. Target port position
        // 3. All placed component positions
        const refPoints = [];

        const srcPos = pipeDrawingState.isBranch
            ? pipeDrawingState.branchTeePoint.clone()
            : getPortWorldPosition(pipeDrawingState.fromComp, pipeDrawingState.fromPort);
        refPoints.push({ x: srcPos.x, y: srcPos.y, z: srcPos.z, label: 'src' });

        const tgtPos = getPortWorldPosition(pipeDrawingState.toComp, pipeDrawingState.toPort);
        refPoints.push({ x: tgtPos.x, y: tgtPos.y, z: tgtPos.z, label: 'tgt' });

        for (const comp of placedComponents) {
            refPoints.push({
                x: comp.mesh.position.x,
                y: comp.mesh.position.y,
                z: comp.mesh.position.z,
                label: 'comp'
            });
            // Also add each port's world position
            for (const portName of Object.keys(comp.definition.ports)) {
                const pp = getPortWorldPosition(comp, portName);
                refPoints.push({ x: pp.x, y: pp.y, z: pp.z, label: 'port' });
            }
        }

        let matchX = false, matchZ = false, matchY = false;
        let matchedZ = 0, matchedX = 0, matchedYVal = 0;

        for (const ref of refPoints) {
            // X alignment: cursor X matches ref X → show vertical line along Z
            if (Math.abs(ref.x - cursorX) < tol) {
                matchX = true;
                matchedX = ref.x;
            }
            // Z alignment: cursor Z matches ref Z → show horizontal line along X
            if (Math.abs(ref.z - cursorZ) < tol) {
                matchZ = true;
                matchedZ = ref.z;
            }
            // Y alignment: cursor height matches ref Y
            if (Math.abs(ref.y - cursorY) < tol && ref.y > 0.05) {
                matchY = true;
                matchedYVal = ref.y;
            }
        }

        // X-match → show line along Z at matched X
        if (matchX) {
            const y = pipeDrawingState.currentHeight + 0.02;
            const positions = new Float32Array([matchedX, y, -10, matchedX, y, 10]);
            guides.lineZ.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            guides.lineZ.geometry.attributes.position.needsUpdate = true;
            guides.lineZ.computeLineDistances();
            guides.lineZ.visible = true;
        } else {
            guides.lineZ.visible = false;
        }

        // Z-match → show line along X at matched Z
        if (matchZ) {
            const y = pipeDrawingState.currentHeight + 0.02;
            const positions = new Float32Array([-10, y, matchedZ, 10, y, matchedZ]);
            guides.lineX.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            guides.lineX.geometry.attributes.position.needsUpdate = true;
            guides.lineX.computeLineDistances();
            guides.lineX.visible = true;
        } else {
            guides.lineX.visible = false;
        }

        // Y-match → show horizontal line at matched height (crossing cursor position)
        if (matchY) {
            const positions = new Float32Array([
                cursorX - 2, matchedYVal, cursorZ,
                cursorX + 2, matchedYVal, cursorZ
            ]);
            guides.lineY.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            guides.lineY.geometry.attributes.position.needsUpdate = true;
            guides.lineY.computeLineDistances();
            guides.lineY.visible = true;
        } else {
            guides.lineY.visible = false;
        }
    }

    function hidePipeAlignGuides() {
        if (!pipeDrawingState || !pipeDrawingState.pipeAlignGuides) return;
        const g = pipeDrawingState.pipeAlignGuides;
        g.lineX.visible = false;
        g.lineZ.visible = false;
        g.lineY.visible = false;
    }

    // --- Pipe drawing preview and helpers ---
    function createHeightIndicator() {
        // Translucent ring showing current drawing height
        const ringGeo = new THREE.RingGeometry(0.3, 0.5, 24);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x4fc3f7, transparent: true, opacity: 0.35,
            side: THREE.DoubleSide, depthWrite: false
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        scene.add(ring);

        // Small vertical line from ground to ring height
        const lineMat = new THREE.LineDashedMaterial({
            color: 0x4fc3f7, dashSize: 0.15, gapSize: 0.1,
            transparent: true, opacity: 0.4
        });
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0)
        ]);
        const line = new THREE.Line(lineGeo, lineMat);
        line.computeLineDistances();
        scene.add(line);

        return { ring, line };
    }

    function updateHeightIndicator(x, z) {
        if (!pipeDrawingState || !pipeDrawingState.heightIndicator) return;
        const h = pipeDrawingState.currentHeight;
        const { ring, line } = pipeDrawingState.heightIndicator;

        ring.position.set(x, h, z);
        ring.visible = true;

        // Vertical line from ground to height (only if height > 0.1)
        if (h > 0.1) {
            const positions = new Float32Array([x, 0, z, x, h, z]);
            line.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            line.geometry.attributes.position.needsUpdate = true;
            line.computeLineDistances();
            line.visible = true;
        } else {
            line.visible = false;
        }
    }

    function startPipeDrawing(fromComp, fromPort, toComp, toPort) {
        const startPos = getPortWorldPosition(fromComp, fromPort);
        const startDir = getPortWorldDirection(fromComp, fromPort);
        // First waypoint is just past the port stub
        const stubEnd = startPos.clone().add(startDir.clone().multiplyScalar(STUB_LEN));

        // Create dashed preview line
        const previewMat = new THREE.LineDashedMaterial({
            color: 0x4fc3f7, dashSize: 0.2, gapSize: 0.1,
            transparent: true, opacity: 0.6
        });
        const previewGeo = new THREE.BufferGeometry().setFromPoints([stubEnd.clone(), stubEnd.clone()]);
        const previewLine = new THREE.Line(previewGeo, previewMat);
        previewLine.computeLineDistances();
        scene.add(previewLine);

        // Create height indicator
        const heightIndicator = createHeightIndicator();

        // Create pipe alignment guides
        const pipeAlignGuides = createPipeAlignGuides();

        pipeDrawingState = {
            phase: 'drawing',
            fromComp,
            fromPort,
            fromPortType: fromComp.definition.ports[fromPort].type,
            toComp,
            toPort,
            waypoints: [],
            previewLine,
            waypointMarkers: [],
            currentHeight: startPos.y,
            heightIndicator,
            pipeAlignGuides,
            hoveredPort: null
        };

        document.getElementById('viewport').classList.add('mode-connect');
        pipeDrawingStatusMsg();
    }

    function startBranchPipeDrawing(toComp, toPort) {
        const teePoint = pipeDrawingState.branchTeePoint.clone();
        const branchDir = pipeDrawingState.branchDir.clone();
        const branchPipeId = pipeDrawingState.branchFromPipeId;
        const branchTeeParam = pipeDrawingState.branchTeeParam;

        // Remove the temporary highlight tee marker
        if (pipeDrawingState.teeMarker) {
            scene.remove(pipeDrawingState.teeMarker);
            if (pipeDrawingState.teeMarker.geometry) pipeDrawingState.teeMarker.geometry.dispose();
            if (pipeDrawingState.teeMarker.material) pipeDrawingState.teeMarker.material.dispose();
        }

        const stubEnd = teePoint.clone().add(branchDir.clone().multiplyScalar(STUB_LEN));

        const previewMat = new THREE.LineDashedMaterial({
            color: 0x4fc3f7, dashSize: 0.2, gapSize: 0.1,
            transparent: true, opacity: 0.6
        });
        const previewGeo = new THREE.BufferGeometry().setFromPoints([stubEnd.clone(), stubEnd.clone()]);
        const previewLine = new THREE.Line(previewGeo, previewMat);
        previewLine.computeLineDistances();
        scene.add(previewLine);

        const heightIndicator = createHeightIndicator();
        const pipeAlignGuides = createPipeAlignGuides();

        pipeDrawingState = {
            phase: 'drawing',
            fromComp: null,
            fromPort: null,
            fromPortType: 'liquid_out',
            toComp,
            toPort,
            waypoints: [],
            previewLine,
            waypointMarkers: [],
            currentHeight: teePoint.y,
            heightIndicator,
            pipeAlignGuides,
            hoveredPort: null,
            isBranch: true,
            branchFromPipeId: branchPipeId,
            branchTeePoint: teePoint,
            branchTeeParam: branchTeeParam,
            branchDir: branchDir
        };

        document.getElementById('viewport').classList.add('mode-connect');
        pipeDrawingStatusMsg();
    }

    function pipeDrawingStatusMsg() {
        if (!pipeDrawingState || pipeDrawingState.phase !== 'drawing') return;
        const h = pipeDrawingState.currentHeight.toFixed(1);
        const n = pipeDrawingState.waypoints.length;
        const from = pipeDrawingState.isBranch ? 'Förgrening' : pipeDrawingState.fromComp.definition.name;
        const to = pipeDrawingState.toComp.definition.name;
        setStatus(`${from} → ${to} [${n} pt, höjd: ${h}] — Klicka = waypoint | Enter = slutför | Q/E höjd | Dra = kamera | Högerklick = ångra | Esc = avbryt`);
    }

    function finishPipeDrawing() {
        if (!pipeDrawingState || pipeDrawingState.phase !== 'drawing') return;
        const { fromComp, fromPort, toComp, toPort, waypoints, isBranch,
                branchFromPipeId, branchTeePoint, branchTeeParam } = pipeDrawingState;
        const wpClone = waypoints.map(w => w.clone());

        cleanupPipeDrawing();
        resetPortHighlights();

        function finalizePipe(mediaKey) {
            pushUndo();
            const mediaDef = MEDIA_DEFINITIONS[mediaKey] || MEDIA_DEFINITIONS.unknown;
            let newPipe;
            if (isBranch) {
                newPipe = createBranchPipe(branchFromPipeId, branchTeePoint, branchTeeParam, toComp, toPort, wpClone, mediaKey);
            } else {
                newPipe = createPipe(fromComp, fromPort, toComp, toPort, wpClone, mediaKey);
            }
            // Show compatibility result in status bar
            if (newPipe && newPipe.compat && !newPipe.compat.ok) {
                const prefix = newPipe.compat.level === 'error' ? '✕ Inkompatibel:' : '⚠ Varning:';
                setStatus(`${prefix} ${newPipe.compat.reason}`);
            } else if (isBranch) {
                setStatus(`Förgrening → ${toComp.definition.name}:${toPort} (${mediaDef.name})`);
            } else {
                setStatus(`✓ Kopplat ${fromComp.definition.name}:${fromPort} → ${toComp.definition.name}:${toPort} (${mediaDef.name})`);
            }
        }

        // If either port has a default media, skip the modal
        const autoMedia = resolvePortDefaultMedia(fromComp, fromPort, toComp, toPort);
        if (autoMedia) {
            finalizePipe(autoMedia);
        } else {
            setStatus('Välj media för rörledningen...');
            showMediaModal().then(finalizePipe);
        }
    }

    function addPipeWaypoint(point) {
        if (!pipeDrawingState) return;
        pipeDrawingState.waypoints.push(point.clone());

        // Add visual marker sphere
        const geo = new THREE.SphereGeometry(0.08, 8, 8);
        const mat = new THREE.MeshStandardMaterial({
            color: 0x4fc3f7, emissive: 0x4fc3f7, emissiveIntensity: 0.5
        });
        const marker = new THREE.Mesh(geo, mat);
        marker.position.copy(point);
        scene.add(marker);
        pipeDrawingState.waypointMarkers.push(marker);

        pipeDrawingStatusMsg();
    }

    function undoLastWaypoint() {
        if (!pipeDrawingState) return;
        if (pipeDrawingState.waypoints.length === 0) {
            // No waypoints left — cancel entirely
            cancelPipeDrawing();
            return;
        }
        pipeDrawingState.waypoints.pop();
        const marker = pipeDrawingState.waypointMarkers.pop();
        if (marker) {
            scene.remove(marker);
            if (marker.geometry) marker.geometry.dispose();
            if (marker.material) marker.material.dispose();
        }
        pipeDrawingStatusMsg();
    }

    function getLastDrawAnchor() {
        if (pipeDrawingState.waypoints.length > 0) {
            return pipeDrawingState.waypoints[pipeDrawingState.waypoints.length - 1];
        }
        if (pipeDrawingState.isBranch) {
            return pipeDrawingState.branchTeePoint.clone().add(
                pipeDrawingState.branchDir.clone().multiplyScalar(STUB_LEN)
            );
        }
        const pos = getPortWorldPosition(pipeDrawingState.fromComp, pipeDrawingState.fromPort);
        const dir = getPortWorldDirection(pipeDrawingState.fromComp, pipeDrawingState.fromPort);
        return pos.add(dir.multiplyScalar(STUB_LEN));
    }

    function updatePipePreview(mouseEvent) {
        if (!pipeDrawingState || pipeDrawingState.phase !== 'drawing') return;
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((mouseEvent.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((mouseEvent.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        // Raycast against a horizontal plane at currentHeight
        const planeNormal = new THREE.Vector3(0, 1, 0);
        const planePoint = new THREE.Vector3(0, pipeDrawingState.currentHeight, 0);
        const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(planeNormal, planePoint);
        const intersection = new THREE.Vector3();
        if (!raycaster.ray.intersectPlane(plane, intersection)) return;

        // Snap to grid (0.5 steps)
        intersection.x = Math.round(intersection.x * 2) / 2;
        intersection.z = Math.round(intersection.z * 2) / 2;

        // Update height indicator at cursor position
        updateHeightIndicator(intersection.x, intersection.z);

        // Update pipe alignment guides
        updatePipeAlignGuides(intersection.x, intersection.y || pipeDrawingState.currentHeight, intersection.z);

        // Update preview line from last anchor to cursor
        const lastPoint = getLastDrawAnchor();
        const positions = new Float32Array([
            lastPoint.x, lastPoint.y, lastPoint.z,
            intersection.x, intersection.y, intersection.z
        ]);
        pipeDrawingState.previewLine.geometry.setAttribute(
            'position', new THREE.BufferAttribute(positions, 3)
        );
        pipeDrawingState.previewLine.geometry.attributes.position.needsUpdate = true;
        pipeDrawingState.previewLine.computeLineDistances();
    }

    function getDrawingPlanePoint(mouseEvent) {
        if (!pipeDrawingState) return null;
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((mouseEvent.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((mouseEvent.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        const planeNormal = new THREE.Vector3(0, 1, 0);
        const planePoint = new THREE.Vector3(0, pipeDrawingState.currentHeight, 0);
        const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(planeNormal, planePoint);
        const intersection = new THREE.Vector3();
        if (!raycaster.ray.intersectPlane(plane, intersection)) return null;

        // Snap to grid (0.5 steps)
        intersection.x = Math.round(intersection.x * 2) / 2;
        intersection.z = Math.round(intersection.z * 2) / 2;
        return intersection;
    }

    function cancelPipeDrawing() {
        if (!pipeDrawingState) return;
        cleanupPipeDrawing();
        resetPortHighlights();
        setStatus('Rördragning avbruten');
    }

    function cleanupPipeDrawing() {
        if (!pipeDrawingState) return;
        // Remove preview line
        if (pipeDrawingState.previewLine) {
            scene.remove(pipeDrawingState.previewLine);
            if (pipeDrawingState.previewLine.geometry) pipeDrawingState.previewLine.geometry.dispose();
            if (pipeDrawingState.previewLine.material) pipeDrawingState.previewLine.material.dispose();
        }
        // Remove height indicator
        if (pipeDrawingState.heightIndicator) {
            const { ring, line } = pipeDrawingState.heightIndicator;
            scene.remove(ring);
            if (ring.geometry) ring.geometry.dispose();
            if (ring.material) ring.material.dispose();
            scene.remove(line);
            if (line.geometry) line.geometry.dispose();
            if (line.material) line.material.dispose();
        }
        // Remove pipe alignment guides
        if (pipeDrawingState.pipeAlignGuides) {
            destroyPipeAlignGuides(pipeDrawingState.pipeAlignGuides);
        }
        // Remove waypoint markers
        if (pipeDrawingState.waypointMarkers) {
            for (const marker of pipeDrawingState.waypointMarkers) {
                scene.remove(marker);
                if (marker.geometry) marker.geometry.dispose();
                if (marker.material) marker.material.dispose();
            }
        }
        // Remove temporary tee marker (from branch mode)
        if (pipeDrawingState.teeMarker) {
            scene.remove(pipeDrawingState.teeMarker);
            if (pipeDrawingState.teeMarker.geometry) pipeDrawingState.teeMarker.geometry.dispose();
            if (pipeDrawingState.teeMarker.material) pipeDrawingState.teeMarker.material.dispose();
        }
        pipeDrawingState = null;
        document.getElementById('viewport').classList.remove('mode-connect');
    }

    // --- Running status visual ---
    function updateRunningVisual(comp) {
        const isSelected = selectedComponents.includes(comp);
        comp.mesh.traverse(child => {
            if (child.isMesh && !child.userData.isPortMarker) {
                if (isSelected) {
                    child.material.emissive = new THREE.Color(0x333333);
                } else if (comp.running) {
                    child.material.emissive = new THREE.Color(0x1b5e20);
                    child.material.emissiveIntensity = 0.3;
                } else {
                    child.material.emissive = new THREE.Color(0x000000);
                    child.material.emissiveIntensity = 0;
                }
            }
        });
    }

    function toggleComponentRunning(comp) {
        if (emergencyStopActive) {
            setStatus('Nödstopp aktivt — återställ först');
            return;
        }
        if (!simulationRunning) {
            setStatus('Starta simuleringen först för att slå på/av komponenter');
            return;
        }
        // Fault guard: pump_failure blocks toggle on
        const fault = isComponentFaulted(comp);
        if (fault && fault.type === 'pump_failure' && !comp.running) {
            setStatus('⚠ Komponenten har ett pumpfel — kan inte startas');
            return;
        }
        comp.running = !comp.running;
        updateRunningVisual(comp);
        updatePipeParticleVisibility();
        if (simulationRunning) simTick(); // immediate propagation update
        else updatePipeColors();
        // Update properties panel if this component is selected
        if (comp === selectedPlacedComponent) {
            showProperties(comp);
        }
    }

    function isPipeFlowing(pipe) {
        const fromComp = placedComponents.find(c => c.id === pipe.from.componentId);
        const toComp = placedComponents.find(c => c.id === pipe.to.componentId);
        return simulationRunning && fromComp && toComp && fromComp.running && toComp.running;
    }

    function updatePipeParticleVisibility() {
        for (const pipe of pipes) {
            const flowing = isPipeFlowing(pipe);
            for (const p of pipe.particles) {
                p.visible = flowing;
            }
        }
    }

    // Expose toggle for properties panel button
    window.__toggleComponentRunning = function(compId) {
        const comp = placedComponents.find(c => c.id === compId);
        if (comp) toggleComponentRunning(comp);
    };

    // Expose parameter update for editable inputs
    window.__updateParam = function(compId, key, value) {
        const comp = placedComponents.find(c => c.id === compId);
        if (!comp || !comp.parameters[key]) return;
        pushUndo();
        // Fault guard: valve_stuck blocks opening changes (unless fault scenario forces it)
        const fault = isComponentFaulted(comp);
        if (fault && fault.type === 'valve_stuck' && key === 'opening') {
            // Clear the fault when user manually overrides the opening
            clearFault(fault.id);
        }
        comp.parameters[key].value = parseFloat(value) || 0;
        if (simulationRunning) simTick();
    };

    // Expose tag number update
    window.__updateTagNumber = function(compId, value) {
        const comp = placedComponents.find(c => c.id === compId);
        if (!comp) return;
        comp.tagNumber = value.trim();
        createComponentLabel(comp);
    };

    // Expose pipe media change
    window.__changePipeMedia = function(pipeId) {
        const pipe = pipes.find(p => p.id === pipeId);
        if (!pipe) return;
        showMediaModal().then((mediaKey) => {
            pushUndo();
            updatePipeMedia(pipe, mediaKey);
            if (selectedPipe && selectedPipe.id === pipeId) {
                showPipeProperties(pipe);
            }
            // Show compatibility result in status bar
            if (pipe.compat && !pipe.compat.ok) {
                const prefix = pipe.compat.level === 'error' ? '✕ Inkompatibel:' : '⚠ Varning:';
                setStatus(`${prefix} ${pipe.compat.reason}`);
            } else {
                const mediaDef = MEDIA_DEFINITIONS[mediaKey] || MEDIA_DEFINITIONS.unknown;
                setStatus(`✓ Media ändrad till ${mediaDef.name}`);
            }
        });
    };

    // --- Place component ---
    function placeComponent(type, x, z, rotation, customY) {
        rotation = rotation || 0;
        const def = COMPONENT_DEFINITIONS[type];
        if (!def) return;

        const mesh = def.buildMesh(THREE);
        mesh.position.set(x, 0, z);
        const isElevated = customY !== undefined && customY !== null;
        const isInline = def.type === 'valve' || def.type === 'instrument';
        if (!isElevated && !isInline) {
            addAutoFoundation(mesh, def);
        }
        liftToGround(mesh);
        // Apply custom elevation (for components placed at height, e.g. valves on columns)
        if (isElevated) {
            mesh.position.y = customY;
        }
        mesh.rotation.y = THREE.MathUtils.degToRad(rotation);
        mesh.userData.componentId = nextId;
        mesh.castShadow = true;

        scene.add(mesh);
        const comp = { id: nextId, type, mesh, definition: def, rotation, connections: [], running: false, computed: {}, tagNumber: '', tagSprite: null };
        if (customY !== undefined && customY !== null) comp.customY = customY;
        // Deep clone per-instance parameters
        comp.parameters = {};
        for (const [key, param] of Object.entries(def.parameters)) {
            comp.parameters[key] = { ...param };
        }
        placedComponents.push(comp);
        addPortMarkers(comp);
        nextId++;

        // Fas 2: Auto-connect nearby compatible ports (skip during snapshot restore)
        clearNearbyHighlights();
        hideAlignmentLines();
        const autoConnectedPipes = [];
        if (!restoringSnapshot) {
            const nearby = detectNearbyPorts(mesh.position, rotation, def, comp.id);
            for (const pair of nearby) {
                // Skip if this port was already auto-connected in this pass
                if (isPortConnected(comp, pair.thisPort)) continue;
                const otherComp = placedComponents.find(c => c.id === pair.otherCompId);
                if (!otherComp || isPortConnected(otherComp, pair.otherPort)) continue;
                // Determine direction
                const thisDef = def.ports[pair.thisPort];
                let newPipe;
                if (thisDef.type === 'liquid_out') {
                    newPipe = createPipe(comp, pair.thisPort, otherComp, pair.otherPort);
                } else {
                    newPipe = createPipe(otherComp, pair.otherPort, comp, pair.thisPort);
                }
                if (newPipe) autoConnectedPipes.push(newPipe);
            }
        }

        if (autoConnectedPipes.length > 0) {
            // Apply default media immediately for ports that have it; queue rest for modal
            const needsModal = [];
            for (const pipe of autoConnectedPipes) {
                const fComp = placedComponents.find(c => c.id === pipe.from.componentId);
                const tComp = placedComponents.find(c => c.id === pipe.to.componentId);
                const autoMedia = resolvePortDefaultMedia(fComp, pipe.from.portName, tComp, pipe.to.portName);
                if (autoMedia) {
                    updatePipeMedia(pipe, autoMedia);
                } else {
                    needsModal.push(pipe);
                }
            }
            if (needsModal.length > 0) {
                setStatus(`Placerade ${def.name} — Välj media för auto-kopplad rörledning...`);
                (async function selectMediaForAutoConnected() {
                    for (const pipe of needsModal) {
                        const mediaKey = await showMediaModal();
                        updatePipeMedia(pipe, mediaKey);
                    }
                    setStatus(`Placerade ${def.name} vid (${x}, ${z}) — Auto-kopplad ${autoConnectedPipes.length} port${autoConnectedPipes.length > 1 ? 'ar' : ''}`);
                })();
            } else {
                setStatus(`Placerade ${def.name} vid (${x}, ${z}) — Auto-kopplad ${autoConnectedPipes.length} port${autoConnectedPipes.length > 1 ? 'ar' : ''}`);
            }
        } else {
            setStatus(`Placerade ${def.name} vid (${x}, ${z}) — ${rotation}°`);
        }
        selectPlacedComponent(comp.id);
        ComponentLibrary.clearSelection();
    }

    // --- Move mode ---
    function startMove(comp) {
        if (comp.connections && comp.connections.length > 0) {
            setStatus('Kan inte flytta: komponenten har aktiva kopplingar. Koppla loss först.');
            return;
        }
        movingComponent = comp;
        moveOriginalPos = { x: comp.mesh.position.x, y: comp.mesh.position.y, z: comp.mesh.position.z };
        moveOriginalRot = comp.rotation;

        // Make semi-transparent during move
        comp.mesh.traverse(child => {
            if (child.isMesh && !child.userData.isPortMarker) {
                child.material = child.material.clone();
                child.material.transparent = true;
                child.material.opacity = 0.5;
            }
        });

        document.getElementById('viewport').classList.add('mode-move');
        setStatus(`Flytta: ${comp.definition.name} — Klicka för att placera, R = rotera, Esc = avbryt`);
    }

    function finishMove() {
        if (!movingComponent) return;
        pushUndo();
        const comp = movingComponent;

        // Restore full opacity
        comp.mesh.traverse(child => {
            if (child.isMesh && !child.userData.isPortMarker) {
                child.material.transparent = false;
                child.material.opacity = 1.0;
            }
        });

        const x = comp.mesh.position.x;
        const z = comp.mesh.position.z;
        movingComponent = null;
        moveOriginalPos = null;
        moveOriginalRot = null;
        document.getElementById('viewport').classList.remove('mode-move');

        // Fas 2: Auto-connect nearby ports after move
        clearNearbyHighlights();
        hideAlignmentLines();
        const nearby = detectNearbyPorts(comp.mesh.position, comp.rotation, comp.definition, comp.id);
        let autoConnected = 0;
        for (const pair of nearby) {
            if (isPortConnected(comp, pair.thisPort)) continue;
            const otherComp = placedComponents.find(c => c.id === pair.otherCompId);
            if (!otherComp || isPortConnected(otherComp, pair.otherPort)) continue;
            const thisDef = comp.definition.ports[pair.thisPort];
            if (thisDef.type === 'liquid_out') {
                createPipe(comp, pair.thisPort, otherComp, pair.otherPort);
            } else {
                createPipe(otherComp, pair.otherPort, comp, pair.thisPort);
            }
            autoConnected++;
        }

        showProperties(comp);
        if (autoConnected > 0) {
            setStatus(`Flyttade ${comp.definition.name} till (${x}, ${z}) — Auto-kopplad ${autoConnected} port${autoConnected > 1 ? 'ar' : ''}`);
        } else {
            setStatus(`Flyttade ${comp.definition.name} till (${x}, ${z})`);
        }
    }

    function cancelMove() {
        if (!movingComponent) return;
        const comp = movingComponent;

        // Restore position and rotation
        comp.mesh.position.x = moveOriginalPos.x;
        comp.mesh.position.y = moveOriginalPos.y;
        comp.mesh.position.z = moveOriginalPos.z;
        comp.rotation = moveOriginalRot;
        comp.mesh.rotation.y = THREE.MathUtils.degToRad(moveOriginalRot);

        // Restore full opacity
        comp.mesh.traverse(child => {
            if (child.isMesh && !child.userData.isPortMarker) {
                child.material.transparent = false;
                child.material.opacity = 1.0;
            }
        });

        movingComponent = null;
        moveOriginalPos = null;
        moveOriginalRot = null;
        clearNearbyHighlights();
        hideAlignmentLines();
        document.getElementById('viewport').classList.remove('mode-move');
        setStatus('Flytt avbruten');
    }

    // --- Select placed component ---
    function selectPlacedComponent(id) {
        deselectAllComponents();
        const comp = placedComponents.find(c => c.id === id);
        if (!comp) return;

        selectedComponents.push(comp);
        highlightMesh(comp.mesh, true);
        showProperties(comp);
        setStatus(`Vald: ${comp.definition.name} (ID: ${comp.id})`);
    }

    function deselectComponent() {
        deselectAllComponents();
    }

    function deselectAllComponents() {
        for (const comp of selectedComponents) {
            highlightMesh(comp.mesh, false);
        }
        selectedComponents.length = 0;
        clearProperties();
    }

    function selectComponents(comps) {
        deselectAllComponents();
        for (const comp of comps) {
            selectedComponents.push(comp);
            highlightMesh(comp.mesh, true);
        }
        updatePropertiesPanel();
    }

    function toggleComponentSelection(comp) {
        const idx = selectedComponents.indexOf(comp);
        if (idx >= 0) {
            // Remove from selection
            selectedComponents.splice(idx, 1);
            highlightMesh(comp.mesh, false);
        } else {
            // Add to selection
            selectedComponents.push(comp);
            highlightMesh(comp.mesh, true);
        }
        updatePropertiesPanel();
    }

    function updatePropertiesPanel() {
        if (selectedComponents.length === 0) {
            clearProperties();
        } else if (selectedComponents.length === 1) {
            showProperties(selectedComponents[0]);
        } else {
            showMultiSelectProperties();
        }
    }

    function showMultiSelectProperties() {
        const el = document.getElementById('properties-content');
        el.innerHTML = `
            <div class="prop-group">
                <div class="prop-group-title">Markering</div>
                <div class="prop-row"><span class="prop-label">Antal valda</span><span class="prop-value">${selectedComponents.length} komponenter</span></div>
            </div>
            <div class="prop-group">
                <div class="prop-group-title">Gruppåtgärder</div>
                <div class="prop-row"><span class="prop-label">Flytta</span><span class="prop-value">M</span></div>
                <div class="prop-row"><span class="prop-label">Rotera</span><span class="prop-value">R</span></div>
                <div class="prop-row"><span class="prop-label">Ta bort</span><span class="prop-value">Delete</span></div>
            </div>
        `;
    }

    // --- Highlight ---
    function highlightMesh(group, highlight) {
        // Find the comp to check running state
        const comp = placedComponents.find(c => c.mesh === group);
        group.traverse(child => {
            if (child.isMesh && !child.userData.isPortMarker) {
                if (highlight) {
                    child.material.emissive = new THREE.Color(0x333333);
                    child.material.emissiveIntensity = 1;
                } else if (comp && comp.running && simulationRunning) {
                    child.material.emissive = new THREE.Color(0x1b5e20);
                    child.material.emissiveIntensity = 0.3;
                } else {
                    child.material.emissive = new THREE.Color(0x000000);
                    child.material.emissiveIntensity = 0;
                }
            }
        });
    }

    // --- Temperature color mapping ---
    function temperatureToColor(tempC) {
        // Color stops: ≤0°C blue, 25°C cyan, 50°C yellow, 75°C orange, ≥100°C red
        const stops = [
            { t: 0,   color: new THREE.Color(0x2196f3) },
            { t: 25,  color: new THREE.Color(0x00e5ff) },
            { t: 50,  color: new THREE.Color(0xffeb3b) },
            { t: 75,  color: new THREE.Color(0xff9800) },
            { t: 100, color: new THREE.Color(0xf44336) }
        ];
        if (tempC <= stops[0].t) return stops[0].color.clone();
        if (tempC >= stops[stops.length - 1].t) return stops[stops.length - 1].color.clone();
        for (let i = 0; i < stops.length - 1; i++) {
            if (tempC >= stops[i].t && tempC <= stops[i + 1].t) {
                const f = (tempC - stops[i].t) / (stops[i + 1].t - stops[i].t);
                return stops[i].color.clone().lerp(stops[i + 1].color, f);
            }
        }
        return stops[stops.length - 1].color.clone();
    }

    function getComponentOutletTemp(comp, portName) {
        const params = comp.parameters;
        // Heat exchanger: shell_out → hotOut temp, tube_out → coldOut temp
        if (comp.definition.type === 'heat_exchanger') {
            if (portName === 'shell_out' && params.hotOut) return params.hotOut.value;
            if (portName === 'tube_out' && params.coldOut) return params.coldOut.value;
        }
        // Distillation column: top_out → topTemp, bottom_out → bottomTemp
        if (comp.definition.type === 'column') {
            if (portName === 'top_out' && params.topTemp) return params.topTemp.value;
            if (portName === 'bottom_out' && params.bottomTemp) return params.bottomTemp.value;
        }
        // Furnaces and coolers: use tempOut
        if (comp.definition.type === 'furnace' || comp.definition.type === 'cooler') {
            if (params.tempOut) return params.tempOut.value;
        }
        // Components with a temp parameter (tanks, reactors)
        if (params.temp) return params.temp.value;
        // Default ambient temperature
        return 25;
    }

    function updatePipeColors() {
        for (const pipe of pipes) {
            const fromComp = placedComponents.find(c => c.id === pipe.from.componentId);
            if (!fromComp) continue;
            const temp = getComponentOutletTemp(fromComp, pipe.from.portName);
            const color = temperatureToColor(temp);
            pipe.flowTemp = temp;
            for (const p of pipe.particles) {
                p.material.color.copy(color);
                p.material.emissive.copy(color);
            }
        }
    }

    // === Dynamic Simulation Engine ===

    function buildSimGraph() {
        // Build directed graph: each pipe goes from.componentId → to.componentId
        const adjOut = new Map(); // compId → [{ pipeIdx, toId, fromPort, toPort }]
        const adjIn = new Map();  // compId → [{ pipeIdx, fromId, fromPort, toPort }]
        const compIds = new Set();

        for (const comp of placedComponents) {
            compIds.add(comp.id);
            adjOut.set(comp.id, []);
            adjIn.set(comp.id, []);
        }

        for (let i = 0; i < pipes.length; i++) {
            const p = pipes[i];
            // Branch pipes have no real "from" component – skip in adjOut
            if (p.from.componentId !== '__branch') {
                adjOut.get(p.from.componentId).push({
                    pipeIdx: i, toId: p.to.componentId,
                    fromPort: p.from.portName, toPort: p.to.portName
                });
            }
            adjIn.get(p.to.componentId).push({
                pipeIdx: i, fromId: p.from.componentId,
                fromPort: p.from.portName, toPort: p.to.portName
            });
        }

        // Kahn's algorithm for topological sort
        const inDegree = new Map();
        for (const id of compIds) inDegree.set(id, 0);
        for (const p of pipes) {
            // Branch pipes don't represent a real upstream component – skip
            if (p.from.componentId === '__branch') continue;
            inDegree.set(p.to.componentId, (inDegree.get(p.to.componentId) || 0) + 1);
        }

        const queue = [];
        for (const [id, deg] of inDegree) {
            if (deg === 0) queue.push(id);
        }

        const sorted = [];
        const visited = new Set();
        while (queue.length > 0) {
            const id = queue.shift();
            if (visited.has(id)) continue;
            visited.add(id);
            sorted.push(id);
            for (const edge of (adjOut.get(id) || [])) {
                const newDeg = inDegree.get(edge.toId) - 1;
                inDegree.set(edge.toId, newDeg);
                if (newDeg <= 0 && !visited.has(edge.toId)) queue.push(edge.toId);
            }
        }

        // Add any remaining (cyclic) nodes
        for (const id of compIds) {
            if (!visited.has(id)) sorted.push(id);
        }

        simGraph = { sorted, adjOut, adjIn };
    }

    function invalidateSimGraph() {
        simGraph = null;
    }

    function clearComputedValues() {
        for (const comp of placedComponents) {
            comp.computed = {};
        }
        for (const pipe of pipes) {
            pipe.computedFlow = 0;
            pipe.computedTemp = 25;
            pipe.computedPressure = 0;
        }
    }

    function simTick() {
        if (!simulationRunning) return;
        if (!simGraph) buildSimGraph();

        const dt = SIM_TICK_MS / 1000;

        // Run propagation (2 passes to handle cycles)
        for (let pass = 0; pass < 2; pass++) {
            // Propagate branch pipe values from their parent pipes
            for (const pipe of pipes) {
                if (pipe.from.componentId === '__branch' && pipe.branchFrom) {
                    const parentPipe = pipes.find(pp => pp.id === pipe.branchFrom.pipeId);
                    if (parentPipe) {
                        pipe.computedFlow     = parentPipe.computedFlow;
                        pipe.computedTemp     = parentPipe.computedTemp;
                        pipe.computedPressure = parentPipe.computedPressure;
                    }
                }
            }

            for (const compId of simGraph.sorted) {
                const comp = placedComponents.find(c => c.id === compId);
                if (!comp) continue;

                const inEdges = simGraph.adjIn.get(compId) || [];
                const outEdges = simGraph.adjOut.get(compId) || [];

                // Gather incoming totals
                let totalFlowIn = 0;
                let weightedTempIn = 0;
                let maxPressureIn = 0;

                for (const edge of inEdges) {
                    const p = pipes[edge.pipeIdx];
                    totalFlowIn += p.computedFlow;
                    weightedTempIn += p.computedFlow * p.computedTemp;
                    maxPressureIn = Math.max(maxPressureIn, p.computedPressure);
                }

                const avgTempIn = totalFlowIn > 0 ? weightedTempIn / totalFlowIn : 25;

                // Store computed inputs
                comp.computed.flowIn = totalFlowIn;
                comp.computed.pressureIn = maxPressureIn;
                comp.computed.tempIn = avgTempIn;

                // Skip propagation if component is not running
                if (!comp.running) {
                    comp.computed.flowOut = 0;
                    comp.computed.pressureOut = 0;
                    comp.computed.tempOut = avgTempIn;
                    // Zero out all outgoing pipes
                    for (const edge of outEdges) {
                        const p = pipes[edge.pipeIdx];
                        p.computedFlow = 0;
                        p.computedPressure = 0;
                        p.computedTemp = avgTempIn;
                    }
                    continue;
                }

                // Compute outputs based on component type
                let flowOut = 0, pressureOut = 0, tempOut = avgTempIn;

                const defType = comp.definition.type;
                const params = comp.parameters;

                if (defType === 'pump' || defType === 'compressor') {
                    // Sources: generate flow and pressure from parameters
                    flowOut = params.flowRate ? params.flowRate.value : 0;
                    pressureOut = params.pressure ? params.pressure.value :
                                  (params.pressureOut ? params.pressureOut.value : 0);
                    tempOut = avgTempIn + 2; // compression heating

                } else if (defType === 'valve') {
                    const opening = params.opening ? params.opening.value : 100;
                    const pDrop = params.pDrop ? params.pDrop.value : 0;

                    if (comp.definition.subtype === 'check') {
                        // Check valve: binary open/close based on forward pressure
                        flowOut = maxPressureIn > (params.crackingPressure ? params.crackingPressure.value : 0)
                            ? totalFlowIn : 0;
                    } else {
                        flowOut = totalFlowIn * (opening / 100);
                    }
                    pressureOut = Math.max(0, maxPressureIn - pDrop * (opening > 0 ? (100 / opening) : 100));
                    tempOut = avgTempIn; // pass through

                } else if (defType === 'tank') {
                    // Tank: accumulate level, pass flow through
                    const volume = params.volume ? params.volume.value : 50;
                    const level = params.level ? params.level.value : 50;

                    // Level change: (flowIn - flowOut) / volume * dt (simplified)
                    // outflow depends on level: no outflow if empty
                    if (level <= 0) {
                        flowOut = 0;
                    } else {
                        flowOut = totalFlowIn; // steady state: pass through
                    }

                    // Update level
                    const levelDelta = (totalFlowIn - flowOut) / Math.max(volume, 1) * dt * 100;
                    if (params.level) {
                        params.level.value = Math.max(0, Math.min(100, level + levelDelta));
                    }

                    pressureOut = params.pressure ? params.pressure.value : maxPressureIn;
                    tempOut = params.temp ? params.temp.value : avgTempIn;

                } else if (defType === 'furnace') {
                    // Furnace: heats fluid to tempOut parameter
                    flowOut = totalFlowIn;
                    pressureOut = maxPressureIn * 0.97; // small pressure loss through coils
                    tempOut = params.tempOut ? params.tempOut.value : avgTempIn;

                } else if (defType === 'cooler') {
                    // Cooler: cools fluid to tempOut parameter
                    flowOut = totalFlowIn;
                    pressureOut = maxPressureIn * 0.98;
                    tempOut = params.tempOut ? params.tempOut.value : avgTempIn;

                } else if (defType === 'heat_exchanger') {
                    // Separate shell/tube paths
                    for (const edge of outEdges) {
                        const p = pipes[edge.pipeIdx];
                        if (edge.fromPort === 'shell_out') {
                            // Shell side: hot fluid
                            const shellInEdge = inEdges.find(e => e.toPort === 'shell_in');
                            const shellFlow = shellInEdge ? pipes[shellInEdge.pipeIdx].computedFlow : 0;
                            p.computedFlow = shellFlow;
                            p.computedPressure = maxPressureIn;
                            p.computedTemp = params.hotOut ? params.hotOut.value : avgTempIn;
                        } else if (edge.fromPort === 'tube_out') {
                            // Tube side: cold fluid
                            const tubeInEdge = inEdges.find(e => e.toPort === 'tube_in');
                            const tubeFlow = tubeInEdge ? pipes[tubeInEdge.pipeIdx].computedFlow : 0;
                            p.computedFlow = tubeFlow;
                            p.computedPressure = maxPressureIn;
                            p.computedTemp = params.coldOut ? params.coldOut.value : avgTempIn;
                        }
                    }
                    // Store computed for panel
                    comp.computed.flowOut = totalFlowIn; // sum of both sides
                    comp.computed.pressureOut = maxPressureIn;
                    comp.computed.tempOut = avgTempIn;
                    continue; // already set pipe values

                } else if (defType === 'column') {
                    // Distillation column: split to top and bottom
                    for (const edge of outEdges) {
                        const p = pipes[edge.pipeIdx];
                        if (edge.fromPort === 'top_out') {
                            p.computedFlow = totalFlowIn * 0.4; // lighter fraction
                            p.computedPressure = params.pressure ? params.pressure.value : maxPressureIn;
                            p.computedTemp = params.topTemp ? params.topTemp.value : avgTempIn;
                        } else if (edge.fromPort === 'bottom_out') {
                            p.computedFlow = totalFlowIn * 0.6; // heavier fraction
                            p.computedPressure = params.pressure ? params.pressure.value : maxPressureIn;
                            p.computedTemp = params.bottomTemp ? params.bottomTemp.value : avgTempIn;
                        }
                    }
                    comp.computed.flowOut = totalFlowIn;
                    comp.computed.pressureOut = params.pressure ? params.pressure.value : maxPressureIn;
                    comp.computed.tempOut = avgTempIn;
                    continue;

                } else if (defType === 'separator') {
                    const subtype = comp.definition.subtype;
                    if (subtype === 'three_phase') {
                        // Split: gas 30%, oil 40%, water 30%
                        for (const edge of outEdges) {
                            const p = pipes[edge.pipeIdx];
                            if (edge.fromPort === 'gas_out') {
                                p.computedFlow = totalFlowIn * 0.30;
                                p.computedTemp = avgTempIn - 5;
                                p.computedPressure = maxPressureIn * 0.97;
                            } else if (edge.fromPort === 'oil_out') {
                                p.computedFlow = totalFlowIn * 0.40;
                                p.computedTemp = avgTempIn;
                                p.computedPressure = maxPressureIn * 0.95;
                            } else if (edge.fromPort === 'water_out') {
                                p.computedFlow = totalFlowIn * 0.30;
                                p.computedTemp = avgTempIn - 2;
                                p.computedPressure = maxPressureIn * 0.95;
                            } else {
                                p.computedFlow = totalFlowIn / Math.max(1, outEdges.length);
                                p.computedTemp = avgTempIn;
                                p.computedPressure = maxPressureIn * 0.95;
                            }
                        }
                        comp.computed.flowOut     = totalFlowIn;
                        comp.computed.pressureOut = maxPressureIn * 0.95;
                        comp.computed.tempOut     = avgTempIn;
                        continue;
                    } else {
                        // Simple separator / filter: pass through with pressure drop
                        flowOut = totalFlowIn;
                        pressureOut = maxPressureIn * 0.95;
                        tempOut = avgTempIn;
                    }

                } else {
                    // Generic pass-through
                    flowOut = totalFlowIn;
                    pressureOut = maxPressureIn * 0.98; // small friction loss
                    tempOut = avgTempIn;
                }

                // Store computed outputs
                comp.computed.flowOut = flowOut;
                comp.computed.pressureOut = pressureOut;
                comp.computed.tempOut = tempOut;

                // Propagate to outgoing pipes
                const outCount = outEdges.length;
                for (const edge of outEdges) {
                    const p = pipes[edge.pipeIdx];
                    p.computedFlow = outCount > 0 ? flowOut / outCount : 0;
                    p.computedPressure = pressureOut;
                    p.computedTemp = tempOut;
                }
            }
        }

        // Update pipe particle colors and mesh colors from computed temperatures
        updatePipeColorsFromComputed();

        // Update status bar with simulation summary
        const runningCount = placedComponents.filter(c => c.running).length;
        if (placedComponents.length > 0) {
            setStatus(`▶ Simulering — ${runningCount}/${placedComponents.length} komponenter på (dubbelklicka för att slå av/på)`);
        }

        // Update only the computed-values section (avoids rebuilding the whole panel,
        // which would break button clicks mid-interaction)
        if (selectedPlacedComponent) updatePropertiesComputedSection(selectedPlacedComponent);
    }

    function resetPipeMeshColor(pipe) {
        if (!pipe.mesh || !pipe.mesh.material) return;
        if (pipe.compat && !pipe.compat.ok) {
            const col = pipe.compat.level === 'error' ? PIPE_COLOR_INCOMPAT : PIPE_COLOR_WARNING;
            pipe.mesh.material.color.setHex(col);
            pipe.mesh.material.emissive.setHex(pipe.compat.level === 'error' ? 0x440000 : 0x331500);
            pipe.mesh.material.emissiveIntensity = 0.25;
        } else {
            const mediaDef = MEDIA_DEFINITIONS[pipe.media] || MEDIA_DEFINITIONS.unknown;
            const col = pipe.media !== 'unknown' ? mediaDef.color : PIPE_COLOR;
            pipe.mesh.material.color.setHex(col);
            pipe.mesh.material.emissive.setHex(0x000000);
            pipe.mesh.material.emissiveIntensity = 0;
        }
    }

    function updatePipeColorsFromComputed() {
        for (const pipe of pipes) {
            const color = temperatureToColor(pipe.computedTemp);
            pipe.flowTemp = pipe.computedTemp;
            for (const p of pipe.particles) {
                p.material.color.copy(color);
                p.material.emissive.copy(color);
            }
            // Color the pipe mesh by temperature when it is carrying flow
            if (pipe.mesh && pipe.mesh.material) {
                const flowing = isPipeFlowing(pipe) && pipe.computedFlow > 0;
                if (flowing) {
                    pipe.mesh.material.color.copy(color);
                    const intensity = Math.min(0.4, Math.max(0, (pipe.computedTemp - 25) / 150));
                    pipe.mesh.material.emissive.copy(color);
                    pipe.mesh.material.emissiveIntensity = intensity;
                } else {
                    resetPipeMeshColor(pipe);
                }
            }
        }
    }

    function startSimTick() {
        if (simInterval) clearInterval(simInterval);
        // Auto-start all components when simulation begins
        for (const comp of placedComponents) {
            comp.running = true;
            updateRunningVisual(comp);
        }
        buildSimGraph();
        simInterval = setInterval(simTick, SIM_TICK_MS);
        simTick(); // run immediately
    }

    function stopSimTick() {
        if (simInterval) {
            clearInterval(simInterval);
            simInterval = null;
        }
        clearComputedValues();
        simGraph = null;
        // Reset all pipe mesh colors back to media/compat colors
        for (const pipe of pipes) {
            resetPipeMeshColor(pipe);
        }
    }

    // --- Properties panel ---
    function showProperties(comp) {
        const el = document.getElementById('properties-content');
        const def = comp.definition;
        const statusLabel = comp.running ? 'På' : 'Av';
        const statusClass = comp.running ? 'on' : 'off';
        const fault = isComponentFaulted(comp);
        let html = '';
        if (fault) {
            const faultLabels = {
                pump_failure: 'Pumpfel — komponenten kan inte startas',
                valve_stuck: 'Ventil fastnad — öppningen låst',
                overheat: 'Överhettning — temperaturen är kritisk',
                leak: 'Läckage — flöde reducerat'
            };
            html += `<div class="fault-indicator"><span class="fault-icon">⚠</span>${faultLabels[fault.type] || 'Okänt fel'}</div>`;
        }
        html += `
            <div class="prop-group">
                <div class="prop-group-title">Information</div>
                <div class="prop-row">
                    <span class="prop-label">Taggnr</span>
                    <span class="prop-value"><input type="text" class="prop-input prop-tag-input" value="${comp.tagNumber || ''}" placeholder="P-101" maxlength="20" oninput="window.__updateTagNumber(${comp.id}, this.value)"></span>
                </div>
                <div class="prop-row"><span class="prop-label">Namn</span><span class="prop-value">${def.name}</span></div>
                <div class="prop-row"><span class="prop-label">Typ</span><span class="prop-value">${def.type}</span></div>
                <div class="prop-row"><span class="prop-label">ID</span><span class="prop-value">${comp.id}</span></div>
                <div class="prop-row"><span class="prop-label">Position</span><span class="prop-value">(${comp.mesh.position.x}, ${comp.mesh.position.z})</span></div>
                <div class="prop-row"><span class="prop-label">Rotation</span><span class="prop-value">${comp.rotation || 0}°</span></div>
                <div class="prop-row">
                    <span class="prop-label">Status</span>
                    <button class="prop-toggle-btn ${statusClass}" onclick="window.__toggleComponentRunning(${comp.id})">${statusLabel}</button>
                </div>
            </div>
            <div class="prop-group">
                <div class="prop-group-title">Parametrar</div>
        `;
        for (const [key, param] of Object.entries(comp.parameters)) {
            html += `<div class="prop-row"><span class="prop-label">${param.label}</span><span class="prop-value"><input type="number" class="prop-input" value="${param.value}" step="any" onchange="window.__updateParam(${comp.id}, '${key}', this.value)"> ${param.unit}</span></div>`;
        }
        html += `</div>
            <div class="prop-group">
                <div class="prop-group-title">Portar</div>
        `;
        for (const [name, port] of Object.entries(def.ports)) {
            const connected = comp.connections.find(c => c.portName === name);
            const status = connected ? ' ✓' : '';
            html += `<div class="prop-row"><span class="prop-label">${name}</span><span class="prop-value">${port.type}${status}</span></div>`;
        }
        html += `</div>`;

        // Show computed values when simulation is running
        if (simulationRunning && comp.computed && Object.keys(comp.computed).length > 0) {
            const c = comp.computed;
            html += `<div class="prop-group" id="prop-computed-section">
                <div class="prop-group-title" style="color: #4fc3f7;">Beräknade värden</div>`;
            if (c.flowIn !== undefined)
                html += `<div class="prop-row"><span class="prop-label">Flöde in</span><span class="prop-value computed">${c.flowIn.toFixed(1)} m³/h</span></div>`;
            if (c.flowOut !== undefined)
                html += `<div class="prop-row"><span class="prop-label">Flöde ut</span><span class="prop-value computed">${c.flowOut.toFixed(1)} m³/h</span></div>`;
            if (c.pressureIn !== undefined)
                html += `<div class="prop-row"><span class="prop-label">Tryck in</span><span class="prop-value computed">${c.pressureIn.toFixed(2)} bar</span></div>`;
            if (c.pressureOut !== undefined)
                html += `<div class="prop-row"><span class="prop-label">Tryck ut</span><span class="prop-value computed">${c.pressureOut.toFixed(2)} bar</span></div>`;
            if (c.tempIn !== undefined)
                html += `<div class="prop-row"><span class="prop-label">Temp in</span><span class="prop-value computed">${c.tempIn.toFixed(1)} °C</span></div>`;
            if (c.tempOut !== undefined)
                html += `<div class="prop-row"><span class="prop-label">Temp ut</span><span class="prop-value computed">${c.tempOut.toFixed(1)} °C</span></div>`;
            // Show tank level if applicable
            if (comp.definition.type === 'tank' && comp.parameters.level)
                html += `<div class="prop-row"><span class="prop-label">Nivå</span><span class="prop-value computed">${comp.parameters.level.value.toFixed(1)} %</span></div>`;
            html += `</div>`;
        }

        el.innerHTML = html;
    }

    /** Updates only the computed-values section in the properties panel (safe to call from simTick). */
    function updatePropertiesComputedSection(comp) {
        if (!comp || !simulationRunning) return;
        const section = document.getElementById('prop-computed-section');
        if (!section) return;
        const c = comp.computed || {};
        let html = `<div class="prop-group-title" style="color: #4fc3f7;">Beräknade värden</div>`;
        if (c.flowIn !== undefined)
            html += `<div class="prop-row"><span class="prop-label">Flöde in</span><span class="prop-value computed">${c.flowIn.toFixed(1)} m³/h</span></div>`;
        if (c.flowOut !== undefined)
            html += `<div class="prop-row"><span class="prop-label">Flöde ut</span><span class="prop-value computed">${c.flowOut.toFixed(1)} m³/h</span></div>`;
        if (c.pressureIn !== undefined)
            html += `<div class="prop-row"><span class="prop-label">Tryck in</span><span class="prop-value computed">${c.pressureIn.toFixed(2)} bar</span></div>`;
        if (c.pressureOut !== undefined)
            html += `<div class="prop-row"><span class="prop-label">Tryck ut</span><span class="prop-value computed">${c.pressureOut.toFixed(2)} bar</span></div>`;
        if (c.tempIn !== undefined)
            html += `<div class="prop-row"><span class="prop-label">Temp in</span><span class="prop-value computed">${c.tempIn.toFixed(1)} °C</span></div>`;
        if (c.tempOut !== undefined)
            html += `<div class="prop-row"><span class="prop-label">Temp ut</span><span class="prop-value computed">${c.tempOut.toFixed(1)} °C</span></div>`;
        if (comp.definition.type === 'tank' && comp.parameters.level)
            html += `<div class="prop-row"><span class="prop-label">Nivå</span><span class="prop-value computed">${comp.parameters.level.value.toFixed(1)} %</span></div>`;
        section.innerHTML = html;
    }

    function clearProperties() {
        document.getElementById('properties-content').innerHTML =
            '<p class="placeholder-text">Välj en komponent för att se egenskaper</p>';
    }

    // --- Status bar ---
    function setStatus(text) {
        document.getElementById('status-bar').textContent = text;
    }

    // --- Undo/Redo system ---
    function captureSnapshot() {
        return {
            components: placedComponents.map(c => ({
                id: c.id,
                type: c.type,
                x: c.mesh.position.x,
                z: c.mesh.position.z,
                customY: c.customY || null,
                rotation: c.rotation || 0,
                parameters: JSON.parse(JSON.stringify(c.parameters)),
                running: c.running,
                tagNumber: c.tagNumber || ''
            })),
            pipes: pipes.map(p => ({
                from: { componentId: p.from.componentId, portName: p.from.portName },
                to: { componentId: p.to.componentId, portName: p.to.portName },
                waypoints: (p.waypoints || []).map(w => ({ x: w.x, y: w.y, z: w.z })),
                media: p.media || 'unknown',
                branchFrom: p.branchFrom ? {
                    pipeId: p.branchFrom.pipeId,
                    teePoint: p.branchFrom.teePoint,
                    teeParam: p.branchFrom.teeParam
                } : null
            })),
            nextId: nextId,
            pipeNextId: pipeNextId
        };
    }

    function restoreSnapshot(snap) {
        // Stop simulation if running
        if (simulationRunning) {
            simulationRunning = false;
            stopSimTick();
            const simBtn = document.getElementById('btn-simulate');
            simBtn.classList.remove('simulating');
            simBtn.innerHTML = '&#9654; Simulera';
        }

        // Cancel active interactions
        if (pipeDrawingState) {
            cleanupPipeDrawing();
            resetPortHighlights();
        }
        if (movingComponent) {
            movingComponent = null;
            moveOriginalPos = null;
            moveOriginalRot = null;
            document.getElementById('viewport').classList.remove('mode-move');
        }
        if (ghostMesh) {
            removeGhost();
            ComponentLibrary.clearSelection();
        }

        // Clear all pipes
        for (const pipe of [...pipes]) {
            removeFlowParticles(pipe);
            removePipeLabel(pipe);
            scene.remove(pipe.mesh);
            if (pipe.mesh.geometry) pipe.mesh.geometry.dispose();
            if (pipe.mesh.material) pipe.mesh.material.dispose();
        }
        pipes.length = 0;
        selectedPipe = null;

        // Clear all components
        for (const comp of placedComponents) {
            removeComponentLabel(comp);
            scene.remove(comp.mesh);
        }
        placedComponents.length = 0;

        // Restore components
        restoringSnapshot = true;
        for (const item of snap.components) {
            const savedNextId = nextId;
            nextId = item.id;
            placeComponent(item.type, item.x, item.z, item.rotation, item.customY || undefined);
            const newComp = placedComponents[placedComponents.length - 1];
            if (item.customY) newComp.customY = item.customY;
            // Restore parameters
            for (const [key, param] of Object.entries(item.parameters)) {
                if (newComp.parameters[key]) {
                    newComp.parameters[key].value = param.value;
                }
            }
            newComp.running = item.running;
            if (item.tagNumber) {
                newComp.tagNumber = item.tagNumber;
                createComponentLabel(newComp);
            }
        }
        restoringSnapshot = false;

        // Restore pipes (normal first, then branches — branches depend on parent pipes existing)
        const normalPipes = snap.pipes.filter(p => !p.branchFrom);
        const branchPipes = snap.pipes.filter(p => p.branchFrom);

        for (const pipeItem of normalPipes) {
            const fromComp = placedComponents.find(c => c.id === pipeItem.from.componentId);
            const toComp = placedComponents.find(c => c.id === pipeItem.to.componentId);
            if (fromComp && toComp) {
                const wp = (pipeItem.waypoints || []).map(w => new THREE.Vector3(w.x, w.y, w.z));
                createPipe(fromComp, pipeItem.from.portName, toComp, pipeItem.to.portName, wp, pipeItem.media || 'unknown');
            }
        }
        for (const pipeItem of branchPipes) {
            const toComp = placedComponents.find(c => c.id === pipeItem.to.componentId);
            if (toComp && pipeItem.branchFrom) {
                const tp = pipeItem.branchFrom.teePoint;
                const teePoint = new THREE.Vector3(tp.x, tp.y, tp.z);
                const wp = (pipeItem.waypoints || []).map(w => new THREE.Vector3(w.x, w.y, w.z));
                createBranchPipe(pipeItem.branchFrom.pipeId, teePoint, pipeItem.branchFrom.teeParam,
                    toComp, pipeItem.to.portName, wp, pipeItem.media || 'unknown');
            }
        }

        // Restore IDs
        nextId = snap.nextId;
        pipeNextId = snap.pipeNextId;

        deselectComponent();
    }

    function pushUndo() {
        undoStack.push(captureSnapshot());
        if (undoStack.length > MAX_UNDO) undoStack.shift();
        redoStack.length = 0;
        updateUndoRedoButtons();
    }

    function undo() {
        if (undoStack.length === 0) return;
        redoStack.push(captureSnapshot());
        const snap = undoStack.pop();
        restoreSnapshot(snap);
        updateUndoRedoButtons();
        setStatus('\u00c5ngrade senaste \u00e4ndringen');
    }

    function redo() {
        if (redoStack.length === 0) return;
        undoStack.push(captureSnapshot());
        const snap = redoStack.pop();
        restoreSnapshot(snap);
        updateUndoRedoButtons();
        setStatus('Gjorde om \u00e4ndringen');
    }

    function updateUndoRedoButtons() {
        const undoBtn = document.getElementById('btn-undo');
        const redoBtn = document.getElementById('btn-redo');
        if (undoBtn) undoBtn.disabled = undoStack.length === 0;
        if (redoBtn) redoBtn.disabled = redoStack.length === 0;
    }

    // --- Toolbar actions ---
    document.getElementById('btn-undo').addEventListener('click', undo);
    document.getElementById('btn-redo').addEventListener('click', redo);

    document.getElementById('btn-delete').addEventListener('click', () => {
        if (selectedPipe) {
            pushUndo();
            const pipe = selectedPipe;
            removePipe(pipe.id);
            setStatus('Rör borttaget');
            return;
        }
        if (!selectedPlacedComponent) {
            setStatus('Välj en komponent eller rör att ta bort');
            return;
        }
        pushUndo();
        const comp = selectedPlacedComponent;
        // Remove all connected pipes first
        removeAllPipesForComponent(comp.id);
        removeComponentLabel(comp);
        scene.remove(comp.mesh);
        const idx = placedComponents.indexOf(comp);
        if (idx >= 0) placedComponents.splice(idx, 1);
        deselectComponent();
        setStatus(`Tog bort ${comp.definition.name}`);
    });

    document.getElementById('btn-move').addEventListener('click', () => {
        if (!selectedPlacedComponent) {
            setStatus('Välj en komponent att flytta');
            return;
        }
        if (movingComponent) return;
        startMove(selectedPlacedComponent);
    });

    document.getElementById('btn-rotate').addEventListener('click', () => {
        if (movingComponent) {
            movingComponent.rotation = (movingComponent.rotation + 90) % 360;
            movingComponent.mesh.rotation.y = THREE.MathUtils.degToRad(movingComponent.rotation);
            setStatus(`Flytta: ${movingComponent.definition.name} — Rotation: ${movingComponent.rotation}°`);
        } else if (ghostMesh) {
            ghostRotation = (ghostRotation + 90) % 360;
            ghostMesh.rotation.y = THREE.MathUtils.degToRad(ghostRotation);
            setStatus(`Rotation: ${ghostRotation}°`);
        } else if (selectedPlacedComponent) {
            pushUndo();
            const comp = selectedPlacedComponent;
            comp.rotation = (comp.rotation + 90) % 360;
            comp.mesh.rotation.y = THREE.MathUtils.degToRad(comp.rotation);
            showProperties(comp);
            setStatus(`Roterade ${comp.definition.name} till ${comp.rotation}°`);
        } else {
            setStatus('Välj en komponent att rotera');
        }
    });

    document.getElementById('btn-clear').addEventListener('click', () => {
        if (placedComponents.length === 0 && pipes.length === 0) return;
        pushUndo();
        // Cancel active sequence
        if (activeSequence) cancelSequence();
        // Clear all faults
        clearAllFaults();
        // Reset emergency if active
        if (emergencyStopActive) resetEmergencyStop();
        // Remove all pipes and their particles
        for (const pipe of [...pipes]) {
            removeFlowParticles(pipe);
            scene.remove(pipe.mesh);
            if (pipe.mesh.geometry) pipe.mesh.geometry.dispose();
            if (pipe.mesh.material) pipe.mesh.material.dispose();
        }
        pipes.length = 0;
        selectedPipe = null;
        if (pipeDrawingState) cleanupPipeDrawing();
        // Stop simulation
        simulationRunning = false;
        stopSimTick();
        document.getElementById('btn-simulate').classList.remove('simulating');
        document.getElementById('btn-simulate').innerHTML = '&#9654; Simulera';
        // Remove all components
        for (const comp of placedComponents) {
            removeComponentLabel(comp);
            scene.remove(comp.mesh);
        }
        placedComponents.length = 0;
        deselectComponent();
        document.getElementById('viewport').classList.remove('mode-connect');
        setStatus('Alla komponenter och kopplingar borttagna');
    });

    // =========================================================
    // SPARA / LADDA – modal-baserat system med namngivna slots
    // =========================================================
    const SAVES_KEY = 'processBuilder_saves';

    /** Returnerar alla sparade processer som { name: { name, savedAt, componentCount, pipeCount, data } } */
    function getAllSaves() {
        try {
            return JSON.parse(localStorage.getItem(SAVES_KEY)) || {};
        } catch (e) {
            return {};
        }
    }

    /** Serialiserar nuvarande arbetsyta till ett data-objekt */
    function serializeCanvas() {
        const compData = placedComponents.map(c => ({
            id: c.id,
            type: c.type,
            x: c.mesh.position.x,
            z: c.mesh.position.z,
            customY: c.customY || null,
            rotation: c.rotation || 0,
            parameters: c.parameters,
            tagNumber: c.tagNumber || ''
        }));
        const pipeData = pipes.map(p => ({
            from: { componentId: p.from.componentId, portName: p.from.portName },
            to: { componentId: p.to.componentId, portName: p.to.portName },
            waypoints: (p.waypoints || []).map(w => ({ x: w.x, y: w.y, z: w.z })),
            media: p.media || 'unknown',
            branchFrom: p.branchFrom ? {
                pipeId: p.branchFrom.pipeId,
                teePoint: p.branchFrom.teePoint,
                teeParam: p.branchFrom.teeParam
            } : null
        }));
        return { components: compData, pipes: pipeData };
    }

    /** Återställer arbetsytan från ett data-objekt (components + pipes) */
    function restoreCanvas(saveData) {
        // Stop simulation
        simulationRunning = false;
        stopSimTick();
        document.getElementById('btn-simulate').classList.remove('simulating');
        document.getElementById('btn-simulate').innerHTML = '&#9654; Simulera';

        // Clear scene
        for (const pipe of [...pipes]) {
            removeFlowParticles(pipe);
            removePipeLabel(pipe);
            scene.remove(pipe.mesh);
            if (pipe.mesh.geometry) pipe.mesh.geometry.dispose();
            if (pipe.mesh.material) pipe.mesh.material.dispose();
        }
        pipes.length = 0;
        selectedPipe = null;
        if (pipeDrawingState) cleanupPipeDrawing();
        for (const comp of placedComponents) {
            removeComponentLabel(comp);
            scene.remove(comp.mesh);
        }
        placedComponents.length = 0;
        deselectComponent();

        // Handle old save format (bare array of components)
        const compItems = Array.isArray(saveData) ? saveData : saveData.components;
        const pipeItems = Array.isArray(saveData) ? [] : (saveData.pipes || []);

        // Place components and build ID mapping (old id → new id)
        const idMap = {};
        for (const item of compItems) {
            const oldId = item.id;
            placeComponent(item.type, item.x, item.z, item.rotation || 0, item.customY || undefined);
            const newComp = placedComponents[placedComponents.length - 1];
            if (item.customY) newComp.customY = item.customY;
            if (item.parameters) {
                for (const [key, param] of Object.entries(item.parameters)) {
                    if (newComp.parameters[key]) {
                        newComp.parameters[key].value = param.value;
                    }
                }
            }
            if (oldId !== undefined) idMap[oldId] = newComp.id;
            if (item.tagNumber) {
                newComp.tagNumber = item.tagNumber;
                createComponentLabel(newComp);
            }
        }

        // Recreate pipes (normal first, branches after)
        for (const pipeItem of pipeItems.filter(p => !p.branchFrom)) {
            const fromComp = placedComponents.find(c => c.id === (idMap[pipeItem.from.componentId] || pipeItem.from.componentId));
            const toComp   = placedComponents.find(c => c.id === (idMap[pipeItem.to.componentId]   || pipeItem.to.componentId));
            if (fromComp && toComp) {
                const wp = (pipeItem.waypoints || []).map(w => new THREE.Vector3(w.x, w.y, w.z));
                createPipe(fromComp, pipeItem.from.portName, toComp, pipeItem.to.portName, wp, pipeItem.media || 'unknown');
            }
        }
        for (const pipeItem of pipeItems.filter(p => p.branchFrom)) {
            const toComp = placedComponents.find(c => c.id === (idMap[pipeItem.to.componentId] || pipeItem.to.componentId));
            if (toComp && pipeItem.branchFrom) {
                const tp = pipeItem.branchFrom.teePoint;
                const teePoint = new THREE.Vector3(tp.x, tp.y, tp.z);
                const wp = (pipeItem.waypoints || []).map(w => new THREE.Vector3(w.x, w.y, w.z));
                createBranchPipe(pipeItem.branchFrom.pipeId, teePoint, pipeItem.branchFrom.teeParam,
                    toComp, pipeItem.to.portName, wp, pipeItem.media || 'unknown');
            }
        }

        deselectComponent();
        return { compCount: compItems.length, pipeCount: pipeItems.length };
    }

    // --- Spara-modal ---
    let pendingOverwriteName = null; // används för tvåstegs-överskrivning

    function openSaveModal() {
        pendingOverwriteName = null;
        document.getElementById('save-name-input').value = '';
        document.getElementById('save-name-warning').style.display = 'none';
        renderSaveExistingList();
        document.getElementById('save-modal').style.display = 'flex';
        document.getElementById('save-name-input').focus();
    }

    function closeSaveModal() {
        document.getElementById('save-modal').style.display = 'none';
        pendingOverwriteName = null;
    }

    function renderSaveExistingList() {
        const saves = getAllSaves();
        const names = Object.keys(saves).sort((a, b) => {
            return new Date(saves[b].savedAt) - new Date(saves[a].savedAt);
        });
        const container = document.getElementById('save-existing-list');
        if (names.length === 0) {
            container.innerHTML = '<p class="save-empty-msg">Inga sparade processer än.</p>';
            return;
        }
        container.innerHTML = names.map(name => {
            const s = saves[name];
            const date = new Date(s.savedAt).toLocaleString('sv-SE', { dateStyle: 'short', timeStyle: 'short' });
            return `<div class="save-slot" data-name="${encodeURIComponent(name)}">
                <div class="save-slot-info">
                    <div class="save-slot-name">${name}</div>
                    <div class="save-slot-meta">${date} &middot; ${s.componentCount} komp &middot; ${s.pipeCount} rör</div>
                </div>
                <div class="save-slot-actions">
                    <button class="modal-action-btn delete-btn save-delete-btn" data-name="${encodeURIComponent(name)}" title="Ta bort">Ta bort</button>
                </div>
            </div>`;
        }).join('');

        container.querySelectorAll('.save-delete-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const name = decodeURIComponent(btn.dataset.name);
                if (!confirm(`Ta bort "${name}"?`)) return;
                const saves = getAllSaves();
                delete saves[name];
                localStorage.setItem(SAVES_KEY, JSON.stringify(saves));
                renderSaveExistingList();
                setStatus(`"${name}" borttagen`);
            });
        });
    }

    function doSave(name) {
        name = name.trim();
        if (!name) {
            showSaveWarning('Ange ett namn för processen.');
            return;
        }
        const saves = getAllSaves();

        // Tvåstegs-överskrivning
        if (saves[name] && pendingOverwriteName !== name) {
            pendingOverwriteName = name;
            showSaveWarning(`"${name}" finns redan. Klicka Spara igen för att skriva över.`);
            // Markera den befintliga slotten
            document.querySelectorAll('.save-slot').forEach(el => {
                el.classList.toggle('overwrite-highlight', decodeURIComponent(el.dataset.name) === name);
            });
            return;
        }

        const data = serializeCanvas();
        saves[name] = {
            name,
            savedAt: new Date().toISOString(),
            componentCount: data.components.length,
            pipeCount: data.pipes.length,
            data
        };
        localStorage.setItem(SAVES_KEY, JSON.stringify(saves));
        pendingOverwriteName = null;
        closeSaveModal();
        setStatus(`Sparade "${name}" — ${data.components.length} komp, ${data.pipes.length} rör`);
    }

    function showSaveWarning(msg) {
        const el = document.getElementById('save-name-warning');
        el.textContent = msg;
        el.style.display = 'block';
    }

    document.getElementById('btn-save').addEventListener('click', openSaveModal);
    document.getElementById('btn-close-save-modal').addEventListener('click', closeSaveModal);
    document.getElementById('save-modal').addEventListener('click', e => {
        if (e.target === document.getElementById('save-modal')) closeSaveModal();
    });

    document.getElementById('save-name-input').addEventListener('input', () => {
        document.getElementById('save-name-warning').style.display = 'none';
        pendingOverwriteName = null;
        document.querySelectorAll('.save-slot').forEach(el => el.classList.remove('overwrite-highlight'));
    });

    document.getElementById('save-name-input').addEventListener('keydown', e => {
        if (e.key === 'Enter') doSave(document.getElementById('save-name-input').value);
    });

    document.getElementById('btn-save-confirm').addEventListener('click', () => {
        doSave(document.getElementById('save-name-input').value);
    });

    // --- Export till JSON-fil ---
    document.getElementById('btn-export-json').addEventListener('click', () => {
        const data = serializeCanvas();
        const json = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), ...data }, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const filename = (document.getElementById('save-name-input').value.trim() || 'process') + '.json';
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        setStatus(`Exporterade ${data.components.length} komp och ${data.pipes.length} rör till ${filename}`);
    });

    // --- Ladda-modal ---
    function openLoadModal() {
        renderLoadSavesList();
        document.getElementById('load-modal').style.display = 'flex';
    }

    function closeLoadModal() {
        document.getElementById('load-modal').style.display = 'none';
    }

    function renderLoadSavesList() {
        const saves = getAllSaves();
        // Bakåtkompatibilitet: migrera gammalt enkelt sparformat
        const legacyRaw = localStorage.getItem('processBuilder_save');
        const names = Object.keys(saves).sort((a, b) => new Date(saves[b].savedAt) - new Date(saves[a].savedAt));
        const container = document.getElementById('load-saves-list');

        let html = '';
        if (names.length === 0 && !legacyRaw) {
            container.innerHTML = '<p class="save-empty-msg">Inga sparade processer än. Spara en process eller importera en JSON-fil.</p>';
            return;
        }

        // Gammalt enkelt format om det finns
        if (legacyRaw) {
            html += `<div class="save-slot" style="border-color:#f59e42;">
                <div class="save-slot-info">
                    <div class="save-slot-name">Senaste sparade (gammalt format)</div>
                    <div class="save-slot-meta">Importeras och konverteras till nytt format</div>
                </div>
                <div class="save-slot-actions">
                    <button class="modal-action-btn load-btn" id="btn-load-legacy">Ladda</button>
                </div>
            </div>`;
        }

        html += names.map(name => {
            const s = saves[name];
            const date = new Date(s.savedAt).toLocaleString('sv-SE', { dateStyle: 'short', timeStyle: 'short' });
            return `<div class="save-slot">
                <div class="save-slot-info">
                    <div class="save-slot-name">${name}</div>
                    <div class="save-slot-meta">${date} &middot; ${s.componentCount} komp &middot; ${s.pipeCount} rör</div>
                </div>
                <div class="save-slot-actions">
                    <button class="modal-action-btn load-btn load-named-btn" data-name="${encodeURIComponent(name)}">Ladda</button>
                    <button class="modal-action-btn delete-btn load-delete-btn" data-name="${encodeURIComponent(name)}" title="Ta bort">Ta bort</button>
                </div>
            </div>`;
        }).join('');

        container.innerHTML = html;

        // Legacy load
        const legacyBtn = document.getElementById('btn-load-legacy');
        if (legacyBtn) {
            legacyBtn.addEventListener('click', () => {
                try {
                    const data = JSON.parse(legacyRaw);
                    const result = restoreCanvas(data);
                    closeLoadModal();
                    setStatus(`Laddade legacy-process — ${result.compCount} komp, ${result.pipeCount} rör`);
                } catch (e) {
                    setStatus('Fel vid laddning av gammalt format');
                }
            });
        }

        container.querySelectorAll('.load-named-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const name = decodeURIComponent(btn.dataset.name);
                const saves = getAllSaves();
                if (!saves[name]) { setStatus(`"${name}" hittades inte`); return; }
                const result = restoreCanvas(saves[name].data);
                closeLoadModal();
                setStatus(`Laddade "${name}" — ${result.compCount} komp, ${result.pipeCount} rör`);
            });
        });

        container.querySelectorAll('.load-delete-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const name = decodeURIComponent(btn.dataset.name);
                if (!confirm(`Ta bort "${name}"?`)) return;
                const saves = getAllSaves();
                delete saves[name];
                localStorage.setItem(SAVES_KEY, JSON.stringify(saves));
                renderLoadSavesList();
                setStatus(`"${name}" borttagen`);
            });
        });
    }

    document.getElementById('btn-load').addEventListener('click', openLoadModal);
    document.getElementById('btn-close-load-modal').addEventListener('click', closeLoadModal);
    document.getElementById('load-modal').addEventListener('click', e => {
        if (e.target === document.getElementById('load-modal')) closeLoadModal();
    });

    // --- Importera JSON-fil ---
    document.getElementById('btn-import-json').addEventListener('click', () => {
        document.getElementById('import-json-input').click();
    });

    document.getElementById('import-json-input').addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = evt => {
            try {
                const data = JSON.parse(evt.target.result);
                const result = restoreCanvas(data);
                closeLoadModal();
                setStatus(`Importerade "${file.name}" — ${result.compCount} komp, ${result.pipeCount} rör`);
            } catch (err) {
                setStatus(`Fel vid import av ${file.name}: ${err.message}`);
            }
            e.target.value = ''; // återställ input för att kunna importera samma fil igen
        };
        reader.readAsText(file);
    });

    // --- Simulate button ---
    document.getElementById('btn-simulate').addEventListener('click', () => {
        if (emergencyStopActive) {
            setStatus('Nödstopp aktivt — återställ först');
            return;
        }
        simulationRunning = !simulationRunning;
        const btn = document.getElementById('btn-simulate');
        if (simulationRunning) {
            btn.classList.add('simulating');
            btn.innerHTML = '&#9724; Stoppa';
            startSimTick();
            setStatus('Simulering startad — dubbelklicka på komponenter för att slå på dem');
        } else {
            btn.classList.remove('simulating');
            btn.innerHTML = '&#9654; Simulera';
            stopSimTick();
            // Reset running glow on all components (keep running state for next start)
            for (const comp of placedComponents) {
                updateRunningVisual(comp);
            }
            setStatus('Simulering stoppad');
        }
        // Update particle visibility and colors based on running status
        updatePipeParticleVisibility();
        if (simulationRunning) updatePipeColors();
        // Refresh properties panel if a component is selected
        if (selectedPlacedComponent) showProperties(selectedPlacedComponent);
    });

    // === Fas 4b: Fault injection system ===
    function injectFault(faultDef, comp) {
        const fault = {
            id: faultNextId++,
            type: faultDef.type,
            componentId: comp.id,
            timestamp: performance.now()
        };

        switch (faultDef.type) {
            case 'pump_failure':
                comp.running = false;
                updateRunningVisual(comp);
                updatePipeParticleVisibility();
                break;
            case 'valve_stuck':
                // Lock valve to closed position
                if (comp.parameters.opening) {
                    comp.parameters.opening.value = 0;
                }
                comp.running = false;
                updateRunningVisual(comp);
                updatePipeParticleVisibility();
                break;
            case 'overheat':
                // Set extreme temperature
                if (comp.parameters.hotOut) {
                    comp.parameters.hotOut.value = 120;
                }
                if (simulationRunning) updatePipeColors();
                break;
        }

        activeFaults.push(fault);
        document.getElementById('viewport').classList.add('has-faults');

        // Update properties if this component is selected
        if (comp === selectedPlacedComponent) showProperties(comp);

        setStatus('⚠ FEL DETEKTERAT — en komponent har problem!');
    }

    function clearFault(faultId) {
        const idx = activeFaults.findIndex(f => f.id === faultId);
        if (idx < 0) return;
        const fault = activeFaults[idx];
        const comp = placedComponents.find(c => c.id === fault.componentId);

        activeFaults.splice(idx, 1);

        // Restore component visuals
        if (comp) {
            updateRunningVisual(comp);
            if (comp === selectedPlacedComponent) showProperties(comp);
        }

        if (activeFaults.length === 0) {
            document.getElementById('viewport').classList.remove('has-faults');
        }
    }

    function clearAllFaults() {
        for (const fault of [...activeFaults]) {
            clearFault(fault.id);
        }
        activeFaults.length = 0;
        faultNextId = 1;
        document.getElementById('viewport').classList.remove('has-faults');
    }

    function isComponentFaulted(comp) {
        return activeFaults.find(f => f.componentId === comp.id) || null;
    }

    function updateFaultVisuals(delta) {
        if (activeFaults.length === 0) return;
        const time = performance.now() * 0.004;
        const intensity = 0.3 + Math.sin(time) * 0.3;

        for (const fault of activeFaults) {
            const comp = placedComponents.find(c => c.id === fault.componentId);
            if (!comp) continue;
            // Don't override selection highlight
            if (comp === selectedPlacedComponent) continue;
            // Don't override sequence highlight
            if (comp === sequenceHighlightComp) continue;

            comp.mesh.traverse(child => {
                if (child.isMesh && !child.userData.isPortMarker) {
                    child.material.emissive = new THREE.Color(0xff8800);
                    child.material.emissiveIntensity = intensity;
                }
            });
        }
    }

    // === Fas 4: Nödstopp ===
    function activateEmergencyStop() {
        emergencyStopActive = true;

        // Stop simulation
        simulationRunning = false;
        stopSimTick();
        const simBtn = document.getElementById('btn-simulate');
        simBtn.classList.remove('simulating');
        simBtn.innerHTML = '&#9654; Simulera';

        // Turn off all components
        for (const comp of placedComponents) {
            comp.running = false;
            updateRunningVisual(comp);
        }
        updatePipeParticleVisibility();

        // Pause active sequence
        if (sequenceValidationInterval) {
            clearInterval(sequenceValidationInterval);
            sequenceValidationInterval = null;
        }

        // Visual alarm
        document.getElementById('btn-emergency').classList.add('alarm-active');
        document.getElementById('viewport').classList.add('alarm-active');
        document.getElementById('emergency-overlay').style.display = 'flex';

        if (selectedPlacedComponent) showProperties(selectedPlacedComponent);
        setStatus('NÖDSTOPP AKTIVERAT — all simulering stoppad');
    }

    function resetEmergencyStop() {
        emergencyStopActive = false;

        // Remove alarm visuals
        document.getElementById('btn-emergency').classList.remove('alarm-active');
        document.getElementById('viewport').classList.remove('alarm-active');
        document.getElementById('emergency-overlay').style.display = 'none';

        // Resume sequence validation if sequence was active
        if (activeSequence && !sequenceCompleted) {
            startSequenceValidation();
        }

        setStatus('Nödstopp återställt — simulering kan startas igen');
    }

    document.getElementById('btn-emergency').addEventListener('click', () => {
        if (emergencyStopActive) {
            resetEmergencyStop();
        } else if (simulationRunning) {
            activateEmergencyStop();
        } else {
            setStatus('Simuleringen är inte igång');
        }
    });

    document.getElementById('btn-emergency-reset').addEventListener('click', () => {
        resetEmergencyStop();
    });

    // === Fas 4: Uppstartssekvenser ===
    function findComponentByTypeIndex(type, index) {
        let count = 0;
        for (const comp of placedComponents) {
            if (comp.type === type) {
                if (count === index) return comp;
                count++;
            }
        }
        return null;
    }

    function openSequenceModal() {
        if (emergencyStopActive) {
            setStatus('Nödstopp aktivt — återställ först');
            return;
        }
        if (activeSequence && !sequenceCompleted) {
            setStatus('En sekvens pågår redan — avbryt den först (Esc)');
            return;
        }
        const list = document.getElementById('sequence-card-list');
        list.innerHTML = '';

        // Get types of placed components
        const placedTypes = placedComponents.map(c => c.type);

        for (const [key, seq] of Object.entries(STARTUP_SEQUENCES)) {
            const card = document.createElement('div');
            card.className = 'sequence-card';

            const missingTypes = seq.requiredTypes.filter(t => !placedTypes.includes(t));
            const available = missingTypes.length === 0;

            if (!available) card.classList.add('disabled');

            const missingNames = missingTypes.map(t => {
                const def = COMPONENT_DEFINITIONS[t];
                return def ? def.name : t;
            });

            card.innerHTML = `
                <div class="seq-card-icon">${seq.icon}</div>
                <div class="seq-card-name">${seq.name}</div>
                <div class="seq-card-desc">${seq.description}</div>
                <div class="seq-card-req ${!available ? 'missing' : ''}">${
                    available ? 'Alla komponenter tillgängliga' : 'Saknas: ' + missingNames.join(', ')
                }</div>
            `;

            if (available) {
                card.addEventListener('click', () => {
                    document.getElementById('sequence-modal').style.display = 'none';
                    startSequence(key);
                });
            }

            list.appendChild(card);
        }

        document.getElementById('sequence-modal').style.display = 'flex';
    }

    function startSequence(key) {
        const seq = STARTUP_SEQUENCES[key];
        if (!seq) return;

        activeSequence = seq;
        sequenceStepIndex = 0;
        sequenceCompleted = false;
        sequenceHighlightComp = null;

        document.getElementById('seq-panel-title').textContent = seq.name;
        document.getElementById('sequence-panel').style.display = 'block';

        updateSequenceUI();
        startSequenceValidation();
    }

    function cancelSequence() {
        if (sequenceValidationInterval) {
            clearInterval(sequenceValidationInterval);
            sequenceValidationInterval = null;
        }
        // Clear faults if it was a fault scenario
        if (activeSequence && activeSequence.isFaultScenario) {
            clearAllFaults();
        }
        clearHintTimer();
        activeSequence = null;
        sequenceStepIndex = 0;
        sequenceCompleted = false;
        sequenceHighlightComp = null;
        hintVisible = false;
        clearTargetButtonHighlight();
        document.getElementById('seq-hint-btn').style.display = 'none';
        document.getElementById('sequence-panel').style.display = 'none';
        setStatus('Sekvens avbruten');
    }

    function updateSequenceUI() {
        if (!activeSequence) return;
        const steps = activeSequence.steps;
        const total = steps.length;

        // Clear hint state
        clearHintTimer();
        const hintBtn = document.getElementById('seq-hint-btn');
        hintBtn.style.display = 'none';
        hintVisible = false;

        if (sequenceCompleted) {
            const prefix = activeSequence.isFaultScenario ? 'Scenario klart!' : 'Sekvens klar!';
            document.getElementById('seq-step-label').textContent = '';
            document.getElementById('seq-step-instruction').textContent = prefix;
            document.getElementById('seq-step-detail').textContent = 'Alla steg har slutförts framgångsrikt.';
            document.getElementById('seq-step-status').textContent = '';
            document.getElementById('seq-step-status').className = 'seq-step-status complete';
            document.getElementById('seq-progress-fill').style.width = '100%';
            clearTargetButtonHighlight();
            sequenceHighlightComp = null;
            return;
        }

        const step = steps[sequenceStepIndex];
        const progress = (sequenceStepIndex / total) * 100;
        document.getElementById('seq-progress-fill').style.width = progress + '%';
        document.getElementById('seq-step-label').textContent = `Steg ${sequenceStepIndex + 1} / ${total}`;
        document.getElementById('seq-step-instruction').textContent = step.instruction;
        document.getElementById('seq-step-detail').textContent = step.detail;
        document.getElementById('seq-step-status').textContent = 'Väntar...';
        document.getElementById('seq-step-status').className = 'seq-step-status waiting';

        // Highlight target button or component
        clearTargetButtonHighlight();
        if (step.targetButton) {
            highlightTargetButton(step.targetButton);
        }
        if (step.targetComponent) {
            sequenceHighlightComp = findComponentByTypeIndex(step.targetComponent.type, step.targetComponent.index);
        } else {
            sequenceHighlightComp = null;
        }

        // Start hint timer if step has a hint
        if (step.hint && activeSequence.isFaultScenario) {
            startHintTimer(step.hint);
        }
    }

    function startSequenceValidation() {
        if (sequenceValidationInterval) clearInterval(sequenceValidationInterval);
        sequenceValidationInterval = setInterval(() => {
            if (!activeSequence || sequenceCompleted || emergencyStopActive) return;
            const step = activeSequence.steps[sequenceStepIndex];
            if (validateStepAction(step.action)) {
                showSequenceStepSuccess();
            }
        }, 500);
    }

    function validateStepAction(action) {
        switch (action.type) {
            case 'start_simulation':
                return simulationRunning;

            case 'toggle_running': {
                const comp = findComponentByTypeIndex(action.componentType, action.componentIndex);
                return comp && comp.running;
            }

            case 'set_parameter': {
                const comp = findComponentByTypeIndex(action.componentType, action.componentIndex);
                if (!comp || !comp.parameters[action.param]) return false;
                const val = comp.parameters[action.param].value;
                return checkCondition(val, action.condition, action.value);
            }

            case 'check_parameter': {
                const comp = findComponentByTypeIndex(action.componentType, action.componentIndex);
                if (!comp || !comp.parameters[action.param]) return false;
                const val = comp.parameters[action.param].value;
                return checkCondition(val, action.condition, action.value);
            }

            case 'verify_flow': {
                // At least one pipe must be flowing
                return pipes.some(p => isPipeFlowing(p));
            }

            case 'identify_fault': {
                // User must select (click on) a faulted component matching faultType
                if (!selectedPlacedComponent) return false;
                const fault = isComponentFaulted(selectedPlacedComponent);
                return fault && fault.type === action.faultType;
            }

            case 'stop_component': {
                const comp = findComponentByTypeIndex(action.componentType, action.componentIndex);
                return comp && !comp.running;
            }

            case 'emergency_stop': {
                return emergencyStopActive;
            }

            case 'reset_emergency': {
                return !emergencyStopActive;
            }

            case 'clear_fault': {
                // Check that specific fault type has been cleared
                return !activeFaults.some(f => f.type === action.faultType);
            }

            default:
                return false;
        }
    }

    function checkCondition(actual, condition, expected) {
        switch (condition) {
            case 'gt':  return actual > expected;
            case 'gte': return actual >= expected;
            case 'lt':  return actual < expected;
            case 'lte': return actual <= expected;
            case 'eq':  return actual === expected;
            default: return false;
        }
    }

    function showSequenceStepSuccess() {
        const statusEl = document.getElementById('seq-step-status');
        statusEl.textContent = 'Korrekt!';
        statusEl.className = 'seq-step-status success';
        clearTargetButtonHighlight();
        sequenceHighlightComp = null;

        // Auto-clear faults after emergency reset in fault scenarios
        if (activeSequence && activeSequence.isFaultScenario) {
            const step = activeSequence.steps[sequenceStepIndex];
            if (step && step.action.type === 'reset_emergency') {
                clearAllFaults();
            }
        }

        setTimeout(() => {
            advanceSequenceStep();
        }, 800);
    }

    function advanceSequenceStep() {
        if (!activeSequence) return;
        const prevStepIndex = sequenceStepIndex;
        sequenceStepIndex++;

        if (sequenceStepIndex >= activeSequence.steps.length) {
            sequenceCompleted = true;
            if (sequenceValidationInterval) {
                clearInterval(sequenceValidationInterval);
                sequenceValidationInterval = null;
            }
            // Clear faults on scenario completion
            if (activeSequence.isFaultScenario) {
                clearAllFaults();
            }
        }

        // Inject faults if this is a fault scenario
        if (activeSequence.isFaultScenario && activeSequence.faults) {
            for (const faultDef of activeSequence.faults) {
                if (faultDef.delay === prevStepIndex + 1) {
                    // The just-completed step index+1 matches delay → inject
                    const comp = findComponentByTypeIndex(faultDef.componentType, faultDef.componentIndex);
                    if (comp) {
                        injectFault(faultDef, comp);
                    }
                }
            }
        }

        updateSequenceUI();
    }

    function highlightTargetButton(btnId) {
        clearTargetButtonHighlight();
        const btn = document.getElementById(btnId);
        if (btn) btn.classList.add('seq-target-btn');
    }

    function clearTargetButtonHighlight() {
        const highlighted = document.querySelectorAll('.seq-target-btn');
        highlighted.forEach(el => el.classList.remove('seq-target-btn'));
    }

    function updateSequenceHighlight(delta) {
        if (!sequenceHighlightComp) return;
        const comp = sequenceHighlightComp;
        const time = performance.now() * 0.003;
        const intensity = 0.3 + Math.sin(time) * 0.3;
        comp.mesh.traverse(child => {
            if (child.isMesh && !child.userData.isPortMarker) {
                child.material.emissive = new THREE.Color(0xe94560);
                child.material.emissiveIntensity = intensity;
            }
        });
    }

    // Sequence button & modal events
    document.getElementById('btn-sequences').addEventListener('click', openSequenceModal);
    document.getElementById('btn-close-seq-modal').addEventListener('click', () => {
        document.getElementById('sequence-modal').style.display = 'none';
    });
    document.getElementById('btn-cancel-sequence').addEventListener('click', cancelSequence);

    // Close modal on backdrop click
    document.getElementById('sequence-modal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('sequence-modal')) {
            document.getElementById('sequence-modal').style.display = 'none';
        }
    });

    // === Fas 4b: Hint timer ===
    function startHintTimer(hintText) {
        clearHintTimer();
        const hintBtn = document.getElementById('seq-hint-btn');
        hintBtn.style.display = 'none';
        hintVisible = false;

        hintTimer = setTimeout(() => {
            hintBtn.style.display = 'block';
            hintBtn.onclick = () => {
                document.getElementById('seq-step-detail').textContent = hintText;
                hintBtn.style.display = 'none';
                hintVisible = true;
            };
        }, 10000); // Show hint button after 10 seconds
    }

    function clearHintTimer() {
        if (hintTimer) {
            clearTimeout(hintTimer);
            hintTimer = null;
        }
    }

    document.getElementById('seq-hint-btn').addEventListener('click', () => {});

    // === Fas 4b: Fault modal & scenario start ===
    function openFaultModal() {
        if (emergencyStopActive) {
            setStatus('Nödstopp aktivt — återställ först');
            return;
        }
        if (activeSequence && !sequenceCompleted) {
            setStatus('En sekvens pågår redan — avbryt den först (Esc)');
            return;
        }

        const list = document.getElementById('fault-card-list');
        list.innerHTML = '';

        const placedTypes = placedComponents.map(c => c.type);
        const hasPipes = pipes.length > 0;

        for (const [key, scenario] of Object.entries(FAULT_SCENARIOS)) {
            const card = document.createElement('div');
            card.className = 'fault-card';

            const missingTypes = scenario.requiredTypes.filter(t => !placedTypes.includes(t));
            const needsPipes = scenario.requiresPipes && !hasPipes;
            const available = missingTypes.length === 0 && !needsPipes;

            if (!available) card.classList.add('disabled');

            const missingNames = missingTypes.map(t => {
                const def = COMPONENT_DEFINITIONS[t];
                return def ? def.name : t;
            });

            let reqText = 'Alla krav uppfyllda';
            if (missingTypes.length > 0) {
                reqText = 'Saknas: ' + missingNames.join(', ');
            } else if (needsPipes) {
                reqText = 'Saknas: kopplingar (rör) mellan komponenter';
            }

            const diffClass = scenario.difficulty === 'Enkel' ? 'easy' : scenario.difficulty === 'Medel' ? 'medium' : 'hard';

            card.innerHTML = `
                <div class="fault-card-header">
                    <span class="fault-card-icon">${scenario.icon}</span>
                    <span class="fault-card-name">${scenario.name}</span>
                    <span class="fault-badge ${diffClass}">${scenario.difficulty}</span>
                </div>
                <div class="fault-card-desc">${scenario.description}</div>
                <div class="fault-card-req ${!available ? 'missing' : ''}">${reqText}</div>
            `;

            if (available) {
                card.addEventListener('click', () => {
                    document.getElementById('fault-modal').style.display = 'none';
                    startFaultScenario(key);
                });
            }

            list.appendChild(card);
        }

        document.getElementById('fault-modal').style.display = 'flex';
    }

    function startFaultScenario(key) {
        const scenario = FAULT_SCENARIOS[key];
        if (!scenario) return;

        // Clear any existing faults
        clearAllFaults();

        // Build sequence-compatible object
        activeSequence = {
            ...scenario,
            isFaultScenario: true
        };
        sequenceStepIndex = 0;
        sequenceCompleted = false;
        sequenceHighlightComp = null;

        document.getElementById('seq-panel-title').textContent = 'FELSÖKNING: ' + scenario.name;
        document.getElementById('sequence-panel').style.display = 'block';

        updateSequenceUI();
        startSequenceValidation();
    }

    // Fault button & modal events
    document.getElementById('btn-faults').addEventListener('click', openFaultModal);
    document.getElementById('btn-close-fault-modal').addEventListener('click', () => {
        document.getElementById('fault-modal').style.display = 'none';
    });
    document.getElementById('fault-modal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('fault-modal')) {
            document.getElementById('fault-modal').style.display = 'none';
        }
    });

    // === Fas 4c: P&ID Export ===
    document.getElementById('btn-export-pid').addEventListener('click', () => {
        if (placedComponents.length === 0) {
            setStatus('Placera komponenter först för att exportera P&ID');
            return;
        }

        // Collect component data
        const compData = placedComponents.map(c => ({
            id: c.id,
            type: c.type,
            x: c.mesh.position.x,
            z: c.mesh.position.z,
            rotation: c.rotation || 0,
            name: c.definition.name,
            parameters: c.parameters
        }));

        // Collect pipe data with sampled curve points (projected to 2D: x, z)
        const pipeData = pipes.map(p => {
            let points = null;
            if (p.curve) {
                const pts3d = p.curve.getPoints(20);
                points = pts3d.map(pt => [pt.x, pt.z]);
            }
            return {
                fromId: p.from.componentId,
                fromPort: p.from.portName,
                toId: p.to.componentId,
                toPort: p.to.portName,
                points
            };
        });

        const svg = PIDExport.generate({ components: compData, pipes: pipeData });
        if (svg) {
            PIDExport.download(svg);
            setStatus(`P&ID exporterat — ${compData.length} komponenter, ${pipeData.length} rör`);
        }
    });

    // --- Init library ---
    ComponentLibrary.init();
    ComponentLibrary.onSelect((type) => {
        if (type) {
            const def = COMPONENT_DEFINITIONS[type];
            createGhost(type);
            setStatus(`${def.name} vald - Flytta musen över gridet och klicka för att placera (Esc = avbryt)`);
        } else {
            removeGhost();
            setStatus('Klicka på en komponent i biblioteket och sedan i 3D-vyn för att placera');
        }
    });

    // --- Animation loop ---
    function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();

        // Animate flow particles when simulation is running
        if (simulationRunning) {
            for (const pipe of pipes) {
                if (!isPipeFlowing(pipe)) continue;
                const speedMultiplier = Math.max(0.05, Math.min(3.0, pipe.computedFlow / 100));
                const speed = FLOW_SPEED * speedMultiplier;
                for (const p of pipe.particles) {
                    let t = p.userData.flowT + speed * delta;
                    if (t > 1) t -= 1;
                    p.userData.flowT = t;
                    const pos = pipe.curve.getPointAt(t);
                    p.position.copy(pos);
                }
            }
        }

        // Sequence component highlight
        updateSequenceHighlight(delta);

        // Fault component visuals
        updateFaultVisuals(delta);

        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    updateUndoRedoButtons();
    setStatus('Redo! Välj en komponent från biblioteket till vänster');
})();
