import { defineStore } from 'pinia';
import axiosInstance from '@/api/axiosInstance';

export const useDoctorStore = defineStore('doctor', {
  state: () => ({
    doctorDetails: null,
  }),
  actions: {
    async fetchDoctorDetails() {
      if (this.doctorDetails) {
        return this.doctorDetails;
      }
      try {
        const response = await axiosInstance.get('/doctor/details');
        this.doctorDetails = response.data;
        return this.doctorDetails;
      } catch (error) {
        console.error('Ошибка загрузки данных доктора:', error);
        throw error;
      }
    },
    clearDoctorDetails() {
      this.doctorDetails = null;
    },
  },
});
