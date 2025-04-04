<template>
  <div v-if="wfsResults.length || isWFSLoading" class="feature-table">
    <!-- Scrollable Content Section -->
    <div class="content">
      <div v-if="isWFSLoading" class="loading">Loading...</div>
      <div v-else>
        <ul class="tree">
          <li v-for="(feature, index) in wfsResults" :key="index">
            <details>
              <summary>
                <strong>ID:</strong> {{ feature.id }}
              </summary>
              <ul>
                <li v-for="(value, key) in feature.properties" :key="key">
                  <strong>{{ key }}:</strong> {{ value }}
                </li>
              </ul>
            </details>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

  
<script lang="ts" setup>
import { computed, ref, nextTick, watch } from 'vue';
import { useAppStore } from '@/stores/app';

const appStore = useAppStore();
const wfsResults = computed(() => appStore.wfsResults);
const isWFSLoading = computed(() => appStore.isWFSLoading);

// Watch for WFS results and update loading state
watch(
  () => appStore.wfsResults,
  async () => {
    if (appStore.wfsResults.length > 0) {
      await nextTick(); // Wait for DOM updates (e.g., `v-for` rendering)
      appStore.setWFSLoading(false);
    }
  }
);

</script>

<style scoped>
.feature-table {
  background: white;
  width: 100%;
  max-height: 100%;
  box-shadow: none;
  display: flex;
  flex-direction: column;
}

.content {
  flex-grow: 1;
  padding: 10px;
}

.loading {
  text-align: center;
  font-size: 1rem;
  font-weight: bold;
}

.tree {
  list-style: none;
  padding-left: 20px;
  font-size: 14px;
}

.tree ul {
  list-style: none;
  padding-left: 20px;
}

.tree details summary {
  cursor: pointer;
}
</style>

  