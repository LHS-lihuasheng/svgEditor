/**
 * @description SVG图片组件模板
 */
import { BaseComponentTemplate } from '@/types/component';

export const SVG_PIC_TEMPLATE: BaseComponentTemplate = {
  templateName: 'SVG图片',
  description: 'SVG图片容器，可设置背景图和样式',
  component: [{
    id: '',
    type: 'svg',
    attributes: {
      id: '',
      viewBox: {
        x: 0,
        y: 0,
        width: 1080,
        height: 1920
      }
    },
    style: {
      backgroundSize: 'cover',
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      backgroundColor: 'transparent'
    },
    fixedProperties: [
      'attributes.id',
      'attributes.viewBox'
    ],
    children: []
  }]
};

