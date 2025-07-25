<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppBreadcrumbs from 'src/components/AppBreadcrumbs.vue'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'
import { useRoute } from 'vue-router'

type CertificateCourse = {
  id: number
  certName: string
  hour: number
  link: string
  categoryActivity: string
}

const route = useRoute()
const id = Number(route.params.id)

const breadcrumbs = ref({
  previousPage: { title: 'รายการหัวข้อทั้งหมด', path: '/admin/CertificateTablePage' },
  currentPage: { title: 'รายละเอียดหัวข้อการอบรม', path: route.fullPath },
  icon: 'school',
})

const certificateCourses = ref<CertificateCourse[]>([
  {
    id: 1,
    certName: 'Ready to Work in 12 Hours',
    hour: 5,
    link: 'https://mooc.buu.ac.th/courses/course-v1:BUU+LU005+2022/about',
    categoryActivity: 'เตรียมความพร้อม',
  },
  {
    id: 2,
    certName: 'การสื่อสารภาษาอังกฤษพื้นฐานเพื่อการทำงาน (Basic Comunicative English for Work)',
    hour: 5,
    link: 'https://mooc.buu.ac.th/courses/course-v1:BUU+HUS0013+2024/about',
    categoryActivity: 'เตรียมความพร้อม',
  },
  {
    id: 3,
    certName: 'การประยุกต์ใช้ Generative AI ในการทำงาน',
    hour: 3,
    link: 'https://mooc.buu.ac.th/courses/course-v1:BUU+ICT002+2024/about',
    categoryActivity: 'เตรียมความพร้อม',
  },
  {
    id: 4,
    certName: 'ภาษาอังกฤษเพื่อการสื่อสาร | English for Communication',
    hour: 10,
    link: 'https://thaimooc.ac.th/courses/course-v1cmu000850/',
    categoryActivity: 'เตรียมความพร้อม',
  },
  {
    id: 5,
    certName: 'เทคนิคการจัดการความเครียด | Stress Management Techniques',
    hour: 10,
    link: 'https://thaimooc.ac.th/courses/course-v1cmu000980//',
    categoryActivity: 'เตรียมความพร้อม',
  },
  {
    id: 6,
    certName:
      'จิตวิทยาประยุกต์ในการทํางาน เพื่อความสำเร็จ ความสุข และความมั่งคั่ง | Applied Psychology to Work through Success Happiness and Wealth',
    hour: 10,
    link: 'https://thaimooc.ac.th/courses/course-v1cmu000960/',
    categoryActivity: 'เตรียมความพร้อม',
  },
  {
    id: 7,
    certName:
      'ทักษะการสื่อสารระหว่างบุคคลในการทํางาน (Interpersonal Communication Skillsin Workplace)',
    hour: 10,
    link: 'https://thaimooc.ac.th/courses/course-v1cmu001070/',
    categoryActivity: 'เตรียมความพร้อม',
  },
  {
    id: 8,
    certName: 'ง่าย สบาย กับการอธิบายกราฟเป็นภาษาอังกฤษ',
    hour: 5,
    link: 'https://thaimooc.ac.th/courses/course-v1cu001500/',
    categoryActivity: 'เตรียมความพร้อม',
  },
  {
    id: 9,
    certName: 'เทคนิคการนำเสนออย่างมีประสิทธิภาพ',
    hour: 10,
    link: 'https://thaimooc.ac.th/courses/course-v1cmu000840/',
    categoryActivity: 'เตรียมความพร้อม',
  },
  {
    id: 10,
    certName:
      'Data Visualization with Tableau Desktop (การสร้างภาพของข้อมูลด้วยโปรแกรม Tableau Desktop)',
    hour: 5,
    link: 'https://mooc.buu.ac.th/courses/course-v1:BUU+IF002+2024/about',
    categoryActivity: 'ทักษะทางวิชาการ',
  },
  {
    id: 11,
    certName:
      'การประยุกต์ใช้ Collaboration Tools ในการเพิ่มประสิทธิภาพในการทำงานและประสานงานภายในองค์กร',
    hour: 5,
    link: 'https://mooc.buu.ac.th/courses/course-v1:BUU+ICT001+2022/about',
    categoryActivity: 'ทักษะทางวิชาการ',
  },
  {
    id: 12,
    certName: 'พื้นฐาน Internet of Things (IoTs) | Basic Internet of Things (IoTs)',
    hour: 3,
    link: 'https://lms.thaimooc.org/courses/course-v1:HU+HU008+2019/about',
    categoryActivity: 'ทักษะทางวิชาการ',
  },
  {
    id: 13,
    certName: 'การออกแบบ Infographic | Infographic Design',
    hour: 6,
    link: 'https://lms.thaimooc.org/courses/course-v1:SWU+SWU011+2018/about',
    categoryActivity: 'ทักษะทางวิชาการ',
  },
  {
    id: 14,
    certName: 'การจัดการความรู้ | Knowledge Management',
    hour: 6,
    link: 'https://lms.thaimooc.org/courses/course-v1:CU+CU005+2017/about',
    categoryActivity: 'ทักษะทางวิชาการ',
  },
])

