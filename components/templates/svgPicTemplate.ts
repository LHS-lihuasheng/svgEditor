/**
 * @description SVG图片组件模板
 */
import { BaseComponentTemplate } from '@/types/core/template';

export const SVG_PIC_TEMPLATE: BaseComponentTemplate = {
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
      defaultValue: ''
    },
    {
      type: 'string',
      label: 'Margin',
      property: 'style.margin',
      defaultValue: ''
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