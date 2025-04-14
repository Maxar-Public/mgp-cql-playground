<template>
    <v-dialog v-model="isCopyPopupVisible" class="popup-overlay" @click.self="closePopup" max-width="700">
      <v-card class="popup">
        <v-card-title class="popup-header">
          <span class="text-h6">Generated WMS URL</span>
          <v-btn @click="closePopup" variant="plain"><v-icon size="large">mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text class="popup-content">
          <textarea readonly rows="5">{{ completeUrl }}</textarea>
        </v-card-text>
        <v-card-actions class="popup-actions">
          <v-btn @click="copyToClipboard" @mouseleave="resetCopyStatus">
            <template v-if="isCopied">
              Copied <v-icon color="green">mdi-check</v-icon>
            </template>
            <template v-else>
              Copy URL
            </template>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script lang="ts" setup>
  import { useAppStore } from '@/stores/app';
  import { ref, computed } from 'vue';
  
  const appStore = useAppStore();
  const isCopyPopupVisible = computed(() => appStore.isCopyPopupVisible);
  const completeUrl = computed(() => appStore.getCompleteWmsUrl());
  
  const isCopied = ref(false);
  
  const closePopup = () => {
    appStore.closeCopyPopup();
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(completeUrl.value);
    isCopied.value = true;
  
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  };
  
  const resetCopyStatus = () => {
    if (!isCopied.value) {
      isCopied.value = false;
    }
  };
  </script>
  
  <style scoped>
  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #ddd;
    margin-bottom: 10px;
    padding-right: 0px;
  }

  .popup-content {
    min-height: 50px;
  }

  .popup-content textarea {
    width: 100%;
    resize: none;
  }
  
  .popup-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
  }
  </style>
  