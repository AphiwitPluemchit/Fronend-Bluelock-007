<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useCourseStore } from 'src/stores/course'
import type { Course } from 'src/types/course'
import AppBreadcrumbs from 'src/components/AppBreadcrumbs.vue'

const $q = useQuasar()
const router = useRouter()
const courseStore = useCourseStore()

// Form data
const course = ref<Course>({
  id: '',
  name: '',
  link: '',
  issuer: '',
  type: '',
  hour: 0,
  isHardSkill: false,
  isActive: true,
})

// File upload
const uploadedFiles = ref<File[]>([])
const previewUrl = ref<string | null>(null)

// Form validation
const errors = ref<Record<string, string>>({})

// Breadcrumbs
const breadcrumbs = ref({
  previousPage: { title: 'รายการหัวข้อทั้งหมด', path: '/admin/CourseTablePage' },
  currentPage: { title: 'เพิ่มหัวข้อการอบรม', path: '/admin/AddCourse' },
  icon: 'school',
})

// Validation functions
const validateForm = () => {
  errors.value = {}

  if (!course.value.name.trim()) errors.value.name = 'กรุณากรอกชื่อหลักสูตร'
  if (!course.value.link.trim()) {
    errors.value.link = 'กรุณากรอกลิงก์'
  } else if (!isValidUrl(course.value.link)) {
    errors.value.link = 'กรุณากรอกลิงก์ให้ถูกต้อง'
  }
  if (!course.value.issuer.trim()) errors.value.issuer = 'กรุณากรอกหน่วยงานผู้ออก'
  if (!course.value.type.trim()) errors.value.type = 'กรุณากรอกประเภท'
  if (!Number.isInteger(course.value.hour) || course.value.hour <= 0) {
    errors.value.hour = 'กรุณากรอกจำนวนชั่วโมงให้ถูกต้อง'
  }
  if (!course.value.isHardSkill) errors.value.isHardSkill = 'กรุณาเลือกประเภทหัวข้อ'

  return Object.keys(errors.value).length === 0
}

const isValidUrl = (urlString: string) => {
  try {
    new URL(urlString)
    return true
  } catch {
    return false
  }
}

// ฟังก์ชันเมื่ออัปโหลดไฟล์
const handleFileUpload = (files: readonly File[]) => {
  uploadedFiles.value = [...files]
  if (files.length > 0 && files[0]) {
    previewUrl.value = URL.createObjectURL(files[0])
  }
}

// ลบไฟล์
const removeFile = () => {
  uploadedFiles.value = []
  previewUrl.value = null
}

// Computed property to check if file is an image
const isImageFile = computed(() => {
  if (uploadedFiles.value.length === 0 || !uploadedFiles.value[0]) return false
  const file = uploadedFiles.value[0]
  return file.type.startsWith('image/')
})

// Form actions
const saveCourse = async () => {
  if (!validateForm()) return

  try {
    // Save course data
    await courseStore.addCourse(course.value)

    // Handle file upload if needed (simplified for now)
    if (uploadedFiles.value.length > 0 && uploadedFiles.value[0]) {
      const formData = new FormData()
      formData.append('file', uploadedFiles.value[0])
      // For now, we'll just show a notification that file upload is not implemented
      $q.notify({ message: 'บันทึกข้อมูลสำเร็จ (การอัปโหลดไฟล์จะถูกเพิ่มในภายหลัง)', type: 'info' })
    } else {
      $q.notify({ message: 'บันทึกข้อมูลสำเร็จ', type: 'positive' })
    }

    void router.push('/admin/CourseTablePage')
  } catch (error) {
    $q.notify({ message: 'ไม่สามารถบันทึกข้อมูลได้', type: 'negative' })
    console.error('Error saving course:', error)
  }
}

const cancel = () => {
  void router.push('/admin/CourseTablePage')
}
</script>

