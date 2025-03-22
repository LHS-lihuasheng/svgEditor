"use client"

import { useMemo, useState, useCallback } from "react";
import { useEditor } from '@/contexts/EditorContext';
import { COMPONENT_TEMPLATES } from '@/types/core/atomicComponent';
import { COMPONENT_TYPE_TO_PROPERTY } from '@/types/core/property';
import type { BaseComponent, PropertyControl, PropertyControlType } from '@/types/core';
import _ from 'lodash';

// 属性项接口定义
export interface PropertyItem {
    label: string;
    path: string;
    control: PropertyControl;
    category?: string;
}

// 属性管理器返回接口
export interface PropertyManagerResult {
    selectedProperty: string;
    setSelectedProperty: (property: string) => void;
    updateProperty: (path: string, value: any) => void;
    addProperty: (propertyKey: string) => void;
    removeProperty: (path: string) => void;
    fixedProperties: PropertyItem[];
    existingProperties: PropertyItem[];
    addableProperties: PropertyControl[];
}

/**
 * 从组件获取属性值
 */
export function getPropertyValue(component: BaseComponent | null, path: string): any {
    if (!component) return undefined;
    return _.get(component, path);
}

/**
 * 对属性按分组整理
 */
export function groupProperties(properties: PropertyItem[]): Record<string, PropertyItem[]> {
    return {
        '组件属性': _.sortBy(properties, 'label')
    };
}

/**
 * 属性管理器Hook - 统一管理属性的获取、添加、删除和更新
 */
