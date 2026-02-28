<template>
  <div class="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center font-inter p-6">
    <div class="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
      
      <div class="text-center mb-8">
        <h1 class="text-3xl font-recoleta font-bold tracking-tight mb-2">Admin Panel</h1>
        <p class="text-gray-400 text-sm">Please sign in to access the dashboard</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-300 mb-2">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            required
            class="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50 focus:border-[#8B5CF6] transition-all"
            placeholder="admin@kodingin.com"
          >
        </div>

        <div>
           <label for="password" class="block text-sm font-medium text-gray-300 mb-2">Password</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            required
            class="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50 focus:border-[#8B5CF6] transition-all"
            placeholder="••••••••"
          >
        </div>

        <div v-if="errorMessage" class="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg text-center">
            {{ errorMessage }}
        </div>

        <button 
          type="submit" 
          :disabled="isSubmitting"
          class="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
        >
            <span v-if="isSubmitting">Authenticating...</span>
            <span v-else>Sign In</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authClient } from '../lib/auth'

const email = ref('')
const password = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')
const router = useRouter()

const handleLogin = async () => {
    isSubmitting.value = true
    errorMessage.value = ''

    // @ts-ignore - better-auth types are acting up in strict mode
    const { data, error } = await authClient.signIn.email({
        email: email.value,
        password: password.value
    });

    isSubmitting.value = false;

    if (error) {
        console.error("Login failed:", error);
        errorMessage.value = error.message || "Invalid credentials.";
    } else {
        router.push('/admin');
    }
}
</script>
