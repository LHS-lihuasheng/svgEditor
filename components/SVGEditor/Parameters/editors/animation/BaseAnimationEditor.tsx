"use client"

import { useEditor } from '@/contexts/EditorContext/index';
import { BaseComponent } from "@/types/core";
import { useState, useEffect } from 'react';
import { COMPONENT_TEMPLATES } from '@/components/SVGEditor/atomicComponent';
import { DynamicPropertyControl } from '../../controls/DynamicPropertyControlProps';
import { PropertyManager } from '../../PropertyManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TriggerControl } from '../../controls/animation/TriggerControl';
import { RepeatCountControl } from '../../controls/animation/RepeatCountControl';
import get from "lodash/get";
import set from "lodash/set";

interface BaseAnimationEditorProps {
  component: BaseComponent;
  children?: React.ReactNode;
  renderBasicTab?: (localComponent: BaseComponent, handlePropertyChange: (path: string, value: any) => void) => React.ReactNode;
}

export function BaseAnimationEditor({
  component,
  children,
  renderBasicTab
}: BaseAnimationEditorProps) {
  // 基础状态管理
  const [localComponent, setLocalComponent] = useState<BaseComponent>(component);
  const { updateComponent } = useEditor();

  // 当外部组件变化时，更新本地状态
  useEffect(() => {
    setLocalComponent(component);
  }, [component]);

  // 处理属性变更
  const handlePropertyChange = (path: string, value: any) => {
    const updatedComponent = JSON.parse(JSON.stringify(localComponent));

    // 使用lodash.set处理普通嵌套属性
    set(updatedComponent, path, value);

    // 各子类可以重写此方法进行特殊处理

    setLocalComponent(updatedComponent);
    updateComponent(updatedComponent);
  };

  // 处理添加属性
  const handleAddProperty = (property: string) => {
    const updatedComponent = JSON.parse(JSON.stringify(localComponent));

    // 获取该组件类型的模板
    const template = COMPONENT_TEMPLATES[component.type];
    if (!template || !template.propertyControls) {
      console.error('无法找到组件模板:', component.type);
      return;
    }

    // 查找属性控件定义
    const propertyControl = template.propertyControls.find(prop => prop.property === property);
    if (!propertyControl) {
      console.error('无法找到属性控件:', property);
      return;
    }

    // 解析属性路径并设置默认值
    const [category, key] = property.split('.');
    if (!updatedComponent[category]) {
      updatedComponent[category] = {};
    }
    updatedComponent[category][key] = propertyControl.defaultValue;

    setLocalComponent(updatedComponent);
    updateComponent(updatedComponent);
  };

  // 处理移除属性
  const handleRemoveProperty = (property: string) => {
    const updatedComponent = JSON.parse(JSON.stringify(localComponent));

    const [category, key] = property.split('.');
    if (updatedComponent[category] && key in updatedComponent[category]) {
      delete updatedComponent[category][key];
    }

    setLocalComponent(updatedComponent);
    updateComponent(updatedComponent);
  };

  // 获取该组件类型的模板
  const template = COMPONENT_TEMPLATES[component.type];
  if (!template) {
    return <div>无法找到该组件类型的模板</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="basic">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">基本属性</TabsTrigger>
          <TabsTrigger value="timing">时间控制</TabsTrigger>
          <TabsTrigger value="advanced">高级设置</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 pt-4">
          {/* 子组件可以提供特定的基本属性渲染 */}
          {renderBasicTab && renderBasicTab(localComponent, handlePropertyChange)}
          {children}
        </TabsContent>

        <TabsContent value="timing" className="space-y-4 pt-4">
          {/* 触发条件 */}
          <TriggerControl
            label="Begin"
            value={localComponent.attributes?.begin || "0s"}
            onChange={(v) => handlePropertyChange('attributes.begin', v)}
          />

          {/* 持续时间 */}
          <DynamicPropertyControl
            property={{
              type: 'string',
              property: 'attributes.dur',
              label: 'Duration',
              defaultValue: '1s'
            }}
            value={localComponent.attributes?.dur || "1s"}
            onChange={(v) => handlePropertyChange('attributes.dur', v)}
          />

          {/* 重复次数 */}
          <RepeatCountControl
            label="Repeat Count"
            value={localComponent.attributes?.repeatCount || "1"}
            onChange={(v) => handlePropertyChange('attributes.repeatCount', v)}
          />

          {/* 结束状态 */}
          <DynamicPropertyControl
            property={{
              type: 'select',
              property: 'attributes.fill',
              label: 'Fill Mode',
              defaultValue: 'remove',
              options: [
                { label: 'Freeze', value: 'freeze' },
                { label: 'Remove', value: 'remove' }
              ]
            }}
            value={localComponent.attributes?.fill || "remove"}
            onChange={(v) => handlePropertyChange('attributes.fill', v)}
          />

          {/* 重启行为 */}
          <DynamicPropertyControl
            property={{
              type: 'select',
              property: 'attributes.restart',
              label: 'Restart',
              defaultValue: 'always',
              options: [
                { label: 'Always', value: 'always' },
                { label: 'When Not Active', value: 'whenNotActive' },
                { label: 'Never', value: 'never' }
              ]
            }}
            value={localComponent.attributes?.restart || "always"}
            onChange={(v) => handlePropertyChange('attributes.restart', v)}
          />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4 pt-4">
          {/* 结束时间 */}
          <DynamicPropertyControl
            property={{
              type: 'string',
              property: 'attributes.end',
              label: 'End',
              defaultValue: ''
            }}
            value={localComponent.attributes?.end || ""}
            onChange={(v) => handlePropertyChange('attributes.end', v)}
          />

          {/* 最小/最大持续时间 */}
          <div className="grid grid-cols-2 gap-4">
            <DynamicPropertyControl
              property={{
                type: 'string',
                property: 'attributes.min',
                label: 'Min Duration',
                defaultValue: '0'
              }}
              value={localComponent.attributes?.min || "0"}
              onChange={(v) => handlePropertyChange('attributes.min', v)}
            />

            <DynamicPropertyControl
              property={{
                type: 'string',
                property: 'attributes.max',
                label: 'Max Duration',
                defaultValue: ''
              }}
              value={localComponent.attributes?.max || ""}
              onChange={(v) => handlePropertyChange('attributes.max', v)}
            />
          </div>

          {/* PropertyManager处理所有非固定属性 */}
          <PropertyManager
            component={localComponent}
            onAddProperty={handleAddProperty}
            onRemoveProperty={handleRemoveProperty}
            onUpdateProperty={handlePropertyChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
} 