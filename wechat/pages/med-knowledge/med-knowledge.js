import { getMedInfo } from '../../data/medicationKnowledge'

const SECTIONS = [
  { key: 'category', label: '💊 药物分类', type: 'text' },
  { key: 'mechanism', label: '🔬 作用机制', type: 'text' },
  { key: 'onsetTime', label: '⏰ 起效时间', type: 'text' },
  { key: 'sideEffects', label: '⚠️ 常见副作用', type: 'list' },
  { key: 'tips', label: '💡 注意事项', type: 'list' }
]

Page({
  data: {
    name: '',
    info: null,
    sections: SECTIONS,
    openKey: 'mechanism'
  },

  onLoad(options) {
    const name = options.name ? decodeURIComponent(options.name) : ''
    this.setData({ name, info: getMedInfo(name) })
  },

  goBack() {
    wx.navigateBack()
  },

  togglePanel(e) {
    const key = e.currentTarget.dataset.key
    this.setData({ openKey: this.data.openKey === key ? '' : key })
  }
})
