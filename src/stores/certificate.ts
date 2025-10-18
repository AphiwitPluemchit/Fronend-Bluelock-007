import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UploadCertificate, CertificateQuery, StatusType } from 'src/services/certificate'
import { CertificateService } from 'src/services/certificate'
import type { Meta } from 'src/types/pagination'
import { convertYearsToCodePrefixes } from 'src/utils/yearHelper'

export const useCertificateStore = defineStore('certificate', () => {
  const certificates = ref<UploadCertificate[]>([])
  const loading = ref(false)

  const query = ref<CertificateQuery>({
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'uploadAt',
    order: 'desc',
    status: [],
    major: [],
    year: [],
  })

  const meta = ref<Meta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  /**
   * ดึงข้อมูล certificates ทั้งหมด
   */
  const fetchCertificates = async () => {
    loading.value = true
    try {
      // Convert array filters to comma-separated strings for API
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiParams: Record<string, any> = { ...query.value }

      if (Array.isArray(apiParams.status) && apiParams.status.length > 0) {
        apiParams.status = apiParams.status.join(',')
      }
      if (Array.isArray(apiParams.major) && apiParams.major.length > 0) {
        apiParams.major = apiParams.major.join(',')
      }
      // Convert year from student year (1-4) to code prefix (68, 67, etc.)
      if (Array.isArray(apiParams.year) && apiParams.year.length > 0) {
        const codePrefixes = convertYearsToCodePrefixes(apiParams.year)
        apiParams.year = codePrefixes.join(',')
      }

      const res = await CertificateService.getAll(apiParams)
      console.log('Certificates from API:', res)

      certificates.value = res.data
      meta.value = res.meta
    } catch (error) {
      console.error('Error fetching certificates:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * ดึงข้อมูล certificates ของนิสิตคนใดคนหนึ่ง
   */
  const fetchCertificatesByStudent = async (studentId: string) => {
    loading.value = true
    try {
      const apiParams: Record<string, unknown> = { ...query.value }
      delete apiParams.studentId // Remove to avoid conflict

      // Convert array filters to comma-separated strings
      if (Array.isArray(apiParams.status) && apiParams.status.length > 0) {
        apiParams.status = apiParams.status.join(',')
      }
      if (Array.isArray(apiParams.major) && apiParams.major.length > 0) {
        apiParams.major = apiParams.major.join(',')
      }
      // Convert year
      if (Array.isArray(apiParams.year) && apiParams.year.length > 0) {
        const codePrefixes = convertYearsToCodePrefixes(apiParams.year as string[])
        apiParams.year = codePrefixes.join(',')
      }

      const res = await CertificateService.getByStudent(studentId, apiParams)
      certificates.value = res.data
      meta.value = res.meta
    } catch (error) {
      console.error('Error fetching student certificates:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * ดึงข้อมูล certificates ของ course
   */
  const fetchCertificatesByCourse = async (courseId: string) => {
    loading.value = true
    try {
      const apiParams: Record<string, unknown> = { ...query.value }
      delete apiParams.courseId // Remove to avoid conflict

      // Convert array filters to comma-separated strings
      if (Array.isArray(apiParams.status) && apiParams.status.length > 0) {
        apiParams.status = apiParams.status.join(',')
      }
      if (Array.isArray(apiParams.major) && apiParams.major.length > 0) {
        apiParams.major = apiParams.major.join(',')
      }
      // Convert year
      if (Array.isArray(apiParams.year) && apiParams.year.length > 0) {
        const codePrefixes = convertYearsToCodePrefixes(apiParams.year as string[])
        apiParams.year = codePrefixes.join(',')
      }

      const res = await CertificateService.getByCourse(courseId, apiParams)
      certificates.value = res.data
      meta.value = res.meta
    } catch (error) {
      console.error('Error fetching course certificates:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * ดึงข้อมูล certificate เดี่ยว
   */
  const fetchOneCertificate = async (id: string) => {
    loading.value = true
    try {
      const certificate = await CertificateService.getOne(id)
      return certificate
    } catch (error) {
      console.error('Error fetching certificate:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * อัปเดตสถานะ certificate
   */
  const updateCertificateStatus = async (id: string, status: string, remark?: string) => {
    try {
      const payload: { status: StatusType; remark?: string } = {
        status: status as StatusType,
      }
      if (remark) {
        payload.remark = remark
      }
      const updatedCertificate = await CertificateService.updateStatus(id, payload)

      // Update the certificate in the list
      const index = certificates.value.findIndex((cert) => cert.id === id)
      if (index !== -1) {
        certificates.value[index] = updatedCertificate
      }

      return updatedCertificate
    } catch (error) {
      console.error('Error updating certificate status:', error)
      throw error
    }
  }

  /**
   * เปลี่ยนหน้า
   */
  const changePage = async (page: number) => {
    query.value.page = page
    await fetchCertificates()
  }

  /**
   * เปลี่ยนจำนวนรายการต่อหน้า
   */
  const changeLimit = async (limit: number) => {
    query.value.limit = limit
    query.value.page = 1
    await fetchCertificates()
  }

  /**
   * ค้นหา
   */
  const searchCertificates = async (searchText: string) => {
    query.value.search = searchText
    query.value.page = 1
    await fetchCertificates()
  }

  /**
   * กรอง status
   */
  const filterByStatus = async (statuses: string[]) => {
    query.value.status = statuses
    query.value.page = 1
    await fetchCertificates()
  }

  /**
   * กรอง major
   */
  const filterByMajor = async (majors: string[]) => {
    query.value.major = majors
    query.value.page = 1
    await fetchCertificates()
  }

  /**
   * กรอง year
   */
  const filterByYear = async (years: string[]) => {
    query.value.year = years
    query.value.page = 1
    await fetchCertificates()
  }

  /**
   * ใช้ filters ทั้งหมด
   */
  const applyFilters = async (newFilters: Partial<CertificateQuery>) => {
    Object.assign(query.value, newFilters)
    query.value.page = 1
    await fetchCertificates()
  }

  /**
   * รีเซ็ต filters
   */
  const resetFilters = () => {
    query.value = {
      page: 1,
      limit: 10,
      search: '',
      sortBy: 'uploadAt',
      order: 'desc',
      status: [],
      major: [],
      year: [],
    }
  }

  return {
    // State
    certificates,
    loading,
    query,
    meta,

    // Actions
    fetchCertificates,
    fetchCertificatesByStudent,
    fetchCertificatesByCourse,
    fetchOneCertificate,
    updateCertificateStatus,
    changePage,
    changeLimit,
    searchCertificates,
    filterByStatus,
    filterByMajor,
    filterByYear,
    applyFilters,
    resetFilters,
  }
})
