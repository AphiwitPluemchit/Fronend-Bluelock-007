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
import { useHourHistoryStore } from 'src/stores/hourHistory'

const hourhistoryStore = useHourHistoryStore()

interface Props {
  status: string
}
const props = defineProps<Props>()

const buttonLabel = computed(() => {
  if (props.status === hourhistoryStore.HCStatusUpcoming) return 'ยังไม่เข้าร่วม'
  if (props.status === hourhistoryStore.HCStatusParticipating) return 'กำลังเข้าร่วม'
  if (props.status === hourhistoryStore.HCStatusAttended) return 'เข้าร่วมแล้ว'
  if (props.status === hourhistoryStore.HCStatusAbsent) return 'ไม่มาเข้าร่วม'
  if (props.status === 'manual') return 'เพิ่มเติม'
  return 'ข้อมูลเดิม'
})

const buttonClass = computed(() => {
  if (props.status === hourhistoryStore.HCStatusUpcoming) return 'status-dot--yellow'
  if (props.status === hourhistoryStore.HCStatusParticipating) return 'status-dot--blue'
  if (props.status === hourhistoryStore.HCStatusAttended) return 'status-dot--green'
    if (props.status === hourhistoryStore.HCStatusAbsent) return 'status-dot--red'
  if (props.status === 'manual') return 'status-dot--purple'
  return 'status-dot--brown'
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
.status-dot--purple {
  background-color: #7E57C2;
}

.status-dot--brown {
  background-color: #73635d;
}

.status-label {
  font-size: 14px;
}
</style>
