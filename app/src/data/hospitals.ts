export interface Hospital {
  id: number;
  name: string;
  level: string;
  address: string;
  phone: string;
  tel: string;
  area: string;
  tags: string[];
  hours: string;
}

export const hospitals: Hospital[] = [
  { id: 1, name: '上海市精神卫生中心', level: '三甲', address: '宛平南路600号', phone: '021-64387250', tel: 'tel:02164387250', area: '徐汇', tags: ['抑郁症专科', '门诊', '急诊'], hours: '周一至周日 8:00-16:00' },
  { id: 2, name: '长海医院', level: '三甲', address: '长海路168号', phone: '021-31166666', tel: 'tel:02131166666', area: '杨浦', tags: ['心理科', '门诊'], hours: '周一至周五 8:00-17:00' },
  { id: 3, name: '上海市第十人民医院', level: '三甲', address: '延长中路301号', phone: '021-66300588', tel: 'tel:02166300588', area: '静安', tags: ['心身科', '门诊'], hours: '周一至周五 8:00-17:00' },
  { id: 4, name: '同济大学附属同济医院', level: '三甲', address: '普陀区新村路389号', phone: '021-56051080', tel: 'tel:02156051080', area: '普陀', tags: ['精神科', '门诊'], hours: '周一至周五 8:00-17:00' },
  { id: 5, name: '上海交通大学医学院附属仁济医院', level: '三甲', address: '浦东新区东方路1630号', phone: '021-58752345', tel: 'tel:02158752345', area: '浦东', tags: ['心理科', '门诊'], hours: '周一至周五 8:00-17:00' },
  { id: 6, name: '浦东新区精神卫生中心', level: '二甲', address: '三林路165号', phone: '021-58335550', tel: 'tel:02158335550', area: '浦东', tags: ['康复指导', '社区随访'], hours: '周一至周五 8:00-16:30' },
  { id: 7, name: '徐汇区精神卫生中心', level: '二甲', address: '宛平南路600号', phone: '021-64387250', tel: 'tel:02164387250', area: '徐汇', tags: ['心理咨询', '团体治疗'], hours: '周一至周五 8:00-16:30' },
  { id: 8, name: '静安区精神卫生中心', level: '二甲', address: '静安区共和新路2500号', phone: '021-56051234', tel: 'tel:02156051234', area: '静安', tags: ['心理咨询', '社区随访'], hours: '周一至周五 8:00-16:30' },
  { id: 9, name: '杨浦区精神卫生中心', level: '二甲', address: '周家桥路388号', phone: '021-65191234', tel: 'tel:02165191234', area: '杨浦', tags: ['康复指导', '门诊'], hours: '周一至周五 8:00-16:30' },
  { id: 10, name: '虹口区精神卫生中心', level: '二甲', address: '虹口区四平路421弄20号', phone: '021-65412345', tel: 'tel:02165412345', area: '虹口', tags: ['心理咨询', '门诊'], hours: '周一至周五 8:00-16:30' },
]

export const areas: string[] = ['全部区域', '徐汇', '杨浦', '静安', '普陀', '浦东', '虹口']
