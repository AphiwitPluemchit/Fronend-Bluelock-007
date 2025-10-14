<script setup lang="ts">
import { ref, defineEmits, defineProps, onMounted, watch } from 'vue'
import { FoodService } from 'src/services/food'
import type { Food } from 'src/types/food'

const showFoodDialog = ref(false)
const selectedFoods = ref<Food[]>([])
const foodMenuDisplay = ref('')
const newFoodName = ref('')
const menuItems = ref<string[]>([])
const menuItemsIdMap = ref<Record<string, string>>({})
const isEditMode = ref(false)
const isLoading = ref(false)

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
    if (props.foodMenu) selectedFoods.value = [...props.foodMenu]
    showFoodDialog.value = true
    isEditMode.value = false
  }
}

const toggleSelection = (name: string) => {
  if (props.disable) return
  const id = menuItemsIdMap.value[name] || ''
  const index = selectedFoods.value.findIndex((f) => f.name === name)
  if (index >= 0) selectedFoods.value.splice(index, 1)
  else selectedFoods.value.push({ id, name })
}

const confirmSelection = () => {
  if (props.disable) return

  if (!isEditMode.value) {
    // โหมดเลือกอาหาร (view mode)
    foodMenuDisplay.value = selectedFoods.value.map((f) => f.name).join(', ')
    emit('update:foodMenu', selectedFoods.value)
    emit('update:foodMenuDisplay', foodMenuDisplay.value)
    showFoodDialog.value = false
  } else {
    // โหมดแก้ไข => กลับไปโหมดเลือก
    isEditMode.value = false
  }
}

const cancelSelection = () => {
  if (props.disable) return
  selectedFoods.value = props.foodMenu ? [...props.foodMenu] : []
  if (isEditMode.value) {
    // กลับไปโหมดเลือก แต่ไม่ปิด dialog
    isEditMode.value = false
  } else {
    // โหมดปกติ -> ปิด dialog
    showFoodDialog.value = false
  }
}

const addFood = async () => {
  if (props.disable) return
  const newName = newFoodName.value.trim()
  if (!newName) return

  const isDuplicate = menuItems.value.some((e) => e.toLowerCase() === newName.toLowerCase())
  const isSelected = selectedFoods.value.some((e) => e.name.toLowerCase() === newName.toLowerCase())

  if (isDuplicate || isSelected) {
    newFoodName.value = ''
    return
  }

  try {
    const created = await FoodService.createFood({ name: newName })
    if (created?.id && created.name) {
      // เพิ่มเฉพาะถ้าไม่มีอยู่ใน menuItems
      if (!menuItems.value.includes(created.name)) {
        menuItems.value.push(created.name)
      }
      menuItemsIdMap.value[created.name] = created.id
    }
  } catch (error) {
    console.error('เพิ่มอาหารไม่สำเร็จ:', error)
  }

  newFoodName.value = ''
}

const removeMenuItem = async (name: string) => {
  if (props.disable) return

  const id = menuItemsIdMap.value[name]
  if (!id) {
    console.warn('ไม่พบ ID ของเมนูนี้:', name)
    return
  }

  try {
    await FoodService.deleteOne(id)

    // ลบจาก local state
    menuItems.value = menuItems.value.filter((item) => item !== name)
    delete menuItemsIdMap.value[name]
    selectedFoods.value = selectedFoods.value.filter((f) => f.name !== name)

    localStorage.setItem('menuItems', JSON.stringify(menuItems.value))
  } catch (error) {
    console.error('❌ ลบอาหารไม่สำเร็จ:', error)
  }
}

onMounted(async () => {
  try {
    const foods: Food[] = await FoodService.getAll()
    menuItems.value = foods.map((food) => food.name)

    menuItemsIdMap.value = Object.fromEntries(foods.filter((f) => f.id).map((f) => [f.name, f.id!]))

    const storedMenuItems = localStorage.getItem('menuItems')
    if (storedMenuItems) {
      const localItems = JSON.parse(storedMenuItems)
      menuItems.value = Array.from(new Set([...menuItems.value, ...localItems]))
    }
  } catch (error) {
    console.error('❌ โหลดรายการอาหารล้มเหลว', error)
  }
})

const enableEditMode = () => {
  isEditMode.value = true
}
</script>

<template>
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

  <q-dialog v-model="showFoodDialog" persistent>
    <div class="q-pa-md food-dialog">
      <!-- Header -->
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6">
          {{ isEditMode ? 'แก้ไขเมนูอาหาร' : 'เลือกเมนูอาหาร' }}
        </div>

        <div class="row q-gutter-sm">
          <q-btn
            v-if="!isEditMode"
            label="แก้ไข"
            class="btnedit"
            unelevated
            rounded
            @click="enableEditMode"
          />
        </div>
      </div>

      <!-- Food list -->
      <div class="food-container">
        <div class="food-list">
          <q-spinner v-if="isLoading" color="primary" size="md" class="q-mt-sm" />
          <div v-if="!isLoading && menuItems.length === 0" class="text-grey text-center q-mt-md">
            ยังไม่มีรายการอาหารในระบบ
          </div>

          <q-btn
            v-for="(item, index) in menuItems"
            :key="index"
            rounded
            outlined
            flat
            class="FoodChip"
            :class="{ 'active-btn': selectedFoods.some((f) => f.name === item) }"
            color="white"
            text-color="black"
            @click="
              () => {
                if (!isEditMode) toggleSelection(item)
              }
            "
            :disable="disable"
          >
            <template v-slot:default>
              <q-icon
                name="close"
                class="delete-icon"
                @click.stop="removeMenuItem(item)"
                v-if="isEditMode && !disable"
              />
              {{ item }}
            </template>
          </q-btn>

          <!-- Add new food -->
          <div class="add-food-row">
            <q-input
              v-if="isEditMode && !disable"
              v-model="newFoodName"
              dense
              outlined
              placeholder="เพิ่มเมนูใหม่"
              class="input-add-food"
              @keyup.enter="addFood"
            />
            <q-btn
              v-if="isEditMode && !disable"
              label="เพิ่ม"
              color="primary"
              @click="addFood"
              class="btn-add-food"
              :disable="!newFoodName.trim()"
            />
          </div>
        </div>
      </div>

      <!-- Confirm buttons -->
      <div class="button-container">
        <q-btn class="btnreject" label="ยกเลิก" @click="cancelSelection" :disable="disable" />
        <q-btn
          class="btnconfirm"
          :label="isEditMode ? 'บันทึก' : 'ยืนยัน'"
          @click="confirmSelection"
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
  top: -8px;
  right: -3px;
  background: red;
  border-radius: 50%;
  font-size: 15px;
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
  width: 660px;
  max-width: 100%;
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

.add-food-row {
  display: flex;
  gap: 8px; /* ช่องว่างระหว่าง input กับปุ่ม */
  align-items: center; /* ให้ชิดตรงกลางแนวตั้ง */
}

.input-add-food {
  flex-grow: 1;
  height: 40px; /* กำหนดความสูงเท่ากับปุ่ม */
}

.btn-add-food {
  height: 40px; /* กำหนดความสูงเท่ากับ input */
  min-width: 80px;
}
</style>
