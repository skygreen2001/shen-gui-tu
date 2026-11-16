/**
 * 本地存储封装（对齐 H5 useLocalStorage + localStorage 'sgt-' 前缀约定）
 */
export function getStore(key, defaultValue) {
  try {
    const v = wx.getStorageSync(key)
    if (v === '' || v === null || v === undefined) return defaultValue
    return v
  } catch (e) {
    return defaultValue
  }
}

export function setStore(key, value) {
  try {
    wx.setStorageSync(key, value)
  } catch (e) {
    console.error('storage error:', e)
  }
}

export function removeStore(key) {
  try {
    wx.removeStorageSync(key)
  } catch (e) { /* ignore */ }
}

/** 清除所有 sgt- 前缀数据（对应 Dashboard 重置功能） */
export function clearAllData() {
  try {
    const info = wx.getStorageInfoSync()
    info.keys.filter(k => k.indexOf('sgt-') === 0).forEach(k => wx.removeStorageSync(k))
  } catch (e) { /* ignore */ }
}
