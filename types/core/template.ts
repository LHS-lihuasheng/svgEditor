/**
 * @description 组件模板相关类型定义
 */
import { ComponentType } from './component';
import { PropertyControl } from './property';

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
  allowedChildren?: ComponentType[];
  defaultProperties?: Record<string, any>;
}

// 组件模板映射类型
export type ComponentTemplateMap = {
  [key in ComponentType]: BaseComponentTemplate;
};

/**
 * @description 注册组件模板的辅助函数
 * @param {ComponentTemplateMap} templates - 组件模板映射
 * @param {ComponentType} type - 要注册的组件类型
 * @param {BaseComponentTemplate} template - 组件模板
 * @returns {ComponentTemplateMap} 更新后的模板映射
 */
export function registerTemplate(
  templates: Partial<ComponentTemplateMap>,
  type: ComponentType,
  template: BaseComponentTemplate
): Partial<ComponentTemplateMap> {
  return {
    ...templates,
    [type]: template
  };
} 