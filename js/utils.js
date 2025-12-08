export async function loadResource(path) {
    try {
        const fetchFile = async (file) => {
            try {
                const res = await fetch(`${path}/${file}`);
                if (!res.ok) return '';
                return await res.text();
            } catch (e) {
                console.warn(`Failed to fetch ${file} from ${path}`, e);
                return '';
            }
        };

        const htmlRaw = await fetchFile('main.html');
        if (!htmlRaw) throw new Error("HTML content missing");

        const css = await fetchFile('style.css');
        const js = await fetchFile('main.js');

        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlRaw, 'text/html');
        
        // Remove existing scripts and styles to prevent double loading/errors
        doc.querySelectorAll('script').forEach(el => el.remove());
        doc.querySelectorAll('link[rel="stylesheet"]').forEach(el => el.remove());

        const html = doc.body.innerHTML;

        return { html, css, js };
    } catch (error) {
        console.error(`Error loading content from ${path}:`, error);
        return { 
            html: '<p>Error loading content.</p>', 
            css: '', 
            js: '' 
        };
    }
}

export function scopeCss(css, parentId) {
    const parentSelector = `#${parentId}`;
    // Remove comments
    css = css.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Naive scoping: Prefix selectors with parentSelector
    // This regex matches "selector {" but tries to avoid @media blocks by checking start
    return css.replace(/([^{]+)\{/g, (match, selector) => {
        const trimmed = selector.trim();
        // Skip @ rules (media, keyframes, import) - limitation: won't scope inside media queries properly with this simple regex
        // To fix basic media queries, we might need a parser, but let's try to handle basic body/tag selectors
        if (trimmed.startsWith('@')) {
            return match;
        }

        const parts = selector.split(',');
        const scopedParts = parts.map(part => {
            part = part.trim();
            // Replace body/html with the parent selector itself
            if (part.match(/^(body|html)/i)) {
                return part.replace(/^(body|html)/i, parentSelector);
            }
            // Prefix other selectors
            return `${parentSelector} ${part}`;
        });

        return scopedParts.join(', ') + '{';
    });
}

export function injectStyles(id, css) {
    let style = document.getElementById(id);
    if (!style) {
        style = document.createElement('style');
        style.id = id;
        document.head.appendChild(style);
    }
    style.textContent = css;
}

export function executeScript(js) {
    try {
        // Run in global scope or wrapped? 
        // Using new Function() creates a function body. 
        // We'll execute it immediately.
        new Function(js)();
    } catch (e) {
        console.error("Error executing script:", e);
    }
}
