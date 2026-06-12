export interface Hotline {
  id: number;
  name: string;
  number: string;
  tel: string;
  desc: string;
  hours: string;
  featured: boolean;
}

export const hotlines: Hotline[] = [
  { id: 1, name: '上海市心理援助热线', number: '962525', tel: 'tel:962525', desc: '24小时免费心理援助', hours: '24小时', featured: true },
  { id: 2, name: '全国心理援助热线', number: '400-161-9995', tel: 'tel:4001619995', desc: '全国心理危机干预热线', hours: '24小时', featured: true },
  { id: 3, name: '生命热线', number: '400-821-1215', tel: 'tel:4008211215', desc: '生命教育与危机干预', hours: '每天 8:00-22:00', featured: false },
  { id: 4, name: '希望24热线', number: '400-161-9995', tel: 'tel:4001619995', desc: '心理危机干预热线', hours: '24小时', featured: false },
  { id: 5, name: '上海公共卫生热线', number: '12320-5', tel: 'tel:12320', desc: '上海市公共卫生服务热线', hours: '工作日 8:30-17:00', featured: false },
  { id: 6, name: '青少年心理咨询热线', number: '12355', tel: 'tel:12355', desc: '共青团中央心理热线', hours: '每天 8:30-20:30', featured: false },
]
