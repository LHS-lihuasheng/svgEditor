"use client"

import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TRIGGER_TYPES = [
  { label: "定时开始", value: "time" },
  { label: "click", value: "click" },
  { label: "touchstart", value: "touchstart" },
  { label: "touchmove", value: "touchmove" },
  { label: "touchend", value: "touchend" }
];

interface TriggerControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function TriggerControl({ label, value, onChange }: TriggerControlProps) {
  const [triggerType, setTriggerType] = useState("time");
  const [inputValue, setInputValue] = useState("0s");

  // 防止循环更新
  const isUpdatingRef = useRef(false);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 生成最终值 - 使用防抖
  const updateFinalValue = useCallback((type: string, val: string) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      if (!isUpdatingRef.current) {
        const finalValue = type === "time"
          ? val
          : val ? `${type}+${val}` : type;

        onChange(finalValue);
      }
      updateTimeoutRef.current = null;
    }, 100);
  }, [onChange]);

  // 统一处理所有状态变化
  const handleChange = useCallback((type: string, val: string) => {
    if (isUpdatingRef.current) return;

    setTriggerType(type);
    setInputValue(val);
    updateFinalValue(type, val);
  }, [updateFinalValue]);

  // 解析初始值
  useEffect(() => {
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;

    try {
      if (!value) {
        setTriggerType("time");
        setInputValue("");
        return;
      }

      if (value.includes("+")) {
        const [type, delay] = value.split("+");
        if (TRIGGER_TYPES.some(t => t.value === type)) {
          setTriggerType(type);
          setInputValue(delay);
        } else {
          setTriggerType("time");
          setInputValue(value);
        }
      } else {
        if (/^\d+/.test(value)) {
          setTriggerType("time");
          setInputValue(value);
        } else {
          setTriggerType(value);
          setInputValue("");
        }
      }
    } finally {
      isUpdatingRef.current = false;
    }
  }, [value]);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {/* 触发类型选择 */}
        <Select
          value={triggerType}
          onValueChange={(type) => handleChange(type, inputValue)}
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder="选择触发类型" />
          </SelectTrigger>
          <SelectContent>
            {TRIGGER_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 动态输入框 */}
        <Input
          value={inputValue}
          onChange={(e) => handleChange(triggerType, e.target.value)}
          placeholder={
            triggerType === "time"
              ? "输入开始时间（如：2s）"
              : "输入延迟时间（可选）"
          }
          className="h-10"
        />
      </div>
    </div>
  );
} 