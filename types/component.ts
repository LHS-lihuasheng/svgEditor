import { PropertyStorageName } from './propertyStorage';
import type { TEMPLATE } from './templateStorage';

// 基础组件类型定义
export interface BaseComponent {
  id: string;
  type: TEMPLATE;
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
  fixedProperties?: string[];
  defaultProperties: Record<string, any>;
  propertyStorageName: PropertyStorageName;
}
