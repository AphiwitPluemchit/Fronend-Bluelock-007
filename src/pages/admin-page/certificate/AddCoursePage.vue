<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useCourseStore } from 'src/stores/course'
import type { Course } from 'src/types/course'
import AppBreadcrumbs from 'src/components/AppBreadcrumbs.vue'
import ImageDetail from 'src/pages/admin-page/program/ProgramDetail/ProgramDetail/imageDetail.vue'

const $q = useQuasar()
const router = useRouter()
const courseStore = useCourseStore()

// Form data
const course = ref<Course>({
  id: '',
  name: '',
  certificateName: '',
  certificateNameEng: '',
  link: '',
  issuer: '',
  type: '',
  hour: 0,
  isHardSkill: null as boolean | null,
  isActive: true,
  file: '',
  videoUrl: '',
})

const selectedImageFile = ref<File | null>(null)

// Breadcrumbs
const breadcrumbs = ref({
  previousPage: { title: 'รายการหัวข้อทั้งหมด', path: '/admin/CourseTablePage' },
  currentPage: { title: 'เพิ่มหัวข้อการอบรม', path: '/admin/CourseTablePage/AddCourse' },
  icon: 'school',
})

// Validation errors removed - form will submit without client-side validation
// Server-side validation will handle any required field validation

const statusText = computed(() => (course.value.isActive ? 'เปิดใช้งาน' : 'ปิดชั่วคราว'))
const statusClass = computed(() => (course.value.isActive ? 'status-open' : 'status-closed'))

function handleFileSelected(file: File) {
  selectedImageFile.value = file
}

function setHardSkill(v: boolean) {
  course.value.isHardSkill = v
}

function setType(v: 'thaimooc' | 'buumooc') {
  course.value.type = v
}

const showChangeStatusDialog = ref(false)
const selectedStatus = ref<'เปิดใช้งาน' | 'ปิดชั่วคราว'>('เปิดใช้งาน')

function closeDialog() {
  showChangeStatusDialog.value = false
}

function confirmStatusChange() {
  course.value.isActive = selectedStatus.value === 'เปิดใช้งาน'
  closeDialog()
}

const cancel = () => {
  void router.push('/admin/CourseTablePage')
}

const submit = async () => {
  try {
    await courseStore.addCourse(course.value)
    $q.notify({ message: 'บันทึกข้อมูลสำเร็จ', type: 'positive' })
    void router.push('/admin/CourseTablePage')
  } catch (err) {
    console.error('Error saving course:', err)
    $q.notify({ message: 'ไม่สามารถบันทึกข้อมูลได้', type: 'negative' })
  }
}
</script>

