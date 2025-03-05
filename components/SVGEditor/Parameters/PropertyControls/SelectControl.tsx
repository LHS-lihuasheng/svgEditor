import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SelectOption {
    label: string;
    value: string;
}

interface SelectControlProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
}

export function SelectControl({
    label,
    value,
    onChange,
    options
}: SelectControlProps) {
    return (
        <div className="space-y-2">
            <Label htmlFor={`select-${label}`}>{label}</Label>
            <Select
                value={value || ''}
                onValueChange={onChange}
            >
                <SelectTrigger id={`select-${label}`}>
                    <SelectValue placeholder="选择选项" />
                </SelectTrigger>
                <SelectContent>
                    {options.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
} 