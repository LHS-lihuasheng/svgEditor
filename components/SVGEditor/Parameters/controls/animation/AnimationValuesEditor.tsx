"use client"

import { useState, useEffect, useCallback, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash, ChevronDown, ChevronUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KeyframesSplinePreview } from "./KeyframesSplinePreview";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { BaseComponent } from "@/types/core";
import { debounce } from "lodash";
import { useEditor } from "@/contexts/EditorContext";

interface Keyframe {
  value: string;
  time: string;
}

interface Spline {
  x1: string;
  y1: string;
  x2: string;
  y2: string;
}

type AnimationMode = 'values' | 'fromTo' | 'fromBy' | 'to' | 'by';

// 解析动画值为关键帧
function parseValuesToKeyframes(values: string, keyTimes?: string): Keyframe[] {
  if (!values) return [{ value: "0", time: "0" }, { value: "1", time: "1" }];

  const valuesList = values.split(';');
  const timesList = keyTimes ? keyTimes.split(';') : [];

  return valuesList.map((val, index) => ({
    value: val,
    time: timesList[index] || (index / Math.max(1, valuesList.length - 1)).toString()
  }));
}

// 解析贝塞尔样条
function parseKeySplines(keySplines: string): Spline[] {
  if (!keySplines) return [];

  return keySplines.split(';').map(spline => {
    const [x1, y1, x2, y2] = spline.split(' ');
    return {
      x1: x1 || "0",
      y1: y1 || "0",
      x2: x2 || "1",
      y2: y2 || "1"
    };
  });
}

