"use client"

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, X, Edit } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BaseComponent } from "@/types/core";
import type { PropertyControl } from "@/types/core/property";
import { COMPONENT_TEMPLATES } from '@/components/SVGEditor/atomicComponent';
import { DynamicPropertyControl } from "./PropertyControls/DynamicPropertyControl";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import get from "lodash/get";

interface PropertyManagerProps {
  component: BaseComponent;
  onAddProperty: (property: PropertyControl) => void;
  onRemoveProperty: (path: string) => void;
  onUpdateProperty?: (path: string, value: any) => void;
}

export function PropertyManager({
  component,
  onAddProperty,
  onRemoveProperty,
  onUpdateProperty
}: PropertyManagerProps) {
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [expandedProperties, setExpandedProperties] = useState<Set<string>>(new Set());

  const toggleExpand = (path: string) => {
    const newExpanded = new Set(expandedProperties);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedProperties(newExpanded);
  };

  // 获取该组件类型的模板
  const template = COMPONENT_TEMPLATES[component.type];
  if (!template || !template.propertyControls) return null;

  // 获取固定属性路径列表
  const fixedPropertyPaths = new Set(
    template.propertyControls
      .filter(prop => prop.isFixed)
      .map(prop => prop.property)
  );

  // 从模板中获取所有非固定预设属性
  const definedProperties = template.propertyControls
    .filter(prop => !prop.isFixed)
    .reduce((acc, prop) => {
      acc[prop.property] = prop;
      return acc;
    }, {} as Record<string, PropertyControl>);

  // 当前存在的可删除属性列表
  const existingProperties = [];

  // 首先添加所有标记为isDefault的预设属性(无论是否在组件中有值)
  template.propertyControls
    .filter(prop => !prop.isFixed && prop.isDefault)
    .forEach(prop => {
      existingProperties.push({
        path: prop.property,
        label: prop.label,
        category: prop.category || (prop.property.startsWith('style.') ? 'style' : 'attributes'),
        control: prop
      });
    });

  // 获取当前已收集的属性路径集合(防止重复)
  const existingPropertyPaths = new Set(existingProperties.map(prop => prop.path));

  // 从style中查找已存在的其他属性(不重复添加已有的默认属性)
  if (component.style) {
    Object.keys(component.style).forEach(key => {
      const path = `style.${key}`;
      if (!fixedPropertyPaths.has(path) && definedProperties[path] && !existingPropertyPaths.has(path)) {
        existingProperties.push({
          path,
          label: definedProperties[path].label || key,
          category: definedProperties[path].category || 'style',
          control: definedProperties[path]
        });
        existingPropertyPaths.add(path);
      }
    });
  }

  // 从attributes中查找已存在的其他属性(不重复添加已有的默认属性)
  if (component.attributes) {
    Object.keys(component.attributes).forEach(key => {
      const path = `attributes.${key}`;
      if (!fixedPropertyPaths.has(path) && definedProperties[path] && !existingPropertyPaths.has(path)) {
        existingProperties.push({
          path,
          label: definedProperties[path].label || key,
          category: definedProperties[path].category || 'attributes',
          control: definedProperties[path]
        });
        existingPropertyPaths.add(path);
      }
    });
  }

  // 筛选出可选属性(非固定且非默认的属性才可添加)
  const optionalProperties = template.propertyControls
    .filter(prop => !prop.isFixed && !prop.isDefault);

  // 筛选出未添加的可选属性
  const availableProperties = optionalProperties.filter(
    prop => !existingPropertyPaths.has(prop.property)
  );

  if (availableProperties.length === 0 && existingProperties.length === 0) return null;

  // 处理添加属性
  const handleAddProperty = () => {
    if (!selectedProperty) return;

    const property = optionalProperties.find(p => p.property === selectedProperty);
    if (property) {
      onAddProperty(property);
      setSelectedProperty("");
    }
  };

  // 处理更新属性值
  const handleUpdateProperty = (path: string, value: any) => {
    if (onUpdateProperty) {
      onUpdateProperty(path, value);
    }
  };

  return (
    <div className="space-y-4 mt-4 border-t pt-4">
      {/* 所有可删除属性区域 */}
      {existingProperties.length > 0 && (
        <div className="space-y-2">
          <Label>现有可删除属性</Label>
          <div className="space-y-1">
            {existingProperties.map(prop => (
              <Collapsible
                key={prop.path}
                open={expandedProperties.has(prop.path)}
                onOpenChange={() => toggleExpand(prop.path)}
                className="border rounded-md overflow-hidden"
              >
                <div className="flex justify-between items-center p-2 bg-muted">
                  <CollapsibleTrigger className="flex items-center space-x-2 flex-1 text-left">
                    <Edit className="h-3 w-3" />
                    <span className="text-sm">{prop.label}</span>
                  </CollapsibleTrigger>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRemoveProperty(prop.path)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <CollapsibleContent className="p-2">
                  {prop.control && (
                    <DynamicPropertyControl
                      property={prop.control}
                      value={get(component, prop.path)}
                      onChange={(value) => handleUpdateProperty(prop.path, value)}
                    />
                  )}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>
      )}

      {/* 可添加属性区域 */}
      {availableProperties.length > 0 && (
        <div className="space-y-2">
          <Label>可添加属性</Label>
          <div className="flex space-x-2">
            <Select
              value={selectedProperty}
              onValueChange={setSelectedProperty}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="选择要添加的属性..." />
              </SelectTrigger>
              <SelectContent>
                {availableProperties.map((prop) => (
                  <SelectItem key={prop.property} value={prop.property}>
                    {prop.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddProperty}
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