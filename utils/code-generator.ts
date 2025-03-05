import type { BaseComponent } from '@/types/atomicComponents/baseComponent'
import type { SVGPicComponent } from '@/types/atomicComponents/svgComponent'
import type { CSSProperties } from 'react'

// 将组件对象转换为HTML代码字符串
export function generateCode(components: BaseComponent | BaseComponent[]): string {
  // 统一转换为数组
  const componentsArray = Array.isArray(components) ? components : [components]
  return componentsArray.map(component => generateComponentCode(component)).join('\n\n')
}

function generateComponentCode(component: BaseComponent): string {
  switch (component.type) {
    case 'svgPic':
      return generateSvgCode(component as SVGPicComponent)
    case 'g':
      return generateGroupCode(component)
    case 'rect':
      return generateRectCode(component)
    default:
      return `<!-- 不支持的组件类型: ${component.type} -->`
  }
}

function generateSvgCode(component: SVGPicComponent): string {
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

  return `<rect style="${style}" ${attributes} />`
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