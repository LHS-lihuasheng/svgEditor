"use client"

import { useState, useEffect, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";

interface NumberControlProps {
    value: number;
    onChange: (value: number) => void;
    label?: string;
    min?: number;
    max?: number;
    step?: number;
    description?: string;
    placeholder?: string;
    showLabel?: boolean;
    [key: string]: any;
}

export function NumberControl({
    value,
    onChange,
    label,
    min,
    max,
    step = 1,
    description,
    placeholder = "输入数值",
    showLabel = true,
    ...rest
}: NumberControlProps) {
    // 使用字符串状态避免小数问题
    const [inputValue, setInputValue] = useState<string>(value?.toString() || '');
    const [error, setError] = useState<string | null>(null);

    // 同步外部值更新
    useEffect(() => {
        if (value !== undefined && value !== null) {
            const stringValue = value.toString();
            if (stringValue !== inputValue) {
                setInputValue(stringValue);
            }
        }
    }, [value]);

    // 错误自动清除
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // 验证并提交数值
    const validateAndSubmit = useCallback(() => {
        try {
            if (inputValue === '') {
                onChange(0);
                return;
            }

            const numValue = parseFloat(inputValue);

            if (isNaN(numValue)) {
                throw new Error('请输入有效的数字');
            }

            if (min !== undefined && numValue < min) {
                throw new Error(`最小值为 ${min}`);
            }

            if (max !== undefined && numValue > max) {
                throw new Error(`最大值为 ${max}`);
            }

            onChange(numValue);
        } catch (err) {
            setError((err as Error).message);
        }
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
                {...rest}
            />

            {error && (
                <div className="text-xs text-red-500 mt-1">{error}</div>
            )}
        </div>
    );
} 