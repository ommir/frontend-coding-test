import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import ProductCreateView from '@/views/ProductCreateView.vue'
import ProductEditView from '@/views/ProductEditView.vue'
import ProductListView from '@/views/ProductListView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/products',
      name: 'products',
      component: ProductListView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/products/new',
      name: 'product-create',
      component: ProductCreateView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/products/:id/edit',
      name: 'product-edit',
      component: ProductEditView,
      meta: {
        requiresAuth: true,
      },
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (to.name === 'login' && auth.isAuthenticated) {
    return { name: 'home' }
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return {
      name: 'login',
      query: {
        redirect: to.fullPath,
      },
    }
  }

  if (to.meta.requiresAuth && auth.isAuthenticated && !auth.user) {
    try {
      await auth.fetchProfile()
    } catch {
      auth.logout()
      return {
        name: 'login',
        query: {
          redirect: to.fullPath,
        },
      }
    }
  }
})

export default router
