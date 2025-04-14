<template>
    <div>
        <v-btn variant="outlined" size="small" @click="generateUrl">Generate URL</v-btn>
    </div>
</template>
  
<script lang="ts" setup>
  import { useAppStore } from '@/stores/app';

  const appStore = useAppStore();

  const generateUrl = () => {
    appStore.openCopyPopup();
};
</script>
  
  