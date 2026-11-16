Page({
  data: {
    breathing: false,
    phase: 'idle', // idle | inhale | hold | exhale
    count: 0
  },

  onUnload() {
    this.stopTimers()
  },

  onHide() {
    if (this.data.breathing) this.stopBreathing()
  },

  callPhone(e) {
    wx.makePhoneCall({ phoneNumber: e.currentTarget.dataset.phone })
  },

  stopTimers() {
    if (this._timeout) clearTimeout(this._timeout)
    if (this._interval) clearInterval(this._interval)
    this._timeout = null
    this._interval = null
  },

  setCountdown(seconds, phase) {
    this.setData({ phase, count: seconds })
    let remaining = seconds
    this._interval = setInterval(() => {
      remaining--
      if (remaining <= 0) clearInterval(this._interval)
      this.setData({ count: Math.max(0, remaining) })
    }, 1000)
  },

  /** 4-7-8 呼吸循环 */
  startBreathCycle() {
    this.stopTimers()
    // 吸气 4s
    this.setCountdown(4, 'inhale')
    this._timeout = setTimeout(() => {
      // 屏息 7s
      this.stopTimers()
      this.setCountdown(7, 'hold')
      this._timeout = setTimeout(() => {
        // 呼气 8s
        this.stopTimers()
        this.setCountdown(8, 'exhale')
        this._timeout = setTimeout(() => {
          if (this.data.breathing) this.startBreathCycle()
        }, 8000)
      }, 7000)
    }, 4000)
  },

  stopBreathing() {
    this.stopTimers()
    this.setData({ breathing: false, phase: 'idle', count: 0 })
  },

  toggleBreathing() {
    if (this.data.breathing) {
      this.stopBreathing()
    } else {
      this.setData({ breathing: true })
      this.startBreathCycle()
    }
  }
})
