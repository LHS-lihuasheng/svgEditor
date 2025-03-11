"use client"

import { useRef } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TransformTypeControlProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
}

export function TransformTypeControl({
  label = "Transform Type",
  value,
  onChange
}: TransformTypeControlProps) {
  // 使用ref跟踪当前值，避免不必要的更新
  const valueRef = useRef(value || "translate");

  // 确保只在值真正改变时触发onChange
  const handleValueChange = (newValue: string) => {
    if (valueRef.current !== newValue) {
      valueRef.current = newValue;
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-2">
      <Select value={value || "translate"} onValueChange={handleValueChange}>
        <SelectTrigger className="h-10">
          <SelectValue placeholder="选择变换类型" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="translate">
            translate <span className="text-xs text-muted-foreground ml-2">(平移)</span>
          </SelectItem>
          <SelectItem value="scale">
            scale <span className="text-xs text-muted-foreground ml-2">(缩放)</span>
          </SelectItem>
          <SelectItem value="rotate">
            rotate <span className="text-xs text-muted-foreground ml-2">(旋转)</span>
          </SelectItem>
          <SelectItem value="skewX">
            skewX <span className="text-xs text-muted-foreground ml-2">(X轴倾斜)</span>
          </SelectItem>
          <SelectItem value="skewY">
            skewY <span className="text-xs text-muted-foreground ml-2">(Y轴倾斜)</span>
          </SelectItem>
        </SelectContent>
      </Select>

      <div className="text-xs text-muted-foreground h-12">
        <p>提示: 每种变换类型的值格式不同</p>
        {value === "translate" && <p>格式: x[,y] 例如: "10,20"</p>}
        {value === "scale" && <p>格式: x[,y] 例如: "2" 或 "2,3"</p>}
        {value === "rotate" && <p>格式: angle [cx cy] 例如: "45" 或 "45 100 100"</p>}
        {(value === "skewX" || value === "skewY") && <p>格式: angle 例如: "45"</p>}
      </div>
    </div>
  );
} 