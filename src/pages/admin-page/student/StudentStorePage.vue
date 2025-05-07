<template>
    <q-page class="q-pa-md">
        <div class="q-mb-md">
            <div class="text-subtitle1 text-grey-8 flex items-center">
                <q-icon name="people" class="q-mr-sm" />
                <span>จัดการข้อมูลนิสิต &gt; <u>จัดเก็บข้อมูลนิสิต</u></span>
            </div>
            <div class="text-h4">จัดเก็บข้อมูลนิสิต</div>
        </div>

        <section class="q-mt-lg">
            <!--  ช่องค้นหา + ฟิลเตอร์ + ปุ่มเพิ่ม -->
            <div class="row justify-end items-center">
                <div class="row">
                    <q-input dense outlined v-model="search1" label="ค้นหา ชื่อนิสิต" class="q-mr-sm searchbox"
                        :style="{ boxShadow: 'none' }">
                        <template v-slot:append>
                            <q-icon name="search" />
                        </template>
                    </q-input>

                    <FilterDialog v-model="showFilterDialog1" :categories="filterCategories1" @apply="applyFilters"
                        class="q-mr-sm" />

                    <div>
                        <q-btn dense outlined icon="add" label="เพิ่มข้อมูล" class="btnadd" @click="openManageDialog">
                            <ManageStudentDialog ref="manageDialogRef" />
                        </q-btn>
                    </div>
                </div>
            </div>

            <!--  ตารางแสดงนิสิตพ้นสภาพ -->
            <q-table bordered flat :rows="filteredStudents" :columns="columns" row-key="code"
                class="q-mt-md customtable" :pagination="{ rowsPerPage: 10 }">
                <template v-slot:header="props">
                    <q-tr :props="props" class="sticky-header">
                        <q-th v-for="col in props.cols" :key="col.name" :props="props">
                            {{ col.label }}
                        </q-th>
                    </q-tr>
                </template>

                <template v-slot:body="props">
                    <q-tr :props="props">
                        <q-td key="index">{{ props.rowIndex + 1 }}</q-td>
                        <q-td key="code">{{ props.row.code }}</q-td>
                        <q-td key="name"
                            style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            {{ props.row.name }}
                        </q-td>
                        <q-td key="major">{{ props.row.major }}</q-td>
                        <q-td class="text-center" key="softskill">{{ props.row.softSkill }}/30</q-td>
                        <q-td class="text-center" key="hardskill">{{ props.row.hardSkill }}/12</q-td>
                        <q-td class="text-center">
                            <q-btn :label="getStatusLabel(props.row)" :class="getStatusClass(getStatusLabel(props.row))"
                                rounded unelevated />
                        </q-td>
                        <q-td class="q-gutter-x-sm">
                            <q-btn icon="info" padding="none" flat color="grey-8" @click="goToDetail(props.row.code)"
                                class="clickable-row" />
                        </q-td>
                    </q-tr>
                </template>
            </q-table>
        </section>

        <router-view />
    </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'
import ManageStudentDialog from './ManageStudentDialog.vue'
import { useStudentStore } from 'src/stores/student'

interface Student {
    id?: string
    code: string
    name: string
    email: string
    password: string
    status: number
    softSkill: number
    hardSkill: number
    major: string
}

const router = useRouter()
const studentStore = useStudentStore()

const search1 = ref('')
const showFilterDialog1 = ref(false)
const manageDialogRef = ref<InstanceType<typeof ManageStudentDialog> | null>(null)

const filterCategories1 = ref(['major', 'year', 'status'])

const filters = ref({
    major: [] as string[],
    year: [] as number[],
    status: [] as string[],
})

// โหลดข้อมูลนิสิต
onMounted(async () => {
    try {
        await studentStore.getStudents()
    } catch (err) {
        console.error('โหลดข้อมูลนิสิตล้มเหลว:', err)
    }
})

