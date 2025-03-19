import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface SliderWithInputProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  inputWidth?: string; // 自定义输入框宽度
  showLabel?: boolean; // 是否显示标签
  defaultValue?: number; // 默认值
}

export function SliderWithInput({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  className = '',
  inputWidth = "w-16",
  showLabel = true,
  defaultValue = 0
}: SliderWithInputProps) {
  // 本地状态，处理滑块和输入框的同步
  const [localValue, setLocalValue] = useState<number>(value ?? defaultValue);

  // 当外部值变化时更新本地状态
  useEffect(() => {
    value !== undefined && setLocalValue(value);
  }, [value]);

  // 处理滑块变化
  const handleChange = (val: number) => {
    const formattedValue = Math.max(min, Math.min(max, val));
    setLocalValue(formattedValue);
    onChange(formattedValue);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabel && label && <Label>{label}</Label>}
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