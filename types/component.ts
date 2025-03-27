import { PropertyStorageName } from './propertyStorage';

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

export interface BaseComponentTemplate {
  templateName: string;
  description?: string;
  component: BaseComponent[];
}

export type BasicTag = 'svg' | 'g' | 'rect' | 'set' | 'animate' | 'animateTransform' | 'foreignObject' | 'section';

