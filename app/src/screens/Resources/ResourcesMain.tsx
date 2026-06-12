import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Dimensions,
} from 'react-native';
import { colors, spacing, radius, shadows, typography } from '../../styles/theme';
import { hospitals, areas } from '../../data/hospitals';
import { hotlines } from '../../data/hotlines';
import { communityResources } from '../../data/community';
import { insurancePolicies } from '../../data/insurance';
import {
  familyCourses,
  FamilyCourse,
} from '../../data/familyCourses';
import {
  familyActionGuide,
  FamilyActionGuideItem,
} from '../../data/familyGuide';
import {
  caregiverQuestions,
  getScoreLevel,
  defaultSelfCareItems,
} from '../../data/caregiverAssessment';
import {
  socialStages,
  SocialStage,
} from '../../data/socialTasks';
import {
  peerStories,
  storyCategories,
  PeerStory,
} from '../../data/peerStories';
import useAsyncStorage from '../../hooks/useAsyncStorage';

// ========================
// Types
// ========================

type TabKey =
  | 'hospitals'
  | 'hotlines'
  | 'community'
  | 'insurance'
  | 'family'
  | 'rebuild';

interface TabConfig {
  key: TabKey;
  label: string;
}

type FamilyView = 'list' | 'course' | 'assessment' | 'result';
type RebuildView = 'tasks' | 'stories' | 'storyDetail' | 'record';

// ========================
// Constants
// ========================

