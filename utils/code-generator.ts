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
  'set': 'set'
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

  // 转换样式时处理特殊格式
  const style = generateStyle(component.style || {})
  const children = component.children?.map(child => generateComponentCode(child)).join('\n') || ''

  if (children) {
    return `<svg style="${style}" viewBox="${vbArray}" >
  ${children}
</svg>`
  } else {
    return `<svg style="${style}" viewBox="${vbArray}" >
</svg>`
  }
}

function generateGroupCode(component: BaseComponent): string {
  const style = generateStyle(component.style || {})
  const attributes = component.attributes ?
    Object.entries(component.attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ') : '';

  const children = component.children?.map(child => generateComponentCode(child)).join('\n') || ''

  return `<g style="${style}" ${attributes}>
  ${children}
</g>`
}

function generateRectCode(component: BaseComponent): string {
  const style = generateStyle(component.style || {})
  const attributes = component.attributes ?
    Object.entries(component.attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ') : '';

  const children = component.children?.map(child => generateComponentCode(child)).join('\n') || ''

  if (children) {
    return `<rect style="${style}" ${attributes}>
  ${children}
</rect>`
  } else {
    return `<rect style="${style}" ${attributes} />`
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

function generateStyle(style: Record<string, any>): string {
  // 创建一个新对象来避免修改原始对象
  const processedStyle: Record<string, any> = { ...style };

  // 处理margin对象
  if (style.margin && typeof style.margin === 'object') {
    processedStyle.margin = processMargin(style.margin);
  }

  return Object.entries(processedStyle)
    .map(([key, value]) => `${hyphenate(key)}: ${value};`)
    .join(' ')
}

// 将驼峰式属性名转换为连字符式
function hyphenate(str: string): string {
  return str.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)
} 