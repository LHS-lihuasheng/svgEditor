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

interface FileSystemState {
  currentDirectory: string
  directories: string[]
  files: FileEntry[]
  pathMap: Map<string, FileSystemHandle>
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
export async function selectDirectory(): Promise<FileSystemState> {
  try {
    const dirHandle = await window.showDirectoryPicker({
      mode: 'read'
    })

    const files: FileEntry[] = []
    const pathMap = await buildRelativePath(dirHandle)

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
              relativePath: `./${relativePath}`
            }
            files.push(fileEntry)
          }
        } else if (entry.kind === 'directory') {
          await processDirectory(entry as FileSystemDirectoryHandle, relativePath)
        }
      }
    }

    await processDirectory(dirHandle)
    const directories = getDirectoryStructure(files)

    return {
      currentDirectory: '',
      directories,
      files,
      pathMap
    }
  } catch (error) {
    console.error('Error selecting directory:', error)
    throw error
  }
}

// 构建相对路径映射
export async function buildRelativePath(handle: FileSystemDirectoryHandle) {
  const pathMap = new Map<string, FileSystemHandle>()

  const build = async (handle: FileSystemDirectoryHandle, path = '') => {
    const currentPath = path + '/' + handle.name

    if (handle.kind === 'directory') {
      for await (const [, entry] of handle.entries()) {
        if (entry.kind === 'directory') {
          await build(entry as FileSystemDirectoryHandle, currentPath)
        } else if (entry.kind === 'file') {
          pathMap.set('.' + currentPath, entry)
        }
      }
    } else if (handle.kind === 'file') {
      pathMap.set('.' + path, handle)
    }
  }

  await build(handle)
  return pathMap
}

// 清理文件 URL
export function clearFiles(files: FileEntry[]) {
  files.forEach(file => URL.revokeObjectURL(file.url))
}