import { useState, useCallback } from 'react'
import { wrapSections as defaultSections } from '../../data/wrapTemplate'
import useLocalStorage from '../../hooks/useLocalStorage'
import styles from './WRAPPlan.module.css'

export default function WRAPPlan() {
  const [sections, setSections] = useLocalStorage('sgt-wrap-sections', defaultSections)
  const [openPanel, setOpenPanel] = useState(null)

  const togglePanel = useCallback((id) => {
    setOpenPanel(prev => prev === id ? null : id)
  }, [])

  const removeItem = useCallback((sectionId, itemIdx) => {
    setSections(prev => prev.map(s => {
      if (s.id === sectionId) {
        return { ...s, items: s.items.filter((_, i) => i !== itemIdx) }
      }
      return s
    }))
  }, [setSections])

  const addItem = useCallback((sectionId) => {
    setSections(prev => prev.map(s => {
      if (s.id === sectionId) {
        return { ...s, items: [...s.items, '新条目'] }
      }
      return s
    }))
  }, [setSections])

  const updateItem = useCallback((sectionId, itemIdx, value) => {
    setSections(prev => prev.map(s => {
      if (s.id === sectionId) {
        const newItems = [...s.items]
        newItems[itemIdx] = value
        return { ...s, items: newItems }
      }
      return s
    }))
  }, [setSections])

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>WRAP计划 📝</h1>
        <p>个人康复行动计划</p>
      </div>
      <div className={styles.content}>
        {sections.map(section => (
          <div key={section.id} className={`${styles.panel} ${openPanel === section.id ? styles.open : ''}`}>
            <div className={styles.panelHeader} onClick={() => togglePanel(section.id)}>
              <div className={styles.panelTitle}>{section.title}</div>
              <div className={styles.panelArrow}>▼</div>
            </div>
            <div className={styles.panelBody}>
              <div className={styles.panelContent}>
                <div className={styles.hint}>{section.hint}</div>
                {section.items.map((item, idx) => (
                  <div key={idx} className={styles.item}>
                    <input
                      className={styles.itemInput}
                      value={item}
                      onChange={e => updateItem(section.id, idx, e.target.value)}
                    />
                    <button className={styles.itemDelete} onClick={() => removeItem(section.id, idx)}>✕</button>
                  </div>
                ))}
                <button className={styles.addBtn} onClick={() => addItem(section.id)}>+ 添加条目</button>
              </div>
            </div>
          </div>
        ))}
        <div className={styles.footer}>
          WRAP（Wellness Recovery Action Plan）是由 Mary Ellen Copeland 博士开发的<br />
          个人康复行动计划，已被全球广泛用于心理健康自我管理。
        </div>
      </div>
    </div>
  )
}
