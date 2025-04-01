import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import type { ImageAsset, DirectoryNode } from "@/types/asset"


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

// 获取图片尺寸
export const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.src = url
    img.onload = () => resolve({
      width: img.naturalWidth,
      height: img.naturalHeight
    })
  })
}

// 从文件中创建图片资产
export const createImageAssetFromFile = async (
  file: File,
  relativePath: string,
  directory: string = ''
): Promise<ImageAsset> => {
  const url = URL.createObjectURL(file)
  const dimensions = await getImageDimensions(url)

  return {
    name: file.name,
    relativePath,
    url,
    dimensions,
    lastModified: file.lastModified,
    directory,
    size: file.size
  }
}

// 处理目录路径
export const normalizePath = (path: string): string => {
  return path.replace(/^\/+|\/+$/g, '')
}

// 获取资源和目录结构信息
export const getImageAssetsWithDirectories = async (
  currentDirectory: FileSystemDirectoryHandle,
  rootDirectory: FileSystemDirectoryHandle,
): Promise<{ assets: Map<string, ImageAsset>, directories: string[] }> => {
  const newAssets = new Map<string, ImageAsset>()
  const directories = new Set<string>()

  for await (const [, handle] of (currentDirectory as any).entries()) {
    if (handle.kind === 'file') {
      const fileHandle = handle as FileSystemFileHandle
      const file = await fileHandle.getFile()

      if (file.name.match(/\.(jpg|jpeg|png|gif|svg)$/i)) {
        try {
          const pathArray = await rootDirectory.resolve(fileHandle);
          if (pathArray) {
            const relativePath = './' + pathArray.join('/')
            const directory = pathArray.slice(0, -1).join('/')

            if (directory) {
              directories.add(directory)
            }

            const asset = await createImageAssetFromFile(file, relativePath, directory)
            newAssets.set(relativePath, asset)
          } else {
            console.warn(`无法解析文件路径: ${fileHandle.name}`);
          }
        } catch (error) {
          console.error(`处理文件 ${fileHandle.name} 时出错:`, error);
        }
      }
    } else if (handle.kind === 'directory' && !handle.name.startsWith('.')) {
      const dirHandle = handle as FileSystemDirectoryHandle

      try {
        const dirPathArray = await rootDirectory.resolve(dirHandle);
        if (dirPathArray) {
          const directoryPath = dirPathArray.join('/');
          directories.add(directoryPath);

          const result = await getImageAssetsWithDirectories(dirHandle, rootDirectory)

          for (const [path, asset] of result.assets.entries()) {
            newAssets.set(path, asset)
          }
          result.directories.forEach(dir => directories.add(dir))
        } else {
          console.warn(`无法解析目录路径: ${dirHandle.name}`);
        }
      } catch (error) {
        console.error(`处理目录 ${dirHandle.name} 时出错:`, error);
      }
    }
  }

  return {
    assets: newAssets,
    // 对最终的目录列表进行排序
    directories: Array.from(directories).sort()
  }
}

// 过滤指定目录的资源
export const filterAssetsByDirectory = (
  assets: Map<string, ImageAsset>,
  directory: string
): ImageAsset[] => {
  const result: ImageAsset[] = []

  for (const asset of assets.values()) {
    if (directory === 'root'
      ? (asset.directory === '' || !asset.directory)
      : asset.directory === directory) {
      result.push(asset)
    }
  }

  return result
}

// 自然排序函数 - 数字部分按数值排序
export const naturalSortCompare = (a: string, b: string): number => {
  return a.localeCompare(b, 'zh-CN', { numeric: true, sensitivity: 'base' });
}

// DirectoryTree Node 构建
export const buildDirectoryTree = (directories: string[]): DirectoryNode[] => {
  const root: DirectoryNode[] = []
  const map: { [key: string]: DirectoryNode } = {}

  const sortedDirectories = [...directories].sort((a, b) => a.split('/').length - b.split('/').length);

  sortedDirectories.forEach(path => {
    const parts = path.split('/')
    const name = parts[parts.length - 1]
    const parentPath = parts.slice(0, -1).join('/')

    const node: DirectoryNode = {
      name,
      path,
      children: []
    }

    map[path] = node

    if (parentPath) {
      const parent = map[parentPath]
      parent?.children.push(node)
      parent?.children.sort((a, b) => naturalSortCompare(a.name, b.name));
    } else {
      root.push(node)
      root.sort((a, b) => naturalSortCompare(a.name, b.name));
    }
  })

  return root
}

// PreviewTab 辅助函数
export const prepareCodeForPreview = (svgCode: string): string => {
  return svgCode.replace(
    /background-image:\s*url\("([^"]+)"\)/g,
    'background-image: url(\'$1\')'
  );
};

export const processImagePaths = (svgCode: string, findImageByPath: (path: string) => ImageAsset | undefined): string => {
  const codeWithSingleQuotes = prepareCodeForPreview(svgCode);

  return codeWithSingleQuotes.replace(
    /background-image:\s*url\('([^']+)'\)/g,
    (match, path) => {
      const cleanPath = path.trim();
      const imageAsset = findImageByPath(cleanPath);

      if (imageAsset) {
        return `background-image: url('${imageAsset.url}')`;
      }
      return match;
    }
  );
};

export const generatePreviewHTML = (code: string, findImageByPath: (path: string) => ImageAsset | undefined): string => {
  const processedCode = processImagePaths(code, findImageByPath);
  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * {
            margin: 0;
            padding: 0;
            max-width: 100% !important;
            box-sizing: border-box !important;
            -webkit-box-sizing: border-box !important;
            word-wrap: break-word !important;
          }
          
          body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: transparent;
            user-select: none;
            -webkit-user-select: none;
            cursor: default !important;
          }
          
          .rich_media_content {
            overflow: hidden;
            color: #333;
            font-size: 17px;
            word-wrap: break-word;
            -webkit-hyphens: auto;
            -ms-hyphens: auto;
            hyphens: auto;
            text-align: justify;
            position: relative;
            z-index: 0;
            background-color: white;
            width: 100%;
            height: 100%;
          }
          
          .svg-container {
            width: 100%;
            height: 100%;
            background-color: white;
            overflow: auto;
            position: relative;
          }
        </style>
      </head>
      <body>
        <div class="rich_media_content">
          <div class="svg-container">
            ${processedCode}
          </div>
        </div>
      </body>
    </html>
  `;
};
