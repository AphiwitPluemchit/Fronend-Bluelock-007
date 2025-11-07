<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { QInput } from 'quasar'

const inputRef = ref<InstanceType<typeof QInput> | null>(null)
const showSuggestions = ref(false)
const filteredRooms = ref<string[]>([])
const searchText = ref('')
const roomError = ref('')
const props = defineProps<{
  modelValue: string[]
  disable?: boolean
  rooms?: string[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
  (e: 'update:roomError', value: string): void
  (e: 'enter'): void
}>()

const selectedRoom = computed({
  get: () => props.modelValue,
  set: (val: string[]) => emit('update:modelValue', val),
})

const allRooms = computed(
  () =>
    props.rooms ?? [
      'Online',
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
    ],
)

const displayText = computed({
  get: () => selectedRoom.value.join(', '),
  set: (val: string) => {
    searchText.value = val
  },
})

const onFocus = () => {
  filteredRooms.value = allRooms.value
  showSuggestions.value = true
}

const filterRooms = () => {
  const query = searchText.value.trim().toLowerCase()
  filteredRooms.value = query
    ? allRooms.value.filter((room) => room.toLowerCase().includes(query))
    : allRooms.value
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
  if (current.length > 0) {
    roomError.value = ''
  }
}
const validate = async () => {
  if (!selectedRoom.value.length) {
    roomError.value = 'กรุณาเลือกห้องอย่างน้อย 1 ห้อง'
    await nextTick()
    inputRef.value?.$el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return false
  }
  roomError.value = ''
  return true
}
defineExpose({ validate })

const handleEnter = async (e: KeyboardEvent) => {
  console.log('✅ ENTER กดแล้ว blur input')

  e.preventDefault()


  const input = inputRef.value?.$el?.querySelector('input') as HTMLInputElement | null
  input?.blur()

  await nextTick()

  emit('enter')
}
</script>

<template>
  <div class="input-group">
    <p class="label label_minWidth" :class="{ 'label-error-shift': roomError !== '' }">
      ห้องที่จัดโครงการ :
    </p>
    <div class="input-container">
      <q-input
        outlined
        ref="inputRef"
        v-model="displayText"
        :disable="props.disable"
        class="full-width fix-q-input-height"
        @focus="onFocus"
        @input="filterRooms"
        :error="roomError !== ''"
         hide-bottom-space
      >
    </q-input>
        <q-menu
          v-if="!props.disable"
          v-model="showSuggestions"
          anchor="bottom left"
          self="top left"
          :fit="true"
          @enter="handleEnter"
          :cover="false"
        >
          <q-list class="scroll dropdown-list">
            <q-item
              v-for="(room, index) in filteredRooms"
              :key="index"
              clickable
              @mousedown.prevent
              @click="selectRoom(room)"
              :class="{ 'selectcvfed-item': selectedRoom.includes(room) }"
            >
              <q-item-section>
                {{ room }}
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
  
      <div v-if="roomError" class="text-negative text-subtitle2 q-mt-xs">
        {{ roomError }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.fix-q-input-height ::v-deep(.q-icon) {
  font-size: 16px;
}
.fix-q-input-height ::v-deep(.q-field__control) {
  height: 40px !important;
  min-height: 40px !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  display: flex;
  align-items: center;
}

.fix-q-input-height ::v-deep(.q-field__append) {
  align-items: center;
  display: flex;
}
.label-error-shift {
  transform: translateY(-12px);
}
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

.full-width,
.full-width-menu {
  width: 100%;
}
.input-container {
  width: 660px;
  max-width: 100%;
}
.dropdown-list {
  width: 100%;
  max-width: 100%;
  height: 400px;
}
@media (max-width: 1880px) {
  .input-container {
    width: 530px;
    max-width: 100%;
  }
  .label_minWidth {
    min-width: 180px !important;
  }
}
@media (max-width: 860px) {
  .input-group:not(.no-wrap) {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 10px !important;
    gap: 5px !important;
  }
  .input-container {
    width: 470px;
    max-width: 100%;
  }
  .label {
    justify-content: flex-start;
  }

  .label_minWidth {
    min-width: unset !important;
    width: 100% !important;
    text-align: left;
    padding-left: 0;
    margin-left: 0;
  }
}
@media (max-width: 500px) {
  .input-group {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 10px !important;
    gap: 5px !important;
  }

  .label {
    justify-content: flex-start;
  }

  .label_minWidth {
    min-width: unset;
    width: 100%;
    text-align: left;
    padding-left: 0;
    margin-left: 0;
  }
  .input-container {
    width: 100%;
  }
  .dropdown-list {
    height: 300px;
  }
}
</style>
