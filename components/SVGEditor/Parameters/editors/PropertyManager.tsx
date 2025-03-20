"use client"

import { useMemo, useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Edit, Plus, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DynamicPropertyControl } from '../controls/DynamicPropertyControlProps';
import { AnimationValuesEditor } from '../controls/animation/AnimationValuesEditor';
import { COMPONENT_TEMPLATES } from '@/types/core/atomicComponent';
import { COMPONENT_TYPE_TO_PROPERTY } from '@/types/core/property';
import type { BaseComponent } from "@/types/core";
import type { PropertyControl } from "@/types/core/property/index";
import { useEditor } from '@/contexts/EditorContext';

interface PropertyManagerProps {
  component: BaseComponent;
}

interface PropertyItem {
  label: string;
  path: string;
  control: PropertyControl;
}

// 主组件 - 根据组件类型选择适当的子组件
export function PropertyManager({ component }: PropertyManagerProps) {
  const isAnimationComponent = component.type === 'animate' || component.type === 'animateTransform';
  const hasAnimationValues = isAnimationComponent &&
    (component.attributes?.values || component.attributes?.from || component.attributes?.to);

  if (isAnimationComponent) {
    return <AnimationPropertyManager component={component} hasAnimationValues={hasAnimationValues} />;
  }

  return <StandardPropertyManager component={component} />;
}

// 动画属性管理器组件
function AnimationPropertyManager({
  component,
  hasAnimationValues
}: PropertyManagerProps & { hasAnimationValues: boolean }) {
  const { updateComponentAttribute } = useEditor();

  const animationPaths = [
    'attributes.values', 'attributes.keyTimes', 'attributes.keySplines',
    'attributes.calcMode', 'attributes.from', 'attributes.to'
  ];

  // 为新建的动画组件设置默认值
  useEffect(() => {
    if (hasAnimationValues || !component.attributes) return;

    if (component.type === 'animate') {
      updateComponentAttribute(component.id, 'from', '0');
      updateComponentAttribute(component.id, 'to', '1');
    } else if (component.type === 'animateTransform') {
      const type = component.attributes.type;
      const defaults = {
        'translate': ['0,0', '100,0'],
        'scale': ['1', '2'],
        'rotate': ['0', '360'],
      };

      const [from, to] = defaults[type as keyof typeof defaults] || ['0', '100'];
      updateComponentAttribute(component.id, 'from', from);
      updateComponentAttribute(component.id, 'to', to);
    }
  }, [component.id, component.type, component.attributes, hasAnimationValues, updateComponentAttribute]);

  // 如果有动画值，显示动画编辑器
  if (hasAnimationValues) {
    return (
      <div className="space-y-4">
        <AnimationValuesEditor
          component={component}
          onUpdateProperty={(path, value) => {
            const [, key] = path.split('.');
            updateComponentAttribute(component.id, key, value);
          }}
        />

        {/* 显示非动画属性 */}
        <PropertyListManager
          component={component}
          excludePaths={animationPaths}
        />
      </div>
    );
  }

  // 否则显示标准属性管理器
  return <StandardPropertyManager component={component} />;
}

// 标准属性管理器组件
function StandardPropertyManager({ component }: PropertyManagerProps) {
  return <PropertyListManager component={component} />;
}