<template>
  <q-page class="q-pa-md">
    <div style="margin-top: 20px">
      <AppBreadcrumbs :breadcrumbs="breadcrumbs" />
    </div>

    <div class="wrapper">
      <div class="container">
        <!-- Image section is now optional for courses -->
        <div class="image-section" v-if="false">
          <ImageDetail
            ref="imageRef"
            :imageFileName="course.file"
            :disable="false"
            @file-selected="handleFileSelected"
          />
        </div>

        <div class="form-section">
          <q-page class="q-pa-md">
            <!-- สถานะ -->
            <div class="input-group no-wrap status-group">
              <p class="label label_minWidth">สถานะ :</p>
              <div class="status-inline-group">
                <q-badge :class="statusClass" class="status-btn">
                  <div align="center" class="status-text" style="font-size: 18px">
                    {{ statusText }}
                  </div>
                </q-badge>

                <q-btn
                  class="btnchange"
                  label="เปลี่ยน"
                  @click="showChangeStatusDialog = true"
                  flat
                  unelevated
                  style="min-width: unset; width: auto"
                />
              </div>
            </div>

            <!-- ชื่อหัวข้อ (ไทย) -->
            <div class="input-group">
              <p class="label label_minWidth">
                ชื่อหัวข้อ (ไทย) :
              </p>
              <div class="input-container">
                <q-input
                  outlined
                  v-model="course.name"
                  class="fix-q-input-height"
                  hide-bottom
                />
              </div>
            </div>

            <!-- ชื่อในใบประกาศ (ไทย) -->
            <div class="input-group">
              <p class="label label_minWidth">ชื่อในใบประกาศ (ไทย) :</p>
              <div class="input-container">
                <q-input outlined v-model="course.certificateName" class="fix-q-input-height" />
              </div>
            </div>

            <!-- ชื่อในใบประกาศ (อังกฤษ) -->
            <div class="input-group">
              <p class="label label_minWidth">ชื่อในใบประกาศ (อังกฤษ) :</p>
              <div class="input-container">
                <q-input outlined v-model="course.certificateNameEng" class="fix-q-input-height" />
              </div>
            </div>

            <!-- ประเภทโครงการ (isHardSkill) -->
            <div class="input-group">
              <p class="label label_minWidth">
                ประเภทโครงการ :
              </p>
              <div class="status-inline-group">
                <q-btn
                  :class="[
                    'q-px-md q-py-xs',
                    course.isHardSkill === true ? 'active-btn' : 'bg-grey-3',
                    'rounded-borders',
                  ]"
                  :flat="course.isHardSkill !== true"
                  @click="setHardSkill(true)"
                  class="programType-btn"
                >
                  ชั่วโมงทักษะทางวิชาการ
                </q-btn>

                <q-btn
                  :class="[
                    'q-px-md q-py-xs',
                    course.isHardSkill === false ? 'active-btn' : 'bg-grey-3',
                    'rounded-borders',
                  ]"
                  :flat="course.isHardSkill !== false"
                  @click="setHardSkill(false)"
                  class="programType-btn"
                >
                  ชั่วโมงเตรียมความพร้อม
                </q-btn>
              </div>
            </div>

            <!-- ลิงก์คอร์ส -->
            <div class="input-group">
              <p class="label label_minWidth">
                ลิงก์ :
              </p>
              <div class="input-container">
                <q-input
                  outlined
                  v-model="course.link"
                  class="fix-q-input-height"
                  placeholder="https://..."
                />
              </div>
            </div>

            <!-- จำนวนชั่วโมง -->
            <div class="input-group">
              <p class="label label_minWidth">
                จำนวนชั่วโมง :
              </p>
              <div class="input-container">
                <q-input
                  type="number"
                  outlined
                  v-model.number="course.hour"
                  class="fix-q-input-height"
                  min="0"
                />
              </div>
            </div>

            <!-- หน่วยงานผู้ออก -->
            <div class="input-group">
              <p class="label label_minWidth">
                หน่วยงานผู้ออก :
              </p>
              <div class="input-container">
                <q-input outlined v-model="course.issuer" class="fix-q-input-height" />
              </div>
            </div>

            <!-- ประเภทแพลตฟอร์ม (type)-->
            <div class="input-group">
              <p class="label label_minWidth">
                ประเภท :
              </p>
              <div class="status-inline-group">
                <q-btn
                  :class="[
                    'q-px-md q-py-xs',
                    course.type === 'thaimooc' ? 'active-btn' : 'bg-grey-3',
                  ]"
                  :flat="course.type !== 'thaimooc'"
                  @click="setType('thaimooc')"
                  class="programType-btn"
                >
                  Thai MOOC
                </q-btn>
                <q-btn
                  :class="[
                    'q-px-md q-py-xs',
                    course.type === 'buumooc' ? 'active-btn' : 'bg-grey-3',
                  ]"
                  :flat="course.type !== 'buumooc'"
                  @click="setType('buumooc')"
                  class="programType-btn"
                >
                  BUU MOOC
                </q-btn>
              </div>
            </div>

            <!-- วิดีโอสอนการขอใบประกาศ -->
            <div class="input-group">
              <p class="label label_minWidth">
                วิดีโอสอนการขอใบประกาศ :
              </p>
              <div class="input-container">
                <q-input
                  outlined
                  v-model="course.videoUrl"
                  class="fix-q-input-height"
                  placeholder="https://www.youtube.com/watch?v=example"
                />
                <div class="text-caption text-grey-6 q-mt-xs">
                  ลิงก์ YouTube สำหรับสอนนักเรียนวิธีการขอใบประกาศนียบัตร (ไม่บังคับ)
                </div>
              </div>
            </div>

            <!-- ปุ่มบันทึก/ยกเลิก -->
            <div class="button-group">
              <q-btn class="btnreject" label="ยกเลิก" @click="cancel" />
              <q-btn class="btnsecces" label="บันทึก" @click="submit" />
            </div>
          </q-page>
        </div>
      </div>
    </div>

    <!-- Dialog เปลี่ยนสถานะ -->
    <q-dialog v-model="showChangeStatusDialog" persistent>
      <q-card class="dialog-box">
        <q-card-section>
          <div class="label-changeStatus">เปลี่ยนสถานะหัวข้อการอบรม</div>
        </q-card-section>

        <q-card-section class="status-section">
          <q-btn
            label="เปิดใช้งาน"
            class="status-btn"
            :class="{
              'status-open': true,
              'active-status': selectedStatus === 'เปิดใช้งาน',
            }"
            @click="selectedStatus = 'เปิดใช้งาน'"
          />
          <q-btn
            label="ปิดชั่วคราว"
            class="status-btn"
            :class="{
              'status-closed': true,
              'active-status': selectedStatus === 'ปิดชั่วคราว',
            }"
            @click="selectedStatus = 'ปิดชั่วคราว'"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn class="btnreject" label="ยกเลิก" @click="closeDialog" />
          <q-btn class="btnconfirm" label="ยืนยัน" @click="confirmStatusChange" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<style scoped>
