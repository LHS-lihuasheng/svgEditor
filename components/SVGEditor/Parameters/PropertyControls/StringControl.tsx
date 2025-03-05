import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StringControlProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function StringControl({
    label,
    value,
    onChange,
    placeholder
}: StringControlProps) {
    return (
        <div className="space-y-2">
            <Label htmlFor={`string-${label}`}>{label}</Label>
            <Input
                id={`string-${label}`}
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    );
} 