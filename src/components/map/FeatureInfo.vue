<template>
    <div
      v-if="featureInfo || isLoading"
      class="feature-info"
      ref="featureInfoRef"
      :style="{ top: `${position.y}px`, left: `${position.x}px` }"
    >
      <!-- Header Section -->
      <div class="header"  @mousedown="startDrag">
        <h3>Feature Information</h3>
        <button class="close-button" @click="closeFeatureInfo">✖</button>
      </div>
  
      <!-- Scrollable Content Section -->
      <div class="content">
        <div v-if="isLoading" class="loading">
          <span>Loading...</span>
        </div>
        <pre v-else>{{ featureInfo }}</pre>
      </div>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { useAppStore } from '@/stores/app';
  import { computed, ref } from 'vue';
  
  const appStore = useAppStore();
  const featureInfo = computed(() => appStore.featureInfo);
  const isLoading = computed(() => appStore.isLoading);
  const featureInfoRef = ref<HTMLDivElement | null>(null);

  // Position state
const position = ref({ x: window.innerWidth / 2 - 200, y: window.innerHeight / 2 - 150 }); // Default center position
const isDragging = ref(false);
let dragStart = { x: 0, y: 0 };
  
  // Close feature info
  const closeFeatureInfo = () => {
    appStore.setFeatureInfo(null);
  };
  
// Start dragging
const startDrag = (event: MouseEvent) => {
  isDragging.value = true;
  dragStart.x = event.clientX - position.value.x;
  dragStart.y = event.clientY - position.value.y;
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
};

// Handle dragging
const onDrag = (event: MouseEvent) => {
  if (isDragging.value) {
    position.value.x = event.clientX - dragStart.x;
    position.value.y = event.clientY - dragStart.y;
  }
};

// Stop dragging
const stopDrag = () => {
  isDragging.value = false;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
};
  </script>
  
  <style scoped>
  .feature-info {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-40%, 0%);
    background: white;
    width: 500px;
    max-height: 400px;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    cursor: grab;
    display: flex;
    flex-direction: column;
  }
  
  .feature-info.dragging {
    cursor: grabbing;
  }
  
  /* Header Section */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f1f1f1; /* Slight background color for contrast */
    padding: 10px;
    border-bottom: 1px solid #ddd;
    flex-shrink: 0; /* Prevent header from shrinking */
  }
  
  /* Close Button */
  .close-button {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
  }
  
  /* Content Section */
  .content {
    flex-grow: 1; /* Allow content to expand */
    overflow-y: auto; /* Enable scrolling for long content */
    padding: 10px;
  }
  
  /* Loading Indicator */
  .loading {
    text-align: center;
    font-size: 1rem;
    font-weight: bold;
  }
  </style>
  