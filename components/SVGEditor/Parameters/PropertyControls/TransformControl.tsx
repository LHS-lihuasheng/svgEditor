import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface TransformProps {
  translate?: { x: number; y: number };
  scale?: number;
  rotate?: number;
}

interface TransformControlProps {
  label: string;
  value: TransformProps;
  onChange: (value: TransformProps) => void;
}

export function TransformControl({
  label,
  value = { translate: { x: 0, y: 0 }, scale: 1, rotate: 0 },
  onChange
}: TransformControlProps) {
  // 本地状态，处理各个变换值
  const [localValue, setLocalValue] = useState<TransformProps>(value);

  // 当外部值变化时更新本地状态
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // 处理平移变化
  const handleTranslateChange = (axis: 'x' | 'y', val: number) => {
    const newValue = {
      ...localValue,
      translate: {
        ...(localValue.translate || { x: 0, y: 0 }),
        [axis]: val
      }
    };
    setLocalValue(newValue);
    onChange(newValue);
  };

  // 处理缩放变化
  const handleScaleChange = (val: number) => {
    const newValue = { ...localValue, scale: val };
    setLocalValue(newValue);
    onChange(newValue);
  };

  // 处理旋转变化
  const handleRotateChange = (val: number) => {
    const newValue = { ...localValue, rotate: val };
    setLocalValue(newValue);
    onChange(newValue);
  };

  const translateX = localValue.translate?.x || 0;
  const translateY = localValue.translate?.y || 0;
  const scale = localValue.scale || 1;
  const rotate = localValue.rotate || 0;

  return (
    <div className="space-y-4">
      <Label>{label}</Label>

      {/* 平移控制 */}
      <div className="space-y-2">
        <Label className="text-xs">平移 X</Label>
        <Input
          type="number"
          value={translateX}
          onChange={(e) => handleTranslateChange('x', Number(e.target.value))}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">平移 Y</Label>
        <Input
          type="number"
          value={translateY}
          onChange={(e) => handleTranslateChange('y', Number(e.target.value))}
        />
      </div>

      {/* 缩放控制 */}
      <div className="space-y-2">
        <Label className="text-xs">缩放</Label>
        <div className="flex items-center gap-4">
          <div className="flex-grow">
            <Slider
              value={[scale]}
              min={0.1}
              max={5}
              step={0.1}
              onValueChange={(values) => handleScaleChange(values[0])}
            />
          </div>
          <div className="w-16">
            <Input
              type="number"
              min={0.1}
              step={0.1}
              value={scale}
              onChange={(e) => handleScaleChange(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* 旋转控制 */}
      <div className="space-y-2">
        <Label className="text-xs">旋转 (度)</Label>
        <div className="flex items-center gap-4">
          <div className="flex-grow">
            <Slider
              value={[rotate]}
              min={0}
              max={360}
              step={1}
              onValueChange={(values) => handleRotateChange(values[0])}
            />
          </div>
          <div className="w-16">
            <Input
              type="number"
              min={0}
              max={360}
              value={rotate}
              onChange={(e) => handleRotateChange(Number(e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 