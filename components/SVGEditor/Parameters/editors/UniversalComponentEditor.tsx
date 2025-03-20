"use client"

import { useMemo } from "react";
import { PropertyManager } from './PropertyManager';
import get from "lodash/get";
import set from "lodash/set";
import { useEditor } from '@/contexts/EditorContext';
import { COMPONENT_TEMPLATES } from '@/types/core/atomicComponent';
import { DynamicPropertyControl } from '../controls/DynamicPropertyControlProps';


export function UniversalComponentEditor() {
  const { updateComponent, selectedComponent } = useEditor();

  // 如果没有选中组件，显示提示信息
  if (!selectedComponent) {
    return <div className="text-center p-4 text-gray-500">请选择一个组件进行编辑</div>;
  }

  // 获取固定属性控件
  const fixedPropertyControls = useMemo(() => {
    const template = COMPONENT_TEMPLATES[selectedComponent.type];
    return template?.propertyControls?.filter(prop => prop.isFixed) || [];
  }, [selectedComponent.type]);

  // 处理固定属性的更新
  const handleUpdateFixedProperty = (path: string, value: any) => {
    const updatedComponent = JSON.parse(JSON.stringify(selectedComponent));
    set(updatedComponent, path, value);
    updateComponent(updatedComponent);
  };

  return (
    <div className="space-y-4">
      {/* 固定属性控件 */}
      {fixedPropertyControls.map(prop => (
        <DynamicPropertyControl
          key={prop.property}
          property={prop}
          value={get(selectedComponent, prop.property) || prop.defaultValue}
          onChange={(value) => handleUpdateFixedProperty(prop.property, value)}
          component={selectedComponent}
        />
      ))}

      <PropertyManager component={selectedComponent} />
    </div>
  );
} 