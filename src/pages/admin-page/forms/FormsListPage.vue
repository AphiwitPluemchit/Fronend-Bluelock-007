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
      />
    
    </div>
  </q-page>
</template>

<script setup lang="ts">

import { useFormStore } from 'src/stores/forms'
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'


const formStore = useFormStore()
const router = useRouter()

const createForm = async () => {
  await router.push('/Admin/forms/builder')
}
const columns = computed(() => [
  {
    name: 'title',
    label: 'ชื่อฟอร์ม',
    field: 'title',
    align: 'left' as const,
    sortable: true,
  }
])
onMounted(async () => {
  await formStore.fetchForms()
})

</script>

<style scoped>
.forms-list-page {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 32px;
  font-weight: 600;
  color: #202124;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 16px;
  color: #5f6368;
  margin: 0;
}

.header-actions {
  margin-left: 24px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.error-container {
  margin: 20px 0;
}

.forms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.form-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.form-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.form-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.form-info {
  flex: 1;
  margin-right: 16px;
}

.form-title {
  font-size: 18px;
  font-weight: 600;
  color: #202124;
  margin: 0 0 8px 0;
}

.form-description {
  font-size: 14px;
  color: #5f6368;
  margin: 0;
  line-height: 1.4;
}

.form-status {
  flex-shrink: 0;
}

.form-stats {
  display: flex;
  gap: 24px;
  margin-top: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #202124;
}

.stat-label {
  font-size: 12px;
  color: #5f6368;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-title {
  font-size: 24px;
  font-weight: 500;
  color: #5f6368;
  margin: 16px 0 8px 0;
}

.empty-description {
  font-size: 16px;
  color: #80868b;
  margin: 0 0 24px 0;
  max-width: 400px;
}

.pagination-container {
  display: flex;
  justify-content: center;
}
.forms-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* ✅ 3 cards ต่อแถว */
  gap: 24px;
  margin-bottom: 32px;
}
@media (max-width: 768px) {
  .container {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
  }

  .header-actions {
    margin-left: 0;
    width: 100%;
  }

  .forms-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .page-title {
    font-size: 24px;
  }

  .form-card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .form-info {
    margin-right: 0;
    margin-bottom: 12px;
  }

  .form-stats {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
