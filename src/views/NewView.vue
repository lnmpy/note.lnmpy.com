<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { generateId, getNotes } from '../utils/storage.js'

const router = useRouter()

onMounted(() => {
  const notes = getNotes()
  let newId = generateId()
  
  // Ensure the new ID does not overlap with existing IDs
  while (notes[newId]) {
    newId = generateId()
  }

  // Redirect to newly generated note id
  router.replace(`/id-${newId}`)
})
</script>

<template>
  <div class="loading">Creating a new note for you...</div>
</template>

<style scoped>
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 20px;
  color: #666;
}
</style>
