<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Check, Menu, Code, X, ChevronDown, Monitor, Cpu, Sparkles, Briefcase } from 'lucide-vue-next'
import FlowchartHero from './components/FlowchartHero.vue'
import AnimatedThemeToggler from './components/ui/animated-theme-toggler.vue'
import BentoGrid from './components/ui/bento-grid/BentoGrid.vue'
import BentoCard from './components/ui/bento-grid/BentoCard.vue'

const projects = [
  {
    name: "E-Commerce Platform UX",
    description: "Redesigning the shopping experience for maximum conversions and customer retention.",
    href: "#",
    cta: "View Case Study",
    icon: Monitor,
    class: "lg:col-span-2 lg:row-span-1",
  },
  {
    name: "AI-Powered Products",
    description: "Cutting-edge AI tools designed to automate, analyze, and accelerate your business growth.",
    href: "#",
    cta: "Explore Our Products",
    icon: Sparkles,
    class: "lg:col-span-1 lg:row-span-2",
  },
  {
    name: "Strategic Tech Consulting",
    description: "Expert guidance on architecture, scaling, and digital transformation.",
    href: "#contact",
    cta: "Talk to an Expert",
    icon: Briefcase,
    class: "lg:col-span-1 lg:row-span-1",
  },
  {
    name: "Business Automation AI",
    description: "Implementing generative AI to automate 80% of routine workflows.",
    href: "#",
    cta: "View Case Study",
    icon: Cpu,
    class: "lg:col-span-1 lg:row-span-1",
  }
]

const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

