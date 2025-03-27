/**
 * @description 组件模板系统入口
 * 统一注册和导出所有组件模板
 */
import { SVG_PIC_TEMPLATE } from './svgTemplate';
import { GROUP_TEMPLATE } from './groupTemplate';
import { RECT_TEMPLATE } from './rectTemplate';
import { SET_TEMPLATE } from './setTemplate';
import { ANIMATE_TEMPLATE } from './animateTemplate';
import { ANIMATE_TRANSFORM_TEMPLATE } from './animateTransformTemplate';
import { FOREIGN_OBJECT_TEMPLATE } from './foreignObjectTemplate';
import { SECTION_TEMPLATE } from './sectionTemplate';
import { BaseComponentTemplate } from '@/types/component';
import { FO_SVG_TEMPLATE } from './foSvg';

// 注册所有组件模板
export const COMPONENT_TEMPLATES: BaseComponentTemplate[] = [
  SVG_PIC_TEMPLATE,
  GROUP_TEMPLATE,
  RECT_TEMPLATE,
  SET_TEMPLATE,
  ANIMATE_TEMPLATE,
  ANIMATE_TRANSFORM_TEMPLATE,
  FOREIGN_OBJECT_TEMPLATE,
  SECTION_TEMPLATE,
  FO_SVG_TEMPLATE
];