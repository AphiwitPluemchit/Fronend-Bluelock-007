<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import type { AxiosResponse } from 'axios'
import { api } from 'boot/axios'
import { useCourseStore } from 'src/stores/course'
import { useAuthStore } from 'src/stores/auth'
import { useQuasar } from 'quasar'
import type { Course } from 'src/types/course'
import { useRoute } from 'vue-router'
import AppBreadcrumbs from 'src/components/AppBreadcrumbs.vue'

const route = useRoute()

// รับ courseId จาก route parameter
const courseId = route.params.courseId as string
const courseStore = useCourseStore()
const authStore = useAuthStore()
const baseurl = api.defaults.baseURL
const url = ref('')
const $q = useQuasar()

// Types
interface UrlVerifyResponse {
  isVerified?: boolean
  isDuplicate?: boolean
  // allow extra fields but keep them unknown to avoid `any`
  [key: string]: unknown
}

// Button states for background verification UX
const isLoading = ref(false) // shows spinner for 2s
const isChecking = ref(false) // after initial loading, show "กำลังตรวจสอบ"
const latestStatus = ref<string | null>(null) // 'pending' | 'approved' | 'rejected' | null

const buttonLabel = computed(() => {
  if (latestStatus.value === 'approved') return 'อนุมัติแล้ว'
  if (latestStatus.value === 'pending' || isChecking.value) return 'กำลังตรวจสอบ'
  if (latestStatus.value === 'rejected') return 'ขออนุมัติใหม่'
  return 'ขออนุมัติ'
})

const isDisabled = computed(() => isChecking.value || latestStatus.value === 'approved')

// Course information
const selectedCourse = ref<Course | null>(null)
const screen = ref(false)

// Breadcrumb configuration
const breadcrumbs = ref({
  previousPage: { title: 'หลักสูตรทั้งหมด', path: '/Student/OnlineCoursesPage' },
  currentPage: { title: 'รายละเอียดหลักสูตร', path: `/Student/UploadCertificate/${courseId}` },
  icon: 'book',
})

// Computed properties for course display
const courseName = computed(() => selectedCourse.value?.name || '')
// const certificateName = computed(
//   () => selectedCourse.value?.certificateName || selectedCourse.value?.name || '',
// )
// const certificateNameEng = computed(
//   () => selectedCourse.value?.certificateNameEng || selectedCourse.value?.name || '',
// )
const courseHours = computed(() => selectedCourse.value?.hour || 0)
const courseSource = computed(() => {
  if (!selectedCourse.value) return ''
  return selectedCourse.value.type === 'buumooc' ? 'mooc.buu.ac.th' : 'thaimooc'
})
const courseLink = computed(() => selectedCourse.value?.link || '')

