<template>
  <div>
    <v-card flat outlined class="pt-2">
        <v-text-field
          placeholder="Search"
          v-model="searchValue"
          clearable
          density="compact"
          append-inner-icon="mdi-magnify"
          class="sticky-header"
        ></v-text-field>

        <div class="scrollable-content pl-1">
          <div
            v-for="(item, index) in filteredItems"
            :key="item.title"
            class="example-section pb-3"
          >
            <v-divider v-if="index > 0" class="pb-2"></v-divider>
            <v-container class="title-container">
              <h4 class="pb-2">{{ item.title }}</h4>
              <v-btn size="30" variant="text"><v-icon size="16" @click="showDescription(item)"
                >mdi-information-outline</v-icon
              ></v-btn>              
            </v-container>

            <p>Filter: {{ item.filter.field }}</p>
            <ul class="pb-2" style="list-style-type: none;">
              <li v-for="example in item.filter.examples" :key="example.label">
                <v-tooltip>
                  <template #activator="{ props }">
                    <span
                      v-bind="props"
                      class="filter-item"
                      @click="
                        handleFilter(item.filter.field, example.snippet)
                      "
                      ><p>{{ example.label }}: {{ example.snippet }}</p>
                      <v-icon size="16" class="arrow-icon"
                        >mdi-arrow-top-left</v-icon
                      >
                    </span>
                  </template>
                  <span>Insert as parameter</span>
                </v-tooltip>
              </li>
            </ul>
            <div v-if="item.sort">
              <p>Sort: {{ item.sort.text }}</p>
              <ul style="list-style-type: none;">
                <li v-for="example in item.sort.examples" :key="example.label">
                  <v-tooltip>
                    <template #activator="{ props }">
                      <span
                        v-bind="props"
                        class="sort-item"
                        @click="
                          handleSort(example.snippet, example.label.includes('Ascending'))
                        "
                        ><p>
                          {{ example.label }}:
                          {{ example.snippet }}
                        </p>
                        <v-icon size="16" class="arrow-icon"
                          >mdi-arrow-top-left</v-icon
                        >
                      </span>
                    </template>
                    <span>Insert as parameter</span>
                  </v-tooltip>
                </li>
              </ul>
            </div>
          </div>
        </div>
    </v-card>
    <ItemDescription
      v-model:showDialog="showDialog"
      :selectedItem="selectedItem"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, nextTick } from "vue";
import type { Item } from "../../types/types";
import itemsData from "../../stores/items.json";
import { useAppStore } from "../../stores/app";
import ItemDescription from "../popups/ItemDescription.vue"
import { Order } from "@/types/enums";

const appStore = useAppStore();
const searchValue = ref("");
const items = ref<Item[]>(itemsData as Item[]);

const showDialog = ref(false);
const selectedItem = ref<Item | null>(null);

const filteredItems = computed(() => {
  if (!searchValue.value) {
    return items.value;
  }

  return items.value.filter(
    (item) =>
      (item.title?.toLowerCase().includes(searchValue.value.toLowerCase())) ||
      (item.filter?.field?.toLowerCase().includes(searchValue.value.toLowerCase())) ||
      (item.sort?.text?.toLowerCase().includes(searchValue.value.toLowerCase()))
  );
});

const handleFilter = (field: string, example: string) => {
  appStore.addFilterItem(field, example);
};

const handleSort = (snippet: string, isAscending: boolean) => {
  const [param] = snippet.split(" ");
  const order = isAscending ? Order.ASC : Order.DESC;

  appStore.setSortBy("");
  nextTick(() => {
    appStore.setSortBy(`${param} ${order}`);
  });

  appStore.addSortItem(param, order);
};

const showDescription = (item: Item) => {
  selectedItem.value = item;
  showDialog.value = true;
};

</script>

<style scoped>
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: white;
}
.scrollable-content {
  max-height: calc(100vh - 510px);
  overflow-y: auto;
}

p {
  font-size: small;
}

.filter-item, .sort-item {
  display: inline-flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.filter-item:hover, .sort-item:hover {
  background-color: #eeeeee;
  justify-content: space-between;
  border-radius: 1px;
}

.arrow-icon {
  margin-left: 4px;
  margin-right: 5px;
}

.title-container {
  display: flex;
  justify-content: space-between;
  padding: 5px 0px;
}
</style>
