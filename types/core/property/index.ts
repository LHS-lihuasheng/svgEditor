// 导出类型和工具函数
export * from './utils';

// 导出所有控件集合
import { SVG_PROPERTY } from './svgProperty';
import { RECT_PROPERTY } from './rectProperty';
import { GROUP_PROPERTY } from './groupProperty';
import { ANIMATE_PROPERTY } from './animateProperty';
import { ANIMATE_TRANSFORM_PROPERTY } from './animateTransformProperty';
import { FOREIGN_OBJECT_PROPERTY } from './foreignObjectProperty';
import { SET_PROPERTY } from './setProperty';
import { TemplateType } from '@/types/core';
// 组件类型到属性库的映射
export const COMPONENT_TYPE_TO_PROPERTY: Record<TemplateType, Record<string, PropertyControl>> = {
    'svgPic': SVG_PROPERTY,
    'svgSeamlessPic': SVG_PROPERTY,
    'rect': RECT_PROPERTY,
    'g': GROUP_PROPERTY,
    'animate': ANIMATE_PROPERTY,
    'animateTransform': ANIMATE_TRANSFORM_PROPERTY,
    'set': SET_PROPERTY,
    'foreignObject': FOREIGN_OBJECT_PROPERTY
  };

export * from './svgProperty';
export * from './rectProperty';
export * from './groupProperty';
export * from './animateProperty';
export * from './animateTransformProperty';
export * from './foreignObjectProperty';
export * from './setProperty';