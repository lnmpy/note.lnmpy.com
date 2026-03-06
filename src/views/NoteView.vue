<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { getNote, saveNote, deleteNote } from '../utils/storage.js'

const route = useRoute()

const noteId = ref('')
const noteTitle = ref('')
const noteContent = ref('')
const textareaRef = ref(null)

const isNewNote = ref(false)
const titlePlaceholder = ref('Untitled')
// 用于标记是否由其他标签页同步过来，防止循环保存
const isSyncingFromOtherTab = ref(false)

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
  
  // 监听其他标签页引起的 localStorage 变化
  window.addEventListener('storage', handleStorageChange)
  
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
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
})

const handleStorageChange = (e) => {
  // `storage` 事件只会在其他标签页修改 localStorage 时触发
  if (e.key === 'notes' && e.newValue) {
    try {
      const newNotes = JSON.parse(e.newValue)
      const updatedNote = newNotes[noteId.value]
      
      if (updatedNote) {
        // 如果内容确实不一样，则更新本地状态
        if (noteTitle.value !== updatedNote.title || noteContent.value !== updatedNote.content) {
          isSyncingFromOtherTab.value = true
          noteTitle.value = updatedNote.title
          noteContent.value = updatedNote.content
        }
      } else if (!isNewNote.value) {
        // 笔记在其他标签页被删除了，我们可以清空内容
        isSyncingFromOtherTab.value = true
        noteContent.value = ''
        noteTitle.value = ''
      }
    } catch (err) {
      console.error('解析存储数据失败:', err)
    }
  }
}

watch([noteTitle, noteContent], ([newTitle, newContent]) => {
  // 如果是因为其他标签页的同步导致的更新，跳过此次保存
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
      <textarea 
        ref="textareaRef"
        v-model="noteContent" 
        class="content-editor" 
        placeholder="Start writing..."
      ></textarea>
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
  width: 80%;
  max-width: 1200px;
  margin: 40px auto 20px;
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
  padding: 0 0 24px 0;
  font-family: 'Inter', -apple-system, sans-serif;
  overflow-y: auto;
}

.content-editor::placeholder {
  color: #cbd5e1;
}

@media (max-width: 768px) {
  .editor-container {
    width: 90%;
    padding: 20px 0 0 0;
  }
  
  .title-input {
    font-size: 32px;
  }
  
  .content-editor {
    font-size: 16px;
  }
}
</style>
