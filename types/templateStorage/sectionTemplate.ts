/**
 * @description Section组件模板
 * 用于创建布局容器元素
 */
import { BaseComponentTemplate } from '@/types/component';

export const SECTION_TEMPLATE: BaseComponentTemplate = {
    templateName: 'Section容器',
    description: '容器元素，用于布局和内容分组',
    component: [{
        id: '',
        type: 'section',
        attributes: {
            id: ''
        },
        style: {
            width: '100%',
            height: 'auto',
            display: 'block',
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
            padding: { top: 0, right: 0, bottom: 0, left: 0 },
            textAlign: 'center',
            lineHeight: '0',
            position: 'relative',
            overflow: 'hidden',
            pointerEvents: 'none'
        },
        fixedProperties: [
            'attributes.id'
        ],
        children: []
    }]
}; 