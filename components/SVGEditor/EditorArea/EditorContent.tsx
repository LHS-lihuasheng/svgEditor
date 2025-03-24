/**
 * @description 编辑器内容区域组件
 * 封装了编辑区域的内容显示逻辑
 */
import React from 'react';
import { ComponentTree } from "./ComponentTree";
import { EmptyEditorState } from "./EmptyEditorState";
import { useEditor } from '@/contexts/EditorContext';

export function EditorContent() {
    const { components, clearSelection, editorDrop } = useEditor();

    return (
        <div
            ref={editorDrop}
            id="editor-area"
            className="flex-1 p-6 relative overflow-auto"
            onClick={clearSelection}
            style={{
                height: 'calc(100vh - 64px)',
                minHeight: '80vh'
            }}
        >
            {components.length === 0 ? (
                <EmptyEditorState />
            ) : (
                <ComponentTree />
            )}
        </div>
    );
} 