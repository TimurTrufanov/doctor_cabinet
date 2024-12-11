<template>
  <v-container>
    <v-card>
      <v-card-title class="text-h5">
        Перегляд та заповнення прийому
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
          type="card"
        />

        <div v-else>
          <p
            v-if="specialization && specialization.name"
            class="mb-2"
          >
            <strong>Спеціалізація:</strong> {{ specialization.name }}
          </p>

          <p v-if="patient && patient.name">
            <strong>Паціент:</strong> {{ patient.name }}
          </p>

          <v-divider class="my-4" />

          <template v-if="isToday">
            <template v-if="appointmentStatus === 'заплановано'">
              <v-btn
                color="primary"
                class="mx-2"
                @click="showConfirmDialog('прийшов')"
              >
                Пацієнт прийшов на прийом
              </v-btn>

              <v-btn
                color="error"
                class="mx-2"
                @click="showConfirmDialog('скасовано')"
              >
                Пацієнт не прийшов на прийом
              </v-btn>

              <v-divider class="my-4" />
            </template>

            <template v-if="appointmentStatus === 'прийшов'">
              <v-btn
                color="primary"
                class="mx-2"
                @click="showAddRecordDialog = true"
              >
                Додати запис
              </v-btn>

              <v-btn
                color="success"
                class="mx-2"
                @click="showConfirmDialog('завершено')"
              >
                Завершити прийом
              </v-btn>

              <v-divider class="my-4" />
            </template>
          </template>

          <template
            v-for="appointment in appointments"
            :key="appointment.id"
          >
            <v-card-title class="text-h5">
              Дата запису {{ appointment.appointment_datetime }}
            </v-card-title>

            <v-divider class="my-4" />

            <template v-if="appointment.records.length">
              <v-card-title>Записи в картці</v-card-title>

              <v-list>
                <v-list-item
                  v-for="record in appointment.records"
                  :key="record.id"
                >
                  <p><strong>Доктор:</strong> {{ record.doctor.first_name }} {{ record.doctor.last_name }}</p>
                  <p><strong>Дата:</strong> {{ record.date }}</p>
                  <p><strong>Історія хвороби:</strong> {{ record.medical_history }}</p>
                  <p><strong>Діагноз:</strong> {{ record.diagnosis }}</p>
                  <p><strong>Лікування:</strong> {{ record.treatment }}</p>
                </v-list-item>
              </v-list>

              <v-divider class="my-4" />
            </template>

            <template v-if="appointment.analyses.length">
              <v-card-title>Аналізи</v-card-title>

              <v-list>
                <v-list-item
                  v-for="analysis in appointment.analyses"
                  :key="analysis.id"
                >
                  <p><strong>Аналіз:</strong> {{ analysis.name }}</p>
                  <p><strong>Кількість:</strong> {{ analysis.quantity }}</p>
                  <p><strong>Ціна:</strong> {{ analysis.price }} грн</p>
                  <p><strong>Загальна сума:</strong> {{ analysis.total_price }} грн</p>
                  <p><strong>Дата запису:</strong> {{ analysis.appointment_date }}</p>
                  <p><strong>Рекомендована дата:</strong> {{ analysis.recommended_date }}</p>
                  <p>
                    <strong>Статус: </strong><span :class="getStatusClass(analysis.status)"> {{
                      analysis.status
                    }} </span>
                  </p>
                  <p v-if="analysis.submission_date">
                    <strong>Дата сдачі аналізу:</strong> {{ analysis.submission_date }}
                  </p>
                  <p v-if="analysis.file">
                    <strong>Результат:</strong>
                    <a
                      :href="`http://localhost:8080/storage/${analysis.file}`"
                      target="_blank"
                    >
                      Завантажити файл
                    </a>
                  </p>
                </v-list-item>
              </v-list>

              <v-divider class="my-4" />
            </template>

            <template v-if="appointment.services.length">
              <v-card-title>Послуги</v-card-title>

              <v-list>
                <v-list-item
                  v-for="service in appointment.services"
                  :key="service.id"
                >
                  <p><strong>Послуга:</strong> {{ service.name }}</p>
                  <p><strong>Кількість:</strong> {{ service.quantity }}</p>
                  <p><strong>Ціна:</strong> {{ service.price }} грн</p>
                  <p><strong>Загальна сума:</strong> {{ service.total_price }} грн</p>
                </v-list-item>
              </v-list>

              <v-divider class="my-4" />
            </template>
          </template>
        </div>

        <v-pagination
          v-if="pagination.last_page > 1"
          v-model="pagination.current_page"
          :length="pagination.last_page"
          total-visible="8"
          class="mt-4"
        />
      </v-card-text>
    </v-card>

    <v-dialog
      v-model="confirmDialogVisible"
      max-width="600"
    >
      <v-card>
        <v-card-title class="text-h5">
          {{ confirmDialogTitle }}
        </v-card-title>
        <v-card-text>
          {{ confirmDialogText }}
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="secondary"
            @click="confirmDialogVisible = false"
          >
            Скасувати
          </v-btn>
          <v-btn
            color="primary"
            @click="confirmAction"
          >
            Підтвердити
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>


    <v-dialog
      v-model="showAddRecordDialog"
      max-width="600px"
    >
      <v-card>
        <v-card-title class="text-h5">
          Новий запис
        </v-card-title>
        <v-card-text>
          <v-textarea
            v-model="newRecord.medical_history"
            label="Історія хвороби"
            variant="outlined"
            rows="3"
            no-resize
            :error-messages="formErrors?.medical_history"
          />

          <v-autocomplete
            v-model="newRecord.diagnosis_id"
            :items="diagnoses"
            label="Діагноз"
            variant="outlined"
            item-title="name"
            item-value="id"
            clearable
            :error-messages="formErrors?.diagnosis_id"
            :disabled="!!newRecord.custom_diagnosis"
          />

          <v-text-field
            v-model="newRecord.custom_diagnosis"
            label="Власний діагноз (якщо відсутній у списку)"
            variant="outlined"
            :error-messages="formErrors?.custom_diagnosis"
            :disabled="!!newRecord.diagnosis_id"
          />

          <v-textarea
            v-model="newRecord.treatment"
            label="Лікування"
            variant="outlined"
            rows="3"
            no-resize
            :error-messages="formErrors?.treatment"
          />

          <v-divider class="my-4" />

          <v-card-title class="mb-2">
            Аналізи
          </v-card-title>

          <v-autocomplete
            v-model="selectedAnalysis"
            :items="analyses"
            label="Додати аналіз"
            variant="outlined"
            :item-title="(item) => `${item.name} (${item.price} грн)`"
            item-value="id"
            clearable
          />

          <v-text-field
            v-if="selectedAnalysis"
            v-model="analysisQuantity"
            type="number"
            label="Кількість"
            variant="outlined"
            @input="calculateAnalysisTotal()"
          />

          <p v-if="selectedAnalysis && analysisQuantity">
            <strong>Сума:</strong> {{ analysisTotal }} грн
          </p>

          <v-date-picker
            v-if="selectedAnalysis"
            v-model="recommendedDate"
            :min="appointmentDate"
            title="Рекомендована дата сдачі"
            header="Введіть дату"
          />

          <v-btn
            v-if="selectedAnalysis && analysisQuantity && recommendedDate"
            variant="outlined"
            @click="addAnalysis"
          >
            Додати аналіз
          </v-btn>

          <v-list>
            <v-list-item
              v-for="(analysis, index) in newRecord.analyses"
              :key="index"
            >
              <v-list-item-title>
                {{ analysis.name }}: {{ analysis.quantity }} * {{ analysis.price }} грн = {{ analysis.total_price }} грн
              </v-list-item-title>
              <v-list-item-subtitle>
                Рекомендована дата сдачі: {{ format(new Date(analysis.recommended_date), 'dd.MM.yyyy') }}
              </v-list-item-subtitle>
              <v-list-item-action>
                <v-btn
                  icon="mdi-pencil"
                  variant="text"
                  @click="editAnalysis(index)"
                />
                <v-btn
                  icon="mdi-delete"
                  variant="text"
                  @click="removeAnalysis(index)"
                />
              </v-list-item-action>

              <v-alert
                v-if="formErrors?.analyses?.[index]"
                type="error"
                dense
                class="mt-2"
              >
                <ul>
                  <li
                    v-for="(errors, field) in formErrors.analyses[index]"
                    :key="field"
                  >
                    {{ errors.join(', ') }}
                  </li>
                </ul>
              </v-alert>
            </v-list-item>
          </v-list>

          <v-divider class="my-4" />

          <v-card-title class="mb-2">
            Послуги
          </v-card-title>

          <v-autocomplete
            v-model="selectedService"
            :items="services"
            label="Додати послугу"
            variant="outlined"
            :item-title="(item) => `${item.name} (${item.price} грн)`"
            item-value="id"
            clearable
            :error-messages="formErrors?.service_id"
          />

          <v-text-field
            v-if="selectedService"
            v-model="serviceQuantity"
            type="number"
            label="Кількість"
            variant="outlined"
            :error-messages="formErrors?.quantity"
            @input="calculateServiceTotal()"
          />

          <p v-if="selectedService && serviceQuantity">
            <strong>Сума:</strong> {{ serviceTotal }} грн
          </p>

          <v-btn
            v-if="selectedService && serviceQuantity"
            variant="outlined"
            @click="addService"
          >
            Додати послугу
          </v-btn>

          <v-list>
            <v-list-item
              v-for="(service, index) in newRecord.services"
              :key="index"
            >
              <v-list-item-title>
                {{ service.name }}: {{ service.quantity }} x {{ service.price }} грн = {{ service.total_price }} грн
              </v-list-item-title>
              <v-list-item-action>
                <v-btn
                  icon="mdi-pencil"
                  variant="text"
                  @click="editService(index)"
                />
                <v-btn
                  icon="mdi-delete"
                  variant="text"
                  @click="removeService(index)"
                />
              </v-list-item-action>

              <v-alert
                v-if="formErrors?.services?.[index]"
                type="error"
                dense
                class="mt-2"
              >
                <ul>
                  <li
                    v-for="(errors, field) in formErrors.services[index]"
                    :key="field"
                  >
                    {{ errors.join(', ') }}
                  </li>
                </ul>
              </v-alert>
            </v-list-item>
          </v-list>
        </v-card-text>

        <v-card-actions>
          <v-btn
            color="secondary"
            variant="text"
            @click="showAddRecordDialog = false"
          >
            Відмінити
          </v-btn>
          <v-btn
            color="primary"
            @click="saveRecord"
          >
            Зберегти
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import {computed, onMounted, ref, watch} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import axiosInstance from '@/api/axiosInstance';
import {format} from 'date-fns';

