/**
 * pid-export.js - Export processbygge som P&ID-diagram i SVG-format
 * Genererar standardiserade P&ID-symboler, rörledningar och etiketter.
 */

const PIDExport = (() => {
    const SCALE = 100; // pixels per grid unit
    const MARGIN = 120;
    const SYMBOL_SIZE = 60;
    const HALF = SYMBOL_SIZE / 2;

    // P&ID naming prefixes per component key
    const ID_PREFIX = {
        centrifugal_pump: 'P',
        positive_displacement_pump: 'P',
        compressor: 'C',
        gate_valve: 'V',
        control_valve: 'V',
        check_valve: 'V',
        globe_valve: 'V',
        storage_tank: 'T',
        reactor: 'R',
        distillation_column: 'K',
        heat_exchanger: 'E'
    };

    // --- P&ID Symbol generators ---
    // Each returns SVG markup (string) for a <g> element centered at (0,0), ~60x60

    const symbols = {
        centrifugal_pump() {
            // Circle with triangle (ISO pump symbol)
            return `
                <circle cx="0" cy="0" r="${HALF}" fill="none" stroke="#000" stroke-width="2"/>
                <polygon points="-12,-18 -12,18 20,0" fill="none" stroke="#000" stroke-width="2"/>
            `;
        },

        compressor() {
            // Circle with "C" inside
            return `
                <circle cx="0" cy="0" r="${HALF}" fill="none" stroke="#000" stroke-width="2"/>
                <text x="0" y="6" text-anchor="middle" font-size="22" font-weight="bold" font-family="sans-serif" fill="#000">C</text>
            `;
        },

        positive_displacement_pump() {
            // Circle with triangle + vertical line (ISO positive displacement pump)
            return `
                <circle cx="0" cy="0" r="${HALF}" fill="none" stroke="#000" stroke-width="2"/>
                <polygon points="-12,-18 -12,18 20,0" fill="none" stroke="#000" stroke-width="2"/>
                <line x1="20" y1="-18" x2="20" y2="18" stroke="#000" stroke-width="2"/>
            `;
        },

        gate_valve() {
            // Bowtie - two triangles meeting
            return `
                <polygon points="-${HALF},${HALF} -${HALF},-${HALF} 0,0" fill="none" stroke="#000" stroke-width="2"/>
                <polygon points="${HALF},${HALF} ${HALF},-${HALF} 0,0" fill="none" stroke="#000" stroke-width="2"/>
                <line x1="0" y1="0" x2="0" y2="-${HALF + 10}" stroke="#000" stroke-width="2"/>
            `;
        },

        control_valve() {
            // Bowtie + actuator rectangle on top
            return `
                <polygon points="-${HALF},${HALF} -${HALF},-${HALF} 0,0" fill="none" stroke="#000" stroke-width="2"/>
                <polygon points="${HALF},${HALF} ${HALF},-${HALF} 0,0" fill="none" stroke="#000" stroke-width="2"/>
                <line x1="0" y1="0" x2="0" y2="-${HALF + 8}" stroke="#000" stroke-width="2"/>
                <rect x="-14" y="-${HALF + 28}" width="28" height="20" fill="none" stroke="#000" stroke-width="2"/>
            `;
        },

        check_valve() {
            // Bowtie + filled arrow for flow direction
            return `
                <polygon points="-${HALF},${HALF} -${HALF},-${HALF} 0,0" fill="none" stroke="#000" stroke-width="2"/>
                <polygon points="${HALF},${HALF} ${HALF},-${HALF} 0,0" fill="none" stroke="#000" stroke-width="2"/>
                <polygon points="4,-10 4,10 18,0" fill="#000"/>
            `;
        },

        globe_valve() {
            // Bowtie + globe circle on stem (ISO globe valve symbol)
            return `
                <polygon points="-${HALF},${HALF} -${HALF},-${HALF} 0,0" fill="none" stroke="#000" stroke-width="2"/>
                <polygon points="${HALF},${HALF} ${HALF},-${HALF} 0,0" fill="none" stroke="#000" stroke-width="2"/>
                <line x1="0" y1="0" x2="0" y2="-${HALF + 10}" stroke="#000" stroke-width="2"/>
                <circle cx="0" cy="-${HALF + 10}" r="6" fill="none" stroke="#000" stroke-width="2"/>
            `;
        },

        storage_tank() {
            // Rectangle with open top
            const w = SYMBOL_SIZE;
            const h = SYMBOL_SIZE * 1.2;
            return `
                <rect x="-${w / 2}" y="-${h / 2}" width="${w}" height="${h}" fill="none" stroke="#000" stroke-width="2"/>
                <line x1="-${w / 2}" y1="-${h / 2}" x2="-${w / 2 + 6}" y2="-${h / 2 - 6}" stroke="#000" stroke-width="1.5"/>
                <line x1="${w / 2}" y1="-${h / 2}" x2="${w / 2 - 6}" y2="-${h / 2 - 6}" stroke="#000" stroke-width="1.5"/>
            `;
        },

        distillation_column() {
            // Tall rectangle with tray lines + "DIST" label
            const w = SYMBOL_SIZE * 0.7;
            const h = SYMBOL_SIZE * 1.8;
            return `
                <rect x="-${w / 2}" y="-${h / 2}" width="${w}" height="${h}" fill="none" stroke="#000" stroke-width="2" rx="4"/>
                <line x1="-${w / 2 - 2}" y1="-${h * 0.2}" x2="${w / 2 - 2}" y2="-${h * 0.2}" stroke="#000" stroke-width="1" stroke-dasharray="4,2"/>
                <line x1="-${w / 2 - 2}" y1="0" x2="${w / 2 - 2}" y2="0" stroke="#000" stroke-width="1" stroke-dasharray="4,2"/>
                <line x1="-${w / 2 - 2}" y1="${h * 0.2}" x2="${w / 2 - 2}" y2="${h * 0.2}" stroke="#000" stroke-width="1" stroke-dasharray="4,2"/>
                <text x="0" y="${h / 2 - 8}" text-anchor="middle" font-size="9" font-weight="bold" font-family="sans-serif" fill="#000">DIST</text>
            `;
        },

        reactor() {
            // Rectangle with agitator (M symbol on top)
            const w = SYMBOL_SIZE;
            const h = SYMBOL_SIZE * 1.2;
            return `
                <rect x="-${w / 2}" y="-${h / 2}" width="${w}" height="${h}" fill="none" stroke="#000" stroke-width="2"/>
                <line x1="0" y1="-${h / 2}" x2="0" y2="-${h / 2 + 20}" stroke="#000" stroke-width="2"/>
                <text x="0" y="-${h / 2 + 32}" text-anchor="middle" font-size="14" font-weight="bold" font-family="sans-serif">M</text>
                <line x1="-10" y1="${h / 2 - 16}" x2="10" y2="${h / 2 - 16}" stroke="#000" stroke-width="1.5"/>
                <line x1="-6" y1="${h / 2 - 10}" x2="6" y2="${h / 2 - 10}" stroke="#000" stroke-width="1.5"/>
            `;
        },

        heat_exchanger() {
            // Circle with S-curve inside
            return `
                <circle cx="0" cy="0" r="${HALF}" fill="none" stroke="#000" stroke-width="2"/>
                <path d="M -18,-15 C -5,-15 5,15 18,15" fill="none" stroke="#000" stroke-width="2"/>
                <path d="M -18,15 C -5,15 5,-15 18,-15" fill="none" stroke="#000" stroke-width="1.5" stroke-dasharray="4,3"/>
            `;
        }
    };

    // Port positions in SVG coords relative to symbol center, per component type
    // These map to the 3D port positions projected onto 2D
    const portPositions = {
        centrifugal_pump: {
            inlet:  { dx: -HALF, dy: 0 },
            outlet: { dx: HALF, dy: 0 }
        },
        positive_displacement_pump: {
            inlet:  { dx: -HALF, dy: 0 },
            outlet: { dx: HALF, dy: 0 }
        },
        compressor: {
            inlet:  { dx: -HALF, dy: 0 },
            outlet: { dx: HALF, dy: 0 }
        },
        gate_valve: {
            inlet:  { dx: -HALF, dy: 0 },
            outlet: { dx: HALF, dy: 0 }
        },
        control_valve: {
            inlet:  { dx: -HALF, dy: 0 },
            outlet: { dx: HALF, dy: 0 }
        },
        check_valve: {
            inlet:  { dx: -HALF, dy: 0 },
            outlet: { dx: HALF, dy: 0 }
        },
        globe_valve: {
            inlet:  { dx: -HALF, dy: 0 },
            outlet: { dx: HALF, dy: 0 }
        },
        storage_tank: {
            inlet:  { dx: 0, dy: -SYMBOL_SIZE * 0.6 },
            outlet: { dx: HALF, dy: SYMBOL_SIZE * 0.4 }
        },
        reactor: {
            inlet:  { dx: 0, dy: -SYMBOL_SIZE * 0.6 },
            outlet: { dx: HALF, dy: SYMBOL_SIZE * 0.1 }
        },
        distillation_column: {
            feed_in:    { dx: HALF, dy: 0 },
            top_out:    { dx: 0, dy: -SYMBOL_SIZE * 0.9 },
            bottom_out: { dx: HALF, dy: SYMBOL_SIZE * 0.6 }
        },
        heat_exchanger: {
            shell_in:  { dx: -HALF, dy: -8 },
            shell_out: { dx: HALF, dy: 8 },
            tube_in:   { dx: -HALF, dy: 8 },
            tube_out:  { dx: HALF, dy: -8 }
        }
    };

    function rotatePoint(dx, dy, angleDeg) {
        const rad = -angleDeg * Math.PI / 180;
        return {
            dx: dx * Math.cos(rad) - dy * Math.sin(rad),
            dy: dx * Math.sin(rad) + dy * Math.cos(rad)
        };
    }

    function getPortSvgPosition(comp, portName, svgX, svgY) {
        const ports = portPositions[comp.type];
        if (!ports || !ports[portName]) return { x: svgX, y: svgY };
        const { dx, dy } = ports[portName];
        const rotated = rotatePoint(dx, dy, comp.rotation || 0);
        return { x: svgX + rotated.dx, y: svgY + rotated.dy };
    }

    function formatParams(comp) {
        const params = comp.parameters;
        if (!params) return '';
        const lines = [];
        for (const [key, param] of Object.entries(params)) {
            lines.push(`${param.label}: ${param.value} ${param.unit}`);
        }
        return lines;
    }

    function escapeXml(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // --- Main generation function ---
    function generate(data) {
        const { components, pipes } = data;

        if (!components || components.length === 0) return null;

        // Calculate bounding box from component positions
        let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
        for (const c of components) {
            if (c.x < minX) minX = c.x;
            if (c.x > maxX) maxX = c.x;
            if (c.z < minZ) minZ = c.z;
            if (c.z > maxZ) maxZ = c.z;
        }

        // SVG dimensions
        const svgW = (maxX - minX) * SCALE + MARGIN * 2 + SYMBOL_SIZE * 2;
        const svgH = (maxZ - minZ) * SCALE + MARGIN * 2 + SYMBOL_SIZE * 2;
        const offsetX = -minX * SCALE + MARGIN + SYMBOL_SIZE;
        const offsetZ = -minZ * SCALE + MARGIN + SYMBOL_SIZE;

        // Track naming counters per type prefix
        const nameCounts = {};
        const compIdToLabel = {};
        const compIdToSvgPos = {};

        let svgContent = '';

        // Arrow marker definition for flow direction
        const defs = `
        <defs>
            <marker id="flow-arrow" markerWidth="8" markerHeight="6" refX="4" refY="3" orient="auto">
                <polygon points="0,0 8,3 0,6" fill="#333"/>
            </marker>
        </defs>`;

        // Background
        svgContent += `<rect width="100%" height="100%" fill="white"/>`;

        // Border
        svgContent += `<rect x="10" y="10" width="${svgW - 20}" height="${svgH - 20}" fill="none" stroke="#333" stroke-width="2"/>`;

        // --- Draw components ---
        for (const comp of components) {
            const svgX = comp.x * SCALE + offsetX;
            const svgY = comp.z * SCALE + offsetZ;
            compIdToSvgPos[comp.id] = { x: svgX, y: svgY };

            const prefix = ID_PREFIX[comp.type] || '?';
            if (!nameCounts[prefix]) nameCounts[prefix] = 0;
            nameCounts[prefix]++;
            const label = `${prefix}-${nameCounts[prefix]}`;
            compIdToLabel[comp.id] = label;

            const symbolFn = symbols[comp.type];
            const rotation = comp.rotation || 0;

            svgContent += `<g transform="translate(${svgX}, ${svgY})">`;

            // Symbol with rotation
            svgContent += `<g transform="rotate(${rotation})">`;
            if (symbolFn) {
                svgContent += symbolFn();
            } else {
                svgContent += `<rect x="-20" y="-20" width="40" height="40" fill="none" stroke="#000" stroke-width="2"/>`;
            }
            svgContent += `</g>`;

            // Label above symbol
            svgContent += `<text x="0" y="-${HALF + 18}" text-anchor="middle" font-size="13" font-weight="bold" font-family="sans-serif" fill="#000">${escapeXml(label)}</text>`;

            // Component name below label
            svgContent += `<text x="0" y="-${HALF + 6}" text-anchor="middle" font-size="10" font-family="sans-serif" fill="#555">${escapeXml(comp.name || '')}</text>`;

            // Parameters below symbol
            const params = formatParams(comp);
            for (let i = 0; i < params.length; i++) {
                svgContent += `<text x="0" y="${HALF + 16 + i * 13}" text-anchor="middle" font-size="9" font-family="sans-serif" fill="#666">${escapeXml(params[i])}</text>`;
            }

            // Port indicators (small circles)
            const ports = portPositions[comp.type];
            if (ports) {
                for (const [portName, portDef] of Object.entries(ports)) {
                    const rotPos = rotatePoint(portDef.dx, portDef.dy, rotation);
                    svgContent += `<circle cx="${rotPos.dx}" cy="${rotPos.dy}" r="4" fill="#fff" stroke="#000" stroke-width="1.5"/>`;
                }
            }

            svgContent += `</g>`;
        }

        // --- Draw pipes ---
        for (const pipe of pipes) {
            const fromComp = components.find(c => c.id === pipe.fromId);
            const toComp = components.find(c => c.id === pipe.toId);
            if (!fromComp || !toComp) continue;

            const fromSvg = compIdToSvgPos[pipe.fromId];
            const toSvg = compIdToSvgPos[pipe.toId];
            if (!fromSvg || !toSvg) continue;

            if (pipe.points && pipe.points.length >= 2) {
                // Use sampled curve points
                const pathParts = [];
                for (let i = 0; i < pipe.points.length; i++) {
                    const px = pipe.points[i][0] * SCALE + offsetX;
                    const py = pipe.points[i][1] * SCALE + offsetZ;
                    pathParts.push(i === 0 ? `M ${px} ${py}` : `L ${px} ${py}`);
                }
                svgContent += `<path d="${pathParts.join(' ')}" fill="none" stroke="#000" stroke-width="2" marker-mid="url(#flow-arrow)"/>`;
            } else {
                // Fallback: direct line between ports
                const fromPort = getPortSvgPosition(fromComp, pipe.fromPort, fromSvg.x, fromSvg.y);
                const toPort = getPortSvgPosition(toComp, pipe.toPort, toSvg.x, toSvg.y);
                svgContent += `<line x1="${fromPort.x}" y1="${fromPort.y}" x2="${toPort.x}" y2="${toPort.y}" stroke="#000" stroke-width="2" marker-mid="url(#flow-arrow)"/>`;
            }

            // Flow direction arrow at midpoint
            if (pipe.points && pipe.points.length >= 2) {
                const midIdx = Math.floor(pipe.points.length / 2);
                const mx = pipe.points[midIdx][0] * SCALE + offsetX;
                const my = pipe.points[midIdx][1] * SCALE + offsetZ;
                // Calculate direction from midIdx-1 to midIdx+1
                const prevIdx = Math.max(0, midIdx - 1);
                const nextIdx = Math.min(pipe.points.length - 1, midIdx + 1);
                const dx = pipe.points[nextIdx][0] - pipe.points[prevIdx][0];
                const dy = pipe.points[nextIdx][1] - pipe.points[prevIdx][1];
                const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                svgContent += `<g transform="translate(${mx}, ${my}) rotate(${angle})">`;
                svgContent += `<polygon points="-6,-5 6,0 -6,5" fill="#333"/>`;
                svgContent += `</g>`;
            }
        }

        // --- Title block (bottom-right) ---
        const tbW = 220;
        const tbH = 50;
        const tbX = svgW - tbW - 15;
        const tbY = svgH - tbH - 15;
        svgContent += `
            <rect x="${tbX}" y="${tbY}" width="${tbW}" height="${tbH}" fill="#f5f5f5" stroke="#333" stroke-width="1.5"/>
            <line x1="${tbX}" y1="${tbY + 20}" x2="${tbX + tbW}" y2="${tbY + 20}" stroke="#333" stroke-width="0.5"/>
            <text x="${tbX + tbW / 2}" y="${tbY + 14}" text-anchor="middle" font-size="11" font-weight="bold" font-family="sans-serif" fill="#000">Process Builder 3D</text>
            <text x="${tbX + tbW / 2}" y="${tbY + 34}" text-anchor="middle" font-size="9" font-family="sans-serif" fill="#555">P&amp;ID Export - ${new Date().toLocaleDateString('sv-SE')}</text>
            <text x="${tbX + tbW / 2}" y="${tbY + 45}" text-anchor="middle" font-size="8" font-family="sans-serif" fill="#888">${components.length} komponenter, ${pipes.length} rör</text>
        `;

        // Assemble full SVG
        const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">
${defs}
${svgContent}
</svg>`;

        return svg;
    }

    // --- Download SVG ---
    function download(svgString, filename) {
        filename = filename || 'process-pid.svg';
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    return { generate, download };
})();

window.PIDExport = PIDExport;
