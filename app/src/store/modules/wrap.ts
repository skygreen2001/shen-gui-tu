import { loadData, saveData } from '../storage'

const WRAP_KEY = 'sgt-wrap-sections'

export default {
  namespaced: true,
  state: () => ({
    sections: loadData(WRAP_KEY, null)
  }),
  mutations: {
    SET_SECTIONS(state, sections: any[]) {
      state.sections = sections
      saveData(WRAP_KEY, sections)
    },
    UPDATE_SECTION(state, payload: { sectionId: string; items: string[] }) {
      if (!state.sections) state.sections = []
      const section = state.sections.find((s: any) => s.id === payload.sectionId)
      if (section) {
        section.items = payload.items
        saveData(WRAP_KEY, state.sections)
      }
    },
    ADD_ITEM(state, payload: { sectionId: string }) {
      if (!state.sections) return
      const section = state.sections.find((s: any) => s.id === payload.sectionId)
      if (section) {
        section.items.push('新条目')
        saveData(WRAP_KEY, state.sections)
      }
    },
    REMOVE_ITEM(state, payload: { sectionId: string; index: number }) {
      if (!state.sections) return
      const section = state.sections.find((s: any) => s.id === payload.sectionId)
      if (section) {
        section.items.splice(payload.index, 1)
        saveData(WRAP_KEY, state.sections)
      }
    },
    EDIT_ITEM(state, payload: { sectionId: string; index: number; value: string }) {
      if (!state.sections) return
      const section = state.sections.find((s: any) => s.id === payload.sectionId)
      if (section) {
        section.items[payload.index] = payload.value
        saveData(WRAP_KEY, state.sections)
      }
    }
  }
}

