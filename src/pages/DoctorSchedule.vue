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
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axiosInstance from '@/api/axiosInstance';

const schedule = ref([]);
const loading = ref(false);
const error = ref('');
const router = useRouter();

const fetchDoctorSchedule = async () => {
  loading.value = true;
  error.value = '';

  try {
    const response = await axiosInstance.get('/doctor/schedule');
    schedule.value = Array.isArray(response.data) ? response.data : [];
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
  fetchDoctorSchedule();
});
</script>

<style>
.cursor-pointer {
  cursor: pointer;
}
</style>
