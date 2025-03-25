"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { SelectPropertyConfig, ControlProps } from "@/types";



export function SelectControl({
    propertyConfig,
    value,
    onChange
}: ControlProps) {
    // 从propertyConfig中提取所需配置
    const {
        label,
        options = [],
        showLabel = true,
        description,
        placeholder = "选择选项",
        defaultValue
    } = propertyConfig as SelectPropertyConfig;

    // 如果当前值为未定义且有默认值，则使用默认值
    if (value === undefined && defaultValue !== undefined) {
        onChange(defaultValue);
    }

    return (
        <div className="space-y-2">
            {showLabel && label && (
                <div className="flex items-center gap-2">
                    <Label htmlFor={`select-${label}`}>{label}</Label>
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

            <Select value={value || ''} onValueChange={onChange}>
                <SelectTrigger id={`select-${label}`}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
} 