// ฟิลเตอร์ผู้ใช้
const applyFilters = (selectedFilters: typeof filters.value) => {
    filters.value = selectedFilters
}

const openManageDialog = async () => {
    await nextTick()
    if (manageDialogRef.value) {
        manageDialogRef.value.openDialog()
    }
    void router.push('/Admin/StudentManagement/StudentStorePage/ConfirmStudentDataPage')
}

const goToDetail = (code: string) => {
    void router.push(`/Admin/StudentManagement/StudentDetail/${code}`)
}

//  เงื่อนไขการกรองนิสิตพ้นสภาพ + เรียนครบ >= 4 ปี
const filteredStudents = computed(() => {
    const now = new Date().getFullYear() + 543 // ปี พ.ศ. ปัจจุบัน
    return (studentStore.students || []).filter(student => {
        const entranceYear = parseInt(student.code.substring(0, 2)) + 2500
        const isGraduated = entranceYear <= now - 4
        const isTerminated = student.status === 0 // สมมุติว่า 0 = พ้นสภาพ
        const matchesSearch = student.name.includes(search1.value)
        return isTerminated && isGraduated && matchesSearch
    })
})


const columns = [
    { name: 'index', label: 'ลำดับ', field: 'index', align: 'left' as const },
    { name: 'code', label: 'รหัสนิสิต', field: 'code', align: 'left' as const },
    { name: 'name', label: 'ชื่อ-สกุล', field: 'name', align: 'left' as const },
    { name: 'major', label: 'สาขา', field: 'major', align: 'left' as const },
    { name: 'softskill', label: 'ชั่วโมงเตรียมความพร้อม', field: 'softSkill', align: 'center' as const },
    { name: 'hardskill', label: 'ชั่วโมงทักษะทางวิชาการ', field: 'hardSkill', align: 'center' as const },
    { name: 'status', label: 'สถานะ', field: 'status', align: 'center' as const },
    { name: 'action', label: '', field: 'action', align: 'center' as const },
]

const getStatusLabel = (student: Student): string => {
    if (student.status === 0) return 'พ้นสภาพ'
    if (student.softSkill >= 30 && student.hardSkill >= 12) return 'ชั่วโมงครบแล้ว'
    if (student.softSkill >= 20 && student.hardSkill >= 8) return 'ชั่วโมงมาก'
    if (student.softSkill >= 10 && student.hardSkill >= 4) return 'ชั่วโมงน้อย'
    return 'ชั่วโมงน้อยมาก'
}

const getStatusClass = (status: string): string => {
    if (status === 'พ้นสภาพ') return 'status-terminated'
    if (status === 'ชั่วโมงมาก') return 'status-high'
    if (status === 'ชั่วโมงน้อย') return 'status-medium'
    if (status === 'ชั่วโมงครบแล้ว') return 'status-complete'
    if (status === 'ชั่วโมงน้อยมาก') return 'status-low'
    return ''
}
</script>

<style scoped>
.status-complete {
    background-color: #cfd7ff;
    color: #001780;
    border: 2px solid #002dff;
    padding: 3px 30px;
    width: 130px;
}

.status-high {
    background-color: #d0ffc5;
    color: #009812;
    border: 2px solid #00bb16;
    padding: 3px 30px;
    width: 130px;
}

.status-medium {
    background-color: #ffe7ba;
    color: #ff6f00;
    border: 2px solid #ffa500;
    padding: 3px 30px;
    width: 130px;
}

.status-low {
    background-color: #ffc5c5;
    color: #ff0000;
    border: 2px solid #f32323;
    padding: 3px 30px;
    width: 130px;
}

.status-terminated {
    background-color: #e0e0e0;
    color: #5f5f5f;
    border: 2px solid #b0b0b0;
    padding: 3px 30px;
    width: 130px;
}

.clickable-row {
    cursor: pointer;
    transition: background-color 0.2s;
}

.clickable-row:hover {
    background-color: #f5f5f5;
}
</style>