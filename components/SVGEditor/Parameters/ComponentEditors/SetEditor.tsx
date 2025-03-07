"use client"

import { useEditor } from '@/contexts/EditorContext/index';
import type { BaseComponent } from "@/types/core";
import { PropertyManager } from '../PropertyManager';
import get from "lodash/get";
import set from "lodash/set";
import { useEffect, useState } from 'react';
import type { PropertyControl } from "@/types/core/property";
import { COMPONENT_TEMPLATES } from '@/components/SVGEditor/atomicComponent';
import { DynamicPropertyControl } from '../PropertyControls/DynamicPropertyControl';

interface SetEditorProps {
  component: BaseComponent;
}

export function SetEditor({ component }: SetEditorProps) {
  // 使用本地状态并确保随组件更新
  const [localComponent, setLocalComponent] = useState<BaseComponent>(component);
  const { updateComponent } = useEditor();

  // 当外部组件变化时，更新本地状态
  useEffect(() => {
    setLocalComponent(component);
  }, [component]);

  // 处理属性变更
  const handleUpdateProperty = (path: string, value: any) => {
    const updatedComponent = JSON.parse(JSON.stringify(localComponent));
    set(updatedComponent, path, value);
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

  // 获取该组件类型的模板
  const template = COMPONENT_TEMPLATES[component.type];

  // 获取固定属性（只渲染这些）
  const fixedPropertyControls = template.propertyControls.filter(prop => prop.isFixed);

  return (
    <div className="space-y-4">
      {/* 只渲染固定属性 */}
      {fixedPropertyControls.map(prop => (
        <DynamicPropertyControl
          key={prop.property}
          property={prop}
          value={get(localComponent, prop.property)}
          onChange={(value) => handleUpdateProperty(prop.property, value)}
        />
      ))}

      {/* PropertyManager处理所有非固定属性 */}
      <PropertyManager
        component={localComponent}
        onAddProperty={handleAddProperty}
        onRemoveProperty={handleRemoveProperty}
        onUpdateProperty={handleUpdateProperty}
      />
    </div>
  );
} 