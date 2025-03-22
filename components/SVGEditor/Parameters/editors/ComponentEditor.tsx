"use client"

import { useEffect } from 'react';
import { PropertyManager } from './PropertyManager';
import { useEditor } from '@/contexts/EditorContext';
import { DynamicPropertyControl } from '../controls/DynamicPropertyControl';
import { useProperties, getPropertyValue } from '../hooks/useProperties';

export function ComponentEditor() {
  const { selectedComponent } = useEditor();

  // 如果没有选中组件，显示提示信息
  if (!selectedComponent) {
    return <div className="text-center p-4 text-gray-500">请选择一个组件进行编辑</div>;
  }

  const {
    fixedProperties,
    updateProperty
  } = useProperties([]);

  useEffect(() => {
    console.log('fixedProperties', fixedProperties);
  }, [fixedProperties]);

  return (
    <div className="space-y-4">
      {fixedProperties.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">基础属性</h3>
          <div className="space-y-3">
            {fixedProperties.map(prop => (
              <DynamicPropertyControl
                key={prop.path}
                property={prop.control}
                value={getPropertyValue(selectedComponent, prop.path)}
                onChange={(value) => updateProperty(prop.path, value)}
              />
            ))}
          </div>
        </div>
      )}

      <PropertyManager />
    </div>
  );
} 