.text-red {
  color: red;
}

.status-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}
.label-changeStatus {
  font-size: 20px;
  font-weight: normal;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
}

.status-group {
  align-items: flex-start;
}
.status-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  width: 200px;
  font-size: 20px;
  border-radius: 50px;
  padding: 0 16px;
  text-align: center;
}
.status-inline-group {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  flex-wrap: nowrap;
}

.btnchange {
  min-width: auto !important;
  width: auto !important;
  padding: 4px 12px;
  font-size: 14px;
  background-color: #000;
  color: white;
  border-radius: 10px;
}

::v-deep(.q-field__control) {
  height: auto;
  background-color: white;
}

::v-deep(.q-icon) {
  font-size: 18px;
}

.fix-q-input-height ::v-deep(.q-icon) {
  font-size: 16px;
}
.fix-q-input-height ::v-deep(.q-field__control) {
  height: 40px !important;
  min-height: 40px !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  display: flex;
  align-items: center;
}

.fix-q-input-height ::v-deep(.q-field__append) {
  align-items: center;
  display: flex;
}

.input-group p {
  margin: 0;
  line-height: normal;
  text-align: left;
}
.label-error-shift {
  transform: translateY(-12px);
}
.no-wrap {
  flex-wrap: nowrap !important;
  white-space: nowrap;
}
.input-group {
  display: flex;
  align-items: center;
  gap: 25px;
  margin-bottom: 20px;
  width: 100%;
  flex-wrap: wrap;
}
.label {
  font-size: 18px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  line-height: 40px;
  margin: 0;
}
.label_minWidth {
  min-width: 200px;
}
.input-container {
  width: 660px;
  max-width: 100%;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 25px;
}

.dialog-box {
  width: 400px;
  padding: 20px;
  border-radius: 12px;
}

.status-open {
  color: #009812;
  background-color: #d0ffc5;
  border: 2px solid #00bb16;
}
.status-open.active-status {
  background-color: #00bb16;
  color: #ffffff;
}
.status-closed {
  color: #000000;
  background-color: #dadada;
  border: 2px solid #575656;
}
.status-closed.active-status {
  background-color: #575656;
  color: #ffffff;
}

