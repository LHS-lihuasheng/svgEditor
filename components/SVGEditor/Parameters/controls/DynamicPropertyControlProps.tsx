"use client"

import { StringControl } from './basic/StringControl';
import { NumberControl } from './basic/NumberControl';
import { ColorControl } from './basic/ColorControl';
import { SelectControl } from './basic/SelectControl';
import { ImageControl } from './common/ImageControl';
import { TriggerControl } from './animation/TriggerControl';
import { RepeatCountControl } from './animation/RepeatCountControl';
import type { PropertyControl } from '@/types/core/property/index';
import { TransformTypeControl } from './animation/TransformTypeControl';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiValueControl } from './basic/MultiValueControl';
import type { BaseComponent } from '@/types/core/component';
import React from 'react';
import { SliderWithInput } from './basic/SliderWithInput';
import { Label } from "@/components/ui/label";

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

    case 'image':
      return (
        <ImageControl
          label={property.label}
          value={value || ''}
          onChange={onChange}
        />
      );

    case 'quadValue':
      // 确保安全处理嵌套属性路径
      const defaultQuadValue = property.defaultValue
        ? JSON.parse(JSON.stringify(property.defaultValue))
        : {};

      return (
        <MultiValueControl
          label={property.label}
          value={value || defaultQuadValue}
          onChange={onChange}
          fields={property.fieldConfig || []}
          layout={property.fieldConfig?.length ? (property.fieldConfig?.length <= 2 ? "flex" : "grid") : "flex"}
          groupLabel={property.property.includes(".translate") ? "位置" : undefined}
        />
      );

    case 'slider':
      return (
        <SliderWithInput
          label={property.label}
          value={value || property.defaultValue || 0}
          onChange={onChange}
          min={property.min}
          max={property.max}
          step={property.step}
        />
      );

    case 'transform':
      // 内联实现transform控件
      const safeValue = value || { translate: { x: 0, y: 0 }, scale: 1, rotate: 0 };

      // 处理平移变更
      const handleTranslateChange = (newTranslate: Record<string, number>) => {
        onChange({
          ...safeValue,
          translate: newTranslate
        });
      };

      // 处理缩放变更
      const handleScaleChange = (newScale: number) => {
        onChange({
          ...safeValue,
          scale: newScale
        });
      };

      // 处理旋转变更
      const handleRotateChange = (newRotate: number) => {
        onChange({
          ...safeValue,
          rotate: newRotate
        });
      };

      return (
        <div className="space-y-4">
          <Label>{property.label}</Label>

          {/* 平移控件 */}
          <MultiValueControl
            value={safeValue.translate || { x: 0, y: 0 }}
            onChange={handleTranslateChange}
            fields={[
              { key: 'x', label: 'X', defaultValue: 0 },
              { key: 'y', label: 'Y', defaultValue: 0 }
            ]}
            layout="flex"
            groupLabel="位置"
          />

          {/* 缩放控件 */}
          <SliderWithInput
            value={safeValue.scale || 1}
            onChange={handleScaleChange}
            min={0.1}
            max={10}
            step={0.1}
            label="缩放"
            showLabel={false}
            className="mt-2"
          />

          {/* 旋转控件 */}
          <SliderWithInput
            value={safeValue.rotate || 0}
            onChange={handleRotateChange}
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
      return (
        <div className="text-sm text-red-500">
          不支持的属性类型: {property.type}
        </div>
      );
  }
} 