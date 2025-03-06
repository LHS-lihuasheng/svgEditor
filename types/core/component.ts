/**
 * @description 组件核心类型定义
 */
import { PropertyControl } from './property';

// 基础组件类型定义
export type ComponentType = 'svgPic' | 'svgSeamlessPic' | 'g' | 'rect' | 'set';

// 基础组件接口
export interface BaseComponent {
  id: string;
  type: ComponentType;
  style?: React.CSSProperties;
  children?: BaseComponent[];
  customProperties?: Record<string, any>;

  // 组件类型特定属性
  viewBox?: ViewBox;
  attributes?: Record<string, any>;
}

// 视图框定义
export interface ViewBox {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

// 组件嵌套规则
export const CONTAINER_COMPONENTS: ComponentType[] = ['svgPic', 'g', 'rect'];

// 每种组件允许的子组件类型
export const ALLOWED_CHILDREN: Record<ComponentType, ComponentType[]> = {
  'svgPic': ['g', 'rect'],
  'g': ['g', 'rect'],
  'rect': ['set'],
  'set': []
};

/**
 * @description 检查组件类型是否可以包含子组件
 * @param {ComponentType} type - 组件类型
 * @returns {boolean} 是否可以包含子组件
 */
export function canContainChildren(type: ComponentType): boolean {
  return ALLOWED_CHILDREN[type].length > 0;
}

/**
 * @description 检查父组件类型是否可以包含指定的子组件类型
 * @param {ComponentType} parentType - 父组件类型
 * @param {ComponentType} childType - 子组件类型
 * @returns {boolean} 是否允许嵌套
 */
export function canNestComponentType(parentType: ComponentType, childType: ComponentType): boolean {
  return ALLOWED_CHILDREN[parentType].includes(childType);
}

// 添加到现有文件中
export interface Margin {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
} 