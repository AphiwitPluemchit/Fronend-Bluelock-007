<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    persistent
  >
    <q-card class="q-pa-md" rounded>
      <!-- Header with icon centered -->
      <q-card-section class="text-center q-pb-none q-mb-md">
        <q-icon name="info" color="primary" size="56px" />
      </q-card-section>
      
      <q-card-section class="text-center q-pt-sm">
        <div class="text-h5">ยืนยันการลงทะเบียน</div>
      </q-card-section>

      <!-- Program selection section - show only if multiple programs -->
      <q-card-section v-if="programItems.length > 1">
        <div class="text-subtitle1 q-mb-sm">เลือกโครงการ</div>
        <q-option-group
          v-model="selectedItemId"
          :options="programOptions"
          type="radio"
          color="primary"
        />
      </q-card-section>

      <!-- Single program info - show only if one program -->
      <q-card-section v-else-if="programItems.length === 1">
        <div class="text-body1">ลงทะเบียนเข้าร่วมโครงการ <strong>{{ programItems[0]?.name }}</strong></div>
      </q-card-section>

      <!-- Food selection section - show only if food available -->
      <q-card-section v-if="food.length > 0">
        <div class="text-subtitle1 q-mb-sm">เลือกอาหาร</div>
        <q-option-group
          v-model="selectedFood"
          :options="foodOptions"
          type="radio"
          color="primary"
        />
      </q-card-section>

      <!-- Confirmation message if no selections needed -->
      <q-card-section v-if="programItems.length === 1 && food.length === 0">
        <div class="text-body2 text-grey-7">คุณต้องการลงทะเบียนใช่หรือไม่ โปรดยืนยัน</div>
      </q-card-section>

      <!-- Action buttons -->
      <q-card-actions align="right">
        <q-btn class="btnreject" label="ยกเลิก" color="red" @click="cancel" />
        <q-btn
          class="btnsecces"
          label="ยืนยัน"
          :disable="
            (programItems.length > 1 && !selectedItemId) || 
            (food.length > 0 && !selectedFood)
          "
          @click="confirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watch, computed } from 'vue'
import type { ProgramItem } from 'src/types/program'
import type { FoodVote } from 'src/types/food'

const props = defineProps<{
  modelValue: boolean
  programItems: ProgramItem[]
  food: FoodVote[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', selectedItemId: string, selectedFood: string | null): void
}>()

const selectedItemId = ref<string | null>(null)
const selectedFood = ref<string | null>(null)

const programOptions = computed(() =>
  props.programItems.map((item) => ({
    label: `${item.name ?? 'ไม่มีชื่อ'} (${item.hour ?? 0} ชม.)`,
    value: item.id,
  })),
)

const foodOptions = computed(() =>
  props.food.map((item) => ({
    label: item.foodName ?? 'ไม่มีชื่อ',
    value: item.foodName,
  })),
)

watch(
  () => props.programItems,
  (items) => {
    // auto select if only one item
    if (items.length === 1) {
      selectedItemId.value = items[0]?.id ?? null
    } else {
      selectedItemId.value = null
    }
  },
  { immediate: true },
)

const cancel = () => {
  emit('update:modelValue', false)
}

const confirm = () => {
  if (!selectedItemId.value) return
  emit('update:modelValue', false)
  emit('confirm', selectedItemId.value, selectedFood.value)
}
</script>

<style scoped>
.q-card {
  border-radius: 15px;
  width: 350px;
}
</style>