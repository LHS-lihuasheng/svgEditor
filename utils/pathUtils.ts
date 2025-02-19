/**
 * 统一资源路径规范化处理
 */
export const normalizeAssetPath = (path: string): string => {
  return path
    .replace(/^\.?\/?/, './')    // 确保以./开头
    .replace(/\/+/g, '/')        // 合并连续斜杠
    .replace(/\/$/, '')          // 移除末尾斜杠
    .replace(/\\/g, '/')         // 转换反斜杠为正斜杠
    .toLowerCase()               // 统一小写
}

/**
 * 格式化显示路径（确保以./开头）
 */
export const formatDisplayPath = (path: string): string => {
  return path.startsWith('./') ? path : `./${path}`
} 