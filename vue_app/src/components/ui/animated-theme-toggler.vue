<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { Sun, Moon } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  duration?: number
  class?: string
}>(), {
  duration: 400,
  class: ''
})

const isDark = ref(false)
const buttonRef = ref<HTMLButtonElement | null>(null)

const updateTheme = () => {
  isDark.value = document.documentElement.classList.contains('dark')
}

let observer: MutationObserver | null = null

onMounted(() => {
  updateTheme()
  observer = new MutationObserver(updateTheme)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  })
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})

const toggleTheme = async () => {
  if (!buttonRef.value) return

  const doc = document as any
  
  // Check if browser supports View Transitions API
  if (!doc.startViewTransition) {
    const newTheme = !isDark.value
    isDark.value = newTheme
    document.documentElement.classList.toggle("dark", newTheme)
    localStorage.setItem("theme", newTheme ? "dark" : "light")
    return
  }

  // @ts-ignore - document.startViewTransition isn't always typed
  const transition = doc.startViewTransition(async () => {
    const newTheme = !isDark.value
    isDark.value = newTheme
    document.documentElement.classList.toggle("dark", newTheme)
    localStorage.setItem("theme", newTheme ? "dark" : "light")
    await nextTick()
  })

  await transition.ready

  const { top, left, width, height } = buttonRef.value.getBoundingClientRect()
  const x = left + width / 2
  const y = top + height / 2
  const maxRadius = Math.hypot(
    Math.max(left, window.innerWidth - left),
    Math.max(top, window.innerHeight - top)
  )

  document.documentElement.animate(
    {
      clipPath: [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${maxRadius}px at ${x}px ${y}px)`,
      ],
    },
    {
      duration: props.duration,
      easing: "ease-in-out",
      pseudoElement: "::view-transition-new(root)",
    }
  )
}
</script>

<template>
  <button
    ref="buttonRef"
    @click="toggleTheme"
    :class="['cursor-pointer text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center', props.class]"
    aria-label="Toggle theme"
  >
    <Sun v-if="!isDark" class="w-5 h-5 flex-shrink-0" />
    <Moon v-else class="w-5 h-5 flex-shrink-0" />
  </button>
</template>
