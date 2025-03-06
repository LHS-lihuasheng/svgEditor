/**
 * @description 组件模板系统入口
 * 统一注册和导出所有组件模板
 */
import { ComponentType, ComponentTemplateMap } from '@/types/core';
import { SVG_PIC_TEMPLATE } from './svgTemplate';
import { SVG_SEAMLESS_PIC_TEMPLATE } from './svgTemplate';
import { GROUP_TEMPLATE } from './groupTemplate';
import { RECT_TEMPLATE } from './rectTemplate';
import { SET_TEMPLATE } from './setTemplate';
// 所有支持的组件类型数组，用于全局共享
export const ALL_COMPONENT_TYPES: ComponentType[] = ['svgPic', 'svgSeamlessPic', 'g', 'rect', 'set'];

// 注册所有组件模板
export const COMPONENT_TEMPLATES: ComponentTemplateMap = {
  'svgPic': SVG_PIC_TEMPLATE,
  'svgSeamlessPic': SVG_SEAMLESS_PIC_TEMPLATE,
  'g': GROUP_TEMPLATE,
  'rect': RECT_TEMPLATE,
  'set': SET_TEMPLATE
};

/**
 * @description 获取组件模板
 * @param {ComponentType} type - 组件类型
 * @returns 组件模板或默认模板
 */
export function getComponentTemplate(type: ComponentType) {
  return COMPONENT_TEMPLATES[type] || {
    icon: '📦',
    label: String(type),
    allowedChildren: ALL_COMPONENT_TYPES
  };
}

/**
 * @description 获取指定组件类型允许的子组件类型列表
 * @param {ComponentType} type - 组件类型
 * @returns {ComponentType[]} 允许的子组件类型列表
 */
export function getAllowedChildrenTypes(type: ComponentType): ComponentType[] {
  // 忽略模板中的限制，默认返回所有组件类型
  return ALL_COMPONENT_TYPES;
}

// 更新各模板的allowedChildren属性
Object.values(COMPONENT_TEMPLATES).forEach(template => {
  template.allowedChildren = ALL_COMPONENT_TYPES;
}); 