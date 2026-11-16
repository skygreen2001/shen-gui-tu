Page({
  onLoad() {
    // 与 H5 一致：欢迎页为入口页
  },

  start() {
    wx.switchTab({ url: '/pages/dashboard/dashboard' })
  },

  callHotline() {
    wx.makePhoneCall({ phoneNumber: '962525' })
  },

  noop() {}
})
