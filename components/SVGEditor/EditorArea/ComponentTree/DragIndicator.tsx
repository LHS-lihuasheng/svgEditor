/**
 * @description 拖放指示器组件
 * 显示拖放位置的视觉提示
 */
import { DropPosition } from '@/types/drag';

interface DragIndicatorProps {
    isOver: boolean;
    position: DropPosition | null;
}

export function DragIndicator({ isOver, position }: DragIndicatorProps) {
    if (!isOver || !position) return null;

    return (
        <>
            {/* 上方插入线 */}
            <div className={`
        absolute -top-[2px] left-0 right-0 h-[3px] z-10
        ${position === 'before' ? 'bg-blue-500 scale-y-100' : 'bg-transparent scale-y-0'}
        transition-all duration-150 transform origin-center
      `} />

            {/* 下方插入线 */}
            <div className={`
        absolute -bottom-[2px] left-0 right-0 h-[3px] z-10
        ${position === 'after' ? 'bg-blue-500 scale-y-100' : 'bg-transparent scale-y-0'}
        transition-all duration-150 transform origin-center
      `} />

            {/* 嵌套指示框 */}
            <div className={`
        absolute inset-[1px] border-2 rounded pointer-events-none z-10
        ${position === 'nested'
                    ? 'border-blue-500 opacity-100 scale-100 bg-blue-50/20'
                    : 'border-transparent opacity-0 scale-95'
                }
        transition-all duration-150 transform
      `} />
        </>
    );
} 