export const caregiverQuestions = [
  { id: 0, text: '我经常感到精疲力竭', dimension: '情绪耗竭' },
  { id: 1, text: '照顾家人后我没有时间做自己喜欢的事', dimension: '个人生活' },
  { id: 2, text: '我的睡眠质量受到了影响', dimension: '身体疲劳' },
  { id: 3, text: '我觉得自己独自承受了太多', dimension: '社交隔离' },
  { id: 4, text: '我对家人的康复感到无能为力', dimension: '无力感' },
  { id: 5, text: '我容易对家人发脾气或失去耐心', dimension: '情绪调节' },
  { id: 6, text: '我忽略了自己的身体健康', dimension: '自我忽视' },
  { id: 7, text: '我很难向他人倾诉自己的感受', dimension: '表达压抑' },
]

export const scoreLevels = [
  {
    min: 8, max: 16, level: 'low', label: '压力较低，状态良好',
    color: '#4CAF50', bgColor: '#E8F5E9',
    advice: '你目前的状态不错！继续保持自我关怀的习惯，定期关注自己的身心状态。',
  },
  {
    min: 17, max: 24, level: 'moderate', label: '中度压力，建议关注',
    color: '#FF9800', bgColor: '#FFF3E0',
    advice: '你正在承受一定的压力。建议增加自我关怀的时间，找信任的人倾诉，必要时寻求专业支持。',
  },
  {
    min: 25, max: 32, level: 'high', label: '较高压力，强烈建议寻求支持',
    color: '#E65100', bgColor: '#FBE9E7',
    advice: '你的压力水平较高，可能会影响你的身心健康。强烈建议与心理咨询师交流，同时增加休息和自我关怀时间。',
  },
  {
    min: 33, max: 40, level: 'critical', label: '压力过高，请尽快寻求帮助',
    color: '#D32F2F', bgColor: '#FFEBEE',
    advice: '你的压力水平已经很高，需要立即关注。请联系专业心理咨询师或拨打心理援助热线 962525。照顾好自己才能更好地照顾家人。',
  },
]

export function getScoreLevel(totalScore) {
  return scoreLevels.find(l => totalScore >= l.min && totalScore <= l.max) || scoreLevels[0]
}

export const defaultSelfCareItems = [
  '每周至少散步3次，每次30分钟',
  '每两周和朋友聚餐或聊天一次',
  '每天留15分钟独处时间',
  '每周看一部电影或读一本书',
  '保持规律的睡眠时间',
]
