/**
 * @description 组件模板系统入口
 * 统一注册和导出所有组件模板
 */
import { ComponentType } from '@/types/core';
import { SVG_PIC_TEMPLATE, SVG_SEAMLESS_PIC_TEMPLATE } from './svgTemplate';
import { GROUP_TEMPLATE } from './groupTemplate';
import { RECT_TEMPLATE } from './rectTemplate';
import { SET_TEMPLATE } from './setTemplate';
import { ANIMATE_TEMPLATE } from './animateTemplate';
import { ANIMATE_TRANSFORM_TEMPLATE } from './animateTransformTemplate';
import { FOREIGN_OBJECT_TEMPLATE } from './foreignObjectTemplate';
import { BaseComponentTemplate } from '@/types/core/template';
// 所有支持的组件类型数组，用于全局共享
export const ALL_COMPONENT_TYPES: ComponentType[] = ['svgPic', 'svgSeamlessPic', 'g', 'rect', 'set', 'animate', 'animateTransform', 'foreignObject'];

// 注册所有组件模板
export const COMPONENT_TEMPLATES: Record<string, BaseComponentTemplate> = {
  svgPic: SVG_PIC_TEMPLATE,
  svgSeamlessPic: SVG_SEAMLESS_PIC_TEMPLATE,
  g: GROUP_TEMPLATE,
  rect: RECT_TEMPLATE,
  set: SET_TEMPLATE,
  animate: ANIMATE_TEMPLATE,
  animateTransform: ANIMATE_TRANSFORM_TEMPLATE,
  foreignObject: FOREIGN_OBJECT_TEMPLATE
};

/**
 * @description 获取组件模板
 * @param {ComponentType} type - 组件类型
 * @returns 组件模板或默认模板
 */
export function getComponentTemplate(type: string): BaseComponentTemplate | undefined {
  return COMPONENT_TEMPLATES[type];
}