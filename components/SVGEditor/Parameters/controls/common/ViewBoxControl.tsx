import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ViewBox } from "@/types/core";

interface ViewBoxControlProps {
    value: ViewBox;
    onChange: (viewBox: ViewBox) => void;
    label?: string;
}

export function ViewBoxControl({ value, onChange, label = "视图框" }: ViewBoxControlProps) {
    // 确保值有效
    const viewBox = {
        ...{ x: 0, y: 0, width: 0, height: 0 },
        ...value
    };

    // 处理字段变更
    const handleFieldChange = (field: keyof ViewBox, value: string) => {
        const numericValue = value === '' ? undefined : Number(value);

        onChange({
            ...viewBox,
            [field]: numericValue
        });
    };

    return (
        <div className="space-y-2">
            <Label>viewBox</Label>
            <div className="grid grid-cols-4 gap-2">
                <Input
                    type="number"
                    value={viewBox.x?.toString() ?? ''}
                    onChange={(e) => handleFieldChange('x', e.target.value)}
                    placeholder="x"
                />
                <Input
                    type="number"
                    value={viewBox.y?.toString() ?? ''}
                    onChange={(e) => handleFieldChange('y', e.target.value)}
                    placeholder="y"
                />
                <Input
                    type="number"
                    value={viewBox.width?.toString() ?? ''}
                    onChange={(e) => handleFieldChange('width', e.target.value)}
                    placeholder="宽度"
                />
                <Input
                    type="number"
                    value={viewBox.height?.toString() ?? ''}
                    onChange={(e) => handleFieldChange('height', e.target.value)}
                    placeholder="高度"
                />
            </div>
        </div>
    );
} 