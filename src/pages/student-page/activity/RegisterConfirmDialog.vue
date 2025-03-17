<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    persistent
  >
    <q-card class="q-pa-md" style="min-width: 300px" rounded standout>
      <div class="text-h5">ยืนยันการลงทะเบียน</div>
      <q-card-section>
        <div v-if="activityItems.length > 1">
          <div class="text-h6">เลือกกิจกรรม</div>
          <!-- <q-option-group
            v-model="selectedItemId"
            :options="itemOptions"
            type="radio"
            label="เลือกรอบกิจกรรม"
          /> -->

          <div class="q-gutter-sm row items-center">
            <q-chip
              v-for="item in activityItems"
              :key="item.id ?? 'default-key'"
              clickable
              :color="selectedItemId === item.id ? 'blue-grey-3' : 'grey-4'"
              text-color="black"
              @click="selectedItemId = item.id ?? null"
            >
              {{ item.name }} ({{ item.hour }} ชม.)
            </q-chip>
          </div>
        </div>
        <div v-else>
          <q-item-label>
            <div class="text-h6">ชื่อกิจกรรม</div>
            {{ activityItems[0]?.name }}</q-item-label
          >
        </div>
      </q-card-section>
      <q-card-section>
        <div v-if="food">
          <div class="text-h6">เลือกอาหาร</div>
          <!-- <q-option-group
            v-model="selectedFood"
            :options="foodOptions"
            type="radio"
            label="เลือกรอบกิจกรรม"
          /> -->
          <div class="q-gutter-sm row items-center">
            <q-chip
              v-for="item in food"
              :key="item.foodName"
              clickable
              :color="selectedFood === item.foodName ? 'blue-grey-3' : 'grey-4'"
              text-color="black"
              @click="selectedFood = item.foodName"
            >
              {{ item.foodName }}
            </q-chip>
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn class="btnreject" label="ยกเลิก" color="red" @click="cancel" />
        <q-btn
          class="btnconfirm"
          label="ยืนยัน"
          style="background-color: #3676f4; color: white"
          :disable="activityItems.length > 1 && !selectedItemId"
          @click="confirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from 'vue'
import type { ActivityItem } from 'src/types/activity'
import type { FoodVote } from 'src/types/food'

const props = defineProps<{
  modelValue: boolean
  activityItems: ActivityItem[]
  food: FoodVote[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', selectedItemId: string, selectedFood: string | null): void
}>()

const selectedItemId = ref<string | null>(null)
const selectedFood = ref<string | null>(null)
// const itemOptions = computed(() =>
//   props.activityItems.map((item) => ({
//     label: `${item.name ?? 'ไม่มีชื่อ'} | ${item.hour ?? 0} ชม.`,
//     value: item.id,
//   })),
// )
// const foodOptions = computed(() =>
//   props.food.map((item) => ({
//     label: `${item.foodName ?? 'ไม่มีชื่อ'}`,
//     value: item.foodName,
//   })),
// )

watch(
  () => props.activityItems,
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
