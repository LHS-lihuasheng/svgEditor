/**
 * @description 编辑器拖放钩子
 * 封装编辑器的拖放操作逻辑
 */
import { useDrop } from 'react-dnd';
import { useEditor } from './index';
import type { DragItem } from '@/types/core';

export function useEditorDrop() {
  const { handleDrop } = useEditor();

  const drop = useDrop<DragItem, void, any>(() => ({
    accept: ['TOOL', 'COMPONENT'],
    drop: (item: DragItem, monitor) => {
      // 如果已经被处理过，则不再处理
      if (monitor.didDrop()) return;

      const editorElement = document.getElementById('editor-area');
      if (!editorElement) return;

      // 获取编辑区域的位置
      const editorRect = editorElement.getBoundingClientRect();
      const offset = monitor.getClientOffset();
      if (!offset) return;

      const x = offset.x - editorRect.left;
      const y = offset.y - editorRect.top;

      // 更新拖放项目，添加坐标信息
      const updatedItem: DragItem = {
        ...item,
        x,
        y
      };
      // 获取鼠标下方的元素及其组件ID
      const targetElement = document.elementFromPoint(offset.x, offset.y);
      const targetComponentId = targetElement?.closest('[data-component-id]')?.getAttribute('data-component-id') || null;

      // 调用处理函数
      handleDrop(updatedItem, targetComponentId);
    }
  }))[1];

  return drop;
} 