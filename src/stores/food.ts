// stores/food.ts
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import { FoodService } from 'src/services/food'
import type { Food } from 'src/types/food'

export const useFoodStore = defineStore('food', () => {
  const foods = ref<Food[]>([])
  const loading = ref(false)

  async function fetchFoods() {
    loading.value = true
    try {
      const data = await FoodService.getAll()
      foods.value = data
    } catch (error) {
      console.error(error) 
      Notify.create({
        type: 'negative',
        message: 'โหลดรายการอาหารไม่สำเร็จ',
      })
    } finally {
      loading.value = false
    }
  }

  async function createAll(newFoods: Food[]) {
    loading.value = true
    try {
      const data = await FoodService.createAll(newFoods)
      foods.value = data
    } catch (error) {
      console.error(error) 
      Notify.create({
        type: 'negative',
        message: 'สร้างรายการอาหารไม่สำเร็จ',
      })    
    } finally {
      loading.value = false
    }
  }
  
  return {
    foods,
    loading,
    fetchFoods,
    createAll,
  }
})
