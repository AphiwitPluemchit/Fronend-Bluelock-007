<template>
  <q-badge :class="buttonClass" rounded>
    <div class="status-container">
      <span class="status-dot"></span>
      <span class="status-label">{{ buttonLabel }}</span>
    </div>
  </q-badge>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  status: string
}
const props = defineProps<Props>()

const buttonLabel = computed(() => {
  switch (props.status) {
    case 'pending':
      return 'รออนุมัติ'
    case 'approved':
      return 'อนุมัติแล้ว'
    case 'rejected':
      return 'ไม่อนุมัติ'
    case 'manual':
      return 'เพิ่มเติม'
    default:
      return props.status
  }
})

const buttonClass = computed(() => {
  switch (props.status) {
    case 'pending':
      return 'status-dot--yellow'
    case 'approved':
      return 'status-dot--green'
    case 'rejected':
      return 'status-dot--red'
    case 'manual':
      return 'status-dot--purple'
    default:
      return 'status-dot--gray'
  }
})
</script>

<style scoped>
.status-container {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  width: 100%;
  height: 20px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: white;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.05);
}

.status-dot--yellow {
  background-color: #ffc107;
}
.status-dot--green {
  background-color: #4caf50;
}
.status-dot--red {
  background-color: #f44336;
}
.status-dot--gray {
  background-color: #9e9e9e;
}
.status-dot--purple {
  background-color: #9c27b0;
}

.status-label {
  font-size: 14px;
}
</style>
