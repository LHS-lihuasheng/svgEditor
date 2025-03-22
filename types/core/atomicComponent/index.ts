/**
 * @description 组件模板系统入口
 * 统一注册和导出所有组件模板
 */
import { TemplateType } from '@/types/core';
import { SVG_PIC_TEMPLATE, SVG_SEAMLESS_PIC_TEMPLATE } from './svgTemplate';
import { GROUP_TEMPLATE } from './groupTemplate';
import { RECT_TEMPLATE } from './rectTemplate';
import { SET_TEMPLATE } from './setTemplate';
import { ANIMATE_TEMPLATE } from './animateTemplate';
import { ANIMATE_TRANSFORM_TEMPLATE } from './animateTransformTemplate';
import { FOREIGN_OBJECT_TEMPLATE } from './foreignObjectTemplate';
import { BaseComponentTemplate } from '@/types/core/component';

// 注册所有组件模板
export const COMPONENT_TEMPLATES: Record<TemplateType, BaseComponentTemplate> = {
  svgPic: SVG_PIC_TEMPLATE,
  svgSeamlessPic: SVG_SEAMLESS_PIC_TEMPLATE,
  g: GROUP_TEMPLATE,
  rect: RECT_TEMPLATE,
  set: SET_TEMPLATE,
  animate: ANIMATE_TEMPLATE,
  animateTransform: ANIMATE_TRANSFORM_TEMPLATE,
  foreignObject: FOREIGN_OBJECT_TEMPLATE
};