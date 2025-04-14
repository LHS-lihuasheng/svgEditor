/**
 * @description 属性仓库索引
 */
import { BasicTag } from '@/types/component';
import type { propertyStorage } from './types';

// 导出类型和工具函数
export * from './types';

// 导出所有控件集合
import { SVG_PROPERTY } from './svgProperty';
import { RECT_PROPERTY } from './rectProperty';
import { GROUP_PROPERTY } from './groupProperty';
import { ANIMATE_PROPERTY } from './animateProperty';
import { ANIMATE_TRANSFORM_PROPERTY } from './animateTransformProperty';
import { FOREIGN_OBJECT_PROPERTY } from './foreignObjectProperty';
import { SET_PROPERTY } from './setProperty';
import { SECTION_PROPERTY } from './sectionProperty';

export const ALL_PROPERTY_STORAGE: Record<BasicTag, propertyStorage> = {
  'svg': SVG_PROPERTY,
  'rect': RECT_PROPERTY,
  'g': GROUP_PROPERTY,
  'animate': ANIMATE_PROPERTY,
  'animateTransform': ANIMATE_TRANSFORM_PROPERTY,
  'set': SET_PROPERTY,
  'foreignObject': FOREIGN_OBJECT_PROPERTY,
  'section': SECTION_PROPERTY
};
