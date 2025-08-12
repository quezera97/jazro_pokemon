import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Index',
      component: () => import('@/pages/index.vue')
    },
    {
      path: '/pokemon/:name',
      name: 'pokemonDetails',
      component: () => import('@/pages/Details.vue')
    }
  ],
})

export default router
