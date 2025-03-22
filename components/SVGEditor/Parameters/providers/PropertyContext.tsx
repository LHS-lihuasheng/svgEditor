"use client"

import { createContext, useContext, ReactNode, useCallback } from 'react';
import { useEditor } from '@/contexts/EditorContext';
import type { BaseComponent } from '@/types/core';
import { getPropertyValue } from '../hooks/useProperties';

// 属性上下文接口
interface PropertyContextType {
    component: BaseComponent | null;
    updateProperty: (path: string, value: any) => void;
    getPropertyValue: (path: string) => any;
}

// 创建上下文
const PropertyContext = createContext<PropertyContextType>({
    component: null,
    updateProperty: () => { },
    getPropertyValue: () => undefined
});

export function PropertyProvider({ children }: { children: ReactNode }) {
    const { selectedComponent, updateComponent, updateComponentStyle, updateComponentAttribute } = useEditor();

    // 统一的属性更新方法
    const updateProperty = useCallback((path: string, value: any) => {
        if (!selectedComponent) return;

        // 支持点号路径或直接属性
        const parts = path.includes('.') ? path.split('.') : [path];

        if (parts[0] === 'style' && parts.length === 2) {
            updateComponentStyle(selectedComponent.id, parts[1], value);
        }
        else if (parts[0] === 'attributes' && parts.length === 2) {
            updateComponentAttribute(selectedComponent.id, parts[1], value);
        }
        else {
            // 处理其他属性或嵌套路径
            const updatedComponent = { ...selectedComponent };

            if (parts.length === 1) {
                updatedComponent[parts[0]] = value;
            } else {
                let current = updatedComponent;
                for (let i = 0; i < parts.length - 1; i++) {
                    if (!current[parts[i]]) current[parts[i]] = {};
                    current = current[parts[i]];
                }
                current[parts[parts.length - 1]] = value;
            }

            updateComponent(updatedComponent);
        }
    }, [selectedComponent, updateComponent, updateComponentStyle, updateComponentAttribute]);

    // 获取属性值的帮助方法
    const getComponentPropertyValue = useCallback((path: string) => {
        return getPropertyValue(selectedComponent, path);
    }, [selectedComponent]);

    return (
        <PropertyContext.Provider
            value={{
                component: selectedComponent,
                updateProperty,
                getPropertyValue: getComponentPropertyValue
            }}
        >
            {children}
        </PropertyContext.Provider>
    );
}

// 使用属性上下文的钩子
export function usePropertyContext() {
    return useContext(PropertyContext);
} 