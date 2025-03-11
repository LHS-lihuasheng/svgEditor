/**
 * @description AnimateTransform标签属性库
 */
import { createPropertyControl } from './utils';

// AnimateTransform标签属性库
export const ANIMATE_TRANSFORM_CONTROLS = {
  attributeName: createPropertyControl('attributes.attributeName', 'string', 'Attribute Name', {
    isFixed: true,
    defaultValue: 'transform'
  }),

  type: createPropertyControl('attributes.type', 'select', 'Transform Type', {
    isFixed: true,
    defaultValue: 'translate',
    options: [
      { label: 'Translate', value: 'translate' },
      { label: 'Scale', value: 'scale' },
      { label: 'Rotate', value: 'rotate' },
      { label: 'SkewX', value: 'skewX' },
      { label: 'SkewY', value: 'skewY' }
    ]
  }),

  from: createPropertyControl('attributes.from', 'string', 'From Value', {
    isOptional: true,
    defaultValue: '0 0'
  }),

  to: createPropertyControl('attributes.to', 'string', 'To Value', {
    isOptional: true,
    defaultValue: '10 0'
  }),

  by: createPropertyControl('attributes.by', 'string', 'By Value', {
    isOptional: true,
    defaultValue: '10 0'
  }),

  values: createPropertyControl('attributes.values', 'string', 'Values', {
    isOptional: true,
    defaultValue: '0 0;10 0;0 0'
  }),

  begin: createPropertyControl('attributes.begin', 'select', 'Begin Trigger', {
    isDefault: true,
    defaultValue: 'click',
    options: [
      { label: 'On Click', value: 'click' },
      { label: 'On Mouse Over', value: 'mouseover' },
      { label: 'On Touch Start', value: 'touchstart' },
      { label: 'Immediately', value: '0s' }
    ]
  }),

  dur: createPropertyControl('attributes.dur', 'string', 'Duration', {
    isDefault: true,
    defaultValue: '1s'
  }),

  repeatCount: createPropertyControl('attributes.repeatCount', 'select', 'Repeat Count', {
    isDefault: true,
    defaultValue: '1',
    options: [
      { label: 'Indefinite', value: 'indefinite' },
      { label: '1', value: '1' },
      { label: '2', value: '2' },
      { label: '3', value: '3' }
    ]
  }),

  fill: createPropertyControl('attributes.fill', 'select', 'Fill Mode', {
    isOptional: true,
    defaultValue: 'freeze',
    options: [
      { label: 'Freeze', value: 'freeze' },
      { label: 'Remove', value: 'remove' }
    ]
  }),

  restart: createPropertyControl('attributes.restart', 'select', 'Restart', {
    isOptional: true,
    defaultValue: 'always',
    options: [
      { label: 'Always', value: 'always' },
      { label: 'Never', value: 'never' },
      { label: 'When Not Active', value: 'whenNotActive' }
    ]
  }),

  keyTimes: createPropertyControl('attributes.keyTimes', 'string', 'Key Times', {
    isOptional: true,
    defaultValue: '0;0.5;1'
  }),

  keySplines: createPropertyControl('attributes.keySplines', 'string', 'Key Splines', {
    isOptional: true,
    defaultValue: '0.42 0 0.58 1.0; 0.42 0 0.58 1.0'
  }),

  calcMode: createPropertyControl('attributes.calcMode', 'select', 'Calculation Mode', {
    isOptional: true,
    defaultValue: 'spline',
    options: [
      { label: 'Spline', value: 'spline' },
      { label: 'Linear', value: 'linear' },
      { label: 'Discrete', value: 'discrete' },
      { label: 'Paced', value: 'paced' }
    ]
  })
}; 