// โหลดข้อมูลคอร์สจาก courseId
const loadCourseById = async () => {
  if (courseId) {
    try {
      const course = await courseStore.getOneCourse(courseId)
      selectedCourse.value = course
      // fetch latest upload status for this student+course
      fetchLatestUpload().catch((e) => console.error('fetchLatestUpload error', e))
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
  // Prevent repeated clicks when already in checking state
  if (isChecking.value) return

  isLoading.value = true

  // Start API call and a minimum spinner delay (2s) in parallel
  const delay = new Promise((res) => setTimeout(res, 2000))
  let res: AxiosResponse<UrlVerifyResponse> | null = null
  try {
    const apiPromise = api.get(baseurl + '/certificates/url-verify', {
      params: {
        url: url.value,
        studentId: authStore.getUser?.id,
        courseId: selectedCourse.value?.id,
      },
    })

    // wait for both the API call and the UI delay
    const [apiRes] = await Promise.all([apiPromise, delay])
    res = apiRes
  } catch (err) {
    // ensure we still wait the delay before hiding spinner
    await delay
    isLoading.value = false
    console.error('❌ Upload failed:', err)
    $q.notify({
      type: 'negative',
      message: 'อัปโหลดไม่สำเร็จ เกิดข้อผิดพลาด : ' + (err as Error).message,
    })
    return
  }

  // hide the initial spinner
  isLoading.value = false

  // If server returns 202 Accepted it means verification runs in background
  if (res && res.status === 202) {
    // switch the button to a persistent checking state
    isChecking.value = true
    // refresh latest status from backend
    fetchLatestUpload().catch((e) => console.error('fetchLatestUpload after 202', e))
    return
  }

  // synchronous response handling (when not backgrounded)
  const { isVerified, isDuplicate } = res.data
  if (isVerified && !isDuplicate) {
    $q.notify({ type: 'positive', message: 'อัปโหลดสำเร็จ' })
  } else if (isDuplicate) {
    $q.notify({
      type: 'negative',
      message: 'ไม่สามารถรับชั่วโมงได้ เนื่องจากมีใบประกาศนียบัตรที่ซ้ำ',
    })
  } else {
    $q.notify({ type: 'negative', message: 'อัปโหลดไม่สำเร็จ เนื่องจากไม่พบใบประกาศนียบัตร' })
  }
}

// // Convert YouTube URL to embed format
// function getEmbedUrl(url: string): string {
//   if (!url) return ''

//   // YouTube URL conversion
//   const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
//   const youtubeMatch = url.match(youtubeRegex)
//   if (youtubeMatch) {
//     return `https://www.youtube.com/embed/${youtubeMatch[1]}`
//   }

//   // Return original URL if not YouTube (fallback)
//   return url
// }

// เรียกใช้เมื่อ component mount
onMounted(async () => {
  await loadCourseById()
  screen.value = true
})

// Fetch latest UploadCertificate record for the current student & course
async function fetchLatestUpload() {
  if (!authStore.getUser?.id) return
  if (!selectedCourse.value?.id) return
  try {
    const res = await api.get(baseurl + '/certificates', {
      params: {
        studentId: authStore.getUser?.id,
        courseId: selectedCourse.value.id,
        page: 1,
        limit: 1,
        sortBy: 'uploadAt',
        order: 'desc',
      },
    })

    const list = res.data?.data || []
    if (list.length > 0) {
      latestStatus.value = list[0].status
      // if the latest is pending, set checking state
      isChecking.value = list[0].status === 'pending'
    } else {
      latestStatus.value = null
      isChecking.value = false
    }
  } catch (err) {
    console.error('Failed to fetch latest upload:', err)
  }
}
</script>

<template>
  <q-page class="q-pa-md">
    <div style="margin-top: 20px">
      <AppBreadcrumbs :breadcrumbs="breadcrumbs" />

      <div class="certificate-upload-card q-mt-md" v-if="screen && selectedCourse">
        <q-card-section class="q-col-gutter-md row items-start q-mb-md">
          <!-- Course Image/Icon -->
          <div class="col-12 col-md-4 text-center">
            <q-img
              :src="
                selectedCourse && selectedCourse.file
                  ? `${baseurl}/uploads/course/images/${selectedCourse.file}`
                  : `${baseurl}/uploads/no-image.jpg`
              "
              alt="Certificate Example"
              class="course-img"
              error-src="/default-placeholder.jpg"
            />
          </div>

          <!-- Course Details -->
          <div class="col-12 col-md-8" v-if="selectedCourse">
            <q-list dense>
              <div class="field-pair">
                <div class="field-label">ชื่อหลักสูตร :</div>
                <div class="field-value">{{ courseName }}</div>
              </div>
              <!--
              <div class="field-pair">
                <div class="field-label">ชื่อในใบประกาศ :</div>
                <div class="field-value">{{ certificateName }}</div>
              </div> -->

              <!-- <div class="field-pair">
                <div class="field-label">ชื่อในใบประกาศ (อังกฤษ) :</div>
                <div class="field-value">{{ certificateNameEng }}</div>
              </div> -->
              <div class="field-pair">
                <div class="field-label">ประเภททักษะ :</div>
                <div class="field-value">
                  {{
                    selectedCourse.isHardSkill ? 'ทักษะความรู้ทางวิชาการ' : 'ทักษะเตรียมความพร้อม'
                  }}
                </div>
              </div>
              <div class="field-pair">
                <div class="field-label">แหล่งที่มา :</div>
                <div class="field-value">
                  {{ selectedCourse.type === 'buumooc' ? 'Buu Mooc' : 'Thai Mooc' }}
                </div>
              </div>
              <div class="field-pair">
                <div class="field-label">หน่วยงานผู้ออก :</div>
                <div class="field-value">{{ selectedCourse.issuer }}</div>
              </div>
              <div class="field-pair">
                <div class="field-label">จำนวนชั่วโมงที่ได้รับ :</div>
                <div class="field-value">{{ courseHours }} ชั่วโมง</div>
              </div>

              <div class="field-pair">
                <div class="field-label">ลิงก์เข้าเรียน :</div>
                <div class="field-value">
                  <a :href="courseLink" target="_blank" class="course-link" @click="openCourseUrl">
                    {{ courseSource }} <q-icon name="open_in_new" size="xs" />
                  </a>
                </div>
              </div>
            </q-list>
          </div>
        </q-card-section>

        <!-- Tutorial Video Section -->
        <!-- <div v-if="selectedCourse?.videoUrl" class="tutorial-section q-mt-md q-mb-md">
          <div class="section-title">วิดีโอสอนการขอใบประกาศนียบัตร</div>
          <div class="video-container">
            <iframe
              :src="getEmbedUrl(selectedCourse.videoUrl)"
              frameborder="0"
              allowfullscreen
              class="tutorial-video"
            ></iframe>
          </div>
        </div> -->

        <!-- No Tutorial Message -->
        <!-- <div v-else class="no-tutorial-section q-mt-md q-mb-md">
          <q-banner class="bg-grey-2 text-grey-7">
            <template v-slot:avatar>
              <q-icon name="info" color="grey-6" />
            </template>
            ไม่มีวิดีโอสอนการขอใบประกาศนียบัตรสำหรับคอร์สนี้
          </q-banner>
        </div> -->

        <!-- Certificate Upload Section -->
        <div class="upload-section q-mt-md">
          <q-list dense>
            <div class="field-pair">
              <div class="field-label">ลิงก์ใบประกาศนียบัตร :</div>
              <div class="field-value">
                <q-input v-model="url" outlined dense class="input-url"> </q-input>
              </div>
            </div>
          </q-list>

          <!-- Verify Button -->
          <div class="q-mt-md q-mb-md row justify-center q-gutter-sm">
            <q-btn
              :label="buttonLabel"
              color="positive"
              class="btnconfirm"
              @click="verifyUrl"
              :loading="isLoading"
              :disable="isDisabled"
              unelevated
              rounded
            />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.certificate-upload-card {
  background-color: #edf0f5;
  padding: 16px;
  font-size: 18px;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.course-img {
  width: 100%;
  max-width: 430px;
  height: auto;
  aspect-ratio: 4 / 3;
  background-color: #d9d9d9;
  border-radius: 12px;
  object-fit: cover;
  margin: 0 auto;
}

.field-pair {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
}

/* มือถือ: แสดงแนวตั้งเหมือนเดิม */
.field-label {
  font-weight: bold;
  font-size: 16px;
  color: #333;
  margin-bottom: 4px;
}

.field-value {
  font-size: 16px;
  color: #555;
  word-break: break-word;
}

/* แสดงแนวนอนเฉพาะตอนจอใหญ่ */
@media (min-width: 768px) {
  .field-pair {
    flex-direction: row;
    align-items: baseline;
  }

  .field-label {
    width: 200px;
    text-align: right;
    margin-bottom: 0;
    padding-right: 8px;
    position: relative;
  }

  .field-label::after {
    position: absolute;
    right: 0;
  }

  .field-value {
    text-align: left;
    flex: 1;
  }
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

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #1a1a1a;
}

.input-url {
  width: 100%;
}

.input-url :deep(.q-field__control) {
  border-radius: 12px !important;
}

.input-url :deep(.q-field__native) {
  border-radius: 12px !important;
}

/* Tutorial Video Styles */
.tutorial-section {
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.video-container {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  overflow: hidden;
  border-radius: 8px;
}

.tutorial-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

.no-tutorial-section {
  margin: 16px 0;
}

@media (max-width: 600px) {
  .certificate-upload-card {
    padding: 12px;
  }

  .tutorial-section {
    padding: 12px;
  }
}
</style>
