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
import { BaseComponent } from "@/types";
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
    return (component.animationMode as AnimationMode) || 'values';
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
    updateSplines,
    advancedMode,
    setAdvancedMode,
    showSplineEditor,
    setShowSplineEditor
  };
}

export function AnimationValuesEditor() {
  const { selectedComponent, updateComponent, updateComponentAttribute } = useEditor();

  // 如果没有选中组件，显示提示
  if (!selectedComponent) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        请选择一个组件以编辑动画属性
      </div>
    );
  }

  // 创建动画编辑状态
  const editorState = useAnimationEditorState(
    selectedComponent,
    (path, value) => {
      // 特殊处理animationMode
      if (path === 'animationMode') {
        updateComponent({
          ...selectedComponent,
          animationMode: value
        });
      } else {
        // 常规属性更新
        updateComponentAttribute(path, value);
      }
    }
  );

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-medium">动画模式</h3>

        <div className="flex flex-col gap-2">
          <Tabs
            value={editorState.animationMode}
            onValueChange={(val) => editorState.setAnimationMode(val as AnimationMode)}
            className="w-full"
          >
            <TabsList className="grid grid-cols-5 mb-2">
              <TabsTrigger value="values">values</TabsTrigger>
              <TabsTrigger value="fromTo">from-to</TabsTrigger>
              <TabsTrigger value="fromBy">from-by</TabsTrigger>
              <TabsTrigger value="to">to</TabsTrigger>
              <TabsTrigger value="by">by</TabsTrigger>
            </TabsList>

            <TabsContent value="values" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>关键帧数值</Label>
                  {editorState.advancedMode ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editorState.setAdvancedMode(false)}
                    >
                      简化模式
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editorState.setAdvancedMode(true)}
                    >
                      高级模式
                    </Button>
                  )}
                </div>

                {editorState.advancedMode ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>values</Label>
                      <Textarea
                        value={editorState.values}
                        onChange={(e) => editorState.handleValueChange('values', e.target.value)}
                        placeholder="输入values值，用分号分隔各值"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>keyTimes</Label>
                      <Textarea
                        value={editorState.keyTimes}
                        onChange={(e) => editorState.handleValueChange('keyTimes', e.target.value)}
                        placeholder="输入keyTimes值，用分号分隔各值"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>插值计算方式</Label>
                      <Select
                        value={editorState.calcMode}
                        onValueChange={(value) => editorState.handleValueChange('calcMode', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择计算方式" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="linear">线性插值(linear)</SelectItem>
                          <SelectItem value="discrete">离散值(discrete)</SelectItem>
                          <SelectItem value="paced">等速(paced)</SelectItem>
                          <SelectItem value="spline">贝塞尔曲线(spline)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {editorState.calcMode === "spline" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>keySplines</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => editorState.setShowSplineEditor(!editorState.showSplineEditor)}
                          >
                            {editorState.showSplineEditor ? "隐藏可视化编辑" : "可视化编辑"}
                          </Button>
                        </div>
                        <Textarea
                          value={editorState.keySplines}
                          onChange={(e) => editorState.handleValueChange('keySplines', e.target.value)}
                          placeholder="贝塞尔曲线控制点，格式: x1 y1 x2 y2; x1 y1 x2 y2"
                        />

                        {editorState.showSplineEditor && (
                          <div className="mt-4 border rounded-md p-4">
                            <KeyframesSplinePreview
                              splines={editorState.splines}
                              onChange={(newSplines) => editorState.updateSplines(newSplines)}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>关键帧列表</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={editorState.addKeyframe}
                        >
                          <Plus className="h-4 w-4 mr-1" /> 添加关键帧
                        </Button>
                      </div>

                      <div className="space-y-2 mt-2">
                        {editorState.keyframes.map((keyframe, index) => (
                          <div key={index} className="flex items-center gap-2 w-full">
                            <div className="grid grid-cols-2 gap-2 flex-1">
                              <div>
                                <Label className="text-xs">值</Label>
                                <Input
                                  value={keyframe.value}
                                  onChange={(e) => editorState.updateKeyframe(index, 'value', e.target.value)}
                                  placeholder="值"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">时间</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="1"
                                  step="0.01"
                                  value={keyframe.time}
                                  onChange={(e) => editorState.updateKeyframe(index, 'time', e.target.value)}
                                  placeholder="时间 (0-1)"
                                />
                              </div>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => editorState.removeKeyframe(index)}
                              disabled={editorState.keyframes.length <= 2}
                              className="mt-4"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>插值计算方式</Label>
                      <Select
                        value={editorState.calcMode}
                        onValueChange={(value) => editorState.handleValueChange('calcMode', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择计算方式" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="linear">线性插值(linear)</SelectItem>
                          <SelectItem value="discrete">离散值(discrete)</SelectItem>
                          <SelectItem value="paced">等速(paced)</SelectItem>
                          <SelectItem value="spline">贝塞尔曲线(spline)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {editorState.calcMode === "spline" && (
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <Button variant="outline" className="flex w-full justify-between">
                            <span>贝塞尔曲线控制</span>
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="p-2">
                          <div className="space-y-4">
                            <KeyframesSplinePreview
                              splines={editorState.splines}
                              onChange={(newSplines) => editorState.updateSplines(newSplines)}
                            />

                            {editorState.splines.map((spline, index) => (
                              <div key={index} className="grid grid-cols-4 gap-2">
                                <div>
                                  <Label className="text-xs">x1</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={spline.x1}
                                    onChange={(e) => editorState.updateSpline(index, 'x1', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">y1</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={spline.y1}
                                    onChange={(e) => editorState.updateSpline(index, 'y1', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">x2</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={spline.x2}
                                    onChange={(e) => editorState.updateSpline(index, 'x2', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">y2</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={spline.y2}
                                    onChange={(e) => editorState.updateSpline(index, 'y2', e.target.value)}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="fromTo" className="space-y-4">
              <div className="space-y-2">
                <Label>From值</Label>
                <Input
                  value={editorState.fromValue}
                  onChange={(e) => editorState.handleValueChange('from', e.target.value)}
                  placeholder="起始值"
                />
              </div>
              <div className="space-y-2">
                <Label>To值</Label>
                <Input
                  value={editorState.toValue}
                  onChange={(e) => editorState.handleValueChange('to', e.target.value)}
                  placeholder="结束值"
                />
              </div>
            </TabsContent>

            <TabsContent value="fromBy" className="space-y-4">
              <div className="space-y-2">
                <Label>From值</Label>
                <Input
                  value={editorState.fromValue}
                  onChange={(e) => editorState.handleValueChange('from', e.target.value)}
                  placeholder="起始值"
                />
              </div>
              <div className="space-y-2">
                <Label>By值 (增量)</Label>
                <Input
                  value={editorState.byValue}
                  onChange={(e) => editorState.handleValueChange('by', e.target.value)}
                  placeholder="增量值"
                />
              </div>
            </TabsContent>

            <TabsContent value="to" className="space-y-4">
              <div className="space-y-2">
                <Label>To值</Label>
                <Input
                  value={editorState.toValue}
                  onChange={(e) => editorState.handleValueChange('to', e.target.value)}
                  placeholder="结束值"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                从当前值动画到指定值
              </div>
            </TabsContent>

            <TabsContent value="by" className="space-y-4">
              <div className="space-y-2">
                <Label>By值 (增量)</Label>
                <Input
                  value={editorState.byValue}
                  onChange={(e) => editorState.handleValueChange('by', e.target.value)}
                  placeholder="增量值"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                从当前值增加指定的增量
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 