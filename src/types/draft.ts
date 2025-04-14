import type { Crop } from "react-image-crop"

export interface CropCoordinates {
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface NewsItem {
  media_id?: string
  article_type: "news" | "newspic"
  title: string
  author?: string
  digest?: string
  content: string
  content_source_url?: string
  thumb_media_id: string
  show_cover_pic: number
  need_open_comment: number
  only_fans_can_comment: number
  url: string
  image_info?: {
    image_list: Array<{ image_media_id: string }>
  }
  product_info?: {
    footer_product_info: {
      product_key: string
    }
  }
  pic_crop_235_1?: string // 格式: "x1_y1_x2_y2"
  pic_crop_1_1?: string // 格式: "x1_y1_x2_y2"
}

export interface CroppedImages {
  crop235: string | null
  crop11: string | null
}

export interface CropState {
  crop235?: Crop
  crop11?: Crop
}

export interface DraftCache extends Omit<NewsItem, 'url'> {
  url?: string
  originalImage?: string | null
  croppedImages?: CroppedImages
  cropState?: CropState
}

export type DraftItem = {
  media_id: string
  content: {
    news_item: NewsItem[]
  }
  update_time: number
}

export type DraftResponse = {
  total_count: number
  item_count: number
  item: DraftItem[]
}

export type ApiResponse<T = any> = {
  errcode?: number
  errmsg?: string
  data?: T
}

// 将裁切坐标转换为接口需要的格式
export function formatCropCoordinates(crop: Crop): string {
  // 确保坐标值在 0-1 范围内，且最多保留 6 位小数
  const x1 = Math.max(0, Math.min(1, crop.x)).toFixed(6)
  const y1 = Math.max(0, Math.min(1, crop.y)).toFixed(6)
  const x2 = Math.max(0, Math.min(1, crop.x + crop.width)).toFixed(6)
  const y2 = Math.max(0, Math.min(1, crop.y + crop.height)).toFixed(6)
  
  return `${x1}_${y1}_${x2}_${y2}`
}

