"use client"

import { useEditor } from '@/contexts/EditorContext/index';
import type { BaseComponent } from "@/types/core";
import { PropertyManager } from '../PropertyManager';
import get from "lodash/get";
import set from "lodash/set";
import { useState, useEffect } from 'react';
import { COMPONENT_TEMPLATES } from '@/components/SVGEditor/atomicComponent';
import { DynamicPropertyControl } from '../controls/DynamicPropertyControlProps';
import { ViewBoxControl } from '../controls/common/ViewBoxControl';
import type { PropertyControl } from "@/types/core/property/index";
import {
  SVG_PROPERTY
} from '@/types/core/property/svgProperty';
import {
  RECT_PROPERTY
} from '@/types/core/property/rectProperty';
import {
  GROUP_PROPERTY
} from '@/types/core/property/groupProperty';
import {
  ANIMATE_PROPERTY
} from '@/types/core/property/animateProperty';
import {
  ANIMATE_TRANSFORM_PROPERTY
} from '@/types/core/property/animateTransformProperty';
import {
  SET_PROPERTY
} from '@/types/core/property/setProperty';

// 组件类型到属性库的映射
const COMPONENT_TYPE_TO_PROPERTY: Record<string, Record<string, PropertyControl>> = {
  'svgPic': SVG_PROPERTY,
  'svgSeamlessPic': SVG_PROPERTY,
  'rect': RECT_PROPERTY,
  'g': GROUP_PROPERTY,
  'animate': ANIMATE_PROPERTY,
  'animateTransform': ANIMATE_TRANSFORM_PROPERTY,
  'set': SET_PROPERTY
};

interface UniversalComponentEditorProps {
  component: BaseComponent;
}

export function UniversalComponentEditor({ component }: UniversalComponentEditorProps) {
  // 使用本地状态并确保随组件更新
  const [localComponent, setLocalComponent] = useState<BaseComponent>(component);
  const { updateComponent } = useEditor();

  // 当外部组件变化时，更新本地状态
  useEffect(() => {
    setLocalComponent(component);
  }, [component]);

  // 处理属性变更 - 特殊处理viewBox和transform属性
  const handleUpdateProperty = (path: string, value: any) => {
    const updatedComponent = JSON.parse(JSON.stringify(localComponent));

    // 特殊处理根级属性
    if (path === 'viewBox') {
      updatedComponent.viewBox = value;
    } else if (path === 'transform') {
      updatedComponent.transform = value;
    } else {
      // 使用lodash.set处理普通嵌套属性
      set(updatedComponent, path, value);
    }

    setLocalComponent(updatedComponent);
    updateComponent(updatedComponent);
  };

  const handleAddProperty = (property: string) => {
    const updatedComponent = JSON.parse(JSON.stringify(localComponent));
    const [category, key] = property.split('.');

    // 确保目标对象存在
    if (!updatedComponent[category]) {
      updatedComponent[category] = {};
    }

    // 查找属性控件 - 修改这里的查找逻辑
    let propertyControl: PropertyControl | undefined;

    // 1. 首先从组件模板中查找
    const template = COMPONENT_TEMPLATES[component.type];
    if (template && template.propertyControls) {
      propertyControl = template.propertyControls.find(prop => prop.property === property);
    }

    // 2. 如果模板中没找到，则从属性库中查找
    if (!propertyControl) {
      const controlsLibrary = COMPONENT_TYPE_TO_PROPERTY[component.type] || {};
      // 注意：属性库中的key不是完整路径，需要进行匹配
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

    setLocalComponent(updatedComponent);
    updateComponent(updatedComponent);
  };

  const handleRemoveProperty = (propertyPath: string) => {
    const updatedComponent = JSON.parse(JSON.stringify(localComponent));

    // 处理特殊属性
    if (propertyPath === 'viewBox') {
      delete updatedComponent.viewBox;
    } else if (propertyPath === 'transform') {
      delete updatedComponent.transform;
    } else {
      // 处理常规属性
      const [category, key] = propertyPath.split('.');

      if (updatedComponent[category] && key in updatedComponent[category]) {
        delete updatedComponent[category][key];
      }
    }

    setLocalComponent(updatedComponent);
    updateComponent(updatedComponent);
  };

  // 获取该组件类型的模板
  const template = COMPONENT_TEMPLATES[component.type];
  if (!template || !template.propertyControls) {
    return <div>无法找到该组件类型的模板</div>;
  }

  // 获取固定属性（只渲染这些）
  const fixedPropertyControls = template.propertyControls.filter(prop => prop.isFixed);

  // 检查是否有固定的viewBox属性
  const hasViewBoxControl = fixedPropertyControls.some(prop => prop.property === 'viewBox');

  return (
    <div className="space-y-4">
      {/* 手动渲染viewBox控件（如果是SVG类型） */}
      {(component.type === 'svgPic' || component.type === 'svgSeamlessPic') && hasViewBoxControl && (
        <ViewBoxControl
          label="ViewBox"
          value={localComponent.viewBox || { x: 0, y: 0, width: 0, height: 0 }}
          onChange={(value) => handleUpdateProperty('viewBox', value)}
        />
      )}

      {/* 渲染其他固定属性（除了viewBox） */}
      {fixedPropertyControls
        .filter(prop => prop.property !== 'viewBox') // 排除viewBox，因为已单独处理
        .map(prop => (
          <DynamicPropertyControl
            key={prop.property}
            property={prop}
            value={get(localComponent, prop.property)}
            onChange={(value) => handleUpdateProperty(prop.property, value)}
            component={localComponent}
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