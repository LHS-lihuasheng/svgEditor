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
    fields?: ValueField[];  // 修改为可选
    className?: string;
    layout?: "grid" | "flex" | "stack";
    gridCols?: number; // 网格列数，为0时自动根据字段数量确定
    groupLabel?: string; // 值组标签（例如 "位置"）
}

export function MultiValueControl({
    value,
    onChange,
    label,
    fields = [],  // 提供默认空数组
    className = "",
    layout = "grid",
    gridCols = 0, // 0表示自动
    groupLabel
}: MultiValueControlProps) {
    const safeValue = value || {};

    // 确保fields不为undefined
    if (!fields || !Array.isArray(fields)) {
        return <div className="text-red-500 text-sm">错误：未提供字段配置</div>
    }

    fields.forEach(field => {
        if (safeValue[field.key] === undefined) {
            safeValue[field.key] = field.defaultValue;
        }
    });

    const handleChange = (field: string, input: string) => {
        onChange({
            ...safeValue,
            [field]: input === '' ? 0 : Number(input)
        });
    };

    const columnsToUse = gridCols || Math.min(4, Math.max(2, fields.length));

    const renderFields = () => {
        if (layout === "stack") {
            return (
                <div className="space-y-2">
                    {fields.map((field) => (
                        <div key={field.key} className="grid grid-cols-3 gap-2 items-center">
                            <Label className="text-xs">{field.label}</Label>
                            <div className="col-span-2">
                                <Input
                                    type="number"
                                    value={safeValue[field.key]?.toString() ?? ''}
                                    onChange={(e) => handleChange(field.key, e.target.value)}
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
            return (
                <div className="flex flex-wrap gap-2">
                    {fields.map((field) => (
                        <div key={field.key} className={field.width || "w-24"}>
                            <Label className="text-xs">{field.label}</Label>
                            <Input
                                type="number"
                                value={safeValue[field.key]?.toString() ?? ''}
                                onChange={(e) => handleChange(field.key, e.target.value)}
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
                    {fields.map((field) => (
                        <div key={field.key}>
                            <Label className="text-xs">{field.label}</Label>
                            <Input
                                type="number"
                                value={safeValue[field.key]?.toString() ?? ''}
                                onChange={(e) => handleChange(field.key, e.target.value)}
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
        <div className={`space-y-2 ${className}`}>
            {/* 主标签 */}
            {label && <Label>{label}</Label>}

            {/* 子组标签 (可选) */}
            {groupLabel && <div className="text-xs text-muted-foreground mb-1">{groupLabel}</div>}

            {/* 渲染内容 */}
            {renderFields()}
        </div>
    );
} 