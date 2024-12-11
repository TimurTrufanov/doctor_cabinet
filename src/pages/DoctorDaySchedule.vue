<template>
  <v-container>
    <v-card>
      <v-card-title
        v-if="!error && formattedDate"
        class="text-h5"
      >
        Розклад на {{ formattedDate }}
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

        <v-table v-else-if="!error && timeSlots.length > 0">
          <template #default>
            <thead>
              <tr>
                <th>Час</th>
                <th>Пацієнт</th>
                <th>Послуга</th>
                <th>Дія</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="timeSlot in timeSlots"
                :key="timeSlot.id"
              >
                <td>{{ timeSlot.start_time }} - {{ timeSlot.end_time }}</td>
                <td v-if="timeSlot.appointment">
                  {{ timeSlot.appointment.patient_name }}
                </td>
                <td v-else>
                  Немає запису
                </td>
                <td v-if="timeSlot.appointment">
                  {{ timeSlot.appointment.service_name }}
                </td>
                <td v-else />
                <td>
                  <v-btn
                    v-if="timeSlot.appointment"
                    color="primary"
                    @click="goToDoctorAppointment(timeSlot.appointment.id)"
                  >
                    Картка пацієнта
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </template>
        </v-table>

        <v-alert
          v-else-if="!loading && !error"
          type="info"
          class="mb-4"
        >
          Немає доступного розкладу для цієї дати.
        </v-alert>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import axiosInstance from '@/api/axiosInstance';
import Pusher from 'pusher-js';

const route = useRoute();
const router = useRouter();
const dayId = route.params.id;
const formattedDate = ref('');
const timeSlots = ref([]);
const loading = ref(false);
const error = ref('');

const fetchDaySchedule = async () => {
  loading.value = true;
  error.value = '';

  try {
    const response = await axiosInstance.get(`/doctor/schedule/${dayId}`);
    formattedDate.value = response.data.date;
    timeSlots.value = response.data.time_sheets;
  } catch (err) {
    error.value = err.response?.data?.message || 'Не вдалося отримати розклад.';
  } finally {
    loading.value = false;
  }
};

const goToDoctorAppointment = (appointmentId) => {
  router.push({
    name: 'DoctorAppointment',
    params: {
      appointmentId: appointmentId,
    },
  });
};

onMounted(() => {
  fetchDaySchedule();

  const pusher = new Pusher('84809a7900d8ed262dd8', {
    cluster: 'eu',
    encrypted: true,
  });

  const channel = pusher.subscribe('appointments');

  channel.bind('App\\Events\\AppointmentBooked', (data) => {
    const slotIndex = timeSlots.value.findIndex(slot => slot.id === data.time_slot_id);

    if (slotIndex !== -1) {
      timeSlots.value[slotIndex].appointment = data.appointment;
      timeSlots.value[slotIndex].is_active = false;
    }
  });
});
</script>
