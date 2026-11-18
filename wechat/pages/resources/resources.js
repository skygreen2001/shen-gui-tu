import { hospitals, areas } from '../../data/hospitals'
import { hotlines } from '../../data/hotlines'
import { communityResources } from '../../data/community'
import { insurancePolicies } from '../../data/insurance'

const TABS = [
  { key: 'wechat', label: '💬 微信' },
  { key: 'hospitals', label: '🏥 医院' },
  { key: 'hotlines', label: '📞 热线' },
  { key: 'community', label: '🏘️ 社区' },
  { key: 'insurance', label: '📋 医保' },
  { key: 'family', label: '👨‍👩‍👧 家属' },
  { key: 'rebuild', label: '🌱 重建' }
]

Page({
  data: {
    tabs: TABS,
    activeTab: 0,
    areas,
    areaIndex: 0,
    filteredHospitals: hospitals,
    hospitals,
    hotlines,
    communityResources,
    insurancePolicies
  },

  onShow() {
    // 子 tab 页面（家属/重建）数据在各自 component 中按需读取
  },

  switchTab(e) {
    this.setData({ activeTab: Number(e.currentTarget.dataset.index) })
  },

  onAreaChange(e) {
    const idx = Number(e.detail.value)
    const area = areas[idx]
    const filtered = area === '全部区域' ? hospitals : hospitals.filter(h => h.area === area)
    this.setData({ areaIndex: idx, filteredHospitals: filtered })
  },

  callPhone(e) {
    const phone = e.currentTarget.dataset.phone
    wx.makePhoneCall({ phoneNumber: phone })
  }
})
