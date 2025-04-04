<template>

    <div>
      <CustomTextarea
        v-model="inputText"
        label="Filter"
        placeholder="&cql_Filter="
        :wordsList="jsonFields"
        :symbols="symbols"
        :suggestionList="jsonExamples"
        height="150px"
        :example="example"
      />
      </div>
</template>


<script lang="ts" setup>
import { ref, watch } from "vue";
import { useAppStore } from "../../stores/app";
import items from "../../stores/items.json";

const appStore = useAppStore();

const inputText = ref("");
const jsonFields = items.map((item) => item.filter?.field).filter(Boolean);
const jsonExamples = items.map((item) => item.filter?.examples[0].snippet).filter(Boolean);
const example = ref(appStore.filter.example);
const symbols = ["=", "<", ">", "(", ")", "[", "]", "AND", "OR", "NOT", "BETWEEN", "LIKE", "IN"];

watch(inputText, (newValue) => {
  appStore.setFilter(newValue.trim());
});

watch(
  () => appStore.filter,
  (newFilter) => {
    const trimmedInput = inputText.value.trim();
    if (trimmedInput !== newFilter.param.trim()) {
      // Check if the last character is a single quote
      if (trimmedInput.length > 0) {
        inputText.value += " AND " + newFilter.example;
      } else {
        inputText.value += newFilter.example;
      }
    }
    example.value = newFilter.example || "";
  },
  { immediate: true, deep: true }
);

</script>

<style scoped>

</style>