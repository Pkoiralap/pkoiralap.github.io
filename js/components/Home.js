import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

export default {
    setup() {
        const router = useRouter();
        const recentBlogs = ref([]);
        const recentProjects = ref([]);
        const recentEvents = ref([]);
        const loading = ref(true);

        const loadHomeData = async () => {
            try {
                // Load blogs
                const blogsRes = await fetch('data/blogs.json');
                if (blogsRes.ok) {
                    const blogsData = await blogsRes.json();
                    recentBlogs.value = blogsData.slice(0, 2);
                }

                // Load projects
                const projectsRes = await fetch('data/projects.json');
                if (projectsRes.ok) {
                    const projectsData = await projectsRes.json();
                    recentProjects.value = projectsData.slice(0, 2);
                }

                // Load timeline events
                const eventsRes = await fetch('data/events.json');
                if (eventsRes.ok) {
                    const eventsData = await eventsRes.json();
                    // Chronological order -> slice the last 2 events (most recent) and reverse to show newest first
                    recentEvents.value = eventsData.slice(-2).reverse();
                }
            } catch (error) {
                console.error("Error loading home page dashboard data:", error);
            } finally {
                loading.value = false;
            }
        };

        const goToEvent = () => router.push('/timeline');
        const goToBlog = (blog) => router.push(`/blogs/${blog.filename.replace('.md', '')}`);
        const goToProject = (proj) => router.push(`/projects/${proj.folder}`);

        onMounted(loadHomeData);

        return {
            recentBlogs,
            recentProjects,
            recentEvents,
            loading,
            goToEvent,
            goToBlog,
            goToProject
        };
    },
    template: `
        <div class="home-container">
            <div class="intro-section">
                <h1>Welcome</h1>
                <p class="tagline">I'm Prasanna Koirala. I am a Research Software Engineer specializing in High-Performance Computing (HPC), machine learning pipelines, and full-stack cloud applications.</p>
                <div class="intro-links">
                    <router-link to="/cv" class="btn-primary-custom">View CV</router-link>
                    <router-link to="/timeline" class="btn-secondary-custom">Explore Timeline</router-link>
                </div>
            </div>
            
            <div v-if="loading" class="loading-state">Loading dashboard...</div>
            
            <div v-else class="dashboard-grid">
                <!-- Recent Blogs -->
                <section class="dashboard-card recent-blogs-card">
                    <div class="card-header">
                        <h2>Recent Blogs</h2>
                        <router-link to="/blogs" class="see-all">Read All Blogs &rarr;</router-link>
                    </div>
                    <div class="recent-list">
                        <div v-for="blog in recentBlogs" :key="blog.filename"
                             class="recent-item"
                             style="cursor:pointer"
                             @click="goToBlog(blog)">
                            <span class="recent-date">{{ blog.date }}</span>
                            <h3>{{ blog.title }}</h3>
                            <p>{{ blog.summary }}</p>
                        </div>
                    </div>
                </section>

                <!-- Recent Projects -->
                <section class="dashboard-card recent-projects-card">
                    <div class="card-header">
                        <h2>Featured Projects</h2>
                        <router-link to="/projects" class="see-all">View All Projects &rarr;</router-link>
                    </div>
                    <div class="recent-list">
                        <div v-for="project in recentProjects" :key="project.folder"
                             class="recent-item"
                             style="cursor:pointer"
                             @click="goToProject(project)">
                            <h3>{{ project.title }}</h3>
                            <div class="tags">
                                <span v-for="tech in project.technologies" :key="tech" class="tag">{{ tech }}</span>
                            </div>
                            <p>{{ project.summary }}</p>
                        </div>
                    </div>
                </section>

                <!-- Recent Timeline Events -->
                <section class="dashboard-card recent-events-card">
                    <div class="card-header">
                        <h2>Latest Milestones</h2>
                        <router-link to="/timeline" class="see-all">See Full Timeline &rarr;</router-link>
                    </div>
                    <div class="recent-list">
                        <div v-for="event in recentEvents" :key="event.folder"
                             class="recent-item event-preview"
                             style="cursor:pointer"
                             @click="goToEvent()">
                            <span class="recent-date">{{ event.date }}</span>
                            <h3>{{ event.title }}</h3>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    `
};