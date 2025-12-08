import { ref, onMounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { loadResource, injectStyles, executeScript, scopeCss } from '../utils.js';

export default {
    setup() {
        const route = useRoute();
        const router = useRouter();
        
        const blogs = ref([]);
        const selectedBlog = ref(null);
        const loading = ref(false);

        const loadBlogContent = async (blog) => {
            loading.value = true;
            // Set partial data if available
            selectedBlog.value = blog || { html: '' }; 
            
            try {
                const { html, css, js } = await loadResource(`blogs/${blog.folder}`);
                const scopeId = `blog-${blog.folder.replace(/[^a-zA-Z0-9-]/g, '-')}`;
                const scopedCss = scopeCss(css, scopeId);
                
                selectedBlog.value = { ...blog, html, css: scopedCss, js, scopeId };
                
                await nextTick();
                injectStyles('dynamic-blog-style', scopedCss);
                executeScript(js);
            } catch (error) {
                console.error("Error loading blog:", error);
                selectedBlog.value = { ...blog, html: '<p>Error loading content.</p>' };
            } finally {
                loading.value = false;
            }
        };

        const fetchBlogs = async () => {
            try {
                const response = await fetch('data/blogs.json');
                const data = await response.json();
                blogs.value = data;
                
                // Check if route has a folder param
                if (route.params.folder) {
                    const blog = data.find(b => b.folder === route.params.folder);
                    if (blog) {
                        loadBlogContent(blog);
                    }
                }
            } catch (error) {
                console.error('Error fetching blogs:', error);
            }
        };

        const viewBlog = (blog) => {
            router.push(`/blogs/${blog.folder}`);
        };

        const backToList = () => {
            router.push('/blogs');
            const style = document.getElementById('dynamic-blog-style');
            if (style) style.remove();
            selectedBlog.value = null;
        };
        
        // Watch for route changes (e.g. browser back/forward)
        watch(() => route.params.folder, (newFolder) => {
            if (newFolder) {
                // If blogs are already loaded
                if (blogs.value.length > 0) {
                    const blog = blogs.value.find(b => b.folder === newFolder);
                    if (blog) loadBlogContent(blog);
                }
            } else {
                selectedBlog.value = null;
                const style = document.getElementById('dynamic-blog-style');
                if (style) style.remove();
            }
        });

        onMounted(fetchBlogs);

        return {
            blogs,
            selectedBlog,
            loading,
            viewBlog,
            backToList
        };
    },
    template: `
        <div class="blogs-container">
            <div v-if="!selectedBlog" class="blog-list">
                <h2>Blogs</h2>
                <div v-for="blog in blogs" :key="blog.folder" class="blog-item" @click="viewBlog(blog)">
                    <h3>{{ blog.title }}</h3>
                    <span class="date">{{ blog.date }}</span>
                    <p>{{ blog.summary }}</p>
                </div>
            </div>

            <div v-else class="blog-view">
                <button @click="backToList" class="back-btn">&larr; Back to Blogs</button>
                <div v-if="loading">Loading...</div>
                <div v-else class="dynamic-content-container" :id="selectedBlog.scopeId">
                    <div v-html="selectedBlog.html"></div>
                </div>
            </div>
        </div>
    `
};
