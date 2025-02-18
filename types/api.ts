export interface UploadImageResponse {
  url: string
  errcode?: number
  errmsg?: string
}

export interface UploadMaterialResponse {
  media_id: string
  url?: string
  errcode?: number
  errmsg?: string
} 