<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    persistent
  >
    <q-card class="q-pa-md" style="min-width: 300px" rounded standout>
      <q-card-section>
        <div class="text-h6">ยืนยันการลงทะเบียน</div>

        <div v-if="activityItems.length > 1" class="q-mt-md">
          <q-option-group
            v-model="selectedItemId"
            :options="itemOptions"
            type="radio"
            label="เลือกรอบกิจกรรม"
          />
        </div>
        <div v-else-if="activityItems.length === 1" class="q-mt-sm">
          <q-item-label>รอบกิจกรรม: {{ activityItems[0]?.name }}</q-item-label>
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
import { defineProps, defineEmits, computed, ref, watch } from 'vue'
import type { ActivityItem } from 'src/types/activity'

const props = defineProps<{
  modelValue: boolean
  activityItems: ActivityItem[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', selectedItemId: string): void
}>()

const selectedItemId = ref<string | null>(null)

const itemOptions = computed(() =>
  props.activityItems.map((item) => ({
    // label: `${item.name ?? 'ไม่มีชื่อ'} | ${item.room ?? ''} | ${item.hour ?? 0} ชม.`,
    value: item.id,
  })),
)

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
  emit('confirm', selectedItemId.value)
}
</script>

<style scoped>
.q-card {
  border-radius: 15px;
  width: 350px;
}
</style>
