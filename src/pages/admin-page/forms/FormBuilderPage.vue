<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="row justify-between items-center q-mb-md">
      <div class="texttitle">สร้างฟอร์มประเมิน</div>
      <div class="header-actions">
        <q-btn
          color="primary"
          label="Export"
          icon="download"
          @click="exportToXlsx"
          :disable="!formData.title || formData.blocks?.length === 0"
          class="q-mr-md export-btn"
        />

        <q-btn
          color="secondary"
          label="ดูตัวอย่าง"
          icon="visibility"
          @click="showPreview = true"
          :disable="!formData.title || formData.blocks?.length === 0"
          class="q-mr-md preview-btn"
        />
        <q-btn
          class="btnconfirm"
          label="บันทึก"
          icon="save"
          @click="saveForm"
          :disable="!formData.title || formData.blocks?.length === 0"
        />
      </div>
    </div>
    <!-- Form Title / Description -->
    <div class="justify-center">
      <q-card class="header-card q-mx-auto">
        <q-card-section>
          <q-input v-model="formData.title" placeholder="Form Title" class="q-mb-md" />
          <q-input v-model="formData.description" placeholder="Form Description" />
        </q-card-section>
      </q-card>
    </div>

    <!-- คำถามทั้งหมด -->
    <div class="flex justify-center q-mt-md">
      <div style="width: 1000px">
        <template v-for="(block, index) in formData.blocks" :key="index">
          <div v-if="block.type === 'session'" class="session-divider row items-center q-mb-lg">
            <div class="col">
              <q-separator />
            </div>
            <div class="text-center text-grey-7 q-px-md">
              Session {{ block.session }}
            </div>
            <div class="col">
              <q-separator />
            </div>
            <q-btn
              flat
              round
              dense
              icon="close"
              size="sm"
              class="q-ml-sm"
              @click="deleteSession(block.session)"
            />
          </div>
          <q-card v-else :class="['q-pa-md q-mb-md', block.type === 'title' ? 'title-card' : 'question-card']">
            <div v-if="block.type === 'title'">
              <div class="row justify-between items-start q-mb-sm">
                <q-input v-model="block.title" placeholder="หัวข้อ" dense outlined class="col-grow" />
                <div class="q-gutter-sm q-ml-sm">
                  <q-btn
                    flat
                    round
                    dense
                    icon="content_copy"
                    class="bg-blue text-white q-pa-xs rounded-borders"
                    @click="copyBlock(index)"
                  />
                  <q-btn
                    flat
                    round
                    dense
                    icon="delete"
                    class="bg-red text-white q-pa-xs rounded-borders"
                    @click="removeBlock(index)"
                  />
                </div>
              </div>
              <q-input
                v-model="block.description"
                placeholder="คำอธิบายเพิ่มเติม (ไม่จำเป็น)"
                dense
                outlined
              />
            </div>

            <div v-else>
              <div class="row items-start q-gutter-md q-mb-md">
                <q-input
                  v-model="block.title"
                  placeholder="คำถาม"
                  outlined
                  dense
                  style="max-width: 610px; width: 100%"
                />
                <q-btn
                  outline
                  :icon="getIcon(block.type)"
                  :label="getLabel(block.type)"
                  style="border-radius: 8px; max-width: 230px; width: 100%"
                >
                  <q-menu>
                    <QuestionTypeMenu @selected="(type) => onTypeSelected(index, type)" />
                  </q-menu>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  icon="content_copy"
                  class="bg-blue text-white q-pa-xs rounded-borders"
                  @click="copyBlock(index)"
                />
                <q-btn
                  icon="delete"
                  flat
                  round
                  dense
                  class="bg-red text-white q-pa-xs rounded-borders"
                  @click="removeBlock(index)"
                />
              </div>

              <component
                flat
                :is="getComponent(block.type)"
                :model-value="block"
                @update:model-value="formData.blocks[index] = $event"
              />
              
              <q-separator spaced />

              <!-- Footer -->
              <div class="row justify-between items-center">
                <div class="row items-center q-gutter-sm">
                  <q-toggle
                    v-model="block.isRequired"
                    label="Required"
                    left-label
                    dense
                    @update:model-value="console.log('isRequired updated:', $event, 'for block:', block)"
                  />
                </div>
              </div>
            </div>  
          </q-card>
        </template>
      </div>
    </div>

    <!-- ปุ่มลอยด้านขวา -->
    <div class="floating-sidebar">
      <q-btn round color="primary" icon="add" size="15px" @click="addQuestion">
        <q-tooltip>เพิ่มคำถาม</q-tooltip>
      </q-btn>
      <q-btn round color="grey-7" icon="title" size="15px" @click="addTitleCard">
        <q-tooltip>เพิ่มหัวข้อ</q-tooltip>
      </q-btn>
      <q-btn round color="purple-7" icon="horizontal_split" size="15px"  @click="addSessionDivider">
        <q-tooltip>แบ่ง Session</q-tooltip>
      </q-btn>
    </div>

    <!-- Preview Dialog -->
    <PreviewDialog v-model="showPreview" :form="formData" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch, onActivated } from 'vue'
