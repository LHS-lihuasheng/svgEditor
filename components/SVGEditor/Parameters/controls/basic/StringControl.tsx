"use client"

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import {  ControlProps, StringPropertyConfig } from "@/types";

export function StringControl({
    propertyConfig,
    value,
    onChange
}: ControlProps) {
    // 从propertyConfig中提取所需配置
    const {
        label,
        placeholder = "",
        showLabel = true,
        description,
        defaultValue = ""
    } = propertyConfig as StringPropertyConfig;

    // 如果当前值为undefined并且有默认值，使用默认值
    if (value === undefined && defaultValue !== undefined) {
        onChange(defaultValue);
    }

    return (
        <div className="space-y-2">
            {showLabel && label && (
                <div className="flex items-center gap-2">
                    <Label htmlFor={`string-${label}`}>{label}</Label>
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
                id={`string-${label}`}
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    );
} 