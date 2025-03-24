/**
 * @description 属性控件工具函数
 */

import { ALL_PROPERTY_STORAGE } from './index';

// 四值字段定义
export interface QuadValueField {
  key: string;     // 字段名称
  label: string;   // 显示标签
  defaultValue: number; // 默认值
}

// 通用属性控件接口
export interface propertyConfig {
  controlType: PropertyControlType;    // 控件类型
  label: string;                // 显示标签
  defaultValue?: any;           // 默认值
  options?: Array<{ label: string; value: any }>; // 选项 (用于select)
  min?: number;                 // 最小值 (用于number和slider)
  max?: number;                 // 最大值 (用于number和slider)
  step?: number;                // 步长 (用于number和slider)
  fieldConfig?: QuadValueField[]; // 多值字段配置 (用于quadValue)
}

export interface propertyStorage {
  attributes: { [propertyName: string]: propertyConfig; };
  style: { [propertyName: string]: propertyConfig; };
}

export type category = keyof propertyStorage;

// 创建属性配置工厂函数
export function createProperty(
  controlType: PropertyControlType,
  label: string,
  options: Partial<propertyConfig> = {}
): propertyConfig {
  return {
    controlType,
    label,
    ...options
  };
}

export type PropertyControlType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'select'
  | 'color'
  | 'image'
  | 'quadValue'
  | 'transform'
  | 'slider'
  | 'trigger';


export type PropertyStorageName = keyof typeof ALL_PROPERTY_STORAGE;