/**
 * @description 属性控制相关类型定义
 */

// 属性控制器类型
export interface PropertyControl {
  type: 'string' | 'number' | 'boolean' | 'select' | 'color' | 'image';
  label: string;
  property: string;
  defaultValue?: any;
  options?: Array<{ label: string; value: any }>;
  min?: number;
  max?: number;
  step?: number;
}

// 属性选项定义
export interface PropertyOption {
  label: string;
  value: any;
}

// 常用控制器配置
export const COMMON_CONTROLS = {
  position: {
    type: 'select',
    label: '定位方式',
    property: 'style.position',
    options: [
      { label: '相对定位', value: 'relative' },
      { label: '绝对定位', value: 'absolute' },
      { label: '固定定位', value: 'fixed' }
    ],
    defaultValue: 'relative'
  },
  opacity: {
    type: 'number',
    label: '透明度',
    property: 'style.opacity',
    min: 0,
    max: 1,
    step: 0.1,
    defaultValue: 1
  }
} as const; 