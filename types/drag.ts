/**
 * @description 拖放相关类型定义
 */
import { BaseComponent } from './component';
// 拖放位置枚举
export type DropPosition = 'before' | 'after' | 'nested';

// 拖放项定义
export interface DragItem {
  component: BaseComponent[];
  dropPosition?: DropPosition;
  x?: number;
  y?: number;
}