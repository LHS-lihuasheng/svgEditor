import { openDB } from 'idb'

export interface FileEntry {
  path: string
  type: 'image'
  name: string
  lastModified: number
  size: number
  url: string
  directory: string
}

interface FileSystemState {
  currentDirectory: string
  directories: string[]
  files: FileEntry[]
}

interface FileSystemDirectoryHandle extends FileSystemHandle {
  entries(): AsyncIterableIterator<[string, FileSystemHandle]>
}

// 初始化 IndexedDB
async function initDB() {
  return openDB('assets-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('files')) {
        const store = db.createObjectStore('files', { keyPath: 'path' })
        store.createIndex('by-directory', 'directory')
      }
    },
  })
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
      // 添加当前目录及其所有父目录
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
    const db = await initDB()

    async function processDirectory(handle: FileSystemDirectoryHandle, path = '') {
      for await (const entry of handle.values()) {
        const relativePath = path ? `${path}/${entry.name}` : entry.name

        if (entry.kind === 'file') {
          const file = await entry.getFile()
          if (file.type.startsWith('image/')) {
            const fileEntry: FileEntry = {
              path: relativePath,
              type: 'image',
              name: entry.name,
              lastModified: file.lastModified,
              size: file.size,
              url: URL.createObjectURL(file),
              directory: normalizePath(path)
            }

            await db.put('files', fileEntry)
            files.push(fileEntry)
          }
        } else if (entry.kind === 'directory') {
          await processDirectory(entry, relativePath)
        }
      }
    }

    await processDirectory(dirHandle)
    const directories = getDirectoryStructure(files)

    return {
      currentDirectory: '',
      directories,
      files
    }
  } catch (error) {
    console.error('Error selecting directory:', error)
    throw error
  }
}

// 从 IndexedDB 加载文件
export async function loadFiles(): Promise<FileSystemState> {
  const db = await initDB()
  const files = await db.getAll('files')
  const directories = getDirectoryStructure(files)

  return {
    currentDirectory: '',
    directories,
    files
  }
}

// 获取指定目录下的文件
export async function getFilesInDirectory(directory: string): Promise<FileEntry[]> {
  const db = await initDB()
  const index = db.transaction('files').store.index('by-directory')
  return index.getAll(directory)
}

// 清理文件 URL
export async function clearFiles() {
  const db = await initDB()
  const files = await db.getAll('files')
  files.forEach(file => URL.revokeObjectURL(file.url))
  await db.clear('files')
}

export async function buildRelativePath(handle: FileSystemDirectoryHandle) {
  const pathMap = new Map<string, FileSystemHandle>()

  const build = async (handle: FileSystemDirectoryHandle, path = '') => {
    const currentPath = path + '/' + handle.name

    if (handle.kind === 'directory') {
      for await (const [, entry] of handle.entries() as AsyncIterableIterator<[string, FileSystemHandle]>) {
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