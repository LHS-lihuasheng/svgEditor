"use client"

import { StringControl } from './StringControl';
import { NumberControl } from './NumberControl';
import { ColorControl } from './ColorControl';
import { SelectControl } from './SelectControl';
import { OpacityControl } from './OpacityControl';
import { ImageControl } from './ImageControl';
import { ViewBoxControl } from './ViewBoxControl';
import { MarginControl } from './MarginControl';
import type { PropertyControl } from '@/types/core/property';

interface DynamicPropertyControlProps {
  property: PropertyControl;
  value: any;
  onChange: (value: any) => void;
}

export function DynamicPropertyControl({ property, value, onChange }: DynamicPropertyControlProps) {
  // 根据属性类型渲染不同的控件
  switch (property.type) {
    case 'string':
      return (
        <StringControl
          label={property.label}
          value={value || ''}
          onChange={onChange}
        />
      );
    
    case 'number':
      return (
        <NumberControl
          label={property.label}
          value={value || 0}
          onChange={onChange}
          min={property.min}
          max={property.max}
          step={property.step}
        />
      );
    
    case 'color':
      return (
        <ColorControl
          label={property.label}
          value={value || '#000000'}
          onChange={onChange}
        />
      );
    
    case 'select':
      return (
        <SelectControl
          label={property.label}
          value={value || ''}
          onChange={onChange}
          options={property.options || []}
        />
      );
    
    case 'opacity':
      return (
        <OpacityControl
          label={property.label}
          value={value || 1}
          onChange={onChange}
        />
      );
    
    case 'image':
      return (
        <ImageControl
          label={property.label}
          value={value || ''}
          onChange={onChange}
        />
      );
    
    case 'viewbox':
      return (
        <ViewBoxControl
          label={property.label}
          value={value || { x: 0, y: 0, width: 0, height: 0 }}
          onChange={onChange}
        />
      );
    
    case 'margin':
      return (
        <MarginControl
          label={property.label}
          value={value || { top: 0, right: 0, bottom: 0, left: 0 }}
          onChange={onChange}
        />
      );
    
    default:
      return (
        <StringControl
          label={property.label}
          value={String(value || '')}
          onChange={onChange}
        />
      );
  }
} 