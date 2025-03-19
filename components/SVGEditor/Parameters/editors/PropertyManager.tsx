"use client"

import { useMemo, useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Edit, Plus, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DynamicPropertyControl } from '../controls/DynamicPropertyControlProps';
import { AnimationValuesEditor } from '../controls/animation/AnimationValuesEditor';
import get from "lodash/get";
import { COMPONENT_TEMPLATES } from '@/types/core/atomicComponent';
import { COMPONENT_TYPE_TO_PROPERTY } from '@/types/core/property';
import type { BaseComponent } from "@/types/core";

interface PropertyManagerProps {
  component: BaseComponent;
  onAddProperty: (property: string) => void;
  onRemoveProperty: (property: string) => void;
  onUpdateProperty: (path: string, value: any) => void;
}

export function PropertyManager({
  component,
  onAddProperty,
  onRemoveProperty,
  onUpdateProperty
}: PropertyManagerProps) {
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const template = COMPONENT_TEMPLATES[component.type];
  const typeControls = COMPONENT_TYPE_TO_PROPERTY[component.type] || {};

  // 动画状态检测
  const isAnimationComponent = component.type === 'animate' || component.type === 'animateTransform';
  const hasAnimationValues = isAnimationComponent &&
    (component.attributes?.values || component.attributes?.from || component.attributes?.to);

  // 计算属性列表
  const { existingProperties, addableProperties } = useMemo(() => {
    // 固定属性集合
    const fixedPropertyPaths = new Set(
      template?.propertyControls?.filter(prop => prop.isFixed).map(prop => prop.property) || []
    );

    // 当前存在的属性
    const existingProps = [];
    const existingPaths = new Set();

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
      Object.keys(component.style).forEach(key => {
        const path = `style.${key}`;
        if (existingPaths.has(path) || fixedPropertyPaths.has(path)) return;

        // 查找控件定义
        const control = Object.values(typeControls).find(ctrl => ctrl.property === path) ||
          template?.propertyControls?.find(prop => prop.property === path);

        if (control) {
          existingProps.push({ label: control.label, path, control });
        } else {
          // 未知属性使用默认标签
          existingProps.push({
            label: `Style: ${key.charAt(0).toUpperCase() + key.slice(1)}`,
            path,
            control: {
              property: path,
              label: `Style: ${key}`,
              type: typeof component.style[key] === 'number' ? 'number' : 'string',
              defaultValue: component.style[key]
            }
          });
        }
        existingPaths.add(path);
      });
    }

    // 处理attributes属性
    if (component.attributes) {
      Object.keys(component.attributes).forEach(key => {
        const path = `attributes.${key}`;
        if (existingPaths.has(path) || fixedPropertyPaths.has(path)) return;

        // 查找控件定义
        const control = Object.values(typeControls).find(ctrl => ctrl.property === path) ||
          template?.propertyControls?.find(prop => prop.property === path);

        if (control) {
          existingProps.push({ label: control.label, path, control });
        } else {
          // 未知属性使用默认标签
          existingProps.push({
            label: `Attribute: ${key}`,
            path,
            control: {
              property: path,
              label: `Attribute: ${key}`,
              type: typeof component.attributes[key] === 'number' ? 'number' : 'string',
              defaultValue: component.attributes[key]
            }
          });
        }
        existingPaths.add(path);
      });
    }

    // 排序现有属性
    existingProps.sort((a, b) => a.label.localeCompare(b.label));

    // 计算可添加的属性
    const addableProps = Object.values(typeControls)
      .filter(control => !fixedPropertyPaths.has(control.property) && !existingPaths.has(control.property))
      .sort((a, b) => a.label.localeCompare(b.label));

    return { existingProperties: existingProps, addableProperties: addableProps };
  }, [component, template, typeControls]);

  // 为动画组件自动添加必要属性
  useEffect(() => {
    if (isAnimationComponent && !hasAnimationValues) {
      // 自动添加默认动画值
      if (!component.attributes) return;

      if (component.type === 'animate') {
        onUpdateProperty('attributes.from', '0');
        onUpdateProperty('attributes.to', '1');
      } else if (component.type === 'animateTransform') {
        const type = component.attributes.type;
        if (type === 'translate') {
          onUpdateProperty('attributes.from', '0,0');
          onUpdateProperty('attributes.to', '100,0');
        } else if (type === 'scale') {
          onUpdateProperty('attributes.from', '1');
          onUpdateProperty('attributes.to', '2');
        } else if (type === 'rotate') {
          onUpdateProperty('attributes.from', '0');
          onUpdateProperty('attributes.to', '360');
        } else {
          onUpdateProperty('attributes.from', '0');
          onUpdateProperty('attributes.to', '100');
        }
      }
    }
  }, [component.type, isAnimationComponent, hasAnimationValues]);

  return (
    <div className="space-y-4">
      {/* 动画值编辑器 */}
      {hasAnimationValues && (
        <AnimationValuesEditor
          component={component}
          onUpdateProperty={onUpdateProperty}
        />
      )}

      {/* 已添加属性 */}
      {existingProperties.length > 0 && (
        <div>
          <Label>已添加属性</Label>
          <div className="mt-2 space-y-2">
            {existingProperties
              // 过滤动画专属属性
              .filter(prop => {
                if (hasAnimationValues) {
                  return !['attributes.values', 'attributes.keyTimes', 'attributes.keySplines',
                    'attributes.calcMode', 'attributes.from', 'attributes.to'].includes(prop.path);
                }
                return true;
              })
              .map(prop => (
                <Collapsible key={prop.path} className="border rounded-md">
                  <div className="flex items-center justify-between px-3 py-2">
                    <CollapsibleTrigger className="flex items-center gap-2 text-sm hover:underline">
                      <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                      {prop.label}
                    </CollapsibleTrigger>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemoveProperty(prop.path)}
                      className="h-7 w-7 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <CollapsibleContent className="p-2">
                    {prop.control && (
                      <DynamicPropertyControl
                        property={prop.control}
                        value={get(component, prop.path)}
                        onChange={(value) => onUpdateProperty(prop.path, value)}
                        component={component}
                      />
                    )}
                  </CollapsibleContent>
                </Collapsible>
              ))}
          </div>
        </div>
      )}

      {/* 可添加属性 */}
      {addableProperties.length > 0 && (
        <div>
          <Label>添加属性</Label>
          <div className="flex items-center gap-2 mt-1">
            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
              <SelectTrigger>
                <SelectValue placeholder="选择要添加的属性" />
              </SelectTrigger>
              <SelectContent>
                {addableProperties
                  .filter(prop => {
                    if (isAnimationComponent) {
                      return !['attributes.values', 'attributes.from', 'attributes.to',
                        'attributes.keyTimes', 'attributes.keySplines', 'attributes.calcMode'].includes(prop.property);
                    }
                    return true;
                  })
                  .map(prop => (
                    <SelectItem key={prop.property} value={prop.property}>
                      {prop.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (selectedProperty) {
                  onAddProperty(selectedProperty);
                  setSelectedProperty("");
                }
              }}
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