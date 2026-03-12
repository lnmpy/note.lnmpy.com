import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/list'
  },
  {
    path: '/list',
    name: 'List',
    component: () => import('../views/ListView.vue')
  },
  {
    path: '/new',
    name: 'New',
    component: () => import('../views/NewView.vue')
  },
  {
    path: '/id-:id',
    name: 'Note',
    component: () => import('../views/NoteView.vue')
  },
  {
    path: '/help',
    name: 'Help',
    component: () => import('../views/HelpView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Handle chunk load errors when deploying a new version or waking up from sleep
router.onError((error, to) => {
  const isChunkLoadFailed = error.message.includes('Failed to fetch dynamically imported module') 
    || error.message.includes('Importing a module script failed') 
    || error.name === 'ChunkLoadError';
    
  if (isChunkLoadFailed) {
    // Avoid infinite reload loop if offline completely
    const reloadCount = parseInt(sessionStorage.getItem('chunk-reload') || '0');
    if (reloadCount >= 3) {
      console.error('Failed to load chunk after 3 reloads. You might be offline.');
      // Clear up the reload count and let the routing fail so we don't spam reload
      sessionStorage.removeItem('chunk-reload');
    } else {
      sessionStorage.setItem('chunk-reload', (reloadCount + 1).toString());
      window.location.href = to.fullPath;
    }
  }
})

// when navigation is successful:
router.afterEach(() => {
  sessionStorage.removeItem('chunk-reload');
})

export default router
