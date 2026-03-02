<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TiptapEditor from '../components/TiptapEditor.vue'
import { useCreatePost, useUpdatePost, useGetPost } from '../hooks/usePosts'
import { useGetCategories } from '../hooks/useCategories'

const router = useRouter()
const route = useRoute()
const editSlug = route.params.slug as string | undefined

const isEditing = !!editSlug

const { mutate: createPost, isPending: creating } = useCreatePost()
const { mutate: updatePost, isPending: updating } = useUpdatePost()
const { data: categories, isLoading: categoriesLoading } = useGetCategories()

const title = ref('')
const slug = ref('')
const categoryId = ref<number | ''>('')
const imageUrl = ref('')
const createdAtDate = ref(new Date().toISOString().substring(0, 10))
const content = ref('<p>Start writing your amazing blog post...</p>')
const id = ref<number | null>(null)

// If editing, load post data
if (isEditing) {
  const { data: postData } = useGetPost(editSlug as string)
  watch(postData, (newVal) => {
    if (newVal) {
      id.value = newVal.id
      title.value = newVal.title
      slug.value = newVal.slug
      categoryId.value = newVal.categoryId
      content.value = newVal.content
      imageUrl.value = newVal.imageUrl || ''
      if (newVal.createdAt) {
        try {
            // Redis cache might return string ISO or stringified integer
            const rawDate = newVal.createdAt;
            const isTimestampNumber = !isNaN(Number(rawDate)) && String(rawDate).length > 10;
            const d = new Date(isTimestampNumber ? Number(rawDate) : rawDate);
            
            if (!isNaN(d.getTime())) {
                 createdAtDate.value = d.toISOString().substring(0, 10)
            }
        } catch(e) { console.error("Bad date format", newVal.createdAt) }
      }
    }
  }, { immediate: true })
}

const handleSubmit = () => {
  if (!title.value || !slug.value || !categoryId.value || !content.value) {
    alert('Please fill in all required fields')
    return
  }

  const payload = {
    title: title.value,
    slug: slug.value,
    categoryId: Number(categoryId.value),
    content: content.value,
    imageUrl: imageUrl.value || undefined,
    createdAt: createdAtDate.value ? new Date(createdAtDate.value).toISOString() : undefined
  }

  if (isEditing && id.value) {
    updatePost({ id: id.value, post: payload }, {
      onSuccess: () => router.push('/admin/posts'),
      onError: (err) => alert('Error updating: ' + err.message)
    })
  } else {
    createPost(payload as any, {
      onSuccess: () => router.push('/admin/posts'),
      onError: (err) => alert('Error creating: ' + err.message)
    })
  }
}

// Auto-generate slug from title
const generateSlug = () => {
  if (!slug.value && title.value) {
    slug.value = title.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  }
}

const handleCoverUpload = async (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/upload`, {
            method: 'POST',
            body: formData
        })
        const data = await response.json()
        if (data.url) {
            imageUrl.value = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${data.url}`
        }
    } catch (err) {
        console.error('Failed to upload cover:', err)
        alert('Failed to upload cover image')
    }
}
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto">
    <div class="flex items-center gap-4 mb-8">
      <router-link to="/admin/posts" class="text-muted-foreground hover:text-foreground transition-colors p-2 -ml-2 rounded-full hover:bg-secondary">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </router-link>
      <h2 class="text-2xl font-bold">{{ isEditing ? 'Edit Post' : 'Create New Post' }}</h2>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-8">
      
      <div class="grid md:grid-cols-2 gap-6">
        <!-- Title -->
        <div class="space-y-2">
          <label class="text-sm font-semibold">Post Title *</label>
          <input 
            v-model="title" 
            @blur="generateSlug"
            type="text" 
            placeholder="e.g. Introduction to Vue 3" 
            class="w-full bg-background border border-border rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            required
          />
        </div>

        <!-- Slug -->
        <div class="space-y-2">
          <label class="text-sm font-semibold">URL Slug *</label>
          <input 
            v-model="slug" 
            type="text" 
            placeholder="introduction-to-vue-3" 
            class="w-full bg-background border border-border rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-mono text-sm"
            required
          />
        </div>

        <!-- Cover Image URL -->
        <div class="space-y-2">
          <label class="text-sm font-semibold">Cover Image</label>
          <div class="flex gap-2 items-center">
            <input 
              v-model="imageUrl" 
              type="url" 
              placeholder="URL or click Upload ->" 
              class="w-full bg-background border border-border rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            <label class="px-4 py-2.5 bg-secondary text-secondary-foreground rounded-md cursor-pointer hover:bg-secondary/80 flex border border-border whitespace-nowrap">
              Upload
              <input type="file" @change="handleCoverUpload" accept="image/*" class="hidden" />
            </label>
          </div>
        </div>

        <!-- Date -->
        <div class="space-y-2">
          <label class="text-sm font-semibold">Post Date</label>
          <input 
            v-model="createdAtDate" 
            type="date"
            disabled
            class="w-full bg-background border border-border rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all opacity-50 cursor-not-allowed"
          />
        </div>
      </div>

      <!-- Category -->
      <div class="space-y-2">
        <label class="text-sm font-semibold">Category *</label>
        <select 
          v-model="categoryId"
          class="w-full bg-background border border-border rounded-md px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          required
        >
          <option value="" disabled>Select a category</option>
          <option v-if="categoriesLoading" disabled>Loading categories...</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
        <p class="text-xs text-muted-foreground">Manage categories in the Categories dashboard.</p>
      </div>

      <!-- Tiptap Editor -->
      <div class="space-y-2">
        <label class="text-sm font-semibold">Post Content *</label>
        <TiptapEditor v-model="content" />
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-4 pt-4 border-t border-border">
        <router-link to="/admin/posts" class="px-6 py-2.5 rounded-md text-sm font-medium border border-border hover:bg-secondary transition-colors">
          Cancel
        </router-link>
        <button 
          type="submit" 
          :disabled="creating || updating"
          class="px-6 py-2.5 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <span v-if="creating || updating" class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
          {{ isEditing ? 'Update Post' : 'Publish Post' }}
        </button>
      </div>
    </form>
  </div>
</template>
