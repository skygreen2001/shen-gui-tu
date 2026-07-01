export const medicationDB = {
  '草酸艾司西酞普兰': {
    category: 'SSRI（选择性5-羟色胺再摄取抑制剂）',
    mechanism: '帮助大脑中血清素停留更久，让你更容易感受到积极情绪。',
    onsetTime: '2-4周开始起效，6-8周达到最佳效果',
    sideEffects: ['恶心', '头痛', '嗜睡或失眠', '性欲下降', '口干'],
    tips: ['不要突然停药，需在医生指导下逐步减量', '服药期间避免饮酒', '前两周可能出现焦虑加重，这是正常的'],
    missedDoseAdvice: '如果漏服一次，发现后尽快补服。但如果已经接近下次服药时间，跳过漏服的剂量即可，不要一次服用双倍剂量。偶尔一次漏服通常不会造成严重影响。'
  },
  '喹硫平': {
    category: '非典型抗精神病药',
    mechanism: '调节多种神经递质（血清素、多巴胺），帮助稳定情绪和改善睡眠。',
    onsetTime: '1-2周改善睡眠，2-4周改善情绪',
    sideEffects: ['嗜睡', '体重增加', '头晕', '口干', '代谢变化'],
    tips: ['常用于辅助改善睡眠', '建议睡前服用', '定期监测体重和血糖'],
    missedDoseAdvice: '漏服一次通常不会有大问题。如果用于助眠，漏服当晚可能入睡困难，这是正常的。不要自行加倍服用。'
  },
  '舍曲林': {
    category: 'SSRI（选择性5-羟色胺再摄取抑制剂）',
    mechanism: '增加大脑中血清素水平，缓解抑郁和焦虑症状。',
    onsetTime: '2-4周开始起效',
    sideEffects: ['恶心', '腹泻', '头痛', '失眠', '性功能障碍'],
    tips: ['可与食物同服以减少胃肠不适', '不要与MAOIs类药物合用'],
    missedDoseAdvice: '发现漏服后尽快补服。如果已接近下次服药时间，跳过即可。不要一次服两片。偶尔漏服一般不会引起明显不适。'
  },
  '文拉法辛': {
    category: 'SNRI（5-羟色胺和去甲肾上腺素再摄取抑制剂）',
    mechanism: '同时调节血清素和去甲肾上腺素，对情绪和精力都有改善作用。',
    onsetTime: '2-4周开始起效',
    sideEffects: ['恶心', '头痛', '出汗', '失眠', '血压升高', '性功能障碍'],
    tips: ['不要突然停药，可能产生撤药反应', '定期监测血压'],
    missedDoseAdvice: '文拉法辛漏服可能出现头晕、恶心等不适。发现后尽快补服，但不要加倍。如果经常漏服，建议和医生讨论调整方案。'
  },
  '米氮平': {
    category: 'NaSSA（去甲肾上腺素和特异性5-羟色胺抗抑郁药）',
    mechanism: '增加去甲肾上腺素和血清素释放，同时改善睡眠和食欲。',
    onsetTime: '1-2周改善睡眠和食欲，2-4周改善情绪',
    sideEffects: ['嗜睡', '食欲增加', '体重增加', '口干', '头晕'],
    tips: ['适合伴有失眠和食欲下降的患者', '因嗜睡副作用建议睡前服用'],
    missedDoseAdvice: '漏服一次通常影响不大。如果用于改善睡眠，漏服当晚可能睡眠受影响。尽快补服，不要加倍。'
  },
}

export const defaultMissedAdvice = '偶尔漏服一次通常不会造成严重影响。发现后尽快补服即可，但不要一次服用双倍剂量。如果经常漏服，建议和医生讨论是否有更方便的用药方案。'

export function getMedInfo(name) {
  return medicationDB[name] || null
}

export function getMissedDoseAdvice(name) {
  const info = medicationDB[name]
  return info?.missedDoseAdvice || defaultMissedAdvice
}
