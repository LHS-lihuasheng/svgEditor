/**
 * @description 生成属性字符串
 * @param {Record<string, any>} attributes - 属性对象
 * @returns {string} 属性字符串
 */
export function generateAttributes(attributes: Record<string, any>): string {
  if (!attributes || Object.keys(attributes).length === 0) return '';

  return Object.entries(attributes)
    .filter(([_, value]) => {
      // 过滤掉undefined、null、空字符串和只有空格的字符串
      if (value === undefined || value === null) return false;
      if (typeof value === 'string' && value.trim() === '') return false;
      return true;
    })
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');
}

/**
 * @description 处理动画属性，根据动画类型过滤属性
 * @param {Record<string, any>} attributes - 属性对象
 * @param {string} animationType - 动画类型
 * @returns {Record<string, any>} 处理后的属性
 */
export function processAnimationAttributes(
  attributes: Record<string, any>,
  animationType: string
): Record<string, any> {
  const processedAttributes = { ...attributes };

  // 清理空值属性
  Object.keys(processedAttributes).forEach(key => {
    const value = processedAttributes[key];
    if (value === undefined || value === null ||
      (typeof value === 'string' && value.trim() === '')) {
      delete processedAttributes[key];
    }
  });

  return processedAttributes;
} 