<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Menu, X, ChevronDown, ArrowLeft } from 'lucide-vue-next'
import AnimatedThemeToggler from './components/ui/animated-theme-toggler.vue'
import { useRoute } from 'vue-router'
import { useGetPost } from './hooks/usePosts'

const route = useRoute()
const postSlug = route.params.slug as string
const { data: post, isLoading, error } = useGetPost(postSlug)

const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  if (!document.documentElement.classList.contains('dark')) {
    document.documentElement.classList.add('dark')
  }
  // Scroll to top on load
  window.scrollTo(0, 0)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="min-h-screen bg-background text-foreground overflow-x-hidden font-sans">
    <!-- Navbar -->
    <header
      :class="['fixed top-0 w-full z-50 transition-all duration-300', isScrolled ? 'bg-background/90 backdrop-blur-md border-b border-border py-4' : 'bg-transparent py-5']"
    >
      <div class="container mx-auto px-5 flex justify-between items-center max-w-6xl">
        <router-link to="/" class="text-2xl font-bold tracking-tight">
          koding<span class="text-primary">in</span>
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
    <div
      v-show="isMobileMenuOpen"
      class="fixed inset-0 z-40 bg-background flex flex-col items-center justify-center gap-8"
    >
      <span class="absolute top-5 right-5 cursor-pointer text-foreground" @click="isMobileMenuOpen = false">
        <X class="w-6 h-6" />
      </span>
      <router-link to="/#hero" class="text-2xl font-semibold" @click="isMobileMenuOpen = false">Home</router-link>
      <router-link to="/#services" class="text-2xl font-semibold" @click="isMobileMenuOpen = false">Services</router-link>
      <router-link to="/#about" class="text-2xl font-semibold" @click="isMobileMenuOpen = false">About</router-link>
      <router-link to="/blog" class="text-2xl font-semibold" @click="isMobileMenuOpen = false">Blog</router-link>
      <router-link to="/#pricing" class="text-2xl font-semibold" @click="isMobileMenuOpen = false">Pricing</router-link>
      <router-link to="/#contact" class="text-2xl font-semibold" @click="isMobileMenuOpen = false">Contact</router-link>
    </div>

    <!-- Article Hero -->
    <section class="pt-40 pb-10 relative overflow-hidden">
      <div class="container mx-auto px-5 max-w-3xl">
        <router-link to="/blog" class="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft class="w-4 h-4 mr-2" /> Back to Blog
        </router-link>
        
        <div v-if="isLoading" class="h-[300px] w-full rounded-2xl bg-secondary/20 flex animate-pulse mb-8" />
        <div v-else-if="error" class="h-[300px] w-full rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive mb-8">
          Error loading the article.
        </div>
        <div v-else-if="post">
          <div class="h-[300px] w-full rounded-2xl overflow-hidden mb-8 relative group">
            <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200" :alt="post.title" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <span class="absolute top-5 right-5 bg-background/80 backdrop-blur-sm text-foreground text-xs font-semibold px-3 py-1.5 rounded-full z-10">
              Article
            </span>
            <div class="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
          </div>
          
          <div class="animate-in slide-in-from-bottom-4 duration-700">
            <h1 class="text-4xl md:text-5xl font-bold leading-tight mb-4">{{ post.title }}</h1>
            <div class="flex items-center flex-wrap gap-2 text-sm text-muted-foreground font-medium">
              <span>{{ new Date(post.createdAt).toLocaleDateString() }}</span>
              <span>&bull;</span>
              <span>5 min read</span>
              <span>&bull;</span>
              <span>By Admin</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Article Content -->
    <section class="pb-24 bg-secondary/5 pt-10">
      <div class="container mx-auto px-5 max-w-3xl animate-in fade-in duration-1000 delay-300">
        <div v-if="post" class="prose prose-invert prose-lg max-w-none tiptap-content" v-html="post.content"></div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-border bg-secondary/20 py-12">
      <div class="container mx-auto px-5 max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <router-link to="/" class="text-xl font-bold tracking-tight">
            koding<span class="text-primary">in</span>
          </router-link>
          <p class="text-sm text-muted-foreground mt-2"><span style="font-family: system-ui;">&copy;</span> 2026 kodingin. All rights reserved.</p>
        </div>
        <div class="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#" class="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" class="hover:text-primary transition-colors">Terms of Service</a>
          <div class="flex gap-4 ml-4">
             <a href="#" class="hover:text-primary transition-colors">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
               </svg>
             </a>
             <a href="#" class="hover:text-primary transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                   <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
             </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
html {
  scroll-behavior: smooth;
}
</style>
