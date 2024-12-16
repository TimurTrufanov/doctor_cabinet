<template>
  <v-container>
    <v-card>
      <v-card-title class="text-h5">
        Графік роботи
      </v-card-title>
      <v-card-text>
        <v-alert
          v-if="error"
          type="error"
          class="mb-4"
          @click:close="error = ''"
        >
          {{ error }}
        </v-alert>

        <v-skeleton-loader
          v-if="loading"
          class="mb-4"
          type="table"
        />

        <v-table v-else>
          <template #default>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Час роботи</th>
                <th>Прийоми</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="day in schedule"
                :key="day.id"
                class="cursor-pointer"
                @click="goToDaySchedule(day.id)"
              >
                <td>{{ day.date }}</td>
                <td>{{ day.start_time }} - {{ day.end_time }}</td>
                <td>{{ day.appointment_count }}</td>
              </tr>
            </tbody>
          </template>
        </v-table>

        <v-pagination
          v-if="pagination.last_page > 1"
          v-model="pagination.current_page"
          :length="pagination.last_page"
        />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import axiosInstance from '@/api/axiosInstance';

const schedule = ref([]);
const pagination = ref({
  current_page: 0,
  last_page: 0,
  per_page: 0,
  total: 0
});
const loading = ref(false);
const error = ref('');
const router = useRouter();

const fetchDoctorSchedule = async () => {
  loading.value = true;
  error.value = '';

  try {
    const response = await axiosInstance.get(`/doctor/schedule?page=${pagination.value.current_page}`);
    schedule.value = response.data.data;
    pagination.value = response.data.meta;
  } catch (err) {
    error.value = err.response?.data?.message || 'Не вдалося отримати графік роботи.';
  } finally {
    loading.value = false;
  }
};

const goToDaySchedule = (dayId) => {
  router.push({ name: 'DaySchedule', params: { id: dayId } });
};

onMounted(() => {
  pagination.value.current_page = +router.currentRoute.value.query.page || 1;
  fetchDoctorSchedule();
});

watch(() => pagination.value.current_page, (newPage) => {
  if (newPage > 1) {
    router.push({ query: { page: newPage } });
  } else {
    router.push({ query: {} });
  }

  fetchDoctorSchedule();
});
</script>
