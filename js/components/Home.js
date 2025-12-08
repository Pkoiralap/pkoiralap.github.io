import { ref, onMounted, nextTick } from 'vue';
import { loadResource, injectStyles, executeScript, scopeCss } from '../utils.js';

export default {
    setup() {
        const timelineEvents = ref([]);
        const activeEvent = ref(null);
        const activeContent = ref({ html: '', css: '', js: '', scopeId: '' });
        // Simple cache
        const eventCache = {};

        const fetchEvents = async () => {
            try {
                const response = await fetch('data/events.json');
                const data = await response.json();
                timelineEvents.value = data;
                if (data.length > 0) {
                    setActive(data[0]);
                }
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };

        const setActive = async (event) => {
            activeEvent.value = event;
            
            if (eventCache[event.folder]) {
                activeContent.value = eventCache[event.folder];
            } else {
                activeContent.value = { html: '<div style="padding:20px;">Loading...</div>', css: '', js: '', scopeId: '' };
                
                try {
                    const data = await loadResource(`events/${event.folder}`);
                    
                    if (!data.html) {
                        console.warn("Loaded empty HTML for event:", event.folder);
                        data.html = "<div>No content available</div>";
                    }

                    // Scope the CSS
                    const scopeId = `event-${event.folder.replace(/[^a-zA-Z0-9-]/g, '-')}`;
                    if (data.css) {
                        data.css = scopeCss(data.css, scopeId);
                    }
                    data.scopeId = scopeId;

                    eventCache[event.folder] = data;
                    // Only update if still active
                    if (activeEvent.value === event) {
                        activeContent.value = data;
                    }
                } catch (e) {
                    console.error("Error loading event:", e);
                    activeContent.value = { html: '<div style="padding:20px; color:red;">Error loading content</div>', css: '', js: '', scopeId: '' };
                }
            }
            
            await nextTick();
            if (activeEvent.value === event && activeContent.value.css) {
                injectStyles('dynamic-event-style', activeContent.value.css);
                executeScript(activeContent.value.js);
            }
        };

        onMounted(fetchEvents);

        return {
            timelineEvents,
            activeEvent,
            activeContent,
            setActive
        };
    },
    template: `
        <div class="home-container">
            <div class="intro">
                <h1>Welcome!</h1>
                <p>Hi, I'm Prasanna. I am a passionate developer who loves building things.</p>
            </div>
            
            <div class="timeline-section">
                <h2>My Journey</h2>
                <div class="timeline-container">
                    <div class="timeline-line"></div>
                    <div 
                        v-for="(event, index) in timelineEvents" 
                        :key="index"
                        class="timeline-node"
                        :class="{ active: activeEvent === event }"
                        @mouseenter="setActive(event)"
                    >
                        <div class="node-point"></div>
                        <div class="node-date">{{ event.date }}</div>
                    </div>
                </div>
                
                <div class="event-details" v-if="activeEvent">
                    <div class="dynamic-content-container" :id="activeContent.scopeId">
                         <div v-html="activeContent.html"></div>
                    </div>
                </div>
            </div>
        </div>
    `
};