const route = useRoute();
const router = useRouter();
const appointmentId = route.params.appointmentId;

const appointments = ref([]);
const pagination = ref({current_page: 1, last_page: 1});
const records = ref([]);
const appointmentDate = ref('');
const appointmentStatus = ref('');
const specialization = ref({});
const patient = ref({});
const loading = ref(false);
const error = ref('');
const showAddRecordDialog = ref(false);
const diagnoses = ref([]);
const newRecord = ref({
  medical_history: '',
  diagnosis_id: null,
  custom_diagnosis: '',
  treatment: '',
  analyses: [],
  services: [],
});

const analyses = ref([]);
const services = ref([]);
const selectedAnalysis = ref(null);
const selectedService = ref(null);
const analysisQuantity = ref(1);
const serviceQuantity = ref(1);
const analysisTotal = ref(0);
const serviceTotal = ref(0);
const recommendedDate = ref(null);

const formErrors = ref({});

const confirmDialogVisible = ref(false);
const confirmDialogTitle = ref('');
const confirmDialogText = ref('');
let confirmActionCallback = null;

const isToday = computed(() => {
  if (!appointmentDate.value) return false;

  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Kiev',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  return appointmentDate.value === today;
});

const getStatusClass = computed(() => {
  return (status) => {
    return {
      'text-primary': status === 'призначений',
      'text-success': status === 'завершений',
    };
  };
});