// 内部上下文状态管理
function useAnimationEditorState(component: BaseComponent, onUpdateProperty: (path: string, value: any) => void) {
  // 只读取组件的现有值，不设置默认值
  const [animationMode, setAnimationMode] = useState<AnimationMode>(() => {
    return component.animationMode as AnimationMode || 'values';
  });

  // 只读取当前值，不设置默认值
  const [values, setValues] = useState(component.attributes?.values || "");
  const [fromValue, setFromValue] = useState(component.attributes?.from || "");
  const [toValue, setToValue] = useState(component.attributes?.to || "");
  const [byValue, setByValue] = useState(component.attributes?.by || "");
  const [keyTimes, setKeyTimes] = useState(component.attributes?.keyTimes || "");
  const [keySplines, setKeySplines] = useState(component.attributes?.keySplines || "");
  const [calcMode, setCalcMode] = useState(component.attributes?.calcMode || "linear");

  // 高级编辑模式
  const [advancedMode, setAdvancedMode] = useState(false);
  const [showSplineEditor, setShowSplineEditor] = useState(false);

  // 关键帧对象列表
  const keyframes = useMemo(() => {
    if (!values) return [];

    const valuesList = values.split(';');
    const timesList = keyTimes ? keyTimes.split(';') : [];

    return valuesList.map((val, index) => ({
      value: val,
      time: timesList[index] || (index / Math.max(1, valuesList.length - 1)).toString()
    }));
  }, [values, keyTimes]);

  // 样条曲线列表
  const splines = useMemo(() => {
    if (!keySplines) return [];

    return keySplines.split(';').map(spline => {
      const [x1, y1, x2, y2] = spline.split(' ');
      return { x1: x1 || "0", y1: y1 || "0", x2: x2 || "1", y2: y2 || "1" };
    });
  }, [keySplines]);

  // 用于更新属性的防抖函数
  const debouncedUpdate = useCallback(
    debounce((path: string, value: string | null) => {
      onUpdateProperty(path, value);
    }, 300),
    [onUpdateProperty]
  );

  // 更新关键帧和时间
  const updateKeyframes = useCallback((newKeyframes: Keyframe[]) => {
    const newValues = newKeyframes.map(kf => kf.value).join(';');
    const newTimes = newKeyframes.map(kf => kf.time).join(';');

    setValues(newValues);
    setKeyTimes(newTimes);

    debouncedUpdate('attributes.values', newValues);
    debouncedUpdate('attributes.keyTimes', newTimes);
  }, [debouncedUpdate]);

  // 更新样条曲线
  const updateSplines = useCallback((newSplines: Spline[]) => {
    const newSplinesStr = newSplines
      .map(s => `${s.x1} ${s.y1} ${s.x2} ${s.y2}`)
      .join(';');

    setKeySplines(newSplinesStr);
    debouncedUpdate('attributes.keySplines', newSplinesStr);
  }, [debouncedUpdate]);

  // 处理动画模式切换
  const handleModeChange = useCallback((mode: AnimationMode) => {
    setAnimationMode(mode);

    // 只更新模式，依赖模板默认值
    onUpdateProperty('animationMode', mode);
  }, [onUpdateProperty]);

  // 改进值更改函数
  const handleValueChange = useCallback((field: string, value: string) => {
    // 更新本地状态
    switch (field) {
      case 'values': setValues(value); break;
      case 'from': setFromValue(value); break;
      case 'to': setToValue(value); break;
      case 'by': setByValue(value); break;
      case 'keyTimes': setKeyTimes(value); break;
      case 'keySplines': setKeySplines(value); break;
      case 'calcMode': setCalcMode(value); break;
    }

    // 立即更新组件属性，不使用防抖
    onUpdateProperty(`attributes.${field}`, value);
  }, [onUpdateProperty]);

  // 添加关键帧
  const addKeyframe = useCallback(() => {
    const newKeyframes = [...keyframes];
    const lastIndex = newKeyframes.length - 1;

    // 如果已有关键帧，使用最后一个作为模板
    if (lastIndex >= 0) {
      const lastKeyframe = newKeyframes[lastIndex];
      newKeyframes.push({
        value: lastKeyframe.value,
        time: "1"
      });

      // 重新计算时间，使之均匀分布
      newKeyframes.forEach((kf, i) => {
        kf.time = (i / (newKeyframes.length - 1)).toFixed(2);
      });
    } else {
      // 没有关键帧，添加默认值
      newKeyframes.push({ value: "0", time: "0" });
      newKeyframes.push({ value: "1", time: "1" });
    }

    updateKeyframes(newKeyframes);

    // 如果是样条曲线模式，添加对应的样条
    if (calcMode === "spline") {
      const newSplines = [...splines];
      if (newKeyframes.length > 1 && newSplines.length < newKeyframes.length - 1) {
        newSplines.push({ x1: "0", y1: "0", x2: "1", y2: "1" });
        updateSplines(newSplines);
      }
    }
  }, [keyframes, splines, calcMode, updateKeyframes, updateSplines]);

  // 删除关键帧
  const removeKeyframe = useCallback((index: number) => {
    if (keyframes.length <= 2) {
      // 保持至少两个关键帧
      return;
    }

    const newKeyframes = keyframes.filter((_, i) => i !== index);

    // 重新计算时间，使之均匀分布
    newKeyframes.forEach((kf, i) => {
      kf.time = (i / Math.max(1, newKeyframes.length - 1)).toFixed(2);
    });

    updateKeyframes(newKeyframes);

    // 更新样条
    if (calcMode === "spline" && splines.length > 0) {
      let newSplines = [...splines];
      if (index < newSplines.length) {
        newSplines = newSplines.filter((_, i) => i !== index);
        updateSplines(newSplines);
      }
    }
  }, [keyframes, splines, calcMode, updateKeyframes, updateSplines]);

  // 更新单个关键帧
  const updateKeyframe = useCallback((index: number, field: 'value' | 'time', value: string) => {
    const newKeyframes = [...keyframes];
    newKeyframes[index][field] = value;
    updateKeyframes(newKeyframes);
  }, [keyframes, updateKeyframes]);

  // 更新单个样条
  const updateSpline = useCallback((index: number, field: keyof Spline, value: string) => {
        const newSplines = [...splines];
    if (newSplines[index]) {
      newSplines[index][field] = value;
      updateSplines(newSplines);
    }
  }, [splines, updateSplines]);

  return {
    animationMode,
    setAnimationMode: handleModeChange,
    values,
    fromValue,
    toValue,
    byValue,
    keyTimes,
    keySplines,
    calcMode,
    handleValueChange,
    keyframes,
    splines,
    addKeyframe,
    removeKeyframe,
    updateKeyframe,
    updateSpline,
    advancedMode,
    setAdvancedMode,
    showSplineEditor,
    setShowSplineEditor
  };
}

