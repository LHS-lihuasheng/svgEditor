"use client"

import React from 'react';
import { StringControl } from './basic/StringControl';
import { NumberControl } from './basic/NumberControl';
import { ColorControl } from './basic/ColorControl';
import { SelectControl } from './basic/SelectControl';
import { ImageControl } from './common/ImageControl';
import { TriggerControl } from './animation/TriggerControl';
import { RepeatCountControl } from './animation/RepeatCountControl';
import { TransformTypeControl } from './animation/TransformTypeControl';
import { MultiValueControl } from './basic/MultiValueControl';
import { SliderWithInput } from './basic/SliderWithInput';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PropertyControl, BaseComponent } from '@/types/core';
import { findComponentById, updateComponent } from '@/contexts/EditorContext';

interface DynamicPropertyControlProps {
  property: PropertyControl;
  value: any;
  onChange: (value: any) => void;
  component?: BaseComponent;
}

export function DynamicPropertyControl({
  property,
  value,
  onChange,
  component
}: DynamicPropertyControlProps) {
  // 特殊控件处理
  if (property.property === 'attributes.begin') {
    return <TriggerControl label={property.label} value={value || "0s"} onChange={onChange} />;
  }

  if (property.property === 'attributes.repeatCount') {
    return <RepeatCountControl label={property.label} value={value || "1"} onChange={onChange} />;
  }

  if (property.property === 'attributes.type' && component?.type === 'animateTransform') {
    return <TransformTypeControl label={property.label} value={value || "translate"} onChange={onChange} />;
  }

  if (property.property === 'attributes.rotate' && component?.type === 'animateMotion') {
    return (
      <Select value={value || "0"} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder="旋转控制" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="0">0 (无旋转)</SelectItem>
          <SelectItem value="auto">auto (沿路径方向)</SelectItem>
          <SelectItem value="auto-reverse">auto-reverse (沿路径反方向)</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  // 标准控件处理
  switch (property.type) {
    case 'string':
      return <StringControl
        label={property.label}
        value={String(value || '')}
        onChange={onChange}
      />;

    case 'number':
      return <NumberControl
        label={property.label}
        value={value || 0}
        onChange={onChange}
        min={property.min}
        max={property.max}
        step={property.step}
      />;

    case 'color':
      return <ColorControl
        label={property.label}
        value={value || '#000000'}
        onChange={onChange}
      />;

    case 'select':
      return <SelectControl
        label={property.label}
        value={value || ''}
        onChange={onChange}
        options={property.options || []}
      />;

    case 'image':
      return <ImageControl
        label={property.label}
        value={value || ''}
        onChange={onChange}
      />;

    case 'quadValue':
      return <MultiValueControl
        label={property.label}
        value={value || (property.defaultValue ? JSON.parse(JSON.stringify(property.defaultValue)) : {})}
        onChange={onChange}
        fields={property.fieldConfig || []}
        layout={property.fieldConfig?.length ? (property.fieldConfig?.length <= 2 ? "flex" : "grid") : "flex"}
        groupLabel={property.property.includes(".translate") ? "位置" : undefined}
      />;

    case 'slider':
      return <SliderWithInput
        label={property.label}
        value={value || property.defaultValue || 0}
        onChange={onChange}
        min={property.min}
        max={property.max}
        step={property.step}
      />;

    case 'transform':
      // transform控件简化版本
      const safeValue = value || { translate: { x: 0, y: 0 }, scale: 1, rotate: 0 };
      return (
        <div className="space-y-4">
          <Label>{property.label}</Label>

          <MultiValueControl
            value={safeValue.translate || { x: 0, y: 0 }}
            onChange={(newTranslate) => onChange({ ...safeValue, translate: newTranslate })}
            fields={[
              { key: 'x', label: 'X', defaultValue: 0 },
              { key: 'y', label: 'Y', defaultValue: 0 }
            ]}
            layout="flex"
            groupLabel="位置"
          />

          <SliderWithInput
            value={safeValue.scale || 1}
            onChange={(newScale) => onChange({ ...safeValue, scale: newScale })}
            min={0.1}
            max={10}
            step={0.1}
            label="缩放"
            showLabel={false}
            className="mt-2"
          />

          <SliderWithInput
            value={safeValue.rotate || 0}
            onChange={(newRotate) => onChange({ ...safeValue, rotate: newRotate })}
            min={0}
            max={360}
            step={1}
            label="旋转"
            showLabel={false}
            className="mt-2"
          />
        </div>
      );

    default:
      return <div className="text-sm text-red-500">
        不支持的属性类型: {property.type}
      </div>;
  }
}

const handleStyleChange = (value: any) => {
  const [component] = findComponentById(components, componentId);
  if (component) {
    updateComponent({
      ...component,
      style: {
        ...(component.style || {}),
        [styleProp]: value
      }
    });
  }
};

const handleAttributeChange = (value: any) => {
  const [component] = findComponentById(components, componentId);
  if (component) {
    updateComponent({
      ...component,
      attributes: {
        ...(component.attributes || {}),
        [attrKey]: value
      }
    });
  }
}; 