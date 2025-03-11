import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Margin {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
}

interface MarginControlProps {
    value: Margin;
    onChange: (margin: Margin) => void;
    label?: string;
}

export function MarginControl({ value, onChange, label = "边距" }: MarginControlProps) {
    // 确保值有效
    const margin = {
        top: value?.top ?? 0,
        right: value?.right ?? 0,
        bottom: value?.bottom ?? 0,
        left: value?.left ?? 0,
        ...value
    };

    // 处理字段变更
    const handleFieldChange = (field: keyof Margin, value: string) => {
        const numericValue = value === '' ? undefined : Number(value);

        onChange({
            ...margin,
            [field]: numericValue
        });
    };

    return (
        <div className="space-y-2">
            <div className="grid grid-cols-4 gap-2">
                {['top', 'right', 'bottom', 'left'].map((dir) => (
                    <div key={dir}>
                        <Label className="text-xs">{dir}</Label>
                        <Input
                            type="number"
                            value={margin[dir as keyof Margin]?.toString() ?? ''}
                            onChange={(e) => handleFieldChange(dir as keyof Margin, e.target.value)}
                            placeholder={dir}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
} 