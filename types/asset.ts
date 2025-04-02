/**
 * 资源相关类型定义
 */
declare global {
    interface Window {
        showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>
    }
}

// 图片资源数据结构
export interface ImageAsset {
    name: string
    relativePath: string
    url: string
    dimensions: { width: number, height: number }
    lastModified: number
    directory: string
    size: number
    hash: string
}

// 目录树节点
export interface DirectoryNode {
    name: string
    path: string
    children: DirectoryNode[]
}

// 用于MasonryGallery的扩展图片项
export interface ImageItem extends ImageAsset {
    height: number
    loaded: boolean
    visible: boolean
}

// 资源查找函数类型
export type ImageFinder = (path: string) => ImageAsset | undefined
