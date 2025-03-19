"use client"

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

interface RepeatCountControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function RepeatCountControl({ label, value, onChange }: RepeatCountControlProps) {
  const [mode, setMode] = useState<"count" | "indefinite">("count");
  const [countValue, setCountValue] = useState<number>(1);

  // 初始化
  useEffect(() => {
    if (value === "indefinite") {
      setMode("indefinite");
    } else {
      setMode("count");
      const num = parseFloat(value);
      setCountValue(isNaN(num) ? 1 : num);
    }
  }, [value]);

  // 更新值
  const updateValue = useCallback((newValue: string) => {
    if (newValue !== value) {
      onChange(newValue);
    }
  }, [onChange, value]);

  // 模式变更
  const handleModeChange = (newMode: string) => {
    if (newMode === "indefinite") {
      setMode("indefinite");
      updateValue("indefinite");
    } else {
      setMode("count");
      updateValue(countValue.toString());
    }
  };

  return (
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
              onChange={e => {
                const val = e.target.value;
                if (/^[0-9]*\.?[0-9]*$/.test(val)) {
                  const num = parseFloat(val || "1");
                  if (num > 0) {
                    setCountValue(num);
                    updateValue(val || "1");
                  }
                }
              }}
              className="w-20 h-10"
            />
            <span className="text-sm">次</span>
          </div>

          <div className="px-1">
            <Slider
              value={[countValue > 10 ? 10 : countValue]}
              min={1}
              max={10}
              step={1}
              onValueChange={val => {
                setCountValue(val[0]);
                updateValue(val[0].toString());
              }}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>1</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>支持小数，如 1.5 表示播放 1.5 次</p>
            <p>必须大于 0</p>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="indefinite" className="mt-2 min-h-[120px]">
        <div className="p-4 border rounded-md bg-muted/20">
          <p className="text-sm">动画将无限循环播放</p>
          <p className="text-xs text-muted-foreground mt-2">注意：无限循环可能会影响性能</p>
        </div>
      </TabsContent>
    </Tabs>
  );
} 