<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useCourseStore } from 'src/stores/course'
import { useQuasar } from 'quasar'
import type { Course } from 'src/types/course'
import ImageDetail from 'src/pages/admin-page/program/ProgramDetail/ProgramDetail/imageDetail.vue'
const $q = useQuasar()
const courseStore = useCourseStore()

const props = defineProps<{ isEditing?: boolean; id?: string }>()
onMounted(loadCourse)
watch(() => props.id, loadCourse)

const defaultCourse = (): Course => ({
  id: '',
  name: '',
  certificateName: '',
  certificateNameEng: '',
  link: '',
  isHardSkill: null, // หรือ false ถ้าอยากบังคับเป็น boolean
  isActive: false,
  issuer: '',
  hour: 0,
  type: '',
  file: '',
})

const originalCourseData = ref<Course>(defaultCourse()) // <-- ไม่ใช่ null/Partial อีกต่อไป

async function loadCourse() {
  const data = await courseStore.getOneCourse(props.id ?? '')
  // รวมกับ default ป้องกันฟิลด์หาย
  const full: Course = { ...defaultCourse(), ...data }
  courseState.value = full
  originalCourseData.value = { ...full }
}

const courseState = ref<Course>(defaultCourse())

const selectedImageFile = ref<File | null>(null)

// `isEditMode` (local) is used to control editability in the UI.
// If external prop `isEditing` is needed later we can wire it, but currently it's unused.

const statusText = computed(() => (courseState.value.isActive ? 'เปิดใช้งาน' : 'ปิดชั่วคราว'))
const statusClass = computed(() => (courseState.value.isActive ? 'status-open ' : 'status-closed '))

const nameError = computed(() => (courseState.value.name.trim() ? '' : 'กรุณากรอกชื่อหัวข้อ'))
const linkError = computed(() => (courseState.value.link.trim() ? '' : 'กรุณากรอกลิงค์'))
// show error only when isHardSkill is null/undefined (unset)
const CategoryError = computed(() =>
  courseState.value.isHardSkill === null || courseState.value.isHardSkill === undefined
    ? 'กรุณาเลือกประเภทโครงการ'
    : '',
)
const hourError = computed(() => (courseState.value.hour ? '' : 'กรุณากรอกชั่วโมง'))
const typeError = computed(() => (courseState.value.type ? '' : 'กรุณากรอกประเภท'))

function handleFileSelected(file: File) {
  selectedImageFile.value = file
}

// function toggleActive() {
//   if (!isEditing.value) return
//   courseState.value.isActive = !courseState.value.isActive
//   showChangeStatusDialog.value = true
// }

function setHardSkill(v: boolean) {
  // use local edit mode toggle so enabling edit in UI allows changes
  if (!isEditMode.value) return
  courseState.value.isHardSkill = v
}

function setType(v: 'thaimooc' | 'buumooc' | 'lms') {
  // use local edit mode toggle so enabling edit in UI allows changes
  if (!isEditMode.value) return
  courseState.value.type = v
}

const showChangeStatusDialog = ref(false)
const isEditMode = ref(false)

const showCancelDialog = ref(false)
const selectedStatus = ref<'เปิดใช้งาน' | 'ปิดชั่วคราว'>('เปิดใช้งาน')

async function saveChanges() {
  try {
    const c = courseState.value
    if (!c.id) {
      $q.notify({ message: 'ไม่พบรหัสคอร์ส', type: 'negative' })
      return
    }
    await courseStore.updateCourse(c.id, { ...c }) // ส่ง plain object
    originalCourseData.value = { ...c }
    isEditMode.value = false
    $q.notify({ message: 'แก้ไขข้อมูลสำเร็จ', type: 'positive' })
  } catch (err) {
    console.error('Error updating course:', err)
    $q.notify({ message: 'ไม่สามารถบันทึกข้อมูลได้', type: 'negative' })
  }
}

