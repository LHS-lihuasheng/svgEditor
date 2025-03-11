"use client"

import { StringControl } from './basic/StringControl';
import { NumberControl } from './basic/NumberControl';
import { ColorControl } from './basic/ColorControl';
import { SelectControl } from './basic/SelectControl';
import { OpacityControl } from './basic/OpacityControl';
import { ImageControl } from './common/ImageControl';
import { ViewBoxControl } from './common/ViewBoxControl';
import { MarginControl } from './common/MarginControl';
import { TransformControl } from './animation/TransformControl';
import { TriggerControl } from './animation/TriggerControl';
import { RepeatCountControl } from './animation/RepeatCountControl';
import type { PropertyControl } from '@/types/core/property/index';
import { TransformTypeControl } from './animation/TransformTypeControl';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DynamicPropertyControlProps {
  property: PropertyControl;
  value: any;
  onChange: (value: any) => void;
  component?: any; // 用于获取组件上下文
}

export function DynamicPropertyControl({
  property,
  value,
  onChange,
  component
}: DynamicPropertyControlProps) {

  // 处理begin属性
  if (property.property === 'attributes.begin') {
    return (
      <TriggerControl
        label={property.label}
        value={value || "0s"}
        onChange={onChange}
      />
    );
  }

  // 处理repeatCount属性
  if (property.property === 'attributes.repeatCount') {
    return (
      <RepeatCountControl
        label={property.label}
        value={value || "1"}
        onChange={onChange}
      />
    );
  }

  // 处理animateTransform的type属性
  if (property.property === 'attributes.type' && component?.type === 'animateTransform') {
    return (
      <TransformTypeControl
        label={property.label}
        value={value || "translate"}
        onChange={onChange}
      />
    );
  }

  // 处理animateMotion专有属性
  if (property.property === 'attributes.rotate' && component?.type === 'animateMotion') {
    return (
      <Select
        value={value || "0"}
        onValueChange={onChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="旋转控制" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0">0 (无旋转)</SelectItem>
          <SelectItem value="auto">auto (沿路径方向)</SelectItem>
          <SelectItem value="auto-reverse">auto-reverse (沿路径反方向)</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  // 根据属性类型渲染不同的控件
  switch (property.type) {
    case 'string':
      return (
        <StringControl
          label={property.label}
          value={String(value || '')}
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

    case 'transform':
      return (
        <TransformControl
          label={property.label}
          value={value || ''}
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