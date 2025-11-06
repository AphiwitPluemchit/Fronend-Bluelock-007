<script setup lang="ts">
import { defineProps, defineEmits, computed, ref, onMounted } from 'vue'
import { copyToClipboard, useQuasar } from 'quasar'

const props = defineProps<{
  modelValue: boolean
  programId?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
}>()

const showDialog = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
})

const $q = useQuasar()
const programLink = ref('')

const closeDialog = () => emit('update:modelValue', false)

const copyProgramLink = async () => {
  try {
    await copyToClipboard(programLink.value)
    $q.notify({ type: 'positive', message: 'คัดลอกลิงก์เรียบร้อยแล้ว' })
  } catch {
    $q.notify({ type: 'negative', message: 'ไม่สามารถคัดลอกลิงก์ได้' })
  }
}

onMounted(() => {
  const base = import.meta.env.VITE_APP_URL || window.location.origin
  programLink.value = `${base}/Student/Program/ProgramDetail/${props.programId ?? ''}`
})
</script>

<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card class="dialog-box">
      <q-card-section>
        <div class="textsubtitle">แชร์โครงการ</div>
      </q-card-section>

      <q-card-section>
        <div class="row items-center justify-between q-gutter-sm">
          <div class="col-10">
            <span class="textcontent3" style="word-break: break-all">{{ programLink }}</span>
          </div>
          <div class="col-1">
            <q-btn
              round
              flat
              dense
              size="sm"
              color="primary"
              icon="content_copy"
              @click="copyProgramLink"
            >
              <q-tooltip anchor="top middle" self="bottom middle">คัดลอกลิงก์</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-mt-md">
        <q-btn class="btnreject" label="ยกเลิก" @click="closeDialog" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.dialog-box {
  width: 500px;
  padding: 20px;
  border-radius: 12px;
}
</style>
