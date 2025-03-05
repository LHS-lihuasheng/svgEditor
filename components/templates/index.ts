/**
 * @description 组件模板系统入口
 * 统一注册和导出所有组件模板
 */
import { ComponentType, ComponentTemplateMap } from '@/types/core';
import { SVG_PIC_TEMPLATE } from './svgPicTemplate';
import { GROUP_TEMPLATE } from './groupTemplate';
import { RECT_TEMPLATE } from './rectTemplate';
import { SET_TEMPLATE } from './setTemplate';

// 注册所有组件模板
export const COMPONENT_TEMPLATES: ComponentTemplateMap = {
  'svgPic': SVG_PIC_TEMPLATE,
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
    allowedChildren: []
  };
}

/**
 * @description 获取指定组件类型允许的子组件类型列表
 * @param {ComponentType} type - 组件类型
 * @returns {ComponentType[]} 允许的子组件类型列表
 */
export function getAllowedChildrenTypes(type: ComponentType): ComponentType[] {
  const template = COMPONENT_TEMPLATES[type];
  return template?.allowedChildren || [];
} 