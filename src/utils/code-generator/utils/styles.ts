/**
 * @description 生成样式属性字符串
 * @param {Record<string, any>} style - 样式对象
 * @returns {string} 样式属性字符串
 */
export function generateStyleAttributes(style: Record<string, any>): string {
  if (!style || Object.keys(style).length === 0) return '';

  // 创建一个处理过的样式对象
  const processedStyle = { ...style };

  // 移除空值
  Object.keys(processedStyle).forEach(key => {
    const value = processedStyle[key];
    if (value === undefined || value === null ||
      (typeof value === 'string' && value.trim() === '')) {
      delete processedStyle[key];
    }
  });

  // 移除定位相关属性
  removePositioningProps(processedStyle);

  // 处理特殊样式属性
  processSpecialStyleProps(processedStyle);

  // 提取SVG特定属性
  const svgAttributes = extractSvgStyleAttributes(processedStyle);

  // 过滤并生成style字符串
  const styleEntries = Object.entries(processedStyle).filter(([_, value]) =>
    value !== undefined && value !== null &&
    !(typeof value === 'string' && value.trim() === '')
  );

  const styleStr = styleEntries.length > 0
    ? styleEntries
      .map(([key, value]) => `${kebabCase(key)}: ${formatStyleValue(key, value)};`)
      .join(' ')
    : '';

  // 过滤并生成SVG属性字符串
  const attrEntries = Object.entries(svgAttributes).filter(([_, value]) =>
    value !== undefined && value !== null &&
    !(typeof value === 'string' && value.trim() === '')
  );

  const attrsStr = attrEntries.length > 0
    ? attrEntries
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ')
    : '';

  // 合并属性和样式
  return attrsStr + (styleStr ? ` style="${styleStr}"` : '');
}

/**
 * @description 移除定位相关属性
 * @param {Record<string, any>} style - 样式对象
 */
export function removePositioningProps(style: Record<string, any>): void {
  const positioningProps = [
    'position', 'left', 'top', 'right', 'bottom',
    'zIndex', 'float', 'clear', 'transform', 'transformOrigin'
  ];

  positioningProps.forEach(prop => {
    delete style[prop];
  });
}

/**
 * @description 处理特殊样式属性
 * @param {Record<string, any>} style - 样式对象
 */
export function processSpecialStyleProps(style: Record<string, any>): void {
  // 处理margin对象
  if (style.margin && typeof style.margin === 'object') {
    style.margin = processMargin(style.margin);
  }
}

/**
 * @description 提取SVG特定样式属性
 * @param {Record<string, any>} style - 样式对象
 * @returns {Record<string, any>} SVG特定属性
 */
export function extractSvgStyleAttributes(style: Record<string, any>): Record<string, any> {
  const svgStyleProps = ['fill', 'stroke', 'strokeWidth', 'fillOpacity', 'strokeOpacity'];
  const svgAttributes: Record<string, any> = {};

  svgStyleProps.forEach(prop => {
    if (style[prop] !== undefined) {
      const attributeName = kebabCase(prop);
      svgAttributes[attributeName] = style[prop];
      delete style[prop];
    }
  });

  return svgAttributes;
}

/**
 * @description 将驼峰命名转换为短横线命名
 * @param {string} str - 驼峰命名字符串
 * @returns {string} 短横线命名字符串
 */
export function kebabCase(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * @description 格式化样式值
 * @param {string} key - 样式属性名
 * @param {any} value - 样式值
 * @returns {string} 格式化后的样式值
 */
export function formatStyleValue(key: string, value: any): string {
  // 处理undefined和null
  if (value === undefined || value === null) {
    return '';
  }

  // 处理数字值，添加px单位（排除不需要单位的属性）
  const noUnitProps = ['opacity', 'zIndex', 'fontWeight', 'lineHeight', 'scale'];
  if (typeof value === 'number' && !noUnitProps.includes(key)) {
    return `${value}px`;
  }

  // 特殊处理背景图像路径
  if (key === 'backgroundImage' && typeof value === 'string') {
    // 去除多余空格
    const cleanValue = value.trim();

    // 如果value已经是url格式，提取并清理路径
    if (cleanValue.startsWith('url(')) {
      const path = extractPath(cleanValue);
      // 为代码预览使用双引号格式
      return `url("${encodeURI(path.trim())}")`;
    }
    // 如果只是路径，添加url()并使用双引号
    return `url("${encodeURI(cleanValue)}")`;
  }

  return String(value);
}

/**
 * @description 处理margin对象为字符串
 * @param {any} margin - margin对象
 * @returns {string} 格式化的margin字符串
 */
export function processMargin(margin: any): string {
  if (typeof margin === 'object') {
    const top = margin.top ?? 0;
    const right = margin.right ?? 0;
    const bottom = margin.bottom ?? 0;
    const left = margin.left ?? 0;
    return `${top}px ${right}px ${bottom}px ${left}px`;
  }
  return margin;
}

// 在生成 SVG 代码时统一处理背景图像
function processBackgroundImage(value: string): string {
  // 确保我们只处理纯路径
  const path = value.startsWith('url') ? extractPath(value) : value.trim();

  if (!path) return '';

  // 安全地构造 URL，确保没有多余的空白字符
  return `url("${encodeURI(path)}")`;
}

// 辅助函数提取路径
function extractPath(cssUrl: string): string {
  if (!cssUrl) return '';

  // 提取路径并移除多余空白
  const match = cssUrl.match(/url\((['"]?)([\s\S]+?)\1\)/);
  if (!match) return cssUrl;

  // 清理路径中的空白字符
  return match[2].trim();
} 