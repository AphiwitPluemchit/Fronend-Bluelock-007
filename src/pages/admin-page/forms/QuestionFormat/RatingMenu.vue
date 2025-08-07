<template>
  <q-card>
    <!-- 🔸 Row: scale selector + icon type -->
    <div class="row items-center q-gutter-md q-mb-md">
      <q-select
        v-model="localData.max"
        :options="[3, 4, 5, 6, 7, 8, 9, 10]"
        dense
        outlined
        style="width: 140px"
        @update:model-value="update"
      />
      <q-select
        v-model="localData.icon"
        :options="iconOptions"
        dense
        outlined
        emit-value
        map-options
        style="width: 90px"
        @update:model-value="update"
        class="q-select-align"
      >
        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section avatar>
              <q-icon
                :name="scope.opt.value"
                :color="scope.opt.color"
                size="20px"
                class="q-mr-sm"
              />
            </q-item-section>
            <q-item-section>{{ scope.opt.label }}</q-item-section>
          </q-item>
        </template>
        <template v-slot:selected-item="scope">
          <div class="row items-center no-wrap">
            <q-icon :name="scope.opt.value" :color="scope.opt.color" size="20px" class="q-mr-sm" />
            <span>{{ scope.opt.label }}</span>
          </div>
        </template>
      </q-select>
    </div>

    <!-- 🔸 Rating preview -->
    <div class="q-mt-md row justify-around">
      <div v-for="n in localData.max" :key="n" class="column items-center">
        <q-icon :name="localData.icon" size="24px" />
        <div class="text-caption q-mt-xs">{{ n }}</div>
      </div>
    </div>

    <q-separator spaced />

    <!-- Footer -->
    <div class="row justify-between items-center">
      <q-btn flat icon="assignment" size="sm" label="Answer key" />
      <div class="row items-center q-gutter-sm">
        <q-toggle
          v-model="localData.isRequired"
          label="Required"
          left-label
          dense
          @update:model-value="update"
        />
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

const emit = defineEmits(['update:modelValue'])

const localData = reactive({
  ...props.modelValue,
  max: props.modelValue.max || 5,
  icon: props.modelValue.icon || 'star',
})

const iconOptions = [
  { label: '', value: 'thumb_up', color: 'primary' },
  { label: '', value: 'star', color: 'amber' },
  { label: '', value: 'favorite', color: 'red' },
]

function update() {
  emit('update:modelValue', { ...localData })
}

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
