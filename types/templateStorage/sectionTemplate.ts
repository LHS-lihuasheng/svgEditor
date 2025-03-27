/**
 * @description Section组件模板
 * 用于创建布局容器元素
 */
import { BaseComponentTemplate } from '@/types/component';

export const NORMAL_SECTION_TEMPLATE: BaseComponentTemplate = {
    templateName: '(常规)Section',
    description: '常规Section容器，用于包裹其他元素',
    component: [{
        id: '',
        type: 'section',
        attributes: {
            id: ''
        },
        style: {
            lineHeight: '0',
            pointerEvents: 'none',
            textAlign: 'center',
        },
        fixedProperties: [
            'attributes.id'
        ],
        children: []
    }]
};

export const ZERO_HEIGHT_SECTION_TEMPLATE: BaseComponentTemplate = {
    templateName: '(零高)Section',
    description: '零高容器，用于层级叠加',
    component: [{
        id: '',
        type: 'section',
        attributes: {
            id: ''
        },
        style: {
            height: '0',
            lineHeight: '0',
            pointerEvents: 'none',
            textAlign: 'center',
        },
        fixedProperties: [
            'attributes.id'
        ],
        children: []
    }]
};

export const OVERFLOW_SECTION_TEMPLATE: BaseComponentTemplate = {
    templateName: '(最外层)Section',
    description: '用于包裹其他元素，并设置溢出隐藏',
    component: [{
        id: '',
        type: 'section',
        attributes: {
            id: ''
        },
        style: {
            overflow: 'hidden',
            lineHeight: '0',
            pointerEvents: 'none',
            textAlign: 'center',
        },
        fixedProperties: [
            'attributes.id'
        ],
        children: []
    }]
};


