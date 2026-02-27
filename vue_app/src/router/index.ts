import { createRouter, createWebHistory } from 'vue-router'
import App from '../App.vue'
import Blog from '../Blog.vue'
import AdminLayout from '../AdminLayout.vue'
import AdminPosts from '../views/AdminPosts.vue'
import AdminPostNew from '../views/AdminPostNew.vue'

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
        path: '/admin',
        component: AdminLayout,
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

export default router
