<script setup lang="ts">
import { useGetPosts, useDeletePost } from '../hooks/usePosts'

const { data: posts, isLoading, error } = useGetPosts()
const { mutate: deletePost, isPending: deleting } = useDeletePost()

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const handleDelete = (id: number, title: string) => {
    if (confirm(`Are you sure you want to permanently delete "${title}"?`)) {
        deletePost(id, {
            onError: (err) => alert('Failed to delete: ' + err.message)
        })
    }
}
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between flex-wrap gap-4 items-center mb-8">
      <h2 class="text-2xl font-bold">All Blog Posts</h2>
      <router-link to="/admin/post/new" class="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium text-sm transition-colors flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        New Post
      </router-link>
    </div>

    <div v-if="isLoading" class="text-center py-12 text-muted-foreground">
      Loading posts...
    </div>
    
    <div v-else-if="error" class="bg-destructive/10 text-destructive p-4 rounded-md border border-destructive/20 border-l-4 border-l-destructive">
      Failed to load posts. Please ensure the backend is running.
    </div>

    <div v-else-if="posts?.length === 0" class="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
      No posts found. Create your first blog post!
    </div>

    <div v-else class="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <table class="w-full text-left border-collapse">
            <thead class="bg-secondary/20">
                <tr>
                    <th class="p-4 font-semibold border-b border-border text-xs uppercase tracking-wider text-muted-foreground">Title</th>
                    <th class="p-4 font-semibold border-b border-border text-xs uppercase tracking-wider text-muted-foreground">Slug</th>
                    <th class="p-4 font-semibold border-b border-border text-xs uppercase tracking-wider text-muted-foreground">Date</th>
                    <th class="p-4 font-semibold border-b border-border text-xs uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="post in posts" :key="post.id" class="border-b border-border last:border-0 hover:bg-secondary/5 transition-colors" :class="{'opacity-50': deleting}">
                    <td class="p-4 font-medium">{{ post.title }}</td>
                    <td class="p-4 text-muted-foreground text-sm font-mono">{{ post.slug }}</td>
                    <td class="p-4 text-muted-foreground text-sm">{{ formatDate(post.createdAt) }}</td>
                    <td class="p-4 text-right flex justify-end gap-3 items-center">
                        <router-link :to="`/blog/${post.slug}`" target="_blank" class="text-primary hover:underline font-medium text-sm">View</router-link>
                        <router-link :to="`/admin/post/${post.slug}/edit`" class="text-chart-2 hover:underline font-medium text-sm">Edit</router-link>
                        <button @click="handleDelete(post.id, post.title)" class="text-destructive hover:underline font-medium text-sm">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
  </div>
</template>
