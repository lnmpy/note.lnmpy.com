<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { generateId, getNotes } from '../utils/storage.js'

const router = useRouter()
const route = useRoute()

onMounted(() => {
  const notes = getNotes()
  let newId = generateId()
  
  // Ensure the new ID does not overlap with existing IDs
  while (notes[newId]) {
    newId = generateId()
  }

  // Redirect to newly generated note id with mode if needed
  const query = {}
  if (route.path === '/new-cal') {
    query.mode = 'cal'
  }
  
  router.replace({ path: `/id-${newId}`, query })
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
