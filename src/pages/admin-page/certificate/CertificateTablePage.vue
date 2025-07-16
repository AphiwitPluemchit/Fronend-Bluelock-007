<script setup lang="ts">
import { ref } from 'vue'
import type { QTableProps } from 'quasar'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'

const search1 = ref('')
const showFilterDialog1 = ref(false)
const filterCategories1 = ref(['categoryActivity'])

interface CertificateCourse {
  id: number
  certName: string
  hour: number
  link: string
  categoryActivity: 'ทักษะทางวิชาการ' | 'เตรียมความพร้อม'
}

const columns: QTableProps['columns'] = [
  { name: 'id', label: 'ที่', field: 'id', align: 'left' },
  { name: 'certName', label: 'ชื่อหัวข้อการอบรม', field: 'certName', align: 'left' },
  { name: 'hour', label: 'ชั่วโมง', field: 'hour', align: 'center' },
  { name: 'link', label: 'Link สมัครเรียน (Short URL)', field: 'link', align: 'left' },
  {
    name: 'categoryActivity',
    label: 'เก็บชั่วโมงในหมวด',
    field: 'categoryActivity',
    align: 'center',
  },
  { name: 'action', label: '', field: 'action', align: 'left' },
]

const rows = ref<CertificateCourse[]>([
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

function getcategoryCourse(row: CertificateCourse) {
  return row.categoryActivity === 'เตรียมความพร้อม' ? 'hard-skill' : 'soft-skill'
}
</script>

<template>
  <q-page class="q-pa-md">
    <!-- ชื่อหน้า -->
    <div class="row justify-between items-center q-mb-md" style="margin-top: 20px">
      <div class="texttitle">หัวข้ออบรมออนไลน์สำหรับการเก็บชั่วโมงสหกิจศึกษา</div>
      <!-- ปุ่มเพื่อการเพิ่มข้อมูล -->
      <q-btn dense outlined label="เพิ่มหัวข้อการอบรม" class="btnadd" bo />
    </div>

    <!-- แถวค้นหาและไอคอน -->
    <section class="q-mt-lg">
      <div class="row justify-end items-center">
        <div class="row">
          <q-input
            dense
            outlined
            v-model="search1"
            label="ค้นหา ชื่อ"
            class="q-mr-sm searchbox"
            :style="{ boxShadow: 'none', border: 'none' }"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <FilterDialog
            v-model="showFilterDialog1"
            :categories="filterCategories1"
            class="q-mr-sm"
          />
        </div>
      </div>

      <!-- ตาราง -->
      <q-table
        bordered
        flat
        :rows="rows"
        :columns="columns"
        row-key="id"
        class="q-mt-md customtable"
        :pagination="{ rowsPerPage: 10 }"
      >
        <!-- Header Sticky -->
        <template v-slot:header="props">
          <q-tr :props="props" class="sticky-header">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <!-- Body -->
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="id">{{ props.row.id }}</q-td>

            <q-td
              key="certName"
              style="
                max-width: 350px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              "
            >
              {{ props.row.certName }}
            </q-td>

            <q-td key="hour" class="text-center">{{ props.row.hour }}</q-td>

            <q-td key="link">
              <a :href="props.row.link" target="_blank" class="text-primary">
                {{ props.row.link }}
              </a>
            </q-td>

            <q-td key="categoryActivity" class="text-center">
              <q-badge
                :label="props.row.categoryActivity"
                class="status-badge"
                :class="getcategoryCourse(props.row)"
              />
            </q-td>

            <q-td key="action" class="text-center q-gutter-x-sm">
              <q-icon
                clickable
                name="edit"
                class="bg-primary text-white q-pa-xs rounded-borders q-mr-sm"
              >
                <q-tooltip>แก้ไข</q-tooltip>
              </q-icon>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </section>
  </q-page>
</template>

<style scoped>
.hard-skill {
  color: #001780;
  border: 1px solid #002dff;
  background-color: #cfd7ff;
}

.soft-skill {
  color: #009812;
  border: 1px solid #00bb16;
  background-color: #d2ffc7;
}

.category-badge {
  padding: 1px 10px;
  font-size: 14px;
  border-radius: 20px;
}
.status-badge {
  height: 32px;
  line-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  text-align: center;
  display: inline-block;
  font-size: 15px;
}
.bg-yellow-light {
  background-color: #fff8e1;
}

.bg-blue-light {
  background-color: #e1f5fe;
}

.my-table td,
.my-table th {
  vertical-align: middle;
  font-size: 14px;
  line-height: 1.4;
  padding: 12px;
}
</style>
