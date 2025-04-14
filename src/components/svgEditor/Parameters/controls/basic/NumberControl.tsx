"use client"

import { useState, useEffect, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { NumberPropertyConfig, ControlProps } from "@/types";

export function NumberControl({
    propertyConfig,
    value,
    onChange
}: ControlProps) {
    // 从propertyConfig中提取所需的所有配置
    const {
        label,
        min,
        max,
        step = 1,
        description,
        placeholder = "输入数值",
        showLabel = false,
        defaultValue = 0
    } = propertyConfig as NumberPropertyConfig;

    // 使用字符串状态避免小数问题
    const [inputValue, setInputValue] = useState<string>((value !== undefined ? value : defaultValue).toString());
    const [error, setError] = useState<string>('');

    useEffect(() => {
        setInputValue((value !== undefined ? value : defaultValue).toString());
    }, [value, defaultValue]);

    const validateAndSubmit = useCallback(() => {
        if (!inputValue) {
            onChange(0);
            setError('');
            return;
        }

        const num = parseFloat(inputValue);

        if (isNaN(num)) {
            setError('请输入有效数字');
            return;
        }

        let validValue = num;

        if (min !== undefined && num < min) {
            validValue = min;
            setError(`最小值为 ${min}`);
        } else if (max !== undefined && num > max) {
            validValue = max;
            setError(`最大值为 ${max}`);
        } else {
            setError('');
        }

        setInputValue(validValue.toString());
        onChange(validValue);
    }, [inputValue, min, max, onChange]);

    return (
        <div className="space-y-2">
            {showLabel && label && (
                <div className="flex items-center gap-2">
                    <Label htmlFor={`number-${label}`}>{label}</Label>
                    {description && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{description}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            )}

            <Input
                id={label ? `number-${label}` : undefined}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={validateAndSubmit}
                onKeyDown={(e) => e.key === 'Enter' && validateAndSubmit()}
                placeholder={placeholder}
            />

            {error && (
                <div className="text-xs text-red-500 mt-1">{error}</div>
            )}
        </div>
    );
} 