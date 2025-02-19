interface FileSystemDirectoryHandle extends FileSystemHandle {
  entries(): AsyncIterableIterator<[string, FileSystemHandle]>
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