import { useQuasar  } from 'quasar'
import * as XLSX from 'xlsx'
import dayjs from 'dayjs'
import { useFormStore } from 'src/stores/forms'
import type { Form } from 'src/types/form'

import QuestionTypeMenu from './QuestionFormat/QuestionTypeMenu.vue'
// Components
import PreviewDialog from './PreviewDialog.vue'
import ShortAnswer from './QuestionFormat/ShortAnswer.vue'
import CheckboxesMenu from './QuestionFormat/CheckboxesMenu.vue'
import MutipleChoice from './QuestionFormat/MutipleChoice.vue'
import DropdownMenu from './QuestionFormat/DropdownMenu.vue'
import ParagraphMenu from './QuestionFormat/ParagraphMenu.vue'
import RatingMenu from './QuestionFormat/RatingMenu.vue'
import MultipleChoicegridMenu from './QuestionFormat/MultipleChoicegridMenu.vue'
import CheckboxGridMenu from './QuestionFormat/CheckboxGridMenu.vue'
import { useRouter, useRoute } from 'vue-router'

// ใช่สำหรับ export ให้ excel
interface ExportRow {
  Title: string
  Type: string
  Description: string
  IsRequired: string // "yes"/"no"
  Session: number
  Choices: string    // คั่นด้วย ;
  Rows: string       // คั่นด้วย ;
}
interface OptionRow {
  title: string
  sequence: number
}
function exportToXlsx() {
  // แปลง blocks -> rows
  const rows: ExportRow[] = (formData.blocks ?? []).map((b) => {
    // แปลง boolean เป็นข้อความ
    const isReq = b.isRequired ? 'yes' : 'no'

    // choices และ rows รองรับทั้ง string[] และ {title:string}[]
    const toTitles = (list?: OptionRow[]): string =>
  (list ?? [])
    .map(it => it.title)
    .filter(t => t.trim().length > 0)
    .join(';')
    
    const choices = toTitles(b.choices)
    const rowsStr = toTitles(b.rows)

    return {
      Title: b.title ?? '',
      Type: b.type ?? 'short_answer',
      Description: b.description ?? '',
      IsRequired: isReq,
      Session: Number(b.session ?? 1),
      Choices: choices,
      Rows: rowsStr,
    }
  })

  if (rows.length === 0) {
    $q.notify({ type: 'warning', message: 'ยังไม่มีบล็อกคำถามให้ส่งออก' })
    return
  }

  // สร้าง worksheet และ workbook
  const ws = XLSX.utils.json_to_sheet(rows, {
    header: ['Title', 'Type', 'Description', 'IsRequired', 'Session', 'Choices', 'Rows'],
    skipHeader: false,
  })
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Form')

  // ตั้งชื่อไฟล์: <Title>-yyyyMMDD-HHmm.xlsx (fallback เป็น Form)
  const safeTitle = (formData.title || 'Form').replace(/[\\/:*?"<>|]/g, '_').slice(0, 80)
  const ts = dayjs().format('YYYYMMDD-HHmm')
  const filename = `${safeTitle}-${ts}.xlsx`

  // บันทึกไฟล์
  XLSX.writeFile(wb, filename)

  $q.notify({ type: 'positive', message: `ส่งออกไฟล์ ${filename} สำเร็จ` })
}

const route = useRoute()
const router = useRouter()
const showPreview = ref(false)
const $q = useQuasar()
const formStore = useFormStore()

const formData = reactive<Form>({
  title: '',
  description: '',
  isOrigin: true,
  blocks: [],
})
const currentSession = ref(1) // Track current session number

// Add this new function
function addSessionDivider() {
  currentSession.value++
  formData.blocks.push({
    type: 'session',
    session: currentSession.value,
    id: Date.now().toString(),
    title: '',
    description: '',
    isRequired: false,
    sequence: formData.blocks.length + 1,
    choices: [],
    rows: []
  })
}
function addQuestion() {
  formData.blocks?.push({
    title: '',
    type: 'short_answer',
    description: '',
    isRequired: false,
    session:  currentSession.value,
    sequence: formData.blocks.length + 1,
    choices: [],
    rows: [],
  })
}

function addTitleCard() {
  formData.blocks?.push({
    title: '',
    type: 'title',
    description: '',
    isRequired: false,
    session:  currentSession.value,
    sequence: formData.blocks.length + 1,
    choices: [],
    rows: [],
  })
}
function removeBlock(index: number) {
  formData.blocks?.splice(index, 1)
}

function onTypeSelected(index: number, type: { label: string; value: string; icon: string }) {
  const block = formData.blocks?.[index]
  if (!block) return
  block.type = type.value
  if (['checkbox', 'multiple_choice', 'dropdown'].includes(type.value)) {
    block.choices = [
      { title: 'Option 1', sequence: 1 },
      { title: 'Option 2', sequence: 2 },
    ]
  } else {
    block.choices = []
  }
}
function copyBlock(index: number) {
  const original = formData.blocks?.[index]
  if (!original) return

  const copied = JSON.parse(JSON.stringify(original))
  formData.blocks?.splice(index + 1, 0, copied)
}

function getComponent(type: string) {
  switch (type) {
    case 'short_answer':
      return ShortAnswer
    case 'checkbox':
      return CheckboxesMenu
    case 'multiple_choice':
      return MutipleChoice
    case 'dropdown':
      return DropdownMenu
    case 'paragraph':
      return ParagraphMenu
    case 'rating':
      return RatingMenu
    case 'grid_multiple_choice':
      return MultipleChoicegridMenu
    case 'grid_checkbox':
      return CheckboxGridMenu
    default:
      return ShortAnswer
  }
}

function getIcon(type: string) {
  switch (type) {
    case 'short_answer':
      return 'short_text'
    case 'paragraph':
      return 'subject'
    case 'checkbox':
      return 'check_box'
    case 'multiple_choice':
      return 'radio_button_checked'
    case 'dropdown':
      return 'arrow_drop_down_circle'
    case 'rating':
      return 'star'
    case 'grid_multiple_choice':
    case 'grid_checkbox':
      return 'grid_view'
    default:
      return 'short_text'
  }
}

function getLabel(type: string) {
  switch (type) {
    case 'short_answer':
      return 'Short answer'
    case 'paragraph':
      return 'Paragraph'
    case 'checkbox':
      return 'Checkboxes'
    case 'multiple_choice':
      return 'Multiple choice'
    case 'dropdown':
      return 'Dropdown'
    case 'rating':
      return 'Rating'
    case 'grid_multiple_choice':
      return 'Multiple choice grid'
    case 'grid_checkbox':
      return 'Checkbox grid'
    default:
      return 'Short answer'
  }
}

const formId = computed<string | undefined>(
  () =>
    (route.query.id as string | undefined) ||
    (route.params.id as string | undefined) ||
    (route.params.formId as string | undefined), // ถ้าเคยตั้งชื่อ param ว่า formId
)
const isEdit = computed(() => !!formId.value) // มี id = โหมดแก้ไข

function buildPayload() {
  // รวม logic จัด shape ให้ backend ทีเดียว
  const blocks = formData.blocks.map((block, index) => ({
    title: block.title,
    type: block.type,
    description: block.description || '',
    isRequired: !!block.isRequired,
    session: block.session ?? 1,
    sequence: index + 1,
    choices: (block.choices ?? []).map((c, i) => ({
      title: typeof c === 'string' ? c : c.title,
      sequence: i + 1,
    })),
    rows: (block.rows ?? []).map((r, i) => ({
      title: typeof r === 'string' ? r : r.title,
      sequence: i + 1,
    })),
  }))

  return {
    title: formData.title,
    description: formData.description,
    isOrigin: true,
    blocks,
  }
}

async function saveForm() {
  try {
    const payload = buildPayload()
    console.log('Saving form with data:', payload);
    if (isEdit.value && formId.value) {
      // UPDATE
      const updated = await formStore.updateForm(formId.value, payload)
      if (!updated) throw new Error('Update failed')
      $q.notify({ type: 'positive', message: 'อัปเดตฟอร์มเรียบร้อยแล้ว' })
    } else {
      const created = await formStore.createForm(payload)
      if (!created) throw new Error('Create failed')
      $q.notify({ type: 'positive', message: 'ฟอร์มถูกบันทึกแล้ว!' })
    }
    await router.push('/Admin/Forms')
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'เกิดข้อผิดพลาดในการบันทึกฟอร์ม' })
  }
}

