<template>
  <div class="input-group">
    <p class="label label_minWidth">ชื่อห้องที่จัดกิจกรรม :</p>

    <q-input
      outlined
      v-model="displayText"
      :disable="props.disable"
      style="width: 600px"
      @focus="onFocus"
      @input="filterRooms"
      ref="inputRef"
    >
      <q-menu
        v-if="!props.disable"
        v-model="showSuggestions"
        anchor="bottom left"
        self="top left"
        :fit="false"
        :cover="false"
      >
        <q-list style="min-width: 600px; max-height: 300px" class="scroll">
          <q-item
            v-for="(room, index) in filteredRooms"
            :key="index"
            clickable
            @click="toggleRoom(room)"
            :class="{ 'selected-item': selectedRooms.includes(room) }"
          >
            <q-item-section>
              {{ room }}
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-input>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const selectedRooms = ref<string[]>([])
const showSuggestions = ref(false)
const searchText = ref('') // ใช้สำหรับค้นหา (แยกจาก input หลัก)

const emit = defineEmits(['update:roomName'])
watch(selectedRooms, (val) => emit('update:roomName', val))

const props = defineProps<{
  modelValue: string[] | string
  disable?: boolean
}>()

// ห้องทั้งหมด
const allRooms = [
  '11M280',
  '5M210',
  '4M210',
  '3M210',
  '7T05',
  '6T05',
  '5T05',
  '6T01',
  '6T02',
  '6T03',
  '6T04',
  '5T01',
  '5T02',
  '5T03',
  '5T04',
  'Lab 4C01',
  'Lab 4C02',
  'Lab 4C03',
  'Lab 3C01',
  'Lab 3C02',
  'Lab 3C03',
  'Lab 3C04',
]

const filteredRooms = ref<string[]>([])

// แสดงข้อความใน input
const displayText = computed(() => selectedRooms.value.join(', '))

const onFocus = () => {
  filteredRooms.value = allRooms
  showSuggestions.value = true
}

const filterRooms = () => {
  const query = searchText.value.trim().toLowerCase()
  if (query === '') {
    filteredRooms.value = allRooms
  } else {
    filteredRooms.value = allRooms.filter((room) => room.toLowerCase().includes(query))
  }
  showSuggestions.value = true
}

const toggleRoom = (room: string) => {
  const index = selectedRooms.value.indexOf(room)
  if (index === -1) {
    selectedRooms.value.push(room)
  } else {
    selectedRooms.value.splice(index, 1)
  }
}
</script>

<style scoped>
.input-group {
  display: flex;
  align-items: center;
  gap: 25px;
  margin-bottom: 30px;
}
.label {
  font-size: 20px;
  font-weight: normal;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 40px;
}
.label_minWidth {
  min-width: 200px;
}
.input-group p {
  align-self: center;
  margin: 0;
  line-height: normal;
  text-align: right;
}
.selected-item {
  background-color: #d0e4ff !important;
  color: black;
}
</style>