const submissionColumns = [
  { name: 'index', label: 'ลำดับ', field: 'index', align: 'left' as const },
  { name: 'date', label: 'วันที่อัปโหลด', field: 'date', align: 'left' as const },
  { name: 'studentCode', label: 'รหัสนิสิต', field: 'studentCode', align: 'left' as const },
  { name: 'studentName', label: 'ชื่อ-สกุล', field: 'studentName', align: 'left' as const },
  { name: 'major', label: 'สาขา', field: 'major', align: 'left' as const },
]

const submissionHistory = ref([
  {
    date: '27 ก.ค. 2568',
    studentCode: '61160030',
    studentName: 'นายชนะพล จงอยู่ดีไพศาล',
    major: 'CS',
  },
  {
    date: '27 ก.ค. 2568',
    studentCode: '61160011',
    studentName: 'นางสาวศศิธร รัตนกาญจน์',
    major: 'CS',
  },
  {
    date: '27 ก.ค. 2568',
    studentCode: '61160030',
    studentName: 'นายธนพล จงอุทัยไพศาล',
    major: 'CS',
  },
  {
    date: '27 ก.ค. 2568',
    studentCode: '61160031',
    studentName: 'นางสาวธนมล บุญช่วย',
    major: 'CS',
  },
  {
    date: '27 ก.ค. 2568',
    studentCode: '61160033',
    studentName: 'นายธันวา ดีศิริ',
    major: 'CS',
  },
  {
    date: '27 ก.ค. 2568',
    studentCode: '61160034',
    studentName: 'นายนนธวัช นิลสนธิ',
    major: 'CS',
  },
  {
    date: '27 ก.ค. 2568',
    studentCode: '61160035',
    studentName: 'นายปุณยวีร์ นามวงษ์',
    major: 'CS',
  },
  {
    date: '27 ก.ค. 2568',
    studentCode: '61160036',
    studentName: 'นายพลพล คุ้มไข่น้ำ',
    major: 'CS',
  },
])

const showFilterDialog1 = ref(false)
const filterCategories1 = ['major', 'year']

const isEditMode = ref(false)
const showCancelDialog = ref(false)

function enableEditMode() {
  isEditMode.value = true
}
function confirmCancel() {
  showCancelDialog.value = true
}

// สำหรับแก้ไขข้อมูลแบบ local
const localEditCert = ref({
  certName: '',
  link: '',
  hour: 0,
  categoryActivity: '',
})

watch(
  () => isEditMode.value,
  (val) => {
    if (val && cert) {
      localEditCert.value = {
        certName: cert.certName,
        link: cert.link,
        hour: cert.hour,
        categoryActivity: cert.categoryActivity,
      }
    }
  },
)

function saveChanges() {
  if (cert) {
    cert.certName = localEditCert.value.certName
    cert.link = localEditCert.value.link
    cert.hour = localEditCert.value.hour
    cert.categoryActivity = localEditCert.value.categoryActivity
  }
  isEditMode.value = false
}
function cancelEdit() {
  isEditMode.value = false
  // implement revert logic here if needed
}

const cert = certificateCourses.value.find((item) => item.id === id)

const certNameModel = computed({
  get: () => (isEditMode.value ? localEditCert.value.certName : (cert?.certName ?? '')),
  set: (val: string) => {
    if (isEditMode.value) localEditCert.value.certName = val
  },
})
const linkModel = computed({
  get: () => (isEditMode.value ? localEditCert.value.link : (cert?.link ?? '')),
  set: (val: string) => {
    if (isEditMode.value) localEditCert.value.link = val
  },
})
const categoryActivityModel = computed({
  get: () =>
    isEditMode.value ? localEditCert.value.categoryActivity : (cert?.categoryActivity ?? ''),
  set: (val: string) => {
    if (isEditMode.value) localEditCert.value.categoryActivity = val
  },
})
const hourModel = computed({
  get: () => (isEditMode.value ? localEditCert.value.hour : (cert?.hour ?? 0)),
  set: (val: number) => {
    if (isEditMode.value) localEditCert.value.hour = val
  },
})

const categoryOptions = [
  { label: 'เตรียมความพร้อม', value: 'เตรียมความพร้อม' },
  { label: 'ทักษะทางวิชาการ', value: 'ทักษะทางวิชาการ' },
]
</script>

