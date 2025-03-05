// 基础组件接口
export interface BaseComponent {
    id: string
    type: ComponentType
    children?: BaseComponent[]
    customProperties?: Record<string, any>
}

// 组件类型定义
export type ComponentType = 'svgPic' | 'g' | 'rect' | 'set';  // 可继续扩展其他类型

// 拖放项定义
export interface DragItem {
    id?: string
    type: ComponentType
    isToolItem?: boolean
    index?: number
    parentId?: string | null
    dropPosition?: 'before' | 'after' | 'nested'
}

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
    allowedChildren?: ComponentType[];  // 允许的子组件类型
}

// 属性控制器类型
export interface PropertyControl {
    type: 'string' | 'number' | 'boolean' | 'select' | 'color' | 'image';
    label: string;
    property: string;  // 属性路径（支持嵌套，如'style.backgroundImage'）
    defaultValue?: any;
    options?: Array<{ label: string; value: any }>;  // 为select类型提供选项
    min?: number;      // 数值最小值
    max?: number;      // 数值最大值
    step?: number;     // 数值步长
}

// 定义嵌套规则
export const CONTAINER_COMPONENTS: ComponentType[] = ['svgPic', 'g', 'rect'];

// 每种组件允许的子组件类型
export const ALLOWED_CHILDREN: Record<ComponentType, ComponentType[]> = {
    'svgPic': ['g', 'rect'],
    'g': ['g', 'rect'],
    'rect': ['set'],  // rect只允许包含set动画
    'set': []         // set不允许有子组件
}; 