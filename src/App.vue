<template>
  <router-view />
</template>

<script setup lang="ts">
import { useMeta } from 'quasar'
import { ref, watchEffect, onMounted } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { EnumUserRole } from 'src/data/roles'

// Layouts
// import AdminLayout from './layouts/AdminLayout.vue'
// import StudentLayout from './layouts/StudentLayout.vue'
// import LoginLayout from './layouts/LoginLayout.vue'
// import { EnumUserRole } from 'src/data/roles'
const authStore = useAuthStore()
const router = useRouter()
const { t } = useI18n()

// ✅ ดึง token จาก URL ถ้ามี
const token = ref()
const handleToken = () => {
  const urlParams = new URLSearchParams(window.location.search)
  token.value = urlParams.get('access_token')
  if (token.value) {
    localStorage.setItem('access_token', token.value ?? '')
    window.location.replace('/')
  }
}

// ✅ ตรวจสอบสิทธิ์การเข้าถึงแอป
const validateAppAccess = () => {
  // ถ้าอยู่ในหน้า login หรือ public ให้ข้ามการตรวจสอบ
  const currentPath = router.currentRoute.value.path
  if (currentPath === '/' || currentPath === '/unauthorized') {
    return
  }

  // ตรวจสอบความถูกต้องของข้อมูล user
  if (!authStore.validateUserData()) {
    console.warn('Invalid user data detected in app, redirecting to login')
    authStore.clearLocalStorage()
    void router.replace('/')
    return
  }

  // ตรวจสอบ token หมดอายุ
  if (authStore.isTokenExpired()) {
    console.warn('Token expired in app, redirecting to login')
    authStore.clearLocalStorage()
    void router.replace('/')
    return
  }

  // ตรวจสอบสิทธิ์การเข้าถึง path ปัจจุบัน
  if (!authStore.canAccessPath(currentPath)) {
    console.warn('User cannot access current path, redirecting to appropriate home')
    const role = authStore.getRole
    if (role === EnumUserRole.ADMIN) {
      void router.replace('/Admin/ActivitiesCalendar')
    } else if (role === EnumUserRole.STUDENT) {
      void router.replace('/Student/ActivitiesCalendar')
    } else {
      void router.replace('/')
    }
    return
  }
}

watchEffect(() => {
  handleToken()
  authStore.loadUserFromLocalStorage()
})

onMounted(() => {
  // ตรวจสอบสิทธิ์เมื่อแอปเริ่มต้น
  validateAppAccess()
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
