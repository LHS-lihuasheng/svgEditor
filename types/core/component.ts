// 基础组件类型定义
export interface BaseComponent {
  id: string;
  type: ComponentType;
  name?: string;
  children?: BaseComponent[];
  attributes?: Record<string, any>;
  style?: Record<string, any>;
  description?: string;
  parent?: string | null;
  animationMode?: 'values' | 'fromTo' | 'fromBy' | 'to' | 'by';
  [key: string]: any;
}

// 组件类型枚举
export type ComponentType =
  | 'svgPic'
  | 'svgSeamlessPic'
  | 'g'
  | 'rect'
  | 'set'
  | 'animate'
  | 'animateTransform';
