"use client"

import { useMemo, useState, useCallback } from "react";
import { useEditor } from '@/contexts/EditorContext';
import { COMPONENT_TEMPLATES } from '@/types/templateStorage';
import { ALL_PROPERTY_STORAGE } from '@/types/propertyStorage';
import type { BaseComponent, propertyConfig, PropertyControlType, BaseComponentTemplate, category } from '@/types';
import _ from 'lodash';

// 属性项接口定义
export interface PropertyItem {
    path: string;
    config: propertyConfig;
    isFixed: boolean;
}

// 属性管理器返回接口
export interface PropertyManagerResult {
    selectedProperty: string;
    setSelectedProperty: (propertyConfig: string) => void;
    updateProperty: (path: string, value: any) => void;
    addProperty: (category: 'attributes' | 'style', propertyKey: string) => void;
    removeProperty: (path: string) => void;
    existingProperties: PropertyItem[];
    addableProperties: PropertyItem[];
}

/**
 * 获取组件属性值
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
 * 解析属性路径，返回根路径和子路径
 */
function parsePropertyPath(path: string): { rootName: string, remainingPath: string } {
    const [rootName, ...subPaths] = path.split('.');
    return {
        rootName,
        remainingPath: subPaths.join('.')
    };
}

/**
 * 属性管理器Hook - 统一管理属性的获取、添加、删除和更新
 */
export function useProperties(excludePaths: string[] = []): PropertyManagerResult {
    const { selectedComponent, updateComponent, updateComponentStyle, updateComponentAttribute } = useEditor();
    const [selectedProperty, setSelectedProperty] = useState<string>("");

    const template = useMemo(() => {
        if (!selectedComponent) return {} as BaseComponentTemplate;
        return COMPONENT_TEMPLATES[selectedComponent.type] || {} as BaseComponentTemplate;
    }, [selectedComponent]);

    const propertyStorage = useMemo(() => {
        if (!selectedComponent) return {};
        return ALL_PROPERTY_STORAGE[template.propertyStorageName] || {};
    }, [selectedComponent, template]);

    const updateProperty = useCallback((path: string, value: any) => {
        if (!selectedComponent || _.isEmpty(path)) return;

        const { rootName, remainingPath } = parsePropertyPath(path);

        if (rootName === 'style' && remainingPath) {
            updateComponentStyle(selectedComponent.id, remainingPath, value);
        }
        else if (rootName === 'attributes' && remainingPath) {
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
    const addProperty = useCallback((category: category, propertyKey: string) => {
        if (!selectedComponent || !propertyKey) return;

        const categoryStorage = propertyStorage.category;
        if (!categoryStorage) {
            console.error(`分类 ${category} 在属性仓库中不存在`);
            return;
        }

        const propertyConfig = categoryStorage[propertyKey];

        if (!propertyConfig) {
            console.error(`属性 "${propertyKey}" 在 ${category} 分类中未定义`);
            return;
        }

        const initialValue = propertyConfig.defaultValue === 'object' ? JSON.parse(JSON.stringify(propertyConfig.defaultValue)) : propertyConfig.defaultValue;

        const fullPath = `${category}.${propertyKey}`;
        updateProperty(fullPath, initialValue);
        setSelectedProperty("");
    }, [selectedComponent, propertyStorage, updateProperty, setSelectedProperty]);

    // 移除属性
    const removeProperty = useCallback((path: string) => {
        if (!selectedComponent || template.fixedProperties?.includes(path)) return;

        // 深拷贝组件并删除属性
        const newComponent = _.cloneDeep(selectedComponent);
        _.unset(newComponent, path);

        // 清理空对象
        const [root] = path.split('.');
        if (_.isEmpty(newComponent[root])) {
            delete newComponent[root];
        }

        updateComponent(newComponent);
    }, [selectedComponent, template.fixedProperties, updateComponent]);

    // 推断属性类型
    const inferPropertyControlType = useCallback((key: string, value: any): PropertyControlType => {
        if (_.isNumber(value)) return 'number';
        if (_.isBoolean(value)) return 'boolean';
        if (key.includes('color') || key.includes('fill') || key.includes('stroke')) return 'color';
        return 'string';
    }, []);

    // 创建PropertyItem辅助函数
    const createPropertyItem = useCallback((path: string, key: string, value: any): PropertyItem => {
        const [category, ...rest] = path.split('.');
        const propertyKey = rest.join('.');
        const config = propertyStorage[category as keyof typeof propertyStorage]?.[propertyKey];

        if (config) {
            return {
                path,
                config,
                isFixed: template.fixedProperties?.includes(path)
            };
        }

        // 自动推断未定义的属性
        return {
            path,
            config: {
                controlType: inferPropertyControlType(key, value),
                label: _.startCase(key),
                defaultValue: value
            },
            isFixed: false
        };
    }, [propertyStorage, template.fixedProperties, inferPropertyControlType]);

    // 属性收集逻辑
    const { existingProperties, addableProperties } = useMemo(() => {
        if (!selectedComponent) return { existingProperties: [], addableProperties: [] };

        const existingProps: PropertyItem[] = [];
        const existingPaths = new Set<string>();

        // 1. 收集属性（不深入收集嵌套对象）
        const collectComponentProperties = (obj: object, prefix: string) => {
            Object.entries(obj).forEach(([key, value]) => {
                const path = `${prefix}.${key}`;

                if (existingPaths.has(path) || excludePaths.includes(path)) return;

                const item = createPropertyItem(path, key, value);
                item.isFixed = template.fixedProperties?.includes(path) || false;
                existingProps.push(item);
                existingPaths.add(path);
            });
        };

        // 收集组件实例中的属性
        if (selectedComponent.attributes) {
            collectComponentProperties(selectedComponent.attributes, 'attributes');
        }
        if (selectedComponent.style) {
            collectComponentProperties(selectedComponent.style, 'style');
        }

        // 2. 确保固定属性存在（即使组件中不存在）
        template.fixedProperties?.forEach(path => {
            if (!existingPaths.has(path)) {
                const [category, propertyKey] = path.split('.');
                const config = propertyStorage[category as keyof typeof propertyStorage]?.[propertyKey];

                if (config) {
                    existingProps.push({
                        path,
                        config,
                        isFixed: true
                    });
                    existingPaths.add(path);
                }
            }
        });

        // 3. 计算可添加属性
        const addableProps = Object.entries(propertyStorage)
            .flatMap(([category, categoryProps]) => {
                if (typeof categoryProps !== 'object' || categoryProps === null) return [];

                return Object.entries(categoryProps)
                    .filter(([_, config]) => config && typeof config === 'object')
                    .map(([key, config]) => {
                        const path = `${category}.${key}`;
                        return {
                            path,
                            config,
                            isFixed: false
                        };
                    });
            })
            .filter(prop =>
                !existingPaths.has(prop.path) &&
                !excludePaths.includes(prop.path) &&
                !template.fixedProperties?.includes(prop.path)
            );

        return {
            existingProperties: existingProps.sort((a, b) => a.config.label.localeCompare(b.config.label)),
            addableProperties: addableProps.sort((a, b) => a.config.label.localeCompare(b.config.label))
        };
    }, [selectedComponent, template, propertyStorage, excludePaths, createPropertyItem]);

    return {
        selectedProperty,
        setSelectedProperty,
        updateProperty,
        addProperty,
        removeProperty,
        existingProperties,
        addableProperties
    };
}   