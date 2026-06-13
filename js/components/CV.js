import { ref, onMounted } from 'vue';

export default {
    setup() {
        const htmlContent = ref('');
        const loading = ref(true);

        const loadCV = async () => {
            try {
                const res = await fetch('cv.md');
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const mdText = await res.text();

                // Configure marked with highlight.js if available
                if (typeof hljs !== 'undefined' && typeof marked !== 'undefined') {
                    marked.setOptions({
                        highlight: (code, lang) => {
                            if (lang && hljs.getLanguage(lang)) {
                                return hljs.highlight(code, { language: lang }).value;
                            }
                            return hljs.highlightAuto(code).value;
                        },
                        gfm: true,
                        breaks: false
                    });
                }

                htmlContent.value = marked.parse(mdText);
            } catch (error) {
                console.error("Error loading CV:", error);
                htmlContent.value = '<p class="error-state">Error loading CV content.</p>';
            } finally {
                loading.value = false;
            }
        };

        onMounted(loadCV);

        return {
            htmlContent,
            loading
        };
    },
    template: `
        <div class="cv-container">
            <div v-if="loading" class="loading-state">Loading CV...</div>
            <div v-else class="md-body">
                <div v-html="htmlContent"></div>
            </div>
        </div>
    `
};
