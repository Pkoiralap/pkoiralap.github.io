import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { loadResource, injectStyles, executeScript, scopeCss } from '../utils.js';

export default {
    setup() {
        const timelineEvents = ref([]);
        const activeEventId = ref(null);
        const loadedContents = ref({});
        let isScrollingTo = false;

        const fetchEvents = async () => {
            try {
                const response = await fetch('data/events.json');
                const data = await response.json();
                
                // Show newest first (reverse chronological order)
                timelineEvents.value = [...data].reverse();
                
                if (timelineEvents.value.length > 0) {
                    activeEventId.value = timelineEvents.value[0].folder;
                }
                
                // Load contents for all events in parallel
                await Promise.all(timelineEvents.value.map(async (event) => {
                    try {
                        const content = await loadResource(`events/${event.folder}`);
                        const scopeId = `event-${event.folder.replace(/[^a-zA-Z0-9-]/g, '-')}`;
                        if (content.css) {
                            const scopedCss = scopeCss(content.css, scopeId);
                            injectStyles(`style-${event.folder}`, scopedCss);
                        }
                        
                        loadedContents.value = { 
                            ...loadedContents.value, 
                            [event.folder]: content.html 
                        };

                        if (content.js) {
                            executeScript(content.js);
                        }
                    } catch (err) {
                        console.error(`Failed to load event ${event.folder}:`, err);
                        loadedContents.value = { 
                            ...loadedContents.value, 
                            [event.folder]: `<p class="error-state">Error loading event content.</p>` 
                        };
                    }
                }));
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };

        const handleScroll = () => {
            if (isScrollingTo) return;

            // Check if we are at the absolute bottom of the page
            const threshold = 120; // pixels from the bottom
            const isAtBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - threshold);
            
            if (isAtBottom && timelineEvents.value.length > 0) {
                activeEventId.value = timelineEvents.value[timelineEvents.value.length - 1].folder;
                return;
            }

            let closestFolder = null;
            let minDistance = Infinity;

            timelineEvents.value.forEach(event => {
                const el = document.getElementById(`event-card-${event.folder}`);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    // Distance of card top from 30% of viewport height
                    const targetLine = window.innerHeight * 0.3;
                    const distance = Math.abs(rect.top - targetLine);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestFolder = event.folder;
                    }
                }
            });

            if (closestFolder) {
                activeEventId.value = closestFolder;
            }
        };

        const scrollToEvent = (folder) => {
            const el = document.getElementById(`event-card-${folder}`);
            if (el) {
                isScrollingTo = true;
                activeEventId.value = folder;

                el.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // Reset the flag after smooth scroll finishes
                setTimeout(() => {
                    isScrollingTo = false;
                    // Trigger scroll check to sync after scrolling completes
                    handleScroll();
                }, 800);
            }
        };

        onMounted(async () => {
            await fetchEvents();
            await nextTick();
            window.addEventListener('scroll', handleScroll, { passive: true });
            // Initial call to set correct initial active state
            handleScroll();
        });

        onBeforeUnmount(() => {
            window.removeEventListener('scroll', handleScroll);
        });

        return {
            timelineEvents,
            activeEventId,
            loadedContents,
            scrollToEvent
        };
    },
    template: `
        <div class="timeline-page">
            <div class="timeline-header">
                <h2>My Professional Journey</h2>
                <p>Scroll the page vertically to step through my milestones, or click a date on the left to jump directly to it.</p>
            </div>
            
            <div class="timeline-layout">
                <div class="timeline-nav-col">
                    <div class="vertical-timeline-container">
                        <div class="vertical-timeline-line"></div>
                        <div 
                            v-for="(event, index) in timelineEvents" 
                            :key="index"
                            class="vertical-timeline-node"
                            :class="{ active: activeEventId === event.folder }"
                            @click="scrollToEvent(event.folder)"
                        >
                            <div class="node-point"></div>
                            <div class="node-content">
                                <span class="node-date">{{ event.date }}</span>
                                <h4 class="node-title">{{ event.title }}</h4>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="timeline-details-col">
                    <div 
                        v-for="event in timelineEvents" 
                        :key="event.folder"
                        :id="'event-card-' + event.folder"
                        class="event-details-card"
                    >
                        <div class="dynamic-content-container" :id="'event-' + event.folder.replace(/[^a-zA-Z0-9-]/g, '-')">
                             <div v-html="loadedContents[event.folder] || '<div class=&quot;loading-state&quot;>Loading...</div>'"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
};
