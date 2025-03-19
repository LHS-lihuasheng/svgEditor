"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AdditiveControlProps {
  label?: string;
  additive: string;
  accumulate: string;
  onAdditiveChange: (value: string) => void;
  onAccumulateChange: (value: string) => void;
  isToAnimation?: boolean; // to动画不支持accumulate
}

export function AdditiveControl({
  label = "动画叠加行为",
  additive,
  accumulate,
  onAdditiveChange,
  onAccumulateChange,
  isToAnimation = false
}: AdditiveControlProps) {
  // 使用memo化的回调来避免额外渲染
  const handleAdditiveChange = (value: string) => {
    if (value !== additive) {
      onAdditiveChange(value);
    }
  };

  const handleAccumulateChange = (value: string) => {
    if (value !== accumulate) {
      onAccumulateChange(value);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4 min-h-[76px]">
        <div className="space-y-1">
          <p className="text-xs font-medium">additive</p>
          <Select
            value={additive || "replace"}
            onValueChange={handleAdditiveChange}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="选择叠加模式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="replace">
                replace <span className="text-xs text-muted-foreground ml-2">(替换)</span>
              </SelectItem>
              <SelectItem value="sum">
                sum <span className="text-xs text-muted-foreground ml-2">(累加)</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium">accumulate</p>
          <Select
            value={accumulate || "none"}
            onValueChange={handleAccumulateChange}
            disabled={isToAnimation}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="选择累积模式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                none <span className="text-xs text-muted-foreground ml-2">(不累积)</span>
              </SelectItem>
              <SelectItem value="sum">
                sum <span className="text-xs text-muted-foreground ml-2">(累积)</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        <p>additive="sum": 叠加到当前属性值</p>
        <p>accumulate="sum": 每次重复迭代时累积值</p>
        {isToAnimation && <p className="text-amber-500">to动画不支持accumulate属性</p>}
      </div>
    </div>
  );
} 