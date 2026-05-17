<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { getNote, saveNote, deleteNote } from '../utils/storage.js'
import { computed } from 'vue'

const route = useRoute()

const noteId = ref('')
const noteTitle = ref('')
const noteContent = ref('')
const textareaRef = ref(null)

const isNewNote = ref(false)
const titlePlaceholder = ref('Untitled')

const isMenuOpen = ref(false)
const menuRef = ref(null)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const handleOutsideClick = (e) => {
  if (menuRef.value && !menuRef.value.contains(e.target)) {
    isMenuOpen.value = false
  }
}

// Flag to indicate if syncing from another tab, to prevent circular saves
const isSyncingFromOtherTab = ref(false)
const isInitializing = ref(true)

const formatCurrentTime = () => {
  const d = new Date()
  const pad = (n) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

onMounted(async () => {
  noteId.value = route.params.id
  const existingNote = getNote(noteId.value)

  if (existingNote) {
    noteTitle.value = existingNote.title
    noteContent.value = existingNote.content
  } else {
    isNewNote.value = true
    titlePlaceholder.value = formatCurrentTime()
  }
  
  // Listen for localStorage changes from other tabs
  window.addEventListener('storage', handleStorageChange)
  document.addEventListener('click', handleOutsideClick)
  
  await nextTick()

  const el = textareaRef.value
  if (el) {
    el.focus()
    
    const pageHeight = el.clientHeight
    
    // Temporarily shrink to measure actual text height
    const prevFlex = el.style.flex
    const prevHeight = el.style.height
    el.style.flex = 'none'
    el.style.height = '1px'
    const actualTextHeight = el.scrollHeight
    el.style.flex = prevFlex
    el.style.height = prevHeight

    const length = noteContent.value ? noteContent.value.length : 0
    if (actualTextHeight <= pageHeight * 0.8) {
      el.setSelectionRange(length, length)
      el.scrollTop = el.scrollHeight
    } else {
      el.setSelectionRange(0, 0)
      el.scrollTop = 0
    }
  }
  
  isInitializing.value = false
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
  document.removeEventListener('click', handleOutsideClick)
})

const handleStorageChange = (e) => {
  // `storage` event only fires when localStorage is modified by other tabs
  if (e.key === 'notes' && e.newValue) {
    try {
      const newNotes = JSON.parse(e.newValue)
      const updatedNote = newNotes[noteId.value]
      
      if (updatedNote) {
        // If content is actually different, update local state
        if (noteTitle.value !== updatedNote.title || noteContent.value !== updatedNote.content) {
          isSyncingFromOtherTab.value = true
          noteTitle.value = updatedNote.title
          noteContent.value = updatedNote.content
        }
      } else if (!isNewNote.value) {
        // Note was deleted in another tab, clear the content
        isSyncingFromOtherTab.value = true
        noteContent.value = ''
        noteTitle.value = ''
      }
    } catch (err) {
      console.error('Failed to parse storage data:', err)
    }
  }
}

watch([noteTitle, titlePlaceholder], ([newTitle, newPlaceholder]) => {
  document.title = (newTitle || newPlaceholder || 'Untitled') + ' Notebook'
}, { immediate: true })

watch([noteTitle, noteContent], ([newTitle, newContent]) => {
  if (isInitializing.value) return

  // If the update is from syncing with another tab, skip this save
  if (isSyncingFromOtherTab.value) {
    isSyncingFromOtherTab.value = false
    return
  }

  if (isNewNote.value && newContent !== '') {
    if (!newTitle) {
      noteTitle.value = titlePlaceholder.value
      newTitle = titlePlaceholder.value
    }
    isNewNote.value = false
  }

  if (newContent.trim() !== '') {
    saveNote(noteId.value, newContent, newTitle)
  } else {
    deleteNote(noteId.value)
  }
})

</script>

<template>
  <div class="note-page">
    <div class="editor-container">
      <input 
        v-model="noteTitle" 
        class="title-input" 
        :placeholder="titlePlaceholder"
        autocomplete="off"
      />

      <div class="content-wrapper">
        <div class="main-editor-area">
          <textarea 
            ref="textareaRef"
            v-model="noteContent" 
            class="content-editor" 
            placeholder="Start writing..."
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.note-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  background-color: #ffffff;
}

.editor-container {
  width: 80%; /* Match media query for >1440px */
  margin: 40px auto 20px auto;
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

.content-wrapper {
  display: flex;
  flex: 1;
  position: relative;
  overflow: visible;
}

.main-editor-area {
  position: relative;
  flex: 1;
  min-width: 0; /* Prevents flex/grid overflowing */
}

.content-editor {
  width: 100%;
  height: 100%;
  border: none;
  resize: none;
  font-size: 18px;
  line-height: 1.7;
  color: #334155;
  background: transparent;
  outline: none;
  padding: 0 0 24px 0;
  font-family: inherit;
  overflow-y: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  position: relative;
  z-index: 1;
}

.content-editor::placeholder {
  color: #cbd5e1;
}

@media (max-width: 768px) {
  .editor-container {
    width: 90%;
    padding: 20px 0 0 0;
    margin: 20px auto;
  }
  
  .title-input {
    font-size: 32px;
  }
  
  .content-editor {
    font-size: 16px;
  }
}

@media (min-width: 769px) and (max-width: 1280px) {
  .editor-container {
    width: 100%;
    padding: 0 40px; /* Some padding so it doesn't touch the edges */
    box-sizing: border-box;
  }
}

@media (min-width: 1281px) and (max-width: 1440px) {
  .editor-container {
    width: 90%;
  }
}

@media (min-width: 1441px) {
  .editor-container {
    width: 80%;
  }
}
</style>
