export const parseCodeToAST = (code: string): ComponentNode => {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(code, 'image/svg+xml')
    const root = doc.documentElement

    const parseElement = (element: Element): ComponentNode => {
      const attributes: Record<string, AttributeValue> = {}
      
      // 解析属性
      Array.from(element.attributes).forEach(attr => {
        const value = attr.value.trim()
        // 检测表达式模式：{expression}
        if (/^{.+}$/.test(value)) {
          attributes[attr.name] = {
            type: 'expression',
            value: value.slice(1, -1).trim()
          }
        } else if (!isNaN(Number(value)) && value !== '') {
          attributes[attr.name] = Number(value)
        } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
          attributes[attr.name] = value.toLowerCase() === 'true'
        } else {
          attributes[attr.name] = value
        }
      })

      // 解析子节点
      const children: ComponentNode[] = []
      Array.from(element.childNodes).forEach(child => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          children.push(parseElement(child as Element))
        } else if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
          children.push({
            type: 'text',
            value: child.textContent.trim()
          })
        }
      })

      return {
        type: 'element',
        name: element.tagName.toLowerCase(),
        attributes,
        children
      }
    }

    return parseElement(root)
  } catch (error) {
    console.error('解析错误:', error)
    return {
      type: 'element',
      name: 'svg',
      attributes: {},
      children: []
    }
  }
}

export const generateCodeFromAST = (ast: ComponentNode): string => {
  const indent = (level: number) => '  '.repeat(level)
  
  const buildAttributes = (attrs: Record<string, AttributeValue>): string => {
    return Object.entries(attrs)
      .map(([key, value]) => {
        if (typeof value === 'object' && 'type' in value) {
          return `${key}="{${value.value}}"`
        }
        if (typeof value === 'string') {
          return `${key}="${value}"`
        }
        return `${key}={${value}}`
      })
      .join(' ')
  }

  const buildNode = (node: ComponentNode, level: number = 0): string => {
    let output = ''
    
    if (node.type === 'element') {
      const attrs = buildAttributes(node.attributes || {})
      const children = node.children?.map(child => buildNode(child, level + 1)).join('\n') || ''
      
      output += `${indent(level)}<${node.name}${attrs ? ' ' + attrs : ''}`
      
      if (children) {
        output += `>\n${children}\n${indent(level)}</${node.name}>`
      } else {
        output += ' />'
      }
    } else if (node.type === 'text') {
      output += `${indent(level)}${node.value}`
    }

    return output
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n${buildNode(ast)}`
} 