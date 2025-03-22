"use client"

import { useState, useEffect } from "react";
import { useEditor } from '@/contexts/EditorContext';
import { Plus, Edit, X, ChevronDown, ChevronUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DynamicPropertyControl } from '../controls/DynamicPropertyControl';
import { AnimationValuesEditor } from '../controls/animation/AnimationValuesEditor';
import { useProperties, groupProperties, getPropertyValue } from '../hooks/useProperties';
import _ from 'lodash';

// 动画相关的属性路径
const ANIMATION_PROPERTY_PATHS = [
  'attributes.values', 'attributes.keyTimes', 'attributes.keySplines',
  'attributes.calcMode', 'attributes.from', 'attributes.to', 'attributes.by',
  'attributes.additive', 'attributes.accumulate'
];

export function PropertyManager() {
  const { selectedComponent } = useEditor();

  if (!selectedComponent) {
    return <div className="text-center p-4 text-gray-500">请选择一个组件进行编辑</div>;
  }

  // 根据animationMode字段判断是否为动画组件
  const isAnimationComponent = !!selectedComponent.animationMode;

  return (
    <div className="space-y-4">
      {isAnimationComponent && (
        <>
          <AnimationValuesEditor />
          <PropertyPanel excludePaths={ANIMATION_PROPERTY_PATHS} />
        </>
      )}

      {!isAnimationComponent && <PropertyPanel excludePaths={[]} />}
    </div>
  );
}

// 属性面板组件
function PropertyPanel({ excludePaths = [] }: { excludePaths?: string[] }) {
  const { selectedComponent } = useEditor();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    '组件属性': true
  });

  const {
    selectedProperty,
    setSelectedProperty,
    updateProperty,
    addProperty,
    removeProperty,
    existingProperties,
    addableProperties
  } = useProperties(excludePaths);

  if (!selectedComponent) return null;

  // 属性分组
  const groupedProperties = groupProperties(existingProperties);

  // 切换分组展开状态
  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  return (
    <>

      {/* 分组属性列表 */}
      {_.map(groupedProperties, (props, group) => (
        <div key={group} className="border rounded-md mb-4">
          <div
            className="flex items-center justify-between px-3 py-2 cursor-pointer bg-muted/30"
            onClick={() => toggleGroup(group)}
          >
            <div className="text-sm font-medium flex items-center gap-2">
              {_.get(expandedGroups, group) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {group}
            </div>
            <div className="text-xs text-muted-foreground">{props.length}项</div>
          </div>

          {_.get(expandedGroups, group) && (
            <div className="divide-y">
              {_.map(props, prop => (
                <Collapsible key={prop.path} className="px-3 py-2">
                  <div className="flex items-center justify-between">
                    <CollapsibleTrigger className="flex items-center gap-2 text-sm hover:underline">
                      <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                      {prop.label}
                    </CollapsibleTrigger>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeProperty(prop.path)}
                      className="h-7 w-7 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <CollapsibleContent className="pt-2 pb-1">
                    {prop.control && (
                      <DynamicPropertyControl
                        property={prop.control}
                        value={getPropertyValue(selectedComponent, prop.path)}
                        onChange={(value) => updateProperty(prop.path, value)}
                      />
                    )}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* 添加属性选择器 */}
      {!_.isEmpty(addableProperties) && (
        <div>
          <Label>添加属性</Label>
          <div className="flex items-center gap-2 mt-1">
            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
              <SelectTrigger>
                <SelectValue placeholder="选择要添加的属性" />
              </SelectTrigger>
              <SelectContent>
                {_.map(addableProperties, prop => (
                  <SelectItem key={prop.property} value={prop.property}>
                    {prop.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              onClick={() => selectedProperty && addProperty(selectedProperty)}
              disabled={_.isEmpty(selectedProperty)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}