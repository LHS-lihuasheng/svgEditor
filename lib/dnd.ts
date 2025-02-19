// 定义拖拽项类型
export const ItemTypes = {
  IMAGE: 'image',
  TOOL: 'tool',
  COMPONENT: 'component'
} as const

// 拖拽项类型
export type DragItemType = typeof ItemTypes[keyof typeof ItemTypes]

// 图片组件类型
export interface ImageComponent {
  type: 'svg'
  name: string
  relativePath: string
  imageUrl: string
  originalSize: {
    width: number
    height: number
  }
}

// 拖拽项数据
export interface DragItem {
  type: DragItemType
  components?: ImageComponent[]
  id?: string
  isToolItem?: boolean
  index?: number
  parentId?: string | null
  size?: {
    width: number
    height: number
  }
} 