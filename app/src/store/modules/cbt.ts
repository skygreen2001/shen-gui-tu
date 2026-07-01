import { loadData, saveData } from '../storage'

const CBT_KEY = 'sgt-cbt-progress'

export default {
  namespaced: true,
  state: () => ({
    progress: loadData<Record<string, any>>(CBT_KEY, {})
  }),
  mutations: {
    COMPLETE_STEP(state, payload: { courseId: string; stepIdx: number }) {
      if (!state.progress[payload.courseId]) state.progress[payload.courseId] = {}
      state.progress[payload.courseId][payload.stepIdx] = true
      saveData(CBT_KEY, state.progress)
    },
    COMPLETE_COURSE(state, courseId: string) {
      if (!state.progress[courseId]) state.progress[courseId] = {}
      state.progress[courseId].completed = true
      saveData(CBT_KEY, state.progress)
    },
    SAVE_PROGRESS(state, payload: { courseId: number; progress: any }) {
      state.progress[payload.courseId] = payload.progress
      saveData(CBT_KEY, state.progress)
    }
  },
  actions: {
    saveProgress({ commit }, payload: { courseId: number; progress: any }) {
      commit('SAVE_PROGRESS', payload)
    }
  },
  getters: {
    isStepCompleted: (state) => (courseId: string, stepIdx: number) => {
      return state.progress[courseId]?.[stepIdx] || false
    },
    isCourseCompleted: (state) => (courseId: string) => {
      return state.progress[courseId]?.completed || false
    },
    courseProgress: (state) => (courseId: string, totalSteps: number) => {
      const data = state.progress[courseId] || {}
      const completed = Object.values(data).filter(v => v === true).length
      return { completed, total: totalSteps, percent: totalSteps > 0 ? Math.round((completed / totalSteps) * 100) : 0 }
    }
  }
}

