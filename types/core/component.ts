import { PropertyControl } from './property/index';

// 基础组件类型定义
export interface BaseComponent {
  id: string;
  type: TemplateType;
  name?: string;
  children: BaseComponent[];
  attributes?: Record<string, any>;
  style?: Record<string, any>;
  description?: string;
  parent?: string | null;
  animationMode?: 'values' | 'fromTo' | 'fromBy' | 'to' | 'by';
  [key: string]: any;
}

export interface BaseComponentTemplate {
  label: string;
  icon: React.ReactNode | string;
  description?: string;
  propertyControls?: PropertyControl[];
  defaultProperties?: Record<string, any>;
}

// 组件类型枚举
export type TemplateType =
  | 'svgPic'
  | 'svgSeamlessPic'
  | 'g'
  | 'rect'
  | 'set'
  | 'animate'
  | 'animateTransform'
  | 'foreignObject';
