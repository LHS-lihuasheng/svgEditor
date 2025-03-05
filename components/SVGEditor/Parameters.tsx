"use client"

import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePanel } from "@/contexts/PanelContext"
import { useEditor } from '@/contexts/EditorContext/index'
import type { BaseComponent } from "@/types/core"
import { PropertyControl } from "@/types/core"
import { COMPONENT_TEMPLATES, getComponentTemplate } from "@/components/templates"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import get from "lodash/get"
import set from "lodash/set"
import { useAssets } from '@/contexts/AssetContext'

/**
 * @description 参数面板组件的属性接口
 * @interface ParametersProps
 */
interface ParametersProps {
    selectedComponent: BaseComponent | null;  // 当前选中的组件
}

/**
 * @description margin属性的接口定义
 * @interface Margin
 */
interface Margin {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
}

/**
 * @description viewBox属性的接口定义
 * @interface ViewBox
 */
interface ViewBox {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
}

/**
 * @description 组件参数编辑面板
 * @param {ParametersProps} props - 组件属性
 * @returns {JSX.Element} 参数面板的渲染结果
 */
export function Parameters({ selectedComponent }: ParametersProps) {
    const { isParametersPanelOpen, toggleParametersPanel } = usePanel();
    const { updateComponent } = useEditor();
    const { shiftFirstSelectedImage, findImageByPath } = useAssets();

    /**
     * @description 更新组件属性的通用处理函数
     * @param {string} property - 属性路径
     * @param {any} value - 新的属性值
     */
    const handlePropertyChange = (property: string, value: any) => {
        if (!selectedComponent) return;

        // 创建组件的副本并更新属性
        const updatedComponent = JSON.parse(JSON.stringify(selectedComponent));
        set(updatedComponent, property, value);
        updateComponent(updatedComponent);
    };

    /**
     * @description 处理viewBox属性变更
     * @param {keyof ViewBox} field - viewBox的字段名
     * @param {string} value - 新的字段值
     */
    const handleViewBoxChange = (field: keyof ViewBox, value: string) => {
        if (!selectedComponent) return;

        const currentViewBox = getCurrentViewBox();
        const numericValue = value === '' ? undefined : Number(value);

        handlePropertyChange('viewBox', {
            ...currentViewBox,
            [field]: numericValue
        });
    };

    /**
     * @description 获取组件模板的默认margin值
     * @returns {Margin} 默认的margin对象
     */
    const getDefaultMargin = (): Margin => {
        const template = COMPONENT_TEMPLATES[selectedComponent.type as keyof typeof COMPONENT_TEMPLATES];
        return template?.defaultProperties?.style?.margin || {};
    };

    /**
     * @description 解析margin值为结构化对象
     * @param {any} value - 要解析的margin值
     * @returns {Margin} 解析后的margin对象
     */
    const parseMarginValue = (value: any): Margin => {
        if (typeof value === 'string') {
            const values = value.split(/[^\d.-]+/).filter(Boolean).map(Number);
            return {
                top: values[0],
                right: values[1],
                bottom: values[2],
                left: values[3]
            };
        }
        return value || {};
    };

    /**
     * @description 获取当前组件的margin值
     * @returns {Margin} 当前的margin对象
     */
    const getCurrentMargin = (): Margin => {
        return {
            ...parseMarginValue(get(selectedComponent, 'style.margin'))
        };
    };

    /**
     * @description 处理margin属性变更
     * @param {keyof Margin} field - margin的字段名
     * @param {string} value - 新的字段值
     */
    const handleMarginChange = (field: keyof Margin, value: string) => {
        const currentMargin = getCurrentMargin();
        const numericValue = value === '' ? undefined : Number(value);

        handlePropertyChange('style.margin', {
            ...currentMargin,
            [field]: numericValue
        });
    };

    /**
     * @description 获取组件模板的默认viewBox值
     * @returns {ViewBox} 默认的viewBox对象
     */
    const getDefaultViewBox = (): ViewBox => {
        const template = COMPONENT_TEMPLATES[selectedComponent.type as keyof typeof COMPONENT_TEMPLATES];
        return template?.defaultProperties?.viewBox || {};
    };

    /**
     * @description 获取当前组件的viewBox值
     * @returns {ViewBox} 当前的viewBox对象
     */
    const getCurrentViewBox = (): ViewBox => {
        return {
            ...getDefaultViewBox(),
            ...parseViewBoxValue(selectedComponent?.viewBox)
        };
    };

    /**
     * @description 解析viewBox值为结构化对象
     * @param {any} value - 要解析的viewBox值
     * @returns {ViewBox} 解析后的viewBox对象
     */
    const parseViewBoxValue = (value: any): ViewBox => {
        if (typeof value === 'string') {
            const values = value.split(/[^\d.-]+/).filter(Boolean).map(Number);
            return {
                x: values[0],
                y: values[1],
                width: values[2],
                height: values[3]
            };
        }
        return value || {};
    };

    /**
     * @description 渲染图片选择器控件
     * @param {PropertyControl} control - 属性控制器配置
     * @param {string} currentValue - 当前属性值
     * @returns {JSX.Element} 图片选择器控件的渲染结果
     */
    const renderImageSelector = (control: PropertyControl, currentValue: string) => {
        // 从组件中获取当前路径
        const currentPath = get(selectedComponent, 'style.backgroundImage')?.replace(/url\(['"](.+)['"]\)/, '$1') || '';

        // 使用useState存储预览URL，初始为空
        const [previewUrl, setPreviewUrl] = useState<string>('');

        // 当组件或当前值变化时，更新预览URL
        useEffect(() => {
            // 先尝试从资产库找到对应的图片
            const imageAsset = findImageByPath?.(currentPath);
            if (imageAsset) {
                // 如果找到图片资产，使用其Blob URL
                setPreviewUrl(`url('${imageAsset.url}')`);
            } else if (currentPath) {
                // 否则使用当前路径
                setPreviewUrl(`url('${currentPath}')`);
            } else {
                setPreviewUrl('');
            }
        }, [selectedComponent, currentPath]);

        return (
            <div className="space-y-2" key={control.property}>
                <Label htmlFor={control.property}>{control.label}</Label>
                <div className="flex gap-2">
                    <div className="flex-1">
                        <Input
                            id={control.property}
                            value={currentPath}
                            onChange={(e) => {
                                const updatedComponent = JSON.parse(JSON.stringify(selectedComponent));
                                if (!updatedComponent.style) {
                                    updatedComponent.style = {};
                                }
                                const url = e.target.value ? `url('${e.target.value}')` : '';
                                updatedComponent.style.backgroundImage = url;
                                updateComponent(updatedComponent);
                            }}
                            placeholder="输入图片URL"
                        />
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                            const selectedImage = shiftFirstSelectedImage();
                            if (selectedImage) {
                                const updatedComponent = JSON.parse(JSON.stringify(selectedComponent));
                                if (!updatedComponent.style) {
                                    updatedComponent.style = {};
                                }

                                // 设置背景图片 - 使用相对路径
                                updatedComponent.style.backgroundImage = `url('${selectedImage.relativePath}')`;

                                // 立即设置预览URL为Blob URL
                                setPreviewUrl(`url('${selectedImage.url}')`);

                                // 更新viewBox以匹配图片尺寸
                                updatedComponent.viewBox = {
                                    ...updatedComponent.viewBox,
                                    width: selectedImage.dimensions.width,
                                    height: selectedImage.dimensions.height
                                };
                                updateComponent(updatedComponent);
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
                            style={{ backgroundImage: previewUrl || `url('${currentPath}')` }}
                        />
                    </div>
                )}
            </div>
        );
    };

    /**
     * @description 根据属性控制器类型渲染对应的控件
     * @param {PropertyControl} control - 属性控制器配置
     * @returns {JSX.Element|null} 控件的渲染结果或null
     */
    const renderPropertyControl = (control: PropertyControl) => {
        if (!selectedComponent) return null;

        // 特殊处理viewBox属性
        if (control.property === 'viewBox') {
            const viewBox = getCurrentViewBox();
            return (
                <div className="space-y-2" key={control.property}>
                    <Label>{control.label}</Label>
                    <div className="grid grid-cols-4 gap-2">
                        <Input
                            type="number"
                            value={viewBox.x?.toString() ?? ''}
                            onChange={(e) => handleViewBoxChange('x', e.target.value)}
                            placeholder="x"
                        />
                        <Input
                            type="number"
                            value={viewBox.y?.toString() ?? ''}
                            onChange={(e) => handleViewBoxChange('y', e.target.value)}
                            placeholder="y"
                        />
                        <Input
                            type="number"
                            value={viewBox.width?.toString() ?? ''}
                            onChange={(e) => handleViewBoxChange('width', e.target.value)}
                            placeholder="宽度"
                        />
                        <Input
                            type="number"
                            value={viewBox.height?.toString() ?? ''}
                            onChange={(e) => handleViewBoxChange('height', e.target.value)}
                            placeholder="高度"
                        />
                    </div>
                </div>
            );
        }

        // 特殊处理margin属性
        if (control.property === 'style.margin') {
            const margin = getCurrentMargin();
            return (
                <div className="space-y-2" key={control.property}>
                    <Label>{control.label}</Label>
                    <div className="grid grid-cols-4 gap-2">
                        {['top', 'right', 'bottom', 'left'].map((dir) => (
                            <div key={dir}>
                                <Label className="text-xs">{dir}</Label>
                                <Input
                                    type="number"
                                    value={margin[dir as keyof Margin]?.toString() ?? ''}
                                    onChange={(e) => handleMarginChange(dir as keyof Margin, e.target.value)}
                                    placeholder={dir}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        // 获取当前属性值
        const value = get(selectedComponent, control.property);

        // 根据控件类型渲染不同的控件
        switch (control.type) {
            case 'string':
                return (
                    <div className="space-y-2" key={control.property}>
                        <Label htmlFor={control.property}>{control.label}</Label>
                        <Input
                            id={control.property}
                            type="text"
                            value={value || control.defaultValue || ''}
                            onChange={(e) => handlePropertyChange(control.property, e.target.value)}
                            placeholder={control.placeholder || ''}
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
                                <SelectValue placeholder="选择选项" />
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

    /**
     * @description 获取当前选中组件类型的属性控制器
     * @returns {PropertyControl[]} 属性控制器数组
     */
    const getPropertyControls = () => {
        if (!selectedComponent) return [];
        const template = COMPONENT_TEMPLATES[selectedComponent.type as keyof typeof COMPONENT_TEMPLATES];
        return template?.propertyControls || [];
    };

    /**
     * @description 根据组件类型显示不同控制器
     * @returns {JSX.Element|null} 控制器的渲染结果或null
     */
    const renderPropertyControlsForType = () => {
        switch (selectedComponent?.type) {
            case 'svgPic':
                return renderSVGPicControls();
            default:
                return null;
        }
    };

    /**
     * @description 渲染SVG图片组件的特有控制器
     * @returns {JSX.Element} SVG图片控制器的渲染结果
     */
    const renderSVGPicControls = () => {
        const controls = getPropertyControls();
        return (
            <div className="space-y-4">
                {controls.map(control => renderPropertyControl(control))}
            </div>
        );
    };

    return (
        <div
            className={cn(
                "fixed top-[57px] right-0 bottom-0 bg-white shadow-lg transition-[width] duration-300 ease-in-out z-10",
                isParametersPanelOpen ? "w-96" : "w-12"
            )}
        >
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 left-2 h-8 w-8"
                onClick={toggleParametersPanel}
            >
                {isParametersPanelOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>

            {isParametersPanelOpen && (
                <div className="p-4 pt-12">
                    <h3 className="font-medium text-sm mb-2">参数设置</h3>
                    <ScrollArea className="h-[calc(100vh-120px)]">
                        {selectedComponent ? (
                            <div className="space-y-4">
                                <div className="text-sm">
                                    <span className="font-medium">组件ID: </span>
                                    <span>{selectedComponent.id}</span>
                                </div>
                                <div className="text-sm">
                                    <span className="font-medium">组件类型: </span>
                                    <span>{selectedComponent.type}</span>
                                </div>

                                <div className="border-t pt-4 mt-4">
                                    <h4 className="font-medium text-sm mb-3">属性</h4>
                                    <div className="space-y-4">
                                        {renderPropertyControlsForType()}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500">
                                请选择一个组件来编辑其属性
                            </div>
                        )}
                    </ScrollArea>
                </div>
            )}
        </div>
    );
}
