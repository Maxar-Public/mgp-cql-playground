<template>
  <v-app>
    <v-main>
      <Main />
      <ApiKeyDialog v-if="!apiKeyExists" />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/app';
import ApiKeyDialog from '@/components/auth/ApiKeyDialog.vue';

const appStore = useAppStore();

const { apiKeyExists } = appStore;
</script>