export function AnimationValuesEditor() {
  const { selectedComponent, updateComponent, updateComponentAttribute } = useEditor();

  // 简化动画属性更新 - 只管理模式切换和普通属性更新
  const handleUpdateProperty = (path: string, value: any) => {
    if (path === 'animationMode') {
      // 只更新动画模式，不处理其他默认值
      const updatedComponent = { ...selectedComponent, animationMode: value };
      updateComponent(updatedComponent as BaseComponent);
    } else {
      // 处理其他属性更新
      const [, key] = path.split('.');
      if (selectedComponent) {
        updateComponentAttribute(selectedComponent.id, key, value);
      }
    }
  };
  // 为null和undefined提供安全保护
  if (!selectedComponent) {
    return <div className="text-center p-4 text-gray-500">请选择一个组件</div>;
  }

  const {
    animationMode,
    setAnimationMode,
    values,
    fromValue,
    toValue,
    byValue,
    keyTimes,
    keySplines,
    calcMode,
    handleValueChange,
    keyframes,
    splines,
    addKeyframe,
    removeKeyframe,
    updateKeyframe,
    updateSpline,
    advancedMode,
    setAdvancedMode,
  } = useAnimationEditorState(selectedComponent, handleUpdateProperty);

  return (
    <div className="space-y-4">
      {/* 动画模式选择 - 修改为支持五种模式 */}
      <div>
        <Label>动画类型</Label>
        <Tabs
          value={animationMode}
          onValueChange={(v) => setAnimationMode(v as AnimationMode)}
          className="w-full mt-1"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="values">关键帧</TabsTrigger>
            <TabsTrigger value="fromTo">起止值</TabsTrigger>
            <TabsTrigger value="fromBy">起始增量</TabsTrigger>
            <TabsTrigger value="to">目标值</TabsTrigger>
            <TabsTrigger value="by">相对增量</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* values模式的编辑区域 */}
      {animationMode === 'values' && (
        <div className="space-y-3">
          {/* 基本/高级模式切换 */}
          <div className="flex items-center justify-between mb-2">
            <Label>编辑模式</Label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">基本</span>
              <Switch
                checked={advancedMode}
                onCheckedChange={setAdvancedMode}
              />
              <span className="text-xs text-muted-foreground">高级</span>
            </div>
          </div>

          {/* 基本模式 - 文本框编辑 */}
          {!advancedMode && (
            <>
              <div>
                <Label>关键帧值序列</Label>
                <Textarea
                  placeholder="输入分号分隔的值，如: 0;50;100"
                  value={values}
                  onChange={(e) => handleValueChange('values', e.target.value)}
                  className="font-mono text-sm"
                />
              </div>

              {/* 如果是spline模式，显示keyTimes和keySplines输入 */}
              {calcMode === "spline" && (
                <>
                  <div>
                    <Label>关键时间点 (keyTimes)</Label>
                    <Input
                      placeholder="输入分号分隔的时间值，如: 0;0.5;1"
                      value={keyTimes}
                      onChange={(e) => handleValueChange('keyTimes', e.target.value)}
                      className="font-mono text-sm"
                    />
                </div>
                  <div>
                    <Label>样条曲线控制点 (keySplines)</Label>
                    <Input
                      placeholder="输入分号分隔的贝塞尔控制点，如: 0.5 0 0.5 1;0.5 0 0.5 1"
                      value={keySplines}
                      onChange={(e) => handleValueChange('keySplines', e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                </>
              )}
            </>
          )}

          {/* 高级模式 - 关键帧对象编辑 */}
          {advancedMode && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>关键帧</Label>
                  <Button
                  size="sm"
                  variant="outline"
                  onClick={addKeyframe}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  添加关键帧
                  </Button>
              </div>

              {/* 关键帧列表 */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {keyframes.map((keyframe, index) => (
                  <Collapsible key={index} className="border rounded-md">
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <ChevronDown className="h-4 w-4" />
                        <span>关键帧 {index + 1}</span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>值: {keyframe.value}</span>
                        <span className="mx-2">|</span>
                        <span>时间: {keyframe.time}</span>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-3 pt-0 border-t">
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <div>
                  <Label className="text-xs">值</Label>
                  <Input
                    value={keyframe.value}
                            onChange={(e) => updateKeyframe(index, 'value', e.target.value)}
                  />
                </div>
                        <div>
                          <Label className="text-xs">时间 (0-1)</Label>
                    <Input
                            type="number"
                            min={0}
                            max={1}
                            step={0.01}
                      value={keyframe.time}
                            onChange={(e) => updateKeyframe(index, 'time', e.target.value)}
                    />
              </div>

                        {/* 样条曲线编辑器 (如果是spline模式，且不是最后一个关键帧) */}
                        {calcMode === "spline" && index < keyframes.length - 1 && (
                          <div className="col-span-2 mt-2">
                            <Collapsible>
                              <div className="flex items-center justify-between">
                                <Label className="text-xs">贝塞尔曲线控制点</Label>
                  <CollapsibleTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <ChevronDown className="h-3.5 w-3.5" />
                                  </Button>
                  </CollapsibleTrigger>
                              </div>
                              <CollapsibleContent className="pt-2">
                                <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">x1</Label>
                          <Input
                                      type="number"
                                      min={0}
                                      max={1}
                                      step={0.01}
                                      value={splines[index]?.x1 || "0"}
                                      onChange={(e) => updateSpline(index, 'x1', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">y1</Label>
                          <Input
                                      type="number"
                                      min={0}
                                      max={1}
                                      step={0.01}
                            value={splines[index]?.y1 || "0"}
                                      onChange={(e) => updateSpline(index, 'y1', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">x2</Label>
                          <Input
                                      type="number"
                                      min={0}
                                      max={1}
                                      step={0.01}
                                      value={splines[index]?.x2 || "1"}
                                      onChange={(e) => updateSpline(index, 'x2', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">y2</Label>
                          <Input
                                      type="number"
                                      min={0}
                                      max={1}
                                      step={0.01}
                            value={splines[index]?.y2 || "1"}
                                      onChange={(e) => updateSpline(index, 'y2', e.target.value)}
                          />
                        </div>
                      </div>
                                {/* 贝塞尔曲线预览 */}
                                <div className="mt-2 border rounded p-2">
                        <KeyframesSplinePreview
                                    x1={parseFloat(splines[index]?.x1 || "0")}
                                    y1={parseFloat(splines[index]?.y1 || "0")}
                                    x2={parseFloat(splines[index]?.x2 || "1")}
                                    y2={parseFloat(splines[index]?.y2 || "1")}
                                  />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
            </div>
                        )}

                        {/* 删除按钮 */}
                        <div className="col-span-2 flex justify-end mt-2">
          <Button
            size="sm"
                            variant="destructive"
                            onClick={() => removeKeyframe(index)}
                            disabled={keyframes.length <= 2}
                          >
                            <Trash className="h-3.5 w-3.5 mr-1" />
                            删除关键帧
          </Button>
        </div>
            </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
            </div>
            </div>
          )}

          {/* 计算模式选项 */}
          <div>
            <Label>计算模式</Label>
            <Select
              value={calcMode}
              onValueChange={(v) => handleValueChange('calcMode', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择计算模式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="linear">线性 (linear)</SelectItem>
                <SelectItem value="discrete">离散 (discrete)</SelectItem>
                <SelectItem value="paced">均速 (paced)</SelectItem>
                <SelectItem value="spline">样条曲线 (spline)</SelectItem>
              </SelectContent>
            </Select>
              </div>
            </div>
          )}

      {/* fromTo模式 */}
      {animationMode === 'fromTo' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>初始值 (from)</Label>
            <Input
              placeholder="输入起始值"
              value={fromValue}
              onChange={(e) => handleValueChange('from', e.target.value)}
            />
          </div>
            <div>
            <Label>结束值 (to)</Label>
              <Input
              placeholder="输入结束值"
              value={toValue}
              onChange={(e) => handleValueChange('to', e.target.value)}
            />
          </div>
            </div>
          )}

      {/* fromBy模式 */}
      {animationMode === 'fromBy' && (
        <div className="grid grid-cols-2 gap-4">
            <div>
            <Label>初始值 (from)</Label>
              <Input
              placeholder="输入起始值"
              value={fromValue}
              onChange={(e) => handleValueChange('from', e.target.value)}
            />
              </div>
          <div>
            <Label>相对变化值 (by)</Label>
            <Input
              placeholder="输入相对变化值"
              value={byValue}
              onChange={(e) => handleValueChange('by', e.target.value)}
            />
          </div>
          </div>
      )}

      {/* to模式 */}
      {animationMode === 'to' && (
          <div>
          <Label>目标值 (to)</Label>
            <Input
            placeholder="输入目标值"
            value={toValue}
            onChange={(e) => handleValueChange('to', e.target.value)}
            />
          </div>
      )}

      {/* by模式 */}
      {animationMode === 'by' && (
          <div>
          <Label>相对变化值 (by)</Label>
            <Input
            placeholder="输入相对变化值"
            value={byValue}
            onChange={(e) => handleValueChange('by', e.target.value)}
            />
          </div>
      )}

      {/* 帮助提示 - 根据不同模式显示不同的提示 */}
      <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
        <h4 className="text-sm font-medium mb-1">提示</h4>
        <ul className="list-disc pl-4 space-y-1 text-xs">
          {animationMode === "values" ? (
            <>
              <li>values: 分号分隔的多个值，组成关键帧</li>
              <li>示例: "0;0.5;1" 或 "red;green;blue"</li>
              {calcMode === "spline" && (
                <>
                  <li>keyTimes: 对应每个关键帧的时间点(0-1)</li>
                  <li>keySplines: 控制关键帧间的贝塞尔曲线</li>
                </>
              )}
            </>
          ) : animationMode === "fromTo" ? (
            <>
              <li>from: 起始值</li>
              <li>to: 结束值</li>
            </>
          ) : animationMode === "fromBy" ? (
            <>
              <li>from: 起始值</li>
              <li>by: 相对变化值（最终值为from+by）</li>
            </>
          ) : animationMode === "to" ? (
            <li>to: 动画结束值（从当前值开始）</li>
          ) : (
            <li>by: 相对变化值（从当前值增加by的量）</li>
          )}
        </ul>
      </div>
    </div>
  );
} 