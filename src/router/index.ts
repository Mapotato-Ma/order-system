import { createRouter, createWebHistory } from 'vue-router';
import BusinessmanView from '@/views/businessman-view/businessman-view.vue';
import CustomerView from '@/views/customer-view/customer-view.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/customer'
    },
    {
      path: '/businessman',
      name: 'businessman',
      component: BusinessmanView
    },
    {
      path: '/customer',
      name: 'customer',
      component: CustomerView
    }
  ]
});

export default router;
