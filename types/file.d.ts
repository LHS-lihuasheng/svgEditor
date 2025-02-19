interface FileEntry {
  name: string
  relativePath: string
  url: string
  dimensions?: {
    width: number
    height: number
  }
  lastModified: number
} 