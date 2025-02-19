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

// 新增获取相对路径方法
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