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
  const {  updateComponent, selectedComponent } = useEditor();

  if (!selectedComponent) {
    return <div className="text-center p-4 text-gray-500">请选择一个组件进行编辑</div>;
  }

  // 统一处理所有属性变更
  const handleUpdateProperty = (path: string, value: any) => {
    // 创建组件的深拷贝用于更新
    const updatedComponent = JSON.parse(JSON.stringify(selectedComponent));

    // 使用lodash.set统一处理所有属性
    set(updatedComponent, path, value);

    updateComponent(updatedComponent);
  };

  const handleAddProperty = (property: string) => {
    const updatedComponent = JSON.parse(JSON.stringify(selectedComponent));
    const [category, key] = property.split('.');

    // 确保目标对象存在
    if (!updatedComponent[category]) {
      updatedComponent[category] = {};
    }

    // 查找属性控件
    let propertyControl: PropertyControl | undefined;

    // 1. 首先从组件模板中查找
    const template = COMPONENT_TEMPLATES[selectedComponent.type];
    if (template && template.propertyControls) {
      propertyControl = template.propertyControls.find(prop => prop.property === property);
    }

    // 2. 如果模板中没找到，则从属性库中查找
    if (!propertyControl) {
      const controlsLibrary = COMPONENT_TYPE_TO_PROPERTY[selectedComponent.type] || {};
      propertyControl = Object.values(controlsLibrary).find(
        control => control.property === property
      );
    }

    // 3. 如果仍然没找到，使用一个合理的默认值
    if (!propertyControl) {
      console.warn(`找不到属性控件: ${property}，使用默认空值`);
      updatedComponent[category][key] = '';
    } else {
      updatedComponent[category][key] = propertyControl.defaultValue;
    }

    updateComponent(updatedComponent);
  };

  const handleRemoveProperty = (propertyPath: string) => {
    const updatedComponent = JSON.parse(JSON.stringify(selectedComponent));

    // 使用lodash.unset统一删除属性
    unset(updatedComponent, propertyPath);

    updateComponent(updatedComponent);
  };

  // 获取组件类型对应的模板
  const template = COMPONENT_TEMPLATES[selectedComponent.type];

  // 从模板中获取固定属性控件定义
  const fixedPropertyControls = template?.propertyControls?.filter(prop => prop.isFixed) || [];

  return (
    <div className="space-y-4">
      {/* 渲染固定属性控件 */}
      {fixedPropertyControls.map(prop => (
        <DynamicPropertyControl
          key={prop.property}
          property={prop}
          value={get(selectedComponent, prop.property) || prop.defaultValue}
          onChange={(value) => handleUpdateProperty(prop.property, value)}
          component={selectedComponent}
        />
      ))}

      {/* PropertyManager处理可添加/删除的属性 */}
      <PropertyManager
        component={selectedComponent}
        onAddProperty={handleAddProperty}
        onRemoveProperty={handleRemoveProperty}
        onUpdateProperty={handleUpdateProperty}
      />
    </div>
  );
} 