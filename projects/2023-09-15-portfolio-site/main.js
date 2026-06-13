(function() {
    const d3Url = "https://d3js.org/d3.v7.min.js";

    function initGraph() {
        const container = document.getElementById("d3-architecture-canvas");
        if (!container) {
            // SPA may not have inserted the element yet — retry
            setTimeout(initGraph, 100);
            return;
        }
        
        // Clear container to avoid duplicate rendering on SPA page navigation
        container.innerHTML = "";

        const width = container.clientWidth || 900;
        const height = Math.max(container.clientHeight || 750, 750);

        const svg = d3.select("#d3-architecture-canvas")
            .append("svg")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet");

        // Create tooltips dynamically inside the canvas parent container
        let tooltip = d3.select("#d3-architecture-canvas").select(".d3-tooltip");
        if (tooltip.empty()) {
            tooltip = d3.select("#d3-architecture-canvas")
                .append("div")
                .attr("class", "d3-tooltip");
        }

        // Define Marker definitions for link arrows (using 5px refX since lines end at rect boundaries)
        svg.append("defs").selectAll("marker")
            .data([
                { id: "arrow", color: "#6d5f50" },
                { id: "arrow-highlighted", color: "#8c4327" },
                { id: "arrow-dimmed", color: "#e5dec9" }
            ])
            .enter().append("marker")
            .attr("id", d => d.id)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 5) 
            .attr("refY", 0)
            .attr("markerWidth", 5)
            .attr("markerHeight", 5)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("fill", d => d.color);

        // Nodes data with explicitly designed vintage sizing (index.html is the largest root)
        // Estimate text width: IBM Plex Mono at 0.78rem ≈ 8px/char at typical viewport
        function estimateWidth(label, minW) {
            return Math.max(minW, label.length * 8.5 + 28);
        }

        const nodes = [
            { id: "index.html",          label: "index.html",                  group: "entry",        type: "SPA Entrypoint",  color: "#8c4327", desc: "The main HTML5 container shell. Bootstraps CSS tokens and the ES module mounting root (&lt;div id='app'&gt;).",  w: estimateWidth("index.html", 180),                   h: 56 },
            { id: "index.js",            label: "js/index.js",                 group: "entry",        type: "SPA Bootstrapper", color: "#8c4327", desc: "Resolves dynamic hash routing parameters and maps URL triggers to components.",                         w: estimateWidth("js/index.js", 150),                  h: 40 },
            { id: "utils.js",            label: "js/utils.js",                 group: "engine",       type: "Loader Engine",   color: "#4b5e40", desc: "Implements sandboxed CSS scoping and dynamic run-time JS evaluation pipeline.",                         w: estimateWidth("js/utils.js", 150),                  h: 40 },
            { id: "Timeline.js",         label: "js/components/Timeline.js",   group: "component",    type: "Vue Component",   color: "#354e56", desc: "Visualizes milestones. Tracks window offsets via a passive scroll-spy.",                                  w: estimateWidth("js/components/Timeline.js", 160),    h: 40 },
            { id: "Projects.js",         label: "js/components/Projects.js",   group: "component",    type: "Vue Component",   color: "#354e56", desc: "Renders registered portfolios. Dynamically loads external asset packages.",                               w: estimateWidth("js/components/Projects.js", 160),    h: 40 },
            { id: "Blogs.js",            label: "js/components/Blogs.js",      group: "component",    type: "Vue Component",   color: "#354e56", desc: "Fetches and displays markdown-derived blogs from raw path assets.",                                       w: estimateWidth("js/components/Blogs.js", 160),      h: 40 },
            { id: "CV.js",              label: "js/components/CV.js",          group: "component",    type: "Vue Component",   color: "#354e56", desc: "Displays professional Curriculm Vitae credentials.",                                                      w: estimateWidth("js/components/CV.js", 150),         h: 40 },
            { id: "events.json",         label: "data/events.json",            group: "data",         type: "JSON Database",   color: "#ac7a60", desc: "Stores milestones, media URIs, metadata tags, and timestamp indexes.",                                    w: estimateWidth("data/events.json", 150),             h: 40 },
            { id: "projects.json",       label: "data/projects.json",          group: "data",         type: "JSON Database",   color: "#ac7a60", desc: "Register list mapping project scopes to subdirectories.",                                                  w: estimateWidth("data/projects.json", 150),           h: 40 },
            { id: "blogs.json",          label: "data/blogs.json",             group: "data",         type: "JSON Database",   color: "#ac7a60", desc: "Contains published article paths and categorization tags.",                                               w: estimateWidth("data/blogs.json", 150),              h: 40 },
            { id: "portfolio-main.html", label: "portfolio-site/main.html",    group: "subcomponent", type: "Project Asset",   color: "#a88a6d", desc: "Spec document markup enclosing layout grids and the D3 target canvas.",                                  w: estimateWidth("portfolio-site/main.html", 160),     h: 40 },
            { id: "portfolio-main.js",   label: "portfolio-site/main.js",      group: "subcomponent", type: "Project Asset",   color: "#a88a6d", desc: "Drives this interactive, collision-aware architecture box graph.",                                        w: estimateWidth("portfolio-site/main.js", 160),       h: 40 },
            { id: "portfolio-style.css", label: "portfolio-site/style.css",    group: "subcomponent", type: "Project Asset",   color: "#a88a6d", desc: "Scoping overrides and layouts for component cards and tooltips.",                                        w: estimateWidth("portfolio-site/style.css", 160),     h: 40 }
        ];

        // Links data
        const links = [
            { source: "index.html", target: "index.js", label: "Imports Script" },
            { source: "index.js", target: "Timeline.js", label: "Registers Router Component" },
            { source: "index.js", target: "Projects.js", label: "Registers Router Component" },
            { source: "index.js", target: "Blogs.js", label: "Registers Router Component" },
            { source: "index.js", target: "CV.js", label: "Registers Router Component" },
            { source: "Projects.js", target: "projects.json", label: "Fetches Index" },
            { source: "Projects.js", target: "utils.js", label: "Invokes Asset Loader" },
            { source: "Blogs.js", target: "blogs.json", label: "Fetches Index" },
            { source: "Timeline.js", target: "events.json", label: "Fetches Index" },
            { source: "Projects.js", target: "portfolio-main.html", label: "Dynamically Mounts" },
            { source: "utils.js", target: "portfolio-main.html", label: "Parses DOM Structure" },
            { source: "utils.js", target: "portfolio-style.css", label: "Applies CSS Sandbox Scope" },
            { source: "utils.js", target: "portfolio-main.js", label: "Executes Script Runtime" },
            { source: "portfolio-main.js", target: "portfolio-main.html", label: "Targets SVG Canvas" },
            { source: "portfolio-main.js", target: "portfolio-style.css", label: "Applies Visual Rules" }
        ];

        // Set dimensions
        nodes.forEach(n => {
            n.width  = n.w;
            n.height = n.h;
        });

        // Resolve link source/target from string IDs → node objects
        links.forEach(l => {
            if (typeof l.source === "string") l.source = nodes.find(n => n.id === l.source);
            if (typeof l.target === "string") l.target = nodes.find(n => n.id === l.target);
        });

        // ── Sugiyama-style layered DAG layout ──────────────────────────────────
        // 1. Assign ranks via longest-path from sources (BFS/topological sort)
        const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));
        const inDegree  = Object.fromEntries(nodes.map(n => [n.id, 0]));
        const children  = Object.fromEntries(nodes.map(n => [n.id, []]));
        links.forEach(l => {
            inDegree[l.target.id]++;
            children[l.source.id].push(l.target.id);
        });

        // Topological sort (Kahn's algorithm)
        const rank  = Object.fromEntries(nodes.map(n => [n.id, 0]));
        const queue = nodes.filter(n => inDegree[n.id] === 0).map(n => n.id);
        const tempIn = { ...inDegree };
        while (queue.length) {
            const id = queue.shift();
            children[id].forEach(cid => {
                rank[cid] = Math.max(rank[cid], rank[id] + 1);
                if (--tempIn[cid] === 0) queue.push(cid);
            });
        }

        // 2. Group nodes by rank (layer)
        const layers = [];
        nodes.forEach(n => {
            const r = rank[n.id];
            if (!layers[r]) layers[r] = [];
            layers[r].push(n);
        });

        // 3. Position nodes: distribute layers top-to-bottom, nodes left-to-right within layer
        const PAD_X = 48;   // horizontal gap between cards
        const PAD_Y = 80;   // vertical gap between layers
        const marginTop = 54;

        // Compute total height needed
        const layerHeights = layers.map(layer =>
            Math.max(...layer.map(n => n.height))
        );
        const totalH = layerHeights.reduce((s, h) => s + h + PAD_Y, 0) - PAD_Y + marginTop * 2;

        // Expand canvas viewBox if content is taller than default
        const layoutH = Math.max(height, totalH);
        svg.attr("viewBox", `0 0 ${width} ${layoutH}`);
        // Also update the CSS height of the container so scroll works
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
        // ──────────────────────────────────────────────────────────────────────

        // Draw links (enforce visible styles inline to bypass scope specificity issues)
        const link = svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(links)
            .enter().append("line")
            .attr("class", "d3-link")
            .attr("stroke", "#6d5f50")
            .attr("stroke-width", "2.2px")
            .attr("stroke-opacity", 0.65)
            .attr("marker-end", "url(#arrow)");

        // Draw node card groups
        const node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("g")
            .data(nodes)
            .enter().append("g")
            .attr("class", "node-group")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        // Vintage offset block shadow
        node.append("rect")
            .attr("class", "node-shadow")
            .attr("x", d => -d.width / 2 + 3)
            .attr("y", d => -d.height / 2 + 3)
            .attr("width", d => d.width)
            .attr("height", d => d.height)
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("fill", "#d8d3c5")
            .attr("stroke", "none");

        // Primary component card rect
        node.append("rect")
            .attr("class", "node-card")
            .attr("x", d => -d.width / 2)
            .attr("y", d => -d.height / 2)
            .attr("width", d => d.width)
            .attr("height", d => d.height)
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("fill", "#fdfdfc")
            .attr("stroke", d => d.color)
            .attr("stroke-width", "2px");

        // Text label inside the card
        node.append("text")
            .attr("class", "d3-node-label")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("fill", "#2d2a26")
            .style("font-size", d => d.id === "index.html" ? "0.88rem" : "0.75rem")
            .style("font-weight", "600")
            .text(d => d.label);

        // Position nodes and link lines initially
        updateNodeGraphics();

        // Computes intersection coordinates of line with the target card's boundary
        function getRectIntersection(node, otherNode) {
            const dx = otherNode.x - node.x;
            const dy = otherNode.y - node.y;
            
            if (dx === 0 && dy === 0) return { x: node.x, y: node.y };
            
            const hw = node.width / 2;
            const hh = node.height / 2;
            
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);
            
            const scaleX = hw / absDx;
            const scaleY = hh / absDy;
            
            // Intersection factor is the closer boundary projection
            const t = Math.min(scaleX, scaleY);
            
            return {
                x: node.x + dx * t,
                y: node.y + dy * t
            };
        }

        // Custom Separating Axis AABB collision solver to keep cards from overlapping on drag
        function resolveCollisions(draggedNode, targetX, targetY) {
            let newX = targetX;
            let newY = targetY;
            
            const buffer = 14; // spacing buffer between card borders
            const dw = draggedNode.width;
            const dh = draggedNode.height;

            for (let iter = 0; iter < 4; iter++) {
                let collided = false;
                for (const n of nodes) {
                    if (n.id === draggedNode.id) continue;
                    
                    const nw = n.width;
                    const nh = n.height;

                    const dx = newX - n.x;
                    const dy = newY - n.y;
                    
                    const overlapX = (dw + nw) / 2 + buffer - Math.abs(dx);
                    const overlapY = (dh + nh) / 2 + buffer - Math.abs(dy);
                    
                    // Collision happens when overlapping on both dimensions
                    if (overlapX > 0 && overlapY > 0) {
                        collided = true;
                        
                        // Push away on the axis of least overlap
                        if (overlapX < overlapY) {
                            newX += dx >= 0 ? overlapX : -overlapX;
                        } else {
                            newY += dy >= 0 ? overlapY : -overlapY;
                        }
                    }
                }
                if (!collided) break;
            }
            return { x: newX, y: newY };
        }

        // Moves node group elements and update lines
        function updateNodeGraphics() {
            // Apply coordinates transforms to node groups
            node.attr("transform", d => `translate(${d.x},${d.y})`);

            // Direct line calculations from boundary point to boundary point
            link
                .attr("x1", l => {
                    const pt = getRectIntersection(l.source, l.target);
                    return pt.x;
                })
                .attr("y1", l => {
                    const pt = getRectIntersection(l.source, l.target);
                    return pt.y;
                })
                .attr("x2", l => {
                    const pt = getRectIntersection(l.target, l.source);
                    const dx = l.target.x - l.source.x;
                    const dy = l.target.y - l.source.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    // Retract end coordinate by 2px so arrow tip aligns exactly at the border
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

        // Interaction event registration
        node.on("mouseover", function(event, d) {
            // BFS in both directions to collect the full ancestor+descendant chain
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

            // Interrupt any in-flight transitions before starting new ones
            svg.selectAll(".node-group").interrupt();
            link.interrupt();

            // Dim unrelated nodes
            svg.selectAll(".node-group")
                .filter(n => !chain.has(n.id))
                .transition().duration(180)
                .style("opacity", 0.2);

            // Ensure all chain nodes are fully visible
            svg.selectAll(".node-group")
                .filter(n => chain.has(n.id))
                .transition().duration(180)
                .style("opacity", 1);

            // Highlight links that are part of the chain
            link.transition().duration(180)
                .attr("stroke", l =>
                    (chain.has(l.source.id) && chain.has(l.target.id)) ? "#8c4327" : "#6d5f50"
                )
                .attr("stroke-opacity", l =>
                    (chain.has(l.source.id) && chain.has(l.target.id)) ? 0.9 : 0.05
                )
                .attr("stroke-width", l =>
                    (chain.has(l.source.id) && chain.has(l.target.id)) ? "3px" : "2px"
                )
                .attr("marker-end", l =>
                    (chain.has(l.source.id) && chain.has(l.target.id))
                        ? "url(#arrow-highlighted)"
                        : "url(#arrow-dimmed)"
                );

            // Scale up hovered card
            const g = d3.select(this);
            g.raise();
            g.interrupt();
            g.transition().duration(180)
                .attr("transform", `translate(${d.x},${d.y}) scale(1.1)`);
            g.select(".node-card").interrupt()
                .transition().duration(180)
                .attr("stroke", "#8c4327")
                .attr("stroke-width", "2.5px");
            g.select(".d3-node-label").interrupt()
                .transition().duration(180)
                .style("fill", "#8c4327")
                .style("font-weight", "700");

            showTooltip(event, d);
        });

        node.on("mouseout", function(event, d) {
            // Cancel everything in-flight before restoring
            svg.selectAll(".node-group").interrupt();
            link.interrupt();

            svg.selectAll(".node-group")
                .transition().duration(150)
                .style("opacity", 1);

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
                .attr("stroke", d => d.color)
                .attr("stroke-width", "2px");
            g.select(".d3-node-label").interrupt()
                .transition().duration(150)
                .style("fill", "#2d2a26")
                .style("font-weight", "600");

            hideTooltip();
        });


        // Drag functions (updating graphics directly, no simulation engine triggers)
        function dragstarted(event, d) {
            hideTooltip();
            // Immediately snap off any hover scale so drag coords are clean
            d3.select(this)
                .raise()
                .interrupt()
                .attr("transform", `translate(${d.x},${d.y})`);
        }

        function dragged(event, d) {
            const w = d.width;
            const h = d.height;

            // Keep card boundary inside canvas box limits
            let targetX = Math.max(w / 2 + 10, Math.min(width - w / 2 - 10, event.x));
            let targetY = Math.max(h / 2 + 10, Math.min(height - h / 2 - 10, event.y));

            // Run collision solver
            const resolved = resolveCollisions(d, targetX, targetY);

            d.x = Math.max(w / 2 + 10, Math.min(width - w / 2 - 10, resolved.x));
            d.y = Math.max(h / 2 + 10, Math.min(height - h / 2 - 10, resolved.y));

            updateNodeGraphics();
        }

        function dragended(event, d) {
            // Ensure transform is clean (no stale scale) after drop
            d3.select(this).attr("transform", `translate(${d.x},${d.y})`);
        }

        function showTooltip(event, d) {
            // Convert SVG node centre → container-relative CSS pixels
            // The SVG uses a viewBox so we must apply the actual rendered scale.
            const svgEl  = container.querySelector("svg");
            const svgR   = svgEl.getBoundingClientRect();
            const contR  = container.getBoundingClientRect();
            const scaleX = svgR.width  / width;
            const scaleY = svgR.height / height;

            // Centre of the node card in container-pixel space
            const nodePixX = (svgR.left - contR.left) + d.x * scaleX;
            const nodePixY = (svgR.top  - contR.top)  + d.y * scaleY;
            const halfW    = (d.width / 2) * scaleX;

            const TOOLTIP_W = 290;
            const TOOLTIP_H = 160; // approximate

            // Default: appear to the right of the card
            let tx = nodePixX + halfW + 14;
            let ty = nodePixY - TOOLTIP_H / 2;

            // Flip to left if overflows right edge
            if (tx + TOOLTIP_W > contR.width - 4) {
                tx = nodePixX - halfW - TOOLTIP_W - 14;
            }
            // Clamp vertical
            ty = Math.max(6, Math.min(contR.height - TOOLTIP_H - 6, ty));
            // Clamp left edge
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
                    <div>${getConnectionsTooltip(d)}</div>
                `);
        }

        function hideTooltip() {
            tooltip.style("visibility", "hidden");
        }

        function getConnectionsTooltip(node) {
            let list = [];
            links.forEach(l => {
                if (l.source.id === node.id) {
                    list.push(`→ ${l.target.label}`);
                } else if (l.target.id === node.id) {
                    list.push(`← ${l.source.label}`);
                }
            });
            if (list.length === 0) return `<span style="font-family:'IBM Plex Mono', monospace; font-size:0.75rem; color:#777;">None</span>`;
            return list.map(item => `<div style="font-family:'IBM Plex Mono', monospace; font-size:0.75rem; color:#4b5e40; margin-bottom:2px;">${item}</div>`).join("");
        }
    }

    // Load D3 if not already present, then init
    if (window.d3) {
        initGraph();
    } else {
        const script = document.createElement("script");
        script.src = d3Url;
        script.onload = () => {
            if (document.readyState === "complete" || document.readyState === "interactive") {
                initGraph();
            } else {
                window.addEventListener("DOMContentLoaded", initGraph);
            }
        };
        script.onerror = () => {
            const c = document.getElementById("d3-architecture-canvas");
            if (c) c.innerHTML = "<p style='padding:2rem;color:#8c4327;text-align:center;font-family:monospace;'>Failed to load D3.js interactive canvas.</p>";
        };
        document.head.appendChild(script);
    }
})();
