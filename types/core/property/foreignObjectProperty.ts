/**
 * @description ForeignObject标签属性库
 */
import { createPropertyControl } from './utils';

// ForeignObject标签属性库
export const FOREIGN_OBJECT_PROPERTY = {
  x: createPropertyControl('attributes.x', 'number', 'X Position', {
    isFixed: true,
    defaultValue: 0
  }),
  
  y: createPropertyControl('attributes.y', 'number', 'Y Position', {
    isFixed: true,
    defaultValue: 0
  }),
  
  width: createPropertyControl('attributes.width', 'string', 'Width', {
    isFixed: true,
    defaultValue: '100%'
  }),
  
  height: createPropertyControl('attributes.height', 'string', 'Height', {
    isFixed: true,
    defaultValue: '100%'
  })
}; 