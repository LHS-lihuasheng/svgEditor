/**
 * @description Rect标签属性库
 */
import { createPropertyControl, PropertyControl } from './utils';

// Rect标签属性库
export const RECT_PROPERTY: Record<string, PropertyControl> = {
  // 位置和尺寸
  x: createPropertyControl('attributes.x', 'number', 'X Position', {
    isFixed: true,
    defaultValue: 0
  }),

  y: createPropertyControl('attributes.y', 'number', 'Y Position', {
    isFixed: true,
    defaultValue: 0
  }),

  width: createPropertyControl('attributes.width', 'number', 'Width', {
    isFixed: true,
    defaultValue: 100
  }),

  height: createPropertyControl('attributes.height', 'number', 'Height', {
    isFixed: true,
    defaultValue: 100
  }),

  // 样式属性
  fill: createPropertyControl('style.fill', 'color', 'Fill Color', {
    defaultValue: '#000000'
  }),

  stroke: createPropertyControl('style.stroke', 'color', 'Stroke Color', {
    defaultValue: 'none'
  }),

  strokeWidth: createPropertyControl('style.strokeWidth', 'number', 'Stroke Width', {
    defaultValue: 1
  }),

  opacity: createPropertyControl('style.opacity', 'slider', 'Opacity', {
    defaultValue: 1,
    min: 0,
    max: 1,
    step: 0.01
  }),

  // 交互属性
  pointerEvents: createPropertyControl('style.pointerEvents', 'select', 'Pointer Events', {
    defaultValue: 'visible',
    options: [
      { label: 'Visible', value: 'visible' },
      { label: 'Painted', value: 'painted' },
      { label: 'VisiblePainted', value: 'visiblePainted' },
      { label: 'None', value: 'none' }
    ]
  })
}; 