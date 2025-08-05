<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="row justify-between items-center q-mb-md">
      <div class="texttitle">สร้างฟอร์มประเมิน</div>
      <div class="header-actions">
        <q-btn
          color="secondary"
          label="Preview"
          icon="visibility"
          @click="showPreview = true"
          :disable="!formData.title || formData.blocks?.length === 0"
          class="q-mr-md"
        />
        <q-btn
          color="primary"
          label="Save"
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
        <q-card
          v-for="(block, index) in formData.blocks"
          :key="index"
          :class="['q-pa-md q-mb-md', block.type === 'title' ? 'title-card' : 'question-card']"
        >
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
              v-for="(block, i) in formData.blocks"
              :key="block.id || i"
              :is="getComponent(block.type)"
              :model-value="block"
              @update:model-value="formData.blocks[i] = $event"
            />
          </div>
        </q-card>
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
    </div>

    <!-- Preview Dialog -->
    <!-- <PreviewDialog v-model="showPreview" :form="formData" /> -->
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { useFormStore } from 'src/stores/forms'
import type { Form } from 'src/types/form'

import QuestionTypeMenu from './QuestionFormat/QuestionTypeMenu.vue'
// Components
// import PreviewDialog from './PreviewDialog.vue'
import ShortAnswer from './QuestionFormat/ShortAnswer.vue'
import CheckboxesMenu from './QuestionFormat/CheckboxesMenu.vue'
import MutipleChoice from './QuestionFormat/MutipleChoice.vue'
import DropdownMenu from './QuestionFormat/DropdownMenu.vue'
import ParagraphMenu from './QuestionFormat/ParagraphMenu.vue'
import RatingMenu from './QuestionFormat/RatingMenu.vue'
import MultipleChoicegridMenu from './QuestionFormat/MultipleChoicegridMenu.vue'
import CheckboxGridMenu from './QuestionFormat/CheckboxGridMenu.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showPreview = ref(false)
const $q = useQuasar()
const formStore = useFormStore()

const formData = reactive<Form>({
  title: '',
  description: '',
  activityId: '',
  isOrigin: true,
  blocks: [],
})

function addQuestion() {
  formData.blocks?.push({
    title: '',
    type: 'short_answer',
    description: '',
    isRequired: false,
    session: 1,
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
    session: 1,
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

async function saveForm() {
  try {
    const blocks = formData.blocks.map((block, index) => ({
      title: block.title,
      type: block.type,
      description: block.description || '',
      isRequired: block.isRequired,
      session: block.session ?? 1,
      sequence: index + 1,
      choices:
        block.choices?.map((c, i) => ({
          title: typeof c === 'string' ? c : c.title,
          sequence: i + 1,
        })) ?? [],
      rows:
        block.rows?.map((r, i) => ({
          title: typeof r === 'string' ? r : r.title,
          sequence: i + 1,
        })) ?? [],
    }))

    await formStore.createForm({
      title: formData.title,
      description: formData.description,
      activityId: formData.activityId,
      isOrigin: true,
      blocks,
    })

    $q.notify({ type: 'positive', message: 'ฟอร์มถูกบันทึกแล้ว!' })
    await router.push('/forms')
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'เกิดข้อผิดพลาดในการบันทึกฟอร์ม' })
  }
}
</script>

<style scoped>
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
