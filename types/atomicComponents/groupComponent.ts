import { BaseComponent, BaseComponentTemplate } from './baseComponent';

export interface GroupComponent extends BaseComponent {
    type: 'g';
    style?: {
        // group特有样式
        [key: string]: any;
    };
    attributes?: {
        transform?: string;
        [key: string]: any;
    };
}

export interface GroupComponentTemplate extends BaseComponentTemplate {
    // Group组件的模板定义
}

// 预定义Group组件模板
export const GROUP_TEMPLATE: GroupComponentTemplate = {
    label: '组合容器',
    icon: '🔄',
    description: '用于组合多个元素的容器',
    category: '容器',
    propertyControls: [
        {
            type: 'string',
            label: '变换',
            property: 'attributes.transform',
            defaultValue: ''
        }
    ],
    allowedChildren: ['g', 'rect']
}; 