/**
 * @description Animate标签属性库
 */
import { createPropertyControl } from './utils';

// Animate标签属性库
export const ANIMATE_PROPERTY = {
  attributeName: createPropertyControl('attributes.attributeName', 'select', 'Target Attribute', {
    isFixed: true,
    defaultValue: 'opacity',
    options: [
      { label: 'Opacity', value: 'opacity' },
      { label: 'X Position', value: 'x' },
      { label: 'Y Position', value: 'y' },
      { label: 'Width', value: 'width' },
      { label: 'Height', value: 'height' },
      { label: 'Fill', value: 'fill' },
      { label: 'Stroke', value: 'stroke' },
      { label: 'Transform', value: 'transform' }
    ]
  }),

  from: createPropertyControl('attributes.from', 'string', 'From Value', {
    isDefault: true,
    defaultValue: '0'
  }),

  to: createPropertyControl('attributes.to', 'string', 'To Value', {
    isDefault: true,
    defaultValue: '1'
  }),

  by: createPropertyControl('attributes.by', 'string', 'By Value', {
    defaultValue: '1'
  }),

  values: createPropertyControl('attributes.values', 'string', 'Values', {
    defaultValue: ''
  }),

  begin: createPropertyControl('attributes.begin', 'string', '触发方式', {
    isDefault: true,
    defaultValue: '0s'
  }),

  dur: createPropertyControl('attributes.dur', 'string', 'Duration', {
    isDefault: true,
    defaultValue: '1s'
  }),

  repeatCount: createPropertyControl('attributes.repeatCount', 'string', 'Repeat Count', {
    isDefault: true,
    defaultValue: '1'
  }),

  fill: createPropertyControl('attributes.fill', 'select', 'Fill Mode', {
    isDefault: true,
    defaultValue: 'remove',
    options: [
      { label: 'Freeze', value: 'freeze' },
      { label: 'Remove', value: 'remove' }
    ]
  }),

  keyTimes: createPropertyControl('attributes.keyTimes', 'string', 'Key Times', {
    defaultValue: '0;1'
  }),

  keySplines: createPropertyControl('attributes.keySplines', 'string', 'Key Splines', {
    defaultValue: '0.42 0 0.58 1'
  }),

  calcMode: createPropertyControl('attributes.calcMode', 'select', 'Calc Mode', {
    isDefault: true,
    defaultValue: 'linear',
    options: [
      { label: 'Linear', value: 'linear' },
      { label: 'Discrete', value: 'discrete' },
      { label: 'Paced', value: 'paced' },
      { label: 'Spline', value: 'spline' }
    ]
  }),

  restart: createPropertyControl('attributes.restart', 'select', 'Restart', {
    defaultValue: 'always',
    options: [
      { label: 'Always', value: 'always' },
      { label: 'When Not Active', value: 'whenNotActive' },
      { label: 'Never', value: 'never' }
    ]
  }),
}; 