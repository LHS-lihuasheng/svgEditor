/**
 * @description 核心类型定义入口文件
 * 统一导出所有基础类型，确保类型一致性
 */

export * from './component';
export * from './drag';
export * from './propertyStorage/index';
export * from './templateStorage/index';

import { propertyConfig } from './propertyStorage/types';

// 统一控件接口
export interface ControlProps {
    propertyConfig: propertyConfig;
    value: any;
    onChange: (value: any) => void;
}
