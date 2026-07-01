export function formatDate(date) {
  const d = date || new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

export function formatDateChinese(date) {
  const d = date || new Date()
  return `${d.getMonth()+1}月${d.getDate()}日`
}

export function getDayOfWeek(date) {
  const days = ['日','一','二','三','四','五','六']
  return days[(date || new Date()).getDay()]
}

export function getRelativeDate(daysAgo) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return formatDate(d)
}
