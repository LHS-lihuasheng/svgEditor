/**
 * @description ForeignObject元素属性定义
 */
import { createPropertyControl } from './utils';

export const FOREIGN_OBJECT_PROPERTY = {
  // 位置属性
  x: createPropertyControl('attributes.x', 'number', 'X坐标', {
    defaultValue: 0,
    step: 1,
    min: -9999,
    max: 9999
  }),

  y: createPropertyControl('attributes.y', 'number', 'Y坐标', {
    defaultValue: 0,
    step: 1,
    min: -9999,
    max: 9999
  }),

  // 尺寸属性
  width: createPropertyControl('attributes.width', 'number', '宽度', {
    defaultValue: 200,
    step: 1,
    min: 0,
    max: 9999
  }),

  height: createPropertyControl('attributes.height', 'number', '高度', {
    defaultValue: 100,
    step: 1,
    min: 0,
    max: 9999
  })
}; 