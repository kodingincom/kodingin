import { createRouter, createWebHistory } from 'vue-router'
import App from '../App.vue'
import Blog from '../Blog.vue'
import AdminLayout from '../AdminLayout.vue'
import AdminPosts from '../views/AdminPosts.vue'
import AdminPostNew from '../views/AdminPostNew.vue'
import { authClient } from '../lib/auth'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: App
    },
    {
        path: '/blog',
        name: 'Blog',
        component: Blog
    },
    {
        path: '/blog/:slug',
        name: 'BlogDetail',
        component: () => import('../BlogDetail.vue')
    },
    {
        path: '/blog/category/:slug',
        name: 'BlogCategory',
        component: () => import('../BlogCategory.vue')
    },
    {
        path: '/admin/login',
        name: 'AdminLogin',
        component: () => import('../views/AdminLogin.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/admin',
        component: AdminLayout,
        meta: { requiresAuth: true },
        children: [
            {
                path: '',
                redirect: '/admin/posts'
            },
            {
                path: 'posts',
                name: 'AdminPosts',
                component: AdminPosts
            },
            {
                path: 'post/new',
                name: 'AdminPostNew',
                component: AdminPostNew
            },
            {
                path: 'post/:slug/edit',
                name: 'AdminPostEdit',
                component: AdminPostNew
            },
            {
                path: 'categories',
                name: 'AdminCategories',
                component: () => import('../views/AdminCategories.vue')
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach(async (to, _from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth)) {
        const sessionRes = await authClient.getSession();
        // @ts-ignore - better-auth types are acting up in strict mode
        if (!sessionRes || !sessionRes.data) {
            next('/admin/login')
        } else {
            next()
        }
    } else {
        next()
    }
})

export default router
