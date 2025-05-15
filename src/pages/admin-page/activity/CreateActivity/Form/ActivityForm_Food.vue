<script setup lang="ts">
import { ref, defineEmits, defineProps, onMounted, nextTick, watch } from 'vue'
import { FoodService } from 'src/services/food'
import type { Food } from 'src/types/food'

const showFoodDialog = ref(false)
const selectedFoods = ref<Food[]>([])
const foodMenuDisplay = ref('')
const addingNewFood = ref(false)
const newFoodName = ref('')
const inputField = ref<HTMLInputElement | null>(null)
const menuItems = ref<string[]>([]) // รายชื่ออาหารทั้งหมด
const menuItemsIdMap = ref<Record<string, string>>({}) // map: name → id
const props = defineProps<{
  disable?: boolean
  foodMenu?: Food[]
}>()
const emit = defineEmits<{
  (event: 'update:foodMenu', value: Food[]): void
  (event: 'update:foodMenuDisplay', value: string): void
}>()

watch(
  () => props.foodMenu,
  (newVal) => {
    if (newVal) {
      selectedFoods.value = [...newVal]
      foodMenuDisplay.value = newVal.map((f) => f.name).join(', ')
    }
  },
  { immediate: true },
)
const openFoodDialog = () => {
  if (!props.disable) {
    showFoodDialog.value = true
  }
}
const toggleSelection = (name: string) => {
  if (props.disable) return

  const id = menuItemsIdMap.value[name] || ''
  const index = selectedFoods.value.findIndex((f) => f.name === name)

  if (index >= 0) {
    selectedFoods.value.splice(index, 1)
  } else {
    selectedFoods.value.push({ id, name })
  }
}
const confirmSelection = async (saveToBackend: boolean = false) => {
  if (props.disable) return

  foodMenuDisplay.value = selectedFoods.value.map((f) => f.name).join(', ')
  emit('update:foodMenu', selectedFoods.value)
  emit('update:foodMenuDisplay', foodMenuDisplay.value)

  if (saveToBackend) {
    try {
      await FoodService.createAll(menuItems.value.map((name) => ({ id: '', name })))
    } catch (error) {
      console.error('❌ บันทึกข้อมูลไม่สำเร็จ:', error)
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
    (existing) => existing.toLowerCase() === newName.toLowerCase(),
  )

  if (newName !== '' && !isDuplicate) {
    menuItems.value.push(newName)
    localStorage.setItem('menuItems', JSON.stringify(menuItems.value))
  }

  newFoodName.value = ''
  addingNewFood.value = false
}
const removeMenuItem = (name: string) => {
  if (props.disable) return
  menuItems.value = menuItems.value.filter((item) => item !== name)

  // หากลบเมนูที่ถูกเลือกอยู่ด้วย ให้ลบจาก selectedFoods ด้วย
  selectedFoods.value = selectedFoods.value.filter((f) => f.name !== name)

  // อัปเดตใน localStorage ด้วย
  localStorage.setItem('menuItems', JSON.stringify(menuItems.value))
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
    console.error('❌ โหลดรายการอาหารล้มเหลว', error)
  }
})
</script>

<template>
  <!-- Food Menu Input -->
  <div class="input-group">
    <p class="label label_minWidth">รายการอาหาร :</p>
    <div class="input-container">
      <q-input outlined v-model="foodMenuDisplay" :disable="disable" readonly>
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
  </div>

  <!-- Food Selection Dialog -->
  <q-dialog v-model="showFoodDialog" persistent>
    <div class="q-pa-md food-dialog">
      <h3 class="label" style="justify-content: flex-start; margin-left: 20px">เมนูอาหาร</h3>

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
            :class="{ 'active-btn': selectedFoods.some((f) => f.name === item) }"
            color="white"
            text-color="black"
            :label="item"
            @click="toggleSelection(item)"
            :disable="disable"
          >
            <template v-slot:default>
              <q-icon
                name="close"
                class="delete-icon"
                @click.stop="removeMenuItem(item)"
                v-if="!disable"
              />
            </template>
          </q-btn>

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
          class="btnconfirm"
          label="ยืนยัน"
          @click="confirmSelection(true)"
          :disable="disable"
        />
      </div>
    </div>
  </q-dialog>
</template>

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
  margin-bottom: 20px;
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
  position: relative;
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
  margin-top: 10px;
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
.delete-icon {
  position: absolute;
  top: -2px;
  right: -3px;
  background: red;
  border-radius: 50%;
  font-size: 10px;
  padding: 2px;
  color: white;
  cursor: pointer;
}

::v-deep(.q-field__control) {
  height: 40px !important;
  align-items: center;
  padding: 5px 10px;
}

.food-input.q-field--readonly .q-field__control:focus-within {
  outline: none !important;
  box-shadow: none !important;
}

.food-input input[readonly] {
  pointer-events: none;
  user-select: none;
  outline: none !important;
  box-shadow: none !important;
}

.food-input .q-field__control {
  box-shadow: none !important;
  outline: none !important;
}

.food-input.q-field--readonly .q-field__native {
  outline: none !important;
  box-shadow: none !important;
  pointer-events: none;
}
.input-container {
  width: 600px;
  max-width: 100%;
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
    max-width: 100%;
  }
  .food-dialog {
    width: 420px;
    height: 470px;
  }
}
@media (max-width: 440px) {
  .food-dialog {
    width: 330px;
    height: 470px;
  }
  .FoodChip {
    width: 120px;
    height: 45px;
    font-size: 13px;
  }
}
</style>
