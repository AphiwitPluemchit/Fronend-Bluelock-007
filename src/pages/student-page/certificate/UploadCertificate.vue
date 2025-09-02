<script setup lang="ts">
import { computed, ref } from 'vue'
import { api } from 'boot/axios'
import { useCourseStore } from 'src/stores/course'
import { useAuthStore } from 'src/stores/auth'
import { useQuasar } from 'quasar'

const courseStore = useCourseStore()
const authStore = useAuthStore()
const baseurl = api.defaults.baseURL
const url = ref(
  'https://learner.thaimooc.ac.th/credential-wallet/10793bb5-6e4f-4873-9309-f25f216a46c7/sahaphap.rit/public',
)
const $q = useQuasar()

// ตั้งค่าเริ่มต้นให้แสดงเฉพาะคอร์สที่เปิดใช้งาน
courseStore.params.isActive = true

const selectedSource = ref('')
const selectedTopic = ref<{ id: number; name: string } | null>(null)
// ตัดหัวเรื่องไม่ให้ยาวเกินไป
const topicDisplay = computed(() => selectedTopic.value?.name.slice(0, 90) + '...')

const sourceOptions = [
  { value: 'buumooc', label: 'BUU MOOC' },
  { value: 'thaimooc', label: 'Thai MOOC' },
]

const topicOptions = computed(() => courseStore.courses)

function onSearch(val: string, update: (callback: () => void) => void) {
  courseStore.params.search = val
  courseStore.params.isActive = true
  courseStore
    .fetchCourses()
    .catch((err) => console.error('Course load failed:', err))
    .finally(() => {
      update(() => {})
    })
}

function setCourseFilter() {
  courseStore.params.type = selectedSource.value
  courseStore.params.isActive = true
  selectedTopic.value = null
  courseStore.fetchCourses().catch((err) => console.error('Course load failed:', err))
}

function openUrl(url: string) {
  window.open(url, '_blank')
}

async function verifyUrl(url: string) {
  console.log('verifyUrl', url)
  try {
    const res = await api.get(baseurl + '/certificate/url-verify', {
      params: {
        url: url,
        studentId: authStore.getUser?.id,
        courseId: selectedTopic.value?.id,
      },
    })
    const { isVerified, isDuplicate } = res.data
    if (isVerified && !isDuplicate) {
      $q.notify({
        type: 'positive',
        message: 'อัปโหลดสำเร็จ',
      })
    } else if (isDuplicate) {
      $q.notify({
        type: 'negative',
        message: 'ไม่สามารถรับชั่วโมงได้ เนื่องจากมีใบประกาศนียบัตรที่ซ้ำ',
      })
    } else {
      $q.notify({
        type: 'negative',
        message: 'อัปโหลดไม่สำเร็จ เนื่องจากไม่พบใบประกาศนียบัตร',
      })
    }
  } catch (err) {
    console.error('❌ Upload failed:', err)
    $q.notify({
      type: 'negative',
      message: 'อัปโหลดไม่สำเร็จ เกิดข้อผิดพลาด : ' + (err as Error).message,
    })
  }
}
</script>

<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">อัปโหลดใบประกาศนียบัตร</div>

    <!-- Dropdowns -->
    <div class="q-gutter-y-sm q-mt-md">
      <div class="flex justify-left q-gutter-x-sm">
        <div>
          <q-select
            v-model="selectedSource"
            :options="sourceOptions"
            label="แหล่งที่มา"
            dense
            outlined
            emit-value
            map-options
            @update:model-value="setCourseFilter"
          />
        </div>

        <div style="width: 80%">
          <q-select
            v-model="selectedTopic"
            :options="topicOptions"
            option-label="name"
            option-value="id"
            label="หัวข้อ"
            dense
            outlined
            :loading="courseStore.loading"
            @filter="onSearch"
            :disable="!selectedSource"
            :display-value="topicDisplay"
            use-input
            :debounce="300"
          >
            <template v-slot:hint> แสดงเฉพาะหัวข้อที่เปิดใช้งานเท่านั้น </template>
          </q-select>
        </div>
      </div>

      <div class="row q-gutter-x-sm q-mt-md">
        <q-input
          color="primary"
          dense
          outlined
          v-model="url"
          label="ลิ้งค์ ใบประกาศนียบัตร"
          icon="link"
          class="col"
        >
          <!-- <template v-slot:prepend>
            <q-icon name="link" color="primary" />
          </template> -->
          <template v-slot:append>
            <q-icon
              v-if="url"
              name="open_in_new"
              color="primary"
              class="cursor-pointer"
              @click="openUrl(url)"
            />
          </template>
        </q-input>
        <q-btn label="อัปโหลด" color="primary" icon="upload" @click="verifyUrl(url)" />
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.drop-area {
  border: 2px dashed #90caf9;
  background-color: #e3f2fd;
  cursor: pointer;
  transition: background-color 0.2s;
  padding: 24px;
  min-height: 160px;
}

.drop-area:hover {
  background-color: #d0e9ff;
}

.relative-container {
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.preview-frame {
  width: 100%;
  height: 400px;
  border: none;
}

.close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  transition: transform 0.2s;
}

.close-btn:hover {
  transform: scale(1.2);
}
</style>
