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

// 库名到属性库的映射
export const ALL_PROPERTY_STORAGE = {
  'SVG': SVG_PROPERTY,
  'RECT': RECT_PROPERTY,
  'GROUP': GROUP_PROPERTY,
  'ANIMATE': ANIMATE_PROPERTY,
  'ANIMATE_TRANSFORM': ANIMATE_TRANSFORM_PROPERTY,
  'SET': SET_PROPERTY,
  'FOREIGN_OBJECT': FOREIGN_OBJECT_PROPERTY,
  'SECTION': SECTION_PROPERTY
};
