<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getNotes, deleteNote } from '../utils/storage.js'

const router = useRouter()
const notesList = ref([])

const loadNotes = () => {
  const notes = getNotes()
  notesList.value = Object.values(notes)
    .filter(note => note.content && note.content.trim() !== '')
    .sort((a, b) => b.updatedAt - a.updatedAt)
}

onMounted(() => {
  loadNotes()
})

const openNote = (id) => {
  router.push(`/id-${id}`)
}

const removeNote = (id, event) => {
  event.stopPropagation()
  if (confirm('Delete this note forever?')) {
    deleteNote(id)
    loadNotes()
  }
}

const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  if (date.toDateString() === now.toDateString()) {
    return 'Today, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div class="list-page">
    <div v-if="notesList.length === 0" class="empty-state">
      <div class="empty-icon">📝</div>
      <h2>No notes yet</h2>
      <p>Your thoughts, ideas, and drafts will appear here.</p>
      <button class="create-btn" @click="router.push('/new')">Create First Note</button>
    </div>

    <div v-else class="notes-grid">
      <div 
        v-for="note in notesList" 
        :key="note.id" 
        class="note-card"
        @click="openNote(note.id)"
      >
        <div class="note-card-inner">
          <div class="note-header">
            <h3 class="note-title">{{ note.title || 'Untitled' }}</h3>
            <button class="delete-icon" @click="removeNote(note.id, $event)" title="Delete Note">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
          <p class="note-excerpt">{{ note.content }}</p>
          <div class="note-footer">
            <span class="note-date">{{ formatDate(note.updatedAt) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-page {
  padding: 40px 60px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  color: #1a1a1b;
  letter-spacing: -0.5px;
}

.note-count {
  background: #f1f5f9;
  color: #64748b;
  font-size: 13px;
  padding: 4px 10px;
  border-radius: 100px;
  font-weight: 600;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 100px 20px;
  color: #64748b;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 24px;
  opacity: 0.5;
}

.empty-state h2 {
  font-size: 20px;
  margin: 0 0 8px 0;
  color: #1e293b;
}

.empty-state p {
  margin: 0 0 32px 0;
  font-size: 15px;
}

.create-btn {
  background: #0f172a;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.create-btn:hover {
  background: #1e293b;
  transform: translateY(-1px);
}

.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.note-card {
  position: relative;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  min-height: 180px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02);
}

.note-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 8px 24px -6px rgba(0,0,0,0.05);
  transform: translateY(-2px);
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.note-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.delete-icon {
  background: none;
  border: none;
  color: #cbd5e1;
  cursor: pointer;
  padding: 4px;
  margin-left: 12px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  opacity: 0;
}

.note-card:hover .delete-icon {
  opacity: 1;
}

.delete-icon:hover {
  background-color: #fee2e2;
  color: #ef4444;
}

.note-excerpt {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: pre-wrap;
}

.note-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  border-top: 1px solid #f1f5f9;
  padding-top: 12px;
}

.note-date {
  font-size: 12px;
  font-weight: 500;
  color: #94a3b8;
}
</style>
