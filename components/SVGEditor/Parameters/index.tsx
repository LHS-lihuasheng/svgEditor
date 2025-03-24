"use client"

import { cn } from "@/lib/utils"
import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label";
import { usePanel } from "@/contexts/PanelContext"
import { useEditor } from '@/contexts/EditorContext'
import { ScrollArea } from "@/components/ui/scroll-area"
import { DynamicPropertyControl } from './controls/DynamicPropertyControl';
import { AnimationValuesEditor } from './controls/animation/AnimationValuesEditor';
import { getPropertyValue, useProperties, groupProperties } from './useProperties';
import { ChevronLeft, ChevronRight, Plus, Edit, X, ChevronDown, ChevronUp } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import _ from 'lodash';

// 动画相关的属性路径
const ANIMATION_PROPERTY_PATHS = [
  'attributes.values', 'attributes.keyTimes', 'attributes.keySplines',
  'attributes.calcMode', 'attributes.from', 'attributes.to', 'attributes.by',
  'attributes.additive', 'attributes.accumulate'
];

export function Parameters() {
  const { isParametersPanelOpen, toggleParametersPanel } = usePanel();
  const { selectedComponent } = useEditor();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    '组件属性': true
  });
  const [selectedPropertyPath, setSelectedPropertyPath] = useState<string>('');

  // 判断是否为动画组件
  const isAnimationComponent = !!selectedComponent?.animationMode;
  // 确定排除路径
  const excludePaths = isAnimationComponent ? ANIMATION_PROPERTY_PATHS : [];

  // 获取所有属性
  const {
    existingProperties,
    addableProperties,
    updateProperty,
    addProperty,
    removeProperty
  } = useProperties(excludePaths);

  // 从existingProperties中筛选出固定属性
  const fixedProperties = useMemo(() => {
    return existingProperties.filter(prop => prop.isFixed);
  }, [existingProperties]);

  // 获取非固定属性并分组
  const groupedProperties = useMemo(() => {
    return groupProperties(existingProperties.filter(prop => !prop.isFixed));
  }, [existingProperties]);

  // 切换分组展开状态
  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  // 处理添加属性
  const handleAddProperty = () => {
    if (selectedPropertyPath) {
      const [category, key] = selectedPropertyPath.split('.');
      if (category && key) {
        addProperty(category as 'attributes' | 'style', key);
        setSelectedPropertyPath('');
      }
    }
  };

  // 渲染固定属性
  const renderFixedProperties = () => {
    if (!fixedProperties.length) return null;

    return (
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-800">基础属性</h3>
          <span className="text-xs text-gray-500">{fixedProperties.length}项</span>
        </div>
        <div className="space-y-4 pl-1">
          {fixedProperties.map(prop => (
            <DynamicPropertyControl
              key={prop.path}
              propertyConfig={prop.config}
              value={getPropertyValue(selectedComponent, prop.path)}
              onChange={(value) => updateProperty(prop.path, value)}
            />
          ))}
        </div>
      </div>
    );
  };

  // 渲染非固定属性分组
  const renderEditableProperties = () => {
    return (
      <>
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
                        {prop.config.label}
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
                      {prop.config && (
                        <DynamicPropertyControl
                          propertyConfig={prop.config}
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
      </>
    );
  };

  // 渲染添加属性选择器
  const renderAddPropertySelector = () => {
    if (_.isEmpty(addableProperties)) return null;

    return (
      <div>
        <Label>添加属性</Label>
        <div className="flex items-center gap-2 mt-1">
          <Select value={selectedPropertyPath} onValueChange={setSelectedPropertyPath}>
            <SelectTrigger>
              <SelectValue placeholder="选择要添加的属性" />
            </SelectTrigger>
            <SelectContent>
              {_.map(addableProperties, prop => (
                <SelectItem key={prop.path} value={prop.path}>
                  {prop.config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddProperty}
            disabled={_.isEmpty(selectedPropertyPath)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div
      className={cn(
        "fixed top-[57px] right-0 bottom-0 bg-white shadow-lg transition-[width] duration-300 ease-in-out z-10",
        isParametersPanelOpen ? "w-96" : "w-12"
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 left-2 h-8 w-8"
        onClick={toggleParametersPanel}
      >
        {isParametersPanelOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>

      {isParametersPanelOpen && (
        <div className="p-4 pt-12">
          <ScrollArea className="h-[calc(100vh-120px)] pr-3">
            <div className="space-y-4">
              {selectedComponent ? (
                <>
                  <div className="text-sm flex items-center gap-2">
                    <span className="font-medium">组件ID:</span>
                    <span className="text-gray-700 font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                      {selectedComponent.id}
                    </span>
                  </div>

                  <div className="border-t pt-4 mt-4 space-y-6">
                    {/* 动画组件的特殊处理 */}
                    {isAnimationComponent && <AnimationValuesEditor />}

                    {/* 固定属性 */}
                    {renderFixedProperties()}

                    {/* 可编辑属性 */}
                    {renderEditableProperties()}

                    {/* 添加属性选择器 */}
                    {renderAddPropertySelector()}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-[calc(100vh-150px)]">
                  <div className="text-center p-6 rounded-lg bg-gray-50 max-w-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-600 text-sm font-medium">请选择一个组件进行编辑</p>
                    <p className="text-gray-500 text-xs mt-2">在左侧组件面板或画布中选择要编辑的组件</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
} 
