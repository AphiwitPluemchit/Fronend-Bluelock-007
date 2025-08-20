<script setup lang="ts">
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import { QInput } from 'quasar'
import { useFormStore } from 'src/stores/forms'
import type { Form } from 'src/types/form'

const props = defineProps<{
  modelValue: string[]
  disable?: boolean
  forms?: Form[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
  (e: 'update:formError', value: string): void
}>()

const formStore = useFormStore()

const inputRef = ref<InstanceType<typeof QInput> | null>(null)
const formError = ref('')
const showFormDialog = ref(false)

const searchText = ref('')

const allForms = computed<Form[]>(() => props.forms ?? formStore.forms ?? [])
type FormWithId = Form & { id: string }
const ensureWithId = (forms: Form[]): FormWithId[] =>
  forms.filter((f): f is FormWithId => typeof f.id === 'string' && f.id.length > 0)

const originOnly = (forms: Form[]): FormWithId[] =>
  ensureWithId(forms).filter((f) => f.isOrigin === true)
const filteredForms = ref<FormWithId[]>([])

const selectedFormIds = computed({
  get: () => props.modelValue,
  set: (val: string[]) => {
    emit('update:modelValue', val)
    emit('update:formError', '')
  },
})

const localSelectedId = ref<string | null>(null)

const displayText = computed({
  get: () => {
    const map = new Map(allForms.value.map((f) => [f.id, f.title]))
    return selectedFormIds.value.map((id) => map.get(id) ?? id).join(', ')
  },
  set: () => {},
})

const loadForms = async () => {
  if (props.forms) return
  await formStore.fetchForms() // ← ใช้เหมือนหน้า table
}
const coerceToOriginId = (id: string | null): string | null => {
  if (!id) return null
  const list = ensureWithId(allForms.value)

  const selected = list.find(f => f.id === id)
  if (!selected) return null

  if (selected.isOrigin === true) return selected.id 

  const originId = (selected as { originId?: string }).originId
  if (typeof originId === 'string' && originId) return originId

  const origin = list.find(
    f => f.isOrigin === true && (f.title ?? '').trim() === (selected.title ?? '').trim()
  )
  return origin?.id ?? null
}

const openDialog = async () => {
  if (props.disable) return

  await formStore.fetchForms()

  filteredForms.value = originOnly(allForms.value)

  const currentId = selectedFormIds.value[0] ?? null
  // ✅ แปลง id ปัจจุบันให้เป็น id ของฟอร์มต้นฉบับ เพื่อให้รายการใน dialog ถูกติ๊ก
  localSelectedId.value = coerceToOriginId(currentId)

  searchText.value = ''
  await nextTick()
  showFormDialog.value = true
}

const confirmSelection = () => {
  if (props.disable) return
  if (localSelectedId.value) {
    selectedFormIds.value = [localSelectedId.value]
    formError.value = ''
  }
  showFormDialog.value = false
}

const cancelSelection = () => {
  if (props.disable) return
  localSelectedId.value = selectedFormIds.value[0] ?? null
  showFormDialog.value = false
}

const pickOne = (id: string) => {
  if (props.disable) return
  localSelectedId.value = id
}

const filterForms = () => {
  const q = searchText.value.trim().toLowerCase()
  const list = originOnly(allForms.value)
  filteredForms.value = q ? list.filter((f) => (f.title ?? '').toLowerCase().includes(q)) : list
}

const validate = async () => {
  if (!selectedFormIds.value.length) {
    formError.value = 'กรุณาเลือกฟอร์มอย่างน้อย 1 ฟอร์ม'
    emit('update:formError', formError.value)
    await nextTick()
    inputRef.value?.$el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return false
  }
  formError.value = ''
  emit('update:formError', '')
  return true
}
defineExpose({ validate })

onMounted(async () => {
  await loadForms()
})

watch(
  allForms,
  (v) => {
    filteredForms.value = originOnly(v)
  },
  { immediate: true },
)
</script>

<template>
  <div class="input-group">
    <p class="label label_minWidth" :class="{ 'label-error-shift': formError !== '' }">
      ฟอร์มที่ต้องการใช้ :
    </p>

    <div class="input-container">
      <!-- ทำเป็น readonly และคลิกเพื่อเปิด Dialog -->
      <q-input
        outlined
        ref="inputRef"
        v-model="displayText"
        :disable="props.disable"
        class="full-width fix-q-input-height"
        :error="formError !== ''"
        readonly
        @click="openDialog"
      >
        <template #append>
          <q-icon name="arrow_drop_down" class="cursor-pointer" @click.stop="openDialog" />
        </template>
      </q-input>

      <div v-if="formError" class="text-negative text-subtitle2 q-mt-xs">
        {{ formError }}
      </div>
    </div>
  </div>

  <!-- Dialog เลือกฟอร์ม -->
  <q-dialog v-model="showFormDialog" persistent>
    <div class="q-pa-md form-dialog">
      <!-- Header -->
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6">เลือกฟอร์ม</div>
      </div>

      <!-- Search -->
      <q-input
        dense
        outlined
        v-model="searchText"
        placeholder="ค้นหาชื่อฟอร์ม..."
        class="q-mb-md"
        @update:model-value="filterForms"
      >
        <template #prepend><q-icon name="search" /></template>
      </q-input>

      <!-- List -->
      <div class="form-list">
        <q-spinner v-if="formStore.loading" color="primary" size="md" class="q-mt-sm" />
        <div v-else-if="filteredForms.length === 0" class="text-grey text-center q-mt-md">
          ไม่พบฟอร์ม
          <div class="q-mt-sm">
            <q-btn
              flat
              size="sm"
              label="ลองใหม่"
              @click="
                loadForms().then(() => {
                  filteredForms = ensureWithId(allForms)
                })
              "
            />
          </div>
        </div>

        <q-list v-else bordered class="rounded-borders">
          <q-item
            v-for="f in filteredForms"
            :key="f.id"
            clickable
            @click="pickOne(f.id)"
            :active="localSelectedId === f.id"
            active-class="bg-primary text-white"
          >
            <q-item-section>{{ f.title }}</q-item-section>
            <q-item-section side>
              <q-icon
                :name="localSelectedId === f.id ? 'radio_button_checked' : 'radio_button_unchecked'"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <!-- Buttons -->
      <div class="button-container">
        <q-btn
          class="btnreject"
          label="ยกเลิก"
          flat
          @click="cancelSelection"
          :disable="props.disable"
        />
        <q-btn
          class="btnconfirm"
          label="ยืนยัน"
          color="primary"
          unelevated
          @click="confirmSelection"
          :disable="props.disable || !localSelectedId"
        />
      </div>
    </div>
  </q-dialog>
</template>

<style scoped>
.button-container {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
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

.input-container {
  width: 660px;
  max-width: 100%;
}

.form-dialog {
  background: white;
  width: 600px;
  max-width: 90vw;
  border-radius: 10px;
}

.form-list {
  max-height: 360px;
  overflow-y: auto;
}
.input-group p {
  align-self: center;
  margin: 0;
  line-height: normal;
  text-align: right;
}
::v-deep(.q-field__control) {
  height: 40px !important;
  align-items: center;
  padding: 5px 10px;
}
/* responsive */
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
  }
  .input-container {
    width: 100%;
  }
  .form-dialog {
    width: 420px;
  }
}
@media (max-width: 440px) {
  .form-dialog {
    width: 330px;
  }
}
</style>
