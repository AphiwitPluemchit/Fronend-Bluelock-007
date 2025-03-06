<template>
  <div>
    <!-- Food Menu Input -->
    <div class="input-group">
      <p class="label label_minWidth">รายการอาหาร :</p>
      <q-input outlined v-model="foodMenu" class="food-input" readonly>
        <template v-slot:prepend>
          <q-icon
            name="restaurant_menu"
            style="color: black"
            class="cursor-pointer"
            @click="showFoodDialog = true"
          />
        </template>
      </q-input>
    </div>

    <!-- Food Selection Dialog -->
    <q-dialog v-model="showFoodDialog" persistent>
      <div class="q-pa-md food-dialog">
        <h3 class="label" style="justify-content: flex-start; margin-left: 20px;">เลือกเมนูอาหาร</h3>

        <!-- Wrapper ครอบปุ่มทั้งหมดและจัดให้อยู่ตรงกลาง -->
        <div class="food-container" style="margin-left: 20px;">
          <div class="food-list" >
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
            />
            <!-- ปุ่มเพิ่มเมนู -->
            <q-btn
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
          <q-btn class="btnsecces" label="บันทึกและยืนยัน" @click="confirmSelection(true)" />
          <q-btn class="btnreject" label="ยกเลิก" @click="cancelSelection" />
          <q-btn class="btnconfirm" label="ยืนยัน" @click="confirmSelection(false)" />
        </div>
      </div>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits, onMounted, nextTick } from 'vue';

const emit = defineEmits<{ (event: 'update:foodMenu', value: string): void }>();

const showFoodDialog = ref(false);
const selectedFoods = ref<string[]>([]);
const foodMenu = ref('');
const addingNewFood = ref(false);
const newFoodName = ref('');
const inputField = ref<HTMLInputElement | null>(null);
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
]);

const toggleSelection = (item: string) => {
  if (selectedFoods.value.includes(item)) {
    selectedFoods.value = selectedFoods.value.filter((food) => food !== item);
  } else {
    selectedFoods.value.push(item);
  }
};

const confirmSelection = (saveToLocal: boolean = false) => {
  foodMenu.value = selectedFoods.value.join(', ');
  emit('update:foodMenu', foodMenu.value);

  if (saveToLocal) {
    localStorage.setItem('menuItems', JSON.stringify(menuItems.value));
  }

  showFoodDialog.value = false;
};

const cancelSelection = () => {
  selectedFoods.value = [];
  showFoodDialog.value = false;
};

const startEditing = () => {
  addingNewFood.value = true;
  void nextTick(() => {
    inputField.value?.focus();
  });
};

const addFood = () => {
  if (newFoodName.value.trim() !== '') {
    menuItems.value.push(newFoodName.value.trim());
    localStorage.setItem('menuItems', JSON.stringify(menuItems.value));
  }
  newFoodName.value = '';
  addingNewFood.value = false;
};

onMounted(() => {
  const storedMenuItems = localStorage.getItem('menuItems');
  if (storedMenuItems) {
    menuItems.value = JSON.parse(storedMenuItems);
  }
});
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
  width: 595px;
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

::v-deep(.q-icon) {
  font-size: 18px;
}
</style>