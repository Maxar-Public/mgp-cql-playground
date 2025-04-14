<template>
  <v-dialog v-model="showDialog" persistent max-width="722">
    <v-card class="auth-popup">
      <v-card-title>
        <span class="text-h6">Enter API Key</span>
      </v-card-title>

      <v-card-text>
        An API Key is required to use this app.
        <v-text-field
          label="API Key"
          v-model="apiKey"
          placeholder="Insert API Key"
          clearable
          class="mt-3"
          :disabled="loading"
        />
      </v-card-text>

      <v-card-actions>
        <v-btn variant="outlined"
         @click="saveApiKeyAndCheck"
         :disabled="!apiKey || loading"
         data-test="auth-button"
        >
          <v-progress-circular
            v-if="loading"
            indeterminate
            color="white"
            :size="20"
          ></v-progress-circular>
          <span v-else>CONTINUE</span>
        </v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAppStore } from "@/stores/app";

const appStore = useAppStore();

const showDialog = ref(true);
const apiKey = ref("");
const loading = ref(false);

const saveApiKeyAndCheck = async () => {
  appStore.saveApiKey(apiKey.value);
  loading.value = true;
  await appStore.checkApiKey();

  if (appStore.apiKeyExists) {
    showDialog.value = false;
  } else {
    const errorInfo = 'Invalid API Key. Please try again.';
    appStore.setRecentError({ 
      timestamp: new Date().toISOString(), 
      info: errorInfo, 
      error: null
    });
  }
  loading.value = false;
};

</script>

<style scoped>
.auth-popup {
  border-top: 1px solid white;
}

.fill-height {
  height: 100vh;
  color: black;
}

.dialog-container {
  padding: 20px 10px;
}
</style>