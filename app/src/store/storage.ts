export function loadData<T>(key: string, defaultValue: T): T {
  try {
    const raw = uni.getStorageSync(key)
    return raw !== '' && raw !== undefined && raw !== null ? JSON.parse(raw) : defaultValue
  } catch {
    return defaultValue
  }
}

export function saveData(key: string, value: any): void {
  try {
    uni.setStorageSync(key, JSON.stringify(value))
  } catch (e) {
    console.warn('存储写入失败:', key, e)
  }
}
