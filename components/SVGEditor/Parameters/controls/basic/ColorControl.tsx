"use client"

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ColorPropertyConfig, ControlProps } from "@/types";

const DEFAULT_COLORS = [
    "#000000", "#ffffff", "#f44336", "#e91e63", "#9c27b0", "#673ab7",
    "#3f51b5", "#2196f3", "#03a9f4", "#00bcd4", "#009688", "#4caf50",
    "#8bc34a", "#cddc39", "#ffeb3b", "#ffc107", "#ff9800", "#ff5722",
    "#795548", "#607d8b", "transparent"
];

export function ColorControl({
    propertyConfig,
    value = "#000000",
    onChange
}: ControlProps) {
    // 从propertyConfig中提取所需配置
    const {
        label,
        presetColors = DEFAULT_COLORS,
        description,
        showLabel = true
    } = propertyConfig as ColorPropertyConfig;

    const [color, setColor] = useState(value);
    const [isTransparent, setIsTransparent] = useState(value === 'transparent' || value === 'none');

    useEffect(() => {
        setColor(value);
        setIsTransparent(value === 'transparent' || value === 'none');
    }, [value]);

    const transparentBg = "bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAGElEQVQYlWNgYGD4z4AE/lMrB5hGKUUYAE0ID/h3qOk7AAAAAElFTkSuQmCC')] bg-center";

    return (
        <div className="flex items-center gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn("w-10 h-10 p-0 border border-input", isTransparent && transparentBg)}
                        style={{ backgroundColor: isTransparent ? undefined : color }}
                    >
                        <span className="sr-only">选择颜色</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56">
                    <div className="grid grid-cols-5 gap-1">
                        {presetColors.map((presetColor, index) => {
                            const isTransparentPreset = presetColor === "transparent";
                            return (
                                <Button
                                    key={index}
                                    variant="outline"
                                    className={cn(
                                        "w-full h-8 p-0 border border-input flex items-center justify-center",
                                        isTransparentPreset && transparentBg
                                    )}
                                    style={{ backgroundColor: isTransparentPreset ? undefined : presetColor }}
                                    onClick={() => {
                                        setColor(presetColor);
                                        onChange(presetColor);
                                    }}
                                >
                                    {color === presetColor && (
                                        <Check className={cn(
                                            "h-4 w-4",
                                            isTransparentPreset || presetColor.toLowerCase() === "#ffffff"
                                                ? "text-black"
                                                : "text-white"
                                        )} />
                                    )}
                                </Button>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                        <div className="flex flex-col gap-1 flex-1">
                            <Input
                                value={color}
                                onChange={e => {
                                    setColor(e.target.value);
                                    onChange(e.target.value);
                                }}
                                placeholder="#000000 or rgba()"
                            />
                            <Input
                                type="color"
                                value={isTransparent ? "#ffffff" : color}
                                onChange={e => {
                                    if (!isTransparent) {
                                        setColor(e.target.value);
                                        onChange(e.target.value);
                                    }
                                }}
                                className="h-8"
                                disabled={isTransparent}
                            />
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            <Input
                className="flex-1"
                value={color}
                onChange={e => {
                    setColor(e.target.value);
                    onChange(e.target.value);
                }}
                placeholder="#000000 or rgba()"
            />
        </div>
    );
} 