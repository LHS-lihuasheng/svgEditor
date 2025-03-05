/**
 * @description 拖放相关类型定义
 */
import { ComponentType } from './component';

// 拖放位置枚举
export type DropPosition = 'before' | 'after' | 'nested';

// 拖放项定义
export interface DragItem {
  id: string;
  type: ComponentType;
  isToolItem?: boolean;
  index?: number;
  parentId?: string | null;
  dropPosition?: DropPosition;
  x?: number;
  y?: number;
}

/**
 * @description 获取放置位置显示名称
 * @param {DropPosition} position - 放置位置
 * @returns {string} 位置显示名称
 */
export function getDropPositionName(position: DropPosition): string {
  const names = {
    'before': '前面',
    'after': '后面',
    'nested': '内部'
  };
  return names[position];
} 