function cancelEdit() {
  showCancelDialog.value = true
}

function enableEditMode() {
  isEditMode.value = true
  originalCourseData.value = { ...courseState.value }
}

function closeDialog() {
  showChangeStatusDialog.value = false
}
function confirmStatusChange() {
  courseState.value.isActive = selectedStatus.value === 'เปิดใช้งาน'
  closeDialog()
}
function confirmCancel() {
  courseState.value = { ...originalCourseData.value }
  isEditMode.value = false
  showCancelDialog.value = false
}
</script>

<template>
  <q-page>
    <div class="wrapper">
      <div class="container">
        <div class="image-section">
          <ImageDetail
            ref="imageRef"
            :imageFileName="courseState.file"
            :disable="!isEditMode"
            @file-selected="handleFileSelected"
          />
        </div>

        <div class="form-section">
          <q-page class="q-pa-md">
            <!-- สถานะ -->
            <div class="input-group no-wrap status-group" ref="formTop">
              <p class="label label_minWidth">สถานะ :</p>
              <div class="status-inline-group">
                <q-badge :class="statusClass" class="status-btn">
                  <div align="center" class="status-text" style="font-size: 18px">
                    {{ statusText }}
                  </div>
                </q-badge>

                <q-btn
                  v-if="isEditMode && statusText"
                  class="btnchange"
                  label="เปลี่ยน"
                  :disable="!isEditMode"
                  @click="showChangeStatusDialog = true"
                  flat
                  unelevated
                  style="min-width: unset; width: auto"
                />
              </div>
            </div>

            <!-- ชื่อหัวข้อ -->
            <div class="input-group">
              <p class="label label_minWidth" :class="{ 'label-error-shift': nameError !== '' }">
                ชื่อหัวข้อ :
              </p>
              <div class="input-container">
                <q-input
                  outlined
                  v-model="courseState.name"
                  class="fix-q-input-height"
                  :error="nameError !== ''"
                  hide-bottom
                  :readonly="!isEditMode"
                  :class="{ readonly: !isEditMode }"
                />
                <div v-if="nameError" class="text-negative text-subtitle2 q-mt-xs">
                  {{ nameError }}
                </div>
              </div>
            </div>

            <!-- ชื่อในใบประกาศ (ไทย) -->
            <div class="input-group">
              <p class="label label_minWidth">ชื่อในใบประกาศ (ไทย) :</p>
              <div class="input-container">
                <q-input
                  outlined
                  v-model="courseState.certificateName"
                  class="fix-q-input-height"
                  :readonly="!isEditMode"
                  :class="{ readonly: !isEditMode }"
                />
              </div>
            </div>

            <!-- ชื่อในใบประกาศ (อังกฤษ) -->
            <div class="input-group">
              <p class="label label_minWidth">ชื่อในใบประกาศ (อังกฤษ) :</p>
              <div class="input-container">
                <q-input
                  outlined
                  v-model="courseState.certificateNameEng"
                  class="fix-q-input-height"
                  :readonly="!isEditMode"
                  :class="{ readonly: !isEditMode }"
                />
              </div>
            </div>

            <!-- ประเภทโครงการ (isHardSkill) -->
            <div class="input-group">
              <p
                class="label label_minWidth"
                :class="{ 'label-error-shift': CategoryError !== '' }"
              >
                ประเภทโครงการ :
              </p>
              <div class="status-inline-group">
                <!-- Always render both buttons so user can switch; active one gets 'active-btn', inactive gets 'bg-grey-3' -->
                <q-btn
                  :class="[
                    'q-px-md q-py-xs',
                    courseState.isHardSkill === true ? 'active-btn' : 'bg-grey-3',
                    'rounded-borders',
                  ]"
                  :flat="courseState.isHardSkill !== true"
                  @click="setHardSkill(true)"
                  :disable="!isEditMode"
                  class="programType-btn"
                  :error="CategoryError !== ''"
                >
                  ชั่วโมงทักษะทางวิชาการ
                </q-btn>

                <q-btn
                  :class="[
                    'q-px-md q-py-xs',
                    courseState.isHardSkill === false ? 'active-btn' : 'bg-grey-3',
                    'rounded-borders',
                  ]"
                  :flat="courseState.isHardSkill !== false"
                  @click="setHardSkill(false)"
                  :disable="!isEditMode"
                  class="programType-btn"
                  :error="CategoryError !== ''"
                >
                  ชั่วโมงเตรียมความพร้อม
                </q-btn>
              </div>
            </div>

            <!-- ลิงก์คอร์ส -->
            <div class="input-group">
              <p class="label label_minWidth" :class="{ 'label-error-shift': linkError !== '' }">
                ลิงก์ :
              </p>
              <div class="input-container">
                <q-input
                  outlined
                  v-model="courseState.link"
                  class="fix-q-input-height"
                  :readonly="!isEditMode"
                  placeholder="https://..."
                  :class="{ readonly: !isEditMode }"
                  :error="linkError !== ''"
                />
                <div v-if="linkError" class="text-negative text-subtitle2 q-mt-xs">
                  {{ linkError }}
                </div>
              </div>
            </div>

            <!-- จำนวนชั่วโมง -->
            <div class="input-group">
              <p class="label label_minWidth">จำนวนชั่วโมง :</p>
              <div class="input-container">
                <q-input
                  type="number"
                  outlined
                  v-model.number="courseState.hour"
                  class="fix-q-input-height"
                  :readonly="!isEditMode"
                  :class="{ readonly: !isEditMode }"
                  min="0"
                  :error="hourError !== ''"
                />
                <div v-if="hourError" class="text-negative text-subtitle2 q-mt-xs">
                  {{ hourError }}
                </div>
              </div>
            </div>

            <!-- หน่วยงานผู้ออก -->
            <div class="input-group">
              <p class="label label_minWidth">หน่วยงานผู้ออก :</p>
              <div class="input-container">
                <q-input
                  outlined
                  v-model="courseState.issuer"
                  class="fix-q-input-height"
                  :readonly="!isEditMode"
                  :class="{ readonly: !isEditMode }"
                />
              </div>
            </div>

            <!-- ประเภทแพลตฟอร์ม (type)-->
            <div class="input-group">
              <p class="label label_minWidth" :class="{ 'label-error-shift': typeError !== '' }">
                ประเภท :
              </p>
              <div class="status-inline-group">
                <!-- Always render both MOOC type buttons so user can change selection -->
                <q-btn
                  :class="[
                    'q-px-md q-py-xs',
                    courseState.type === 'thaimooc' ? 'active-btn' : 'bg-grey-3',
                  ]"
                  :flat="courseState.type !== 'thaimooc'"
                  @click="setType('thaimooc')"
                  :disable="!isEditMode"
                  class="programType-btn"
                  :error="typeError !== ''"
                >
                  Thai MOOC
                </q-btn>
                <q-btn
                  :class="[
                    'q-px-md q-py-xs',
                    courseState.type === 'buumooc' ? 'active-btn' : 'bg-grey-3',
                  ]"
                  :flat="courseState.type !== 'buumooc'"
                  @click="setType('buumooc')"
                  :disable="!isEditMode"
                  class="programType-btn"
                  :error="typeError !== ''"
                >
                  BUU MOOC
                </q-btn>
                <!-- <q-btn
                  :class="[
                    'q-px-md q-py-xs',
                    courseState.type === 'lms' ? 'status-open' : 'bg-grey-3',
                  ]"
                  :flat="courseState.type !== 'lms'"
                  @click="setType('lms')"
                  :disable="!isEditMode"
                >
                  LMS
                </q-btn> -->
              </div>
            </div>

            <!-- ปุ่มบันทึก/ยกเลิก -->
            <div class="button-group">
              <q-btn v-if="!isEditMode" class="btnedit" label="แก้ไข" @click="enableEditMode" />
              <template v-else>
                <q-btn class="btnreject" label="ยกเลิก" @click="cancelEdit" />
                <q-btn class="btnsecces" label="บันทึก" @click="saveChanges" />
              </template>
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
    <!-- Dialog -->
    <q-dialog v-model="showCancelDialog">
      <q-card class="q-card-cancleDialog">
        <q-card-section><div class="text-h6">ยืนยันการยกเลิก</div></q-card-section>
        <q-card-section
          >คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการแก้ไข?
          การเปลี่ยนแปลงทั้งหมดจะไม่ถูกบันทึก</q-card-section
        >
        <q-card-actions align="right">
          <q-btn flat label="ยกเลิก" class="btnreject q-mr-md" v-close-popup />
          <q-btn flat label="ยืนยัน" class="btnconfirm" @click="confirmCancel" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<style scoped>
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
.q-card-cancleDialog {
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
}

