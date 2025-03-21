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
            @click="selectRoom(room)"
            :class="{ 'selected-item': selectedRoom.includes(room) }"
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

const props = defineProps<{
  modelValue: string[]
  disable?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const selectedRoom = computed({
  get: () => props.modelValue,
  set: (val: string[]) => emit('update:modelValue', val),
})
watch(selectedRoom, (val) => {
  emit('update:modelValue', val)
})

const showSuggestions = ref(false)
const searchText = ref('')

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

const displayText = computed({
  get: () => selectedRoom.value.join(', '),
  set: (val: string) => {
    searchText.value = val
  },
})

const onFocus = () => {
  filteredRooms.value = allRooms
  showSuggestions.value = true
}

const filterRooms = () => {
  const query = searchText.value.trim().toLowerCase()
  filteredRooms.value = query
    ? allRooms.filter((room) => room.toLowerCase().includes(query))
    : allRooms
  showSuggestions.value = true
}

const selectRoom = (room: string) => {
  const current = [...selectedRoom.value]
  const index = current.indexOf(room)
  if (index === -1) {
    current.push(room)
  } else {
    current.splice(index, 1)
  }
  selectedRoom.value = current 
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
