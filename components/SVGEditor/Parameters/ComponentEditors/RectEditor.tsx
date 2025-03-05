"use client"

import { useEditor } from '@/contexts/EditorContext/index';
import type { BaseComponent } from "@/types/core";
import { NumberControl } from '../PropertyControls/NumberControl';
import { SelectControl } from '../PropertyControls/SelectControl';
import { ColorControl } from '../PropertyControls/ColorControl';
import get from "lodash/get";
import set from "lodash/set";
import { useEffect, useState } from 'react';

interface RectEditorProps {
    component: BaseComponent;
}

export function RectEditor({ component }: RectEditorProps) {
    // 使用本地状态并确保随组件更新
    const [localComponent, setLocalComponent] = useState<BaseComponent>(component);
    const { updateComponent } = useEditor();

    // 当外部组件变化时，更新本地状态
    useEffect(() => {
        setLocalComponent(component);
    }, [component]);

    // 处理属性变更
    const handlePropertyChange = (property: string, value: any) => {
        // 创建本地组件的副本并更新属性
        const updatedComponent = JSON.parse(JSON.stringify(localComponent));
        set(updatedComponent, property, value);

        // 更新本地状态和父组件
        setLocalComponent(updatedComponent);
        updateComponent(updatedComponent);
    };

    return (
        <div className="space-y-4">
            {/* 位置属性 */}
            <SelectControl
                label="定位方式"
                value={get(localComponent, 'style.position') || 'relative'}
                onChange={(value) => handlePropertyChange('style.position', value)}
                options={[
                    { label: '相对定位', value: 'relative' },
                    { label: '绝对定位', value: 'absolute' }
                ]}
            />

            {/* 坐标属性 */}
            <div className="grid grid-cols-2 gap-3">
                <NumberControl
                    label="X坐标"
                    value={get(localComponent, 'style.left') || 0}
                    onChange={(value) => handlePropertyChange('style.left', value)}
                    placeholder="X坐标"
                />
                <NumberControl
                    label="Y坐标"
                    value={get(localComponent, 'style.top') || 0}
                    onChange={(value) => handlePropertyChange('style.top', value)}
                    placeholder="Y坐标"
                />
            </div>

            {/* 尺寸属性 */}
            <div className="grid grid-cols-2 gap-3">
                <NumberControl
                    label="宽度"
                    value={get(localComponent, 'style.width') || 100}
                    onChange={(value) => handlePropertyChange('style.width', value)}
                />
                <NumberControl
                    label="高度"
                    value={get(localComponent, 'style.height') || 100}
                    onChange={(value) => handlePropertyChange('style.height', value)}
                />
            </div>

            {/* 背景颜色 */}
            <ColorControl
                label="背景颜色"
                value={get(localComponent, 'style.backgroundColor') || '#3b82f6'}
                onChange={(value) => handlePropertyChange('style.backgroundColor', value)}
            />

            {/* 圆角属性 */}
            <div className="grid grid-cols-2 gap-3">
                <NumberControl
                    label="圆角X"
                    value={get(localComponent, 'attributes.rx') || 0}
                    onChange={(value) => handlePropertyChange('attributes.rx', value)}
                    min={0}
                />
                <NumberControl
                    label="圆角Y"
                    value={get(localComponent, 'attributes.ry') || 0}
                    onChange={(value) => handlePropertyChange('attributes.ry', value)}
                    min={0}
                />
            </div>

            {/* 边框属性 */}
            <ColorControl
                label="边框颜色"
                value={get(localComponent, 'style.borderColor') || ''}
                onChange={(value) => handlePropertyChange('style.borderColor', value)}
            />

            <NumberControl
                label="边框宽度"
                value={get(localComponent, 'style.borderWidth') || 0}
                onChange={(value) => handlePropertyChange('style.borderWidth', value)}
                min={0}
            />
        </div>
    );
} 