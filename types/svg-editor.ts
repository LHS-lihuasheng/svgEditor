export interface Component {
  id: string
  type: 'section' | 'svg' | 'foreignObject' | 'hotspot'
  position: {
    x: number
    y: number
  }
  size: {
    width: number | string
    height: number | string
  }
  children?: Component[]  // 添加children支持嵌套
  style?: React.CSSProperties
  code?: string          // 组件对应的代码
  viewBox?: string
  backgroundImage?: string
  htmlContent?: string
}

export interface DragItem {
  id?: string
  type: Component['type']
  isToolItem?: boolean
  index?: number
  parentId?: string | null
  size: {
    width: number
    height: number
  }
  dropPosition?: 'before' | 'after' | 'nested'  // 添加拖放位置标记
}

// 预定义的组件模板
export const COMPONENT_TEMPLATES: Record<string, {
  code: string
  label: string
  icon: string
}> = {
  'section': {
    code: '<section style="height:0">\n  {children}\n</section>',
    label: '零高盒子',
    icon: '📦'
  },
  'svg': {
    code: '<svg viewBox="0 0 100 100">\n  {children}\n</svg>',
    label: 'SVG容器',
    icon: '🖼️'
  },
  'foreignObject': {
    code: '<foreignObject>\n  {children}\n</foreignObject>',
    label: 'FO容器',
    icon: '📝'
  },
  'hotspot': {
    code: '<div class="hotspot">\n  {children}\n</div>',
    label: '热区',
    icon: '🎯'
  }
} 