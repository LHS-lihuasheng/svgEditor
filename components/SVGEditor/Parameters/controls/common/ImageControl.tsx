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

        // 单引号格式
        const singleQuoteMatch = cssUrl.match(/url\('([^']+)'\)/);
        if (singleQuoteMatch) return singleQuoteMatch[1];

        // 双引号格式
        const doubleQuoteMatch = cssUrl.match(/url\("([^"]+)"\)/);
        if (doubleQuoteMatch) return doubleQuoteMatch[1];

        // 无引号格式
        const noQuoteMatch = cssUrl.match(/url\(([^'"]+)\)/);
        if (noQuoteMatch) return noQuoteMatch[1];

        return cssUrl;
    };

    // 输入框变化处理
    const handleInputChange = (e) => {
        onChange(e.target.value); // 直接存储路径，不添加url()格式
    };

    // 选择图片按钮处理
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
        if (imageAsset) {
            setPreviewUrl(imageAsset.url);
        } else if (path) {
            setPreviewUrl(path);
        } else {
            setPreviewUrl('');
        }
    }, [value, findImageByPath]);

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <div className="flex-1">
                    <Input
                        id={`image-${label}`}
                        value={extractPath(value)}
                        onChange={handleInputChange}
                        placeholder="输入图片URL"
                    />
                </div>
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