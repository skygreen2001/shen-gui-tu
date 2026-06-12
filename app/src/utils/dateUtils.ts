/**
 * 日期工具函数
 * 用于打卡记录和用药提醒等模块的日期处理
 */

/**
 * 格式化日期为 YYYY-MM-DD 字符串
 * @param date - 可选的日期对象，默认为当前时间
 * @returns 格式化后的日期字符串
 */
export function formatDate(date?: Date): string {
  const d = date || new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 获取日期所在的 ISO 周数
 * @param date - 日期对象
 * @returns 周数（1-53）
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * 根据日期字符串生成周标识键
 * 格式为 YYYY-WXX，例如 "2026-W18"
 * @param dateStr - 日期字符串（YYYY-MM-DD 格式）
 * @returns 周标识键
 */
export function getWeekKey(dateStr: string): string {
  const d = new Date(dateStr);
  const weekNum = getWeekNumber(d);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

/**
 * 获取相对于给定日期的偏移日期字符串
 * @param date - 基准日期
 * @param days - 偏移天数（正数为未来，负数为过去）
 * @returns 格式化后的日期字符串
 */
export function getOffsetDate(date: Date, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

/**
 * 获取两个日期之间的天数差
 * @param dateA - 第一个日期
 * @param dateB - 第二个日期
 * @returns 天数差（dateA - dateB）
 */
export function daysBetween(dateA: Date, dateB: Date): number {
  const a = new Date(dateA.getFullYear(), dateA.getMonth(), dateA.getDate());
  const b = new Date(dateB.getFullYear(), dateB.getMonth(), dateB.getDate());
  return Math.round((a.getTime() - b.getTime()) / 86400000);
}

/**
 * 判断给定日期是否为今天
 * @param dateStr - 日期字符串（YYYY-MM-DD 格式）
 * @returns 是否为今天
 */
export function isToday(dateStr: string): boolean {
  return dateStr === formatDate(new Date());
}

/**
 * 获取中文星期名称
 * @param date - 日期对象
 * @returns 中文星期名称（周一 ~ 周日）
 */
export function getChineseWeekday(date: Date): string {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return weekdays[date.getDay()];
}

/**
 * 格式化日期为中文显示格式
 * 例如 "2026年5月4日 周一"
 * @param date - 日期对象
 * @returns 中文格式的日期字符串
 */
export function formatDateChinese(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = getChineseWeekday(date);
  return `${year}年${month}月${day}日 ${weekday}`;
}

/**
 * 获取过去 N 天的日期字符串数组（含今天）
 * @param days - 天数
 * @returns 日期字符串数组，从最早到最近排序
 */
export function getPastDays(days: number): string[] {
  const result: string[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    result.push(formatDate(d));
  }
  return result;
}
