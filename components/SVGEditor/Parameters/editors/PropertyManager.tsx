"use client"

import { useState, useMemo, useEffect } from "react";
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
import type { PropertyControl } from "@/types/core/property/index";
import { COMPONENT_TEMPLATES } from '@/types/core/atomicComponent';
import { SVG_PROPERTY } from '@/types/core/property/svgProperty';
import { RECT_PROPERTY } from '@/types/core/property/rectProperty';
import { GROUP_PROPERTY } from '@/types/core/property/groupProperty';
import { ANIMATE_PROPERTY } from '@/types/core/property/animateProperty';
import { ANIMATE_TRANSFORM_PROPERTY } from '@/types/core/property/animateTransformProperty';
import { SET_PROPERTY } from '@/types/core/property/setProperty';
import { DynamicPropertyControl } from "../controls/DynamicPropertyControlProps";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import get from "lodash/get";
import { AnimationValuesEditor } from "../controls/animation/AnimationValuesEditor";

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

interface PropertyManagerProps {
  component: any;
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

  // 获取该组件的模板
  const template = COMPONENT_TEMPLATES[component.type];
  if (!template || !template.propertyControls) return null;

  // 获取该组件类型对应的属性库
  const typeControls = COMPONENT_TYPE_TO_PROPERTY[component.type] || {};

  // 使用useMemo缓存属性计算结果
  const { existingProperties, addableProperties } = useMemo(() => {
    // 获取模板中的固定属性路径
    const fixedPropertyPaths = new Set(
      template.propertyControls
        .filter(prop => prop.isFixed)
        .map(prop => prop.property)
    );

    // 当前存在的可删除属性列表
    const existingProps: Array<{
      label: string;
      path: string;
      control: PropertyControl | undefined;
    }> = [];

    // 已添加属性的路径集合(用于防止重复)
    const existingPropertyPaths = new Set<string>();

    // 检查特殊属性 - viewBox（不处理此固定属性，由UniversalComponentEditor处理）

    // 检查特殊属性 - transform（如果不是固定属性且存在）
    if (component.transform && !fixedPropertyPaths.has('transform')) {
      const transformControl = Object.values(typeControls).find(ctrl => ctrl.property === 'transform');
      if (transformControl) {
        existingProps.push({
          label: transformControl.label,
          path: 'transform',
          control: transformControl
        });
        existingPropertyPaths.add('transform');
      }
    }

    // 1. 添加所有标记为isDefault的预设属性
    template.propertyControls
      .filter(prop => prop.isDefault && !prop.isFixed)
      .forEach(prop => {
        existingProps.push({
          label: prop.label,
          path: prop.property,
          control: prop
        });
        existingPropertyPaths.add(prop.property);
      });

    // 2. 从style中查找已存在的属性 - 确保检查所有可能的style属性
    if (component.style) {
      Object.keys(component.style).forEach(key => {
        const path = `style.${key}`;

        // 跳过已添加的属性和固定属性
        if (existingPropertyPaths.has(path) || fixedPropertyPaths.has(path)) return;

        // 1. 首先从当前组件类型的属性库中查找
        let control = Object.values(typeControls).find(ctrl => ctrl.property === path);

        // 2. 如果没找到，再从模板中查找
        if (!control) {
          control = template.propertyControls.find(prop => prop.property === path);
        }

        // 如果找到了控件定义，则添加到已存在属性列表
        if (control) {
          existingProps.push({
            label: control.label,
            path,
            control
          });
        } else {
          // 对于未知属性，使用格式化的key作为标签
          existingProps.push({
            label: `Style: ${key.charAt(0).toUpperCase() + key.slice(1)}`,
            path,
            control: {
              property: path,
              label: `Style: ${key}`,
              type: typeof component.style[key] === 'number' ? 'number' : 'string',
              defaultValue: component.style[key]
            } as PropertyControl
          });
        }
        existingPropertyPaths.add(path);
      });
    }

    // 3. 从attributes中查找已存在的属性
    if (component.attributes) {
      Object.keys(component.attributes).forEach(key => {
        const path = `attributes.${key}`;

        // 跳过已添加的属性和固定属性
        if (existingPropertyPaths.has(path) || fixedPropertyPaths.has(path)) return;

        // 查找匹配的属性控件
        let control = Object.values(typeControls).find(ctrl => ctrl.property === path);
        if (!control) {
          control = template.propertyControls.find(prop => prop.property === path);
        }

        if (control) {
          existingProps.push({
            label: control.label,
            path,
            control
          });
        } else {
          // 对于未知属性，创建一个临时控件
          existingProps.push({
            label: `Attribute: ${key}`,
            path,
            control: {
              property: path,
              label: `Attribute: ${key}`,
              type: typeof component.attributes[key] === 'number' ? 'number' : 'string',
              defaultValue: component.attributes[key]
            } as PropertyControl
          });
        }
        existingPropertyPaths.add(path);
      });
    }

    // 排序现有属性，使其更容易找到
    existingProps.sort((a, b) => a.label.localeCompare(b.label));

    // 计算可添加的属性
    const addableProps: PropertyControl[] = [];

    // 将所有属性库控件转换为数组并过滤处理
    Object.values(typeControls).forEach(control => {
      // 跳过固定属性和已存在的属性
      if (fixedPropertyPaths.has(control.property) || existingPropertyPaths.has(control.property)) {
        return;
      }

      addableProps.push(control);
    });

    // 排序可添加属性，使其更容易找到
    addableProps.sort((a, b) => a.label.localeCompare(b.label));

    return {
      existingProperties: existingProps,
      addableProperties: addableProps
    };
  }, [component, template, typeControls]);

