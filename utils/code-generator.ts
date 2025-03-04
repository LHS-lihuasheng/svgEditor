import { Component } from '@/types/atomicComponent'

// 将组件对象转换为HTML代码字符串
export function generateCode(components: Component | Component[]): string {
  // 统一转换为数组
  const componentsArray = Array.isArray(components) ? components : [components]
  return componentsArray.map(component => generateComponentCode(component)).join('\n\n')
}

function generateComponentCode(component: Component): string {
  switch (component.type) {
    case 'svg':
      return generateSvgCode(component)
    default:
      return `<!-- Unsupported component type: ${component.type} -->`
  }
}

function generateSvgCode(component: Component): string {
  const viewBox = component.viewBox || {};
  const vbArray = [
    viewBox.x ?? 0,
    viewBox.y ?? 0,
    viewBox.width ?? 0,
    viewBox.height ?? 0
  ].join(' ');

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

function generateStyle(style: React.CSSProperties): string {
  // 处理margin对象
  if (style.margin && typeof style.margin === 'object') {
    const m = style.margin as any;
    const top = m.top ?? 0;
    const right = m.right ?? top;
    const bottom = m.bottom ?? top;
    const left = m.left ?? right ?? top;
    style.margin = `${top}px ${right}px ${bottom}px ${left}px`;
  }

  return Object.entries(style)
    .map(([key, value]) => `${hyphenate(key)}: ${value};`)
    .join(' ')
}

// 将驼峰式属性名转换为连字符式
function hyphenate(str: string): string {
  return str.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)
} 