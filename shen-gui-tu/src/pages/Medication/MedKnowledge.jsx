import { useState } from 'react'
import { getMedInfo } from '../../data/medicationKnowledge'
import styles from './MedKnowledge.module.css'

const sections = [
  { key: 'category', label: '💊 药物分类' },
  { key: 'mechanism', label: '🔬 作用机制' },
  { key: 'onsetTime', label: '⏰ 起效时间' },
  { key: 'sideEffects', label: '⚠️ 常见副作用', type: 'list' },
  { key: 'tips', label: '💡 注意事项', type: 'list' },
]

export default function MedKnowledge({ name, onBack }) {
  const [openKey, setOpenKey] = useState('mechanism')
  const info = getMedInfo(name)

  if (!info) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={onBack}>← 返回</button>
          <h2>{name}</h2>
        </div>
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📖</div>
          <div className={styles.emptyTitle}>暂未收录该药物</div>
          <div className={styles.emptyDesc}>建议咨询您的主治医生了解详情</div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>← 返回</button>
        <h2>{name}</h2>
      </div>
      <div className={styles.content}>
        {sections.map(sec => {
          const value = info[sec.key]
          if (!value) return null
          const isOpen = openKey === sec.key
          return (
            <div key={sec.key} className={`${styles.panel} ${isOpen ? styles.open : ''}`}>
              <div className={styles.panelHeader} onClick={() => setOpenKey(isOpen ? null : sec.key)}>
                <span>{sec.label}</span>
                <span className={styles.arrow}>▼</span>
              </div>
              <div className={styles.panelBody}>
                <div className={styles.panelContent}>
                  {sec.type === 'list' ? (
                    <ul className={styles.list}>
                      {value.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  ) : (
                    <p>{value}</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        <div className={styles.disclaimer}>
          ⚕️ 以上信息仅供参考，具体请遵医嘱。如有疑问请咨询您的主治医生。
        </div>
      </div>
    </div>
  )
}
