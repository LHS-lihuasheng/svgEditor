import { create } from 'zustand'

interface FileSystemState {
    pathToHandleMap: Map<string, FileSystemHandle>
    setPathMap: (map: Map<string, FileSystemHandle>) => void
    updatePath: (oldPath: string, newPath: string, handle: FileSystemHandle) => void
    clear: () => void
}

export const useFileSystem = create<FileSystemState>((set) => ({
    pathToHandleMap: new Map(),

    setPathMap: (map) => set({ pathToHandleMap: new Map(map) }),

    updatePath: (oldPath, newPath, handle) => set((state) => {
        const newMap = new Map(state.pathToHandleMap)
        newMap.delete(oldPath)
        newMap.set(newPath, handle)
        return { pathToHandleMap: newMap }
    }),

    clear: () => set({ pathToHandleMap: new Map() })
})) 