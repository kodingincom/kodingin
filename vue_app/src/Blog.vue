<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Card, CardContent } from '@/components/ui/card'
import { Menu, X, ChevronDown } from 'lucide-vue-next'
import AnimatedThemeToggler from './components/ui/animated-theme-toggler.vue'
import { ArrowRight } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';

import { useGetPosts } from './hooks/usePosts'

const { data: posts, isLoading, error } = useGetPosts()

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
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// Function to generate deterministic random gradients from a string seed (like slug or title)
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
  <div class="min-h-screen bg-background text-foreground overflow-x-hidden font-sans">
    <!-- Navbar -->
    <header
      :class="['fixed top-0 w-full z-50 transition-all duration-300', isScrolled ? 'bg-background/90 backdrop-blur-md border-b border-border py-4' : 'bg-transparent py-5']"
    >
      <div class="container mx-auto px-5 flex justify-between items-center max-w-6xl">
        <a href="/" class="flex items-center">
          <img src="@/assets/2-removebg-preview.svg" alt="kodingin" class="h-8 block dark:hidden" />
          <img src="@/assets/1-removebg-preview.svg" alt="kodingin" class="h-8 hidden dark:block" />
        </a>
        
        <nav class="hidden md:flex items-center gap-8">
          <a href="/#hero" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</a>
          
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <span class="inline-flex flex-row items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors outline-none cursor-pointer">
                Services <ChevronDown class="w-4 h-4" />
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-40">
              <DropdownMenuItem as-child><a href="/#services">All Services</a></DropdownMenuItem>
              <DropdownMenuItem as-child><a href="/#projects">What We Build</a></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <span class="inline-flex flex-row items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors outline-none cursor-pointer">
                About <ChevronDown class="w-4 h-4" />
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-40">
              <DropdownMenuItem as-child><a href="/#about">About Us</a></DropdownMenuItem>
              <DropdownMenuItem as-child><a href="/blog">Blog</a></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <a href="/#pricing" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          
          <a href="/#contact" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contact</a>

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
      <a href="/#hero" class="text-2xl font-semibold" @click="isMobileMenuOpen = false">Home</a>
      <a href="/#services" class="text-2xl font-semibold" @click="isMobileMenuOpen = false">Services</a>
      <a href="/#about" class="text-2xl font-semibold" @click="isMobileMenuOpen = false">About</a>
      <a href="/blog" class="text-2xl font-semibold" @click="isMobileMenuOpen = false">Blog</a>
      <a href="/#pricing" class="text-2xl font-semibold" @click="isMobileMenuOpen = false">Pricing</a>
      <a href="/#contact" class="text-2xl font-semibold" @click="isMobileMenuOpen = false">Contact</a>
    </div>

    <!-- Blog Hero -->
    <section class="pt-40 pb-16 relative overflow-hidden">
      <!-- Decorative Glow -->
      <div class="absolute -top-1/4 left-1/2 -translate-x-1/2 w-1/2 h-full bg-[radial-gradient(ellipse_at_top,rgba(138,43,226,0.3)_0%,transparent_70%)] blur-[80px] -z-10 pointer-events-none"></div>

      <div class="container mx-auto px-5 max-w-6xl text-center">
        <h1 class="text-5xl md:text-6xl font-bold leading-tight mb-6 animate-in slide-in-from-bottom-8 duration-700">
          Our Latest <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-800">Thinking</span>
        </h1>
        <p class="text-xl text-muted-foreground max-w-2xl mx-auto animate-in slide-in-from-bottom-8 duration-700 delay-150">
          Insights, tutorials, and perspectives on the future of tech.
        </p>
      </div>
    </section>

    <!-- Main Blog Content -->
    <section id="blog-posts" class="py-16 bg-secondary/10">
      <div class="container mx-auto px-5 max-w-6xl">
        <div v-if="isLoading" class="text-center py-20 text-xl font-medium text-muted-foreground w-full">Loading posts...</div>
        <div v-else-if="error" class="text-center py-20 text-xl font-medium text-destructive w-full">Error loading posts. Is backend running?</div>
        <div v-else-if="posts?.length === 0" class="text-center py-20 text-xl font-medium text-muted-foreground w-full">No articles found! Please add some via the admin panel.</div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <Card 
            v-for="(post, index) in posts" 
            :key="post.id"
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
                Category
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

        <!-- Pagination -->
        <div class="mt-16 flex justify-center items-center gap-2">
          <Button variant="default" size="icon" class="w-10 h-10 rounded-full font-bold">1</Button>
          <Button variant="outline" size="icon" class="w-10 h-10 rounded-full bg-transparent hover:bg-secondary border-border font-medium">2</Button>
          <Button variant="outline" size="icon" class="w-10 h-10 rounded-full bg-transparent hover:bg-secondary border-border font-medium">3</Button>
          <Button variant="outline" class="rounded-full bg-transparent hover:bg-secondary border-border font-medium ml-2 px-6">Next <ArrowRight class="ml-2 w-4 h-4"/></Button>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-border bg-secondary/20 py-12">
      <div class="container mx-auto px-5 max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <a href="/" class="flex items-center">
            <img src="@/assets/2-removebg-preview.svg" alt="kodingin" class="h-6 block dark:hidden" />
            <img src="@/assets/1-removebg-preview.svg" alt="kodingin" class="h-6 hidden dark:block" />
          </a>
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
