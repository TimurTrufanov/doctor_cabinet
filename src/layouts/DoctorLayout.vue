<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title>Кабінет лікаря</v-toolbar-title>
      <v-spacer />
      <v-avatar
        v-if="doctorPhoto"
        class="mr-3 cursor-pointer"
        :image="doctorPhoto"
        @click="goToDetails"
      />
      <v-btn
        icon="mdi-logout"
        @click="logout"
      />
    </v-app-bar>
    <v-navigation-drawer app>
      <v-list>
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          @click="navigate(item.route)"
        >
          <template #prepend>
            <v-icon :icon="item.icon" />
          </template>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useDoctorStore } from '@/stores/doctorStore';
import { computed, onMounted } from 'vue';

const router = useRouter();
const doctorStore = useDoctorStore();

const doctorPhoto = computed(() => doctorStore.doctorDetails?.photo);

const menuItems = [
  { title: 'Головна', icon: 'mdi-home', route: '/doctor' },
  { title: 'Розклад', icon: 'mdi-calendar', route: '/doctor/schedule' },
];

const navigate = (route) => {
  router.push(route);
};

const goToDetails = () => {
  router.push({ name: 'DoctorDetails' });
};

const logout = () => {
  doctorStore.clearDoctorDetails();
  localStorage.removeItem('doctorToken');
  router.push({ name: 'Login' });
};

onMounted(() => {
  if (!doctorStore.doctorDetails) {
    doctorStore.fetchDoctorDetails();
  }
});
</script>
