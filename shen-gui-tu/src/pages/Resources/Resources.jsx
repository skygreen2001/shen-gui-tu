import { useState, useRef, useEffect } from 'react'
import { hospitals, areas } from '../../data/hospitals'
import { hotlines } from '../../data/hotlines'
import { communityResources } from '../../data/community'
import { insurancePolicies } from '../../data/insurance'
import FamilyTab from './FamilyTab'
import RebuildTab from './RebuildTab'
import styles from './Resources.module.css'

const tabs = [
  { key: 'wechat', label: '💬 微信' },
  { key: 'hospitals', label: '🏥 医院' },
  { key: 'hotlines', label: '📞 热线' },
  { key: 'community', label: '🏘️ 社区' },
  { key: 'insurance', label: '📋 医保' },
  { key: 'family', label: '👨‍👩‍👧 家属' },
  { key: 'rebuild', label: '🌱 重建' },
]

export default function Resources() {
  const [activeTab, setActiveTab] = useState(0)
  const [area, setArea] = useState('全部区域')
  const tabsRef = useRef(null)
  const [indicatorStyle, setIndicatorStyle] = useState({})

  useEffect(() => {
    updateIndicator(activeTab)
  }, [activeTab])

  const updateIndicator = (idx) => {
    if (!tabsRef.current) return
    const btn = tabsRef.current.children[idx]
    if (!btn) return
    const parent = tabsRef.current.getBoundingClientRect()
    const rect = btn.getBoundingClientRect()
    setIndicatorStyle({ left: rect.left - parent.left, width: rect.width })
  }

  const filteredHospitals = area === '全部区域' ? hospitals : hospitals.filter(h => h.area === area)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>服务中心 📚</h1>
        <p>上海本地心理健康服务</p>
      </div>
      <div className={styles.content}>
        <div className={styles.tabs} ref={tabsRef}>
          {tabs.map((tab, i) => (
            <button key={tab.key} className={`${styles.tab} ${i === activeTab ? styles.activeTab : ''}`} onClick={() => setActiveTab(i)}>
              {tab.label}
            </button>
          ))}
          <div className={styles.indicator} style={indicatorStyle} />
        </div>

        {activeTab === 0 && (
          <div className={styles.panel}>
            <div className={styles.wechatCard}>
              <div className={styles.wechatHeader}>
                <img src="/lvsisdai-logo.png" alt="上海精神卫生飘扬的绿丝带 logo" className={styles.wechatLogo} />
                <div className={styles.wechatInfo}>
                  <div className={styles.wechatName}>上海精神卫生飘扬的绿丝带</div>
                  <div className={styles.wechatSub}>上海市精神卫生中心 · 第三方官方公众号</div>
                </div>
              </div>
              <div className={styles.wechatTag}>
                <span className={styles.wechatTagLabel}>推荐关注</span>
                <span className={styles.wechatTagSep}>·</span>
                <span>精神卫生专业资讯</span>
              </div>
              <div className={styles.wechatDesc}>
                「上海精神卫生飘扬的绿丝带」是由上海市精神卫生中心运营的官方微信公众号。
                该公众号致力于传播心理健康知识、普及精神卫生专业知识与相关法律法规，并持续发布精神卫生领域的公益宣传与培训信息。
              </div>
              <div className={styles.wechatStats}>
                <div className={styles.wechatStat}>
                  <span className={styles.wechatStatVal}>2.5万</span>
                  <span className={styles.wechatStatLabel}>关注</span>
                </div>
                <div className={styles.wechatStatDivider} />
                <div className={styles.wechatStat}>
                  <span className={styles.wechatStatVal}>1.3万</span>
                  <span className={styles.wechatStatLabel}>点赞</span>
                </div>
              </div>
              <div className={styles.wechatTip}>
                💡 打开微信 → 搜索「上海精神卫生飘扬的绿丝带」→ 关注公众号
              </div>
            </div>
          </div>
        )}

        {activeTab === 1 && (
          <div className={styles.panel}>
            <div className={styles.filter}>
              <select value={area} onChange={e => setArea(e.target.value)}>
                {areas.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            {filteredHospitals.map(h => (
              <div key={h.id} className={styles.resCard}>
                <div className={styles.cardName}>{h.name}</div>
                <div className={styles.cardInfo}>{h.level} · {h.address}</div>
                <div className={styles.cardTags}>
                  {h.tags.map(t => <span key={t} className={styles.tag}>{t}</span>)}
                </div>
                <a href={h.tel} className={styles.cardLink}>📞 {h.phone}</a>
              </div>
            ))}
          </div>
        )}

        {activeTab === 2 && (
          <div className={styles.panel}>
            {hotlines.map(h => (
              <div key={h.id} className={`${styles.hotlineCard} ${h.featured ? styles.featured : ''}`}>
                <div className={styles.hotlineName}>{h.featured ? '🔴' : '📞'} {h.name}</div>
                <div className={styles.hotlineNum}><a href={h.tel}>{h.number}</a></div>
                <div className={styles.hotlineTime}>{h.hours} {h.featured ? '· 免费' : ''}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 3 && (
          <div className={styles.panel}>
            {communityResources.map(c => (
              <div key={c.id} className={styles.resCard}>
                <div className={styles.cardName}>{c.name}</div>
                <div className={styles.cardInfo}>{c.area} · {c.address}</div>
                <div className={styles.cardTags}>
                  {c.services.map(s => <span key={s} className={`${styles.tag} ${styles.tagSuccess}`}>{s}</span>)}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 4 && (
          <div className={styles.panel}>
            {insurancePolicies.map(p => (
              <div key={p.id} className={styles.policyItem}>
                <div className={styles.policyTitle}>{p.title}</div>
                <div className={styles.policyDesc}>
                  {p.desc}<span className={styles.highlight}>{p.highlight}</span>
                </div>
                {p.detail && <div className={styles.policyDetail}>{p.detail}</div>}
              </div>
            ))}
          </div>
        )}

        {activeTab === 5 && <FamilyTab />}
        {activeTab === 6 && <RebuildTab />}
      </div>
    </div>
  )
}
