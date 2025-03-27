/**
 * @description SVG图片组件模板
 */
import { BaseComponentTemplate } from '@/types/component';

export const SVG_PIC_TEMPLATE: BaseComponentTemplate = {
  templateName: 'SVG普通图片',
  description: '零行高、点击穿透的svg容器',
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
      backgroundRepeat: 'no-repeat',
      pointerEvents: 'none',
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    },
    fixedProperties: [
      'attributes.id',
      'attributes.viewBox'
    ],
    children: []
  }]
};

export const SVG_SEAMLESS_TEMPLATE: BaseComponentTemplate = {
  templateName: 'SVG无缝图片',
  description: '基本封装过的svg无缝图片容器',
  component: [{
    id: '',
    type: 'svg',
    attributes: {
      id: 'Seamless',
      viewBox: {
        x: 0,
        y: 0,
        width: 1080,
        height: 1920
      }
    },
    style: {
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      pointerEvents: 'none',
      margin: { top: -1, right: 0, bottom: 0, left: 0 },
    },
    fixedProperties: [
      'attributes.id',
      'attributes.viewBox'
    ],
    children: []
  }]
};


