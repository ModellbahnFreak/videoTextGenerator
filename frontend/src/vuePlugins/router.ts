import { createRouter, createWebHistory } from 'vue-router'
import GraphicView from '../graphic/GraphicView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'graphic',
      component: GraphicView
    },
    {
      path: '/editor',
      alias: ["/edit", "/e", "/operator"],
      name: 'editor',
      component: () => import('../editor/EditorView.vue')
    }
  ]
})

export default router
