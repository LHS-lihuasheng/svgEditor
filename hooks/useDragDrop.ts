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
  onMove: (dragIndex: number, hoverIndex: number, parentId: string | null) => void;
  isDescendant: (component: BaseComponent, childId: string) => boolean;
}

export function useDragDrop({
  component,
  index,
  parentId,
  onDrop,
  onMove,
  isDescendant
}: UseDragDropOptions) {
  const ref = useRef<HTMLDivElement>(null);

  /**
   * @description 获取放置位置
   * @param {DropTargetMonitor} monitor - 拖放监视器
   * @returns {DropPosition} 放置位置类型
   */
  const getDropPosition = useCallback((monitor: DropTargetMonitor): DropPosition => {
    if (!ref.current || !monitor.getClientOffset()) return 'after';

    const hoverBoundingRect = ref.current.getBoundingClientRect();
    const clientOffset = monitor.getClientOffset()!;

    // 计算相对位置
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;
    const hoverHeight = hoverBoundingRect.bottom - hoverBoundingRect.top;

    // 在上部25%区域时放置在前面
    if (hoverClientY < hoverHeight * 0.25) return 'before';

    // 在下部25%区域时放置在后面
    if (hoverClientY > hoverHeight * 0.75) return 'after';

    // 中间区域放置在内部
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

      // 处理放置
      onDrop(item, component.id);
    },
    hover: (item: DragItem, monitor) => {
      if (!ref.current) return;
      if (!item.id || item.id === component.id) return;

      // 确定放置位置
      const position = getDropPosition(monitor);

      // 禁止将组件嵌套到自己或自己的子组件中
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
  const combineRefs = (el: HTMLDivElement | null) => {
    ref.current = el;
    drag(el);
    drop(el);
  };

  return {
    ref: combineRefs,
    isDragging,
    isOver,
    isOverCurrent,
    dropPosition
  };
} 