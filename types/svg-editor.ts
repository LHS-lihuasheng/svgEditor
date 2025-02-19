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
    code: '<section style="height: 0px;line-height: 0;pointer-events: none;margin-top:0px;text-align: center;">\n  {children}\n</section>',
    label: '零高盒子',
    icon: '📦'
  },
  'svg': {
    code: '<svg style="background-image: url(&quot;relativePath&quot;); line-height: 0; background-size: cover; background-repeat: no-repeat; margin-top:0px;" viewBox="0 0 width height" >\n  { children }\n</svg>',
    label: 'SVG容器',
    icon: '🖼️'
  },
  'foreignObject': {
    code: '<g>\n<foreignObject x="0" y="0" width="100%" height="100%">\n  {children}\n</foreignObject>\n</g>',
    label: 'FO容器',
    icon: '📝'
  },
  'hotspot': {
    code: '<g id="热区">\n  <rect x="0" y="0" width="100%" height="100%" opacity="0" style="pointer-events: visible;">\n<set attributeName="visibility" to="hidden" begin="click" dur="1ms" fill="freeze">\n  {children}\n</set></rect>\n</g>',
    label: '热区',
    icon: '🎯'
  }
} 