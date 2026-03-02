<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { watch, onBeforeUnmount } from 'vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits(['update:modelValue'])

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Image,
  ],
  editorProps: {
    attributes: {
      class: 'prose prose-invert max-w-none min-h-[300px] p-4 bg-background border border-border rounded-b-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
    },
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

watch(() => props.modelValue, (newValue) => {
  // Only update if content is actually different to prevent cursor jumping
  const isSame = editor.value?.getHTML() === newValue
  if (!isSame && editor.value) {
    editor.value.commands.setContent(newValue, { emitUpdate: false })
  }
})

onBeforeUnmount(() => {
  if (editor.value) editor.value.destroy()
})

const addImage = () => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'image/*'
    
    fileInput.onchange = async (event) => {
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
            if (data.url && editor.value) {
                editor.value.chain().focus().setImage({ src: `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${data.url}` }).run()
            }
        } catch (err) {
            console.error('Failed to upload image:', err)
            alert('Failed to upload image')
        }
    }
    fileInput.click()
}
</script>

<template>
  <div class="tiptap-wrapper" v-if="editor">
    <div class="toolbar flex flex-wrap gap-2 p-2 bg-secondary/20 border border-b-0 border-border rounded-t-lg">
      <button 
        @click.prevent="editor.chain().focus().toggleBold().run()"
        :disabled="!editor.can().chain().focus().toggleBold().run()"
        :class="{ 'bg-primary/20 text-primary': editor.isActive('bold') }"
        class="px-3 py-1.5 rounded text-sm font-medium hover:bg-secondary transition-colors"
      >
        Bold
      </button>
      <button 
        @click.prevent="editor.chain().focus().toggleItalic().run()"
        :disabled="!editor.can().chain().focus().toggleItalic().run()"
        :class="{ 'bg-primary/20 text-primary': editor.isActive('italic') }"
        class="px-3 py-1.5 rounded text-sm font-medium hover:bg-secondary transition-colors italic"
      >
        Italic
      </button>
      <button 
        @click.prevent="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="{ 'bg-primary/20 text-primary': editor.isActive('heading', { level: 2 }) }"
        class="px-3 py-1.5 rounded text-sm font-medium hover:bg-secondary transition-colors font-bold"
      >
        H2
      </button>
      <button 
        @click.prevent="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        :class="{ 'bg-primary/20 text-primary': editor.isActive('heading', { level: 3 }) }"
        class="px-3 py-1.5 rounded text-sm font-medium hover:bg-secondary transition-colors font-bold"
      >
        H3
      </button>
      <button 
        @click.prevent="editor.chain().focus().toggleBulletList().run()"
        :class="{ 'bg-primary/20 text-primary': editor.isActive('bulletList') }"
        class="px-3 py-1.5 rounded text-sm font-medium hover:bg-secondary transition-colors"
      >
        List
      </button>
      <button 
        @click.prevent="editor.chain().focus().toggleCodeBlock().run()"
        :class="{ 'bg-primary/20 text-primary': editor.isActive('codeBlock') }"
        class="px-3 py-1.5 rounded text-sm font-medium hover:bg-secondary transition-colors font-mono"
      >
        Code Block
      </button>
      <button 
        @click.prevent="addImage"
        class="px-3 py-1.5 rounded text-sm font-medium hover:bg-secondary transition-colors"
      >
        Image
      </button>
    </div>
    
    <editor-content :editor="editor" />
  </div>
</template>

<style>
/* Tiptap prose default resets for the admin form */
.ProseMirror p {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}
.ProseMirror h2, .ProseMirror h3 {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  font-weight: bold;
}
.ProseMirror h2 { font-size: 1.5rem; }
.ProseMirror h3 { font-size: 1.25rem; }
.ProseMirror ul {
  list-style-type: disc;
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}
.ProseMirror pre {
  background: #1e1e2e;
  border-radius: 0.5rem;
  padding: 1rem;
  color: #cdd6f4;
  font-family: monospace;
  margin: 1rem 0;
  overflow-x: auto;
}
.ProseMirror code {
  background: rgba(127, 127, 127, 0.2);
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}
</style>
