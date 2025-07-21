<script setup lang="ts">
import { useQuasar } from 'quasar'
import { ref, computed, watchEffect } from 'vue'

const props = defineProps<{
  selectedDate: string
}>()

const emit = defineEmits<{
  (e: 'update:selectedDate', value: string): void
}>()

const $q = useQuasar()
const isMobile = computed(() => $q.screen.lt.md)

const monthPopup = ref(false)
const yearPopup = ref(false)
const yearRangeStart = ref(new Date().getFullYear() - 10)

watchEffect(() => {
  console.log('isMobile:', isMobile.value, 'width:', $q.screen.width)
})

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
  <div class="calendar-selector q-mt-sm">
    <!-- Desktop layout -->
    <div v-if="!isMobile" class="row items-center justify-center q-gutter-sm">
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
        <q-card class="popup-card">
          <q-card-section>
            <!-- เดือน -->
            <div class="month-grid">
              <q-btn
                v-for="(month, i) in thaiMonths"
                :key="i"
                flat
                :label="month"
                @click="setMonth(i)"
                :class="['month-btn', new Date(selectedDate).getMonth() === i ? 'active' : '']"
              />
            </div>
          </q-card-section>
        </q-card>
      </q-dialog>

      <!-- ปี Popup -->
      <q-dialog v-model="yearPopup">
        <q-card class="popup-card">
          <q-card-section>
            <div class="row justify-center">
              <q-btn flat icon="chevron_left" @click="decreaseYearPage" />
              <div class="text-h6 q-mx-md">
                {{ yearRangeStart + 543 }} - {{ yearRangeStart + 19 + 543 }}
              </div>
              <q-btn flat icon="chevron_right" @click="increaseYearPage" />
            </div>
            <div class="year-grid q-mt-md">
              <q-btn
                v-for="year in thaiYears"
                :key="year"
                flat
                :label="year.toString()"
                @click="setYear(year)"
                :class="[
                  'year-btn',
                  new Date(selectedDate).getFullYear() + 543 === year ? 'active' : '',
                ]"
              />
            </div>
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>

    <!-- Mobile layout -->
    <div v-else class="row items-center justify-center q-gutter-sm">
      <!-- MONTH SELECTOR -->
      <div class="row items-center no-wrap q-gutter-xs">
        <q-btn dense icon="chevron_left" flat class="btn-sm" @click="goPrevMonth" />
        <div class="month-label-sm" @click="monthPopup = true">
          {{ thaiMonths[new Date(selectedDate).getMonth()] }}
        </div>
        <q-btn dense icon="chevron_right" flat class="btn-sm" @click="goNextMonth" />
      </div>

      <!-- YEAR SELECTOR -->
      <div class="row items-center no-wrap q-gutter-xs">
        <q-btn dense icon="chevron_left" flat class="btn-sm" @click="goPrevYear" />
        <div class="year-label-sm" @click="yearPopup = true">
          {{ new Date(selectedDate).getFullYear() + 543 }}
        </div>
        <q-btn dense icon="chevron_right" flat class="btn-sm" @click="goNextYear" />
      </div>
    </div>

    <!-- POPUP MONTH -->
    <q-dialog v-model="monthPopup">
      <q-card class="popup-card">
        <q-card-section>
          <div class="month-grid">
            <q-btn
              v-for="(month, i) in thaiMonths"
              :key="i"
              flat
              :label="month"
              @click="setMonth(i)"
              :class="['month-btn', new Date(selectedDate).getMonth() === i ? 'active' : '']"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- POPUP YEAR -->
    <q-dialog v-model="yearPopup">
      <q-card class="popup-card">
        <q-card-section>
          <div class="row justify-center">
            <q-btn flat icon="chevron_left" @click="decreaseYearPage" />
            <div class="text-h6 q-mx-md">
              {{ yearRangeStart + 543 }} - {{ yearRangeStart + 19 + 543 }}
            </div>
            <q-btn flat icon="chevron_right" @click="increaseYearPage" />
          </div>
          <div class="year-grid q-mt-md">
            <q-btn
              v-for="year in thaiYears"
              :key="year"
              flat
              :label="year.toString()"
              @click="setYear(year)"
              :class="[
                'year-btn',
                new Date(selectedDate).getFullYear() + 543 === year ? 'active' : '',
              ]"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped>
.popup-card {
  border-radius: 10px;
  padding: 20px;
  min-width: 500px;
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(100px, 1fr));
  gap: 12px;
  justify-content: center;
  padding: 20px 10px 10px;
}

.year-grid {
  display: grid;
  grid-template-columns: repeat(5, auto);
  gap: 10px;
  justify-content: center;
  padding-top: 10px;
}

.month-btn,
.year-btn {
  border-radius: 999px;
  font-weight: 500;
  font-size: 14px;
  padding: 6px 20px;
  background-color: white;
  border: 1px solid #d1d5db;
  color: black;
  transition: all 0.2s ease;
}

.month-btn:hover,
.year-btn:hover {
  background-color: #f0f0f0;
}

.month-btn.active,
.year-btn.active {
  background-color: #1976d2;
  color: white;
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.btn-sm {
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.month-label-sm,
.year-label-sm {
  font-size: 14px;
  padding: 4px 8px;
  min-width: 70px;
  text-align: center;
  border-radius: 6px;
  cursor: pointer;
}

@media (max-width: 300px) {
  .popup-card {
    min-width: 90vw !important;
    max-width: 360px !important;
    padding: 16px !important;
  }

  .month-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 8px !important;
  }

  .year-grid {
    grid-template-columns: repeat(4, 1fr) !important;
    gap: 8px !important;
  }

  .month-btn,
  .year-btn {
    font-size: 13px !important;
    padding: 4px 10px !important;
  }

  .text-h6 {
    font-size: 16px !important;
  }
}

@media (max-width: 800px) {
  .popup-card {
    min-width: 90vw !important;
    max-width: 360px !important;
    padding: 16px !important;
  }

  .month-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 8px !important;
  }

  .year-grid {
    grid-template-columns: repeat(4, 1fr) !important;
    gap: 8px !important;
  }

  .month-btn,
  .year-btn {
    font-size: 13px !important;
    padding: 4px 10px !important;
  }

  .text-h6 {
    font-size: 16px !important;
  }
}
</style>