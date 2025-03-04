"use client"

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import type { Component } from '@/types/atomicComponent'
import { COMPONENT_TEMPLATES } from '@/types/atomicComponent'

// 定义Context类型
interface EditorContextType {
    // 状态
    components: Component[]
    selectedComponent: Component | null
    showCodePreview: boolean

    // 操作
    setComponents: React.Dispatch<React.SetStateAction<Component[]>>
    setSelectedComponent: (component: Component | null) => void
    updateComponent: (updated: Component) => void
    addComponent: (type: Component['type'], position: { x: number; y: number }) => void
    deleteComponent: (id: string) => void
    moveComponent: (dragIndex: number, hoverIndex: number, parentId: string | null) => void
    setShowCodePreview: (show: boolean) => void
    handleDrop: (item: any, targetId: string | null) => void

    // 辅助方法
    findComponentById: (components: Component[], id: string) => [Component | null, Component[] | null]
    generateUniqueId: (type: Component['type']) => string
}

// 创建Context
const EditorContext = createContext<EditorContextType | null>(null)

// Provider组件
export function EditorProvider({ children }: { children: React.ReactNode }) {
    const [components, setComponents] = useState<Component[]>([])
    const [selectedComponent, setSelectedComponent] = useState<Component | null>(null)
    const [showCodePreview, setShowCodePreview] = useState(false)

    // 在EditorProvider的开头添加
    useEffect(() => {
        // 加载自定义模板
        try {
            const saved = localStorage.getItem("svg-editor-custom-templates")
            if (saved) {
                const customTemplates = JSON.parse(saved)
                Object.assign(COMPONENT_TEMPLATES, customTemplates)
            }
        } catch (error) {
            console.error("Failed to load custom templates:", error)
        }
    }, [])

    // 生成唯一ID
    const generateUniqueId = useCallback((type: Component['type']): string => {
        const baseId = `${type}-${Date.now()}`
        let id = baseId
        let counter = 1

        const isIdExists = (comps: Component[], checkId: string): boolean => {
            return comps.some(comp => {
                if (comp.id === checkId) return true
                if (comp.children) return isIdExists(comp.children, checkId)
                return false
            })
        }

        while (isIdExists(components, id)) {
            id = `${baseId}-${counter}`
            counter++
        }

        return id
    }, [components])

    // 查找组件
    const findComponentById = useCallback((components: Component[], id: string): [Component | null, Component[] | null] => {
        if (!Array.isArray(components)) return [null, null]

        for (let i = 0; i < components.length; i++) {
            if (components[i].id === id) {
                return [components[i], components]
            }

            if (components[i].children && components[i].children.length > 0) {
                const [found, parentArray] = findComponentById(components[i].children, id)
                if (found) return [found, parentArray]
            }
        }

        return [null, null]
    }, [])

    // 添加组件
    const addComponent = useCallback((type: "svg", position: { x: number; y: number }) => {
        if (type !== 'svg') {
            console.warn('只支持添加SVG组件')
            return
        }
        
        setComponents(prev => {
            const template = COMPONENT_TEMPLATES[type]
            const newComponent: Component = {
                id: generateUniqueId(type),
                type,
                position,
                size: template.defaultSize || { width: '100%', height: 'auto' },
                code: template.code,
                children: [],
                ...(template.defaultProperties || {})
            }

            return [...prev, newComponent]
        })
    }, [generateUniqueId])

    // 更新组件
    const updateComponent = useCallback((updated: Component) => {
        // 深拷贝组件，避免引用问题
        const updatedComponent = JSON.parse(JSON.stringify(updated))

        setComponents(prevComponents => {
            const newComponents = [...prevComponents]
            const [component, parentArray] = findComponentById(newComponents, updated.id)

            if (component && parentArray) {
                // 找到组件在父数组中的索引
                const index = parentArray.findIndex(c => c.id === updated.id)
                if (index !== -1) {
                    // 替换组件
                    parentArray[index] = updatedComponent
                    return newComponents
                }
            }
            return prevComponents
        })

        // 保持选中状态
        setSelectedComponent(updatedComponent)
    }, [findComponentById])

    // 删除组件
    const deleteComponent = useCallback((id: string) => {
        setComponents(prev => {
            const deleteFromTree = (components: Component[]): Component[] => {
                return components.filter(comp => {
                    if (comp.id === id) return false
                    if (comp.children && comp.children.length > 0) {
                        comp.children = deleteFromTree(comp.children)
                    }
                    return true
                })
            }

            return deleteFromTree(prev)
        })

        // 如果删除的是当前选中的组件，清除选择
        if (selectedComponent && selectedComponent.id === id) {
            setSelectedComponent(null)
        }
    }, [selectedComponent])

    // 移动组件
    const moveComponent = useCallback((dragIndex: number, hoverIndex: number, parentId: string | null) => {
        setComponents(prevComponents => {
            const components = JSON.parse(JSON.stringify(prevComponents))

            // 查找源组件
            const findComponentByIndex = (components: Component[], index: number, parentId: string | null): [Component, Component[] | null] | null => {
                if (!Array.isArray(components)) return null

                if (!parentId) {
                    if (index >= 0 && index < components.length) {
                        return [components[index], components]
                    }
                    return null
                }

                for (const component of components) {
                    if (component.id === parentId && Array.isArray(component.children)) {
                        if (index >= 0 && index < component.children.length) {
                            return [component.children[index], component.children]
                        }
                        return null
                    }

                    if (Array.isArray(component.children)) {
                        const result = findComponentByIndex(component.children, index, parentId)
                        if (result) return result
                    }
                }

                return null
            }

            const findResult = findComponentByIndex(components, dragIndex, parentId)
            if (!findResult) return prevComponents

            const [dragComponent, dragParentComponents] = findResult

            if (dragParentComponents) {
                dragParentComponents.splice(dragIndex, 1)
            } else {
                components.splice(dragIndex, 1)
            }

            let targetParentComponents = parentId ?
                findComponentById(components, parentId)?.[0]?.children :
                components

            if (!targetParentComponents) {
                components.splice(hoverIndex, 0, dragComponent)
            } else {
                targetParentComponents.splice(hoverIndex, 0, dragComponent)
            }

            return components
        })
    }, [findComponentById])

    // 处理拖放
    const handleDrop = useCallback((item: any, targetId: string | null = null) => {
        if (item.isToolItem) {
            const template = COMPONENT_TEMPLATES[item.type]
            if (!template) {
                console.error(`Template not found for type: ${item.type}`)
                return
            }

            setComponents(prev => {
                // 创建新组件
                const newComponent: Component = {
                    id: generateUniqueId(item.type),
                    type: item.type,
                    position: { x: 0, y: 0 },
                    size: template.defaultSize || { width: '100%', height: 'auto' },
                    tag: template.tag,
                    attributes: template.defaultAttributes || {},
                    children: [],
                    ...(template.defaultProperties || {})
                }

                // 根据dropPosition决定添加位置
                if (targetId && item.dropPosition === 'nested') {
                    return updateComponentTree(prev, targetId, newComponent, 'nested')
                } else if (targetId) {
                    return updateComponentTree(prev, targetId, newComponent, item.dropPosition || 'after')
                } else {
                    return [...prev, newComponent]
                }
            })
        } else {
            setComponents(prev => {
                const [movedComponent] = findComponentById(prev, item.id)
                if (!movedComponent) return prev

                const template = COMPONENT_TEMPLATES[movedComponent.type]
                if (!template) {
                    console.error(`Template not found for type: ${movedComponent.type}`)
                    return prev
                }

                const componentToMove: Component = {
                    ...movedComponent,
                    position: { x: 0, y: 0 },
                    tag: template.tag,
                    attributes: template.defaultAttributes || {},
                    children: Array.isArray(movedComponent.children) ? [...movedComponent.children] : []
                }

                if (targetId === item.id) return prev

                const isDescendant = (parent: Component, childId: string): boolean => {
                    if (!parent.children) return false
                    return parent.children.some(child =>
                        child.id === childId || isDescendant(child, childId)
                    )
                }

                // 检查目标是否是源的子组件，避免循环引用
                if (targetId) {
                    const [targetComponent] = findComponentById(prev, targetId)
                    if (targetComponent && isDescendant(movedComponent, targetId)) {
                        return prev
                    }
                }

                // 删除原有组件
                const removeComponent = (components: Component[], id: string): Component[] => {
                    return components.filter(comp => {
                        if (comp.id === id) return false
                        if (comp.children && comp.children.length > 0) {
                            comp.children = removeComponent(comp.children, id)
                        }
                        return true
                    })
                }

                const newComponents = removeComponent(prev, item.id)
                if (targetId) {
                    return updateComponentTree(newComponents, targetId, componentToMove, item.dropPosition || 'after')
                } else {
                    return [...newComponents, componentToMove]
                }
            })
        }
    }, [findComponentById, generateUniqueId])

    // 辅助函数：更新组件树
    const updateComponentTree = useCallback((
        components: Component[],
        targetId: string,
        movedComponent: Component,
        dropPosition: 'before' | 'after' | 'nested' = 'after'
    ): Component[] => {
        if (!Array.isArray(components)) return []

        return components
            .map(comp => {
                if (comp.id === targetId) {
                    if (dropPosition === 'nested') {
                        // 添加为子组件
                        return {
                            ...comp,
                            children: [...(Array.isArray(comp.children) ? comp.children : []), movedComponent]
                        }
                    } else if (dropPosition === 'before') {
                        // 在当前组件前插入
                        return [movedComponent, comp]
                    } else {
                        // 在当前组件后插入
                        return [comp, movedComponent]
                    }
                }

                // 递归处理子组件
                if (Array.isArray(comp.children) && comp.children.length > 0) {
                    return {
                        ...comp,
                        children: updateComponentTree(comp.children, targetId, movedComponent, dropPosition)
                    }
                }

                return comp
            })
            // 处理数组扁平化（当dropPosition为before/after时会产生嵌套数组）
            .reduce((acc, curr) => {
                if (Array.isArray(curr)) {
                    return [...acc, ...curr]
                }
                return [...acc, curr]
            }, [] as Component[])
    }, [])

    // 优化性能：记忆化value对象
    const contextValue = useMemo(() => ({
        // 状态
        components,
        selectedComponent,
        showCodePreview,

        // 方法
        setComponents,
        setSelectedComponent,
        updateComponent,
        addComponent,
        deleteComponent,
        moveComponent,
        setShowCodePreview,
        handleDrop,

        // 辅助方法
        findComponentById,
        generateUniqueId
    }), [
        components,
        selectedComponent,
        showCodePreview,
        updateComponent,
        addComponent,
        deleteComponent,
        moveComponent,
        handleDrop,
        findComponentById,
        generateUniqueId
    ])

    return (
        <EditorContext.Provider value={contextValue}>
            {children}
        </EditorContext.Provider>
    )
}

// 创建Hook
export function useEditor() {
    const context = useContext(EditorContext)
    if (!context) {
        throw new Error('useEditor must be used within an EditorProvider')
    }
    return context
} 