<template>
  <v-container
    class="d-flex justify-center align-center"
    style="height: 100vh;"
  >
    <v-empty-state
      headline="Упс, 404"
      title="Сторінку не знайдено"
      text="Сторінка, яку ви шукали, не існує"
    />
  </v-container>
</template>

<script>

export default {
  name: 'NotFound',
};
</script>
