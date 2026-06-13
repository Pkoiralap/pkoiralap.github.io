(function() {
    const d3Url = "https://d3js.org/d3.v7.min.js";

    function initGraph() {
        const container = document.getElementById("d3-architecture-canvas");
        if (!container) { return; }

        container.innerHTML = "";

        const width  = container.clientWidth || 900;
        const height = Math.max(container.clientHeight || 750, 750);

        const svg = d3.select("#d3-architecture-canvas")
            .append("svg")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet");

        // Floating tooltip div
        let tooltip = d3.select("#d3-architecture-canvas").select(".d3-tooltip");
        if (tooltip.empty()) {
            tooltip = d3.select("#d3-architecture-canvas")
                .append("div")
                .attr("class", "d3-tooltip");
        }

        // Arrow markers — same three variants as portfolio site
        svg.append("defs").selectAll("marker")
            .data([
                { id: "arrow",             color: "#6d5f50" },
                { id: "arrow-highlighted", color: "#8c4327" },
                { id: "arrow-dimmed",      color: "#e5dec9" }
            ])
            .enter().append("marker")
            .attr("id",           d => d.id)
            .attr("viewBox",      "0 -5 10 10")
            .attr("refX",         5)
            .attr("refY",         0)
            .attr("markerWidth",  5)
            .attr("markerHeight", 5)
            .attr("orient",       "auto")
            .append("path")
            .attr("d",    "M0,-5L10,0L0,5")
            .attr("fill", d => d.color);

        // ── Node data ─────────────────────────────────────────────────────────
        function estimateWidth(label, minW) {
            return Math.max(minW, label.length * 8.5 + 28);
        }

        const nodes = [
            {
                id: "main.cpp",
                label: "src/main.cpp",
                group: "entry",
                type: "Entry Point",
                color: "#8c4327",
                desc: "Main simulation loop. Initialises SDL window, owns the render loop, and coordinates all subsystems each frame.",
                w: estimateWidth("src/main.cpp", 180),
                h: 56
            },
            {
                id: "Object.cpp",
                label: "src/Object.cpp",
                group: "graphics",
                type: "3D Model Loader",
                color: "#354e56",
                desc: "Loads .obj mesh files. Maintains vertex and surface buffers, computes per-vertex averaged normals for Gouraud shading, and drives per-object rendering.",
                w: estimateWidth("src/Object.cpp", 160),
                h: 40
            },
            {
                id: "Fire.cpp",
                label: "src/Fire.cpp",
                group: "simulation",
                type: "Particle Engine",
                color: "#d15a2e",
                desc: "Manages thousands of fire particles: birth, buoyancy, sinusoidal flicker, intensity decay, and recycling. Also acts as a dynamic light source sampled by Object.",
                w: estimateWidth("src/Fire.cpp", 160),
                h: 40
            },
            {
                id: "Transformation.cpp",
                label: "src/Transformation.cpp",
                group: "math",
                type: "3D Projection",
                color: "#4b5e40",
                desc: "Constructs World-to-Camera matrix from N/U/V basis vectors. Performs perspective projection (divide by –z) to map 3D points onto 2D screen pixels.",
                w: estimateWidth("src/Transformation.cpp", 200),
                h: 40
            },
            {
                id: "Graphics.cpp",
                label: "src/Graphics.cpp",
                group: "graphics",
                type: "Software Renderer",
                color: "#354e56",
                desc: "Owns the Z-buffer (depth test per pixel), scanline rasterizer with linear intensity interpolation, and writes directly into the SDL pixel surface.",
                w: estimateWidth("src/Graphics.cpp", 175),
                h: 40
            },
            {
                id: "MatVec.cpp",
                label: "src/MatVec.cpp",
                group: "math",
                type: "Linear Algebra",
                color: "#4b5e40",
                desc: "Custom Vec3/Vec4 and Matrix4x4 types. Provides dot/cross products, normalisation, and matrix multiplication used by every other module.",
                w: estimateWidth("src/MatVec.cpp", 160),
                h: 40
            },
            {
                id: "SDL",
                label: "SDL (external)",
                group: "external",
                type: "Hardware Abstraction",
                color: "#5c554c",
                desc: "Third-party library. Provides cross-platform window creation, event polling, and a raw pixel buffer for the software renderer to write into.",
                w: estimateWidth("SDL (external)", 160),
                h: 40
            },
            {
                id: "Object.h",
                label: "include/Object.h",
                group: "header",
                type: "Header",
                color: "#ac7a60",
                desc: "Declares Object3d class: vertex/face buffers, normal data, and the render() interface consumed by main.cpp.",
                w: estimateWidth("include/Object.h", 160),
                h: 40
            },
            {
                id: "Fire.h",
                label: "include/Fire.h",
                group: "header",
                type: "Header",
                color: "#ac7a60",
                desc: "Declares FireSystem: particle struct layout and the public update()/render() API.",
                w: estimateWidth("include/Fire.h", 150),
                h: 40
            },
            {
                id: "Graphics.h",
                label: "include/Graphics.h",
                group: "header",
                type: "Header",
                color: "#ac7a60",
                desc: "Declares Graphics class: Z-buffer array, setPixel, drawSpan, and the SDL surface pointer.",
                w: estimateWidth("include/Graphics.h", 165),
                h: 40
            },
            {
                id: "MatVec.h",
                label: "include/MatVec.h",
                group: "header",
                type: "Header",
                color: "#ac7a60",
                desc: "Declares Vec3, Vec4, Matrix4x4 structs and all inline operator overloads.",
                w: estimateWidth("include/MatVec.h", 160),
                h: 40
            },
            {
                id: "Transformation.h",
                label: "include/Transformation.h",
                group: "header",
                type: "Header",
                color: "#ac7a60",
                desc: "Declares Transformation class: buildWtoC(), project() and helper camera-math functions.",
                w: estimateWidth("include/Transformation.h", 200),
                h: 40
            },
            {
                id: "make.sh",
                label: "make.sh",
                group: "build",
                type: "Build Script",
                color: "#a88a6d",
                desc: "Shell script that compiles all .cpp translation units with g++ and links against SDL to produce the final exefile binary.",
                w: estimateWidth("make.sh", 140),
                h: 40
            }
        ];

        // ── Edge data ─────────────────────────────────────────────────────────
        const links = [
            // Build system
            { source: "make.sh",            target: "main.cpp",           label: "Compiles & Links" },

            // main.cpp includes all implementation headers
            { source: "main.cpp",           target: "Object.h",           label: "#include" },
            { source: "main.cpp",           target: "Fire.h",             label: "#include" },
            { source: "main.cpp",           target: "Graphics.h",         label: "#include" },
            { source: "main.cpp",           target: "MatVec.h",           label: "#include" },
            { source: "main.cpp",           target: "Transformation.h",   label: "#include" },

            // Headers backed by implementations
            { source: "Object.h",           target: "Object.cpp",         label: "Implemented by" },
            { source: "Fire.h",             target: "Fire.cpp",           label: "Implemented by" },
            { source: "Graphics.h",         target: "Graphics.cpp",       label: "Implemented by" },
            { source: "MatVec.h",           target: "MatVec.cpp",         label: "Implemented by" },
            { source: "Transformation.h",   target: "Transformation.cpp", label: "Implemented by" },

            // Runtime data-flow between implementations
            { source: "Object.cpp",         target: "Graphics.cpp",       label: "Calls drawSpan / setPixel" },
            { source: "Object.cpp",         target: "Transformation.cpp", label: "Projects mesh vertices" },
            { source: "Object.cpp",         target: "Fire.cpp",           label: "Samples particles for lighting" },
            { source: "Object.cpp",         target: "MatVec.cpp",         label: "Uses Vec3 / Matrix math" },
            { source: "Fire.cpp",           target: "Graphics.cpp",       label: "Renders particles to surface" },
            { source: "Fire.cpp",           target: "Transformation.cpp", label: "Projects particle positions" },
            { source: "Fire.cpp",           target: "MatVec.cpp",         label: "Vec3 velocity math" },
            { source: "Graphics.cpp",       target: "SDL",                label: "Writes to SDL pixel buffer" },
            { source: "Graphics.cpp",       target: "MatVec.cpp",         label: "Coordinate mapping" },
            { source: "Transformation.cpp", target: "MatVec.cpp",         label: "Matrix × Vector ops" }
        ];

        // ── Initialise node dimensions ────────────────────────────────────────
        nodes.forEach(n => {
            n.width  = n.w;
            n.height = n.h;
        });

        // Resolve string IDs → node objects
        links.forEach(l => {
            if (typeof l.source === "string") l.source = nodes.find(n => n.id === l.source);
            if (typeof l.target === "string") l.target = nodes.find(n => n.id === l.target);
        });

        // ── Sugiyama DAG layout (identical algorithm to portfolio site) ───────
        const inDegree = Object.fromEntries(nodes.map(n => [n.id, 0]));
        const children = Object.fromEntries(nodes.map(n => [n.id, []]));
        links.forEach(l => {
            inDegree[l.target.id]++;
            children[l.source.id].push(l.target.id);
        });

        const rank   = Object.fromEntries(nodes.map(n => [n.id, 0]));
        const queue  = nodes.filter(n => inDegree[n.id] === 0).map(n => n.id);
        const tempIn = { ...inDegree };
        while (queue.length) {
            const id = queue.shift();
            children[id].forEach(cid => {
                rank[cid] = Math.max(rank[cid], rank[id] + 1);
                if (--tempIn[cid] === 0) queue.push(cid);
            });
        }

        const layers = [];
        nodes.forEach(n => {
            const r = rank[n.id];
            if (!layers[r]) layers[r] = [];
            layers[r].push(n);
        });

        const PAD_X     = 44;
        const PAD_Y     = 78;
        const marginTop = 54;

        const layerHeights = layers.map(layer => Math.max(...layer.map(n => n.height)));
        const totalH = layerHeights.reduce((s, h) => s + h + PAD_Y, 0) - PAD_Y + marginTop * 2;
        const layoutH = Math.max(height, totalH);

        svg.attr("viewBox", `0 0 ${width} ${layoutH}`);
        container.style.minHeight = layoutH + "px";

        let yOffset = marginTop;
        layers.forEach((layer, li) => {
            const layerW = layer.reduce((s, n) => s + n.width, 0) + PAD_X * (layer.length - 1);
            let xOffset  = (width - layerW) / 2;
            const lh     = layerHeights[li];

            layer.forEach(n => {
                n.x = xOffset + n.width / 2;
                n.y = yOffset + lh / 2;
                xOffset += n.width + PAD_X;
            });
            yOffset += lh + PAD_Y;
        });

        // ── Draw edges ────────────────────────────────────────────────────────
        const link = svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(links)
            .enter().append("line")
            .attr("class", "d3-link")
            .attr("stroke",         "#6d5f50")
            .attr("stroke-width",   "2.2px")
            .attr("stroke-opacity", 0.65)
            .attr("marker-end",     "url(#arrow)");

        // ── Draw node card groups ─────────────────────────────────────────────
        const node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("g")
            .data(nodes)
            .enter().append("g")
            .attr("class", "node-group")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag",  dragged)
                .on("end",   dragended));

        // Vintage offset shadow
        node.append("rect")
            .attr("class",   "node-shadow")
            .attr("x",       d => -d.width  / 2 + 3)
            .attr("y",       d => -d.height / 2 + 3)
            .attr("width",   d =>  d.width)
            .attr("height",  d =>  d.height)
            .attr("rx", 4).attr("ry", 4)
            .attr("fill",    "#d8d3c5")
            .attr("stroke",  "none");

        // Primary card rect — parchment fill, colored border (same as portfolio)
        node.append("rect")
            .attr("class",        "node-card")
            .attr("x",            d => -d.width  / 2)
            .attr("y",            d => -d.height / 2)
            .attr("width",        d =>  d.width)
            .attr("height",       d =>  d.height)
            .attr("rx", 4).attr("ry", 4)
            .attr("fill",         "#fdfdfc")
            .attr("stroke",       d => d.color)
            .attr("stroke-width", "2px");

        // Label
        node.append("text")
            .attr("class",              "d3-node-label")
            .attr("text-anchor",        "middle")
            .attr("dominant-baseline",  "central")
            .attr("fill",               "#2d2a26")
            .style("font-size",         d => d.id === "main.cpp" ? "0.88rem" : "0.75rem")
            .style("font-weight",       "600")
            .text(d => d.label);

        updateNodeGraphics();

        // ── Edge geometry helpers ─────────────────────────────────────────────
        function getRectIntersection(n, other) {
            const dx = other.x - n.x;
            const dy = other.y - n.y;
            if (dx === 0 && dy === 0) return { x: n.x, y: n.y };
            const hw = n.width  / 2;
            const hh = n.height / 2;
            const t  = Math.min(hw / Math.abs(dx), hh / Math.abs(dy));
            return { x: n.x + dx * t, y: n.y + dy * t };
        }

        function updateNodeGraphics() {
            node.attr("transform", d => `translate(${d.x},${d.y})`);

            link
                .attr("x1", l => getRectIntersection(l.source, l.target).x)
                .attr("y1", l => getRectIntersection(l.source, l.target).y)
                .attr("x2", l => {
                    const pt = getRectIntersection(l.target, l.source);
                    const dx = l.target.x - l.source.x;
                    const dy = l.target.y - l.source.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    return pt.x - (dx / dist) * 2;
                })
                .attr("y2", l => {
                    const pt = getRectIntersection(l.target, l.source);
                    const dx = l.target.x - l.source.x;
                    const dy = l.target.y - l.source.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    return pt.y - (dy / dist) * 2;
                });
        }

        // ── AABB collision solver ─────────────────────────────────────────────
        function resolveCollisions(dragged, tx, ty) {
            let nx = tx, ny = ty;
            const buf = 14;
            const dw = dragged.width, dh = dragged.height;
            for (let iter = 0; iter < 4; iter++) {
                let hit = false;
                for (const n of nodes) {
                    if (n.id === dragged.id) continue;
                    const ox = (dw + n.width)  / 2 + buf - Math.abs(nx - n.x);
                    const oy = (dh + n.height) / 2 + buf - Math.abs(ny - n.y);
                    if (ox > 0 && oy > 0) {
                        hit = true;
                        if (ox < oy) nx += (nx >= n.x ? ox : -ox);
                        else         ny += (ny >= n.y ? oy : -oy);
                    }
                }
                if (!hit) break;
            }
            return { x: nx, y: ny };
        }

        // ── Hover interactions ────────────────────────────────────────────────
        node.on("mouseover", function(event, d) {
            // BFS in both directions — full ancestor + descendant chain
            const chain = new Set([d.id]);
            const queue = [d.id];
            while (queue.length) {
                const id = queue.shift();
                links.forEach(l => {
                    if (l.source.id === id && !chain.has(l.target.id)) {
                        chain.add(l.target.id); queue.push(l.target.id);
                    }
                    if (l.target.id === id && !chain.has(l.source.id)) {
                        chain.add(l.source.id); queue.push(l.source.id);
                    }
                });
            }

            // Interrupt in-flight transitions first
            svg.selectAll(".node-group").interrupt();
            link.interrupt();

            svg.selectAll(".node-group").filter(n => !chain.has(n.id))
                .transition().duration(180).style("opacity", 0.2);
            svg.selectAll(".node-group").filter(n =>  chain.has(n.id))
                .transition().duration(180).style("opacity", 1);

            link.transition().duration(180)
                .attr("stroke",         l => (chain.has(l.source.id) && chain.has(l.target.id)) ? "#8c4327" : "#6d5f50")
                .attr("stroke-opacity", l => (chain.has(l.source.id) && chain.has(l.target.id)) ? 0.9 : 0.05)
                .attr("stroke-width",   l => (chain.has(l.source.id) && chain.has(l.target.id)) ? "3px" : "2px")
                .attr("marker-end",     l => (chain.has(l.source.id) && chain.has(l.target.id)) ? "url(#arrow-highlighted)" : "url(#arrow-dimmed)");

            const g = d3.select(this);
            g.raise();
            g.interrupt();
            g.transition().duration(180)
                .attr("transform", `translate(${d.x},${d.y}) scale(1.1)`);
            g.select(".node-card").interrupt()
                .transition().duration(180)
                .attr("stroke", "#8c4327").attr("stroke-width", "2.5px");
            g.select(".d3-node-label").interrupt()
                .transition().duration(180)
                .style("fill", "#8c4327").style("font-weight", "700");

            showTooltip(event, d);
        });

        node.on("mouseout", function(event, d) {
            // Cancel in-flight transitions before restoring
            svg.selectAll(".node-group").interrupt();
            link.interrupt();

            svg.selectAll(".node-group")
                .transition().duration(150).style("opacity", 1);

            link.transition().duration(150)
                .attr("stroke",         "#6d5f50")
                .attr("stroke-opacity", 0.65)
                .attr("stroke-width",   "2.2px")
                .attr("marker-end",     "url(#arrow)");

            const g = d3.select(this);
            g.interrupt();
            g.transition().duration(150)
                .attr("transform", `translate(${d.x},${d.y})`);
            g.select(".node-card").interrupt()
                .transition().duration(150)
                .attr("stroke", d => d.color).attr("stroke-width", "2px");
            g.select(".d3-node-label").interrupt()
                .transition().duration(150)
                .style("fill", "#2d2a26").style("font-weight", "600");

            hideTooltip();
        });


        // ── Drag handlers ─────────────────────────────────────────────────────
        function dragstarted(event, d) {
            hideTooltip();
            d3.select(this).raise().interrupt()
                .attr("transform", `translate(${d.x},${d.y})`);
        }

        function dragged(event, d) {
            const w = d.width, h = d.height;
            let tx = Math.max(w / 2 + 10, Math.min(width  - w / 2 - 10, event.x));
            let ty = Math.max(h / 2 + 10, Math.min(layoutH - h / 2 - 10, event.y));
            const r = resolveCollisions(d, tx, ty);
            d.x = Math.max(w / 2 + 10, Math.min(width  - w / 2 - 10, r.x));
            d.y = Math.max(h / 2 + 10, Math.min(layoutH - h / 2 - 10, r.y));
            updateNodeGraphics();
        }

        function dragended(event, d) {
            d3.select(this).attr("transform", `translate(${d.x},${d.y})`);
        }

        // ── Tooltip (same coordinate-corrected approach as portfolio site) ─────
        function showTooltip(event, d) {
            const svgEl = container.querySelector("svg");
            const svgR  = svgEl.getBoundingClientRect();
            const contR = container.getBoundingClientRect();
            const sx    = svgR.width  / width;
            const sy    = svgR.height / layoutH;

            const npx  = (svgR.left - contR.left) + d.x * sx;
            const npy  = (svgR.top  - contR.top)  + d.y * sy;
            const halfW = (d.width / 2) * sx;

            const TW = 290, TH = 160;
            let tx = npx + halfW + 14;
            let ty = npy - TH / 2;

            if (tx + TW > contR.width - 4) tx = npx - halfW - TW - 14;
            ty = Math.max(6, Math.min(contR.height - TH - 6, ty));
            if (tx < 4) tx = 4;

            tooltip
                .style("visibility", "visible")
                .style("left", `${tx}px`)
                .style("top",  `${ty}px`)
                .html(`
                    <div style="font-family:'Fraunces',Georgia,serif;font-size:1rem;font-weight:700;color:#8c4327;border-bottom:1px dashed #d8d3c5;padding-bottom:4px;margin-bottom:6px;">${d.label}</div>
                    <div style="font-family:'IBM Plex Mono',monospace;font-size:0.68rem;color:#5c554c;text-transform:uppercase;margin-bottom:6px;">Type: <span style="background:#f4f0e6;padding:1px 5px;border:1px solid #d8d3c5;border-radius:2px;color:#2d2a26;">${d.type}</span></div>
                    <div style="font-size:0.85rem;line-height:1.45;color:#3c3530;margin-bottom:8px;">${d.desc}</div>
                    <div style="font-family:'IBM Plex Mono',monospace;font-size:0.68rem;color:#5c554c;text-transform:uppercase;margin-bottom:3px;">Dependencies</div>
                    <div>${getConnectionsHTML(d)}</div>
                `);
        }

        function hideTooltip() {
            tooltip.style("visibility", "hidden");
        }

        function getConnectionsHTML(n) {
            const list = [];
            links.forEach(l => {
                if (l.source.id === n.id) list.push(`→ ${l.target.label}`);
                else if (l.target.id === n.id) list.push(`← ${l.source.label}`);
            });
            if (!list.length) return `<span style="font-family:'IBM Plex Mono',monospace;font-size:0.75rem;color:#777;">None</span>`;
            return list.map(item =>
                `<div style="font-family:'IBM Plex Mono',monospace;font-size:0.75rem;color:#4b5e40;margin-bottom:2px;">${item}</div>`
            ).join("");
        }
    }

    // Load D3 if not already present
    if (window.d3) {
        initGraph();
    } else {
        const script = document.createElement("script");
        script.src    = d3Url;
        script.onload = initGraph;
        script.onerror = () => {
            const c = document.getElementById("d3-architecture-canvas");
            if (c) c.innerHTML = "<p style='padding:2rem;color:#8c4327;text-align:center;font-family:monospace;'>Failed to load D3.js.</p>";
        };
        document.head.appendChild(script);
    }
})();
