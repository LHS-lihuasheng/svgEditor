// 统一导出所有组件类型
export { type ComponentType, type DragItem } from './baseComponent';
export type { SVGPicComponent } from './svgComponent';
export type { GroupComponent } from './groupComponent';
export type { RectComponent } from './rectComponent';
export type { BaseComponent } from './baseComponent';

// 统一导出模板
import { SVG_PIC_TEMPLATE } from './svgComponent';
import { GROUP_TEMPLATE } from './groupComponent';
import { RECT_TEMPLATE } from './rectComponent';

export const COMPONENT_TEMPLATES = {
    'svgPic': SVG_PIC_TEMPLATE,
    'g': GROUP_TEMPLATE,
    'rect': RECT_TEMPLATE
} as const;