const fetchAppointments = async (page = 1) => {
  if (loading.value) return;

  loading.value = true;
  error.value = '';

  try {
    const response = await axiosInstance.get(`/doctor/appointments/${appointmentId}/details`, {
      params: {page},
    });

    specialization.value = response.data.specialization;
    patient.value = response.data.patient;
    appointments.value = response.data.appointments;
    appointmentDate.value = response.data.appointment_date;
    appointmentStatus.value = response.data.appointment_status;
    pagination.value = response.data.pagination;
  } catch (err) {
    error.value = err.response?.data?.message || 'Помилка при завантаженні даних.';
  } finally {
    loading.value = false;
  }
};

const fetchSelectValues = async () => {
  try {
    const [analysesResponse, servicesResponse, diagnosesResponse] = await Promise.all([
      axiosInstance.get('/analyses'),
      axiosInstance.get('/services'),
      axiosInstance.get('/diagnoses'),
    ]);

    analyses.value = analysesResponse.data;
    services.value = servicesResponse.data;
    diagnoses.value = diagnosesResponse.data;
  } catch {
    console.error('Ошибка загрузки дигнозов, анализов и услуг:');
  }
};

const calculateAnalysisTotal = () => {
  const analysis = analyses.value.find(a => a.id === selectedAnalysis.value);
  if (analysis) {
    analysisTotal.value = analysis.price * analysisQuantity.value;
  }
};

const calculateServiceTotal = () => {
  const service = services.value.find(s => s.id === selectedService.value);
  if (service) {
    serviceTotal.value = service.price * serviceQuantity.value;
  }
};

const addAnalysis = () => {
  const analysis = analyses.value.find(a => a.id === selectedAnalysis.value);
  if (analysis) {
    newRecord.value.analyses.push({
      analysis_id: selectedAnalysis.value,
      name: analysis.name,
      price: analysis.price,
      quantity: analysisQuantity.value,
      total_price: analysisTotal.value,
      recommended_date: recommendedDate.value
        ? format(new Date(recommendedDate.value), 'yyyy-MM-dd')
        : null,
    });
    selectedAnalysis.value = null;
    analysisQuantity.value = 1;
    analysisTotal.value = 0;
    recommendedDate.value = null;
  }
};

