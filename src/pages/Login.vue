<template>
  <v-container
    class="d-flex justify-center align-center"
    style="height: 100vh;"
  >
    <v-card
      class="pa-6 elevation-3"
      width="500"
    >
      <v-card-title class="mb-4 justify-center text-h6 font-weight-bold">
        Увійдіть у свій акаунт
      </v-card-title>
      <v-card-text>
        <v-form
          ref="form"
          @submit.prevent="submitLogin"
        >
          <v-text-field
            v-model="email"
            label="Email"
            type="email"
            variant="outlined"
          />
          <v-text-field
            v-model="password"
            label="Пароль"
            type="password"
            autocomplete="on"
            variant="outlined"
          />
          <v-alert
            v-if="errorMessage"
            type="error"
            class="mb-4"
            dismissible
            @click:close="errorMessage = ''"
          >
            {{ errorMessage }}
          </v-alert>
          <v-btn
            type="submit"
            block
            color="primary"
            class="mt-4"
            :disabled="!isEmailValid || !isPasswordValid"
          >
            Увійти
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import {useRouter} from 'vue-router';
import axiosInstance from '@/api/axiosInstance';
import {ref, computed} from 'vue';

export default {
  name: 'Login',
  setup() {
    const router = useRouter();
    const email = ref('');
    const password = ref('');
    const errorMessage = ref('');

    const isEmailValid = computed(() => email.value.includes('@'));
    const isPasswordValid = computed(() => password.value.length < 160);

    const submitLogin = async () => {
      try {
        const response = await axiosInstance.post('/doctor/login', {email: email.value, password: password.value});
        localStorage.setItem('doctorToken', response.data.token);
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        await router.push({name: 'DoctorDashboard'});
      } catch {
        errorMessage.value = 'Невірні дані для входу';
      }
    };

    return {email, password, isEmailValid, isPasswordValid, submitLogin, errorMessage};
  },
};
</script>