const tabs: TabConfig[] = [
  { key: 'hospitals', label: '医院' },
  { key: 'hotlines', label: '热线' },
  { key: 'community', label: '社区' },
  { key: 'insurance', label: '医保' },
  { key: 'family', label: '家属' },
  { key: 'rebuild', label: '重建' },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_WIDTH = SCREEN_WIDTH / 3;

// ========================
// Component
// ========================

export default function ResourcesMain() {
  const [activeTab, setActiveTab] = useState<TabKey>('hospitals');
  const [area, setArea] = useState('全部区域');

  const filteredHospitals = useMemo(
    () =>
      area === '全部区域'
        ? hospitals
        : hospitals.filter((h) => h.area === area),
    [area],
  );

  const handleCall = useCallback((tel: string) => {
    Linking.openURL(tel).catch(() => {});
  }, []);

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>服务中心</Text>
      <Text style={styles.headerSub}>上海本地心理健康服务</Text>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsScroll}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.tabActive,
            ]}
            activeOpacity={0.7}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Hospitals Tab
  const renderHospitals = () => (
    <View style={styles.panel}>
      {/* Area Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {areas.map((a) => (
          <TouchableOpacity
            key={a}
            style={[
              styles.filterChip,
              area === a && styles.filterChipActive,
            ]}
            activeOpacity={0.7}
            onPress={() => setArea(a)}
          >
            <Text
              style={[
                styles.filterChipText,
                area === a && styles.filterChipTextActive,
              ]}
            >
              {a}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filteredHospitals.map((h) => (
        <View key={h.id} style={styles.resCard}>
          <Text style={styles.cardName}>{h.name}</Text>
          <Text style={styles.cardInfo}>
            {h.level} · {h.address}
          </Text>
          <View style={styles.cardTags}>
            {h.tags.map((t) => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleCall(h.tel)}
          >
            <Text style={styles.cardLink}>📞 {h.phone}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  // Hotlines Tab
  const renderHotlines = () => (
    <View style={styles.panel}>
      {hotlines.map((h) => (
        <View
          key={h.id}
          style={[styles.hotlineCard, h.featured && styles.hotlineFeatured]}
        >
          <Text style={styles.hotlineName}>
            {h.featured ? '🔴' : '📞'} {h.name}
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleCall(h.tel)}
          >
            <Text
              style={[
                styles.hotlineNum,
                h.featured && styles.hotlineNumFeatured,
              ]}
            >
              {h.number}
            </Text>
          </TouchableOpacity>
          <Text style={styles.hotlineTime}>
            {h.hours} {h.featured ? '· 免费' : ''}
          </Text>
        </View>
      ))}
    </View>
  );

  // Community Tab
  const renderCommunity = () => (
    <View style={styles.panel}>
      {communityResources.map((c) => (
        <View key={c.id} style={styles.resCard}>
          <Text style={styles.cardName}>{c.name}</Text>
          <Text style={styles.cardInfo}>
            {c.area} · {c.address}
          </Text>
          <View style={styles.cardTags}>
            {c.services.map((s) => (
              <View key={s} style={[styles.tag, styles.tagSuccess]}>
                <Text style={[styles.tagText, styles.tagTextSuccess]}>
                  {s}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  // Insurance Tab
  const renderInsurance = () => (
    <View style={styles.panel}>
      {insurancePolicies.map((p) => (
        <View key={p.id} style={styles.policyItem}>
          <Text style={styles.policyTitle}>{p.title}</Text>
          <Text style={styles.policyDesc}>
            {p.desc}
            <Text style={styles.policyHighlight}>{p.highlight}</Text>
          </Text>
          {p.detail ? (
            <Text style={styles.policyDetail}>{p.detail}</Text>
          ) : null}
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderTabs()}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'hospitals' && renderHospitals()}
        {activeTab === 'hotlines' && renderHotlines()}
        {activeTab === 'community' && renderCommunity()}
        {activeTab === 'insurance' && renderInsurance()}
        {activeTab === 'family' && <FamilyTabContent />}
        {activeTab === 'rebuild' && <RebuildTabContent />}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

// ========================
// Family Tab Content
// ========================

function FamilyTabContent() {
  const [view, setView] = useState<FamilyView>('list');
  const [activeCourseIdx, setActiveCourseIdx] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useAsyncStorage<Record<string, boolean>>(
    'sgt-family-progress',
    {},
  );
  const [assessments, setAssessments] = useAsyncStorage<
    Array<{
      date: string;
      answers: Record<number, number>;
      totalScore: number;
      level: string;
      timestamp: number;
    }>
  >('sgt-caregiver-assessments', []);
  const [selfCareItems, setSelfCareItems] = useAsyncStorage<string[]>(
    'sgt-caregiver-selfcare',
    defaultSelfCareItems,
  );
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [expandedGuide, setExpandedGuide] = useState<number | null>(null);
  const [showSelfCare, setShowSelfCare] = useState(false);

  const openCourse = (idx: number) => {
    setActiveCourseIdx(idx);
    setActiveStep(0);
    setView('course');
  };

  const completeCourse = (courseId: string) => {
    setProgress((prev) => ({ ...prev, [courseId]: true }));
    setView('list');
    setActiveCourseIdx(null);
  };

  const submitAssessment = () => {
    if (Object.keys(answers).length < caregiverQuestions.length) return;
    const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
    const level = getScoreLevel(totalScore);
    const record = {
      date: new Date().toISOString().split('T')[0],
      answers: { ...answers },
      totalScore,
      level: level.level,
      timestamp: Date.now(),
    };
    setAssessments((prev) => [record, ...prev].slice(0, 30));
    setView('result');
  };

  // Course Detail View
  if (view === 'course' && activeCourseIdx !== null) {
    const course = familyCourses[activeCourseIdx];
    const step = course.steps[activeStep];
    const isLast = activeStep === course.steps.length - 1;
    const isCompleted = progress[course.id];

    return (
      <View style={styles.panel}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => setView('list')}
        >
          <Text style={styles.backBtnText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.courseTitle}>
          {course.icon} {course.title}
        </Text>
        <View style={styles.stepDots}>
          {course.steps.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeStep && styles.dotActive,
                i < activeStep && styles.dotDone,
              ]}
            />
          ))}
        </View>
        <View style={styles.stepCard}>
          <Text style={styles.stepType}>{step.type}</Text>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepBody}>{step.body}</Text>
        </View>
        <View style={styles.stepNav}>
          <TouchableOpacity
            style={[styles.navBtn, activeStep === 0 && styles.navBtnDisabled]}
            disabled={activeStep === 0}
            onPress={() => setActiveStep((s) => s - 1)}
          >
            <Text style={styles.navBtnText}>上一步</Text>
          </TouchableOpacity>
          {isLast ? (
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => completeCourse(course.id)}
            >
              <Text style={styles.navBtnText}>
                {isCompleted ? '已完成 ✓' : '完成课程'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => setActiveStep((s) => s + 1)}
            >
              <Text style={styles.navBtnText}>下一步</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // Assessment View
  if (view === 'assessment') {
    return (
      <View style={styles.panel}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => setView('list')}
        >
          <Text style={styles.backBtnText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>💪 照护者压力自评</Text>
        <Text style={styles.sectionDesc}>
          请根据你最近一周的真实感受评分（1=完全不符合，5=完全符合）
        </Text>
        {caregiverQuestions.map((q, i) => (
          <View key={q.id} style={styles.questionItem}>
            <Text style={styles.questionText}>
              {i + 1}. {q.text}
            </Text>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((v) => (
                <TouchableOpacity
                  key={v}
                  style={[
                    styles.ratingBtn,
                    answers[q.id] === v && styles.ratingBtnSelected,
                  ]}
                  onPress={() =>
                    setAnswers((prev) => ({ ...prev, [q.id]: v }))
                  }
                >
                  <Text
                    style={[
                      styles.ratingBtnText,
                      answers[q.id] === v && styles.ratingBtnTextSelected,
                    ]}
                  >
                    {v}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={submitAssessment}
        >
          <Text style={styles.submitBtnText}>提交自评</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Result View
  if (view === 'result' && assessments.length > 0) {
    const latest = assessments[0];
    const level = getScoreLevel(latest.totalScore);
    return (
      <View style={styles.panel}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => setView('list')}
        >
          <Text style={styles.backBtnText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>自评结果</Text>
        <View
          style={[
            styles.resultCard,
            { backgroundColor: level.bgColor, borderColor: level.color },
          ]}
        >
          <Text style={[styles.resultScore, { color: level.color }]}>
            {latest.totalScore} / 40
          </Text>
          <Text style={[styles.resultLabel, { color: level.color }]}>
            {level.label}
          </Text>
          <Text style={styles.resultAdvice}>{level.advice}</Text>
        </View>
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={() => setView('list')}
        >
          <Text style={styles.submitBtnText}>返回家属支持</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Main List View
  return (
    <View style={styles.panel}>
      {/* Family Courses */}
      <Text style={styles.sectionTitle}>📖 家属教育课程</Text>
      <Text style={styles.sectionDesc}>
        为照护者提供的心理学知识，帮助更好地支持家人
      </Text>
      <View style={styles.gap}>
        {familyCourses.map((c, i) => (
          <TouchableOpacity
            key={c.id}
            style={[
              styles.courseCard,
              progress[c.id] && styles.courseCardDone,
            ]}
            activeOpacity={0.7}
            onPress={() => openCourse(i)}
          >
            <Text style={styles.courseIcon}>{c.icon}</Text>
            <View style={styles.courseInfo}>
              <Text style={styles.courseName}>{c.title}</Text>
              <Text style={styles.courseDesc}>{c.desc}</Text>
            </View>
            {progress[c.id] && (
              <Text style={styles.doneBadge}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Family Action Guide */}
      <Text style={styles.sectionTitle}>🎯 家属行动指南</Text>
      <Text style={styles.sectionDesc}>
        根据患者当前状态，采取不同的支持策略
      </Text>
      <View style={styles.gap}>
        {familyActionGuide.map((g, i) => (
          <View
            key={g.level}
            style={[styles.guideCard, { borderLeftColor: g.color }]}
          >
            <TouchableOpacity
              style={styles.guideHeader}
              activeOpacity={0.7}
              onPress={() =>
                setExpandedGuide(expandedGuide === i ? null : i)
              }
            >
              <Text style={styles.guideIcon}>{g.icon}</Text>
              <Text style={[styles.guideLabel, { color: g.color }]}>
                {g.label}
              </Text>
              <Text style={styles.guideArrow}>
                {expandedGuide === i ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>
            {expandedGuide === i && (
              <View style={styles.guideBody}>
                <Text style={styles.guideDesc}>{g.description}</Text>
                <Text style={styles.guideSubTitle}>✅ 建议做的事：</Text>
                {g.doList.map((item, j) => (
                  <Text key={j} style={styles.guideItem}>
                    • {item}
                  </Text>
                ))}
                <Text style={styles.guideSubTitle}>❌ 应避免的事：</Text>
                {g.dontList.map((item, j) => (
                  <Text key={j} style={styles.guideItem}>
                    • {item}
                  </Text>
                ))}
                <View
                  style={[
                    styles.guideReminder,
                    { backgroundColor: g.bgColor },
                  ]}
                >
                  <Text style={[styles.guideReminderText, { color: g.color }]}>
                    💡 {g.keyReminder}
                  </Text>
                </View>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Caregiver Assessment */}
      <Text style={styles.sectionTitle}>💪 照护者压力自评</Text>
      <Text style={styles.sectionDesc}>
        关注自己的状态，才能更好地支持家人
      </Text>
      <TouchableOpacity
        style={styles.assessBtn}
        onPress={() => {
          setAnswers({});
          setView('assessment');
        }}
      >
        <Text style={styles.assessBtnText}>开始自评</Text>
      </TouchableOpacity>
      {assessments.length > 0 && (
        <Text style={styles.assessLast}>
          上次：
          {assessments[0].totalScore}分 ·{' '}
          {getScoreLevel(assessments[0].totalScore).label}
        </Text>
      )}

      {/* Self Care */}
      <TouchableOpacity
        style={styles.selfCareHeader}
        onPress={() => setShowSelfCare(!showSelfCare)}
      >
        <Text style={styles.sectionTitle}>🌿 自我关怀清单</Text>
        <Text style={styles.guideArrow}>
          {showSelfCare ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>
      {showSelfCare && (
        <View style={styles.selfCareList}>
          {selfCareItems.map((item, i) => (
            <View key={i} style={styles.selfCareItem}>
              <Text
                style={styles.selfCareText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item || '添加一项自我关怀活动'}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setSelfCareItems((prev) =>
                    prev.filter((_, idx) => idx !== i),
                  )
                }
              >
                <Text style={styles.removeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addSelfCareBtn}
            onPress={() =>
              setSelfCareItems((prev) => [...prev, ''])
            }
          >
            <Text style={styles.addSelfCareBtnText}>+ 添加</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          以上内容仅供参考，不替代专业心理咨询和医疗建议。
        </Text>
      </View>
    </View>
  );
}

// ========================
// Rebuild Tab Content
// ========================

function RebuildTabContent() {
  const [view, setView] = useState<RebuildView>('tasks');
  const [completedTasks, setCompletedTasks] = useAsyncStorage<
    Record<string, { completedAt: string; feeling: string }>
  >('sgt-social-tasks', {});
  const [expandedStage, setExpandedStage] = useState<number | null>(null);
  const [storyFilter, setStoryFilter] = useState('all');
  const [activeStory, setActiveStory] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const totalTasks = useMemo(
    () => socialStages.reduce((a, s) => a + s.tasks.length, 0),
    [],
  );
  const doneTasks = useMemo(
    () => Object.keys(completedTasks).length,
    [completedTasks],
  );

  const toggleTask = (taskId: string) => {
    if (completedTasks[taskId]) {
      setCompletedTasks((prev) => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });
    } else {
      setCompletedTasks((prev) => ({
        ...prev,
        [taskId]: { completedAt: new Date().toISOString(), feeling: '' },
      }));
      setToast('🌱 很棒！你又迈出了一步');
      setTimeout(() => setToast(''), 2000);
    }
  };

  // Story Detail
  if (view === 'storyDetail' && activeStory) {
    const story = peerStories.find((s) => s.id === activeStory);
    if (!story) return null;
    return (
      <View style={styles.panel}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            setActiveStory(null);
            setView('stories');
          }}
        >
          <Text style={styles.backBtnText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.storyTitle}>{story.title}</Text>
        <View style={styles.storyTags}>
          {story.tags.map((t) => (
            <View key={t} style={styles.storyTag}>
              <Text style={styles.storyTagText}>#{t}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.storyBody}>{story.body}</Text>
        <Text style={styles.storyFooter}>
          — 一位正在康复中的朋友
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.panel}>
      {/* Sub Navigation */}
      <View style={styles.subNav}>
        <TouchableOpacity
          style={[styles.subTab, view === 'tasks' && styles.subTabActive]}
          onPress={() => setView('tasks')}
        >
          <Text
            style={[styles.subTabText, view === 'tasks' && styles.subTabTextActive]}
          >
            📋 社交任务
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.subTab, view === 'stories' && styles.subTabActive]}
          onPress={() => setView('stories')}
        >
          <Text
            style={[
              styles.subTabText,
              view === 'stories' && styles.subTabTextActive,
            ]}
          >
            👥 同伴故事
          </Text>
        </TouchableOpacity>
      </View>

      {view === 'tasks' && (
        <>
          {/* Stats */}
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>
                {doneTasks}/{totalTasks}
              </Text>
              <Text style={styles.statLabel}>已完成任务</Text>
            </View>
          </View>

          {/* Social Stages */}
          <View style={styles.gap}>
            {socialStages.map((stage, si) => {
              const stageDone = stage.tasks.filter(
                (t) => completedTasks[t.id],
              ).length;
              return (
                <View key={stage.id} style={styles.stageCard}>
                  <TouchableOpacity
                    style={styles.stageHeader}
                    activeOpacity={0.7}
                    onPress={() =>
                      setExpandedStage(expandedStage === si ? null : si)
                    }
                  >
                    <Text style={styles.stageIcon}>{stage.icon}</Text>
                    <View style={styles.stageInfo}>
                      <Text style={styles.stageName}>{stage.title}</Text>
                      <Text style={styles.stageDesc}>{stage.desc}</Text>
                    </View>
                    <View style={styles.stageMeta}>
                      <Text style={styles.stageProgress}>
                        {stageDone}/{stage.tasks.length}
                      </Text>
                      <Text style={styles.stageArrow}>
                        {expandedStage === si ? '▲' : '▼'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  {expandedStage === si && (
                    <View style={styles.taskList}>
                      {stage.tasks.map((task) => {
                        const done = !!completedTasks[task.id];
                        return (
                          <TouchableOpacity
                            key={task.id}
                            style={[
                              styles.taskItem,
                              done && styles.taskItemDone,
                            ]}
                            activeOpacity={0.7}
                            onPress={() => toggleTask(task.id)}
                          >
                            <Text style={styles.taskCheck}>
                              {done ? '✅' : '⬜'}
                            </Text>
                            <View style={styles.taskContent}>
                              <Text
                                style={[
                                  styles.taskTitle,
                                  done && styles.taskTitleDone,
                                ]}
                              >
                                {task.title}
                              </Text>
                              <Text style={styles.taskDesc}>{task.desc}</Text>
                              <Text style={styles.taskMeta}>
                                ⏱ {task.duration}
                              </Text>
                              {!done && (
                                <Text style={styles.taskTip}>
                                  💡 {task.tip}
                                </Text>
                              )}
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </>
      )}

      {view === 'stories' && (
        <>
          {/* Story Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storyFilter}
          >
            {storyCategories.map((c) => (
              <TouchableOpacity
                key={c.key}
                style={[
                  styles.filterChip,
                  storyFilter === c.key && styles.filterChipActive,
                ]}
                onPress={() => setStoryFilter(c.key)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    storyFilter === c.key && styles.filterChipTextActive,
                  ]}
                >
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Story List */}
          <View style={styles.gap}>
            {(storyFilter === 'all'
              ? peerStories
              : peerStories.filter((s) => s.category === storyFilter)
            ).map((story) => (
              <TouchableOpacity
                key={story.id}
                style={styles.storyCard}
                activeOpacity={0.7}
                onPress={() => {
                  setActiveStory(story.id);
                  setView('storyDetail');
                }}
              >
                <Text style={styles.storyCardTitle}>{story.title}</Text>
                <Text style={styles.storyCardSummary}>{story.summary}</Text>
                <View style={styles.storyTags}>
                  {story.tags.map((t) => (
                    <View key={t} style={styles.storyTag}>
                      <Text style={styles.storyTagText}>#{t}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          以上内容仅供参考，不替代专业心理咨询和医疗建议。
        </Text>
      </View>

      {toast ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ========================
// Styles
// ========================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  bottomSpacer: {
    height: spacing['2xl'],
  },

  // Header
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  headerSub: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textSecondary,
  },

  // Tabs
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  tabsScroll: {
    paddingHorizontal: spacing.sm,
  },
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.xs,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },

  // Panel
  panel: {
    paddingTop: spacing.md,
  },

  // Filter
  filterScroll: {
    marginBottom: spacing.md,
  },
  filterContent: {
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },

  // Resource Cards
  resCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  cardName: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cardInfo: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  cardTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.bg,
  },
  tagText: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    color: colors.textSecondary,
  },
  tagSuccess: {
    backgroundColor: '#E8F5E9',
  },
  tagTextSuccess: {
    color: colors.success,
  },
  cardLink: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },

  // Hotline Cards
  hotlineCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  hotlineFeatured: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: colors.danger,
  },
  hotlineName: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  hotlineNum: {
    fontFamily: typography.fontFamily,
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  hotlineNumFeatured: {
    color: colors.danger,
  },
  hotlineTime: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.textHint,
  },

  // Insurance
  policyItem: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  policyTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  policyDesc: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  policyHighlight: {
    fontWeight: '700',
    color: colors.primary,
    fontSize: 16,
  },
  policyDetail: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.textHint,
    marginTop: spacing.xs,
  },

  // Back Button
  backBtn: {
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    alignSelf: 'flex-start',
  },
  backBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    color: colors.primary,
  },

  // Section
  sectionTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sectionDesc: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    color: colors.textHint,
    marginBottom: spacing.md,
  },
  gap: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },

  // Course
  courseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadows.sm,
  },
  courseCardDone: {
    opacity: 0.7,
  },
  courseIcon: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  courseInfo: {
    flex: 1,
  },
  courseName: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  courseDesc: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.textHint,
  },
  doneBadge: {
    fontFamily: typography.fontFamily,
    fontSize: 18,
    color: colors.success,
  },
  courseTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  stepDots: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  dotDone: {
    backgroundColor: colors.success,
  },
  stepCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  stepType: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  stepTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  stepBody: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  stepNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  navBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  navBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Guide
  guideCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    borderLeftWidth: 4,
    ...shadows.sm,
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  guideIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  guideLabel: {
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '600',
  },
  guideArrow: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.textHint,
  },
  guideBody: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  guideDesc: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  guideSubTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  guideItem: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    marginLeft: spacing.sm,
  },
  guideReminder: {
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  guideReminderText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    lineHeight: 18,
  },

  // Assessment
  questionItem: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  questionText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  ratingBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingBtnSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  ratingBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  ratingBtnTextSelected: {
    color: '#FFFFFF',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  submitBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  assessBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  assessBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  assessLast: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    color: colors.textHint,
  },
  resultCard: {
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  resultScore: {
    fontFamily: typography.fontFamily,
    fontSize: 36,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  resultLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  resultAdvice: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Self Care
  selfCareHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  selfCareList: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  selfCareItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.sm,
  },
  selfCareText: {
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textPrimary,
  },
  removeBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 16,
    color: colors.textHint,
    paddingHorizontal: spacing.sm,
  },
  addSelfCareBtn: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  addSelfCareBtnText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },

  // Sub Navigation
  subNav: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    ...shadows.sm,
  },
  subTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  subTabActive: {
    backgroundColor: colors.primary,
  },
  subTabText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textSecondary,
  },
  subTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Stats
  stats: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontFamily: typography.fontFamily,
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.textHint,
  },

  // Social Stages
  stageCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    ...shadows.sm,
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  stageIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  stageInfo: {
    flex: 1,
  },
  stageName: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  stageDesc: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.textHint,
  },
  stageMeta: {
    alignItems: 'flex-end',
  },
  stageProgress: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 2,
  },
  stageArrow: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.textHint,
  },
  taskList: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  taskItemDone: {
    opacity: 0.6,
  },
  taskCheck: {
    fontSize: 18,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
  },
  taskDesc: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  taskMeta: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    color: colors.textHint,
    marginBottom: 2,
  },
  taskTip: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.accent,
    lineHeight: 18,
  },

  // Stories
  storyFilter: {
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  storyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadows.sm,
  },
  storyCardTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  storyCardSummary: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  storyTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  storyTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.bg,
  },
  storyTagText: {
    fontFamily: typography.fontFamily,
    fontSize: 11,
    color: colors.textHint,
  },
  storyTitle: {
    fontFamily: typography.fontFamily,
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  storyBody: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  storyFooter: {
    fontFamily: typography.fontFamily,
    fontSize: 13,
    color: colors.textHint,
    fontStyle: 'italic',
    textAlign: 'right',
  },

  // Disclaimer
  disclaimer: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.bgWarm,
    borderRadius: radius.md,
  },
  disclaimerText: {
    fontFamily: typography.fontFamily,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  // Toast
  toast: {
    position: 'absolute',
    bottom: 40,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.textPrimary,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadows.lg,
  },
  toastText: {
    fontFamily: typography.fontFamily,
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
