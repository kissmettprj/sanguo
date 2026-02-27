import { FACTIONS, ROLES, FACTION_NAMES, ROLE_NAMES } from './constants';

// 边框颜色（代表身份）
export const STROKE_COLORS = {
  [ROLES.LORD]: '#FFD700',      // 主公 - 金色
  [ROLES.MINISTER]: '#87CEEB',   // 文臣 - 天蓝色
  [ROLES.GENERAL]: '#FF6347',    // 武将 - 番茄红
  [ROLES.UNKNOWN]: '#F5F5F5',    // 未知 - 白灰色
};

// 填充颜色（代表势力）
export const FILL_COLORS = {
  [FACTIONS.WEI]: '#1E90FF',    // 魏 - 蓝色
  [FACTIONS.SHU]: '#228B22',    // 蜀 - 绿色
  [FACTIONS.WU]: '#FF8C00',     // 吴 - 橙色
  [FACTIONS.UNKNOWN]: '#808080', // 未知 - 灰色
};

// 获取节点样式
export function getNodeStyle(faction, role) {
  return {
    stroke: STROKE_COLORS[role] || STROKE_COLORS[ROLES.UNKNOWN],
    fill: FILL_COLORS[faction] || FILL_COLORS[FACTIONS.UNKNOWN],
  };
}

// 获取势力名称
export function getFactionName(faction) {
  return FACTION_NAMES[faction] || FACTION_NAMES[FACTIONS.UNKNOWN];
}

// 获取身份名称
export function getRoleName(role) {
  return ROLE_NAMES[role] || ROLE_NAMES[ROLES.UNKNOWN];
}
