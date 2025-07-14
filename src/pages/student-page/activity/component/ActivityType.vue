<template>
  <q-badge rounded  :label="buttonLabel" :class="buttonClass"                     class="q-px-sm q-py-xs text-weight-medium"
 />
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  skill: 'hardSkill' | 'softSkill'
}

const props = defineProps<Props>()

const buttonLabel = computed(() =>
  props.skill === 'hardSkill' ? 'ทักษะความรู้ทางวิชาการ' : 'ทักษะเตรียมความพร้อม'
)

const buttonClass = computed(() =>
  props.skill === 'hardSkill' ? 'hard-skill' : 'soft-skill'
)
</script>

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
</style>
