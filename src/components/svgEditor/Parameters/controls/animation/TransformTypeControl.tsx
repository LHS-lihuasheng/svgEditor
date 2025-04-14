"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TransformPropertyConfig, ControlProps } from "@/types";

const TRANSFORM_TYPES = [
  { value: "translate", label: "translate", description: "平移" },
  { value: "scale", label: "scale", description: "缩放" },
  { value: "rotate", label: "rotate", description: "旋转" },
  { value: "skewX", label: "skewX", description: "X轴倾斜" },
  { value: "skewY", label: "skewY", description: "Y轴倾斜" }
];

const FORMAT_TIPS = {
  translate: "格式: x[,y] 例如: \"10,20\"",
  scale: "格式: x[,y] 例如: \"2\" 或 \"2,3\"",
  rotate: "格式: angle [cx cy] 例如: \"45\" 或 \"45 100 100\"",
  skewX: "格式: angle 例如: \"45\"",
  skewY: "格式: angle 例如: \"45\""
};

export function TransformTypeControl({
  propertyConfig,
  value,
  onChange
}: ControlProps) {
  const { label = "Transform Type" } = propertyConfig as TransformPropertyConfig;
  const currentValue = value || "translate";

  return (
    <div className="space-y-2">
      <Select value={currentValue} onValueChange={onChange}>
        <SelectTrigger className="h-10">
          <SelectValue placeholder="选择变换类型" />
        </SelectTrigger>
        <SelectContent>
          {TRANSFORM_TYPES.map(type => (
            <SelectItem key={type.value} value={type.value}>
              {type.label} <span className="text-xs text-muted-foreground ml-2">({type.description})</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="text-xs text-muted-foreground h-12">
        <p>提示: 每种变换类型的值格式不同</p>
        <p>{FORMAT_TIPS[currentValue as keyof typeof FORMAT_TIPS]}</p>
      </div>
    </div>
  );
} 