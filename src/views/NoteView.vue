<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { getNote, saveNote, deleteNote } from '../utils/storage.js'
import { calculator } from '../utils/calculator.js'
import { formatNumber } from '../utils/format.js'
import { computed } from 'vue'

const route = useRoute()

const noteId = ref('')
const noteTitle = ref('')
const noteContent = ref('')
const textareaRef = ref(null)

const isNewNote = ref(false)
const titlePlaceholder = ref('Untitled')
const calcResultsRef = ref(null)
const isCalcEnabled = ref(true)
const isHighlightEnabled = ref(true)
const displayContent = ref('')

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

const noteLines = computed(() => {
  return displayContent.value.split('\n')
})

const handleInput = (e) => {
  displayContent.value = e.target.value
}

watch(noteContent, (newVal) => {
  if (displayContent.value !== newVal) {
    displayContent.value = newVal
  }
})

const calculationResults = computed(() => {
  if (!isCalcEnabled.value) return []
  const rawResults = calculator.evaluate(noteContent.value)
  return rawResults.map(res => formatNumber(res))
})

const escapeHtml = (str) => {
  return str.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m]
  })
}

const renderLine = (line, index) => {
  const hasResult = calculationResults.value[index] !== undefined && calculationResults.value[index] !== ''
  if (!line) return '\u200B'
  if (!hasResult || !isHighlightEnabled.value || !isCalcEnabled.value) {
    return escapeHtml(line)
  }
  
  let seenEquals = false;
  const hasEquals = line.includes('=') || line.includes('＝');
  
  // Find comments
  let textPart = line;
  let commentPart = '';
  const hashIndex = line.indexOf('#');
  const slashIndex = line.indexOf('//');
  
  let commentIndex = -1;
  if (hashIndex !== -1 && slashIndex !== -1) {
    commentIndex = Math.min(hashIndex, slashIndex);
  } else if (hashIndex !== -1) {
    commentIndex = hashIndex;
  } else if (slashIndex !== -1) {
    commentIndex = slashIndex;
  }
  
  if (commentIndex !== -1) {
    textPart = line.substring(0, commentIndex);
    commentPart = line.substring(commentIndex);
  }
  
  let highlightedText = '';
  
  if (textPart) {
    highlightedText = textPart.replace(/((?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?)|([+\-*/=()%^＝]+)|([a-zA-Z_\u4e00-\u9fa5][a-zA-Z0-9_\u4e00-\u9fa5]*)|([^a-zA-Z0-9_\u4e00-\u9fa5+\-*/=()%^＝]+)/g, (match, num, op, v, other) => {
      if (num) return `<span class="hl-num">${escapeHtml(num)}</span>`
      if (op) {
        if (op.includes('=') || op.includes('＝')) seenEquals = true;
        return `<span class="hl-op">${escapeHtml(op)}</span>`
      }
      if (v) {
        // Variables matching math-js compatible strings
        if (hasEquals && !seenEquals) {
          return `<span class="hl-var-lhs">${escapeHtml(v)}</span>`
        }
        return `<span class="hl-var">${escapeHtml(v)}</span>`
      }
      if (other) return `<span class="hl-text">${escapeHtml(other)}</span>`
      return ''
    });
  }
  
  if (commentPart) {
    highlightedText += `<span class="hl-comment">${escapeHtml(commentPart)}</span>`;
  }
  
  return highlightedText;
}

const mirrorContainerRef = ref(null)
const lineHeights = ref([])

const scheduleMeasurement = async () => {
  if (!isCalcEnabled.value) return
  await nextTick()
  if (mirrorContainerRef.value && textareaRef.value) {
    mirrorContainerRef.value.style.width = textareaRef.value.clientWidth + 'px'
    mirrorContainerRef.value.style.transform = `translateY(-${textareaRef.value.scrollTop}px)`
    const lines = mirrorContainerRef.value.querySelectorAll('.mirror-line')
    
    // Fallback default math 18px * 1.7 = 30.6
    if (lines.length === calculationResults.value.length) {
      const heights = []
      for (let i = 0; i < lines.length; i++) {
        heights.push(lines[i].offsetHeight)
      }
      lineHeights.value = heights
    }
  }
}

watch([displayContent, isCalcEnabled, isHighlightEnabled], () => {
  scheduleMeasurement()
}, { immediate: true })

const handleScroll = (e) => {
  if (calcResultsRef.value) {
    calcResultsRef.value.scrollTop = e.target.scrollTop
  }
  if (mirrorContainerRef.value) {
    mirrorContainerRef.value.style.transform = `translateY(-${e.target.scrollTop}px)`
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
    displayContent.value = existingNote.content
    isCalcEnabled.value = !!existingNote.isCalcEnabled
    isHighlightEnabled.value = !!existingNote.isHighlightEnabled
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
    scheduleMeasurement()
  }
  
  window.addEventListener('resize', scheduleMeasurement)
  isInitializing.value = false
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
  window.removeEventListener('resize', scheduleMeasurement)
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
        if (noteTitle.value !== updatedNote.title || noteContent.value !== updatedNote.content || isCalcEnabled.value !== !!updatedNote.isCalcEnabled || isHighlightEnabled.value !== !!updatedNote.isHighlightEnabled) {
          isSyncingFromOtherTab.value = true
          noteTitle.value = updatedNote.title
          noteContent.value = updatedNote.content
          displayContent.value = updatedNote.content
          isCalcEnabled.value = !!updatedNote.isCalcEnabled
          isHighlightEnabled.value = !!updatedNote.isHighlightEnabled
        }
      } else if (!isNewNote.value) {
        // Note was deleted in another tab, clear the content
        isSyncingFromOtherTab.value = true
        noteContent.value = ''
        displayContent.value = ''
        noteTitle.value = ''
        isCalcEnabled.value = false
        isHighlightEnabled.value = false
      }
    } catch (err) {
      console.error('Failed to parse storage data:', err)
    }
  }
}

