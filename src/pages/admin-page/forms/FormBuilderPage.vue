<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="row justify-between items-center q-mb-md">
      <div class="texttitle">สร้างฟอร์มประเมิน</div>
      <div class="header-actions">
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
        <draggable
          v-model="formData.blocks"
          item-key="id"
          group="blocks"
          class="draggable-container"
          @start="onDragStart"
          @end="handleDragEnd"
        >
          <template #item="{ element: block, index }">
            <div v-if="block.type === 'session'" class="session-divider row items-center q-mb-lg">
              <div class="col">
                <q-separator />
              </div>
              <div class="text-center text-grey-7 q-px-md">Session {{ block.session }}</div>
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
                @click.stop="deleteSession(block.session)"
              />
            </div>

            <q-card
              v-else
              :key="block.id"
              :class="[
                'q-pa-md q-mb-md relative-position cursor-move',
                block.type === 'title' ? 'title-card' : 'question-card',
                { 'is-dragging': isDragging && draggedBlockId === block.id },
              ]"
            >
              <div v-if="block.type === 'title'">
                <div class="row justify-between items-start q-mb-sm">
                  <q-input
                    v-model="block.title"
                    placeholder="หัวข้อ"
                    dense
                    outlined
                    class="col-grow"
                  />
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
                  @update:model-value="formData.blocks[findBlockIndex(block.id)] = $event"
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
                      @update:model-value="
                        console.log('isRequired updated:', $event, 'for block:', block)
                      "
                    />
                  </div>
                </div>
              </div>
            </q-card>
          </template>
        </draggable>
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
      <q-btn round color="purple-7" icon="horizontal_split" size="15px" @click="addSessionDivider">
        <q-tooltip>แบ่ง Session</q-tooltip>
      </q-btn>
    </div>

    <!-- Preview Dialog -->
    <PreviewDialog v-model="showPreview" :form="formData" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch, onActivated } from 'vue'
import { useQuasar } from 'quasar'
import { useFormStore } from 'src/stores/forms'
import type { Form } from 'src/types/form'
import draggable from 'vuedraggable'
import { v4 as uuidv4 } from 'uuid'

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
const currentSession = ref(1)

function addSessionDivider() {
  const maxSession =
    formData.blocks.length > 0 ? Math.max(...formData.blocks.map((b) => b.session || 1)) : 1

  const newSession = maxSession + 1

  formData.blocks.push({
    type: 'session',
    session: newSession,
    id: uuidv4(),
    title: '',
    description: '',
    isRequired: false,
    sequence: formData.blocks.length + 1,
    choices: [],
    rows: [],
  })

  updateBlocks()
}
function addQuestion() {
  formData.blocks?.push({
    id: uuidv4(),
    title: '',
    type: 'short_answer',
    description: '',
    isRequired: false,
    session: currentSession.value,
    sequence: formData.blocks.length + 1,
    choices: [],
    rows: [],
  })
}

function addTitleCard() {
  formData.blocks?.push({
    id: uuidv4(),
    title: '',
    type: 'title',
    description: '',
    isRequired: false,
    session: currentSession.value,
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

  if (block.type === type.value) return

  const newBlock = {
    ...block,
    type: type.value,
    id: uuidv4(), 
  }

  // Initialize based on question type
  if (type.value === 'grid_multiple_choice' || type.value === 'grid_checkbox') {
    newBlock.choices = [
      { id: uuidv4(), title: 'Column 1', sequence: 1 },
      { id: uuidv4(), title: 'Column 2', sequence: 2 },
    ]
    newBlock.rows = [
      { id: uuidv4(), title: 'Row 1', sequence: 1 },
      { id: uuidv4(), title: 'Row 2', sequence: 2 },
    ]
  } else if (['checkbox', 'multiple_choice', 'dropdown'].includes(type.value)) {
    newBlock.choices = [
      { id: uuidv4(), title: 'Option 1', sequence: 1 },
      { id: uuidv4(), title: 'Option 2', sequence: 2 },
    ]
    newBlock.rows = []
  } else {
    newBlock.choices = []
    newBlock.rows = []
  }

  formData.blocks[index] = newBlock
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
    (route.params.formId as string | undefined), 
)
const isEdit = computed(() => !!formId.value) 

function buildPayload() {
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
    if (isEdit.value && formId.value) {
      const updated = await formStore.updateForm(formId.value, payload)
      if (!updated) throw new Error('Update failed')
    } else {
      const created = await formStore.createForm(payload)
      if (!created) throw new Error('Create failed')

    }
    await router.push('/Admin/Forms')
  } catch (err) {
    console.error(err)
  }
}

async function loadFormIfAny(id?: string) {
  if (!id) {
    return
  }
  const form = await formStore.fetchFormById(id)
  console.log('Loading form data:', form)
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

watch(formId, (newId, oldId) => {
  if (newId && newId !== oldId) void loadFormIfAny(newId)
})

onActivated(() => loadFormIfAny(formId.value))

function deleteSession(sessionNumber: number) {
  const start = formData.blocks.findIndex(
    (b) => b.type === 'session' && b.session === sessionNumber,
  )
  if (start === -1) return

  let end = formData.blocks.findIndex((b, i) => i > start && b.type === 'session')
  if (end === -1) end = formData.blocks.length

  formData.blocks.splice(start, end - start)

  for (const b of formData.blocks) {
    const s = b.session ?? 1
    if (s > sessionNumber) b.session = s - 1
  }

  formData.blocks.forEach((b, idx) => (b.sequence = idx + 1))

  const remainingSessions = formData.blocks
    .filter((b) => b.type === 'session')
    .map((b) => b.session ?? 1)

  const maxSession = remainingSessions.length > 0 ? Math.max(...remainingSessions) : 1
  if (currentSession.value > maxSession) currentSession.value = maxSession
}

function findBlockIndex(id: string) {
  return formData.blocks.findIndex((block) => block.id === id)
}

const isDragging = ref(false)
const draggedBlockId = ref<string | null>(null)

function onDragStart(blockId: string) {
  isDragging.value = true
  draggedBlockId.value = blockId
}

function updateBlocks() {
  let currentSession = 1

  formData.blocks.forEach((block, index) => {
    block.sequence = index + 1
    if (block.type === 'session') {
      currentSession = block.session
    } else {
      block.session = currentSession
    }
  })
}
function handleDragEnd() {
  isDragging.value = false
  draggedBlockId.value = null

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

.draggable-container {
  min-height: 100px;
}

.is-dragging {
  opacity: 0.8;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  transition:
    opacity 0.2s,
    transform 0.2s;
}

.cursor-move {
  cursor: move;
  user-select: none;
}

/* Add smooth transition for drag and drop */
.sortable-ghost {
  opacity: 0.5;
  background: #e0e0e0;
}

.sortable-chosen {
  cursor: grabbing;
}
</style>
