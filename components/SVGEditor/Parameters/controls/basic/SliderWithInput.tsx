"use client"

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { propertyConfig } from "@/types";

// 统一控件接口
interface ControlProps {
  propertyConfig: propertyConfig;
  value: any;
  onChange: (value: any) => void;
}

export function SliderWithInput({
  propertyConfig,
  value,
  onChange
}: ControlProps) {
  // 从propertyConfig中提取所需配置
  const {
    label,
    min = 0,
    max = 100,
    step = 1,
    inputWidth = "w-16",
    showLabel = true,
    defaultValue = 0,
    description
  } = propertyConfig;

  // 本地状态，处理滑块和输入框的同步
  const [localValue, setLocalValue] = useState<number>(value ?? defaultValue);

  // 当外部值变化时更新本地状态
  useEffect(() => {
    if (value !== undefined) {
      setLocalValue(value);
    } else if (defaultValue !== undefined) {
      setLocalValue(defaultValue);
      onChange(defaultValue);
    }
  }, [value, defaultValue, onChange]);

  // 处理滑块变化
  const handleChange = (val: number) => {
    const formattedValue = Math.max(min, Math.min(max, val));
    setLocalValue(formattedValue);
    onChange(formattedValue);
  };

  return (
    <div className="space-y-2">
      {showLabel && label && (
        <div className="flex items-center gap-2">
          <Label>{label}</Label>
          {description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}
      <div className="flex items-center gap-4">
        <div className="flex-grow">
          <Slider
            value={[localValue]}
            min={min}
            max={max}
            step={step}
            onValueChange={values => handleChange(values[0])}
          />
        </div>
        <div className={inputWidth}>
          <Input
            type="number"
            min={min}
            max={max}
            step={step}
            value={localValue}
            onChange={e => {
              const val = parseFloat(e.target.value);
              !isNaN(val) && handleChange(val);
            }}
          />
        </div>
      </div>
    </div>
  );
} 