/* Media */
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
  .input-group.no-wrap {
    flex-direction: row !important;
    align-items: center !important;
    gap: 20px !important;
    margin-bottom: 10px !important;
  }

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
    min-width: auto !important;
    width: auto !important;
    flex-shrink: 0;
  }
  .label-error-shift {
    transform: translateY(0px);
  }
}
@media (max-width: 500px) {
  .input-group:not(.no-wrap) {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 10px !important;
    gap: 5px !important;
  }
  .label {
    justify-content: flex-start;
  }
  .label-error-shift {
    transform: translateY(0px);
  }
  .label_minWidth {
    min-width: unset;
    width: 100%;
    text-align: left;
    padding-left: 0;
    margin-left: 0;
  }

  .button-group {
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
    width: 100%;
    gap: 10px;
    margin-top: 40px;
  }

  .button-group .btnreject,
  .button-group .btnsecces {
    width: 100%;
  }

  .no-wrap .label_minWidth {
    min-width: unset !important;
    width: auto !important;
    flex-shrink: 0;
  }
}
@media (max-width: 445px) {
  .input-group.no-wrap.status-group {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 8px !important;
  }

  .status-group .label_minWidth {
    min-width: unset !important;
    width: 100% !important;
    text-align: left !important;
  }

  .status-group .status-btn,
  .status-group .btnchange {
    margin-left: 0 !important;
  }
  .btnchange {
    padding: 2px 10px;
    font-size: 14px;
    background-color: #000;
    color: white;
    border-radius: 10px;
  }
}
.wrapper {
  display: flex;
  align-items: flex-start;
  column-gap: 150px;
  padding: 0px 50px;
  flex-wrap: wrap;
  background-color: #edf0f5;
}
.container {
  display: flex;
  align-items: flex-start;
  width: 100%;
  flex-wrap: wrap;
}
.image-section {
  align-items: flex-start;
  width: 100%;
  flex: 1;
  margin-left: 80px;
}

.form-section {
  flex-grow: 1;
  overflow-x: hidden;
  overflow-y: auto;
}

.form-section::-webkit-scrollbar {
  width: 8px;
}

@media (max-width: 1880px) {
  .wrapper {
    gap: 0px;
    padding: 0px;
  }
  .container {
    flex-direction: column;
    align-items: center;
  }

  .image-section {
    margin-left: 0;
    width: 100%;
    max-width: 430px;
  }

  .form-section {
    margin-right: 0;
    max-height: unset;
    width: 100%;
    max-width: 770px;
  }
}
@media (max-width: 860px) {
  .container {
    flex-direction: column;
    align-items: center;
  }

  .image-section {
    margin-left: 0;
    width: 100%;
    max-width: 430px;
  }

  .form-section {
    margin-right: 0;
    max-height: unset;
    width: 100%;
    max-width: 500px;
  }
}
@media (max-width: 500px) {
  .wrapper {
    flex-direction: column;
    gap: 30px;
    padding: 5px;
  }

  .container {
    flex-direction: column;
    align-items: center;
  }

  .image-section {
    margin-left: 0;
    width: 100%;
    max-width: 430px;
  }

  .form-section {
    margin-right: 0;
    max-height: unset;
    width: 100%;
    max-width: 800px;
  }
}
.programType-btn {
  width: 200px;
  height: 40px;
  border-radius: 50px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
  background-color: #ffffff;
}
.active-btn {
  background-color: #d0e4ff !important;
}
.programType-btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
@media (max-width: 1880px) {
  .input-container {
    width: 500px;
    max-width: 100%;
  }
  .label_minWidth {
    min-width: 180px !important;
  }
}
@media (max-width: 860px) {
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
    text-align: left;
    padding-left: 0;
    margin-left: 0;
  }
}
@media (max-width: 540px) {
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
    text-align: left;
    padding-left: 0;
    margin-left: 0;
  }

  .programType-btn {
    width: 180px;
    height: 40px;
    border-radius: 50px;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
    background-color: #ffffff;
  }
}
@media (max-width: 475px) {
  .programType-btn-group {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 10px 20px;
    width: 100%;
  }
  .programType-btn {
    width: 100%;
  }
}
</style>
