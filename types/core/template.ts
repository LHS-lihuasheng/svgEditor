/**
 * @description 组件模板相关类型定义
 */
import { ComponentType } from './component';
import { PropertyControl } from './property/index';

// 组件模板基础接口
export interface BaseComponentTemplate {
  label: string;
  icon: React.ReactNode | string;
  description?: string;
  category?: string;
  propertyControls?: PropertyControl[];
  preview?: string;
  tags?: string[];
  author?: string;
  version?: string;
  defaultProperties?: Record<string, any>;
}

// 组件模板映射类型
export type ComponentTemplateMap = {
  [key in ComponentType]: BaseComponentTemplate;
};