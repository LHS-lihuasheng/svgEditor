"use client"

import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TriggerPropertyConfig, ControlProps } from "@/types";

const DEFAULT_TRIGGER_TYPES = [
  { label: "定时开始", value: "time" },
  { label: "click", value: "click" },
  { label: "touchstart", value: "touchstart" },
  { label: "touchend", value: "touchend" }
];

export function TriggerControl({
  propertyConfig,
  value,
  onChange
}: ControlProps) {
  // 从propertyConfig中提取配置
  const {
    label,
    description,
    options = DEFAULT_TRIGGER_TYPES
  } = propertyConfig as TriggerPropertyConfig;

  const [triggerType, setTriggerType] = useState("time");
  const [inputValue, setInputValue] = useState("0s");
  const isUpdatingRef = useRef(false);

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
        if (options.some(t => t.value === type)) {
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
  }, [value, options]);

  // 更新最终值
  const updateValue = useCallback((type: string, val: string) => {
    if (isUpdatingRef.current) return;

    const finalValue = type === "time"
      ? val
      : val ? `${type}+${val}` : type;

    onChange(finalValue);
  }, [onChange]);

  return (
    <div className="grid grid-cols-2 gap-2">
      <Select
        value={triggerType}
        onValueChange={type => {
          setTriggerType(type);
          updateValue(type, inputValue);
        }}
      >
        <SelectTrigger className="h-10">
          <SelectValue placeholder="选择触发类型" />
        </SelectTrigger>
        <SelectContent>
          {options.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        value={inputValue}
        onChange={e => {
          setInputValue(e.target.value);
          updateValue(triggerType, e.target.value);
        }}
        placeholder={triggerType === "time" ? "输入开始时间（如：2s）" : "输入延迟时间（可选）"}
        className="h-10"
      />
    </div>
  );
} 