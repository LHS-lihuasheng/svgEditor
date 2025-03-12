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
    if (value !== undefined) {
      setLocalValue(value);
    } else if (defaultValue !== undefined) {
      setLocalValue(defaultValue);
    }
  }, [value, defaultValue]);

  // 格式化值确保在范围内
  const formatValue = (val: number): number => {
    if (isNaN(val)) return defaultValue;
    return Math.max(min, Math.min(max, val));
  };

  // 处理滑块变化
  const handleSliderChange = (newValue: number[]) => {
    const formattedValue = formatValue(newValue[0]);
    setLocalValue(formattedValue);
    onChange(formattedValue);
  };

  // 处理输入框变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseFloat(e.target.value);
    if (!isNaN(numValue)) {
      const formattedValue = formatValue(numValue);
      setLocalValue(formattedValue);
      onChange(formattedValue);
    }
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
            onValueChange={handleSliderChange}
          />
        </div>
        <div className={inputWidth}>
          <div className="relative">
            <Input
              id={`slider-input-${label || 'value'}`}
              type="number"
              min={min}
              max={max}
              step={step}
              value={localValue}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 