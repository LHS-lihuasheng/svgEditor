/**
 * @description ForeignObject元素属性定义
 */
import { createProperty, propertyStorage } from './types';

export const FOREIGN_OBJECT_PROPERTY: propertyStorage = {
  attributes: {
    id: createProperty('string', 'ID', {
      defaultValue: ''
    }),

    x: createProperty('number', 'X坐标', {
      defaultValue: 0,
      step: 1,
      min: -9999,
      max: 9999
    }),

    y: createProperty('number', 'Y坐标', {
      defaultValue: 0,
      step: 1,
      min: -9999,
      max: 9999
    }),

    width: createProperty('number', '宽度', {
      defaultValue: 200,
      step: 1,
      min: 0,
      max: 9999
    }),

    height: createProperty('number', '高度', {
      defaultValue: 100,
      step: 1,
      min: 0,
      max: 9999
    })
  },
  style: {
  }
}; 