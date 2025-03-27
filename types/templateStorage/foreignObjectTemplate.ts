/**
 * @description ForeignObject组件模板
 * 用于在SVG中嵌入HTML或外部内容
 */
import { BaseComponentTemplate } from '@/types/component';

export const FOREIGN_OBJECT_TEMPLATE: BaseComponentTemplate = {
  templateName: 'ForeignObject',
  description: '可嵌入HTML或外部内容的容器',
  component: [{
    id: '',
    type: 'foreignObject',
    attributes: {
      id: '',
      x: 0,
      y: 0,
      width: '100%',
      height: '100%'
    },
    fixedProperties: [
      'attributes.id',
      'attributes.x',
      'attributes.y',
      'attributes.width',
      'attributes.height'
    ],
    children: []
  }]
}; 