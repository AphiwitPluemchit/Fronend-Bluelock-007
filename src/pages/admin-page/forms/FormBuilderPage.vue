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
          :disable="!formData.title || formData.questions.length === 0"
          class="q-mr-md"
        />
        <q-btn
          color="primary"
          label="Save"
          icon="save"
          @click="saveForm"
          :disable="!formData.title || formData.questions.length === 0"
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
          v-for="(q, index) in formData.questions"
          :key="index"
          :class="['q-pa-md q-mb-md', isTitleCard(q) ? 'title-card' : 'question-card']"
        >
          <!-- ✅ ถ้าเป็น title card -->
          <div v-if="isTitleCard(q)">
            <!-- 🔹 Row: Title input + action icons -->
            <div class="row justify-between items-start q-mb-sm">
              <q-input
                v-model="q.title"
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
                  color="grey"
                  @click="copyQuestion(index)"
                />
                <q-btn flat round dense icon="delete" @click="removeQuestion(index)" color="grey" />
                <q-btn flat round dense icon="more_vert" color="grey">
                  <q-menu>
                    <q-list>
                      <q-item>
                        <q-item-section>Show</q-item-section>
                      </q-item>
                      <q-item tag="label" clickable>
                        <q-item-section side>
                          <q-checkbox v-model="q.showDescription" color="primary" dense />
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
              v-if="q.showDescription"
              v-model="q.description"
              placeholder="Description (optional)"
              dense
              outlined
            />
          </div>

          <!-- ✅ ถ้าเป็นคำถามทั่วไป -->
          <div v-else>
            <div class="row items-start q-gutter-md q-mb-md">
              <q-input
                v-model="q.questionText"
                placeholder="Question"
                outlined
                dense
                style="max-width: 610px; width: 100%"
              />
              <q-btn
                outline
                :icon="getIcon(q.type)"
                :label="getLabel(q.type)"
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
                color="grey"
                @click="copyQuestion(index)"
              />
              <q-btn icon="delete" flat round dense color="grey" @click="removeQuestion(index)" />
            </div>

            <component
              v-if="formData.questions[index] && !('isTitleCard' in formData.questions[index])"
              :is="getComponent(q.type)"
              v-model="formData.questions[index]"
              flat
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
    <PreviewDialog v-model="showPreview" :form="formData" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useFormsStore } from 'src/stores/forms'
import type {
  CreateFormRequest,
  QuestionType,
  FormElement,
  TitleCard,
  Question,
} from 'src/types/form'
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

const router = useRouter()
const formsStore = useFormsStore()
const showPreview = ref(false)
const $q = useQuasar()

const formData = reactive<{
  title: string
  description: string
  questions: FormElement[]
}>({
  title: '',
  description: '',
  questions: [],
})

function addQuestion() {
  formData.questions.push({
    type: 'short_answer',
    questionText: '',
    isRequired: false,
    choices: [],
  })
}

function addTitleCard() {
  formData.questions.push({
    isTitleCard: true,
    title: '',
    description: '',
    showDescription: true,
  })
}
function isTitleCard(q: FormElement): q is TitleCard {
  return 'isTitleCard' in q
}
function removeQuestion(index: number) {
  formData.questions.splice(index, 1)
}

function onTypeSelected(index: number, type: { label: string; value: QuestionType; icon: string }) {
  const q = formData.questions[index]
  if (!q || 'isTitleCard' in q) return

  q.type = type.value
  if (['checkbox', 'multiple_choice', 'dropdown'].includes(type.value)) {
    q.choices = ['Option 1', 'Option 2']
  } else {
    q.choices = []
  }
}
function copyQuestion(index: number) {
  const original = formData.questions[index]
  if (!original) return

  const copied = JSON.parse(JSON.stringify(original))
  formData.questions.splice(index + 1, 0, copied)
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
    case 'short_answer': return 'short_text'
    case 'paragraph': return 'subject'
    case 'checkbox': return 'check_box'
    case 'multiple_choice': return 'radio_button_checked'
    case 'dropdown': return 'arrow_drop_down_circle'
    case 'rating': return 'star'
    case 'grid_multiple_choice':
    case 'grid_checkbox':
      return 'grid_view'
    default: return 'short_text'
  }
}

function getLabel(type: QuestionType) {
  switch (type) {
    case 'short_answer': return 'Short answer'
    case 'paragraph': return 'Paragraph'
    case 'checkbox': return 'Checkboxes'
    case 'multiple_choice': return 'Multiple choice'
    case 'dropdown': return 'Dropdown'
    case 'rating': return 'Rating'
    case 'grid_multiple_choice': return 'Multiple choice grid'
    case 'grid_checkbox': return 'Checkbox grid'
    default: return 'Short answer'
  }
}

const buildFormPayload = (): CreateFormRequest => {
  const questions = formData.questions
    .filter((q): q is Question => !('isTitleCard' in q)) // ✅ Narrow down to Question
    .map((q, index) => ({
      type: q.type,
      questionText: q.questionText,
      isRequired: q.isRequired,
      choices: q.choices || [],
      order: index,
    }))

  return {
    title: formData.title,
    description: formData.description,
    questions,
  }
}

const saveForm = async () => {
  try {
    const payload = buildFormPayload()
    await formsStore.createForm(payload)
    $q.notify({ type: 'positive', message: 'บันทึกฟอร์มสำเร็จ' })
    await router.push('/Admin/forms')
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'บันทึกฟอร์มล้มเหลว' })
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
