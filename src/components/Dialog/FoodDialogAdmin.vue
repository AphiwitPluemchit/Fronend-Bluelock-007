<template>
  <q-dialog v-model="showDialog" persistent>
    <div class="q-pa-md food-dialog">
      <h3 class="label">เลือกเมนูอาหาร</h3>

      <div class="q-gutter-md row justify-center food-container">
        <q-btn
          v-for="(item, index) in menuItems"
          :key="index"
          rounded
          outlined
          unelevated
          flat
          class="FoodChip"
          :class="{ 'active-btn': selectedItems.includes(item) }"
          color="white"
          text-color="black"
          :label="item"
          @click="toggleSelection(item)"
        />
      </div>

      <div class="q-mt-lg row justify-center">
        <q-btn color="green" class="q-mx-sm" label="บันทึกและยืนยัน" @click="confirmSelection" />
        <q-btn color="red" class="q-mx-sm" label="ยกเลิก" @click="cancelSelection" />
      </div>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  selectedFoods: Array as () => string[],
})

const emit = defineEmits(['update:modelValue', 'update:selectedFoods'])

const showDialog = ref(props.modelValue)
const selectedItems = ref<string[]>(props.selectedFoods || [])

const menuItems = ref([
  'ผัดกะเพราหมู',
  'ผัดกะเพราไก่',
  'หมูกระเทียม',
  'ไก่กระเทียม',
  'ผัดพริกแกงหมู',
  'ผัดพริกแกงไก่',
  'ผัดพริกอ่อนหมู',
  'ผัดพริกอ่อนไก่',
  'ข้าวหมูทอด',
  'ข้าวไก่ทอด',
])

watch(
  () => props.modelValue,
  (newVal) => {
    showDialog.value = newVal
  }
)

const toggleSelection = (item: string) => {
  if (selectedItems.value.includes(item)) {
    selectedItems.value = selectedItems.value.filter((food) => food !== item)
  } else {
    selectedItems.value.push(item)
  }
}

const confirmSelection = () => {
  emit('update:selectedFoods', selectedItems.value)
  emit('update:modelValue', false)
}

const cancelSelection = () => {
  selectedItems.value = []
  emit('update:modelValue', false)
}
</script>

<style scoped>
.food-dialog {
  background-color: white;
  width: 600px;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
}

.food-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.FoodChip {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 150px;
  height: 40px;
  border-radius: 50px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
  background-color: white !important;
  text-align: center;
  font-size: 14px;
  font-weight: bold;
  border: 1px solid #ccc;
  cursor: pointer;
}
.active-btn {
  background-color: #d0e4ff !important;
}
</style>
