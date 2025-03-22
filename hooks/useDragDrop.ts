/**
 * @description 拖放相关自定义钩子
 * 提供重用的拖放逻辑
 */
import { useRef, useCallback } from 'react';
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import type { BaseComponent, DragItem, DropPosition } from '@/types/core';

interface UseDragDropOptions {
  component: BaseComponent;
  index: number;
  parentId: string | null;
  onDrop: (item: DragItem, targetId: string | null) => void;
  isDescendant: (component: BaseComponent, childId: string) => boolean;
}

export function useDragDrop({
  component,
  index,
  parentId,
  onDrop,
  isDescendant
}: UseDragDropOptions) {
  const ref = useRef<any>(null);

  /**
   * @description 获取放置位置
   * @param {DropTargetMonitor} monitor - 拖放监视器
   * @returns {DropPosition} 放置位置类型
   */
  const getDropPosition = useCallback((monitor: DropTargetMonitor): DropPosition => {
    if (!ref.current || !monitor.getClientOffset()) return 'after';

    const hoverBoundingRect = ref.current.getBoundingClientRect();
    const clientOffset = monitor.getClientOffset()!;

    const hoverClientY = clientOffset.y - hoverBoundingRect.top;
    const hoverHeight = hoverBoundingRect.bottom - hoverBoundingRect.top;

    if (hoverClientY < hoverHeight * 0.25) return 'before';

    if (hoverClientY > hoverHeight * 0.75) return 'after';

    return 'nested';
  }, []);

  // 设置拖动源
  const [{ isDragging }, drag] = useDrag({
    type: 'COMPONENT',
    item: {
      id: component.id,
      type: component.type,
      index,
      parentId
    } as DragItem,
    collect: monitor => ({
      isDragging: monitor.isDragging()
    })
  });

  // 设置放置目标
  const [{ isOver, isOverCurrent, dropPosition }, drop] = useDrop({
    accept: ['COMPONENT', 'TOOL'],
    drop: (item: DragItem, monitor) => {
      if (monitor.didDrop()) return;
      if (item.id === component.id) return;

      onDrop(item, component.id);
    },
    hover: (item: DragItem, monitor) => {
      if (!ref.current) return;
      if (!item.id || item.id === component.id) return;

      const position = getDropPosition(monitor);

      if (position === 'nested' && !item.isToolItem && isDescendant(component, item.id)) {
        item.dropPosition = 'after';
      } else {
        item.dropPosition = position;
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      isOverCurrent: monitor.isOver({ shallow: true }),
      dropPosition: getDropPosition(monitor)
    })
  });

  // 组合拖放引用
  const combineRefs = useCallback((el: any) => {
      ref.current = el;
      drag(el);
      drop(el);
  }, [drag, drop]);

  return {
    ref: combineRefs,
    isDragging,
    isOver,
    isOverCurrent,
    dropPosition
  };
} 