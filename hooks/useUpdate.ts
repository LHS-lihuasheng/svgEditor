/**
 * @description 组件更新Hook
 * 提供一个能够以不可变方式更新组件状态的方法
 */
import { useCallback } from 'react';
import type { BaseComponent } from '@/types/core';

/**
 * 创建一个用于更新组件的Hook
 * @param component 当前组件
 * @param onUpdate 更新回调函数
 * @returns 包含handleUpdate方法的对象
 */
export function useUpdate(component: BaseComponent, onUpdate: (updated: BaseComponent) => void) {
  /**
   * 通过JSON序列化实现简单的深拷贝 
   * @param updater 更新函数
   */
  const handleUpdate = useCallback(
    (updater: (draft: BaseComponent) => void) => {
      // 创建组件的深拷贝
      const draft = JSON.parse(JSON.stringify(component));

      // 应用更新
      updater(draft);

      // 提交更新
      onUpdate(draft);
    },
    [component, onUpdate]
  );

  return { handleUpdate };
} 