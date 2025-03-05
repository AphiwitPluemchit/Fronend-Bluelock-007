<template>
  <div class="q-pa-md">
    <!-- Breadcrumbs -->
    <div><AppBreadcrumbs :breadcrumbs="breadcrumbs" /></div>

    <div class="q-mx-lg">
      <div class="text-h6">ข้อมูลนิสิต</div>
      <q-card flat bordered class="q-pa-md">
        <div class="row q-col-gutter-md">
          <!-- แถวที่ 1 -->
          <div class="col-6">
            <q-input label="ชื่อ" v-model="student.name" outlined dense readonly />
          </div>
          <div class="col-6">
            <q-input label="Email" v-model="student.email" outlined dense readonly />
          </div>

          <!-- แถวที่ 2 -->
          <div class="col-6">
            <q-input label="รหัสนิสิต" v-model="student.id" outlined dense readonly />
          </div>
          <div class="col-6">
            <q-input label="ชั้นปี" v-model="student.year" outlined dense readonly />
          </div>

          <!-- แถวที่ 3 -->
          <div class="col-6">
            <q-input label="สาขา" v-model="student.major" outlined dense readonly />
          </div>
          <div class="col-6">
            <q-input label="ชั่วโมงเตรียมความพร้อม" v-model="student.prepHours" outlined dense readonly />
          </div>

          <!-- แถวที่ 4 -->
          <div class="col-6">
            <q-input label="ชั่วโมงทักษะทางวิชาการ" v-model="student.academicHours" outlined dense readonly />
          </div>
          <div class="col-6"></div> <!-- เว้นช่องให้จัดเรียงสวยขึ้น -->
        </div>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import AppBreadcrumbs from "src/components/AppBreadcrumbs.vue";

const route = useRoute();
const id = computed(() => route.params.id);
console.log(id);

const breadcrumbs = ref({
  previousPage: { title: "จัดการข้อมูลนิสิต", path: "/StudentManagement" },
  currentPage: { title: "รายละเอียดนิสิต", path: `/StudentManagement/StudentDetail/` },
  icon: "description",
});

const student = ref({
  name: "ศิขรัช จิตอนงค์",
  id: "65160305",
  email: "65160305@go.buu.ac.th",
  year: 4,
  major: "CS",
  prepHours: 3,
  academicHours: 13,
});
</script>
