import { createRouter, createWebHistory } from 'vue-router';
import Login from "@/pages/Login.vue";
import DoctorLayout from "@/layouts/DoctorLayout.vue";

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
    meta: { guestOnly: true },
  },
  {
    path: '/doctor',
    component: DoctorLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'DoctorDashboard',
        component: () => import('@/pages/DoctorDashboard.vue'),
      },
      {
        path: 'schedule',
        name: 'DoctorSchedule',
        component: () => import('@/pages/DoctorSchedule.vue'),
      },
      {
        path: 'schedule/:id',
        name: 'DaySchedule',
        component: () => import('@/pages/DoctorDaySchedule.vue'),
      },
      {
        path: 'details',
        name: 'DoctorDetails',
        component: () => import('@/pages/DoctorDetails.vue'),
      },
      {
        path: 'appointments/:appointmentId',
        name: 'DoctorAppointment',
        component: () => import('@/pages/DoctorAppointment.vue'),
      },
    ],
  },
  {
    path: '/:catchAll(.*)',
    name: 'NotFound',
    component: () => import('@/pages/NotFound.vue'),
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('doctorToken');

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' });
  } else if (to.meta.guestOnly && isAuthenticated) {
    next({ name: 'DoctorDashboard' });
  } else {
    next();
  }
});

export default router;
