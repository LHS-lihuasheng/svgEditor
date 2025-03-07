"use client"

import { useEditor } from '@/contexts/EditorContext/index';
import type { BaseComponent } from "@/types/core";
import { NumberControl } from '../PropertyControls/NumberControl';
import { StringControl } from '../PropertyControls/StringControl';
import { ColorControl } from '../PropertyControls/ColorControl';
import { OpacityControl } from '../PropertyControls/OpacityControl';
import get from "lodash/get";
import set from "lodash/set";
import { useEffect, useState } from 'react';
import { PropertyManager } from '../PropertyManager';
import { DynamicPropertyControl } from '../PropertyControls/DynamicPropertyControl';

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
    const handleUpdateProperty = (path: string, value: any) => {
        const updatedComponent = JSON.parse(JSON.stringify(localComponent));
        set(updatedComponent, path, value);
        setLocalComponent(updatedComponent);
        updateComponent(updatedComponent);
    };

    const handleAddProperty = (property: PropertyControl) => {
        const path = property.property.split('.');
        const category = path[0]; // style 或 attributes
        const key = path[1];

        // 创建本地组件的副本并更新属性
        const updatedComponent = JSON.parse(JSON.stringify(localComponent));

        // 确保对应类别存在
        if (!updatedComponent[category]) {
            updatedComponent[category] = {};
        }

        // 设置属性值为默认值
        updatedComponent[category][key] = property.defaultValue;

        // 更新本地状态和父组件
        setLocalComponent(updatedComponent);
        updateComponent(updatedComponent);
    };

    const handleRemoveProperty = (propertyPath: string) => {
        const updatedComponent = JSON.parse(JSON.stringify(localComponent));
        const [category, key] = propertyPath.split('.');

        if (updatedComponent[category] && key in updatedComponent[category]) {
            delete updatedComponent[category][key];
        }

        setLocalComponent(updatedComponent);
        updateComponent(updatedComponent);
    };

    // 获取该组件类型的模板
    const template = COMPONENT_TEMPLATES[component.type];

    // 获取固定属性（只渲染这些）
    const fixedPropertyControls = template.propertyControls.filter(prop => prop.isFixed);

    return (
        <div className="space-y-4">
            {/* 只渲染固定属性 */}
            {fixedPropertyControls.map(prop => {
                return (
                    <DynamicPropertyControl
                        key={prop.property}
                        property={prop}
                        value={get(localComponent, prop.property)}
                        onChange={(value) => handleUpdateProperty(prop.property, value)}
                    />
                );
            })}

            {/* PropertyManager处理所有非固定属性 */}
            <PropertyManager
                component={localComponent}
                onAddProperty={handleAddProperty}
                onRemoveProperty={handleRemoveProperty}
                onUpdateProperty={handleUpdateProperty}
            />
        </div>
    );
} 