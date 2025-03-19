"use client"

import { PropertyManager } from './PropertyManager';
import get from "lodash/get";
import set from "lodash/set";
import unset from "lodash/unset";
import { useEditor } from '@/contexts/EditorContext';
import { COMPONENT_TEMPLATES } from '@/types/core/atomicComponent';
import { DynamicPropertyControl } from '../controls/DynamicPropertyControlProps';
import type { PropertyControl } from "@/types/core/property/index";
import { COMPONENT_TYPE_TO_PROPERTY } from '@/types/core/property';

export function UniversalComponentEditor() {
  const { updateComponent, selectedComponent } = useEditor();

  if (!selectedComponent) {
    return <div className="text-center p-4 text-gray-500">请选择一个组件进行编辑</div>;
  }

  // 处理属性变更
  const handleUpdateProperty = (path: string, value: any) => {
    const updatedComponent = JSON.parse(JSON.stringify(selectedComponent));
    set(updatedComponent, path, value);
    updateComponent(updatedComponent);
  };

  // 添加属性
  const handleAddProperty = (property: string) => {
    const updatedComponent = JSON.parse(JSON.stringify(selectedComponent));
    const [category, key] = property.split('.');

    if (!updatedComponent[category]) {
      updatedComponent[category] = {};
    }

    // 查找属性控件定义
    const template = COMPONENT_TEMPLATES[selectedComponent.type];
    const propertyControl = template?.propertyControls?.find(prop => prop.property === property) ||
      Object.values(COMPONENT_TYPE_TO_PROPERTY[selectedComponent.type] || {})
        .find(control => control.property === property);

    // 设置默认值
    updatedComponent[category][key] = propertyControl?.defaultValue || '';
    updateComponent(updatedComponent);
  };

  // 移除属性
  const handleRemoveProperty = (propertyPath: string) => {
    const updatedComponent = JSON.parse(JSON.stringify(selectedComponent));
    unset(updatedComponent, propertyPath);
    updateComponent(updatedComponent);
  };

  // 获取固定属性控件
  const template = COMPONENT_TEMPLATES[selectedComponent.type];
  const fixedPropertyControls = template?.propertyControls?.filter(prop => prop.isFixed) || [];

  return (
    <div className="space-y-4">
      {/* 固定属性控件 */}
      {fixedPropertyControls.map(prop => (
        <DynamicPropertyControl
          key={prop.property}
          property={prop}
          value={get(selectedComponent, prop.property) || prop.defaultValue}
          onChange={(value) => handleUpdateProperty(prop.property, value)}
          component={selectedComponent}
        />
      ))}

      {/* 可添加/删除的属性 */}
      <PropertyManager
        component={selectedComponent}
        onAddProperty={handleAddProperty}
        onRemoveProperty={handleRemoveProperty}
        onUpdateProperty={handleUpdateProperty}
      />
    </div>
  );
} 