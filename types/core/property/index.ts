/**
 * @description 属性控件类型定义
 */


// 导出类型和工具函数
export * from './utils';

// 导出所有控件集合
export { SVG_PROPERTY } from './svgProperty';
export { RECT_PROPERTY } from './rectProperty';
export { GROUP_PROPERTY } from './groupProperty';
export { ANIMATE_PROPERTY } from './animateProperty';
export { ANIMATE_TRANSFORM_PROPERTY } from './animateTransformProperty';
export { SET_PROPERTY } from './setProperty';

// 创建属性控件工厂函数
export function createPropertyControl(
  property: string,
  type: PropertyControlType,
  label: string,
  options: any = {}
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