/**
 * 日期工具（对齐 H5 utils/dateUtils.js）
 */
export function formatDate(date) {
  const d = date || new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function formatDateChinese(date) {
  const d = date || new Date()
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

export function getDayOfWeek(date) {
  const days = ['日', '一', '二', '三', '四', '五', '六']
  return days[(date || new Date()).getDay()]
}

export function getRelativeDate(daysAgo) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return formatDate(d)
}

/** ISO 周序号（对齐 H5 的 getWeekNumber） */
export function getISOWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}

/** 2026-W12 形式的周 key */
export function getWeekKey(dateInput) {
  const d = typeof dateInput === 'string' ? new Date(dateInput.replace(/-/g, '/')) : (dateInput || new Date())
  const weekNum = getISOWeekNumber(d)
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`
}

export function todayISO() {
  return new Date().toISOString().split('T')[0]
}