const typewriterChunks = ref<{id: number, text: string, class: string}[]>([])
const codeSnippet = [
  { text: "const ", class: "text-[#c586c0]" },
  { text: "kodingin ", class: "text-[#9cdcfe]" },
  { text: "= {\n", class: "" },
  { text: "  mission: ", class: "text-[#4fc1ff]" },
  { text: "'Digital Excellence'", class: "text-[#ce9178]" },
  { text: ",\n", class: "" },
  { text: "  precision: ", class: "text-[#4fc1ff]" },
  { text: "true", class: "text-[#c586c0]" },
  { text: ",\n", class: "" },
  { text: "  logic: ", class: "text-[#4fc1ff]" },
  { text: "'Every Line'", class: "text-[#ce9178]" },
  { text: ",\n", class: "" },
  { text: "  build: ", class: "text-[#4fc1ff]" },
  { text: "() => ", class: "text-[#c586c0]" },
  { text: "{\n", class: "" },
  { text: "    return ", class: "text-[#c586c0]" },
  { text: "'Scalable Future'", class: "text-[#ce9178]" },
  { text: ";\n", class: "" },
  { text: "  }\n", class: "" },
  { text: "};", class: "" }
];

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  document.documentElement.classList.add('dark')

  // Typing animation observer
  let i = 0;
  let charIndex = 0;
  const typeCode = () => {
    if (i < codeSnippet.length) {
      const token = codeSnippet[i]
      if (!token) return
      if (charIndex === 0) {
        typewriterChunks.value.push({ id: i, text: '', class: token.class })
      }

      if (charIndex < token.text.length && typewriterChunks.value[i]) {
        typewriterChunks.value[i]!.text += token.text.charAt(charIndex)
        charIndex++
        setTimeout(typeCode, Math.random() * 30 + 30) // Random typing speed
      } else {
        i++
        charIndex = 0
        setTimeout(typeCode, Math.random() * 50 + 50) // Pause between tokens
      }
    }
  }

  const codeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        typeCode()
        codeObserver.disconnect()
      }
    })
  }, { threshold: 0.5 })

  const el = document.getElementById('code-window-ref');
  if (el) codeObserver.observe(el);
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
        <a href="#" class="flex items-center">
          <img src="@/assets/1-removebg-preview.svg" alt="kodingin" class="h-12 w-auto theme-logo-light" />
          <img src="@/assets/2-removebg-preview.svg" alt="kodingin" class="h-12 w-auto theme-logo-dark" />
        </a>
        
        <nav class="hidden md:flex items-center gap-8">
          <a href="#hero" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</a>
          
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <span class="inline-flex flex-row items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors outline-none cursor-pointer">
                Services <ChevronDown class="w-4 h-4" />
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-40">
              <DropdownMenuItem as-child><a href="#services">All Services</a></DropdownMenuItem>
              <DropdownMenuItem as-child><a href="#projects">What We Build</a></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <span class="inline-flex flex-row items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors outline-none cursor-pointer">
                About <ChevronDown class="w-4 h-4" />
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-40">
              <DropdownMenuItem as-child><a href="#about">About Us</a></DropdownMenuItem>
              <DropdownMenuItem as-child><a href="/blog">Blog</a></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <a href="#pricing" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          
          <a href="#contact" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contact</a>

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
      <a href="#hero" class="text-2xl font-semibold" @click="isMobileMenuOpen = false">Home</a>
      <a href="#services" class="text-2xl font-semibold" @click="isMobileMenuOpen = false">Services</a>
      <a href="#about" class="text-2xl font-semibold" @click="isMobileMenuOpen = false">About</a>
      <a href="#pricing" class="text-2xl font-semibold" @click="isMobileMenuOpen = false">Pricing</a>
      <a href="#contact" class="text-2xl font-semibold" @click="isMobileMenuOpen = false">Contact</a>
    </div>

    <!-- Hero Section -->
    <section id="hero" class="min-h-screen flex items-center relative overflow-hidden pt-20">
      <!-- Ambient Background Effects -->
      <div class="absolute inset-0 bg-[url('@/assets/noise.png')] opacity-[0.03] pointer-events-none"></div>
      <!-- Decorative Glow -->
      <div class="absolute -top-1/4 -right-10 w-1/2 h-[80%] bg-[radial-gradient(circle,rgba(138,43,226,0.3)_0%,transparent_70%)] blur-[80px] -z-10"></div>
      
      <div class="container mx-auto px-5 max-w-6xl relative z-10 grid md:grid-cols-2 gap-12 items-center">
        <div class="max-w-2xl">
          <h1 class="text-5xl md:text-7xl font-bold leading-tight mb-6 animate-in slide-in-from-bottom-8 duration-700">
            Code Your <span class="text-transparent bg-clip-text bg-gradient-to-br from-purple-500 to-indigo-800">Future</span>.
          </h1>
          <p class="text-xl text-muted-foreground mb-10 animate-in slide-in-from-bottom-8 duration-700 delay-150">
            Premium web development & automation solutions designed to scale your business with elegance and efficiency.
          </p>
          <div class="flex flex-wrap gap-4 animate-in slide-in-from-bottom-8 duration-700 delay-300">
            <Button as-child size="lg" class="bg-gradient-to-br from-purple-600 to-indigo-800 hover:opacity-90 shadow-lg shadow-purple-500/20 text-lg">
              <a href="#services">Explore Services</a>
            </Button>
            <Button as-child variant="outline" size="lg" class="text-lg bg-transparent border-border hover:border-primary hover:bg-primary/5">
              <a href="#about">Learn More</a>
            </Button>
          </div>
        </div>

        <div class="hidden md:flex justify-center items-center relative min-h-[500px]">
          <FlowchartHero />
        </div>
      </div>
    </section>

    <!-- Content Sections -->
    <div class="max-w-6xl mx-auto px-5 w-full">
      <!-- Services Section -->
      <section id="services" class="py-24">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold mb-4">Our Expertise</h2>
          <p class="text-lg text-muted-foreground">Tailored solutions for modern businesses.</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <Card class="bg-card hover:-translate-y-2 transition-transform duration-300 border-border hover:border-primary">
            <CardHeader>
              <div class="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                <Code class="w-7 h-7" />
              </div>
              <CardTitle class="text-2xl">Web Development</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription class="text-base">High-performance websites built with modern frameworks. Fast, responsive, and SEO-optimized.</CardDescription>
            </CardContent>
          </Card>
          
          <Card class="bg-card hover:-translate-y-2 transition-transform duration-300 border-border hover:border-primary">
            <CardHeader>
              <div class="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                <!-- Automation icon -->
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
              </div>
              <CardTitle class="text-2xl">Automation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription class="text-base">Streamline repetitive tasks with custom scripts and robust automation workflows.</CardDescription>
            </CardContent>
          </Card>

          <Card class="bg-card hover:-translate-y-2 transition-transform duration-300 border-border hover:border-primary">
            <CardHeader>
              <div class="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                <!-- Consulting icon -->
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
              </div>
              <CardTitle class="text-2xl">Consulting</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription class="text-base">Expert advice on tech stack selection, architecture, and digital transformation strategies.</CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      <!-- Projects Section -->
      <section id="projects" class="py-24">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold mb-4">What We Build</h2>
          <p class="text-lg text-muted-foreground">Transformative products, tailored solutions, and expert guidance.</p>
        </div>

        <BentoGrid>
          <BentoCard
            v-for="project in projects"
            :key="project.name"
            :name="project.name"
            :description="project.description"
            :icon="project.icon"
            :href="project.href"
            :cta="project.cta"
            :class="project.class"
          >
            <template #background>
               <div class="absolute inset-x-0 inset-y-[-30%] h-[160%] w-full bg-[radial-gradient(circle_at_center,rgba(138,43,226,0.1)_0%,transparent_60%)] blur-[40px] pointer-events-none"></div>
            </template>
          </BentoCard>
        </BentoGrid>
      </section>

      <!-- About Section -->
      <section id="about" class="py-24 rounded-3xl bg-secondary/30 px-8">
        <div class="grid md:grid-cols-2 gap-16 items-center">
          <div class="order-2 md:order-1 relative">
             <div class="bg-[#1e1e1e] rounded-xl border border-[#333] shadow-2xl overflow-hidden font-mono text-sm max-w-lg mx-auto">
               <div class="bg-[#252526] px-4 py-3 flex gap-2 border-b border-[#333]">
                 <div class="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                 <div class="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                 <div class="w-3 h-3 rounded-full bg-[#27c93f]"></div>
               </div>
               <div class="p-6 text-[#d4d4d4] leading-relaxed min-h-[250px]" id="code-window-ref">
                 <pre class="font-mono text-sm m-0 whitespace-pre-wrap"><span v-for="chunk in typewriterChunks" :key="chunk.id" :class="chunk.class">{{ chunk.text }}</span><span class="inline-block w-2.5 h-[1.2em] align-text-bottom bg-[#808080] ml-0.5 animate-pulse"></span></pre>
               </div>
             </div>
          </div>
          <div class="order-1 md:order-2">
            <h2 class="text-4xl md:text-5xl font-bold mb-6 leading-tight">Precision in Every Pixel. Logic in Every Line.</h2>
            <p class="text-lg text-muted-foreground mb-8">
              At <strong>kodingin</strong>, we believe that technology should be invisible—it should just work. We craft digital experiences that are not only visually stunning but also engineered for performance and scalability.
            </p>
            <ul class="space-y-4">
              <li class="flex items-center gap-3 text-lg"><Check class="text-primary w-5 h-5"/> Custom-tailored solutions</li>
              <li class="flex items-center gap-3 text-lg"><Check class="text-primary w-5 h-5"/> Data-driven design decisions</li>
              <li class="flex items-center gap-3 text-lg"><Check class="text-primary w-5 h-5"/> Future-proof architecture</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Pricing Section -->
      <section id="pricing" class="py-24">
         <div class="text-center mb-16">
          <h2 class="text-4xl font-bold mb-4">Transparent Pricing</h2>
          <p class="text-lg text-muted-foreground">Choose the plan that fits your ambition.</p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8 mt-10">
          <Card class="flex flex-col bg-card border-border hover:-translate-y-2 transition-all p-2">
            <CardHeader class="text-center">
              <CardTitle class="text-2xl font-semibold mb-2">Starter</CardTitle>
              <div class="text-5xl font-bold mb-2">$999<span class="text-xl text-muted-foreground font-normal">/mo</span></div>
              <CardDescription class="text-base my-2">Perfect for small businesses starting their digital journey.</CardDescription>
            </CardHeader>
            <CardContent class="flex-grow">
               <ul class="space-y-4 text-muted-foreground mb-8">
                <li class="flex items-center gap-3"><Check class="text-primary w-4 h-4"/> Custom Landing Page</li>
                <li class="flex items-center gap-3"><Check class="text-primary w-4 h-4"/> SEO Optimization</li>
                <li class="flex items-center gap-3"><Check class="text-primary w-4 h-4"/> Mobile Responsive</li>
                <li class="flex items-center gap-3"><Check class="text-primary w-4 h-4"/> 1 Month Support</li>
              </ul>
              <Button class="w-full mt-auto" variant="outline">Get Started</Button>
            </CardContent>
          </Card>

          <Card class="flex flex-col border-primary bg-gradient-to-b from-primary/10 to-card hover:-translate-y-2 transition-all scale-105 shadow-xl shadow-primary/10 p-2 relative">
            <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-[0_4px_10px_rgba(138,43,226,0.3)]">Most Popular</div>
            <CardHeader class="text-center pt-8">
              <CardTitle class="text-2xl font-semibold mb-2">Professional</CardTitle>
              <div class="text-5xl font-bold mb-2">$2,499<span class="text-xl text-muted-foreground font-normal">/mo</span></div>
              <CardDescription class="text-base my-2">Comprehensive solution for growing companies.</CardDescription>
            </CardHeader>
            <CardContent class="flex-grow">
               <ul class="space-y-4 text-muted-foreground mb-8">
                <li class="flex items-center gap-3"><Check class="text-primary w-4 h-4"/> Multi-page Website</li>
                <li class="flex items-center gap-3"><Check class="text-primary w-4 h-4"/> CMS Integration</li>
                <li class="flex items-center gap-3"><Check class="text-primary w-4 h-4"/> Advanced SEO & Analytics</li>
                <li class="flex items-center gap-3"><Check class="text-primary w-4 h-4"/> 3 Months Support</li>
                <li class="flex items-center gap-3"><Check class="text-primary w-4 h-4"/> Basic Automation</li>
              </ul>
              <Button class="w-full mt-auto bg-gradient-to-br from-purple-600 to-indigo-800">Get Started</Button>
            </CardContent>
          </Card>

          <Card class="flex flex-col bg-card border-border hover:-translate-y-2 transition-all p-2">
            <CardHeader class="text-center">
              <CardTitle class="text-2xl font-semibold mb-2">Enterprise</CardTitle>
              <div class="text-5xl font-bold mb-2">Custom</div>
              <CardDescription class="text-base my-2">Full-scale digital transformation and complex systems.</CardDescription>
            </CardHeader>
            <CardContent class="flex-grow">
               <ul class="space-y-4 text-muted-foreground mb-8">
                <li class="flex items-center gap-3"><Check class="text-primary w-4 h-4"/> Custom Web Applications</li>
                <li class="flex items-center gap-3"><Check class="text-primary w-4 h-4"/> Full Automation Suite</li>
                <li class="flex items-center gap-3"><Check class="text-primary w-4 h-4"/> Dedicated Project Manager</li>
                <li class="flex items-center gap-3"><Check class="text-primary w-4 h-4"/> 24/7 Priority Support</li>
              </ul>
              <Button class="w-full mt-auto" variant="outline">Contact Us</Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <!-- Contact Section -->
      <section id="contact" class="py-24 max-w-2xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold mb-4">Let's build something great.</h2>
          <p class="text-lg text-muted-foreground">Ready to start your project? Get in touch today.</p>
        </div>
        
        <Card class="p-8 border-border bg-secondary/50">
          <form @submit.prevent="" class="space-y-6">
            <div class="space-y-2">
              <Input type="text" placeholder="Name" class="bg-background" />
            </div>
            <div class="space-y-2">
              <Input type="email" placeholder="Email Address" class="bg-background" />
            </div>
            <div class="space-y-2">
              <Textarea placeholder="How can we help you?" class="min-h-[120px] bg-background" />
            </div>
            <Button class="w-full bg-gradient-to-br from-purple-600 to-indigo-800" size="lg">Send Message</Button>
          </form>
        </Card>
      </section>
    </div>

    <!-- Footer -->
    <footer class="border-t border-border bg-secondary/20 py-12 mt-12">
      <div class="container mx-auto px-5 max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <a href="#" class="flex items-center">
            <img src="@/assets/1-removebg-preview.svg" alt="kodingin" class="h-8 w-auto theme-logo-light" />
            <img src="@/assets/2-removebg-preview.svg" alt="kodingin" class="h-8 w-auto theme-logo-dark" />
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
