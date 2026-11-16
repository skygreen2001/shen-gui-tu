/**
 * 风险仪表盘组件（对齐 H5 RiskGauge）
 * 使用 Canvas 2D 绘制环形进度 + 数字滚动动画
 */
const LEVEL_CONFIG = {
  green: { color: '#6BAF7A', label: '状态良好' },
  yellow: { color: '#E8C95A', label: '需要关注' },
  orange: { color: '#E8985E', label: '建议就医' },
  red: { color: '#D46B6B', label: '请尽快就医' },
  unknown: { color: '#E8E4DE', label: '暂无数据' }
}

Component({
  properties: {
    score: { type: Number, value: 0 },
    level: { type: String, value: 'unknown' }
  },

  data: {
    displayScore: 0,
    label: '暂无数据',
    color: '#E8E4DE'
  },

  observers: {
    'score, level': function (score, level) {
      const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG.unknown
      this.setData({ label: cfg.label, color: cfg.color })
      this.startAnimate(score || 0, cfg.color)
    }
  },

  lifetimes: {
    attached() {
      this._timer = null
      this._canvasNode = null
      this._canvasCtx = null
      this.initCanvas()
    },
    detached() {
      if (this._timer) clearInterval(this._timer)
    }
  },

  methods: {
    initCanvas() {
      const query = this.createSelectorQuery().in(this)
      query.select('#gaugeCanvas')
        .fields({ node: true, size: true })
        .exec(res => {
          if (!res || !res[0] || !res[0].node) return
          const canvas = res[0].node
          const dpr = wx.getSystemInfoSync().pixelRatio || 2
          canvas.width = res[0].width * dpr
          canvas.height = res[0].height * dpr
          const ctx = canvas.getContext('2d')
          ctx.scale(dpr, dpr)
          this._canvasNode = canvas
          this._canvasCtx = ctx
          this.draw(0, LEVEL_CONFIG.unknown.color)
          // 若 properties 已有值，立即绘制
          if (this.data.score) this.startAnimate(this.data.score, LEVEL_CONFIG[this.data.level] ? LEVEL_CONFIG[this.data.level].color : '#E8E4DE')
        })
    },

    startAnimate(target, color) {
      if (this._timer) clearInterval(this._timer)
      let current = 0
      const step = Math.max(1, Math.floor(target / 30))
      this._timer = setInterval(() => {
        current += step
        if (current >= target) { current = target; clearInterval(this._timer) }
        this.setData({ displayScore: current })
        this.draw(current, color)
      }, 20)
    },

    draw(score, color) {
      const ctx = this._canvasCtx
      if (!ctx) return
      const size = 200
      const cx = size / 2
      const cy = size / 2
      const r = 85
      const lineWidth = 12
      const startAngle = -Math.PI / 2
      const totalAngle = Math.PI * 2

      ctx.clearRect(0, 0, size, size)
      // 背景圆环
      ctx.beginPath()
      ctx.lineWidth = lineWidth
      ctx.strokeStyle = '#E8E4DE'
      ctx.arc(cx, cy, r, 0, totalAngle)
      ctx.stroke()
      // 进度圆环
      if (score > 0) {
        ctx.beginPath()
        ctx.lineCap = 'round'
        ctx.strokeStyle = color
        ctx.arc(cx, cy, r, startAngle, startAngle + totalAngle * (score / 100))
        ctx.stroke()
      }
    }
  }
})