export function useProperties(excludePaths: string[] = []): PropertyManagerResult {
    const { selectedComponent, updateComponent, updateComponentStyle, updateComponentAttribute } = useEditor();
    const [selectedProperty, setSelectedProperty] = useState<string>("");

    // 组件未选中情况的默认返回值
    if (!selectedComponent) {
        return {
            selectedProperty,
            setSelectedProperty,
            updateProperty: _.noop,
            addProperty: _.noop,
            removeProperty: _.noop,
            fixedProperties: [],
            existingProperties: [],
            addableProperties: []
        };
    }

    // 获取组件模板和属性仓库
    const template = useMemo(() => (
        COMPONENT_TEMPLATES[selectedComponent.type] || {}
    ), [selectedComponent.type]);

    const propertyStorage = useMemo(() => (
        COMPONENT_TYPE_TO_PROPERTY[selectedComponent.type] || {}
    ), [selectedComponent.type]);

    // 获取固定属性路径集合
    const fixedPropertyPaths = useMemo(() => {
        return new Set(
            Object.values(propertyStorage)
                .filter(control => control.isFixed)
                .map(control => control.property)
        );
    }, [propertyStorage]);

    // 更新属性值
    const updateProperty = useCallback((path: string, value: any) => {
        if (!selectedComponent || _.isEmpty(path)) return;

        // 统一的路径解析逻辑
        const [rootName, ...subPaths] = path.split('.');
        const remainingPath = subPaths.join('.');

        // 根据路径类型分发更新
        if (rootName === 'style' && subPaths.length > 0) {
            updateComponentStyle(selectedComponent.id, remainingPath, value);
        }
        else if (rootName === 'attributes' && subPaths.length > 0) {
            updateComponentAttribute(selectedComponent.id, remainingPath, value);
        }
        else {
            // 处理普通属性或嵌套属性
            const updatedComponent = { ...selectedComponent };
            _.set(updatedComponent, path, value);
            updateComponent(updatedComponent);
        }
    }, [selectedComponent, updateComponent, updateComponentStyle, updateComponentAttribute]);

    // 添加属性
    const addProperty = useCallback((propertyKey: string) => {
        if (_.isEmpty(propertyKey)) return;

        const control = Object.values(propertyStorage).find(
            (control: PropertyControl) => control.property === propertyKey
        );

        if (control) {
            updateProperty(control.property, control.defaultValue ?? null);
            setSelectedProperty("");
        } else {
            console.error(`属性 "${propertyKey}" 在当前组件类型的属性仓库中未定义`);
        }
    }, [propertyStorage, updateProperty, setSelectedProperty]);

    // 移除属性
    const removeProperty = useCallback((path: string) => {
        if (!selectedComponent || _.isEmpty(path) || fixedPropertyPaths.has(path)) return;

        const parts = path.includes('.') ? path.split('.') : [path];

        if (parts[0] === 'style' && parts.length === 2) {
            const newStyles = { ...selectedComponent.style };
            delete newStyles[parts[1]];
            updateComponent({
                ...selectedComponent,
                style: newStyles
            });
        }
        else if (parts[0] === 'attributes' && parts.length === 2) {
            const newAttributes = { ...selectedComponent.attributes };
            delete newAttributes[parts[1]];
            updateComponent({
                ...selectedComponent,
                attributes: newAttributes
            });
        }
        else {
            const newComponent = { ...selectedComponent };
            if (parts.length === 1) {
                delete newComponent[parts[0]];
            } else {
                let current = newComponent;
                for (let i = 0; i < parts.length - 1; i++) {
                    if (!current[parts[i]]) return;
                    current = current[parts[i]];
                }
                delete current[parts[parts.length - 1]];
            }
            updateComponent(newComponent);
        }
    }, [selectedComponent, updateComponent, fixedPropertyPaths]);

    // 查找控件定义
    const findControlDefinition = useCallback((path: string): PropertyControl | undefined => {
        return Object.values(propertyStorage).find(control => control.property === path) ||
            template?.propertyControls?.find(control => control.property === path);
    }, [propertyStorage, template]);

    // 推断属性类型
    const inferPropertyType = useCallback((key: string, value: any): PropertyControlType => {
        if (_.isNumber(value)) return 'number';
        if (_.isBoolean(value)) return 'boolean';
        if (key.includes('color') || key.includes('fill') || key.includes('stroke')) return 'color';
        return 'string';
    }, []);

    // 创建PropertyItem辅助函数
    const createPropertyItem = useCallback((path: string, key: string, value: any): PropertyItem => {
        const control = findControlDefinition(path);

        if (control) {
            return {
                label: control.label,
                path,
                control
            };
        }

        // 如果找不到预定义控件，创建一个基本控件
        const type = inferPropertyType(key, value);

        return {
            label: _.startCase(key),
            path,
            control: {
                property: path,
                label: _.startCase(key),
                type,
                defaultValue: value
            }
        };
    }, [findControlDefinition, inferPropertyType]);

    // 处理已存在的属性和可添加的属性
    const { fixedProperties, existingProperties, addableProperties } = useMemo(() => {
        const fixedProps: PropertyItem[] = [];
        const existingProps: PropertyItem[] = [];
        const existingPaths = new Set<string>();

        // 1. 从仓库中收集固定属性
        Object.values(propertyStorage).forEach(control => {
            if (control.isFixed) {
                fixedProps.push({
                    label: control.label,
                    path: control.property,
                    control
                });
                existingPaths.add(control.property);
            }
        });

        // 2. 收集组件中存在的非固定属性
        function collectProps(obj: any, prefix: string) {
            if (!obj) return;

            Object.entries(obj).forEach(([key, value]) => {
                const path = prefix ? `${prefix}.${key}` : key;
                if (!existingPaths.has(path) && !excludePaths.includes(path)) {
                    existingProps.push(createPropertyItem(path, key, value));
                    existingPaths.add(path);
                }
            });
        }

        // 收集style属性
        collectProps(selectedComponent.style, 'style');

        // 收集attributes属性
        collectProps(selectedComponent.attributes, 'attributes');

        // 3. 计算可添加的属性
        const filteredAddableProps = Object.values(propertyStorage)
            .filter(control => !control.isFixed && !existingPaths.has(control.property) && !excludePaths.includes(control.property))
            .sort((a, b) => a.label.localeCompare(b.label));

        return {
            fixedProperties: fixedProps.sort((a, b) => a.label.localeCompare(b.label)),
            existingProperties: existingProps.sort((a, b) => a.label.localeCompare(b.label)),
            addableProperties: filteredAddableProps
        };
    }, [selectedComponent, propertyStorage, createPropertyItem, excludePaths]);

    return {
        selectedProperty,
        setSelectedProperty,
        updateProperty,
        addProperty,
        removeProperty,
        fixedProperties,
        existingProperties,
        addableProperties
    };
} 