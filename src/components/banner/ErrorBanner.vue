<template>
    <div 
      v-if="appStore.recentError" 
      class="error-banner"
      :class="{
        'error-banner--dialog':
          appStore.recentError.info === 'Invalid API Key. Please try again.'}">
      <div class="error-content">
        <v-icon color="red" class="error-icon">mdi-alert-circle</v-icon>
        <p class="error-text">{{ appStore.recentError.info }}</p>
      </div>
      <v-card-actions>
        <v-btn @click="appStore.clearRecentError" class="close-btn">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-actions>
    </div>
</template>
  
<script lang="ts" setup>
  import { useAppStore } from "../../stores/app";
  
  const appStore = useAppStore();
</script>
  
<style scoped>
.error-banner {
  position: absolute;
  top: 20px;
  left: 50%;
  z-index: 3000;
  background-color: white;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 25%;
  max-width: 50%;
  min-width: 300px;
}

.error-banner--dialog {
  left: 50%;
  transform: translateX(-50%);
}

.error-content {
  display: flex;
  align-items: center;
}

.error-icon {
  margin-right: 20px;
  margin-left: 5px;
}

.error-text {
  font-size: 14px;
  font-weight: 400;
}

.close-btn {
  width: 30px;
  height: 28px; 
  min-width: 30px;
  padding: 0;
}

.v-card-actions{
  height: 30px; 
  min-height: auto;

}
</style>
  