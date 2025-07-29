<template>
 <div>
  ad
 </div>
</template>
<script setup lang="ts">

</script>

<style scoped>
.question-container {
  max-width: 800px;
  margin: 0 auto;
}

.question-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.question-header {
  margin-bottom: 16px;
}

.question-text {
  font-size: 16px;
  font-weight: 500;
  color: #202124;
  line-height: 1.5;
}

.required-indicator {
  color: #d93025;
  margin-left: 4px;
}

.question-content {
  margin-top: 16px;
}

.grid-container {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.grid-header {
  display: flex;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.grid-corner {
  width: 120px;
  min-width: 120px;
  padding: 12px;
  border-right: 1px solid #e0e0e0;
  font-weight: 500;
  color: #5f6368;
}

.grid-column-header {
  flex: 1;
  padding: 12px 8px;
  text-align: center;
  font-weight: 500;
  color: #5f6368;
  border-right: 1px solid #e0e0e0;
}

.grid-column-header:last-child {
  border-right: none;
}

.grid-row {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
}

.grid-row:last-child {
  border-bottom: none;
}

.grid-row-label {
  width: 120px;
  min-width: 120px;
  padding: 12px;
  border-right: 1px solid #e0e0e0;
  font-size: 14px;
  color: #202124;
  display: flex;
  align-items: center;
}

.grid-row-options {
  flex: 1;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 8px;
}

.grid-row-options .q-radio,
.grid-row-options .q-checkbox {
  margin: 0 4px;
}
</style>
