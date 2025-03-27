/**
 * @description 组件树入口组件
 * 负责组合子组件并导出一个完整的组件树
 */
import { ComponentTreeItem } from './ComponentTreeItem';
import { useEditor } from '@/contexts/EditorContext';
import { useState } from 'react';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import type { BaseComponent } from '@/types';

export function ComponentTree() {
    const { components, deleteComponent } = useEditor();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [componentToDelete, setComponentToDelete] = useState<BaseComponent | null>(null);

    const handleDeleteRequest = (component: BaseComponent) => {
        setComponentToDelete(component);
        setShowDeleteDialog(true);
    };

    const handleConfirmDelete = () => {
        if (componentToDelete) {
            deleteComponent(componentToDelete.id);
            setShowDeleteDialog(false);
            setComponentToDelete(null);
        }
    };

    return (
        <div className="space-y-2">
            {components.map((component, index) => (
                <ComponentTreeItem
                    key={component.id}
                    component={component}
                    level={0}
                    index={index}
                    onDeleteRequest={handleDeleteRequest}
                />
            ))}

            {/* 删除确认对话框 */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认删除组件</AlertDialogTitle>
                        <AlertDialogDescription>
                            此操作将删除组件"{componentToDelete?.type}"及其所有子组件，此操作无法撤销。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteDialog(false);
                        }}>取消</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.stopPropagation();
                                handleConfirmDelete();
                            }}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            删除
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}