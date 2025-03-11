import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

interface OpacityControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export function OpacityControl({
  label,
  value = 1,
  onChange
}: OpacityControlProps) {
  // 本地状态，处理滑块和输入框的同步
  const [localValue, setLocalValue] = useState<number>(value);

  // 当外部值变化时更新本地状态
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // 格式化值确保在0-1范围内
  const formatValue = (val: number): number => {
    if (isNaN(val)) return 1;
    return Math.max(0, Math.min(1, val));
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
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <div className="flex-grow">
          <Slider
            value={[localValue]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={handleSliderChange}
          />
        </div>
        <div className="w-16">
          <Input
            id={`opacity-${label}`}
            type="number"
            min={0}
            max={1}
            step={0.01}
            value={localValue}
            onChange={handleInputChange}
          />
        </div>
      </div>
    </div>
  );
}