"use client"

import { useRef, useEffect, useState } from "react"
import { usePanel } from "@/contexts/PanelContext"
import { useCode } from '@/contexts/CodeContext'
import { useAssets } from '@/contexts/AssetContext'
import { generatePreviewHTML } from "@/utils/assetUtils"

export function PreviewTab() {
    const { isMenuBarOpen } = usePanel()
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
    const { code } = useCode()
    const { findImageByPath } = useAssets()
    const [isIframeInitialized, setIsIframeInitialized] = useState(false)

    const ASPECT_RATIO = 9 / 16

    const prepareCodeForPreview = (svgCode: string): string => {
        return svgCode.replace(
            /background-image:\s*url\("([^"]+)"\)/g,
            'background-image: url(\'$1\')'
        );
    };

    const processImagePaths = (svgCode: string): string => {
        const codeWithSingleQuotes = prepareCodeForPreview(svgCode);

        return codeWithSingleQuotes.replace(
            /background-image:\s*url\('([^']+)'\)/g,
            (match, path) => {
                const cleanPath = path.trim();
                const imageAsset = findImageByPath(cleanPath);

                if (imageAsset) {
                    return `background-image: url('${imageAsset.url}')`;
                }
                return match;
            }
        );
    };

    // 更新iframe内容
    const updatePreview = () => {
        if (iframeRef.current) {
            const iframe = iframeRef.current;
            const iframeWindow = iframe.contentWindow;
            const doc = iframe.contentDocument || iframeWindow?.document;

            if (doc) {
                try {
                    if (!isIframeInitialized) {
                        // 首次初始化整个iframe内容
                        doc.open();
                        doc.write(generatePreviewHTML(code, findImageByPath));
                        doc.close();
                        setIsIframeInitialized(true);
                    } else {
                        // 保存当前滚动位置
                        const scrollContainer = doc.querySelector('.svg-container');
                        const scrollTop = scrollContainer ? scrollContainer.scrollTop : 0;

                        // 仅更新SVG内容部分
                        const svgContainer = doc.querySelector('.svg-container');
                        if (svgContainer) {
                            svgContainer.innerHTML = processImagePaths(code);

                            // 恢复滚动位置
                            if (scrollContainer) {
                                scrollContainer.scrollTop = scrollTop;
                            }
                        }
                    }
                } catch (error) {
                    console.error("更新预览时出错:", error);
                }
            }
        }
    };

    // 计算容器尺寸
    const calculateDimensions = () => {
        if (!containerRef.current) return;
        const availableWidth = containerRef.current.clientWidth - 40;
        setContainerSize({
            width: availableWidth,
            height: availableWidth * ASPECT_RATIO
        });
    };

    // 窗口尺寸变化监听
    useEffect(() => {
        window.addEventListener('resize', calculateDimensions);
        return () => window.removeEventListener('resize', calculateDimensions);
    }, []);

    // 侧边栏状态变化处理
    useEffect(() => {
        const timer = setTimeout(calculateDimensions, 300);
        return () => clearTimeout(timer);
    }, [isMenuBarOpen]);

    // 代码变化时更新预览
    useEffect(() => {
        updatePreview();
    }, [code]);

    // 组件挂载时初始化
    useEffect(() => {
        calculateDimensions();
        updatePreview();
    }, []);

    // 组件卸载时重置初始化状态
    useEffect(() => {
        return () => {
            setIsIframeInitialized(false);
        };
    }, []);

    return (
        <div className="p-4 flex flex-col h-full">
            <div className="mb-4 pt-2">
                <h3 className="text-lg font-semibold">效果预览</h3>
            </div>

            <div
                ref={containerRef}
                className="flex-1 overflow-auto bg-gray-100 rounded-lg p-4"
            >
                <div
                    className="phone-container mx-auto bg-white shadow-lg overflow-hidden relative"
                    style={{
                        width: containerSize.width,
                        height: containerSize.height,
                        minHeight: 500,
                        marginTop: 16,
                        cursor: 'default',
                        userSelect: 'none',
                    }}
                >
                    <iframe
                        ref={iframeRef}
                        title="SVG Preview"
                        style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                        }}
                    />
                </div>
            </div>
        </div>
    );
} 