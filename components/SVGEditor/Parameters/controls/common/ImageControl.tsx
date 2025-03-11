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

    // 从CSS url()格式中提取路径
    const extractPath = (cssUrl: string): string => {
        return cssUrl?.replace(/url\(['"](.+)['"]\)/, '$1') || '';
    };

    // 当组件或当前值变化时，更新预览URL
    useEffect(() => {
        const path = extractPath(value);
        if (!path) {
            setPreviewUrl('');
            return;
        }

        // 尝试从资产库找到对应的图片
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
                        onChange={(e) => {
                            const url = e.target.value ? `url('${e.target.value}')` : '';
                            onChange(url);
                        }}
                        placeholder="输入图片URL"
                    />
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                        const selectedImage = shiftFirstSelectedImage();
                        if (selectedImage) {
                            const url = `url('${selectedImage.relativePath}')`;
                            onChange(url);
                            setPreviewUrl(selectedImage.url);
                        }
                    }}
                >
                    <ImageIcon className="h-4 w-4" />
                </Button>
            </div>
            {value && (
                <div className="mt-2 relative w-full h-20 bg-gray-100 rounded-md overflow-hidden">
                    <div
                        className="absolute inset-0 bg-contain bg-center bg-no-repeat"
                        style={{ backgroundImage: previewUrl ? `url('${previewUrl}')` : value }}
                    />
                </div>
            )}
        </div>
    );
} 