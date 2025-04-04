<template>
    <v-container class="fill-height d-flex align-center justify-center">
      <v-dialog v-model="showDialogLocal" max-width="600px" @click:outside="closeDialog">
        <v-card class="card-container">
          <v-card-title class="headline">{{ props.selectedItem?.title }}</v-card-title>
          <v-divider></v-divider>
        <v-card-text class="card-content">
          <div v-if="selectedItem?.description">
            <p><strong>Description:</strong> {{ selectedItem.description }}</p>
          </div>

          <!-- Filter -->
          <div v-if="selectedItem?.filter">
            <p><strong>Filter Field:</strong> {{ selectedItem.filter.field }}</p>
            <ul class="list">
              <li v-for="(example, index) in selectedItem.filter.examples" :key="index">
                <strong>{{ example.label }}:</strong> {{ example.snippet }}
              </li>
            </ul>
          </div>

          <!-- Sort -->
          <div v-if="selectedItem?.sort">
            <p><strong>Sort:</strong> {{ selectedItem.sort.text || selectedItem.sort.text }}</p>
            <ul class="list">
              <li v-for="(example, index) in selectedItem.sort.examples" :key="index">
                <strong>{{ example.label }}:</strong> {{ example.snippet }}
              </li>
            </ul>
          </div>
        </v-card-text>
          <v-card-actions>
            <v-btn @click="closeDialog">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </template>
  
  <script setup lang="ts">
import { ref, watch, type PropType } from 'vue';
import type { Item } from "../../types/types";

const props = defineProps({
  showDialog: {
    type: Boolean,
    required: true,
  },
  selectedItem: {
    type: Object as PropType<Item | null>,
    default: null,
  },
});

const emit = defineEmits(['update:showDialog']);

const showDialogLocal = ref(props.showDialog);

watch(() => props.showDialog, (newVal) => {
  showDialogLocal.value = newVal;
});

const closeDialog = () => {
  emit('update:showDialog', false);
};
  </script>

  <style>
  .card-container {
    padding: 20px 20px 10px 20px;
  }

  .card-content {
    display: flex;
    flex-direction: column;
    row-gap: 20px;
  }

.list {
    margin-left: 30px;
}
</style>
  