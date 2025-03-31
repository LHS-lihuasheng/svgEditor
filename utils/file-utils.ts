import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"

// 文件系统类型定义
interface FileSystemHandle {
  kind: 'file' | 'directory'
  name: string
}

interface FileSystemFileHandle extends FileSystemHandle {
  kind: 'file'
  getFile(): Promise<File>
}

interface FileSystemDirectoryHandle extends FileSystemHandle {
  kind: 'directory'
  entries(): AsyncIterableIterator<[string, FileSystemHandle]>
}

// 声明全局 window.showDirectoryPicker
declare global {
  interface Window {
    showDirectoryPicker(options?: {
      mode?: 'read' | 'readwrite'
    }): Promise<FileSystemDirectoryHandle>
  }
}

export interface FileEntry {
  path: string
  type: 'image'
  name: string
  lastModified: number
  size: number
  url: string
  directory: string
  relativePath: string
  dimensions?: {
    width: number
    height: number
  }
}

// 处理目录路径
function normalizePath(path: string): string {
  return path.replace(/^\/+|\/+$/g, '')
}

// 获取目录结构
function getDirectoryStructure(files: FileEntry[]): string[] {
  const directories = new Set<string>()

  files.forEach(file => {
    const dir = file.directory
    if (dir) {
      const parts = dir.split('/')
      let path = ''
      parts.forEach(part => {
        path = path ? `${path}/${part}` : part
        directories.add(path)
      })
    }
  })

  return Array.from(directories).sort()
}

// 选择目录并处理文件
export async function selectDirectory(
  existingHandle?: FileSystemDirectoryHandle
): Promise<{
  directories: string[]
  files: FileEntry[]
  currentDirectory: string
}> {
  try {
    const directoryHandle = existingHandle || await window.showDirectoryPicker()
    const files: FileEntry[] = []

    async function processDirectory(handle: FileSystemDirectoryHandle, path = '') {
      for await (const [name, entry] of handle.entries()) {
        const relativePath = path ? `${path}/${name}` : name

        if (entry.kind === 'file') {
          const file = await (entry as FileSystemFileHandle).getFile()
          if (file.type.startsWith('image/')) {
            const fileEntry: FileEntry = {
              path: relativePath,
              type: 'image',
              name: entry.name,
              lastModified: file.lastModified,
              size: file.size,
              url: URL.createObjectURL(file),
              directory: normalizePath(path),
              relativePath: await getRelativePath(directoryHandle, entry as FileSystemFileHandle) || `./${relativePath}`
            }
            files.push(fileEntry)
          }
        } else if (entry.kind === 'directory') {
          await processDirectory(entry as FileSystemDirectoryHandle, relativePath)
        }
      }
    }

    await processDirectory(directoryHandle)
    const directories = getDirectoryStructure(files)

    return {
      directories: Array.from(new Set(directories)),
      files,
      currentDirectory: 'root'
    }
  } catch (error) {
    console.error('目录选择错误:', error)
    return { directories: [], files: [], currentDirectory: 'root' }
  }
}
// 获取相对路径
export async function getRelativePath(
  directoryHandle: FileSystemDirectoryHandle,
  fileHandle: FileSystemFileHandle
): Promise<string | null> {
  try {
    const pathArray = await directoryHandle.resolve(fileHandle)
    if (!pathArray) return null
    return `./${pathArray.join('/')}`.replace(/\/+/g, '/')
  } catch (error) {
    console.warn(`无法解析 ${fileHandle.name} 的相对路径`, error)
    return null
  }
}

// 格式化文件大小
export const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// 格式化最后修改时间
export const formatLastModified = (timestamp: number) => {
  return formatDistanceToNow(new Date(timestamp), {
    addSuffix: true,
    locale: zhCN
  })
}

// 格式化尺寸显示
export const formatDimensions = (width: number, height: number) => {
  return `${width} × ${height}`
}
