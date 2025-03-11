import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

interface NumberControlProps {
    label: string;
    value: number | string;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    placeholder?: string;
}

export function NumberControl({
    label,
    value,
    onChange,
    min,
    max,
    step = 1,
    placeholder
}: NumberControlProps) {
    // 内部状态，用于控制输入值
    const [inputValue, setInputValue] = useState<string | number>(value ?? '');

    // 当外部value变化时，更新内部状态
    useEffect(() => {
        setInputValue(value ?? '');
    }, [value]);

    // 格式化显示值
    const displayValue = inputValue === undefined || inputValue === '' ? '' :
        typeof inputValue === 'string' && inputValue.trim() === '' ? '' :
            typeof inputValue === 'string' ? inputValue : inputValue;

    // 处理更新
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);

        // 转换为数字并通知父组件
        const numericValue = newValue === '' ? undefined : parseFloat(newValue);
        onChange(numericValue as number);
    };

    return (
        <div className="space-y-2">
            <Input
                id={`number-${label}`}
                type="number"
                min={min}
                max={max}
                step={step}
                value={displayValue}
                onChange={handleChange}
                placeholder={placeholder}
            />
        </div>
    );
} 