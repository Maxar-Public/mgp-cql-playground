<template>
    <div class="sidebar">
        <div class="top-section">
            <div class="text-area">
                <Filter />
                <Sort />
            </div>
        
            <div class="button-row">
                <GenerateURL />
                <Load />
            </div>
        </div>
        <div class="below-section">
        <!-- Toggle Button -->
        <div class="toggle-header">
          <h4>Search</h4>          
        </div>

        <Search />

      </div>
    </div>
</template>

<script lang="ts" setup>

</script>

<style scoped>

.sidebar {
  width: 525px;
  height: 100vh;
  background-color: #E1E1E1;
  display: flex;
  flex-direction: column;
  padding: 10px;
}

.top-section {
  background-color: #FFFFFF;
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 10px;
}

.button-row {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}

.below-section {
  background-color: #FFFFFF;
  border-radius: 10px;
  flex-grow: 1;
  padding: 10px;
  overflow-y: auto;
}

.text-area {
  display: flex;
  flex-direction: column;
  row-gap: 15px;
}

.toggle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0px;
}

.toggle-header h4 {
  margin: 0;
  font-size: 1.2rem;
}
</style>
