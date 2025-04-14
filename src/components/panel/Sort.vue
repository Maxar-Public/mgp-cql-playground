<template>
  <div>
    <v-text-field
      label="Sort"
      v-model="inputText"
      variant="outlined"
      placeholder="&sortBy="
      class="small-font"
    ></v-text-field>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { useAppStore } from "../../stores/app";

const appStore = useAppStore();
const inputText = ref("");
const lastCategory = ref<"AorB" | "CorD" | null>(null);
let isUpdatingFromStore = false;


const formattedSortItems = computed(() => {
  return appStore.sortItems
    .map((item) => `${item.param} ${item.order}`)
    .join(", ");
});


watch(
  () => appStore.sortBy,
  (newValue) => {
    if (isUpdatingFromStore) {
      isUpdatingFromStore = false;
      return;
    }

    if (!newValue.trim()) {
      inputText.value = "";
      lastCategory.value = null;
      return;
    }

    const [param, category] = newValue.split(" ");
    const isAorB = category === "A";
    const isCorD = category === "D";

    if ((lastCategory.value === "AorB" && isAorB) || (lastCategory.value === "CorD" && isCorD)) {
      return;
    }

    const currentValues = inputText.value.split(", ").filter(Boolean);
    if (!currentValues.includes(newValue)) {
      currentValues.push(newValue);
      inputText.value = currentValues.join(", "); 
      lastCategory.value = isAorB ? "AorB" : "CorD"; 
    }
  }
);


watch(inputText, (newValue) => {
  if (isUpdatingFromStore) return; 
  isUpdatingFromStore = true;
  appStore.setSortBy(newValue.trim());
});


watch(
  () => formattedSortItems.value,
  (newFormattedValue) => {
    inputText.value = newFormattedValue;
  },
  { immediate: true }
);
</script>

<style scoped>
/* v-deep is deprecated */
.small-font :deep(input) {
  font-size: 14px !important;
}
</style>