<template>
  <div class="q-pa-md">
    <!-- Breadcrumbs -->
    <AppBreadcrumbs :breadcrumbs="breadcrumbs" />

    <div class="q-mx-lg">
      <div class="text-h6 q-mt-lg">ข้อมูลนิสิต</div>
      <q-card class="q-mt-md full-width" flat>
        <div v-if="cert" class="row q-col-gutter-md">
          <!-- แถวข้อมูลนิสิต -->
          <div class="col-12 row items-center q-pa-sm">
            <div class="col-1 text-right q-pr-md"><p class="q-my-none">ชื่อ :</p></div>
            <div class="col-10">
              <q-input
                v-model="certNameModel"
                :readonly="!isEditMode"
                :class="isEditMode ? 'editable' : 'readonly'"
                borderless
                dense
              />
            </div>
          </div>
          <div class="col-12 row items-center q-pa-sm">
            <div class="col-1 text-right q-pr-md">
              <p class="q-my-none">Link URL :</p>
            </div>

            <div class="col-10">
              <!-- โหมดแก้ไข -->
              <q-input
                v-if="isEditMode"
                v-model="linkModel"
                borderless
                dense
                placeholder="https://example.com"
              />

              <!-- โหมดอ่านอย่างเดียวแบบมีกรอบ + คลิกลิงก์ได้ -->
              <q-field v-else borderless dense readonly>
                <template #control>
                  <a :href="linkModel" target="_blank" rel="noopener" class="link-box">
                    {{ linkModel }}
                  </a>
                </template>
              </q-field>
            </div>
          </div>

          <div class="col-12 row items-center q-pa-sm">
            <div class="col-1 text-right q-pr-md"><p class="q-my-none">ประเภท :</p></div>

            <div class="col-4">
              <q-select
                v-if="isEditMode"
                v-model="categoryActivityModel"
                :options="categoryOptions"
                dense
                outlined
                emit-value
                map-options
              />
              <q-input
                v-else
                v-model="categoryActivityModel"
                readonly
                class="readonly"
                borderless
                dense
              />
            </div>
            <div class="col-2 text-right q-pr-md">
              <p class="q-my-none">จำนวนชั่วโมง :</p>
            </div>
            <div class="col-4">
              <q-input
                v-model="hourModel"
                :readonly="!isEditMode"
                :class="isEditMode ? 'editable' : 'readonly'"
                borderless
                dense
                type="number"
              />
            </div>
          </div>
        </div>
      </q-card>
    </div>

    <!-- ตารางประวัติ -->
    <div class="q-pa-md">
      <div class="header-container text-center">
        <div class="text-h6 q-mt-lg">ประวัติการส่งหัวข้อกิจกรรม</div>
        <div class="filter-container q-mt-sm">
          <FilterDialog
            v-model="showFilterDialog1"
            :categories="filterCategories1"
            class="q-mr-sm"
          />
        </div>
      </div>

      <q-table
        :columns="submissionColumns"
        :rows="submissionHistory"
        row-key="studentCode"
        bordered
        flat
        class="tableHisAct q-mt-md"
        :pagination="{ rowsPerPage: 10 }"
        no-data-label="ไม่พบข้อมูล"
      >
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="index" style="t">{{ props.rowIndex + 1 }}</q-td>
            <q-td key="date">{{ props.row.date }}</q-td>
            <q-td key="studentCode">{{ props.row.studentCode }}</q-td>
            <q-td key="studentName">{{ props.row.studentName }}</q-td>
            <q-td key="major">{{ props.row.major }}</q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
    <div class="q-mt-md q-pa-md text-right">
      <template v-if="!isEditMode">
        <q-btn label="แก้ไข" class="btnedit" unelevated rounded @click="enableEditMode" />
      </template>
      <template v-else>
        <q-btn label="ยกเลิก" class="btnreject q-mr-md" unelevated rounded @click="confirmCancel" />
        <q-btn label="บันทึก" class="btnconfirm" unelevated rounded @click="saveChanges" />
      </template>
    </div>

    <!-- Dialog -->
    <q-dialog v-model="showCancelDialog">
      <q-card>
        <q-card-section><div class="text-h6">ยืนยันการยกเลิก</div></q-card-section>
        <q-card-section
          >คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการแก้ไข?
          การเปลี่ยนแปลงทั้งหมดจะไม่ถูกบันทึก</q-card-section
        >
        <q-card-actions align="right">
          <q-btn flat label="ยกเลิก" class="btnreject q-mr-md" v-close-popup />
          <q-btn flat label="ยืนยัน" class="btnconfirm" @click="cancelEdit" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped>
.editable {
  background-color: white;
}
.q-input {
  border: 1px solid #757575;
  border-radius: 5px;
  padding-left: 10px;
}
.q-card {
  background-color: white;
  width: 600px;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
}
.negative-hours {
  color: #f03b2d;
}
.filter-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}
.q-input {
  border: 1px solid #757575;
  border-radius: 5px;
  padding-left: 10px;
}
.readonly {
  background-color: #e4e4e4;
  color: #757575;
}
.editable {
  background-color: white;
}
.tableHisAct {
  height: 340px;
}
.link-display {
  color: #1976d2;
  text-decoration: underline;
  cursor: pointer;
  word-break: break-all;
  transition: color 0.2s;
}
.link-display:hover {
  color: #0d47a1;
}
.link-box {
  width: 100%;
  display: block;
  padding: 8px;
  border: 1px solid;
  border-radius: 4px;
  color: black;
  text-decoration: none;
  transition: all 0.2s;
  word-break: break-all;
  background-color: #e4e4e4;
}

.link-box:hover {
  background-color: #f0f8ff;
  text-decoration: underline;
  cursor: pointer;
  color: #1976d2;
}
</style>
