<script setup lang="ts">
import { ref } from 'vue';
import FilterDialog from 'src/components/Dialog/FilterDialog.vue'

const showFilterDialog1 = ref(false)
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

const props = defineProps<{ search: string }>();
const emit = defineEmits(['update:search']);

const search1 = ref(props.search);

// ฟังก์ชันกรองข้อมูลเฉพาะ "ชื่อนิสิต"
const updateSearch = () => {
    emit('update:search', search1.value);
};

</script>

<template>
    <div class="row q-mb-md justify-end items-center">
        <!-- ช่องค้นหา -->
        <q-input dense outlined v-model="search1" @update:model-value="updateSearch" placeholder="ค้นหาชื่อนิสิต" class="q-mr-sm searchbox"
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
