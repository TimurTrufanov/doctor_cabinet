<template>

  <v-container>
    <v-card>
      <div class="d-flex justify-space-between">
        <v-card-title class="text-h5">
          Детальна інформація про лікаря
        </v-card-title>
        <v-card-actions>
          <v-btn @click="$router.back()">
            Назад
          </v-btn>
        </v-card-actions>
      </div>
      <v-card-text v-if="doctorDetails">
        <v-row>
          <v-col
            cols="12"
            md="6"
            class="d-flex justify-center"
          >
            <v-img
              :src="doctorDetails.photo"
              class="mb-4 rounded"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
            class="text-body-large"
          >
            <v-list class="text-md-h5">
              <v-list-item class="mb-2">
                <strong>Ім'я:</strong> {{ doctorDetails.full_name }}
              </v-list-item>
              <v-list-item class="mb-2">
                <strong>Email:</strong> {{ doctorDetails.email }}
              </v-list-item>
              <v-list-item
                v-if="doctorDetails.date_of_birth"
                class="mb-2"
              >
                <strong>Дата народження:</strong> {{ doctorDetails.date_of_birth }}
              </v-list-item>
              <v-list-item
                v-if="doctorDetails.address"
                class="mb-2"
              >
                <strong>Адрес:</strong> {{ doctorDetails.address }}
              </v-list-item>
              <v-list-item
                v-if="doctorDetails.phone_number"
                class="mb-2"
              >
                <strong>Телефон:</strong> {{ doctorDetails.phone_number }}
              </v-list-item>
              <v-list-item class="mb-2">
                <strong>Клініка:</strong> {{ doctorDetails.clinic }}
              </v-list-item >
              <v-list-item
                v-if="doctorDetails.specializations.length"
                class="mb-2"
              >
                <strong>Спеціалізації:</strong> {{ doctorDetails.specializations.join(', ') }}
              </v-list-item>
              <v-list-item class="mb-2">
                <strong>Посада:</strong> {{ doctorDetails.position }}
              </v-list-item>
              <v-list-item>
                <strong>Біографія:</strong> {{ doctorDetails.bio }}
              </v-list-item>
            </v-list>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { useDoctorStore } from '@/stores/doctorStore';
import { computed } from 'vue';

const doctorStore = useDoctorStore();

const doctorDetails = computed(() => doctorStore.doctorDetails);
</script>
