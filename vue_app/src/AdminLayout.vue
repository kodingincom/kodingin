<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isDark = ref(document.documentElement.classList.contains('dark'))

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}

const handleLogout = () => {
  // Demo logout - routes to home
  router.push('/')
}
</script>

<template>
  <div class="flex h-screen bg-background text-foreground overflow-hidden">
    <!-- Sidebar -->
    <aside class="w-64 border-r border-border bg-card flex flex-col shrink-0 transition-all duration-300 relative z-20">
      <router-link to="/" class="h-20 flex items-center px-8 text-2xl font-bold tracking-tighter border-b border-border hover:opacity-80 transition-opacity">
        koding<span class="text-primary italic">in</span>
      </router-link>

      <nav class="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        <router-link to="/admin" class="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors font-medium" exact-active-class="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span>Dashboard</span>
        </router-link>
        
        <router-link to="/admin/posts" class="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors font-medium" active-class="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span>Blog Posts</span>
        </router-link>

        <router-link to="/admin/categories" class="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors font-medium" active-class="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 9h16" />
            <path d="M4 15h16" />
            <path d="M10 3L8 21" />
            <path d="M16 3l-2 18" />
          </svg>
          <span>Categories</span>
        </router-link>

        <div class="mt-auto space-y-2">
            <button @click="toggleTheme" class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors font-medium">
                <span class="w-5 h-5 flex items-center justify-center text-lg">{{ isDark ? '🌞' : '🌙' }}</span>
                <span>Toggle Theme</span>
            </button>
            <a href="#" @click.prevent="handleLogout" class="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Logout</span>
            </a>
        </div>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col h-full bg-secondary/5 relative z-10 w-full overflow-hidden">
      <header class="h-20 flex items-center justify-between px-8 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30">
        <div>
          <h1 class="text-2xl font-bold capitalize tracking-tight">{{ $route.name || 'Overview' }}</h1>
          <p class="text-sm text-muted-foreground mt-1">Manage your website content</p>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-right hidden sm:block">
            <div class="text-sm font-semibold text-foreground">Admin User</div>
            <div class="text-xs text-muted-foreground font-medium">System Admin</div>
          </div>
          <div class="w-10 h-10 rounded-full bg-primary/10 text-primary border border-primary/20 flex flex-col items-center justify-center font-bold shadow-sm">
            A
          </div>
        </div>
      </header>

      <!-- Dynamic Page Content -->
      <div class="flex-1 overflow-y-auto w-full relative">
          <router-view></router-view>
      </div>
    </main>
  </div>
</template>
