<template>
  <q-dialog v-model="dialog" persistent>
    <q-card style="width: 90vw; max-width: 400px; border-radius: 10px" class="q-pa-sm">
      <q-card-section class="row items-center q-gutter-sm q-mt-sm ">
        <q-icon name="warning" color="red-7" size="md" />
        <div class="text-h6">ยืนยันการลบนิสิตออกจากโครงการ</div>
      </q-card-section>

      <q-card-section>
        <div class="text-body2">
          <div><b>รหัสนิสิต:</b> {{ student?.code ?? '-' }}</div>
          <div class="q-mt-sm"><b>ชื่อ-สกุล:</b> {{ student?.name ?? '-' }}</div>
        </div>
        <div class="q-mt-md">ต้องการลบการนิสิตออกจากโครงการ ใช่หรือไม่?</div>
        <q-banner
          v-if="errorMessage"
          class="q-mt-md"
          rounded
          dense
          inline-actions
          :class="errorBannerClass"
        >
          {{ errorMessage }}
        </q-banner>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn class="btnreject" label="ยกเลิก" :disable="loading" @click="close" />
        <q-btn
          class="btnconfirm"
          unelevated
          label="ยืนยัน"
          :loading="loading"
          @click="onConfirmRemove"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
// import
import { computed, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import type { StudentEnrollment } from 'src/types/enrollment'
import { useEnrollmentStore } from 'src/stores/enrollment'
const enrollmentStore = useEnrollmentStore()
// props & emits
interface Props {
  modelValue: boolean
  student: StudentEnrollment | null
}
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'removed', payload: { id: string }): void
}>()

// state
const $q = useQuasar()
const loading = ref(false)
const errorMessage = ref('')

// v-model proxy
const dialog = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})

// helpers
const errorBannerClass = computed(() => (errorMessage.value ? 'bg-red-1 text-red-8' : ''))

function close() {
  errorMessage.value = ''
  dialog.value = false
}

watch(
  () => props.modelValue,
  (v) => {
    if (v) errorMessage.value = ''
  },
)

// actions
async function onConfirmRemove() {
  if (!props.student?.id) {
    errorMessage.value = 'ไม่พบบันทึกการลงทะเบียนของนิสิต'
    return
  }
  loading.value = true
  errorMessage.value = ''
  try {
    // ⛳️ ปรับชื่อฟังก์ชันตาม service ของโปรเจกต์ได้
    // แนะนำ: EnrollmentService.deleteEnrollmentById(enrollmentId: string)
    await enrollmentStore.deleteEnrollmentById(props.student.enrollmentId)

    $q.notify({ type: 'positive', message: 'ลบการลงทะเบียนสำเร็จ' })
    emit('removed', { id: props.student.id })
    close()
  } catch {
    errorMessage.value = 'ลบไม่สำเร็จ กรุณาลองอีกครั้ง'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
/* เน้นเรียบง่ายให้ตาม theme โปรเจกต์ */
</style>
