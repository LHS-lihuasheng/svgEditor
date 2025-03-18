/**
 * @description 组件树入口组件
 * 负责组合子组件并导出一个完整的组件树
 */
import { ComponentTreeItem } from './ComponentTreeItem';
import { useEditor } from '@/contexts/EditorContext';

export function ComponentTree() {

    const { components } = useEditor();

    return (
        <div className="space-y-2">
            {components.map((component, index) => (
                <ComponentTreeItem
                    key={component.id}
                    component={component}
                    level={0}
                    index={index}
                    parentId={null}
                />
            ))}
        </div>
    );
}