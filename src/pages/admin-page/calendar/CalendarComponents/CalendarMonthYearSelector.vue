<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  selectedDate: string
}>()

const emit = defineEmits<{
  (e: 'update:selectedDate', value: string): void
}>()

const monthPopup = ref(false)
const yearPopup = ref(false)
const yearRangeStart = ref(new Date().getFullYear() - 10)

const thaiMonths = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
]

const thaiYears = computed(() =>
  Array.from({ length: 20 }, (_, i) => yearRangeStart.value + i + 543),
)

function setMonth(monthIndex: number) {
  const d = new Date(props.selectedDate)
  d.setMonth(monthIndex)
  emit('update:selectedDate', d.toISOString().slice(0, 10))
  monthPopup.value = false
}

function setYear(thaiYear: number) {
  const d = new Date(props.selectedDate)
  d.setFullYear(thaiYear - 543)
  emit('update:selectedDate', d.toISOString().slice(0, 10))
  yearPopup.value = false
}

function goPrevMonth() {
  const d = new Date(props.selectedDate)
  d.setMonth(d.getMonth() - 1)
  emit('update:selectedDate', d.toISOString().slice(0, 10))
}

function goNextMonth() {
  const d = new Date(props.selectedDate)
  d.setMonth(d.getMonth() + 1)
  emit('update:selectedDate', d.toISOString().slice(0, 10))
}

function goPrevYear() {
  const d = new Date(props.selectedDate)
  d.setFullYear(d.getFullYear() - 1)
  emit('update:selectedDate', d.toISOString().slice(0, 10))
}

function goNextYear() {
  const d = new Date(props.selectedDate)
  d.setFullYear(d.getFullYear() + 1)
  emit('update:selectedDate', d.toISOString().slice(0, 10))
}

function decreaseYearPage() {
  yearRangeStart.value -= 20
}

function increaseYearPage() {
  yearRangeStart.value += 20
}
</script>

<template>
  <div class="row items-center no-wrap">
    <!-- เดือน -->
    <div class="row items-center no-wrap q-mr-md">
      <q-btn
        flat
        dense
        icon="chevron_left"
        @click="goPrevMonth"
        class="bg-white text-black"
        style="width: 40px; height: 40px; border: 1px solid #d1d5db; border-radius: 8px"
      />

      <!-- style Month -->
      <div
        class="q-mx-sm text-h6 text-weight-medium hover-grey"
        style="
          min-width: 125px;
          text-align: center;
          cursor: pointer;
          padding: 6px 12px;
          border-radius: 8px;
        "
        @click="monthPopup = true"
      >
        {{ thaiMonths[new Date(selectedDate).getMonth()] }}
      </div>

      <q-btn
        flat
        dense
        icon="chevron_right"
        @click="goNextMonth"
        class="bg-white text-black"
        style="width: 40px; height: 40px; border: 1px solid #d1d5db; border-radius: 8px"
      />
    </div>

    <!-- ปี -->
    <div class="row items-center no-wrap">
      <q-btn
        flat
        dense
        icon="chevron_left"
        @click="goPrevYear"
        class="bg-white text-black"
        style="width: 40px; height: 40px; border: 1px solid #d1d5db; border-radius: 8px"
      />

      <!-- style Year -->
      <div
        class="q-mx-sm text-h6 text-weight-medium hover-grey"
        style="
          min-width: 80px;
          text-align: center;
          cursor: pointer;
          padding: 6px 12px;
          border-radius: 8px;
        "
        @click="yearPopup = true"
      >
        {{ new Date(selectedDate).getFullYear() + 543 }}
      </div>

      <q-btn
        flat
        dense
        icon="chevron_right"
        @click="goNextYear"
        class="bg-white text-black"
        style="width: 40px; height: 40px; border: 1px solid #d1d5db; border-radius: 8px"
      />
    </div>

    <!-- เดือน Popup -->
    <q-dialog v-model="monthPopup">
      <q-card>
        <q-card-section>
          <div class="row q-gutter-sm justify-center">
            <q-btn
              v-for="(month, i) in thaiMonths"
              :key="i"
              flat
              :label="month"
              @click="setMonth(i)"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- ปี Popup -->
    <q-dialog v-model="yearPopup">
      <q-card>
        <q-card-section>
          <div class="row justify-center">
            <q-btn flat icon="chevron_left" @click="decreaseYearPage" />
            <div class="text-h6 q-mx-md">
              {{ yearRangeStart + 543 }} - {{ yearRangeStart + 19 + 543 }}
            </div>
            <q-btn flat icon="chevron_right" @click="increaseYearPage" />
          </div>
          <div class="row q-gutter-sm justify-center q-mt-md">
            <q-btn
              v-for="year in thaiYears"
              :key="year"
              flat
              :label="year.toString()"
              @click="setYear(year)"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped>
.hover-grey:hover {
  background-color: #eee;
  transition: background-color 0.2s ease;
}
</style>