<template>
  <div class="q-pa-md">
    <!-- Breadcrumbs -->
    <AppBreadcrumbs :breadcrumbs="breadcrumbs" />

    <div class="q-mx-lg">
      <q-card class="q-mt-md full-width" flat>
        <q-form @submit.prevent="saveCourse">
          <!-- Form Fields -->
          <div class="row q-col-gutter-md q-pa-md">
            <!-- Name Field -->
            <div class="col-12 row items-center q-pa-sm">
              <div class="col-xs-12 col-md-1 text-right q-pr-md">
                <p class="q-my-none">ชื่อหลักสูตร <span class="text-red">*</span>:</p>
              </div>
              <div class="col-xs-12 col-md-11">
                <q-input
                  v-model="course.name"
                  :error="!!errors.name"
                  :error-message="errors.name"
                  outlined
                  dense
                />
              </div>
            </div>

            <!-- Link Field -->
            <div class="col-12 row items-center q-pa-sm">
              <div class="col-xs-12 col-md-1 text-right q-pr-md">
                <p class="q-my-none">ลิงก์ <span class="text-red">*</span>:</p>
              </div>
              <div class="col-xs-12 col-md-11">
                <q-input
                  v-model="course.link"
                  :error="!!errors.link"
                  :error-message="errors.link"
                  outlined
                  dense
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <!-- Hour Field -->
            <div class="col-12 row items-center q-pa-sm">
              <div class="col-xs-12 col-md-1 text-right q-pr-md">
                <p class="q-my-none">จำนวนชั่วโมง <span class="text-red">*</span>:</p>
              </div>
              <div class="col-xs-12 col-md-11">
                <q-input
                  v-model.number="course.hour"
                  :error="!!errors.hour"
                  :error-message="errors.hour"
                  outlined
                  dense
                  type="number"
                  min="1"
                />
              </div>
            </div>

            <!-- ประเภทหัวข้อ -->
            <div class="col-12 row items-center q-pa-sm">
              <div class="col-xs-12 col-md-1 text-right q-pr-md">
                <p class="q-my-none">ประเภทหัวข้อ<span class="text-red">*</span>:</p>
              </div>
              <div class="col-xs-12 col-md-11">
                <q-select
                  v-model="course.type"
                  :error="!!errors.type"
                  :error-message="errors.type"
                  :options="[
                    { label: 'ทักษะทางวิชาการ', value: true },
                    { label: 'เตรียมความพร้อม', value: false },
                  ]"
                  dense
                  outlined
                  emit-value
                  map-options
                />
              </div>
            </div>

            <!-- Issuer Field -->
            <div class="col-12 row items-center q-pa-sm">
              <div class="col-xs-12 col-md-1 text-right q-pr-md">
                <p class="q-my-none">หน่วยงานผู้ออก <span class="text-red">*</span>:</p>
              </div>
              <div class="col-xs-12 col-md-11">
                <q-input
                  v-model="course.issuer"
                  :error="!!errors.issuer"
                  :error-message="errors.issuer"
                  outlined
                  dense
                />
              </div>
            </div>

            <!-- Type Field -->
            <div class="col-12 row items-center q-pa-sm">
              <div class="col-xs-12 col-md-1 text-right q-pr-md">
                <p class="q-my-none">ประเภท <span class="text-red">*</span>:</p>
              </div>
              <div class="col-xs-12 col-md-11">
                <q-select
                  v-model="course.issuer"
                  :options="[
                    { label: 'Buu Mooc', value: 'buumooc' },
                    { label: 'Thai Mooc', value: 'thaimooc' },
                  ]"
                  dense
                  outlined
                  emit-value
                  map-options
                />
              </div>
            </div>

            <!-- isActive Toggle -->
            <div class="col-12 row items-center q-pa-sm">
              <div class="col-xs-12 col-md-1 text-right q-pr-md">
                <p class="q-my-none">สถานะการใช้งาน:</p>
              </div>
              <div class="col-xs-12 col-md-11">
                <q-toggle
                  v-model="course.isActive"
                  :label="course.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'"
                  color="primary"
                />
              </div>
            </div>

            <!-- File Upload Section -->
            <!-- File upload -->
            <div class="col-xs-12 col-md-12">
              <q-card flat bordered class="q-pa-md">
                <div class="text-subtitle2 q-mb-sm">อัปโหลดตัวอย่างใบประกาศ</div>
                <q-uploader
                  label="ลากไฟล์มาวาง หรือคลิกเพื่ออัปโหลด"
                  accept=".pdf,image/*"
                  :auto-upload="false"
                  :max-files="1"
                  @added="handleFileUpload"
                />

                <!-- Preview file -->
                <div v-if="previewUrl" class="q-mt-md">
                  <div v-if="isImageFile" class="q-mb-sm">
                    <img
                      :src="previewUrl"
                      alt="Preview"
                      class="q-mb-sm"
                      style="max-width: 100%; border: 1px solid #ccc; border-radius: 8px"
                    />
                  </div>
                  <div v-else>
                    <q-icon name="insert_drive_file" size="lg" class="q-mr-sm" />
                    <span>{{ uploadedFiles[0]?.name }}</span>
                  </div>
                  <q-btn
                    dense
                    flat
                    icon="delete"
                    color="negative"
                    label="ลบไฟล์"
                    class="q-mt-sm"
                    @click="removeFile"
                  />
                </div>
              </q-card>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="q-mt-md q-pa-md text-right">
            <q-btn
              label="ยกเลิก"
              class="btnreject q-mr-sm q-mb-sm"
              unelevated
              rounded
              @click="cancel"
            />
            <q-btn label="บันทึก" class="btnconfirm q-mb-sm" unelevated rounded type="submit" />
          </div>
        </q-form>
      </q-card>
    </div>
  </div>
</template>

<style scoped>
.text-red {
  color: red;
}

.q-card {
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
}

@media (max-width: 599px) {
  .q-card {
    padding: 15px;
  }

  .text-right {
    text-align: left !important;
  }

  .q-mr-sm {
    margin-right: 0 !important;
    margin-bottom: 8px !important;
  }

  .text-right {
    text-align: left !important;
  }
}
</style>
