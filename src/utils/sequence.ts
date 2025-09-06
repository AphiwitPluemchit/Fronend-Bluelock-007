// เวอร์ชันใส่เลขตรง ๆ
export function seqNo(rowIndex: number, page = 1, limit = 15): number {
  const p = Math.max(1, Number(page) || 1)
  const l = Math.max(1, Number(limit) || 1)
  const i = Number.isFinite(rowIndex) ? rowIndex : 0
  return (p - 1) * l + i + 1
}