// 通用属性列表管理器
function PropertyListManager({
  component,
  excludePaths = []
}: PropertyManagerProps & { excludePaths?: string[] }) {
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const { updateComponent, updateComponentStyle, updateComponentAttribute } = useEditor();

  const template = COMPONENT_TEMPLATES[component.type];
  const typeControls = COMPONENT_TYPE_TO_PROPERTY[component.type] || {};

  // 处理属性操作
  const handleUpdateProperty = (path: string, value: any) => {
    const [category, key] = path.split('.');

    if (category === 'style') {
      updateComponentStyle(component.id, key, value);
    } else if (category === 'attributes') {
      updateComponentAttribute(component.id, key, value);
    } else {
      const updatedComponent = { ...component };

      if (!updatedComponent[category]) {
        updatedComponent[category] = {};
      }

      updatedComponent[category][key] = value;
      updateComponent(updatedComponent);
    }
  };

  const handleAddProperty = (property: string) => {
    const [category, key] = property.split('.');

    const propertyControl = template?.propertyControls?.find(prop => prop.property === property) ||
      Object.values(typeControls).find(control => control.property === property);
    const defaultValue = propertyControl?.defaultValue || '';

    if (category === 'style') {
      updateComponentStyle(component.id, key, defaultValue);
    } else if (category === 'attributes') {
      updateComponentAttribute(component.id, key, defaultValue);
    } else {
      const updatedComponent = { ...component };
      if (!updatedComponent[category]) {
        updatedComponent[category] = {};
      }
      updatedComponent[category][key] = defaultValue;
      updateComponent(updatedComponent);
    }

    setSelectedProperty("");
  };

  const handleRemoveProperty = (propertyPath: string) => {
    const [category, key] = propertyPath.split('.');

    if (category === 'style') {
      const newStyle = { ...component.style };
      delete newStyle[key];

      const updatedComponent = { ...component };
      if (Object.keys(newStyle).length > 0) {
        updatedComponent.style = newStyle;
      } else {
        delete updatedComponent.style;
      }
      updateComponent(updatedComponent);
    }
    else if (category === 'attributes') {
      const newAttributes = { ...component.attributes };
      delete newAttributes[key];

      const updatedComponent = { ...component };
      if (Object.keys(newAttributes).length > 0) {
        updatedComponent.attributes = newAttributes;
      } else {
        delete updatedComponent.attributes;
      }
      updateComponent(updatedComponent);
    }
    else {
      const updatedComponent = { ...component };
      if (updatedComponent[category]) {
        delete updatedComponent[category][key];
        if (Object.keys(updatedComponent[category]).length === 0) {
          delete updatedComponent[category];
        }
      }
      updateComponent(updatedComponent);
    }
  };

  // 计算属性列表
  const fixedPropertyPaths = useMemo(() => {
    return new Set(
      template?.propertyControls?.filter(prop => prop.isFixed).map(prop => prop.property) || []
    );
  }, [template]);

  const { existingProperties, addableProperties } = useMemo(() => {
    const createPropertyItem = (path: string, key: string, value: any, category?: string): PropertyItem => {
      const control = Object.values(typeControls).find(ctrl => ctrl.property === path) ||
        template?.propertyControls?.find(prop => prop.property === path);

      if (control) {
        return { label: control.label, path, control };
      }

      const defaultLabel = category ? `${category}: ${key}` : key;
      return {
        label: defaultLabel,
        path,
        control: {
          property: path,
          label: defaultLabel,
          type: typeof value === 'number' ? 'number' : 'string',
          defaultValue: value
        }
      };
    };

    const existingProps: PropertyItem[] = [];
    const existingPaths = new Set<string>();

    // 处理transform属性
    if (component.transform && !fixedPropertyPaths.has('transform')) {
      const control = Object.values(typeControls).find(ctrl => ctrl.property === 'transform');
      if (control) {
        existingProps.push({ label: control.label, path: 'transform', control });
        existingPaths.add('transform');
      }
    }

    // 添加默认属性
    template?.propertyControls?.filter(prop => prop.isDefault && !prop.isFixed)
      .forEach(prop => {
        existingProps.push({ label: prop.label, path: prop.property, control: prop });
        existingPaths.add(prop.property);
      });

    // 处理style属性
    if (component.style) {
      Object.entries(component.style).forEach(([key, value]) => {
        const path = `style.${key}`;
        if (existingPaths.has(path) || fixedPropertyPaths.has(path)) return;

        const item = createPropertyItem(path, key, value, 'style');
        existingProps.push(item);
        existingPaths.add(path);
      });
    }

    // 处理attributes属性
    if (component.attributes) {
      Object.entries(component.attributes).forEach(([key, value]) => {
        const path = `attributes.${key}`;
        if (existingPaths.has(path) || fixedPropertyPaths.has(path)) return;

        const item = createPropertyItem(path, key, value, 'attributes');
        existingProps.push(item);
        existingPaths.add(path);
      });
    }

    // 排序属性
    existingProps.sort((a, b) => a.label.localeCompare(b.label));

    // 过滤掉需要排除的路径
    const filteredProps = existingProps.filter(prop => !excludePaths.includes(prop.path));

    // 计算可添加属性
    const addableProps = Object.values(typeControls)
      .filter(control =>
        !fixedPropertyPaths.has(control.property) &&
        !existingPaths.has(control.property) &&
        !excludePaths.includes(control.property)
      )
      .sort((a, b) => a.label.localeCompare(b.label));

    return { existingProperties: filteredProps, addableProperties: addableProps };
  }, [component, template, typeControls, fixedPropertyPaths, excludePaths]);

  return (
    <div className="space-y-4">
      {existingProperties.length > 0 && (
        <div>
          <Label>已添加属性</Label>
          <div className="mt-2 space-y-2">
            {existingProperties.map(prop => (
              <Collapsible key={prop.path} className="border rounded-md">
                <div className="flex items-center justify-between px-3 py-2">
                  <CollapsibleTrigger className="flex items-center gap-2 text-sm hover:underline">
                    <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                    {prop.label}
                  </CollapsibleTrigger>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveProperty(prop.path)}
                    className="h-7 w-7 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <CollapsibleContent className="p-2">
                  {prop.control && (
                    <DynamicPropertyControl
                      property={prop.control}
                      value={
                        prop.path.includes('.')
                          ? component[prop.path.split('.')[0]]?.[prop.path.split('.')[1]]
                          : component[prop.path]
                      }
                      onChange={(value) => handleUpdateProperty(prop.path, value)}
                      component={component}
                    />
                  )}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>
      )}

      {addableProperties.length > 0 && (
        <div>
          <Label>添加属性</Label>
          <div className="flex items-center gap-2 mt-1">
            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
              <SelectTrigger>
                <SelectValue placeholder="选择要添加的属性" />
              </SelectTrigger>
              <SelectContent>
                {addableProperties.map(prop => (
                  <SelectItem key={prop.property} value={prop.property}>
                    {prop.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              onClick={() => selectedProperty && handleAddProperty(selectedProperty)}
              disabled={!selectedProperty}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}