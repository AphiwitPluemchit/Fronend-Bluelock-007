<template>
  <q-card>

    <!-- 🔸 Rating preview -->
    <div class="q-mt-lg row justify-around">
      <div v-for="n in localData.max" :key="n" class="column items-center">
        <q-icon :name="localData.icon" size="24px" />
        <div class="text-caption q-mt-xs">{{ n }}</div>
      </div>
    </div>

   
  </q-card>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { Block } from 'src/types/form'

const props = defineProps<{
  modelValue: Block
}>()

const localData = reactive({
  ...props.modelValue,
  max: props.modelValue.max || 5,
  icon: props.modelValue.icon || 'star',
})

watch(
  () => props.modelValue,
  (val) => {
    Object.assign(localData, val)
  },
  { deep: true }
)
</script>


<style scoped>
.q-select-align .q-field__control {
  min-height: 40px; /* หรือเท่ากับ max rating */
  padding-top: 0;
  padding-bottom: 0;
}
</style>
