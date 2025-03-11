"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
import { Switch } from "@/components/ui/switch";
import { BaseComponent } from "@/types/core";
import { debounce } from "lodash";

interface AnimationValuesEditorProps {
  component: BaseComponent;
  onUpdateProperty: (path: string, value: any) => void;
}

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

export function AnimationValuesEditor({
  component,
  onUpdateProperty
}: AnimationValuesEditorProps) {
  // 从组件获取初始属性值
  const values = component.attributes?.values || "";
  const keyTimes = component.attributes?.keyTimes || "";
  const keySplines = component.attributes?.keySplines || "";
  const calcMode = component.attributes?.calcMode || "linear";
  const from = component.attributes?.from || "";
  const to = component.attributes?.to || "";
  const attributeName = component.attributes?.attributeName || "opacity";
  const by = component.attributes?.by || "";

  // 状态
  const [keyframes, setKeyframes] = useState<Keyframe[]>([]);
  const [splines, setSplines] = useState<Spline[]>([]);
  const [mode, setMode] = useState<"basic" | "advanced">("basic");
  const [animationMode, setAnimationMode] = useState<"values" | "fromTo" | "fromBy" | "to" | "by">(
    component.animationMode ||
    (values ? "values" :
      (from && to) ? "fromTo" :
        (from && by) ? "fromBy" :
          (!from && to) ? "to" :
            (!from && !to && by) ? "by" : "fromTo")
  );
  const [useKeyTimes, setUseKeyTimes] = useState(!!keyTimes);
  const [useKeySplines, setUseKeySplines] = useState(calcMode === "spline" && !!keySplines);
  const [useCalcMode, setUseCalcMode] = useState(!!calcMode);
  const [openSplinesIndex, setOpenSplinesIndex] = useState<number | null>(null);

  // 防止循环更新
  const isUpdating = useRef(false);

  // 添加防抖更新函数
  const debouncedUpdateProperty = useMemo(
    () => debounce((path: string, value: any) => {
      if (!isUpdating.current) {
        onUpdateProperty(path, value);
      }
    }, 200),
    [onUpdateProperty]
  );

  // 确保组件卸载时取消未执行的防抖函数
  useEffect(() => {
    return () => {
      debouncedUpdateProperty.cancel();
    };
  }, [debouncedUpdateProperty]);

  // 初始化动画模式 - 只在组件挂载时执行一次
  useEffect(() => {
    if (!component.animationMode && !isUpdating.current) {
      isUpdating.current = true;

      // 推断动画模式
      const inferredMode = values ? "values" :
        (from && to) ? "fromTo" :
          (from && by) ? "fromBy" :
            (!from && to) ? "to" :
              (!from && !to && by) ? "by" : "fromTo";

      // 设置本地状态
      setAnimationMode(inferredMode);

      // 将推断出的模式保存到组件
      onUpdateProperty('animationMode', inferredMode);

      // 结束更新标记
      isUpdating.current = false;
    }
  }, [component.animationMode, values, from, to, by, onUpdateProperty]);

  // 初始化关键帧 - 使用 useCallback 避免重复创建函数
  const initializeKeyframes = useCallback(() => {
    // 避免在更新过程中触发
    if (isUpdating.current) return;

    // 设置更新标记
    isUpdating.current = true;

    try {
      // 处理values模式
      if (animationMode === "values" && values) {
        const valuesList = values.split(';').map((v: string) => v.trim());
        const timesList = keyTimes ? keyTimes.split(';').map((t: string) => t.trim()) :
          valuesList.map((_: string, i: number) => (i / (valuesList.length - 1)).toString());

        const newKeyframes: Keyframe[] = valuesList.map((value: string, i: number) => ({
          value,
          time: i < timesList.length ? timesList[i] : (i / (valuesList.length - 1)).toString()
        }));

        setKeyframes(newKeyframes);

        // 处理splines
        if (calcMode === "spline") {
          if (keySplines) {
            const splinesList = keySplines.split(';').map((s: string) => s.trim());
            const newSplines: Spline[] = splinesList.map((spline: string) => {
              const [x1, y1, x2, y2] = spline.split(' ').map((v: string) => v.trim());
              return { x1, y1, x2, y2 };
            });

            // 确保数量匹配
            while (newSplines.length < newKeyframes.length - 1) {
              newSplines.push({ x1: "0.42", y1: "0", x2: "0.58", y2: "1" });
            }

            setSplines(newSplines);
          } else {
            // 创建默认样条
            setSplines(Array(Math.max(0, newKeyframes.length - 1))
              .fill(null)
              .map(() => ({ x1: "0.42", y1: "0", x2: "0.58", y2: "1" })));
          }
        }
      }
      // 处理from-to模式
      else if (animationMode === "fromTo") {
        setKeyframes([
          { value: from || "0", time: "0" },
          { value: to || "1", time: "1" }
        ]);
        setSplines([{ x1: "0.42", y1: "0", x2: "0.58", y2: "1" }]);
      }
      // 处理from-by模式
      else if (animationMode === "fromBy") {
        setKeyframes([
          { value: from || "0", time: "0" },
          { value: by || "1", time: "1" }
        ]);
        setSplines([{ x1: "0.42", y1: "0", x2: "0.58", y2: "1" }]);
      }
      // 处理to-only模式
      else if (animationMode === "to") {
        setKeyframes([
          { value: "0", time: "0" }, // 默认起始值
          { value: to || "1", time: "1" }
        ]);
        setSplines([{ x1: "0.42", y1: "0", x2: "0.58", y2: "1" }]);
      }
      // 处理by-only模式
      else if (animationMode === "by") {
        setKeyframes([
          { value: "0", time: "0" }, // 默认起始值
          { value: by || "1", time: "1" }
        ]);
        setSplines([{ x1: "0.42", y1: "0", x2: "0.58", y2: "1" }]);
      }
      // 默认情况
      else {
        setKeyframes([
          { value: "0", time: "0" },
          { value: "1", time: "1" }
        ]);
        setSplines([{ x1: "0.42", y1: "0", x2: "0.58", y2: "1" }]);
      }
    } finally {
      // 确保总是清除更新标记
      isUpdating.current = false;
    }
  }, [animationMode, values, keyTimes, keySplines, calcMode, from, to, by]);

  // 组件挂载和关键参数变化时初始化关键帧
  useEffect(() => {
    if (!isUpdating.current) {
      initializeKeyframes();
    }
  }, [initializeKeyframes]);

  // 更新组件属性，带防抖处理
  const updateComponentProperties = useCallback(() => {
    // 避免在更新过程中触发
    if (isUpdating.current) return;

    try {
      isUpdating.current = true;

      if (animationMode === "values") {
        // 只更新values相关属性
        const newValues = keyframes.map(kf => kf.value).join(';');
        debouncedUpdateProperty('attributes.values', newValues);

        // 更新keyTimes
        if (useKeyTimes) {
          const newKeyTimes = keyframes.map(kf => kf.time).join(';');
          debouncedUpdateProperty('attributes.keyTimes', newKeyTimes);
        } else {
          debouncedUpdateProperty('attributes.keyTimes', '');
        }

        // 更新keySplines
        if (useKeySplines && calcMode === "spline") {
          const newKeySplines = splines.map(s => `${s.x1} ${s.y1} ${s.x2} ${s.y2}`).join(';');
          debouncedUpdateProperty('attributes.keySplines', newKeySplines);
        } else {
          debouncedUpdateProperty('attributes.keySplines', '');
        }
      }
      else if (animationMode === "fromTo") {
        debouncedUpdateProperty('attributes.from', keyframes[0]?.value || "0");
        debouncedUpdateProperty('attributes.to', keyframes[1]?.value || "1");
      }
      else if (animationMode === "fromBy") {
        debouncedUpdateProperty('attributes.from', keyframes[0]?.value || "0");
        debouncedUpdateProperty('attributes.by', keyframes[1]?.value || "1");
      }
      else if (animationMode === "to") {
        debouncedUpdateProperty('attributes.to', keyframes[1]?.value || "1");
      }
      else if (animationMode === "by") {
        debouncedUpdateProperty('attributes.by', keyframes[1]?.value || "1");
      }
    } finally {
      isUpdating.current = false;
    }
  }, [animationMode, keyframes, splines, useKeyTimes, useKeySplines, calcMode, debouncedUpdateProperty]);

  // 替换切换动画模式函数
  const toggleAnimationMode = useCallback((newMode: string) => {
    if (newMode === animationMode || isUpdating.current) return;

    // 设置更新标志，防止中间状态渲染
    isUpdating.current = true;

    try {
      // 准备需要更新的所有状态变量
      const updates: Record<string, any> = {};

      // 根据新模式准备属性更新
      switch (newMode) {
        case "values":
          // 如果已有 values，保留它
          const existingValues = component.attributes?.values;
          if (!existingValues) {
            // 生成默认值
            const fromValue = component.attributes?.from || "0";
            const toValue = component.attributes?.to || "1";
            updates['attributes.values'] = `${fromValue};${toValue}`;
          }
          break;

        case "fromTo":
          // 确保 from 和 to 存在
          if (!component.attributes?.from) {
            updates['attributes.from'] = "0";
          }
          if (!component.attributes?.to) {
            updates['attributes.to'] = "1";
          }
          // 清除不需要的属性
          updates['attributes.by'] = "";
          updates['attributes.values'] = "";
          updates['attributes.keyTimes'] = "";
          updates['attributes.keySplines'] = "";
          break;

        case "fromBy":
          if (!component.attributes?.from) {
            updates['attributes.from'] = "0";
          }
          if (!component.attributes?.by) {
            updates['attributes.by'] = "1";
          }
          // 清除不需要的属性
          updates['attributes.to'] = "";
          updates['attributes.values'] = "";
          updates['attributes.keyTimes'] = "";
          updates['attributes.keySplines'] = "";
          break;

        case "to":
          if (!component.attributes?.to) {
            updates['attributes.to'] = "1";
          }
          // 清除不需要的属性
          updates['attributes.from'] = "";
          updates['attributes.by'] = "";
          updates['attributes.values'] = "";
          updates['attributes.keyTimes'] = "";
          updates['attributes.keySplines'] = "";
          break;

        case "by":
          if (!component.attributes?.by) {
            updates['attributes.by'] = "1";
          }
          // 清除不需要的属性
          updates['attributes.from'] = "";
          updates['attributes.to'] = "";
          updates['attributes.values'] = "";
          updates['attributes.keyTimes'] = "";
          updates['attributes.keySplines'] = "";
          break;
      }

      // 首先设置动画模式
      setAnimationMode(newMode as any);
      onUpdateProperty('animationMode', newMode);

      // 批量应用所有属性更新（使用setTimeout确保先完成模式切换）
      setTimeout(() => {
        // 应用所有准备好的更新
        Object.entries(updates).forEach(([path, value]) => {
          onUpdateProperty(path, value);
        });

        // 在属性更新后再初始化关键帧
        requestAnimationFrame(() => {
          initializeKeyframes();
          isUpdating.current = false;
        });
      }, 10);
    } catch (error) {
      console.error('Error when switching animation mode:', error);
      isUpdating.current = false;
    }
  }, [animationMode, component.attributes, onUpdateProperty, initializeKeyframes]);

  // 更新关键帧值
  const handleKeyframeValueChange = useCallback((index: number, value: string) => {
    if (isUpdating.current) return;

    setKeyframes(prev => {
      const newKeyframes = [...prev];
      newKeyframes[index] = { ...newKeyframes[index], value };
      return newKeyframes;
    });

    debouncedUpdateProperty.cancel(); // 取消之前未执行的更新
    updateComponentProperties();
  }, [updateComponentProperties, debouncedUpdateProperty]);

  // 更新关键帧时间
  const handleKeyframeTimeChange = useCallback((index: number, time: string) => {
    if (isUpdating.current) return;

    const newKeyframes = [...keyframes];
    newKeyframes[index].time = time;
    setKeyframes(newKeyframes);
    updateComponentProperties();
  }, [keyframes, updateComponentProperties]);

  // 处理插值方式变化
  const handleCalcModeChange = useCallback((mode: string) => {
    if (isUpdating.current) return;

    onUpdateProperty('attributes.calcMode', mode);

    // 如果切换到spline模式，自动启用keySplines
    if (mode === "spline" && !useKeySplines) {
      setUseKeySplines(true);
    }
    // 如果从spline切换到其他模式，禁用keySplines
    else if (mode !== "spline" && useKeySplines) {
      setUseKeySplines(false);
      onUpdateProperty('attributes.keySplines', '');
    }
  }, [useKeySplines, onUpdateProperty]);

  // 添加新关键帧
  const handleAddKeyframe = () => {
    if (animationMode !== "values") return;

    const newKeyframes = [...keyframes];

    if (newKeyframes.length < 2) {
      // 如果当前没有足够的关键帧，添加默认的开始和结束帧
      newKeyframes.push({ value: "0", time: "0" });
      newKeyframes.push({ value: "100", time: "1" });
    } else {
      // 在倒数第二个和最后一个关键帧之间添加新帧
      const lastIndex = newKeyframes.length - 1;
      const secondLastIndex = lastIndex - 1;

      // 计算新帧的值和时间
      const newValue = interpolateValue(
        newKeyframes[secondLastIndex].value,
        newKeyframes[lastIndex].value
      );

      let newTime = "0.5";
      if (useKeyTimes) {
        // 计算前后两帧时间的中点
        const prevTime = parseFloat(newKeyframes[secondLastIndex].time);
        const nextTime = parseFloat(newKeyframes[lastIndex].time);
        if (!isNaN(prevTime) && !isNaN(nextTime)) {
          newTime = ((prevTime + nextTime) / 2).toString();
        }
      }

      // 插入新帧
      newKeyframes.splice(lastIndex, 0, { value: newValue, time: newTime });

      // 对于spline模式，也需要添加对应的控制点
      if (calcMode === "spline" && useKeySplines) {
        const newSplines = [...splines];
        // 复制前一个区间的控制点
        newSplines.splice(secondLastIndex, 0, { ...newSplines[secondLastIndex - 1] });
        setSplines(newSplines);
      }
    }

    setKeyframes(newKeyframes);
    setTimeout(updateComponentProperties, 0);
  };

  // 移除关键帧
  const handleRemoveKeyframe = (index: number) => {
    if (animationMode !== "values") return;
    if (keyframes.length <= 2) return; // 至少保留两个关键帧
    if (index === 0 || index === keyframes.length - 1) return; // 不能删除首尾帧

    const newKeyframes = [...keyframes];
    newKeyframes.splice(index, 1);

    // 移除对应的样条曲线控制点
    if (calcMode === "spline" && useKeySplines) {
      const newSplines = [...splines];
      // 如果删除中间帧，则删除前一个区间的控制点
      newSplines.splice(index - 1, 1);
      setSplines(newSplines);
    }

    setKeyframes(newKeyframes);
    setTimeout(updateComponentProperties, 0);
  };

  // 插值计算两帧之间的中间值
  const interpolateValue = (value1: string, value2: string): string => {
    // 尝试数值插值
    const num1 = parseFloat(value1);
    const num2 = parseFloat(value2);

    if (!isNaN(num1) && !isNaN(num2)) {
      return ((num1 + num2) / 2).toString();
    }

    // 非数值，直接返回第一个值
    return value1;
  };

  // 应用预设曲线到特定区间
  const applyPresetCurve = (index: number, preset: string) => {
    const newSplines = [...splines];

    switch (preset) {
      case 'ease':
        newSplines[index] = { x1: "0.25", y1: "0.1", x2: "0.25", y2: "1" };
        break;
      case 'ease-in':
        newSplines[index] = { x1: "0.42", y1: "0", x2: "1", y2: "1" };
        break;
      case 'ease-out':
        newSplines[index] = { x1: "0", y1: "0", x2: "0.58", y2: "1" };
        break;
      case 'ease-in-out':
        newSplines[index] = { x1: "0.42", y1: "0", x2: "0.58", y2: "1" };
        break;
    }

    setSplines(newSplines);
    setTimeout(updateComponentProperties, 0);
  };

  // 应用预设曲线到所有区间
  const applyPresetCurveToAll = (preset: string) => {
    const newSplines = [...splines];

    for (let i = 0; i < newSplines.length; i++) {
      switch (preset) {
        case 'ease':
          newSplines[i] = { x1: "0.25", y1: "0.1", x2: "0.25", y2: "1" };
          break;
        case 'ease-in':
          newSplines[i] = { x1: "0.42", y1: "0", x2: "1", y2: "1" };
          break;
        case 'ease-out':
          newSplines[i] = { x1: "0", y1: "0", x2: "0.58", y2: "1" };
          break;
        case 'ease-in-out':
          newSplines[i] = { x1: "0.42", y1: "0", x2: "0.58", y2: "1" };
          break;
      }
    }

    setSplines(newSplines);
    setTimeout(updateComponentProperties, 0);
  };

  // 更新spline参数
  const updateSplineParam = (index: number, param: keyof Spline, value: string) => {
    const newSplines = [...splines];
    if (!newSplines[index]) {
      newSplines[index] = { x1: "0.42", y1: "0", x2: "0.58", y2: "1" };
    }
    newSplines[index][param] = value;
    setSplines(newSplines);
    setTimeout(updateComponentProperties, 0);
  };

  // 渲染关键帧编辑器
  const renderKeyframesEditor = () => {
    // values模式显示多关键帧编辑器
    if (animationMode === "values") {
      return (
        <div className="space-y-4 min-h-[250px]">
          {/* Values模式的关键帧编辑UI */}
          {keyframes.map((keyframe, index) => (
            <div key={index} className="border rounded-md p-3 space-y-3">
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium">
                  {index === 0 ? '起始关键帧' :
                    index === keyframes.length - 1 ? '结束关键帧' :
                      `关键帧 ${index}`}
                </div>
                {keyframes.length > 2 && index !== 0 && index !== keyframes.length - 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveKeyframe(index)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">值</Label>
                  <Input
                    value={keyframe.value}
                    onChange={(e) => handleKeyframeValueChange(index, e.target.value)}
                    placeholder={`${attributeName}的值`}
                  />
                </div>
                {useKeyTimes && (
                  <div className="space-y-1">
                    <Label className="text-xs">时间点 (0-1)</Label>
                    <Input
                      value={keyframe.time}
                      onChange={(e) => handleKeyframeTimeChange(index, e.target.value)}
                      placeholder="0-1之间的值"
                      disabled={index === 0 || index === keyframes.length - 1}
                    />
                  </div>
                )}
              </div>

              {calcMode === "spline" && useKeySplines && index < keyframes.length - 1 && (
                <Collapsible
                  open={openSplinesIndex === index}
                  onOpenChange={(open) => setOpenSplinesIndex(open ? index : null)}
                >
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center gap-2 mt-2 cursor-pointer text-xs text-blue-600 hover:text-blue-800">
                      {openSplinesIndex === index ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      <span>贝塞尔曲线控制 ({index} → {index + 1})</span>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="mt-2 pt-2 border-t space-y-3">
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <Label className="text-xs">x1</Label>
                          <Input
                            type="text"
                            className="h-8"
                            value={splines[index]?.x1 || "0.42"}
                            onChange={(e) => updateSplineParam(index, 'x1', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">y1</Label>
                          <Input
                            type="text"
                            className="h-8"
                            value={splines[index]?.y1 || "0"}
                            onChange={(e) => updateSplineParam(index, 'y1', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">x2</Label>
                          <Input
                            type="text"
                            className="h-8"
                            value={splines[index]?.x2 || "0.58"}
                            onChange={(e) => updateSplineParam(index, 'x2', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">y2</Label>
                          <Input
                            type="text"
                            className="h-8"
                            value={splines[index]?.y2 || "1"}
                            onChange={(e) => updateSplineParam(index, 'y2', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <KeyframesSplinePreview
                          x1={splines[index]?.x1 || "0.42"}
                          y1={splines[index]?.y1 || "0"}
                          x2={splines[index]?.x2 || "0.58"}
                          y2={splines[index]?.y2 || "1"}
                          width={180}
                          height={100}
                        />
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <button
                          type="button"
                          className="px-2 py-1 bg-slate-100 rounded text-xs hover:bg-slate-200"
                          onClick={() => applyPresetCurve(index, 'ease')}
                        >
                          ease
                        </button>
                        <button
                          type="button"
                          className="px-2 py-1 bg-slate-100 rounded text-xs hover:bg-slate-200"
                          onClick={() => applyPresetCurve(index, 'ease-in')}
                        >
                          ease-in
                        </button>
                        <button
                          type="button"
                          className="px-2 py-1 bg-slate-100 rounded text-xs hover:bg-slate-200"
                          onClick={() => applyPresetCurve(index, 'ease-out')}
                        >
                          ease-out
                        </button>
                        <button
                          type="button"
                          className="px-2 py-1 bg-slate-100 rounded text-xs hover:bg-slate-200"
                          onClick={() => applyPresetCurve(index, 'ease-in-out')}
                        >
                          ease-in-out
                        </button>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          ))}

          <Button
            size="sm"
            variant="outline"
            onClick={handleAddKeyframe}
            className="w-full mt-2"
          >
            <Plus className="h-4 w-4 mr-1" /> 添加关键帧
          </Button>
        </div>
      );
    }
    // fromTo、fromBy、to、by模式只显示简单的值编辑器
    else {
      return (
        <div className="border rounded p-4 space-y-4">
          {(animationMode === "fromTo" || animationMode === "fromBy") && (
            <div className="space-y-2">
              <Label>起始值 (From)</Label>
              <Input
                value={keyframes[0]?.value || "0"}
                onChange={(e) => {
                  const newKeyframes = [...keyframes];
                  if (newKeyframes.length >= 1) {
                    newKeyframes[0].value = e.target.value;
                    setKeyframes(newKeyframes);
                    setTimeout(updateComponentProperties, 0);
                  }
                }}
                placeholder="起始值"
              />
            </div>
          )}

          {animationMode === "fromTo" && (
            <div className="space-y-2">
              <Label>终点值 (To)</Label>
              <Input
                value={keyframes[1]?.value || "1"}
                onChange={(e) => {
                  const newKeyframes = [...keyframes];
                  if (newKeyframes.length >= 2) {
                    newKeyframes[1].value = e.target.value;
                    setKeyframes(newKeyframes);
                    setTimeout(updateComponentProperties, 0);
                  }
                }}
                placeholder="终点值"
              />
            </div>
          )}

          {animationMode === "fromBy" && (
            <div className="space-y-2">
              <Label>相对变化值 (By)</Label>
              <Input
                value={keyframes[1]?.value || "1"}
                onChange={(e) => {
                  const newKeyframes = [...keyframes];
                  if (newKeyframes.length >= 2) {
                    newKeyframes[1].value = e.target.value;
                    setKeyframes(newKeyframes);
                    setTimeout(updateComponentProperties, 0);
                  }
                }}
                placeholder="相对变化值"
              />
            </div>
          )}

          {animationMode === "to" && (
            <div className="space-y-2">
              <Label>终点值 (To)</Label>
              <Input
                value={keyframes[1]?.value || "1"}
                onChange={(e) => {
                  const newKeyframes = [...keyframes];
                  if (newKeyframes.length >= 2) {
                    newKeyframes[1].value = e.target.value;
                    setKeyframes(newKeyframes);
                    setTimeout(updateComponentProperties, 0);
                  }
                }}
                placeholder="终点值"
              />
              <div className="text-xs text-muted-foreground">
                To动画：元素从当前值过渡到指定的终点值
              </div>
            </div>
          )}

          {animationMode === "by" && (
            <div className="space-y-2">
              <Label>相对变化值 (By)</Label>
              <Input
                value={keyframes[1]?.value || "1"}
                onChange={(e) => {
                  const newKeyframes = [...keyframes];
                  if (newKeyframes.length >= 2) {
                    newKeyframes[1].value = e.target.value;
                    setKeyframes(newKeyframes);
                    setTimeout(updateComponentProperties, 0);
                  }
                }}
                placeholder="相对变化值"
              />
              <div className="text-xs text-muted-foreground">
                By动画：元素从当前值增加指定的相对值
              </div>
            </div>
          )}
        </div>
      );
    }
  };

  // 渲染代码编辑视图
  const renderAdvancedEditor = () => {
    if (animationMode === "values") {
      return (
        <div className="space-y-4 min-h-[200px]">
          <div>
            <Label>Values (分号分隔的值序列)</Label>
            <Input
              value={keyframes.map(k => k.value).join(';')}
              onChange={(e) => {
                const newValues = e.target.value;
                if (!newValues) {
                  setKeyframes([{ value: "0", time: "0" }, { value: "1", time: "1" }]);
                } else {
                  const valuesList = newValues.split(';').map(v => v.trim());
                  const newKeyframes = valuesList.map((value, i) => {
                    const time = i === 0 ? "0" :
                      i === valuesList.length - 1 ? "1" :
                        (i / (valuesList.length - 1)).toString();

                    return { value, time };
                  });
                  setKeyframes(newKeyframes);
                }
                setTimeout(updateComponentProperties, 0);
              }}
              placeholder="例如: 0;50;100"
              className="mt-1"
            />
          </div>

          {useKeyTimes && (
            <div>
              <Label>KeyTimes (分号分隔的时间序列, 0-1范围)</Label>
              <Input
                value={keyframes.map(k => k.time).join(';')}
                onChange={(e) => {
                  try {
                    const newKeyTimes = e.target.value;
                    const timesList = newKeyTimes.split(';').map(t => t.trim());

                    const newKeyframes = [...keyframes];
                    timesList.forEach((time, i) => {
                      if (i < newKeyframes.length) {
                        newKeyframes[i].time = time;
                      }
                    });

                    setKeyframes(newKeyframes);
                    setTimeout(updateComponentProperties, 0);
                  } catch (error) {
                    console.error('Invalid keyTimes format', error);
                  }
                }}
                placeholder="例如: 0;0.5;1"
                className="mt-1"
              />
            </div>
          )}

          {useKeySplines && calcMode === "spline" && (
            <div>
              <Label>KeySplines (贝塞尔曲线控制点)</Label>
              <Input
                value={splines.map(s => `${s.x1} ${s.y1} ${s.x2} ${s.y2}`).join(';')}
                onChange={(e) => {
                  const newKeySplines = e.target.value;
                  try {
                    const splinesList = newKeySplines.split(';').map(s => s.trim());
                    const newSplines: Spline[] = [];

                    for (const spline of splinesList) {
                      const parts = spline.split(/\s+/);
                      // 确保有足够的部分
                      if (parts.length >= 4) {
                        newSplines.push({
                          x1: parts[0],
                          y1: parts[1],
                          x2: parts[2],
                          y2: parts[3]
                        });
                      } else {
                        // 使用默认值补充缺失部分
                        newSplines.push({
                          x1: parts[0] || "0.42",
                          y1: parts[1] || "0",
                          x2: parts[2] || "0.58",
                          y2: parts[3] || "1"
                        });
                      }
                    }

                    // 确保数量匹配
                    while (newSplines.length < keyframes.length - 1) {
                      newSplines.push({ x1: "0.42", y1: "0", x2: "0.58", y2: "1" });
                    }

                    setSplines(newSplines);
                    setTimeout(updateComponentProperties, 0);
                  } catch (error) {
                    console.error('Invalid keySplines format', error);
                  }
                }}
                placeholder="例如: 0.42 0 0.58 1;0.42 0 0.58 1"
                className="mt-1"
              />
              <div className="text-xs text-muted-foreground mt-1">
                格式: x1 y1 x2 y2;x1 y1 x2 y2...
              </div>
            </div>
          )}
        </div>
      );
    } else if (animationMode === "fromTo") {
      return (
        <div className="space-y-4">
          <div>
            <Label>From</Label>
            <Input
              value={keyframes[0]?.value || ""}
              onChange={(e) => {
                handleKeyframeValueChange(0, e.target.value);
              }}
              placeholder="起始值"
              className="mt-1"
            />
          </div>
          <div>
            <Label>To</Label>
            <Input
              value={keyframes[1]?.value || ""}
              onChange={(e) => {
                handleKeyframeValueChange(1, e.target.value);
              }}
              placeholder="结束值"
              className="mt-1"
            />
          </div>
        </div>
      );
    } else if (animationMode === "fromBy") {
      return (
        <div className="space-y-4">
          <div>
            <Label>From</Label>
            <Input
              value={keyframes[0]?.value || ""}
              onChange={(e) => {
                handleKeyframeValueChange(0, e.target.value);
              }}
              placeholder="起始值"
              className="mt-1"
            />
          </div>
          <div>
            <Label>By</Label>
            <Input
              value={keyframes[1]?.value || ""}
              onChange={(e) => {
                handleKeyframeValueChange(1, e.target.value);
              }}
              placeholder="相对变化值"
              className="mt-1"
            />
          </div>
        </div>
      );
    } else if (animationMode === "to") {
      return (
        <div className="space-y-4">
          <div>
            <Label>To</Label>
            <Input
              value={keyframes[1]?.value || ""}
              onChange={(e) => {
                handleKeyframeValueChange(1, e.target.value);
              }}
              placeholder="结束值"
              className="mt-1"
            />
          </div>
        </div>
      );
    } else if (animationMode === "by") {
      return (
        <div className="space-y-4">
          <div>
            <Label>By</Label>
            <Input
              value={keyframes[1]?.value || ""}
              onChange={(e) => {
                handleKeyframeValueChange(1, e.target.value);
              }}
              placeholder="相对变化值"
              className="mt-1"
            />
          </div>
        </div>
      );
    }
  };

  return (
    <div className="border rounded-md p-4 space-y-4">
      <Label className="text-sm font-medium">动画值设置</Label>

      {/* 动画模式选择 */}
      <div className="flex items-center gap-2">
        <Label>动画值模式:</Label>
        <Select
          value={animationMode}
          onValueChange={toggleAnimationMode}
        >
          <SelectTrigger className="w-auto">
            <SelectValue placeholder="选择动画模式" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="values">Values序列(多值)</SelectItem>
            <SelectItem value="fromTo">From-To(起点到终点)</SelectItem>
            <SelectItem value="fromBy">From-By(起点+相对值)</SelectItem>
            <SelectItem value="to">To(仅终点)</SelectItem>
            <SelectItem value="by">By(仅相对值)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 插值方式选择 */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Switch
            checked={useCalcMode}
            onCheckedChange={(checked) => {
              setUseCalcMode(checked);
              if (!checked) {
                onUpdateProperty('attributes.calcMode', "");
              } else {
                onUpdateProperty('attributes.calcMode', "linear");
              }
            }}
            id="calcmode-switch"
          />
          <Label htmlFor="calcmode-switch">插值方式</Label>
        </div>

        {useCalcMode && (
          <Select
            value={calcMode}
            onValueChange={handleCalcModeChange}
          >
            <SelectTrigger className="w-auto">
              <SelectValue placeholder="选择插值方式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="discrete">discrete</SelectItem>
              <SelectItem value="linear">linear</SelectItem>
              <SelectItem value="paced">paced</SelectItem>
              <SelectItem value="spline">spline</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* 使用keyTimes开关 */}
      {animationMode === "values" && (
        <div className="flex items-center gap-1">
          <Switch
            checked={useKeyTimes}
            onCheckedChange={(checked) => {
              setUseKeyTimes(checked);
              if (!checked) {
                onUpdateProperty('attributes.keyTimes', "");
              } else {
                // 创建默认的keyTimes
                const defaultKeyTimes = keyframes
                  .map((_, i) => (i / (keyframes.length - 1)).toString())
                  .join(';');
                onUpdateProperty('attributes.keyTimes', defaultKeyTimes);
              }
            }}
            id="keytimes-switch"
          />
          <Label htmlFor="keytimes-switch">使用keyTimes (时间点控制)</Label>
        </div>
      )}

      {/* 使用keySplines开关 */}
      {animationMode === "values" && calcMode === "spline" && useCalcMode && (
        <div className="flex items-center gap-1">
          <Switch
            checked={useKeySplines}
            onCheckedChange={(checked) => {
              setUseKeySplines(checked);
              if (!checked) {
                onUpdateProperty('attributes.keySplines', "");
              } else {
                // 创建默认的keySplines
                const defaultKeySplines = Array(keyframes.length - 1)
                  .fill("0.42 0 0.58 1")
                  .join(';');
                onUpdateProperty('attributes.keySplines', defaultKeySplines);
              }
            }}
            id="keysplines-switch"
          />
          <Label htmlFor="keysplines-switch">使用keySplines (曲线控制)</Label>
        </div>
      )}

      <Tabs value={mode} onValueChange={(v) => setMode(v as "basic" | "advanced")} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">可视化编辑</TabsTrigger>
          <TabsTrigger value="advanced">代码编辑</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          {renderKeyframesEditor()}
        </TabsContent>

        <TabsContent value="advanced">
          {renderAdvancedEditor()}
        </TabsContent>
      </Tabs>

      <div className="text-xs text-muted-foreground mt-2">
        <p>动画值说明:</p>
        <ul className="list-disc list-inside">
          {animationMode === "values" ? (
            <>
              <li>values: 关键帧的属性值序列，用分号分隔</li>
              {useKeyTimes && (
                <li>keyTimes: 关键帧的时间点(0~1)，必须与values数量一致</li>
              )}
              {calcMode === "spline" && useKeySplines && useCalcMode && (
                <li>keySplines: 贝塞尔曲线控制点，控制速度变化</li>
              )}
            </>
          ) : animationMode === "fromTo" ? (
            <>
              <li>from: 动画起始值</li>
              <li>to: 动画结束值</li>
            </>
          ) : animationMode === "fromBy" ? (
            <>
              <li>from: 动画起始值</li>
              <li>by: 相对变化值（最终值为from+by）</li>
            </>
          ) : animationMode === "to" ? (
            <li>to: 动画结束值（从当前值开始）</li>
          ) : (
            <li>by: 相对变化值（从当前值开始增加）</li>
          )}
        </ul>
      </div>
    </div>
  );
} 