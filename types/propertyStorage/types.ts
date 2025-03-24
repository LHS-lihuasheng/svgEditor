/**
 * @description 属性控件工具函数和类型定义
 */

import { ALL_PROPERTY_STORAGE } from './index';

// 基础属性配置接口 - 所有控件共有的属性
interface BasePropertyConfig {
  label: string;                // 显示标签
  description: string;         // 描述文本
  defaultValue: any;           // 默认值
  showLabel: boolean;          // 是否显示标签
}

// 字符串控件配置
export interface StringPropertyConfig extends BasePropertyConfig {
  controlType: 'string';
  placeholder: string;         // 输入占位符
}

// 数字控件配置
export interface NumberPropertyConfig extends BasePropertyConfig {
  controlType: 'number';
  min: number;                 // 最小值
  max: number;                 // 最大值
  step: number;                // 步长
  placeholder: string;         // 输入占位符
}

// 布尔控件配置
export interface BooleanPropertyConfig extends BasePropertyConfig {
  controlType: 'boolean';
}

// 选择控件配置
export interface SelectPropertyConfig extends BasePropertyConfig {
  controlType: 'select';
  options: Array<{ label: string; value: any }>; // 选项列表
  placeholder: string;         // 选择占位符
}

// 颜色控件配置
export interface ColorPropertyConfig extends BasePropertyConfig {
  controlType: 'color';
  presetColors: string[];      // 预设颜色列表
}

// 图片控件配置
export interface ImagePropertyConfig extends BasePropertyConfig {
  controlType: 'image';
  acceptTypes: string;         // 接受的文件类型
}

// 四值字段定义
export interface QuadValueField {
  key: string;                  // 字段名称
  label: string;                // 显示标签
  defaultValue: number;         // 默认值
  min: number;                 // 最小值
  max: number;                 // 最大值
  step: number;                // 步长
  width: string;               // 宽度
}

// 四值控件配置
export interface QuadValuePropertyConfig extends BasePropertyConfig {
  controlType: 'quadValue';
  fieldConfig: QuadValueField[]; // 四值字段配置
  layout: "grid" | "flex" | "stack"; // 布局类型
  gridCols: number;            // 网格列数
  groupLabel: string;          // 分组标签
}

// 变换控件配置
export interface TransformPropertyConfig extends BasePropertyConfig {
  controlType: 'transform';
}

// 滑块控件配置
export interface SliderPropertyConfig extends BasePropertyConfig {
  controlType: 'slider';
  min: number;                  // 最小值
  max: number;                  // 最大值
  step: number;                // 步长
  inputWidth: string;          // 输入框宽度
}

// 触发器控件配置
export interface TriggerPropertyConfig extends BasePropertyConfig {
  controlType: 'trigger';
  options: Array<{ label: string; value: string }>; // 触发器类型选项
}

// 重复次数控件配置
export interface RepeatCountPropertyConfig extends BasePropertyConfig {
  controlType: 'repeatCount';
  options: Array<{ label: string; value: string }>; // 重复次数选项
}

// 合并所有控件配置类型
export type propertyConfig =
  | StringPropertyConfig
  | NumberPropertyConfig
  | BooleanPropertyConfig
  | SelectPropertyConfig
  | ColorPropertyConfig
  | ImagePropertyConfig
  | QuadValuePropertyConfig
  | TransformPropertyConfig
  | SliderPropertyConfig
  | TriggerPropertyConfig
  | RepeatCountPropertyConfig;

// 属性存储接口
export interface propertyStorage {
  attributes: { [propertyName: string]: propertyConfig; };
  style: { [propertyName: string]: propertyConfig; };
}

export type category = keyof propertyStorage;

// PropertyControlType 联合类型
export type PropertyControlType = propertyConfig['controlType'];

// 便捷创建属性配置的工厂函数
export function createProperty<T extends PropertyControlType>(
  controlType: T,
  label: string,
  options: Partial<Omit<Extract<propertyConfig, { controlType: T }>, 'controlType' | 'label'>> = {}
): Extract<propertyConfig, { controlType: T }> {
  return {
    controlType,
    label,
    showLabel: true,
    description: '',
    defaultValue: undefined,
    ...(controlType === 'string' ? { placeholder: '' } : {}),
    ...(controlType === 'number' ? { min: 0, max: 100, step: 1, placeholder: '' } : {}),
    ...(controlType === 'select' ? { options: [], placeholder: '' } : {}),
    ...(controlType === 'color' ? { presetColors: [] } : {}),
    ...(controlType === 'image' ? { acceptTypes: 'image/*' } : {}),
    ...(controlType === 'quadValue' ? {
      fieldConfig: [],
      layout: 'grid',
      gridCols: 2,
      groupLabel: ''
    } : {}),
    ...(controlType === 'slider' ? { min: 0, max: 100, step: 1, inputWidth: '80px' } : {}),
    ...(controlType === 'trigger' ? { options: [] } : {}),
    ...(controlType === 'repeatCount' ? { options: [] } : {}),
    ...options
  } as Extract<propertyConfig, { controlType: T }>;
}

export type PropertyStorageName = keyof typeof ALL_PROPERTY_STORAGE;