import { wrapSections as defaultSections } from '../../data/wrapTemplate'
import { getStore, setStore } from '../../utils/store'

Page({
  data: {
    sections: [],
    openPanel: ''
  },

  onShow() {
    // 优先读取用户编辑过的数据；无数据时使用默认模板
    let sections = getStore('sgt-wrap-sections', null)
    if (!sections || !sections.length) {
      sections = defaultSections.map(s => Object.assign({}, s, { items: s.items.slice() }))
    }
    this.setData({ sections })
  },

  goCrisis() {
    wx.navigateTo({ url: '/pages/crisis/crisis' })
  },

  togglePanel(e) {
    const id = e.currentTarget.dataset.id
    this.setData({ openPanel: this.data.openPanel === id ? '' : id })
  },

  removeItem(e) {
    const { sid, idx } = e.currentTarget.dataset
    const sections = this.data.sections.map(s => {
      if (s.id !== sid) return s
      return Object.assign({}, s, { items: s.items.filter((_, i) => i !== Number(idx)) })
    })
    this.setData({ sections })
    setStore('sgt-wrap-sections', sections)
  },

  addItem(e) {
    const sid = e.currentTarget.dataset.sid
    const sections = this.data.sections.map(s => {
      if (s.id !== sid) return s
      return Object.assign({}, s, { items: s.items.concat(['新条目']) })
    })
    this.setData({ sections })
    setStore('sgt-wrap-sections', sections)
  },

  updateItem(e) {
    const { sid, idx } = e.currentTarget.dataset
    const value = e.detail.value
    const sections = this.data.sections.map(s => {
      if (s.id !== sid) return s
      const items = s.items.slice()
      items[Number(idx)] = value
      return Object.assign({}, s, { items })
    })
    this.setData({ sections })
    setStore('sgt-wrap-sections', sections)
  }
})
