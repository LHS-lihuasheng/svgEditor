"use client"

import { useEditor } from '@/contexts/EditorContext/index';
import type { BaseComponent } from "@/types/core";
import { NumberControl } from '../PropertyControls/NumberControl';
import { SelectControl } from '../PropertyControls/SelectControl';
import { ColorControl } from '../PropertyControls/ColorControl';
import get from "lodash/get";
import set from "lodash/set";

interface GroupEditorProps {
  component: BaseComponent;
}

export function GroupEditor({ component }: GroupEditorProps) {
  const { updateComponent } = useEditor();

  // 处理属性变更
  const handlePropertyChange = (property: string, value: any) => {
    // 创建组件的副本并更新属性
    const updatedComponent = JSON.parse(JSON.stringify(component));
    set(updatedComponent, property, value);
    updateComponent(updatedComponent);
  };

  return (
    <div className="space-y-4">
      {/* 位置属性 */}
      <SelectControl
        label="定位方式"
        value={get(component, 'style.position') || 'relative'}
        onChange={(value) => handlePropertyChange('style.position', value)}
        options={[
          { label: '相对定位', value: 'relative' },
          { label: '绝对定位', value: 'absolute' }
        ]}
      />

      {/* 坐标属性 */}
      <div className="grid grid-cols-2 gap-3">
        <NumberControl
          label="X坐标"
          value={get(component, 'style.left') || 0}
          onChange={(value) => handlePropertyChange('style.left', value)}
          placeholder="X坐标"
        />
        <NumberControl
          label="Y坐标"
          value={get(component, 'style.top') || 0}
          onChange={(value) => handlePropertyChange('style.top', value)}
          placeholder="Y坐标"
        />
      </div>

      {/* 尺寸属性 */}
      <div className="grid grid-cols-2 gap-3">
        <NumberControl
          label="宽度"
          value={get(component, 'style.width') || ''}
          onChange={(value) => handlePropertyChange('style.width', value)}
          placeholder="自适应"
        />
        <NumberControl
          label="高度"
          value={get(component, 'style.height') || ''}
          onChange={(value) => handlePropertyChange('style.height', value)}
          placeholder="自适应"
        />
      </div>

      {/* 背景颜色 */}
      <ColorControl
        label="背景颜色"
        value={get(component, 'style.backgroundColor') || ''}
        onChange={(value) => handlePropertyChange('style.backgroundColor', value)}
      />

      {/* 不透明度 */}
      <NumberControl
        label="不透明度"
        value={get(component, 'style.opacity') || 1}
        onChange={(value) => handlePropertyChange('style.opacity', value)}
        min={0}
        max={1}
        step={0.1}
      />
    </div>
  );
} 