:deep(.readonly.q-field--outlined .q-field__control:before),
:deep(.readonly.q-field--outlined .q-field__control:after) {
  border-style: solid !important; /* เปลี่ยนจากเส้นประเป็นทึบ */
  border-color: #9e9e9e !important; /* สีขอบ */
  border-width: 1px !important; /* ความหนาของเส้น */
}

/* ให้กินเต็มความกว้างและดูแน่นขึ้น */
:deep(.q-field) {
  width: 100%;
}
:deep(.q-field--outlined .q-field__control) {
  border-radius: 3px;
}

/* ปรับพื้นหลัง/ตัวอักษรตอน readonly (ไม่บังคับ) */
:deep(.readonly .q-field__control) {
  background-color: #f5f6f8;
}
:deep(.readonly .q-field__native) {
  color: #555;
}

.status-group {
  align-items: flex-start;
}
.status-btn {
  display: flex;
  align-items: center; /* จัดกลางแนวตั้ง */
  justify-content: center; /* จัดกลางแนวนอน */
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

/* ปรับเฉพาะปุ่มไม่ให้ยืดเต็มบรรทัด */
.btnchange {
  min-width: auto !important;
  width: auto !important;
  padding: 4px 12px;
  font-size: 14px;
  background-color: #000;
  color: white;
  border-radius: 10px;
}
.btnAddProgram {
  background-color: #ffffff;
  border-radius: 20px;
  height: 40px;
  width: 200px;
  font-size: 20px;
  display: flex;
  align-items: center;
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
.tight-checkbox ::v-deep(.q-checkbox__label) {
  margin-left: 4px !important; /* ลดจากค่าปกติ 8px หรือมากกว่า */
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
.remove-icon {
  max-width: 100%;
  text-align: right;
  cursor: pointer;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 25px;
}
.btn-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
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
.successDialog {
  background-color: white;
  max-width: 200px;
  max-height: 100px;
}

/* Media */
@media (max-width: 1880px) {
  .input-container {
    width: 530px;
    max-width: 100%;
  }
  .btn-container {
    justify-content: center !important;
    margin-left: 0 !important;
    width: 100%;
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
  .btn-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    gap: 10px;
  }
  .btn-label-empty {
    display: none !important;
  }
  .remove-icon {
    display: flex;
    flex-direction: row !important;
    justify-content: flex-end !important;
    align-items: center;
    margin-top: 10px;
    width: 100%;
  }

  .remove-icon > .q-icon {
    font-size: 30px;
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

  .btn-container {
    justify-content: center !important;
    margin-left: 0 !important;
    width: 100%;
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
  .remove-icon {
    display: flex;
    justify-content: flex-end;
    width: 100%;
    margin-left: auto;
    margin-top: 20px;
    padding-right: 5px;
  }
  .remove-icon > .q-icon {
    font-size: 30px;
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
.Font {
  color: #ffffff;
  font-size: 15px;
  font-weight: bold;
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
