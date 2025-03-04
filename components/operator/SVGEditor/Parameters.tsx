"use client"

import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useParametersPanel } from "@/contexts/ParametersPanelContext"
import { useEditor } from "@/contexts/EditorContext"
import { PropertyControl, COMPONENT_TEMPLATES } from "@/types/atomicComponent"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import get from "lodash/get"
import set from "lodash/set"
import { useAssets } from '@/contexts/AssetContext'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ImageIcon } from "lucide-react"

interface ParametersProps {
    selectedComponent: any | null;
}

export function Parameters({ selectedComponent }: ParametersProps) {
    const { isPanelOpen, togglePanel } = useParametersPanel();
    const { updateComponent } = useEditor();
    const { imageAssets, shiftFirstSelectedImage } = useAssets();

    const handlePropertyChange = (property: string, value: any) => {
        if (!selectedComponent) return;

        // 创建组件的副本
        const updatedComponent = JSON.parse(JSON.stringify(selectedComponent));

        // 使用lodash的set函数设置嵌套属性
        set(updatedComponent, property, value);

        // 更新组件
        updateComponent(updatedComponent);
    };

    // 处理viewBox变更
    const handleViewBoxChange = (field: keyof Component['viewBox'], value: string) => {
        if (!selectedComponent) return;

        const viewBox = { ...(selectedComponent.viewBox || {}) };
        viewBox[field] = value ? parseFloat(value) : undefined;

        handlePropertyChange('viewBox', viewBox);
    };

    // 处理margin变更
    const handleMarginChange = (field: keyof Component['style']['margin'], value: string) => {
        if (!selectedComponent) return;

        const margin = { ...(get(selectedComponent, 'style.margin') || {}) };
        margin[field] = value ? parseFloat(value) : undefined;

        handlePropertyChange('style.margin', margin);
    };

    // 修改图片选择器渲染逻辑
    const renderImageSelector = (control: PropertyControl, currentValue: string) => {
        const currentPath = get(selectedComponent, 'style.backgroundImage')?.replace(/url\(['"](.+)['"]\)/, '$1') || '';

        return (
            <div className="space-y-2" key={control.property}>
                <Label htmlFor={control.property}>{control.label}</Label>
                <div className="flex gap-2">
                    <div className="flex-1">
                        <Input
                            id={control.property}
                            value={currentPath}
                            onChange={(e) => {
                                const url = e.target.value ? `url('${e.target.value}')` : '';
                                handlePropertyChange(control.property, url);
                            }}
                            placeholder="Enter image URL"
                        />
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                            const selectedImage = shiftFirstSelectedImage();
                            if (selectedImage) {
                                // 设置背景图路径
                                const url = `url('${selectedImage.relativePath}')`;
                                handlePropertyChange(control.property, url);

                                // 自动设置viewBox的width和height
                                const newViewBox = {
                                    ...selectedComponent.viewBox,
                                    width: selectedImage.dimensions.width,
                                    height: selectedImage.dimensions.height
                                };
                                handlePropertyChange('viewBox', newViewBox);
                            }
                        }}
                    >
                        <ImageIcon className="h-4 w-4" />
                    </Button>
                </div>
                {currentValue && (
                    <div className="mt-2 relative w-full h-20 bg-gray-100 rounded-md overflow-hidden">
                        <div
                            className="absolute inset-0 bg-contain bg-center bg-no-repeat"
                            style={{ backgroundImage: currentValue }}
                        />
                    </div>
                )}
            </div>
        );
    };

    // 根据属性控制器类型渲染对应的控件
    const renderPropertyControl = (control: PropertyControl) => {
        if (!selectedComponent) return null;

        // 特殊处理viewBox属性
        if (control.property === 'viewBox') {
            const viewBox = selectedComponent.viewBox || {};
            return (
                <div className="space-y-2" key={control.property}>
                    <Label>{control.label}</Label>
                    <div className="grid grid-cols-4 gap-2">
                        <div>
                            <Input
                                type="number"
                                value={viewBox.x?.toString() || ''}
                                onChange={(e) => handleViewBoxChange('x', e.target.value)}
                                placeholder="x"
                            />
                        </div>
                        <div>
                            <Input
                                type="number"
                                value={viewBox.y?.toString() || ''}
                                onChange={(e) => handleViewBoxChange('y', e.target.value)}
                                placeholder="y"
                            />
                        </div>
                        <div>
                            <Input
                                type="number"
                                value={viewBox.width?.toString() || ''}
                                onChange={(e) => handleViewBoxChange('width', e.target.value)}
                                placeholder="width"
                            />
                        </div>
                        <div>
                            <Input
                                type="number"
                                value={viewBox.height?.toString() || ''}
                                onChange={(e) => handleViewBoxChange('height', e.target.value)}
                                placeholder="height"
                            />
                        </div>
                    </div>
                </div>
            );
        }

        // 特殊处理margin属性
        if (control.property === 'style.margin') {
            const margin = get(selectedComponent, 'style.margin') || {};
            return (
                <div className="space-y-2" key={control.property}>
                    <Label>{control.label}</Label>
                    <div className="grid grid-cols-4 gap-2">
                        <div>
                            <Input
                                type="number"
                                value={margin.top?.toString() || ''}
                                onChange={(e) => handleMarginChange('top', e.target.value)}
                                placeholder="top"
                            />
                        </div>
                        <div>
                            <Input
                                type="number"
                                value={margin.right?.toString() || ''}
                                onChange={(e) => handleMarginChange('right', e.target.value)}
                                placeholder="right"
                            />
                        </div>
                        <div>
                            <Input
                                type="number"
                                value={margin.bottom?.toString() || ''}
                                onChange={(e) => handleMarginChange('bottom', e.target.value)}
                                placeholder="bottom"
                            />
                        </div>
                        <div>
                            <Input
                                type="number"
                                value={margin.left?.toString() || ''}
                                onChange={(e) => handleMarginChange('left', e.target.value)}
                                placeholder="left"
                            />
                        </div>
                    </div>
                </div>
            );
        }

        const value = get(selectedComponent, control.property);

        switch (control.type) {
            case 'string':
                return (
                    <div className="space-y-2" key={control.property}>
                        <Label htmlFor={control.property}>{control.label}</Label>
                        <Input
                            id={control.property}
                            value={value || control.defaultValue || ''}
                            onChange={(e) => handlePropertyChange(control.property, e.target.value)}
                        />
                    </div>
                );

            case 'number':
                return (
                    <div className="space-y-2" key={control.property}>
                        <Label htmlFor={control.property}>{control.label}</Label>
                        <Input
                            id={control.property}
                            type="number"
                            min={control.min}
                            max={control.max}
                            step={control.step || 1}
                            value={value ?? control.defaultValue ?? 0}
                            onChange={(e) => handlePropertyChange(control.property, parseFloat(e.target.value))}
                        />
                    </div>
                );

            case 'boolean':
                return (
                    <div className="flex items-center justify-between" key={control.property}>
                        <Label htmlFor={control.property}>{control.label}</Label>
                        <Switch
                            id={control.property}
                            checked={value ?? control.defaultValue ?? false}
                            onCheckedChange={(checked) => handlePropertyChange(control.property, checked)}
                        />
                    </div>
                );

            case 'select':
                return (
                    <div className="space-y-2" key={control.property}>
                        <Label htmlFor={control.property}>{control.label}</Label>
                        <Select
                            value={value || control.defaultValue || ''}
                            onValueChange={(value) => handlePropertyChange(control.property, value)}
                        >
                            <SelectTrigger id={control.property}>
                                <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                            <SelectContent>
                                {control.options?.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                );

            case 'color':
                return (
                    <div className="space-y-2" key={control.property}>
                        <Label htmlFor={control.property}>{control.label}</Label>
                        <div className="flex">
                            <div
                                className="w-8 h-8 rounded-md border mr-2"
                                style={{ backgroundColor: value || control.defaultValue || '#ffffff' }}
                            />
                            <Input
                                id={control.property}
                                type="color"
                                value={value || control.defaultValue || '#ffffff'}
                                onChange={(e) => handlePropertyChange(control.property, e.target.value)}
                                className="w-full"
                            />
                        </div>
                    </div>
                );

            case 'image':
                return renderImageSelector(control, value);

            default:
                return null;
        }
    };

    // 获取当前选中组件类型的属性控制器
    const getPropertyControls = () => {
        if (!selectedComponent) return [];

        const template = COMPONENT_TEMPLATES[selectedComponent.type];
        return template?.propertyControls || [];
    };

    return (
        <div
            className={cn(
                "fixed top-[57px] right-0 bottom-0 bg-white shadow-lg transition-[width] duration-300 ease-in-out z-10",
                isPanelOpen ? "w-96" : "w-12"
            )}
        >
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 left-2 h-8 w-8"
                onClick={togglePanel}
            >
                {isPanelOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>

            {isPanelOpen && (
                <div className="p-4 pt-12">
                    <h3 className="font-medium text-sm mb-2">Parameters</h3>
                    <ScrollArea className="h-[calc(100vh-120px)]">
                        {selectedComponent ? (
                            <div className="space-y-4">
                                <div className="text-sm">
                                    <span className="font-medium">Component ID: </span>
                                    <span>{selectedComponent.id}</span>
                                </div>
                                <div className="text-sm">
                                    <span className="font-medium">Component Type: </span>
                                    <span>{selectedComponent.type}</span>
                                </div>

                                <div className="border-t pt-4 mt-4">
                                    <h4 className="font-medium text-sm mb-3">Properties</h4>
                                    <div className="space-y-4">
                                        {getPropertyControls().map(control => renderPropertyControl(control))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500">
                                Select a component to edit its properties
                            </div>
                        )}
                    </ScrollArea>
                </div>
            )}
        </div>
    );
}
