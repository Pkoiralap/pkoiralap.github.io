import { ref, onMounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { loadResource, injectStyles, executeScript, scopeCss } from '../utils.js';

export default {
    setup() {
        const route = useRoute();
        const router = useRouter();
        
        const projects = ref([]);
        const selectedProject = ref(null);
        const loading = ref(false);

        const loadProjectContent = async (project) => {
            loading.value = true;
            
            try {
                const content = await loadResource(`projects/${project.folder}`);
                const scopeId = `project-${project.folder.replace(/[^a-zA-Z0-9-]/g, '-')}`;
                if (content.css) {
                    const scopedCss = scopeCss(content.css, scopeId);
                    injectStyles(`style-project-${project.folder}`, scopedCss);
                }
                
                selectedProject.value = { 
                    ...project, 
                    html: content.html 
                };

                await nextTick();
                if (content.js) {
                    executeScript(content.js);
                }
            } catch (error) {
                console.error("Error loading project:", error);
                selectedProject.value = { ...project, html: '<p class="error-state">Error loading content.</p>' };
            } finally {
                loading.value = false;
            }
        };

        const fetchProjects = async () => {
            try {
                const response = await fetch('data/projects.json');
                const data = await response.json();
                projects.value = data;
                
                if (route.params.folder) {
                    const project = data.find(p => p.folder === route.params.folder);
                    if (project) loadProjectContent(project);
                }
            } catch (error) {
                console.error('Error fetching projects:', error);
            }
        };

        const viewProject = (project) => {
            router.push(`/projects/${project.folder}`);
        };

        const backToList = () => {
            router.push('/projects');
            selectedProject.value = null;
        };

        watch(() => route.params.folder, (newFolder) => {
            if (newFolder) {
                if (projects.value.length > 0) {
                    const project = projects.value.find(p => p.folder === newFolder);
                    if (project) loadProjectContent(project);
                }
            } else {
                selectedProject.value = null;
            }
        });

        onMounted(fetchProjects);

        return {
            projects,
            selectedProject,
            loading,
            viewProject,
            backToList
        };
    },
    template: `
        <div class="projects-container">
            <div v-if="!selectedProject" class="project-list">
                <h2>Projects</h2>
                <div v-for="project in projects" :key="project.folder" class="project-item" @click="viewProject(project)">
                    <h3>{{ project.title }}</h3>
                    <div class="tags">
                        <span v-for="tech in project.technologies" :key="tech" class="tag">{{ tech }}</span>
                    </div>
                    <p>{{ project.summary }}</p>
                </div>
            </div>

            <div v-else class="project-view">
                <button @click="backToList" class="back-btn">&larr; Back to Projects</button>
                <div v-if="loading">Loading...</div>
                <div v-else class="project-details-container" :id="'project-' + selectedProject.folder.replace(/[^a-zA-Z0-9-]/g, '-')">
                    <div v-html="selectedProject.html"></div>
                </div>
            </div>
        </div>
    `
};
