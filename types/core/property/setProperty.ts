/**
 * @description Set标签属性库
 */
import { createPropertyControl } from './utils';

// Set标签属性库
export const SET_PROPERTY = {
  attributeName: createPropertyControl('attributes.attributeName', 'select', 'Target Attribute', {
    isFixed: true,
    defaultValue: 'visibility',
    options: [
      { label: 'Visibility', value: 'visibility' }, 
      { label: 'Opacity', value: 'opacity' },
      { label: 'Fill', value: 'fill' },
      { label: 'Stroke', value: 'stroke' },
      { label: 'Transform', value: 'transform' }
    ]
  }),
  
  to: createPropertyControl('attributes.to', 'string', 'To Value', {
    isFixed: true,
    defaultValue: 'hidden'
  }),
  
  begin: createPropertyControl('attributes.begin', 'string', '触发方式', {
    isDefault: true,
    defaultValue: '0s',
  }),
  
  dur: createPropertyControl('attributes.dur', 'string', 'Duration', {
    isDefault: true,
    defaultValue: '1ms'
  }),
  
  fill: createPropertyControl('attributes.fill', 'select', 'Fill Mode', {
    isDefault: true,
    defaultValue: 'freeze',
    options: [
      { label: 'Freeze', value: 'freeze' },
      { label: 'Remove', value: 'remove' }
    ]
  })
}; 