/**
 * @description Rect标签属性库
 */
import { createProperty, propertyStorage } from './types';

// Rect标签属性库
export const RECT_PROPERTY: propertyStorage = {
  attributes: {
    id: createProperty('string', 'ID', {
      defaultValue: ''
    }),
    x: createProperty('number', 'X Position', {
      defaultValue: 0,
      min: -9999,
      max: 9999,
      step: 1
    }),
    y: createProperty('number', 'Y Position', {
      defaultValue: 0,
      min: -9999,
      max: 9999,
      step: 1
    }),
    width: createProperty('number', 'Width', {
      defaultValue: 100,
      min: 0,
      max: 9999,
      step: 1
    }),
    height: createProperty('number', 'Height', {
      defaultValue: 100,
      min: 0,
      max: 9999,
      step: 1
    })
  },
  style: {
    fill: createProperty('color', 'Fill Color', {
      defaultValue: '#000000'
    }),
    stroke: createProperty('color', 'Stroke Color', {
      defaultValue: 'none'
    }),
    strokeWidth: createProperty('number', 'Stroke Width', {
      defaultValue: 1,
      min: 0,
      max: 100,
      step: 0.5
    }),
    opacity: createProperty('slider', 'Opacity', {
      defaultValue: 1,
      min: 0,
      max: 1,
      step: 0.01
    }),
    pointerEvents: createProperty('select', 'Pointer Events', {
      defaultValue: 'visible',
      options: [
        { label: 'Visible', value: 'visible' },
        { label: 'Painted', value: 'painted' },
        { label: 'VisiblePainted', value: 'visiblePainted' },
        { label: 'None', value: 'none' }
      ]
    })
  }
}; 