import { BaseComponent, BaseComponentTemplate } from './baseComponent';

export interface RectComponent extends BaseComponent {
    type: 'rect';
    style?: {
        fill?: string;
        stroke?: string;
        strokeWidth?: number;
        [key: string]: any;
    };
    attributes?: {
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        rx?: number;
        ry?: number;
        [key: string]: any;
    };
}

export interface RectComponentTemplate extends BaseComponentTemplate {
    // Rect组件特有模板属性
}

// 预定义矩形组件模板
export const RECT_TEMPLATE: RectComponentTemplate = {
    label: '矩形',
    icon: '🔲',
    description: '基础矩形元素',
    category: '基础形状',
    propertyControls: [
        {
            type: 'number',
            label: 'X坐标',
            property: 'attributes.x',
            defaultValue: 0
        },
        {
            type: 'number',
            label: 'Y坐标',
            property: 'attributes.y',
            defaultValue: 0
        },
        {
            type: 'number',
            label: '宽度',
            property: 'attributes.width',
            defaultValue: 100
        },
        {
            type: 'number',
            label: '高度',
            property: 'attributes.height',
            defaultValue: 100
        },
        {
            type: 'number',
            label: '圆角半径X',
            property: 'attributes.rx',
            defaultValue: 0
        },
        {
            type: 'number',
            label: '圆角半径Y',
            property: 'attributes.ry',
            defaultValue: 0
        },
        {
            type: 'color',
            label: '填充颜色',
            property: 'style.fill',
            defaultValue: '#cccccc'
        },
        {
            type: 'color',
            label: '描边颜色',
            property: 'style.stroke',
            defaultValue: '#000000'
        },
        {
            type: 'number',
            label: '描边宽度',
            property: 'style.strokeWidth',
            defaultValue: 1
        }
    ],
    allowedChildren: ['set']  // rect只能包含set动画组件
}; 