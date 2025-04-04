<template>
  <div
    v-if="appStore.isWfsResultsVisible"
    :style="{ top: `${position.y}px`, left: `${position.x}px`, position: 'absolute', 
      zIndex: 1000, width: `${modalWidth}px`, height: `auto`,
    }" @mousedown="startDragging"
  >
    <div class="modal-content">
      <div class="modal-header">
        <span>
          <h3>WFS Response</h3>
          Features at lat, lon:
          <strong>{{ appStore.wfsLat }}, {{ appStore.wfsLon }}</strong>
        </span>
        <button class="close-button" @click="appStore.setWfsResultClose">
          <v-icon>mdi-close</v-icon>
        </button>
      </div>
      <div v-if="appStore.wfsResults.length" class="feature-table">
        <div class="content">
          <ul class="tree">
            <li v-for="(feature, index) in appStore.wfsResults" :key="index">
              <details>
                <summary><strong>ID:</strong> {{ feature.id }}</summary>
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
      <div v-else>
        <p class="feature-table">No data available to display.</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useAppStore } from "@/stores/app";
import { onUnmounted, ref } from "vue";

const appStore = useAppStore();

// State for dragging
const position = ref({ x: window.innerWidth - 605, y: 10 });
const isDragging = ref(false);
const dragOffset = ref({ x: 0, y: 0 });
const modalWidth = ref(500);
const modalHeight = ref(500);

const startDragging = (e: MouseEvent) => {
  isDragging.value = true;
  dragOffset.value.x = e.clientX - position.value.x;
  dragOffset.value.y = e.clientY - position.value.y;

  window.addEventListener("mousemove", onDrag);
  window.addEventListener("mouseup", stopDragging);
};

const onDrag = (e: MouseEvent) => {
  if (isDragging.value) {
    let newX = e.clientX - dragOffset.value.x;
    let newY = e.clientY - dragOffset.value.y;

    newX = Math.max(0, Math.min(newX, window.innerWidth - modalWidth.value));
    newY = Math.max(0, Math.min(newY, window.innerHeight - modalHeight.value));

    position.value.x = newX;
    position.value.y = newY;
  }
};

const stopDragging = () => {
  isDragging.value = false;
  window.removeEventListener("mousemove", onDrag);
  window.removeEventListener("mouseup", stopDragging);
};

// Cleanup
onUnmounted(() => {
  window.removeEventListener("mousemove", onDrag);
  window.removeEventListener("mouseup", stopDragging);
});
</script>

<style scoped>
.modal-content {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f5f5f5;
  padding: 10px 15px;
  border-bottom: 1px solid #ddd;
}

.feature-table {
  display: flex;
  flex-direction: column;
  background: white;
  padding: 15px;
  max-height: 500px;
  overflow-y: auto;
}

.tree {
  list-style: none;
  padding-left: 20px;
  font-size: 14px;
}

.tree li {
  margin: 5px 0;
}

.tree ul {
  list-style: none;
  padding-left: 20px;
}

.tree details summary {
  cursor: pointer;
}
</style>
