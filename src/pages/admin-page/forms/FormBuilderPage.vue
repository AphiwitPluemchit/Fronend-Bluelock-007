<!-- eslint-disable @typescript-eslint/no-unused-vars -->
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
          :disable="!formData.title || formData.formElements.length === 0"
          class="q-mr-md"
        />
        <q-btn
          color="primary"
          label="Save"
          icon="save"
          @click="saveForm"
          :disable="!formData.title || formData.formElements.length === 0"
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
          v-for="(q, index) in formData.formElements"
          :key="index"
          :class="['q-pa-md q-mb-md', isTitleCard(q) ? 'title-card' : 'question-card']"
        >
          <!-- ✅ ถ้าเป็น title card -->
          <div v-if="isTitleCard(q)">
            <!-- 🔹 Row: Title input + action icons -->
            <div class="row justify-between items-start q-mb-sm">
              <q-input
                v-model="q.titleCard.title"
                placeholder="Untitled Title"
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
                  @click="copyQuestion(index)"
                />
                <q-btn
                  flat
                  round
                  dense
                  icon="delete"
                  @click="removeQuestion(index)"
                  class="bg-red text-white q-pa-xs rounded-borders"
                />
                <q-btn
                  flat
                  round
                  dense
                  icon="more_vert"
                  class="bg-amber-8 text-white q-pa-xs rounded-borders"
                >
                  <q-menu>
                    <q-list>
                      <q-item>
                        <q-item-section>Show</q-item-section>
                      </q-item>
                      <q-item tag="label" clickable>
                        <q-item-section side>
                          <q-checkbox v-model="q.titleCard.showDescription" color="primary" dense />
                        </q-item-section>
                        <q-item-section>Description</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>
            </div>

            <!-- 🔸 Description input -->
            <q-input
              v-if="q.titleCard.showDescription"
              v-model="q.titleCard.description"
              placeholder="Description (optional)"
              dense
              outlined
            />
          </div>

          <!-- ✅ ถ้าเป็นคำถามทั่วไป -->
          <div v-else-if="q.question">
            <div class="row items-start q-gutter-md q-mb-md">
              <q-input
                v-model="q.question.questionText"
                placeholder="Question"
                outlined
                dense
                style="max-width: 610px; width: 100%"
              />
              <q-btn
                outline
                :icon="getIcon(q.question.type)"
                :label="getLabel(q.question.type)"
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
                @click="copyQuestion(index)"
              />
              <q-btn
                icon="delete"
                flat
                round
                dense
                @click="removeQuestion(index)"
                class="bg-red text-white q-pa-xs rounded-borders"
              />
            </div>

            <template v-for="(q, index) in formData.formElements" :key="index">
              <component
                v-if="isQuestionElement(q)"
                :is="getComponent(q.question.type)"
                v-model="q.question"
                flat
              />
            </template>
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
    <PreviewDialog v-model="showPreview" :form="formData" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { useFormStore } from 'src/stores/forms'
import type { QuestionType, Question, TitleCard, FormElement, Form } from 'src/types/form'

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
import { useRouter } from 'vue-router'

const router = useRouter()
const showPreview = ref(false)
const $q = useQuasar()
const formStore = useFormStore()

const formData = reactive<Form>({
  title: '',
  description: '',
  formElements: [],
})

function addQuestion() {

  formData.formElements.push({
  question: {
    type: 'short_answer',
    questionText: '',
    isRequired: false,
    choices: [],
    rows: [],
    columns: [],
  },
  order: formData.formElements.length,
})

}

function addTitleCard() {
  formData.formElements.push({
  titleCard: {
    title: '',
    description: '',
    showDescription: true,
  },
  order: formData.formElements.length,
})
}

function isTitleCard(el: FormElement): el is FormElement & { titleCard: TitleCard } {
  return !!el.titleCard
}
function isQuestionElement(el: FormElement): el is FormElement & { question: Question } {
  return !!el.question
}
function removeQuestion(index: number) {
  formData.formElements.splice(index, 1)
}

function onTypeSelected(index: number, type: { label: string; value: QuestionType; icon: string }) {
  const q = formData.formElements[index]
  if (!q || !q.question) return

  q.question.type = type.value

  if (['checkbox', 'multiple_choice', 'dropdown'].includes(type.value)) {
    q.question.choices = ['Option 1', 'Option 2']
  } else {
    q.question.choices = []
  }
}

function copyQuestion(index: number) {
  const original = formData.formElements[index]
  if (!original) return

  const copied = JSON.parse(JSON.stringify(original))
  formData.formElements.splice(index + 1, 0, copied)
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

function getIcon(type: QuestionType) {
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

function getLabel(type: QuestionType) {
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
    
    await formStore.create({
      title: formData.title,
      description: formData.description,
      formElements: formData.formElements,
    })
    console.log(formData)
    $q.notify({ type: 'positive', message: 'ฟอร์มถูกบันทึกแล้ว!' })
    await router.push('/forms') // เปลี่ยนเส้นทางตามต้องการ
  } catch (err) {
    console.log(err)
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
