<template>
  <router-view />
</template>

<script setup lang="ts">
import { useMeta } from 'quasar'
import { ref, watchEffect } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { useI18n } from 'vue-i18n'

// Layouts
// import AdminLayout from './layouts/AdminLayout.vue'
// import StudentLayout from './layouts/StudentLayout.vue'
// import LoginLayout from './layouts/LoginLayout.vue'
// import { EnumUserRole } from 'src/data/roles'
const authStore = useAuthStore()
const { t } = useI18n()

// ✅ ดึง token จาก URL ถ้ามี
const token = ref()
const handleToken = () => {
  const urlParams = new URLSearchParams(window.location.search)
  token.value = urlParams.get('token')
  if (token.value) {
    localStorage.setItem('token', token.value ?? '')
    window.location.replace('/')
  }
}
watchEffect(() => {
  handleToken()
  authStore.loadUserFromLocalStorage()
})

// ✅ เลือก Layout ตาม role
// const layoutComponent = computed(() => {
//   if (authStore.getRole === EnumUserRole.ADMIN) return AdminLayout
//   if (authStore.getRole === EnumUserRole.STUDENT) return StudentLayout
//   return LoginLayout
// })

// ✅ meta tag
useMeta({
  title: '',
  titleTemplate: (title) => `${t(title)} - Activities Tracking System`,
  meta: {
    description: { name: 'description', content: 'ระบบ Activities Tracking System' },
    keywords: { name: 'keywords', content: 'buu, Activities Tracking System, co-op' },
  },
  link: {
    material: {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/icon?family=Material+Icons',
    },
  },
  noscript: {
    default: 'กรุณาเปิดใช้งาน JavaScript เพื่อใช้งานเว็บไซต์นี้',
  },
})
</script>
