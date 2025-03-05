"use client"

import { useEditor } from '@/contexts/EditorContext/index';
import type { BaseComponent } from "@/types/core";
import { ViewBoxControl } from '../PropertyControls/ViewBoxControl';
import { MarginControl } from '../PropertyControls/MarginControl';
import { SelectControl } from '../PropertyControls/SelectControl';
import { ImageControl } from '../PropertyControls/ImageControl';
import get from "lodash/get";
import set from "lodash/set";

interface SVGPicEditorProps {
    component: BaseComponent;
}

export function SVGPicEditor({ component }: SVGPicEditorProps) {
    const { updateComponent } = useEditor();

    // 处理属性变更
    const handlePropertyChange = (property: string, value: any) => {
        // 创建组件的副本并更新属性
        const updatedComponent = JSON.parse(JSON.stringify(component));
        set(updatedComponent, property, value);
        updateComponent(updatedComponent);
    };

    // 处理viewBox变更
    const handleViewBoxChange = (viewBox: any) => {
        handlePropertyChange('viewBox', viewBox);
    };

    // 处理margin变更
    const handleMarginChange = (margin: any) => {
        handlePropertyChange('style.margin', margin);
    };

    return (
        <div className="space-y-4">
            {/* 背景图片 */}
            <ImageControl
                label="背景图片"
                value={get(component, 'style.backgroundImage') || ''}
                onChange={(value) => handlePropertyChange('style.backgroundImage', value)}
            />

            {/* 视图框 */}
            <ViewBoxControl
                value={component.viewBox || {}}
                onChange={handleViewBoxChange}
            />

            {/* 边距 */}
            <MarginControl
                value={get(component, 'style.margin') || {}}
                onChange={handleMarginChange}
            />

            {/* 背景大小 */}
            <SelectControl
                label="背景大小"
                value={get(component, 'style.backgroundSize') || 'cover'}
                onChange={(value) => handlePropertyChange('style.backgroundSize', value)}
                options={[
                    { label: '覆盖', value: 'cover' },
                    { label: '包含', value: 'contain' },
                    { label: '100%', value: '100% 100%' }
                ]}
            />

            {/* 背景重复 */}
            <SelectControl
                label="背景重复"
                value={get(component, 'style.backgroundRepeat') || 'no-repeat'}
                onChange={(value) => handlePropertyChange('style.backgroundRepeat', value)}
                options={[
                    { label: '不重复', value: 'no-repeat' },
                    { label: '重复', value: 'repeat' },
                    { label: '水平重复', value: 'repeat-x' },
                    { label: '垂直重复', value: 'repeat-y' }
                ]}
            />
        </div>
    );
} 