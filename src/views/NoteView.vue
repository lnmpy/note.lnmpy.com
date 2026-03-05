<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getNote, saveNote, deleteNote } from '../utils/storage.js'

const route = useRoute()
const router = useRouter()

const noteId = ref('')
const noteTitle = ref('')
const noteContent = ref('')

const formatCurrentTime = () => {
  const d = new Date()
  const pad = (n) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

onMounted(() => {
  noteId.value = route.params.id
  const existingNote = getNote(noteId.value)

  if (existingNote) {
    noteTitle.value = existingNote.title
    noteContent.value = existingNote.content
  } else {
    noteTitle.value = formatCurrentTime()
  }
})

watch([noteTitle, noteContent], ([newTitle, newContent]) => {
  if (newContent.trim() !== '') {
    saveNote(noteId.value, newContent, newTitle)
  } else {
    deleteNote(noteId.value)
  }
})

const goBack = () => {
  router.push('/list')
}

// Auto-resize textarea to fit content and hide native scrollbars
const resizeTextarea = (e) => {
  const el = e.target
  el.style.height = 'auto'
  el.style.height = el.scrollHeight + 'px'
}
</script>

<template>
  <div class="note-page">
    <div class="top-nav">
      <button class="nav-btn" @click="goBack" title="Back to Notes">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span class="nav-label"></span>
      </button>
    </div>

    <div class="editor-container">
      <input 
        v-model="noteTitle" 
        class="title-input" 
        placeholder="Untitled"
        autocomplete="off"
      />
      <textarea 
        v-model="noteContent" 
        class="content-editor" 
        placeholder="Start writing..."
        @input="resizeTextarea"
      ></textarea>
    </div>
  </div>
</template>

<style scoped>
.note-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  background-color: #ffffff;
}

.top-nav {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 24px 40px;
  z-index: 20;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  font-size: 15px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.editor-container {
  width: 80%;
  max-width: 900px;
  margin: 0 auto;
  padding: 20px 0 100px 0;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.title-input {
  width: 100%;
  font-size: 32px;
  font-weight: 600;
  border: none;
  color: #475569;
  background: transparent;
  outline: none;
  margin-bottom: 24px;
  padding: 0;
  letter-spacing: -0.5px;
}

.title-input::placeholder {
  color: #cbd5e1;
}

.content-editor {
  width: 100%;
  flex: 1;
  border: none;
  resize: none;
  font-size: 18px;
  line-height: 1.7;
  color: #334155;
  background: transparent;
  outline: none;
  padding: 0;
  min-height: 50vh;
  font-family: 'Inter', -apple-system, sans-serif;
  overflow: hidden;
}

.content-editor::placeholder {
  color: #cbd5e1;
}

@media (max-width: 768px) {
  .editor-container {
    width: 90%;
    padding: 20px 0 60px 0;
  }
  
  .title-input {
    font-size: 32px;
  }
  
  .content-editor {
    font-size: 16px;
  }
}
</style>
