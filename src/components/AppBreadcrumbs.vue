<template>
  <q-breadcrumbs separator=" ">
    <q-breadcrumbs-el>
      <!-- ตรวจว่าเป็นรูปภาพหรือ icon -->
      <template v-if="isImageIcon(breadcrumbs.icon)">
        <img :src="breadcrumbs.icon" alt="icon" class="icon-image q-mr-sm" />
      </template>
      <template v-else>
        <!-- กำหนดสีไอคอนเป็นสีดำ -->
        <q-icon :name="breadcrumbs.icon" size="md" class="q-mr-sm" style="color: black" />
      </template>

      <!-- previousPage -->
      <router-link
        :to="breadcrumbs.previousPage?.path ?? '/'"
        class="textbreadcrumbs"
        style="text-decoration: none"
      >
        {{ breadcrumbs.previousPage?.title }}
      </router-link>
      <span v-if="breadcrumbs.currentPage" class="q-mx-sm"> > </span>
    </q-breadcrumbs-el>

    <!-- currentPage -->
    <q-breadcrumbs-el>
      <router-link
        :to="breadcrumbs.currentPage.path"
        class="textbreadcrumbs"
        :style="{ 'text-decoration-line': breadcrumbs.nextPage ? 'none' : 'underline' }"
      >
        {{ breadcrumbs.currentPage.title }}
      </router-link>
      <span v-if="breadcrumbs.nextPage" class="q-mx-sm"> > </span>
    </q-breadcrumbs-el>

    <!-- nextPage -->
    <q-breadcrumbs-el v-if="breadcrumbs.nextPage">
      <router-link
        :to="breadcrumbs.nextPage.path"
        class="textbreadcrumbs"
        style="text-decoration-line: underline"
      >
        {{ breadcrumbs.nextPage.title }}
      </router-link>
    </q-breadcrumbs-el>
  </q-breadcrumbs>

  <!-- หัวข้อหลักของหน้า -->
  <div class="texttitle q-mt-md" >
    {{ breadcrumbs.nextPage?.title ?? breadcrumbs.currentPage.title }}
  </div>
</template>

<script setup lang="ts">
defineProps<{
  breadcrumbs: {
    previousPage: { title: string; path: string } | null
    currentPage: { title: string; path: string }
    nextPage?: { title: string; path: string } | null
    icon: string
  }
}>()

function isImageIcon(icon: string) {
  return (
    icon.startsWith('http') ||
    icon.startsWith('/') ||
    icon.endsWith('.png') ||
    icon.endsWith('.jpg') ||
    icon.endsWith('.svg')
  )
}
</script>

<style scoped>
a {
  text-decoration: none;
  color: inherit;
}
.icon-image {
  width: 24px;
  height: 24px;
}
.texttitle {
  font-size: 28px;
  font-weight: 400;
}
.textbreadcrumbs {
  font-size: 20px;
  font-weight: 700;
  color: black;
}
@media (max-width: 450px) {
  .texttitle {
    font-size: 24px;
    font-weight: 400;
  }
  .textbreadcrumbs {
    font-size: 16px;
  }
}

</style>
