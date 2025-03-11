/**
 * @description 属性控件工具函数
 */
import type { PropertyControlType } from './types';

// 通用属性控件接口
export interface PropertyControl {
  property: string;             // 属性路径 (如 'style.fill')
  type: PropertyControlType;    // 控件类型
  label: string;                // 显示标签
  category?: string;            // 属性分类
  defaultValue?: any;           // 默认值
  options?: Array<{ label: string; value: any }>; // 选项 (用于select)
  isFixed?: boolean;            // 是否为固定属性 (不可删除)
  isDefault?: boolean;          // 是否为默认包含的属性
  min?: number;                 // 最小值 (用于number)
  max?: number;                 // 最大值 (用于number)
  step?: number;                // 步长 (用于number)
}

// 创建属性控件工厂函数
export function createPropertyControl(
  property: string,
  type: PropertyControlType,
  label: string,
  options: Partial<PropertyControl> = {}
): PropertyControl {
  return {
    property,
    type,
    label,
    defaultValue: undefined,
    isFixed: false,
    isDefault: false,
    ...options
  };
} 