<template>
  <v-app>
      <div class="container">
        <Panel />
        <Map /> 
        <CopyURL />            
      </div>
  </v-app>
</template>

<script setup lang="ts">
import CopyURL from './popups/CopyURL.vue';
</script>

<style scoped>

.container {
  display: flex;
  flex-direction: row;
}
</style>