watch([noteTitle, noteContent, isCalcEnabled, isHighlightEnabled], ([newTitle, newContent, newIsCalcEnabled, newIsHighlightEnabled]) => {
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
    saveNote(noteId.value, newContent, newTitle, newIsCalcEnabled, newIsHighlightEnabled)
  } else {
    deleteNote(noteId.value)
  }
})

</script>

<template>
  <div class="note-page">
    <div class="editor-container" :class="{ 'has-calc': isCalcEnabled }">
      <input 
        v-model="noteTitle" 
        class="title-input" 
        :placeholder="titlePlaceholder"
        autocomplete="off"
      />

      <div class="toolbar-container" ref="menuRef">
        <button class="menu-trigger" @click="toggleMenu">...</button>
        <transition name="fade-drop">
          <div class="dropdown-menu" v-show="isMenuOpen">
            <div class="dropdown-arrow"></div>
            <label class="menu-item-checkbox">
              <input type="checkbox" v-model="isCalcEnabled">
              <span class="custom-checkbox">
                <svg v-if="isCalcEnabled" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17l-5-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
              <span class="menu-label">Calculator</span>
            </label>
            <label class="menu-item-checkbox" v-show="isCalcEnabled">
              <input type="checkbox" v-model="isHighlightEnabled">
              <span class="custom-checkbox">
                <svg v-if="isHighlightEnabled" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17l-5-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
              <span class="menu-label">Highlight</span>
            </label>
          </div>
        </transition>
      </div>
      
      <div class="content-wrapper">
        <div class="main-editor-area">
          <div class="mirror-mask" v-show="isCalcEnabled && isHighlightEnabled || true /* Always need mirror container for heights, mask shouldn't hide it completely unless we don't need heights. Wait, mask is part of the feature */" :style="{ zIndex: 0 }">
            <div class="mirror-container" ref="mirrorContainerRef" aria-hidden="true" :class="{ 'highlight-active': isHighlightEnabled && isCalcEnabled }">
              <div v-for="(line, index) in noteLines" :key="index" class="mirror-line" v-html="renderLine(line, index)"></div>
            </div>
          </div>

          <textarea 
            ref="textareaRef"
            v-model="noteContent" 
            @input="handleInput"
            class="content-editor" 
            :class="{ 'calc-enabled': isCalcEnabled, 'highlight-active': isHighlightEnabled && isCalcEnabled }"
            placeholder="Start writing..."
            @scroll="handleScroll"
          ></textarea>
        </div>
        <div class="calculation-results" ref="calcResultsRef" v-show="isCalcEnabled">
          <div v-for="(res, index) in calculationResults" :key="index" class="calc-line" :style="{ height: (lineHeights[index] || 30.6) + 'px' }">
            <template v-if="res.intPart !== undefined">
              <span class="int-part">{{ res.intPart }}</span><span class="dec-part">{{ res.decPart }}</span>
            </template>
            <template v-else>
              <span class="raw-res">{{ res.str || res }}</span>
            </template>
          </div>
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

