<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useCourseStore } from 'src/stores/course'
import { useAuthStore } from 'src/stores/auth'
import { useQuasar } from 'quasar'
import type { Course } from 'src/types/course'

// Props
interface Props {
  courseId?: string
}
const props = defineProps<Props>()

const courseStore = useCourseStore()
const authStore = useAuthStore()
const baseurl = api.defaults.baseURL
const url = ref('')
const $q = useQuasar()

// Course information
const selectedCourse = ref<Course | null>(null)

// File upload state
const uploadedFiles = ref<File[]>([])

// Computed properties for course display
const courseName = computed(() => selectedCourse.value?.name || '')
const courseHours = computed(() => selectedCourse.value?.hour || 0)
const courseSource = computed(() => {
  if (!selectedCourse.value) return ''
  return selectedCourse.value.type === 'buumooc' ? 'mooc.buu.ac.th' : 'thaimooc'
})
const courseLink = computed(() => selectedCourse.value?.link || '')

// โหลดข้อมูลคอร์สจาก courseId
const loadCourseById = async () => {
  if (props.courseId) {
    try {
      const course = await courseStore.getOneCourse(props.courseId)
      selectedCourse.value = course
    } catch (error) {
      console.error('Error loading course:', error)
      $q.notify({
        type: 'negative',
        message: 'ไม่สามารถโหลดข้อมูลคอร์สได้',
      })
    }
  }
}

// เปิดลิงก์คอร์ส
function openCourseUrl() {
  if (courseLink.value) {
    window.open(courseLink.value, '_blank')
  }
}

// ฟังก์ชันสำหรับ upload file
const handleFileUpload = (files: readonly File[]) => {
  if (files.length > 0) {
    uploadedFiles.value = [...files]
    // จำลองการอัปโหลดไฟล์ - ในที่นี้เราจะใช้ URL แทน
    // สามารถใช้ FormData เพื่ออัปโหลดไฟล์จริงได้
    console.log('Files uploaded:', files)
  }
}

// ตรวจสอบ URL
async function verifyUrl() {
  if (!url.value.trim()) {
    $q.notify({
      type: 'negative',
      message: 'กรุณากรอกลิ้งค์ใบประกาศนียบัตร',
    })
    return
  }

  console.log('verifyUrl', url.value)
  try {
    const res = await api.get(baseurl + '/certificates/url-verify', {
      params: {
        url: url.value,
        studentId: authStore.getUser?.id,
        courseId: selectedCourse.value?.id,
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

// เรียกใช้เมื่อ component mount
onMounted(() => {
  void loadCourseById()
})
</script>

<template>
  <div class="upload-certificate-container">
    <!-- Header -->
    <div class="breadcrumb-section">
      <div class="breadcrumb">
        <span>ใบประกาศนียบัตร</span>
        <q-icon name="chevron_right" size="xs" />
        <span class="current">รายชื่อหัวข้อในประกาศนียบัตร</span>
      </div>
    </div>

    <!-- Course Information Card -->
    <q-card class="course-info-card q-mb-md" v-if="selectedCourse">
      <q-card-section>
        <div class="course-title">{{ courseName }}</div>
        <div class="course-details">
          <div class="detail-item">
            <span class="label">ผู้ให้ :</span>
            <span class="value">{{ selectedCourse.issuer }}</span>
          </div>
          <div class="detail-item">
            <span class="label">จำนวนชั่วโมง :</span>
            <span class="value">{{ courseHours }}</span>
          </div>
          <div class="detail-item">
            <span class="label">ลิงก์ออนไลน์ :</span>
            <a :href="courseLink" target="_blank" class="course-link" @click="openCourseUrl">
              {{ courseSource }} <q-icon name="open_in_new" size="xs" />
            </a>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Certificate Upload Section -->
    <q-card class="upload-card">
      <q-card-section class="upload-section">
        <div class="upload-title">อัปโหลด Certificate</div>

        <!-- File Upload Area -->
        <div class="upload-area">
          <q-uploader
            ref="uploader"
            :factory="() => ({ url: baseurl + '/certificates/upload' })"
            accept=".pdf,image/*"
            :max-files="1"
            class="full-width"
            @added="handleFileUpload"
            hide-upload-btn
            label="ลากไฟล์มาวาง หรือคลิกเพื่ออัปโหลด"
            flat
            bordered
            style="max-height: 200px"
          >
            <template v-slot:header="scope">
              <div class="row no-wrap items-center q-pa-sm q-gutter-xs">
                <q-btn
                  v-if="scope.queuedFiles.length > 0"
                  icon="clear_all"
                  @click="scope.removeQueuedFiles"
                  round
                  dense
                  flat
                >
                  <q-tooltip>Remove All</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="scope.uploadedFiles.length > 0"
                  icon="done_all"
                  @click="scope.removeUploadedFiles"
                  round
                  dense
                  flat
                >
                  <q-tooltip>Remove Uploaded Files</q-tooltip>
                </q-btn>
                <q-spinner v-if="scope.isUploading" class="q-uploader__spinner" />
                <div class="col">
                  <div class="q-uploader__title">อัปโหลดไฟล์ Certificate</div>
                  <div class="q-uploader__subtitle">{{ scope.files.length }} file(s)</div>
                </div>
                <q-btn
                  v-if="scope.canAddFiles"
                  type="a"
                  icon="add_box"
                  @click="scope.pickFiles"
                  round
                  dense
                  flat
                >
                  <q-uploader-add-trigger />
                  <q-tooltip>Pick Files</q-tooltip>
                </q-btn>
              </div>
            </template>
          </q-uploader>
        </div>

        <!-- URL Input Section -->
        <div class="url-section">
          <div class="section-title">ลิ้งค์ใบประกาศนียบัตร</div>
          <q-input
            v-model="url"
            outlined
            placeholder="BUU IF001 Certificate | mooc.buu.ac.th"
            class="url-input"
          >
            <template v-slot:prepend>
              <q-icon name="link" />
            </template>
          </q-input>

          <!-- Verify Button -->
          <q-btn
            label="ตรวจสอบ url ใบประกาศ"
            color="positive"
            class="verify-btn"
            icon="check_circle"
            @click="verifyUrl"
            :loading="courseStore.loading"
          />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<style scoped>
.upload-certificate-container {
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;
}

.breadcrumb-section {
  margin-bottom: 20px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.breadcrumb .current {
  font-weight: 600;
  color: #1976d2;
}

.course-info-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.course-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1a1a1a;
}

.course-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-item .label {
  font-weight: 500;
  color: #666;
  min-width: 100px;
}

.detail-item .value {
  color: #1a1a1a;
}

.course-link {
  color: #1976d2;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;
}

.course-link:hover {
  text-decoration: underline;
}

.upload-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.upload-section {
  padding: 24px;
}

.upload-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #1a1a1a;
}

.upload-area {
  margin-bottom: 24px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
}

.url-section {
  border-top: 1px solid #e0e0e0;
  padding-top: 24px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
  color: #666;
}

.url-input {
  margin-bottom: 16px;
}

.verify-btn {
  width: 100%;
  height: 48px;
  border-radius: 8px;
  font-weight: 600;
}

@media (max-width: 600px) {
  .upload-certificate-container {
    padding: 12px;
  }

  .course-details {
    gap: 12px;
  }

  .detail-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .detail-item .label {
    min-width: auto;
  }
}
</style>
