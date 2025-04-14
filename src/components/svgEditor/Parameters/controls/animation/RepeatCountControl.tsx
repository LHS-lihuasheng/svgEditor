"use client"

import { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { RepeatCountPropertyConfig, ControlProps } from "@/types";

export function RepeatCountControl({
  propertyConfig,
  value = 1,
  onChange
}: ControlProps) {
  // 从propertyConfig中提取配置
  const {
    label = "重复次数",
    description = "设置动画重复播放的次数，或选择无限循环",
    showLabel = true,
    options = [
      { label: "固定次数", value: "finite" },
      { label: "无限循环", value: "indefinite" }
    ]
  } = propertyConfig as RepeatCountPropertyConfig;

  // 是否是无限循环
  const [isInfinite, setIsInfinite] = useState(value === "indefinite");
  // 数值
  const [numValue, setNumValue] = useState<string>(
    isInfinite ? "1" : String(value)
  );

  // 处理外部值变化
  useEffect(() => {
    if (value === "indefinite") {
      setIsInfinite(true);
    } else {
      setIsInfinite(false);
      setNumValue(String(value));
    }
  }, [value]);

  // 处理无限开关变化
  const handleInfiniteChange = (checked: boolean) => {
    setIsInfinite(checked);
    if (checked) {
      onChange("indefinite");
    } else {
      const num = parseFloat(numValue);
      onChange(isNaN(num) ? 1 : Math.max(1, num));
    }
  };

  // 处理数值变化
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setNumValue(newValue);

    if (!isInfinite) {
      const num = parseFloat(newValue);
      if (!isNaN(num) && num > 0) {
        onChange(num);
      }
    }
  };

  // 确保值有效
  const handleBlur = () => {
    if (!isInfinite) {
      const num = parseFloat(numValue);
      if (isNaN(num) || num < 1) {
        setNumValue("1");
        onChange(1);
      }
    }
  };

  return (
    <div className="space-y-2 w-full">
      {showLabel && label && (
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">{label}</Label>

          {description && (
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-72">
                  <p>{description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}

      <div className="flex items-center justify-between space-x-2">
        <div className="flex-1">
          <Input
            type="number"
            min="1"
            step="1"
            value={numValue}
            onChange={handleValueChange}
            onBlur={handleBlur}
            disabled={isInfinite}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="infinite-mode" className="text-sm">无限循环</Label>
          <Switch
            id="infinite-mode"
            checked={isInfinite}
            onCheckedChange={handleInfiniteChange}
          />
        </div>
      </div>
    </div>
  );
} 