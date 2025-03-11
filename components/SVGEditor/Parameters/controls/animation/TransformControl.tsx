import { useState, useEffect, useRef, useCallback } from "react";
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

  // 防止循环更新
  const isUpdatingRef = useRef(false);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 当外部值变化时更新本地状态
  useEffect(() => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;

    try {
      setLocalValue(value);
    } finally {
      isUpdatingRef.current = false;
    }
  }, [value]);

  // 更新值函数 - 使用防抖
  const updateValue = useCallback((newValue: TransformProps) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      if (!isUpdatingRef.current) {
        setLocalValue(newValue);
        onChange(newValue);
      }
      updateTimeoutRef.current = null;
    }, 100);
  }, [onChange]);

  // 处理平移变化
  const handleTranslateChange = useCallback((axis: 'x' | 'y', val: number) => {
    if (isUpdatingRef.current) return;

    const newValue = {
      ...localValue,
      translate: {
        ...(localValue.translate || { x: 0, y: 0 }),
        [axis]: val
      }
    };
    updateValue(newValue);
  }, [localValue, updateValue]);

  // 处理缩放变化
  const handleScaleChange = useCallback((val: number) => {
    if (isUpdatingRef.current) return;

    const newValue = { ...localValue, scale: val };
    updateValue(newValue);
  }, [localValue, updateValue]);

  // 处理旋转变化
  const handleRotateChange = useCallback((val: number) => {
    if (isUpdatingRef.current) return;

    const newValue = { ...localValue, rotate: val };
    updateValue(newValue);
  }, [localValue, updateValue]);

  const translateX = localValue.translate?.x || 0;
  const translateY = localValue.translate?.y || 0;
  const scale = localValue.scale || 1;
  const rotate = localValue.rotate || 0;

  return (
    <div className="space-y-4">
      {/* 平移控制 */}
      <div className="space-y-2">
        <p className="text-xs font-medium">平移 X</p>
        <Input
          type="number"
          value={translateX}
          onChange={(e) => handleTranslateChange('x', Number(e.target.value))}
          className="h-10"
        />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium">平移 Y</p>
        <Input
          type="number"
          value={translateY}
          onChange={(e) => handleTranslateChange('y', Number(e.target.value))}
          className="h-10"
        />
      </div>

      {/* 缩放控制 */}
      <div className="space-y-2">
        <p className="text-xs font-medium">缩放</p>
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
              className="h-10"
            />
          </div>
        </div>
      </div>

      {/* 旋转控制 */}
      <div className="space-y-2">
        <p className="text-xs font-medium">旋转 (度)</p>
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
              className="h-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 