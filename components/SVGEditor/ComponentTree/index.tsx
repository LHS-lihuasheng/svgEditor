/**
 * @description 组件树入口组件
 * 负责组合子组件并导出一个完整的组件树
 */
import { ComponentTreeView } from './ComponentTreeView';
import { ComponentTreeProvider } from './ComponentTreeContext';

// 定义组件树组件的props类型
export interface ComponentTreeProps {
    level?: number;
}

export function ComponentTree({ level = 0 }: ComponentTreeProps = {}) {
    return (
        <ComponentTreeProvider>
            <ComponentTreeView level={level} />
        </ComponentTreeProvider>
    );
}

// 导出组件时使用完整路径
export { ComponentTreeItem } from './ComponentTreeItem';
export { useComponentTree } from './ComponentTreeContext';
export { DragIndicator } from './DragIndicator';