<template>
  <q-badge :class="buttonClass" rounded>
    <div class="status-container">
      <span class="status-dot" ></span>
      <span class="status-label">{{ buttonLabel }}</span>
    </div>
    </q-badge>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  status: number
}
const props = defineProps<Props>()

const buttonLabel = computed(() => {
  if (props.status === 1) return 'ยังไม่เข้าร่วม'
  if (props.status === 2) return 'เข้าร่วมแล้ว'
  return 'ขาด'
})

const buttonClass = computed(() => {
  if (props.status === 1) return 'status-dot--yellow'
  if (props.status === 2) return 'status-dot--green'
  return 'status-dot--red'
})
</script>

<style scoped>
.status-container {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: white;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.05);
}

.status-dot--yellow {
  background-color: #ffd740;
}
.status-dot--green {
  background-color: #00c853;
}
.status-dot--red {
  background-color: #ff3d00;
}

.status-label {
  font-size: 14px;
}
</style>
