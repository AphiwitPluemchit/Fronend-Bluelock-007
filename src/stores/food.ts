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

  async function createFood(payload: Food) {
    loading.value = true
    try {
      const created = await FoodService.createFood(payload)
      if (created) {
        foods.value.push(created)
      }
    } catch (error) {
      console.error(error)
      Notify.create({
        type: 'negative',
        message: 'บันทึกรายการอาหารไม่สำเร็จ',
      })
    } finally {
      loading.value = false
    }
  }

  async function deleteOne(id: string) {
    loading.value = true
    try {
      await FoodService.deleteOne(id)
      foods.value = foods.value.filter(f => f.id !== id)
    } catch (error) {
      console.error(error)
      Notify.create({
        type: 'negative',
        message: 'ลบรายการอาหารไม่สำเร็จ',
      })
    } finally {
      loading.value = false
    }
  }

  async function updateOne(id: string, payload: Food) {
    loading.value = true
    try {
      const updated = await FoodService.updateOne(id, payload)
      const index = foods.value.findIndex(f => f.id === id)
      if (index !== -1 && updated) {
        foods.value[index] = updated
      }
    } catch (error) {
      console.error(error)
      Notify.create({
        type: 'negative',
        message: 'แก้ไขรายการอาหารไม่สำเร็จ',
      })
    } finally {
      loading.value = false
    }
  }

  return {
    foods,
    loading,
    fetchFoods,
    createFood,
    deleteOne,
    updateOne
  }
})
