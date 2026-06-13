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
            selectedBlog.value = blog || { html: '' }; 
            
            try {
                const path = `blogs/${blog.filename}`;
                const res = await fetch(path);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const mdText = await res.text();

                // Configure marked with highlight.js
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

                const html = marked.parse(mdText);
                selectedBlog.value = { ...blog, html };
                
                await nextTick();
                // Apply syntax highlighting
                if (typeof hljs !== 'undefined') {
                    document.querySelectorAll('.blog-view pre code').forEach((el) => {
                        hljs.highlightElement(el);
                    });
                }
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
                
                if (route.params.folder) {
                    const blog = data.find(b => b.filename.replace('.md', '') === route.params.folder);
                    if (blog) {
                        loadBlogContent(blog);
                    }
                }
            } catch (error) {
                console.error('Error fetching blogs:', error);
            }
        };

        const viewBlog = (blog) => {
            const folderName = blog.filename.replace('.md', '');
            router.push(`/blogs/${folderName}`);
        };

        const backToList = () => {
            router.push('/blogs');
            selectedBlog.value = null;
        };
        
        watch(() => route.params.folder, (newFolder) => {
            if (newFolder) {
                if (blogs.value.length > 0) {
                    const blog = blogs.value.find(b => b.filename.replace('.md', '') === newFolder);
                    if (blog) loadBlogContent(blog);
                }
            } else {
                selectedBlog.value = null;
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
                <div v-for="blog in blogs" :key="blog.filename" class="blog-item" @click="viewBlog(blog)">
                    <h3>{{ blog.title }}</h3>
                    <span class="date">{{ blog.date }}</span>
                    <p>{{ blog.summary }}</p>
                </div>
            </div>

            <div v-else class="blog-view">
                <button @click="backToList" class="back-btn">&larr; Back to Blogs</button>
                <div v-if="loading">Loading...</div>
                <div v-else class="md-body">
                    <div v-html="selectedBlog.html"></div>
                </div>
            </div>
        </div>
    `
};
