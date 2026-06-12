export interface FamilyActionGuideItem {
  level: string;
  label: string;
  color: string;
  bgColor: string;
  icon: string;
  description: string;
  doList: string[];
  dontList: string[];
  keyReminder: string;
}

export const familyActionGuide: FamilyActionGuideItem[] = [
  {
    level: 'green',
    label: '稳定期',
    color: '#4CAF50',
    bgColor: '#E8F5E9',
    icon: '🟢',
    description: '患者状态稳定，日常功能良好，能主动管理康复计划。',
    doList: [
      '保持日常关心，但不要过度关注',
      '鼓励患者坚持用药和定期复诊',
      '支持患者独立管理自己的康复计划',
      '一起参与愉快的活动（散步、看电影等）',
      '肯定患者的进步和努力',
    ],
    dontList: [
      '不要因为状态好就自行减药或停药',
      '不要频繁询问"你今天感觉怎么样"',
      '不要把所有话题都围绕病情',
    ],
    keyReminder: '稳定期是巩固治疗效果的关键阶段，保持规律生活最重要。',
  },
  {
    level: 'yellow',
    label: '关注期',
    color: '#FF9800',
    bgColor: '#FFF3E0',
    icon: '🟡',
    description: '患者出现一些波动，如睡眠变差、动力下降、情绪不稳，但尚能维持日常功能。',
    doList: [
      '增加陪伴时间，主动倾听',
      '温和地提醒患者使用自助工具（签到、呼吸练习）',
      '帮助维持基本的生活规律（作息、饮食）',
      '观察并记录变化，必要时分享给医生',
      '鼓励患者表达感受，不要急于"解决问题"',
    ],
    dontList: [
      '不要忽视变化，认为"过几天就好了"',
      '不要指责患者"又开始了"',
      '不要替患者做所有决定',
    ],
    keyReminder: '关注期是干预的最佳时机，及早关注可以有效预防复发。',
  },
  {
    level: 'orange',
    label: '预警期',
    color: '#E65100',
    bgColor: '#FBE9E7',
    icon: '🟠',
    description: '患者症状明显加重，日常功能受到影响，可能需要调整治疗方案。',
    doList: [
      '协助预约医生或心理咨询',
      '增加日常监督，确保按时服药',
      '减少环境中的压力源',
      '确保家中环境安全',
      '联系其他家庭成员共同关注',
    ],
    dontList: [
      '不要试图独自处理',
      '不要强迫患者做他做不到的事',
      '不要在患者面前表现出过度焦虑',
    ],
    keyReminder: '预警期需要专业介入，家属的角色是连接患者和专业帮助的桥梁。',
  },
  {
    level: 'red',
    label: '危机期',
    color: '#D32F2F',
    bgColor: '#FFEBEE',
    icon: '🔴',
    description: '患者可能存在自伤风险或完全无法维持基本生活功能，需要立即行动。',
    doList: [
      '不要让患者独处',
      '立即联系专业帮助（962525 / 400-161-9995）',
      '移除环境中的危险物品',
      '保持冷静，用温和的语气与患者交流',
      '如需紧急医疗救助，拨打 120',
    ],
    dontList: [
      '不要忽视任何自伤表达',
      '不要与患者争辩或说教',
      '不要承诺保守可能危及生命的秘密',
    ],
    keyReminder: '危机期安全第一。不要犹豫，立即寻求专业帮助。你的冷静和陪伴是最重要的。',
  },
]