const addService = () => {
  const service = services.value.find(s => s.id === selectedService.value);
  if (service) {
    newRecord.value.services.push({
      service_id: selectedService.value,
      name: service.name,
      price: service.price,
      quantity: serviceQuantity.value,
      total_price: serviceTotal.value,
    });
    selectedService.value = null;
    serviceQuantity.value = 1;
    serviceTotal.value = 0;
  }
};

const saveRecord = async () => {
  try {
    const payload = {
      ...newRecord.value,
      appointment_id: appointmentId,
    };

    const response = await axiosInstance.post(`/doctor/appointments/${appointmentId}/details`, payload);

    records.value.unshift(response.data);

    await fetchAppointments();

    Object.assign(newRecord.value, {
      medical_history: '',
      diagnosis_id: null,
      custom_diagnosis: '',
      treatment: '',
      analyses: [],
      services: [],
    });

    formErrors.value = {};
    showAddRecordDialog.value = false;
  } catch (err) {
    if (err.response?.data?.errors) {
      formErrors.value = err.response.data.errors;
    } else {
      error.value = err.response?.data?.message || 'Помилка при створенні запису.';
    }
  }
};

const clearErrors = (index, field) => {
  if (formErrors.value[field] && formErrors.value[field][index]) {
    delete formErrors.value[field][index];

    if (Object.keys(formErrors.value[field]).length === 0) {
      delete formErrors.value[field];
    }
  }
};

const editAnalysis = (index) => {
  clearErrors(index, 'analyses');
  const analysis = newRecord.value.analyses[index];
  selectedAnalysis.value = analysis.analysis_id;
  analysisQuantity.value = analysis.quantity;
  recommendedDate.value = analysis.recommended_date
    ? new Date(analysis.recommended_date)
    : null;
  newRecord.value.analyses.splice(index, 1);
};

const removeAnalysis = (index) => {
  clearErrors(index, 'analyses');
  newRecord.value.analyses.splice(index, 1);
};

const editService = (index) => {
  clearErrors(index, 'services');
  const service = newRecord.value.services[index];
  selectedService.value = service.service_id;
  serviceQuantity.value = service.quantity;
  newRecord.value.services.splice(index, 1);
};

const removeService = (index) => {
  clearErrors(index, 'services');
  newRecord.value.services.splice(index, 1);
};

const updateAppointmentStatus = async (status) => {
  try {
    const response = await axiosInstance.patch(`/doctor/appointments/${appointmentId}/status`, {status});
    appointmentStatus.value = response.data.status;
  } catch (err) {
    error.value = err.response?.data?.message || 'Помилка при оновленні статусу.';
  }
};

const showConfirmDialog = (action) => {
  if (action === 'прийшов') {
    confirmDialogTitle.value = 'Підтвердити присутність пацієнта';
    confirmDialogText.value = 'Ви впевнені, що пацієнт прийшов на прийом?';
    confirmActionCallback = () => updateAppointmentStatus('прийшов');
  }
  if (action === 'скасовано') {
    confirmDialogTitle.value = 'Підтвердити скасування прийому';
    confirmDialogText.value = 'Ви впевнені, що пацієнт не прийшов на прийом?';
    confirmActionCallback = () => updateAppointmentStatus('скасовано');
  }
  if (action === 'завершено') {
    confirmDialogTitle.value = 'Підтвердити завершення прийому';
    confirmDialogText.value = 'Ви впевнені, що хочете завершити прийом?';
    confirmActionCallback = () => updateAppointmentStatus('завершено');
  }
  confirmDialogVisible.value = true;
};

const confirmAction = () => {
  if (confirmActionCallback) {
    confirmActionCallback();
  }
  confirmDialogVisible.value = false;
};

const updatePageInUrl = (page) => {
  const currentQuery = {...route.query};

  if (page === 1) {
    delete currentQuery.page;
  } else {
    currentQuery.page = page;
  }

  router.replace({query: currentQuery});
};

watch(
  () => route.query.page,
  async (page) => {
    const pageNumber = +page || 1;
    if (pageNumber !== pagination.value.current_page) {
      pagination.value.current_page = pageNumber;
      await fetchAppointments(pageNumber);
    }
  }
);

watch(
  () => pagination.value.current_page,
  (newPage) => {
    updatePageInUrl(newPage);
  }
);

watch(selectedAnalysis, () => {
  calculateAnalysisTotal();
});

watch(selectedService, () => {
  calculateServiceTotal();
});

watch(() => pagination.value.current_page, (newPage) => {
  fetchAppointments(newPage);
});

onMounted(async () => {
  pagination.value.current_page = +route.query.page || 1;
  await fetchAppointments(pagination.value.current_page);
  await fetchSelectValues();
});
</script>

