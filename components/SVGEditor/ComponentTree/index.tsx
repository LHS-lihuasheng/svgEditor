/**
 * @description 组件树入口组件
 * 负责组合子组件并导出一个完整的组件树
 */
import { ComponentTreeView } from './ComponentTreeView';
import { ComponentTreeProvider } from './ComponentTreeContext';
import type { BaseComponent, DragItem } from '@/types/core';

export interface ComponentTreeProps {
    components: BaseComponent[];
    selectedId?: string;
    level?: number;
    onSelect: (component: BaseComponent) => void;
    onDrop: (item: DragItem, targetId: string | null) => void;
    onMove: (dragIndex: number, hoverIndex: number, parentId: string | null) => void;
    onUpdate: (updated: BaseComponent) => void;
    onDelete: (id: string) => void;
    onAddImages?: (targetId: string) => void;
}

export function ComponentTree(props: ComponentTreeProps) {
    return (
        <ComponentTreeProvider>
            <ComponentTreeView {...props} />
        </ComponentTreeProvider>
    );
}

// 导出组件时使用完整路径
export { ComponentTreeItem } from './ComponentTreeItem';
export { useComponentTree } from './ComponentTreeContext';
export { DragIndicator } from './DragIndicator';
export * from './utils'; 