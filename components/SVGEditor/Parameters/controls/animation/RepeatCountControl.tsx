"use client"

import { useState, useEffect, useRef, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

interface RepeatCountControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function RepeatCountControl({ label, value, onChange }: RepeatCountControlProps) {
  const [mode, setMode] = useState<"count" | "indefinite">(value === "indefinite" ? "indefinite" : "count");
  const [countValue, setCountValue] = useState<number>(1);

  // 防止循环更新
  const isUpdatingRef = useRef(false);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 初始化值
  useEffect(() => {
    if (isUpdatingRef.current) return;

    if (value === "indefinite") {
      setMode("indefinite");
    } else {
      setMode("count");
      const num = parseFloat(value);
      setCountValue(isNaN(num) ? 1 : num);
    }
  }, [value]);

  // 更新函数 - 添加防抖
  const updateValue = useCallback((newValue: string) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      if (newValue !== value) {
        onChange(newValue);
      }
      updateTimeoutRef.current = null;
    }, 100);
  }, [onChange, value]);

  // 处理模式变更
  const handleModeChange = useCallback((newMode: string) => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;

    try {
      if (newMode === "indefinite") {
        setMode("indefinite");
        updateValue("indefinite");
      } else {
        setMode("count");
        updateValue(countValue.toString());
      }
    } finally {
      isUpdatingRef.current = false;
    }
  }, [countValue, updateValue]);

  // 处理次数变更
  const handleCountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (isUpdatingRef.current) return;

    const val = e.target.value;
    // 允许输入小数
    if (/^[0-9]*\.?[0-9]*$/.test(val) || val === "") {
      if (val === "") {
        setCountValue(1);
        updateValue("1");
      } else {
        const num = parseFloat(val);
        if (num > 0) {
          setCountValue(num);
          updateValue(val);
        }
      }
    }
  }, [updateValue]);

  // 处理滑块变更
  const handleSliderChange = useCallback((value: number[]) => {
    if (isUpdatingRef.current) return;

    const newValue = value[0];
    setCountValue(newValue);
    updateValue(newValue.toString());
  }, [updateValue]);

  return (
    <div className="space-y-2">
      <Tabs value={mode} onValueChange={handleModeChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="count">指定次数</TabsTrigger>
          <TabsTrigger value="indefinite">无限循环</TabsTrigger>
        </TabsList>

        <TabsContent value="count" className="space-y-4 mt-2 min-h-[120px]">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={countValue.toString()}
                onChange={handleCountChange}
                className="w-20 h-10"
              />
              <span className="text-sm">次</span>
            </div>

            <div className="px-1">
              <Slider
                value={[countValue]}
                min={1}
                max={10}
                step={1}
                onValueChange={handleSliderChange}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>说明:</p>
              <ul className="list-disc list-inside">
                <li>支持小数，如 1.5 表示播放 1.5 次</li>
                <li>必须大于 0</li>
              </ul>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="indefinite" className="mt-2 min-h-[120px]">
          <div className="p-4 border rounded-md bg-muted/20">
            <p className="text-sm">动画将无限循环播放</p>
            <p className="text-xs text-muted-foreground mt-2">注意：无限循环可能会影响性能，请谨慎使用</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 