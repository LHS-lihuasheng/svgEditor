import type { BaseComponent } from '@/types/core'

/**
 * @description 组件类型到代码生成函数的映射
 * 可以让多个类似的组件类型共享相同的代码生成逻辑
 */
const TYPE_MAPPING: Record<string, string> = {
  'svgPic': 'svg',
  'svgSeamlessPic': 'svg',
  'g': 'group',
  'rect': 'rect',
  'set': 'set',
  'animate': 'animate',
  'animateTransform': 'animateTransform'
}

// 将组件对象转换为HTML代码字符串
export function generateCode(components: BaseComponent | BaseComponent[]): string {
  // 统一转换为数组
  const componentsArray = Array.isArray(components) ? components : [components]
  return componentsArray.map(component => generateComponentCode(component)).join('\n\n')
}

function generateComponentCode(component: BaseComponent): string {
  // 使用映射表获取组件类型对应的生成函数类型
  const generatorType = TYPE_MAPPING[component.type] || component.type

  // 根据映射后的类型调用相应的生成函数
  switch (generatorType) {
    case 'svg':
      return generateSvgCode(component)
    case 'group':
      return generateGroupCode(component)
    case 'rect':
      return generateRectCode(component)
    case 'set':
      return generateSetCode(component)
    case 'animate':
      return generateAnimateCode(component)
    case 'animateTransform':
      return generateAnimateTransformCode(component)
    default:
      return `<!-- 不支持的组件类型: ${component.type} -->`
  }
}

function generateSvgCode(component: BaseComponent): string {
  const viewBox = component.viewBox || {};
  const vbArray = [
    viewBox.x ?? 0,
    viewBox.y ?? 0,
    viewBox.width ?? 0,
    viewBox.height ?? 0
  ].join(' ');

  // 转换样式时排除定位相关属性
  const filteredStyle = { ...component.style };
  delete filteredStyle.position;
  delete filteredStyle.left;
  delete filteredStyle.top;
  const { styleString, attributesString } = generateStyle(filteredStyle || {});

  // 生成子组件代码
  const children = component.children?.map(child => generateComponentCode(child)).join('\n  ') || '';

  if (vbArray.trim() === '0 0 0 0' || !vbArray.trim()) {
    if (children) {
      return `<svg xmlns="http://www.w3.org/2000/svg" style="${styleString}">
  ${children}
</svg>`;
    } else {
      return `<svg xmlns="http://www.w3.org/2000/svg" style="${styleString}" />`;
    }
  } else {
    if (children) {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbArray}" style="${styleString}">
  ${children}
</svg>`;
    } else {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbArray}" style="${styleString}" />`;
    }
  }
}

function generateGroupCode(component: BaseComponent): string {
  // 处理transform属性
  const transform = component.transform || {};
  const transformParts = [];

  if (transform.translate) {
    transformParts.push(`translate(${transform.translate.x || 0}px, ${transform.translate.y || 0}px)`);
  }

  if (transform.scale) {
    transformParts.push(`scale(${transform.scale})`);
  }

  if (transform.rotate) {
    transformParts.push(`rotate(${transform.rotate}deg)`);
  }

  // 转换样式时排除定位相关属性并添加transform
  const filteredStyle = { ...component.style };
  delete filteredStyle.position;
  delete filteredStyle.left;
  delete filteredStyle.top;

  if (transformParts.length > 0) {
    filteredStyle.transform = transformParts.join(' ');
  }

  const { styleString, attributesString } = generateStyle(filteredStyle || {});
  const styleAttr = styleString ? ` style="${styleString}"` : '';

  // 生成子组件代码
  const children = component.children?.map(child => generateComponentCode(child)).join('\n  ') || '';

  if (children) {
    return `<g${styleAttr}>
  ${children}
</g>`;
  } else {
    return `<g${styleAttr} />`;
  }
}

function generateRectCode(component: BaseComponent): string {
  const attrs = component.attributes || {};
  const { styleString, attributesString } = generateStyle(component.style || {});

  // 合并固有属性和样式属性
  const attrsString = [
    Object.entries(attrs)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' '),
    attributesString
  ].filter(Boolean).join(' ');

  const styleAttr = styleString ? ` style="${styleString}"` : '';

  // 处理子组件
  const children = component.children?.map(child => generateComponentCode(child)).join('\n  ') || '';

  if (children) {
    return `<rect ${attrsString}${styleAttr}>
  ${children}
</rect>`;
  } else {
    return `<rect ${attrsString}${styleAttr} />`;
  }
}

/**
 * @description 生成set动画元素的代码
 */
function generateSetCode(component: BaseComponent): string {
  const attributes = component.attributes ?
    Object.entries(component.attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ') : '';

  const children = component.children?.map(child => generateComponentCode(child)).join('\n') || ''

  if (children) {
    return `<set ${attributes}>
  ${children}
</set>`
  } else {
    return `<set ${attributes} />`
  }
}

// 添加动画元素的代码生成函数
function generateAnimateCode(component: BaseComponent): string {
  const attrs = component.attributes || {};
  const attrsString = Object.entries(attrs)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');

  return `<animate ${attrsString} />`;
}

function generateAnimateTransformCode(component: BaseComponent): string {
  const attrs = component.attributes || {};
  const attrsString = Object.entries(attrs)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');

  return `<animateTransform ${attrsString} />`;
}

// 处理margin对象为字符串
function processMargin(margin: any): string {
  if (typeof margin === 'object') {
    const top = margin.top ?? 0;
    const right = margin.right ?? 0;
    const bottom = margin.bottom ?? 0;
    const left = margin.left ?? 0;
    return `${top}px ${right}px ${bottom}px ${left}px`;
  }
  return margin;
}

function generateStyle(style: Record<string, any>): { styleString: string; attributesString: string } {
  // 创建一个新对象来避免修改原始对象
  const processedStyle: Record<string, any> = { ...style };

  // 处理margin对象
  if (style.margin && typeof style.margin === 'object') {
    processedStyle.margin = processMargin(style.margin);
  }

  // 移除定位相关属性
  delete processedStyle.position;
  delete processedStyle.left;
  delete processedStyle.top;

  // 特殊处理SVG相关样式属性，将它们从style移到attributes
  const svgStyleProps = ['fill', 'stroke', 'strokeWidth', 'fillOpacity', 'strokeOpacity'];
  const svgAttributes: Record<string, any> = {};

  svgStyleProps.forEach(prop => {
    if (processedStyle[prop] !== undefined) {
      // 将驼峰式转为连字符式
      const attributeName = prop.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
      svgAttributes[attributeName] = processedStyle[prop];
      delete processedStyle[prop];
    }
  });

  const styleString = Object.entries(processedStyle)
    .map(([key, value]) => `${hyphenate(key)}: ${value};`)
    .join(' ');

  const attributesString = Object.entries(svgAttributes)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');

  return { styleString, attributesString };
}

// 将驼峰式属性名转换为连字符式
function hyphenate(str: string): string {
  return str.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
} 