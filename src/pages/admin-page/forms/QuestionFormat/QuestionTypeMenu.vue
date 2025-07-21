<template>
  <q-list bordered padding class="bg-white rounded-borders" style="width: 200px">
    <q-item v-for="(type, i) in questionTypes" :key="i" clickable @click="selectType(type)">
      <q-item-section avatar>
        <q-icon :name="type.icon" />
      </q-item-section>

      <q-item-section>
        <q-item-label>{{ type.label }}</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">

const emit = defineEmits(['selected'])

const questionTypes = [
  { label: 'Short answer', value: 'short_answer', icon: 'short_text' },
  { label: 'Paragraph', value: 'paragraph', icon: 'subject' },
  { label: 'Multiple choice', value: 'multiple_choice', icon: 'radio_button_checked' },
  { label: 'Checkboxes', value: 'checkbox', icon: 'check_box' },
  { label: 'Dropdown', value: 'dropdown', icon: 'arrow_drop_down_circle' },
  { label: 'Rating', value: 'rating', icon: 'star' },
  { label: 'Multiple choice grid', value: 'grid_multiple_choice', icon: 'grid_view' },
  { label: 'Checkbox grid', value: 'grid_checkbox', icon: 'grid_view' },
]

function selectType(type: typeof questionTypes[number]) {
  emit('selected', type)
}
</script>

<style scoped>
.q-item {
  transition: background-color 0.2s;
}
.q-item:hover {
  background-color: #f5f5f5;
}
</style>
