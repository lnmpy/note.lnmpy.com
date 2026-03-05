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

export default router
