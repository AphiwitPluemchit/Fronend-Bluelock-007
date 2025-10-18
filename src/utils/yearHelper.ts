/**
 * คำนวณปีการศึกษาปัจจุบัน (พ.ศ. 2 หลัก)
 * @returns ปีการศึกษาปัจจุบัน เช่น 68 (จาก พ.ศ. 2568)
 */
export function getCurrentAcademicYear(): number {
  const now = new Date()
  let year = now.getFullYear() + 543 // แปลง ค.ศ. เป็น พ.ศ.

  // ถ้ายังไม่ถึงเดือนกรกฎาคม (เดือน 7) ถือว่ายังเป็นปีการศึกษาที่แล้ว
  if (now.getMonth() < 6) {
    // JavaScript months are 0-indexed (0 = Jan, 6 = Jul)
    year -= 1
  }
  return year % 100 // เอาเฉพาะ 2 หลักท้าย (2568 → 68)
}

/**
 * แปลงชั้นปี (1-4) เป็นรหัสนิสิต 2 หลัก
 * @param studentYear ชั้นปี (1 = ปี 1, 2 = ปี 2, etc.)
 * @returns รหัสนิสิต 2 หลัก เช่น "68", "67"
 */
export function getStudentCodePrefixFromYear(studentYear: number): string {
  const currentYear = getCurrentAcademicYear()
  if (studentYear >= 1 && studentYear <= 4) {
    const codePrefix = currentYear - (studentYear - 1)
    return codePrefix.toString()
  }
  return ''
}

/**
 * แปลงอาร์เรย์ของชั้นปี (1-4) เป็นอาร์เรย์ของรหัสนิสิต 2 หลัก
 * @param studentYears อาร์เรย์ของชั้นปี ["1", "2", "3", "4"]
 * @returns อาร์เรย์ของรหัสนิสิต 2 หลัก เช่น ["68", "67", "66", "65"]
 */
export function convertYearsToCodePrefixes(studentYears: string[]): string[] {
  return studentYears
    .map((year) => {
      const yearNum = parseInt(year, 10)
      return getStudentCodePrefixFromYear(yearNum)
    })
    .filter((code) => code !== '')
}

/**
 * ดึงปีจากรหัสนิสิต (2 หลักแรก)
 * @param studentCode รหัสนิสิต เช่น "68160309"
 * @returns รหัสปี 2 หลัก เช่น "68"
 */
export function getYearFromStudentCode(studentCode: string): string {
  if (!studentCode || studentCode.length < 2) return ''
  return studentCode.substring(0, 2)
}

/**
 * แปลงรหัสนิสิต 2 หลัก เป็นชั้นปี (1-4)
 * @param codePrefix รหัสนิสิต 2 หลัก เช่น "68"
 * @returns ชั้นปี (1-4) หรือ 0 ถ้าไม่สามารถคำนวณได้
 */
export function getStudentYearFromCodePrefix(codePrefix: string): number {
  const currentYear = getCurrentAcademicYear()
  const code = parseInt(codePrefix, 10)
  if (isNaN(code)) return 0

  const yearDiff = currentYear - code
  // ปี 1 = 0, ปี 2 = 1, ปี 3 = 2, ปี 4 = 3
  const studentYear = yearDiff + 1

  if (studentYear >= 1 && studentYear <= 4) {
    return studentYear
  }
  return 0
}
