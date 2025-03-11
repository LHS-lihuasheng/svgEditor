/**
 * @description Group标签属性库
 */
import { createPropertyControl } from './utils';

// Group标签属性库
export const GROUP_PROPERTY = {
  // 变换属性
  transform: createPropertyControl('transform', 'transform', 'Transform', {
    defaultValue: { translate: { x: 0, y: 0 }, scale: 1, rotate: 0 }
  }),
  
  // 样式属性
  opacity: createPropertyControl('style.opacity', 'number', 'Opacity', {
    defaultValue: 1,
    min: 0,
    max: 1,
    step: 0.01
  }),
  
  // 其他属性
  pointerEvents: createPropertyControl('style.pointerEvents', 'select', 'Pointer Events', {
    defaultValue: 'none',
    options: [
      { label: 'None', value: 'none' },
      { label: 'Visible', value: 'visible' },
      { label: 'Painted', value: 'painted' },
      { label: 'VisiblePainted', value: 'visiblePainted' }
    ]
  }),
  
  visibility: createPropertyControl('attributes.visibility', 'select', 'Visibility', {
    defaultValue: 'visible',
    options: [
      { label: 'Visible', value: 'visible' },
      { label: 'Hidden', value: 'hidden' }
    ]
  })
}; 