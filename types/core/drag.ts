/**
 * @description 拖放相关类型定义
 */
import { TemplateType } from './component';

// 拖放位置枚举
export type DropPosition = 'before' | 'after' | 'nested';

// 拖放项定义
export interface DragItem {
  id: string;
  type: TemplateType;
  isToolItem?: boolean;
  index?: number;
  parentId?: string | null;
  dropPosition?: DropPosition;
  x?: number;
  y?: number;
}