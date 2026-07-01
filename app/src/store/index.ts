import { createStore } from 'vuex'
import checkin from './modules/checkin'
import medication from './modules/medication'
import wrap from './modules/wrap'
import cbt from './modules/cbt'

export default createStore({
  modules: { checkin, medication, wrap, cbt }
})
