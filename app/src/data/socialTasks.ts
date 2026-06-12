export interface SocialTask {
  id: string;
  title: string;
  desc: string;
  duration: string;
  tip: string;
}

export interface SocialStage {
  id: string;
  title: string;
  icon: string;
  desc: string;
  color: string;
  tasks: SocialTask[];
}

export const socialStages: SocialStage[] = [
  {
    id: 'micro', title: '微小社交', icon: '🌱',
    desc: '从最小的社交动作开始，打破社交冻结', color: '#6BAF7A',
    tasks: [
      { id: 'micro_1', title: '给一个朋友发一条消息', desc: '不需要长篇大论，一句"最近怎么样？"就够了', duration: '1分钟', tip: '如果不知道说什么，可以分享一张你今天看到的照片' },
      { id: 'micro_2', title: '在群里回复一条消息', desc: '任何一个你所在的群聊，回复别人的消息即可', duration: '1分钟', tip: '不需要主动开启话题，回复本身就是参与' },
      { id: 'micro_3', title: '给家人打个电话', desc: '和父母、兄弟姐妹或亲近的家人通一个电话', duration: '5-10分钟', tip: '如果不知道说什么，可以聊聊今天吃了什么' },
      { id: 'micro_4', title: '对服务人员说声谢谢', desc: '对快递员、外卖员、收银员等说一声真诚的谢谢', duration: '10秒', tip: '这是一种低压力的正向社交互动' },
    ],
  },
  {
    id: 'low', title: '低强度社交', icon: '💬',
    desc: '恢复社交接触，在线上建立安全感', color: '#4A90D9',
    tasks: [
      { id: 'low_1', title: '参加一次线上活动', desc: '参与一次线上读书会、观影会或兴趣小组', duration: '30-60分钟', tip: '可以只旁听不发言，慢慢适应' },
      { id: 'low_2', title: '和朋友视频通话', desc: '与一位朋友进行视频通话，看到彼此的脸', duration: '10-20分钟', tip: '提前告诉朋友你可能话不多，真正的朋友会理解' },
      { id: 'low_3', title: '在社交平台发一条动态', desc: '分享一张照片、一首歌或一段感悟', duration: '5分钟', tip: '不需要完美，真实的分享最有力量' },
      { id: 'low_4', title: '给一位很久没联系的朋友发消息', desc: '重新连接一段曾经的关系', duration: '5分钟', tip: '"好久不见，最近还好吗？"就是最好的开场白' },
    ],
  },
  {
    id: 'medium', title: '中等社交', icon: '☕',
    desc: '重建真实连接，面对面交流', color: '#E8C95A',
    tasks: [
      { id: 'med_1', title: '与一位朋友面对面见面', desc: '约一位信任的朋友喝咖啡或散步', duration: '30-60分钟', tip: '选择让你感到舒适的环境，公园或安静的咖啡馆都不错' },
      { id: 'med_2', title: '参加一次兴趣活动', desc: '参加手工课、绘画班、瑜伽课等小型兴趣活动', duration: '1-2小时', tip: '专注于活动本身，社交是自然而然的副产品' },
      { id: 'med_3', title: '主动邀请别人做一件事', desc: '主动邀请朋友或同事一起做某件事', duration: '视活动而定', tip: '被拒绝不等于被拒绝，也许只是时间不合适' },
    ],
  },
  {
    id: 'challenge', title: '挑战性社交', icon: '🎯',
    desc: '扩展社交圈，尝试新的社交场景', color: '#E8985E',
    tasks: [
      { id: 'chal_1', title: '参加一个小型聚会', desc: '参加朋友组织的聚餐、生日会等小型聚会', duration: '2-3小时', tip: '给自己设定一个"退场时间"，知道可以随时离开会减轻压力' },
      { id: 'chal_2', title: '加入一个新的社群或俱乐部', desc: '加入跑步群、读书会、志愿者组织等', duration: '视活动而定', tip: '找到一个和你有共同兴趣的群体，社交会自然发生' },
      { id: 'chal_3', title: '在公共场合做一件小事', desc: '在咖啡店点单时和店员多聊两句，或在电梯里和邻居打招呼', duration: '1分钟', tip: '微小的勇敢也是勇敢' },
    ],
  },
  {
    id: 'return', title: '回归性社交', icon: '🌈',
    desc: '社会功能全面恢复，回归日常社交生活', color: '#9B59B6',
    tasks: [
      { id: 'ret_1', title: '恢复工作/学习中的社交', desc: '主动参与工作或学习中的团队交流、讨论', duration: '日常', tip: '一步一步来，先从一对一交流开始' },
      { id: 'ret_2', title: '组织一次小型活动', desc: '邀请几个朋友一起做一件事', duration: '半天', tip: '你比自己想象的更有能力创造连接' },
      { id: 'ret_3', title: '帮助其他正在康复的人', desc: '分享你的经验，成为别人的"过来人"', duration: '灵活', tip: '帮助他人本身就是最好的疗愈' },
    ],
  },
]