async function loadFormIfAny(id?: string) {
  if (!id) {
    console.log('[Builder] create mode (no id)')
    return
  }
  const form = await formStore.fetchFormById(id)
  console.log('Loading form data:', form);
  if (form) {
    formData.title = form.title
    formData.description = form.description
    formData.isOrigin = form.isOrigin
    formData.blocks = JSON.parse(JSON.stringify(form.blocks || []))
  } else {
    $q.notify({ type: 'negative', message: 'ไม่พบฟอร์มที่ต้องการแก้ไข' })
  }
}

onMounted(() => loadFormIfAny(formId.value))

// กรณีเปลี่ยน id ระหว่างอยู่หน้าเดิม
watch(formId, (newId, oldId) => {
  if (newId && newId !== oldId) void loadFormIfAny(newId)
})

onActivated(() => loadFormIfAny(formId.value))

function deleteSession(sessionNumber: number) {
  const sessionIndex = formData.blocks.findIndex(b => b.type === 'session' && b.session === sessionNumber);
  if (sessionIndex === -1) return;

  let nextSessionIndex = formData.blocks.findIndex((b, i) => 
    i > sessionIndex && b.type === 'session');
  
  if (nextSessionIndex === -1) {
    nextSessionIndex = formData.blocks.length;
  }

  formData.blocks.splice(sessionIndex, nextSessionIndex - sessionIndex);

  formData.blocks.forEach(block => {
    if (block.type === 'session' && block.session > sessionNumber) {
      block.session--;
    }
  });

  if (currentSession.value >= sessionNumber) {
    currentSession.value--;
  }
}
</script>

<style scoped>
.session-divider {
  display: flex;
  align-items: center;
  margin: 40px 0;
  color: #666;
}
.export-btn {
  height: 40px;
  min-width: 70px;
  border-radius: 10px;
}
.preview-btn {
  height: 40px;
  min-width: 70px;
  border-radius: 10px;
}
.header-card {
  max-width: 1000px;
  width: 100%;
  height: 150px;
  border-radius: 15px;
  border: 1px solid #e0e0e0;
}
.title-card {
  max-width: 1000px;
  width: 100%;
  border-radius: 15px;
  border: 1px solid #e0e0e0;
}
.floating-sidebar {
  position: fixed;
  top: 180px;
  right: 30px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 1000;
}

.question-card {
  max-width: 1000px;
  width: 100%;
  border-radius: 15px;
  border: 1px solid #e0e0e0;
}
</style>
