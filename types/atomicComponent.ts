export interface Component {
  id: string
  type: 'svg'
  position: {
    x: number
    y: number
  }
  viewBox?: {  // 改为对象形式
    x?: number
    y?: number
    width?: number
    height?: number
  }
  style?: {
    backgroundImage?: string
    lineHeight?: string
    backgroundSize?: string
    backgroundRepeat?: string
    margin?: {  // 改为对象形式
      top?: number
      right?: number
      bottom?: number
      left?: number
    }
    [key: string]: any  // 允许任意样式属性
  }
  children?: Component[]  // 支持嵌套组件
  htmlContent?: string
  customProperties?: Record<string, any> // 自定义属性存储
}

export interface DragItem {
  id?: string
  type: Component['type']
  isToolItem?: boolean
  index?: number
  parentId?: string | null
  size: {
    width: number
    height: number
  }
  dropPosition?: 'before' | 'after' | 'nested'  // 拖放位置标记
}

// 模板属性接口定义
export interface ComponentTemplate {
  label: string;               // 组件显示名称
  icon: React.ReactNode | string; // 组件图标
  description?: string;        // 组件描述
  category?: string;           // 分类（基础、容器、交互等）
  defaultProperties?: {
    style?: {
      backgroundImage?: string
      lineHeight?: string
      backgroundSize?: string
      backgroundRepeat?: string
      margin?: {
        top?: number
        right?: number
        bottom?: number
        left?: number
      }
      [key: string]: any
    }
    viewBox?: {
      x?: number
      y?: number
      width?: number
      height?: number
    }
    [key: string]: any
  };
  propertyControls?: PropertyControl[];    // 属性控制器
  preview?: string;            // 预览图URL
  tags?: string[];             // 标签，用于搜索
  author?: string;             // 作者
  version?: string;            // 版本
}

// 属性控制器类型
export interface PropertyControl {
  type: 'string' | 'number' | 'boolean' | 'select' | 'color' | 'image';
  label: string;
  property: string;            // 属性路径（支持嵌套，如'style.backgroundImage'）
  defaultValue?: any;
  options?: Array<{ label: string; value: any }>; // 为select类型提供选项
  min?: number;                // 数值最小值
  max?: number;                // 数值最大值
  step?: number;               // 数值步长
}

// 预定义的组件模板
export const COMPONENT_TEMPLATES: Record<string, ComponentTemplate> = {
  'svg': {
    label: 'SVG Container',
    icon: '🖼️',
    description: 'SVG图片容器，可设置背景图和样式',
    category: '容器',
    defaultProperties: {
      style: {
        lineHeight: '0',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        margin: {}  // 空对象作为默认值
      },
      viewBox: {}  // 空对象作为默认值
    },
    propertyControls: [
      {
        type: 'image',
        label: 'Background Image',
        property: 'style.backgroundImage',
      },
      {
        type: 'string',
        label: 'View Box',
        property: 'viewBox',
        defaultValue: ''  // 保持字符串形式用于展示
      },
      {
        type: 'string',
        label: 'Margin',
        property: 'style.margin',
        defaultValue: ''  // 保持字符串形式用于展示
      },
      {
        type: 'select',
        label: 'Background Size',
        property: 'style.backgroundSize',
        options: [
          { label: 'Cover', value: 'cover' },
          { label: 'Contain', value: 'contain' },
          { label: '100%', value: '100% 100%' }
        ],
        defaultValue: 'cover'
      },
      {
        type: 'select',
        label: 'Background Repeat',
        property: 'style.backgroundRepeat',
        options: [
          { label: 'No Repeat', value: 'no-repeat' },
          { label: 'Repeat', value: 'repeat' },
          { label: 'Repeat X', value: 'repeat-x' },
          { label: 'Repeat Y', value: 'repeat-y' }
        ],
        defaultValue: 'no-repeat'
      }
    ],
    tags: ['SVG', 'Container', 'Image']
  }
} 