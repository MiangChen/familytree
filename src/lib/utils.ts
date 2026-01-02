import { Member } from '@/types/family';

// 获取配偶ID数组（兼容旧的单配偶数据）
export function getSpouseIds(member: Member): number[] {
  if (member.spouseIds && Array.isArray(member.spouseIds)) {
    return member.spouseIds;
  }
  if (member.spouseId) {
    return [member.spouseId];
  }
  return [];
}

// 对成员排序，让夫妻排在一起，并按性别和排行排序
export function sortMembersByCouple(members: Member[]): Member[] {
  // 先按性别和排行对成员进行排序
  const sortedByOrder = [...members].sort((a, b) => {
    // 先按性别排序：男在前，女在后
    const genderA = a.gender === 'female' ? 1 : 0;
    const genderB = b.gender === 'female' ? 1 : 0;
    if (genderA !== genderB) return genderA - genderB;
    
    // 同性别按排行排序
    const orderA = a.birthOrder || 999;
    const orderB = b.birthOrder || 999;
    return orderA - orderB;
  });
  
  // 然后处理夫妻配对
  const sorted: Member[] = [];
  const added = new Set<number>();
  
  sortedByOrder.forEach(member => {
    if (added.has(member.id)) return;
    
    sorted.push(member);
    added.add(member.id);
    
    // 如果有配偶，紧跟着添加所有配偶
    const spouseIds = getSpouseIds(member);
    spouseIds.forEach(spouseId => {
      const spouse = members.find(m => m.id === spouseId);
      if (spouse && !added.has(spouse.id)) {
        sorted.push(spouse);
        added.add(spouse.id);
      }
    });
  });
  
  return sorted;
}

// 构建年份显示
export function formatYears(birthYear?: number | null, deathYear?: number | null): string {
  if (birthYear && deathYear) {
    return `${birthYear} - ${deathYear}`;
  } else if (birthYear) {
    return `生于 ${birthYear}`;
  } else if (deathYear) {
    return `卒于 ${deathYear}`;
  }
  return '';
}

// 截断简介
export function truncateBio(bio?: string, maxLength = 20): string {
  if (!bio) return '';
  return bio.length > maxLength ? bio.substring(0, maxLength) + '...' : bio;
}
