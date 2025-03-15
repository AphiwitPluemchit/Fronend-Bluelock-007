<template>
  <div>
    <!-- Food Menu Input -->
    <div class="input-group">
      <p class="label label_minWidth">รายการอาหาร :</p>
      <q-input
        outlined
        v-model="foodMenuDisplay"
        class="food-input"
        readonly
        :disable="disable"
      >
        <template v-slot:prepend>
          <q-icon
            name="restaurant_menu"
            style="color: black"
            class="cursor-pointer"
            @click="openFoodDialog"
            :class="{ 'disabled-icon': disable }"
          />
        </template>
      </q-input>
    </div>

    <!-- Food Selection Dialog -->
    <q-dialog v-model="showFoodDialog" persistent>
      <div class="q-pa-md food-dialog">
        <h3 class="label" style="justify-content: flex-start; margin-left: 20px">
          เลือกเมนูอาหาร
        </h3>

        <div class="food-container" style="margin-left: 20px">
          <div class="food-list">
            <q-btn
              v-for="(item, index) in menuItems"
              :key="index"
              rounded
              outlined
              unelevated
              flat
              class="FoodChip"
              :class="{ 'active-btn': selectedFoods.includes(item) }"
              color="white"
              text-color="black"
              :label="item"
              @click="toggleSelection(item)"
              :disable="disable"
            />
            <!-- ปุ่มเพิ่มเมนู -->
            <q-btn
              v-if="!disable"
              ref="editableBtn"
              rounded
              outlined
              unelevated
              flat
              class="FoodChip add-food-btn"
              color="grey-4"
              text-color="black"
              @click="startEditing"
            >
              <span v-if="!addingNewFood">+</span>
              <input
                v-else
                v-model="newFoodName"
                type="text"
                class="editable-input"
                @blur="addFood"
                @keyup.enter="addFood"
                ref="inputField"
              />
            </q-btn>
          </div>
        </div>

        <div class="button-container">
          <q-btn class="btnreject" label="ยกเลิก" @click="cancelSelection" :disable="disable" />
          <q-btn
            class="btnsecces"
            label="บันทึกและยืนยัน"
            @click="confirmSelection(true)"
            :disable="disable"
          />
          <q-btn
            class="btnconfirm"
            label="ยืนยัน"
            @click="confirmSelection(false)"
            :disable="disable"
          />
        </div>
      </div>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits, defineProps, onMounted, nextTick } from 'vue'
import { FoodService } from 'src/services/food'
import type { Food } from 'src/types/food'

const props = defineProps<{ disable?: boolean }>()
const emit = defineEmits<{
  (event: 'update:foodMenu', value: Food[]): void
  (event: 'update:foodMenuDisplay', value: string): void
}>()

const showFoodDialog = ref(false)
const selectedFoods = ref<string[]>([])
const foodMenuDisplay = ref('') // ✅ สำหรับ q-input
const addingNewFood = ref(false)
const newFoodName = ref('')
const inputField = ref<HTMLInputElement | null>(null)
const menuItems = ref<string[]>([])
const menuItemsIdMap = ref<Record<string, string>>({})

const openFoodDialog = () => {
  if (!props.disable) {
    showFoodDialog.value = true
  }
}

const toggleSelection = (item: string) => {
  if (props.disable) return
  if (selectedFoods.value.includes(item)) {
    selectedFoods.value = selectedFoods.value.filter((food) => food !== item)
  } else {
    selectedFoods.value.push(item)
  }
}

const confirmSelection = async (saveToBackend: boolean = false) => {
  if (props.disable) return

  foodMenuDisplay.value = selectedFoods.value.join(', ')
  emit('update:foodMenuDisplay', foodMenuDisplay.value)

  const selectedFoodObjects: Food[] = selectedFoods.value.map((name) => {
    const id = menuItemsIdMap.value[name] || ''
    return { id, name }
  })
  console.log('✅ emit update:foodMenu:', selectedFoodObjects)
  emit('update:foodMenu', selectedFoodObjects)
  if (saveToBackend) {
    try {
      await FoodService.createAll(menuItems.value.map((name) => ({ id: '', name })))
      console.log('บันทึกเมนูไปยัง backend แล้ว')
    } catch (error) {
      console.error('บันทึกข้อมูลไม่สำเร็จ:', error)
    }
  }

  
  showFoodDialog.value = false
  localStorage.clear()
}

const cancelSelection = () => {
  if (props.disable) return
  selectedFoods.value = []
  showFoodDialog.value = false
}

const startEditing = () => {
  if (props.disable) return
  addingNewFood.value = true
  void nextTick(() => {
    inputField.value?.focus()
  })
}

const addFood = () => {
  if (props.disable) return
  const newName = newFoodName.value.trim()

  const isDuplicate = menuItems.value.some(
    existing => existing.toLowerCase() === newName.toLowerCase()
  )

  if (newName !== '' && !isDuplicate) {
    menuItems.value.push(newName)
    localStorage.setItem('menuItems', JSON.stringify(menuItems.value))
  }

  newFoodName.value = ''
  addingNewFood.value = false
}

onMounted(async () => {
  try {
    const foods: Food[] = await FoodService.getAll()
    menuItems.value = foods.map((food) => food.name)
    menuItemsIdMap.value = Object.fromEntries(foods.map((f) => [f.name, f.id]))

    const storedMenuItems = localStorage.getItem('menuItems')
    if (storedMenuItems) {
      const localItems = JSON.parse(storedMenuItems)
      menuItems.value = Array.from(new Set([...menuItems.value, ...localItems]))
    }
  } catch (error) {
    console.error('โหลดรายการอาหารล้มเหลว', error)
  }
})
</script>

<style scoped>
.button-container {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding-top: 30px;
  border-top: 1px solid #ddd;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 25px;
}

.food-input {
  width: 600px;
  flex-grow: 1;
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

.q-field__control {
  height: 40px !important;
  align-items: center;
}
.q-field__prepend {
  display: flex;
  align-items: center;
}

.food-dialog {
  background-color: white;
  width: 600px;
  height: 600px;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.food-container {
  flex-grow: 1;
  overflow-y: auto;
  max-height: 400px;
  padding-bottom: 10px;
}

.FoodChip {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 150px;
  height: 40px;
  border-radius: 50px;
  background-color: white !important;
  text-align: center;
  font-size: 14px;
  border: 1px solid #ccc;
  cursor: pointer;
}
.active-btn {
  background-color: #d0e4ff !important;
}

.add-food-btn {
  min-width: 50px;
  text-align: center;
  position: relative;
}

.editable-input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  text-align: center;
  font-size: 14px;
  padding: 0;
}

.food-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 10px;
  padding-bottom: 10px;
}

.disabled-icon {
  pointer-events: none;
  opacity: 0.5;
}

::v-deep(.q-field__control) {
  height: 40px !important;
  align-items: center;
  padding: 5px 10px;
}

::v-deep(.q-field__prepend) {
  min-height: 40px !important;
  padding: 5px 10px;
  display: flex;
  align-items: center;
}
</style>
