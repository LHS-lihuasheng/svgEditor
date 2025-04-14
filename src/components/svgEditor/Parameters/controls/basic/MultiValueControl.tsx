"use client"

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuadValuePropertyConfig, ControlProps } from "@/types";



export function MultiValueControl({
    propertyConfig,
    value,
    onChange
}: ControlProps) {
    const {
        label,
        fieldConfig,
        layout,
        gridCols,
        description,
        groupLabel = ''
    } = propertyConfig as QuadValuePropertyConfig;

    const safeValue = value || {};

    // 处理字段值变更
    const handleChange = (key: string, val: any) => {
        const newValue = { ...safeValue, [key]: val };
        onChange(newValue);
    };

    // 根据布局类型渲染字段
    const renderFields = () => {
        // 计算布局列数
        const columnsToUse = gridCols || fieldConfig.length || 2;

        if (layout === 'stack') {
            return (
                <div className="space-y-2">
                    {fieldConfig.map((field) => (
                        <div key={field.key} className="space-y-1">
                            <Label className="text-xs">{field.label}</Label>
                            <Input
                                type="number"
                                value={safeValue[field.key]?.toString() ?? ''}
                                onChange={(e) => handleChange(field.key, parseFloat(e.target.value))}
                                min={field.min}
                                max={field.max}
                                step={field.step}
                            />
                        </div>
                    ))}
                </div>
            );
        } else if (layout === 'flex') {
            return (
                <div className="flex gap-2">
                    {fieldConfig.map((field) => (
                        <div key={field.key} style={{ width: field.width || 'auto' }}>
                            <Label className="text-xs">{field.label}</Label>
                            <Input
                                type="number"
                                value={safeValue[field.key]?.toString() ?? ''}
                                onChange={(e) => handleChange(field.key, parseFloat(e.target.value))}
                                min={field.min}
                                max={field.max}
                                step={field.step}
                            />
                        </div>
                    ))}
                </div>
            );
        } else {
            return (
                <div className={`grid grid-cols-${columnsToUse} gap-2`}>
                    {fieldConfig.map((field) => (
                        <div key={field.key}>
                            <Label className="text-xs">{field.label}</Label>
                            <Input
                                type="number"
                                value={safeValue[field.key]?.toString() ?? ''}
                                onChange={(e) => handleChange(field.key, parseFloat(e.target.value))}
                                min={field.min}
                                max={field.max}
                                step={field.step}
                            />
                        </div>
                    ))}
                </div>
            );
        }
    };

    return (
        <div className="space-y-2">
            {/* 主标签 */}
            {label && <Label>{label}</Label>}

            {/* 分组标签 */}
            {groupLabel && <Label className="text-sm text-muted-foreground">{groupLabel}</Label>}

            {/* 渲染内容 */}
            {renderFields()}
        </div>
    );
} 