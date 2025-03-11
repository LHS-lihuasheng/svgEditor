"use client"

import { useRef } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CalcModeControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  isMotion?: boolean; // 是否用于animateMotion
}

export function CalcModeControl({
  label,
  value,
  onChange,
  isMotion = false
}: CalcModeControlProps) {
  // 对于animateMotion，默认是paced
  const defaultValue = isMotion ? "paced" : "linear";
  const currentValue = value || defaultValue;

  // 使用ref跟踪当前值，避免不必要的更新
  const valueRef = useRef(currentValue);

  // 确保只在值真正改变时触发onChange
  const handleValueChange = (newValue: string) => {
    if (valueRef.current !== newValue) {
      valueRef.current = newValue;
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-2">
      <Select value={currentValue} onValueChange={handleValueChange}>
        <SelectTrigger className="h-10">
          <SelectValue placeholder="Select interpolation mode" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="discrete">
            discrete <span className="text-xs text-muted-foreground ml-2">(离散跳变)</span>
          </SelectItem>
          <SelectItem value="linear">
            linear <span className="text-xs text-muted-foreground ml-2">(线性过渡)</span>
          </SelectItem>
          <SelectItem value="paced">
            paced <span className="text-xs text-muted-foreground ml-2">(均速变化)</span>
          </SelectItem>
          <SelectItem value="spline">
            spline <span className="text-xs text-muted-foreground ml-2">(贝塞尔曲线)</span>
          </SelectItem>
        </SelectContent>
      </Select>

      <div className="text-xs text-muted-foreground h-10">
        {currentValue === "discrete" &&
          <p>discrete: 值之间没有过渡，直接跳变</p>}
        {currentValue === "linear" &&
          <p>linear: 值之间线性插值，匀速变化</p>}
        {currentValue === "paced" &&
          <p>paced: 均匀变化速度，忽略keyTimes和keySplines</p>}
        {currentValue === "spline" &&
          <p>spline: 使用贝塞尔曲线控制变化速度，需要keySplines</p>}
      </div>
    </div>
  );
} 