import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";
import { useAssets } from "@/contexts/AssetContext";

interface ImageControlProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
}

export function ImageControl({
    label,
    value,
    onChange
}: ImageControlProps) {
    const { shiftFirstSelectedImage, findImageByPath } = useAssets();
    const [previewUrl, setPreviewUrl] = useState<string>('');

    // 提取路径，支持不同引号格式
    const extractPath = (cssUrl: string): string => {
        if (!cssUrl) return '';

        const patterns = [
            /url\('([^']+)'\)/,  // 单引号
            /url\("([^"]+)"\)/,  // 双引号
            /url\(([^'"]+)\)/    // 无引号
        ];

        for (const pattern of patterns) {
            const match = cssUrl.match(pattern);
            if (match) return match[1];
        }

        return cssUrl;
    };

    // 处理图片选择
    const handleSelectImage = () => {
        const selectedImage = shiftFirstSelectedImage();
        if (selectedImage) {
            onChange(selectedImage.relativePath);
            setPreviewUrl(selectedImage.url);
        }
    };

    // 更新预览URL
    useEffect(() => {
        const path = extractPath(value);
        if (!path) {
            setPreviewUrl('');
            return;
        }

        const imageAsset = findImageByPath?.(path);
        setPreviewUrl(imageAsset?.url || path);
    }, [value, findImageByPath]);

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <Input
                    value={extractPath(value)}
                    onChange={e => onChange(e.target.value)}
                    placeholder="输入图片URL"
                />
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleSelectImage}
                >
                    <ImageIcon className="h-4 w-4" />
                </Button>
            </div>
            {value && (
                <div className="mt-2 relative w-full h-20 bg-gray-100 rounded-md overflow-hidden">
                    <div
                        className="absolute inset-0 bg-contain bg-center bg-no-repeat"
                        style={{
                            backgroundImage: previewUrl ? `url('${previewUrl}')` : (value ? `url('${value}')` : 'none')
                        }}
                    />
                </div>
            )}
        </div>
    );
} 