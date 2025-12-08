import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import Home from './components/Home.js';
import Blogs from './components/Blogs.js';
import Projects from './components/Projects.js';
import Contact from './components/Contact.js';

const routes = [
    { path: '/', redirect: '/home' },
    { path: '/home', component: Home },
    { path: '/blogs', component: Blogs },
    { path: '/blogs/:folder', component: Blogs },
    { path: '/projects', component: Projects },
    { path: '/projects/:folder', component: Projects },
    { path: '/contact', component: Contact }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

const App = {
    setup() {
        return {};
    }
};

createApp(App)
    .use(router)
    .mount('#app');
