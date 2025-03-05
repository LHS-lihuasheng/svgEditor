import { BaseComponent, BaseComponentTemplate } from './baseComponent';

// SVG图片组件扩展
interface SVGPicComponent extends BaseComponent {
  type: 'svgPic';
  style?: {
    backgroundImage?: string;
    lineHeight?: string;
    backgroundSize?: string;
    backgroundRepeat?: string;
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    [key: string]: any;
  };
  viewBox?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  };
}

// SVG图片组件模板
interface SVGPicComponentTemplate extends BaseComponentTemplate {
  defaultProperties?: {
    style?: {
      backgroundImage?: string;
      lineHeight?: string;
      backgroundSize?: string;
      backgroundRepeat?: string;
      margin?: {
        top?: number;
        right?: number;
        bottom?: number;
        left?: number;
      };
      [key: string]: any;
    };
    viewBox?: {
      x?: number;
      y?: number;
      width?: number;
      height?: number;
    };
    [key: string]: any;
  };
}

// 预定义SVG图片组件模板
const SVG_PIC_TEMPLATE: SVGPicComponentTemplate = {
  label: 'SVG Picture',
  icon: '🖼️',
  description: 'SVG图片容器，可设置背景图和样式',
  category: '容器',
  defaultProperties: {
    style: {
      lineHeight: '0',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      margin: { top: -1 }
    },
    viewBox: {}
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
  tags: ['SVG', 'Container', 'Image'],
  allowedChildren: ['g', 'rect']
};

// 导出这个特定组件的类型和模板
export type { SVGPicComponent };
export type { SVGPicComponentTemplate };
export { SVG_PIC_TEMPLATE };

// 重新导出基础类型，为了向后兼容性
export { type ComponentType, type PropertyControl } from './baseComponent';
export type { DragItem } from './baseComponent';