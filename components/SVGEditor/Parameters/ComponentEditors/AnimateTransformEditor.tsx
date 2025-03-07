"use client"

import { useEditor } from '@/contexts/EditorContext/index';
import type { BaseComponent } from "@/types/core";
import { SelectControl } from '../PropertyControls/SelectControl';
import { StringControl } from '../PropertyControls/StringControl';
import { PropertyManager } from '../PropertyManager';
import get from "lodash/get";
import set from "lodash/set";
import { useEffect, useState } from 'react';
import type { PropertyControl } from "@/types/core/property";

interface AnimateTransformEditorProps {
  component: BaseComponent;
}

export function AnimateTransformEditor({ component }: AnimateTransformEditorProps) {
  // 使用本地状态
  const [localComponent, setLocalComponent] = useState<BaseComponent>(component);
  const { updateComponent } = useEditor();

  useEffect(() => {
    setLocalComponent(component);
  }, [component]);

  const handlePropertyChange = (property: string, value: any) => {
    const updatedComponent = JSON.parse(JSON.stringify(localComponent));
    set(updatedComponent, property, value);
    setLocalComponent(updatedComponent);
    updateComponent(updatedComponent);
  };

  const handleAddProperty = (property: PropertyControl) => {
    const path = property.property.split('.');
    const category = path[0];
    const key = path[1];

    const updatedComponent = JSON.parse(JSON.stringify(localComponent));

    if (!updatedComponent[category]) {
      updatedComponent[category] = {};
    }

    updatedComponent[category][key] = property.defaultValue;
    setLocalComponent(updatedComponent);
    updateComponent(updatedComponent);
  };

  const handleRemoveProperty = (propertyPath: string) => {
    const updatedComponent = JSON.parse(JSON.stringify(localComponent));
    const [category, key] = propertyPath.split('.');

    if (updatedComponent[category] && key in updatedComponent[category]) {
      delete updatedComponent[category][key];
    }

    setLocalComponent(updatedComponent);
    updateComponent(updatedComponent);
  };

  // 根据变换类型提供不同的输入提示
  const getPlaceholders = () => {
    const type = get(localComponent, 'attributes.type') || 'rotate';
    switch (type) {
      case 'rotate':
        return { from: '0', to: '360' };
      case 'scale':
        return { from: '1', to: '2' };
      case 'translate':
        return { from: '0,0', to: '100,0' };
      case 'skewX':
      case 'skewY':
        return { from: '0', to: '45' };
      default:
        return { from: '0', to: '1' };
    }
  };

  const placeholders = getPlaceholders();

  return (
    <div className="space-y-4">
      <SelectControl
        label="变换类型"
        value={get(localComponent, 'attributes.type') || 'rotate'}
        onChange={(value) => handlePropertyChange('attributes.type', value)}
        options={[
          { label: '旋转', value: 'rotate' },
          { label: '缩放', value: 'scale' },
          { label: '平移', value: 'translate' },
          { label: '倾斜X', value: 'skewX' },
          { label: '倾斜Y', value: 'skewY' }
        ]}
      />

      <div className="grid grid-cols-2 gap-3">
        <StringControl
          label="起始值"
          value={get(localComponent, 'attributes.from') || placeholders.from}
          onChange={(value) => handlePropertyChange('attributes.from', value)}
          placeholder={placeholders.from}
        />
        <StringControl
          label="结束值"
          value={get(localComponent, 'attributes.to') || placeholders.to}
          onChange={(value) => handlePropertyChange('attributes.to', value)}
          placeholder={placeholders.to}
        />
      </div>

      <StringControl
        label="持续时间"
        value={get(localComponent, 'attributes.dur') || '3s'}
        onChange={(value) => handlePropertyChange('attributes.dur', value)}
      />

      <SelectControl
        label="重复次数"
        value={get(localComponent, 'attributes.repeatCount') || 'indefinite'}
        onChange={(value) => handlePropertyChange('attributes.repeatCount', value)}
        options={[
          { label: '无限循环', value: 'indefinite' },
          { label: '1次', value: '1' },
          { label: '2次', value: '2' },
          { label: '3次', value: '3' }
        ]}
      />

      <SelectControl
        label="叠加方式"
        value={get(localComponent, 'attributes.additive') || 'sum'}
        onChange={(value) => handlePropertyChange('attributes.additive', value)}
        options={[
          { label: '叠加', value: 'sum' },
          { label: '替换', value: 'replace' }
        ]}
      />

      <PropertyManager
        component={localComponent}
        onAddProperty={handleAddProperty}
        onRemoveProperty={handleRemoveProperty}
      />
    </div>
  );
} 