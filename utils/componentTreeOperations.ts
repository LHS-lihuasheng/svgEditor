/**
 * @description 组件树操作工具
 * 提供组件树的完整增删改查功能
 */
import { BaseComponent, ComponentType } from '@/types/core';
import { COMPONENT_TEMPLATES } from '@/types/core/atomicComponent';
import { generateComponentId } from '@/utils/component';

/**
 * 组件在树中的位置信息
 */
export interface ComponentLocation {
    component: BaseComponent | null;
    parentArray: BaseComponent[];
    index: number;
}

/**
 * @description 查找 - 在组件树中查找组件及其位置信息
 */
export function findComponentLocation(
    componentTree: BaseComponent[],
    componentId: string,
    parentArray: BaseComponent[] = componentTree
): ComponentLocation {
    for (let i = 0; i < componentTree.length; i++) {
        if (componentTree[i].id === componentId) {
            return {
                component: componentTree[i],
                parentArray,
                index: i
            };
        }

        if (componentTree[i].children?.length > 0) {
            const result = findComponentLocation(
                componentTree[i].children,
                componentId,
                componentTree[i].children
            );
            if (result.component) {
                return result;
            }
        }
    }
    return { component: null, parentArray, index: -1 };
}

/**
 * @description 查找 - 通过ID查找组件和其父数组
 */
export function findComponentById(
    components: BaseComponent[],
    id: string
): [BaseComponent | null, BaseComponent[] | null] {
    const { component, parentArray } = findComponentLocation(components, id);
    return [component, component ? parentArray : null];
}

/**
 * @description 创建 - 生成新组件
 */
export function createComponent(type: ComponentType): BaseComponent {
    const template = COMPONENT_TEMPLATES[type as keyof typeof COMPONENT_TEMPLATES];

    return {
        id: generateComponentId(type),
        type,
        children: [],
        ...(template?.defaultProperties || {})
    } as BaseComponent;
}

/**
 * @description 创建 - 添加组件到根级
 */
export function addComponentToRoot(
    components: BaseComponent[],
    type: ComponentType
): void {
    components.push(createComponent(type));
}

/**
 * @description 创建 - 添加子组件
 */
export function addChildComponent(
    components: BaseComponent[],
    parentId: string,
    childType: ComponentType
): void {
    const [parent] = findComponentById(components, parentId);

    if (!parent) return;

    const childComponent = createComponent(childType);

    parent.children.push(childComponent);

}

/**
 * @description 更新 - 更新组件属性
 */
export function updateComponent(
    components: BaseComponent[],
    updated: BaseComponent
): void {
    const [component] = findComponentById(components, updated.id);

    if (component) {
        // 合并属性
        Object.assign(component, {
            ...updated,
            style: { ...component.style, ...updated.style },
            attributes: { ...component.attributes, ...updated.attributes },
            children: updated.children || component.children
        });
    }
}

/**
 * @description 更新 - 更新组件样式
 */
export function updateComponentStyle(
    components: BaseComponent[],
    componentId: string,
    styleProp: string,
    value: any
): void {
    const [component] = findComponentById(components, componentId);

    if (component) {
        component.style = {
            ...(component.style || {}),
            [styleProp]: value
        };
    }
}

/**
 * @description 更新 - 更新组件属性
 */
export function updateComponentAttribute(
    components: BaseComponent[],
    componentId: string,
    attrKey: string,
    value: any
): void {
    const [component] = findComponentById(components, componentId);

    if (component) {
        component.attributes = {
            ...(component.attributes || {}),
            [attrKey]: value
        };
    }
}

/**
 * @description 删除 - 递归删除组件
 */
export function removeComponentById(
    components: BaseComponent[],
    id: string
): void {
    const { component, parentArray, index } = findComponentLocation(components, id);

    if (component && index !== -1) {
        parentArray.splice(index, 1);
    }
}

/**
 * @description 复制 - 复制组件
 */
export function duplicateComponent(
    components: BaseComponent[],
    componentId: string
): void {
    const [component] = findComponentById(components, componentId);

    if (!component) return;

    // 创建深拷贝
    const clone = JSON.parse(JSON.stringify(component));

    // 为克隆的组件及其所有子组件分配新ID
    const assignNewIds = (comp: BaseComponent): BaseComponent => {
        const newComp = {
            ...comp,
            id: `${comp.type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`
        };

        if (newComp.children && newComp.children.length > 0) {
            newComp.children = newComp.children.map(assignNewIds);
        }

        return newComp;
    };

    const duplicated = assignNewIds(clone);

    // 在组件后插入复制的组件
    const { component: target, parentArray, index } = findComponentLocation(components, componentId);

    if (target && index !== -1) {
        parentArray.splice(index + 1, 0, duplicated);
    }
}

/**
 * @description 移动 - 插入组件
 */
export function insertComponent(
    componentTree: BaseComponent[],
    targetComponentId: string,
    componentToInsert: BaseComponent,
    position: 'nested' | 'before' | 'after' = 'after'
): void {
    const { component, parentArray, index } = findComponentLocation(componentTree, targetComponentId);

    if (!component) return;

    if (position === 'nested') {
        if (!component.children) component.children = [];
        component.children.push(componentToInsert);
    } else if (position === 'before') {
        parentArray.splice(index, 0, componentToInsert);
    } else {
        parentArray.splice(index + 1, 0, componentToInsert);
    }
}

/**
 * @description 工具 - 展平组件树
 */
export function flattenComponentTree(componentTree: BaseComponent[]): BaseComponent[] {
    if (!Array.isArray(componentTree)) return [];

    return componentTree.reduce<BaseComponent[]>((acc, comp) => {
        acc.push(comp);
        if (Array.isArray(comp.children) && comp.children.length > 0) {
            acc.push(...flattenComponentTree(comp.children));
        }
        return acc;
    }, []);
} 