.editor-container.has-calc {
  /* Calculation results occupy 20ch on the right */
  /* This container width will still be defined by media queries */
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

.toolbar-container {
  position: relative;
  display: flex;
  margin-bottom: 20px;
}

.menu-trigger {
  background: transparent;
  border: none;
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 2px;
  color: #cbd5e1;
  cursor: pointer;
  padding: 0px 8px 8px 8px;
  line-height: 0.5;
  border-radius: 4px;
  transition: background 0.2s, color 0.2s;
  outline: none;
}

.menu-trigger:hover {
  background: #f1f5f9;
  color: #94a3b8;
}

.dropdown-menu {
  position: absolute;
  top: 32px;
  left: 0;
  background: white;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  padding: 12px 16px;
  z-index: 50;
  min-width: 150px;
}

.dropdown-arrow {
  position: absolute;
  top: -6px;
  left: 17px;
  width: 10px;
  height: 10px;
  background: white;
  border-left: 1px solid #e2e8f0;
  border-top: 1px solid #e2e8f0;
  transform: rotate(45deg);
}

.menu-item-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.menu-item-checkbox input {
  display: none;
}

.custom-checkbox {
  width: 16px;
  height: 16px;
  border: 1px solid #bdc3c7;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.menu-item-checkbox input:checked + .custom-checkbox {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.custom-checkbox svg {
  width: 12px;
  height: 12px;
}

.menu-label {
  font-size: 14px;
  color: #475569;
  font-family: system-ui, sans-serif;
  transition: color 0.2s;
}

.menu-item-checkbox input:checked ~ .menu-label {
  color: #3b82f6;
  font-weight: 500;
}

.fade-drop-enter-active,
.fade-drop-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-drop-enter-from,
.fade-drop-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

.content-wrapper {
  display: flex;
  flex: 1;
  position: relative;
  overflow: visible;
}

.editor-container.has-calc .content-wrapper {
  display: grid;
  grid-template-columns: 1fr 20ch;
  gap: 20px;
}

.main-editor-area {
  position: relative;
  flex: 1;
  min-width: 0; /* Prevents flex/grid overflowing */
}

/* Rest of mirror classes... */
.mirror-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.mirror-container {
  position: absolute;
  top: 0;
  left: 0;
  padding: 0 0 24px 0;
  font-size: 18px;
  line-height: 1.7;
  font-family: system-ui, sans-serif;
  white-space: pre-wrap;
  word-wrap: break-word;
  visibility: hidden;
  pointer-events: none;
  z-index: 0;
  box-sizing: border-box;
}

.mirror-container.highlight-active {
  visibility: visible;
  color: #334155;
}

:deep(.hl-num) {
  color: #3b82f6; /* Blue */
}

:deep(.hl-op) {
  color: #c084fc; /* Light purple */
}

:deep(.hl-var-lhs) {
  color: #ec4899; /* Deep pink */
}

:deep(.hl-var) {
  color: #8b5cf6; /* Soft violet */
}

:deep(.hl-comment) {
  color: #94a3b8; /* Slate gray */
  font-style: italic;
}

:deep(.hl-text) {
  color: #000000; /* Default text color (Black) */
}

.mirror-line {
  width: 100%;
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
  font-family: system-ui, sans-serif;
  overflow-y: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  position: relative;
  z-index: 1;
}

.content-editor.highlight-active {
  color: transparent !important;
  caret-color: #334155;
}

.content-editor.highlight-active::selection {
  background: rgba(59, 130, 246, 0.2); /* Make strictly background selection color */
  color: transparent;
  -webkit-text-fill-color: transparent;
}

.content-editor.highlight-active::-moz-selection {
  background: rgba(59, 130, 246, 0.2);
  color: transparent;
  -webkit-text-fill-color: transparent;
}

.calculation-results {
  /* no position absolute now */
  width: 20ch; 
  height: 100%;
  overflow-y: hidden;
  overflow-x: visible;
  padding: 0 0 24px 20px;
  box-sizing: border-box;
  font-size: 18px;
  line-height: 1.7;
  font-family: system-ui, sans-serif;
  color: #64748b;
  border-left: 1px solid #f1f5f9;
}

.calc-line {
  white-space: pre-wrap;
  word-break: break-all;
  display: flex;
  justify-content: flex-end;
  font-variant-numeric: tabular-nums;
}

.int-part {
  text-align: right;
  white-space: pre;
  flex-shrink: 0;
}

.dec-part {
  text-align: left;
  width: 5.5ch; /* allow 4 decimal places alignment */
  white-space: pre;
  flex-shrink: 0;
}

.raw-res {
  text-align: right;
  width: 100%;
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
  
  .editor-container.has-calc .content-wrapper {
    display: flex; /* Revert grid */
  }

  .title-input {
    font-size: 32px;
  }
  
  .content-editor {
    font-size: 16px;
  }

  .calculation-results {
    display: none;
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
  .calculation-results {
    /* no position absolute now */
    width: 30ch; 
  }
}
</style>
