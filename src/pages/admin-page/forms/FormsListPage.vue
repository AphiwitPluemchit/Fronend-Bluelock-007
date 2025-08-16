<template>
  <q-page class="q-pa-md">
    <div>
      <!-- Header -->
      <div class="row justify-between items-center q-mb-md" style="margin-top: 20px">
        <div class="texttitle">จัดการฟอร์มประเมิน</div>
        <div class="header-actions">
          <q-btn
            color="primary"
            label="เพิ่มฟอร์ม"
            class="btnadd"
            style="width: 130px"
            @click="createForm"
          />
        </div>
      </div>

      <q-table
        :rows="formStore.forms"
        :columns="columns"
        row-key="id"
        flat
        bordered
        :loading="formStore.loading"
        no-data-label="ยังไม่มีฟอร์ม"
        no-results-label="ไม่พบผลลัพธ์"
      >
        <template v-slot:header="props">
          <q-tr :props="props" class="sticky-header">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :props="props">
              <template v-if="col.name === 'index'">
                {{ props.pageIndex + 1 }}
              </template>

              <template v-else-if="col.name === 'actions'">
                <q-icon
                  clickable
                  name="edit"
                  class="bg-primary text-white q-pa-xs rounded-borders q-mr-sm"
                  @click="editForm(props.row)"
                >
                  <q-tooltip>แก้ไข</q-tooltip>
                </q-icon>
                <q-icon
                  clickable
                  name="delete"
                  class="bg-red text-white q-pa-xs rounded-borders q-mr-sm"
                  @click="askRemove(props.row)"
                >
                  <q-tooltip>ลบ</q-tooltip>
                </q-icon>
              </template>

              <template v-else>
                {{ col.value }}
              </template>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
    <RemoveFormDailog v-model="showRemoveDialog" @confirm="deleteForm(pendingDeleteId)" />
  </q-page>
</template>

<script setup lang="ts">
import RemoveFormDailog from './RemoveFormDailog.vue'
import { useFormStore } from 'src/stores/forms'
import type { Form } from 'src/types/form'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const formStore = useFormStore()
const router = useRouter()
const $q = useQuasar()
const showRemoveDialog = ref(false)
const pendingDeleteId = ref<string | null>(null) 
const createForm = async () => {
  await router.push('/Admin/forms/builder')
}
const columns = computed(() => [
  {
    name: 'index',
    label: 'ลำดับ',
    field: 'index',
    align: 'left' as const,
    sortable: false,
  },
  {
    name: 'title',
    label: 'ชื่อฟอร์ม',
    field: 'title',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'actions',
    label: '',
    field: 'actions',
    align: 'center' as const,
    sortable: false,
  },
])
onMounted(async () => {
  await formStore.fetchForms()
})

function askRemove(row: Form) {
  pendingDeleteId.value = row.id || null
  showRemoveDialog.value = true
}

async function deleteForm(id: string | null) {
  try {
    if (!id) throw new Error('ไม่มีฟอร์ม ID')
    await formStore.deleteForm(id)
    await formStore.fetchForms()
    $q.notify({ type: 'positive', message: 'ลบฟอร์มเรียบร้อยแล้ว' })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'ลบฟอร์มไม่สำเร็จ' })
  } finally {
    showRemoveDialog.value = false
    pendingDeleteId.value = null
  }
}
const editForm = async (form: Form) => {
  await router.push(`/Admin/forms/builder?id=${form.id}`)
}
</script>

<style scoped></style>
