// 基础组件类型定义
export interface BaseComponent {
  id: string;
  type: BasicTag;
  name?: string;
  attributes?: Record<string, any>;
  style?: Record<string, any>;
  children: BaseComponent[];
  fixedProperties?: string[];
  animationMode?: 'values' | 'fromTo' | 'fromBy' | 'to' | 'by';
  [key: string]: any;
}

export type BasicTag = 'svg' | 'g' | 'rect' | 'set' | 'animate' | 'animateTransform' | 'foreignObject' | 'section';

export type ComponentCategory = 'basic' | 'animation' | 'packedTemplate';

export const categoryDisplayNames: Record<ComponentCategory, string> = {
  basic: '基础',
  animation: '动画',
  packedTemplate: '封装模版'
};

// 导出分类数组，方便UI渲染
export const COMPONENT_CATEGORIES: ComponentCategory[] = ['basic', 'animation', 'packedTemplate'];

export interface BaseComponentTemplate {
  templateName: string;
  icon: string;
  category: ComponentCategory;
  description?: string;
  component: BaseComponent[];
}