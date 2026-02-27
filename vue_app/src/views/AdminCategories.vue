<script setup lang="ts">
import { ref } from 'vue'
import { useGetCategories } from '../hooks/useCategories'
import { useQueryClient } from '@tanstack/vue-query'

const { data: categories, isLoading } = useGetCategories()
const queryClient = useQueryClient()
const isCreating = ref(false)

const handleCreateCategory = async () => {
    const name = window.prompt("Enter new category name:")
    if (!name) return

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    isCreating.value = true
    try {
        const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:4000/api') + '/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, slug })
        })
        if (!res.ok) throw new Error("Failed to create")
        queryClient.invalidateQueries({ queryKey: ['categories'] })
    } catch (err: any) {
        alert("Error: " + err.message)
    } finally {
        isCreating.value = false
    }
}
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-bold">Manage Categories</h2>
        <p class="text-muted-foreground mt-1">Add or remove blog post categories</p>
      </div>
      <button 
        @click="handleCreateCategory"
        :disabled="isCreating"
        class="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
      >
        <span v-if="isCreating" class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        New Category
      </button>
    </div>

    <div class="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
      <div v-if="isLoading" class="p-8 text-center text-muted-foreground">Loading categories...</div>
      
      <table v-else-if="categories && categories.length > 0" class="w-full text-sm text-left">
        <thead class="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
          <tr>
            <th class="px-6 py-4 font-semibold">ID</th>
            <th class="px-6 py-4 font-semibold">Name</th>
            <th class="px-6 py-4 font-semibold text-right">Slug</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="category in categories" :key="category.id" class="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
            <td class="px-6 py-4 font-mono text-xs text-muted-foreground">{{ category.id }}</td>
            <td class="px-6 py-4 font-medium">{{ category.name }}</td>
            <td class="px-6 py-4 text-right">
                <span class="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs font-mono">{{ category.slug }}</span>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-else class="p-12 flex flex-col items-center justify-center text-center">
        <div class="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
        </div>
        <h3 class="text-lg font-medium mb-1">No categories yet</h3>
        <p class="text-sm text-muted-foreground max-w-[250px]">Get started by creating your first blog category.</p>
      </div>
    </div>
  </div>
</template>
