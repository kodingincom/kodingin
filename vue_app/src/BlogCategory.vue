<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowRight, Menu, X, ChevronDown } from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Card, CardContent } from '@/components/ui/card'
import AnimatedThemeToggler from './components/ui/animated-theme-toggler.vue'

import { useGetPosts } from './hooks/usePosts'
import { useGetCategories } from './hooks/useCategories'

const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)
const isMobileServicesOpen = ref(false)
const isMobileAboutOpen = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const route = useRoute()
const categorySlug = computed(() => route.params.slug as string)

const { data: categories } = useGetCategories()

const currentCategory = computed(() => {
    return categories.value?.find((c: any) => c.slug === categorySlug.value)
})

const { data: posts, isLoading, error, refetch } = useGetPosts(currentCategory.value?.id?.toString())

watch(currentCategory, () => {
    if (currentCategory.value) {
        refetch()
    }
})

const getBgClass = (seed: string) => {
  const classes = [
    "bg-gradient-to-br from-purple-500/20 to-transparent",
    "bg-gradient-to-br from-blue-500/20 to-transparent",
    "bg-gradient-to-br from-emerald-500/20 to-transparent",
    "bg-gradient-to-br from-orange-500/20 to-transparent",
    "bg-gradient-to-br from-red-500/20 to-transparent",
    "bg-gradient-to-br from-indigo-500/20 to-transparent"
  ]
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  const positiveHash = hash < 0 ? -hash : hash
  return classes[positiveHash % classes.length]
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="min-h-screen flex flex-col pt-24 bg-background">
    
    <!-- Header Area -->
    <header
      :class="['fixed top-0 w-full z-50 transition-all duration-300', isScrolled ? 'bg-background/90 backdrop-blur-md border-b border-border py-4' : 'bg-transparent py-5']"
    >
      <div class="container mx-auto px-5 flex justify-between items-center max-w-6xl">
        <router-link to="/" class="flex items-center">
          <img src="@/assets/1-removebg-preview.svg" alt="kodingin" class="h-12 w-auto theme-logo-light" />
          <img src="@/assets/2-removebg-preview.svg" alt="kodingin" class="h-12 w-auto theme-logo-dark" />
        </router-link>
        
        <nav class="hidden md:flex items-center gap-8">
          <router-link to="/#hero" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</router-link>
          
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <span class="inline-flex flex-row items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors outline-none cursor-pointer">
                Services <ChevronDown class="w-4 h-4" />
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-40">
              <DropdownMenuItem as-child><router-link to="/#services">All Services</router-link></DropdownMenuItem>
              <DropdownMenuItem as-child><router-link to="/#projects">What We Build</router-link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <span class="inline-flex flex-row items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors outline-none cursor-pointer">
                About <ChevronDown class="w-4 h-4" />
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-40">
              <DropdownMenuItem as-child><router-link to="/#about">About Us</router-link></DropdownMenuItem>
              <DropdownMenuItem as-child><router-link to="/blog">Blog</router-link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <router-link to="/#pricing" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</router-link>
          
          <router-link to="/#contact" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contact</router-link>

          <AnimatedThemeToggler />
        </nav>

        <span class="md:hidden cursor-pointer text-foreground" @click="isMobileMenuOpen = !isMobileMenuOpen">
          <Menu class="w-6 h-6" />
        </span>
      </div>
    </header>

    <!-- Mobile Menu -->
    <transition name="mobile-menu">
      <div
        v-if="isMobileMenuOpen"
        class="fixed inset-0 z-40 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center gap-8 overflow-y-auto py-20"
      >
        <span class="absolute top-5 right-5 cursor-pointer text-foreground p-2" @click="isMobileMenuOpen = false">
          <X class="w-6 h-6" />
        </span>
        <router-link to="/#hero" class="text-2xl font-semibold" @click="isMobileMenuOpen = false">Home</router-link>
        
        <div class="flex flex-col items-center gap-4">
          <div class="flex items-center gap-2 cursor-pointer text-2xl font-semibold" @click="isMobileServicesOpen = !isMobileServicesOpen">
            Services <ChevronDown class="w-6 h-6 transition-transform" :class="{ 'rotate-180': isMobileServicesOpen }" />
          </div>
          <div v-show="isMobileServicesOpen" class="flex flex-col items-center gap-4 text-lg text-muted-foreground">
            <router-link to="/#services" @click="isMobileMenuOpen = false" class="hover:text-foreground">All Services</router-link>
            <router-link to="/#projects" @click="isMobileMenuOpen = false" class="hover:text-foreground">What We Build</router-link>
          </div>
        </div>

        <div class="flex flex-col items-center gap-4">
          <div class="flex items-center gap-2 cursor-pointer text-2xl font-semibold" @click="isMobileAboutOpen = !isMobileAboutOpen">
            About <ChevronDown class="w-6 h-6 transition-transform" :class="{ 'rotate-180': isMobileAboutOpen }" />
          </div>
          <div v-show="isMobileAboutOpen" class="flex flex-col items-center gap-4 text-lg text-muted-foreground">
            <router-link to="/#about" @click="isMobileMenuOpen = false" class="hover:text-foreground">About Us</router-link>
            <router-link to="/blog" @click="isMobileMenuOpen = false" class="hover:text-foreground">Blog</router-link>
          </div>
        </div>

        <router-link to="/#pricing" class="text-2xl font-semibold" @click="isMobileMenuOpen = false">Pricing</router-link>
        <router-link to="/#contact" class="text-2xl font-semibold" @click="isMobileMenuOpen = false">Contact</router-link>
        <AnimatedThemeToggler />
      </div>
    </transition>

    <div class="container mx-auto px-5 max-w-6xl py-12 flex-grow">
        <h1 class="text-4xl font-bold mb-4 capitalize">Category: <span class="text-primary">{{ currentCategory?.name || categorySlug.replace('-', ' ') }}</span></h1>
        <p class="text-muted-foreground mb-12 text-lg">Browsing posts regarding {{ currentCategory?.name || categorySlug }}</p>

        <div v-if="isLoading" class="text-center py-20 text-xl font-medium text-muted-foreground w-full">Loading posts...</div>
        <div v-else-if="error" class="text-center py-20 text-xl font-medium text-destructive w-full">Error loading posts. Is backend running?</div>
        <div v-else-if="posts?.length === 0" class="text-center py-20 text-xl font-medium text-muted-foreground w-full">No articles found in this category!</div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card 
            v-for="(post, index) in posts" 
            :key="post.id"
            class="group bg-card border-border hover:border-primary/50 transition-all duration-300 overflow-hidden flex flex-col h-full animate-in fade-in slide-in-from-bottom-4"
            :style="{ animationDelay: `${(Number(index) % 3) * 150}ms`, animationFillMode: 'both' }"
          >
            <!-- Thumbnail -->
            <div :class="['h-48 relative overflow-hidden flex items-start justify-end p-4', getBgClass(post.slug)]">
              <!-- Default Image fallback -->
              <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600" :alt="post.title" class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-50 mix-blend-overlay" />
              <!-- Cover overlay gradient -->
              <div class="absolute inset-0 bg-gradient-to-t from-background/95 via-background/60 to-transparent z-0 pointer-events-none" />
            </div>

            <CardContent class="p-6 flex flex-col flex-grow relative z-10">
              <div class="text-xs font-semibold text-primary mb-2 uppercase tracking-wider">
                {{ currentCategory?.name || 'Category' }}
              </div>
              <div class="text-sm text-muted-foreground mb-3 font-medium">
                {{ formatDate(post.createdAt) }} &bull; 5 min read
              </div>
              <h3 class="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                <router-link :to="`/blog/${post.slug}`" class="after:absolute after:inset-0">{{ post.title }}</router-link>
              </h3>
              <p class="text-muted-foreground mb-6 flex-grow text-sm leading-relaxed" v-html="post.content.substring(0, 100) + '...'">
              </p>
              
              <div class="flex items-center text-sm font-medium text-primary mt-auto">
                Read Article <ArrowRight class="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  </div>
</template>
