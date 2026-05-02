import { useState, useCallback, useMemo } from 'react'
import useLocalStorage from '../../hooks/useLocalStorage'
import { socialStages } from '../../data/socialTasks'
import { peerStories, storyCategories } from '../../data/peerStories'
import Toast from '../../components/Toast/Toast'
import styles from './RebuildTab.module.css'

const activityTypes = [
  { key: 'chat', label: '💬 线上聊天' },
  { key: 'phone', label: '📞 电话' },
  { key: 'face', label: '☕ 面对面' },
  { key: 'group', label: '👥 群体活动' },
  { key: 'other', label: '📝 其他' },
]

const encouragements = ['🌱 很棒！你又迈出了一步', '💪 你比自己想象的更勇敢', '🌟 每一步都算数', '✨ 继续保持！']

export default function RebuildTab() {
  const [view, setView] = useState('tasks') // tasks | stories | storyDetail | record
  const [completedTasks, setCompletedTasks] = useLocalStorage('sgt-social-tasks', {})
  const [activities, setActivities] = useLocalStorage('sgt-social-activities', [])
  const [expandedStage, setExpandedStage] = useState(null)
  const [feelingTask, setFeelingTask] = useState(null)
  const [storyFilter, setStoryFilter] = useState('all')
  const [activeStory, setActiveStory] = useState(null)
  const [recordType, setRecordType] = useState('')
  const [recordNote, setRecordNote] = useState('')
  const [toast, setToast] = useState('')

  // 统计
  const totalTasks = useMemo(() => socialStages.reduce((a, s) => a + s.tasks.length, 0), [])
  const doneTasks = useMemo(() => Object.keys(completedTasks).length, [])
  const weekActivities = useMemo(() => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 86400000)
    return activities.filter(a => new Date(a.timestamp) >= weekAgo).length
  }, [activities])

  // 任务完成
  const toggleTask = useCallback((taskId) => {
    if (completedTasks[taskId]) {
      setCompletedTasks(prev => {
        const next = { ...prev }
        delete next[taskId]
        return next
      })
    } else {
      setFeelingTask(taskId)
    }
  }, [completedTasks, setCompletedTasks])

  const confirmTask = useCallback((taskId, feeling) => {
    setCompletedTasks(prev => ({
      ...prev,
      [taskId]: { completedAt: new Date().toISOString(), feeling: feeling || '' },
    }))
    setFeelingTask(null)
    setToast(encouragements[Math.floor(Math.random() * encouragements.length)])
  }, [setCompletedTasks])

  // 社交记录
  const submitRecord = useCallback(() => {
    if (!recordType) { setToast('请选择活动类型'); return }
    setActivities(prev => [{
      date: new Date().toISOString().split('T')[0],
      type: recordType,
      note: recordNote,
      timestamp: Date.now(),
    }, ...prev].slice(0, 90))
    setRecordType('')
    setRecordNote('')
    setView('tasks')
    setToast('✅ 已记录今天的社交活动')
  }, [recordType, recordNote, setActivities])

  // 故事详情
  if (view === 'storyDetail' && activeStory) {
    const story = peerStories.find(s => s.id === activeStory)
    if (!story) return null
    return (
      <div className={styles.storyDetail}>
        <button className={styles.backBtn} onClick={() => { setActiveStory(null); setView('stories') }}>← 返回</button>
        <h3 className={styles.storyTitle}>{story.title}</h3>
        <div className={styles.storyTags}>
          {story.tags.map(t => <span key={t} className={styles.storyTag}>#{t}</span>)}
        </div>
        <div className={styles.storyBody}>{story.body.split('\n').map((p, i) => <p key={i}>{p}</p>)}</div>
        <div className={styles.storyFooter}>— 一位正在康复中的朋友</div>
      </div>
    )
  }

  // 社交记录视图
  if (view === 'record') {
    return (
      <div className={styles.recordView}>
        <button className={styles.backBtn} onClick={() => setView('tasks')}>← 返回</button>
        <h3 className={styles.sectionTitle}>📊 记录今天的社交活动</h3>
        <div className={styles.typeGrid}>
          {activityTypes.map(t => (
            <button
              key={t.key}
              className={`${styles.typeBtn} ${recordType === t.key ? styles.typeSelected : ''}`}
              onClick={() => setRecordType(t.key)}
            >{t.label}</button>
          ))}
        </div>
        <input
          className={styles.noteInput}
          placeholder="今天有什么想记录的？（选填）"
          value={recordNote}
          onChange={e => setRecordNote(e.target.value)}
          maxLength={100}
        />
        <button className={styles.submitBtn} onClick={submitRecord}>提交记录</button>
      </div>
    )
  }

  // 感受弹窗
  if (feelingTask) {
    return (
      <div className={styles.feelingView}>
        <h3 className={styles.sectionTitle}>🎉 完成任务！</h3>
        <p className={styles.feelingHint}>记录一下你的感受（选填）</p>
        <input
          className={styles.noteInput}
          placeholder="一句话就好..."
          autoFocus
          onChange={e => setFeelingTask(e.target.value)}
        />
        <div className={styles.feelingBtns}>
          <button className={styles.skipBtn} onClick={() => confirmTask(feelingTask, '')}>跳过</button>
          <button className={styles.submitBtn} onClick={() => confirmTask(feelingTask, document.querySelector('.feelingView input')?.value || '')}>确认</button>
        </div>
      </div>
    )
  }

  // 主视图
  return (
    <div className={styles.container}>
      {/* 子导航 */}
      <div className={styles.subNav}>
        <button className={`${styles.subTab} ${view === 'tasks' ? styles.subActive : ''}`} onClick={() => setView('tasks')}>📋 社交任务</button>
        <button className={`${styles.subTab} ${view === 'stories' ? styles.subActive : ''}`} onClick={() => setView('stories')}>👥 同伴故事</button>
      </div>

      {view === 'tasks' && (
        <>
          {/* 统计摘要 */}
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <div className={styles.statNum}>{doneTasks}/{totalTasks}</div>
              <div className={styles.statLabel}>已完成任务</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNum}>{weekActivities}</div>
              <div className={styles.statLabel}>本周社交</div>
            </div>
            <button className={styles.recordEntry} onClick={() => setView('record')}>
              📝 记录今天的社交活动
            </button>
          </div>

          {/* 社交任务 */}
          <div className={styles.stages}>
            {socialStages.map((stage, si) => {
              const stageDone = stage.tasks.filter(t => completedTasks[t.id]).length
              return (
                <div key={stage.id} className={styles.stageCard}>
                  <div className={styles.stageHeader} onClick={() => setExpandedStage(expandedStage === si ? null : si)}>
                    <span className={styles.stageIcon}>{stage.icon}</span>
                    <div className={styles.stageInfo}>
                      <div className={styles.stageName}>{stage.title}</div>
                      <div className={styles.stageDesc}>{stage.desc}</div>
                    </div>
                    <div className={styles.stageMeta}>
                      <span className={styles.stageProgress}>{stageDone}/{stage.tasks.length}</span>
                      <span className={styles.stageArrow}>{expandedStage === si ? '▲' : '▼'}</span>
                    </div>
                  </div>
                  {expandedStage === si && (
                    <div className={styles.taskList}>
                      {stage.tasks.map(task => {
                        const done = !!completedTasks[task.id]
                        return (
                          <div key={task.id} className={`${styles.taskItem} ${done ? styles.taskDone : ''}`}>
                            <button className={styles.taskCheck} onClick={() => toggleTask(task.id)}>
                              {done ? '✅' : '⬜'}
                            </button>
                            <div className={styles.taskContent}>
                              <div className={styles.taskTitle}>{task.title}</div>
                              <div className={styles.taskDesc}>{task.desc}</div>
                              <div className={styles.taskMeta}>
                                <span>⏱ {task.duration}</span>
                              </div>
                              {done && completedTasks[task.id]?.feeling && (
                                <div className={styles.taskFeeling}>"{completedTasks[task.id].feeling}"</div>
                              )}
                              {!done && <div className={styles.taskTip}>💡 {task.tip}</div>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {view === 'stories' && (
        <>
          <div className={styles.storyFilter}>
            {storyCategories.map(c => (
              <button
                key={c.key}
                className={`${styles.filterBtn} ${storyFilter === c.key ? styles.filterActive : ''}`}
                onClick={() => setStoryFilter(c.key)}
              >{c.label}</button>
            ))}
          </div>
          <div className={styles.storyList}>
            {(storyFilter === 'all' ? peerStories : peerStories.filter(s => s.category === storyFilter)).map(story => (
              <div key={story.id} className={styles.storyCard} onClick={() => { setActiveStory(story.id); setView('storyDetail') }}>
                <div className={styles.storyCardTitle}>{story.title}</div>
                <div className={styles.storyCardSummary}>{story.summary}</div>
                <div className={styles.storyTags}>
                  {story.tags.map(t => <span key={t} className={styles.storyTag}>#{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className={styles.disclaimer}>
        以上内容仅供参考，不替代专业心理咨询和医疗建议。
      </div>
      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  )
}
