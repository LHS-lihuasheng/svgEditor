import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ColorControlProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
}

export function ColorControl({
    label,
    value,
    onChange
}: ColorControlProps) {
    return (
        <div className="space-y-2">
            <Label htmlFor={`color-${label}`}>{label}</Label>
            <div className="flex items-center gap-2">
                <div
                    className="w-8 h-8 rounded-md border"
                    style={{ backgroundColor: value || '#ffffff' }}
                />
                <Input
                    id={`color-${label}`}
                    type="color"
                    value={value || '#ffffff'}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full"
                />
            </div>
        </div>
    );
} 