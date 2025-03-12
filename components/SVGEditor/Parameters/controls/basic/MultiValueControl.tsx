import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// 值字段配置接口
interface ValueField {
    key: string;  // 字段名称
    label: string; // 显示标签
    defaultValue: number; // 默认值
    min?: number; // 最小值
    max?: number; // 最大值
    step?: number; // 步长
    width?: string; // 可选的宽度覆盖
}

// 多值输入控件属性
interface MultiValueControlProps {
    value: Record<string, number>;
    onChange: (value: Record<string, number>) => void;
    label?: string;
    fields: ValueField[];
    className?: string;
    // 布局配置
    layout?: "grid" | "flex" | "stack";
    gridCols?: number; // 网格列数，为0时自动根据字段数量确定
    groupLabel?: string; // 值组标签（例如 "位置"）
}

export function MultiValueControl({
    value,
    onChange,
    label,
    fields,
    className,
    layout = "grid",
    gridCols = 0, // 0表示自动
    groupLabel
}: MultiValueControlProps) {
    // 确保值有效
    const safeValue = value ? { ...value } : {};

    // 应用默认值 - 使用字段配置中的默认值而不是当前值
    fields.forEach(field => {
        // 如果当前值不存在或为空，优先使用字段配置中的默认值
        if (safeValue[field.key] === undefined || safeValue[field.key] === null) {
            safeValue[field.key] = field.defaultValue;
        }
    });

    // 处理字段变更
    const handleFieldChange = (field: string, input: string) => {
        const numericValue = input === '' ? 0 : Number(input);

        const updatedValue = {
            ...safeValue,
            [field]: numericValue
        };

        onChange(updatedValue);
    };

    // 确定网格列数
    const columnsToUse = gridCols || (fields.length <= 2 ? fields.length : (fields.length <= 4 ? 4 : fields.length));

    // 基于布局选择合适的内容渲染
    const renderContent = () => {
        if (layout === "stack") {
            // 垂直堆叠布局
            return (
                <div className="space-y-2">
                    {fields.map((field) => (
                        <div key={field.key} className="grid grid-cols-3 gap-2 items-center">
                            <Label className="text-xs">{field.label}</Label>
                            <div className="col-span-2">
                                <Input
                                    type="number"
                                    value={safeValue[field.key]?.toString() ?? ''}
                                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                    placeholder={field.label}
                                    min={field.min}
                                    max={field.max}
                                    step={field.step}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            );
        } else if (layout === "flex") {
            // 弹性布局
            return (
                <div className="flex flex-wrap gap-2">
                    {fields.map((field) => (
                        <div key={field.key} className={field.width ? field.width : "w-24"}>
                            <Label className="text-xs">{field.label}</Label>
                            <Input
                                type="number"
                                value={safeValue[field.key]?.toString() ?? ''}
                                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                placeholder={field.label}
                                min={field.min}
                                max={field.max}
                                step={field.step}
                            />
                        </div>
                    ))}
                </div>
            );
        } else {
            // 默认网格布局
            return (
                <div className={`grid grid-cols-${columnsToUse} gap-2`}>
                    {fields.map((field) => (
                        <div key={field.key}>
                            <Label className="text-xs">{field.label}</Label>
                            <Input
                                type="number"
                                value={safeValue[field.key]?.toString() ?? ''}
                                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                placeholder={field.label}
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
        <div className={`space-y-2 ${className || ''}`}>
            {/* 主标签 */}
            {label && <Label>{label}</Label>}

            {/* 子组标签 (可选) */}
            {groupLabel && <div className="text-xs text-muted-foreground mb-1">{groupLabel}</div>}

            {/* 渲染内容 */}
            {renderContent()}
        </div>
    );
} 