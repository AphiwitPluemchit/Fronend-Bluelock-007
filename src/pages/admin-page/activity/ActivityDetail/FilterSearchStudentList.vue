<script setup lang="ts">
import { ref } from 'vue';
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'

const showFilterDialog1 = ref(false)
const search1 = ref('')
const filterCategories1 = ref(['major', 'statusStudent'])

const filters = ref<{
    major: string[]
    statusStudent: string[]
}>({
    major: [],
    statusStudent: [],
})

const applyFilters = (selectedFilters: {
    major: string[]
    statusStudent: string[]
}) => {
    filters.value = selectedFilters
    console.log('Filters Applied:', filters.value)
}
</script>

<template>
    <div class="row q-mb-md justify-end items-center">
        <!-- ช่องค้นหา -->
        <q-input dense outlined v-model="search1" placeholder="ค้นหา" class="q-mr-sm searchbox"
            :style="{ boxShadow: 'none' }">
            <template v-slot:append>
                <q-icon name="search" />
            </template>
        </q-input>

        <q-btn class="btnfilter" @click="showFilterDialog1 = true">
            <img src="public\icons\sort.svg" alt="Sort Icon" width="30" height="30" />
            <FilterDialog v-model="showFilterDialog1" :categories="filterCategories1" @apply="applyFilters" />
        </q-btn>
    </div>
</template>
