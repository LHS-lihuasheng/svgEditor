/**
 * @description 核心类型定义入口文件
 * 统一导出所有基础类型，确保类型一致性
 */

export * from './component';
export * from './drag';
export * from './property/index';
export * from './component';

export type {
    PropertyControlType
} from './property/types';

export type {
    PropertyControl
} from './property/utils';