  const handleAddProperty = () => {
    if (selectedProperty) {
      onAddProperty(selectedProperty);
      setSelectedProperty("");
    }
  };

  // 判断是否应该使用统一的动画值编辑器
  const shouldUseAnimationValuesEditor = (component.type === 'animate' || component.type === 'animateTransform') &&
    (component.attributes?.values || component.attributes?.from || component.attributes?.to);

  // 检测是否需要添加动画值编辑器
  useEffect(() => {
    // 检查组件是否需要添加动画值相关属性
    if ((component.type === 'animate' || component.type === 'animateTransform') &&
      !(component.attributes?.values || component.attributes?.from || component.attributes?.to)) {

      // 如果没有动画值属性，自动添加默认的from-to动画
      if (!component.attributes) {
        component.attributes = {};
      }

      // 设置默认值
      if (component.type === 'animate') {
        onUpdateProperty('attributes.from', '0');
        onUpdateProperty('attributes.to', '1');
      } else if (component.type === 'animateTransform') {
        if (component.attributes?.type === 'translate') {
          onUpdateProperty('attributes.from', '0,0');
          onUpdateProperty('attributes.to', '100,0');
        } else if (component.attributes?.type === 'scale') {
          onUpdateProperty('attributes.from', '1');
          onUpdateProperty('attributes.to', '2');
        } else if (component.attributes?.type === 'rotate') {
          onUpdateProperty('attributes.from', '0');
          onUpdateProperty('attributes.to', '360');
        } else {
          onUpdateProperty('attributes.from', '0');
          onUpdateProperty('attributes.to', '100');
        }
      }
    }
  }, [component.type]);

  return (
    <div className="space-y-4">
      {/* 如果是动画组件且有相关属性，显示统一的动画值编辑器 */}
      {shouldUseAnimationValuesEditor && (
        <AnimationValuesEditor
          component={component}
          onUpdateProperty={onUpdateProperty}
        />
      )}

      {/* 现有的属性列表和添加属性功能代码 */}
      {existingProperties.length > 0 && (
        <div>
          <Label>已添加属性</Label>
          <div className="mt-2 space-y-2">
            {existingProperties
              // 过滤掉由动画值编辑器处理的属性
              .filter(prop => {
                if (shouldUseAnimationValuesEditor) {
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

      {/* 添加调试信息 */}
      {process.env.NODE_ENV !== 'production' && component.style && (
        <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded">
          <div>当前style属性：{Object.keys(component.style).join(', ')}</div>
        </div>
      )}

      {/* 可添加属性区域 - 统一属性选择菜单 */}
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
                    // 对动画组件的特殊过滤逻辑
                    if (component.type === 'animate' || component.type === 'animateTransform') {
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