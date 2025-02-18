import type { Component } from '@/types/svg-editor'
import { COMPONENT_TEMPLATES } from '@/types/svg-editor'

export function generateCode(components: Component[]): string {
  if (!Array.isArray(components)) return ''

  return components
    .filter((component): component is Component => {
      if (!component || typeof component !== 'object') {
        console.warn('Invalid component found:', component)
        return false
      }
      return true
    })
    .map(component => {
      try {
        // 确保组件类型存在且有效
        if (!component.type || !COMPONENT_TEMPLATES[component.type]) {
          console.warn(`Invalid component type: ${component.type}`)
          return ''
        }

        // 获取代码模板
        const template = COMPONENT_TEMPLATES[component.type]
        let code = component.code || template.code || ''
        
        // 处理子组件
        if (Array.isArray(component.children) && component.children.length > 0) {
          const childrenCode = generateCode(component.children)
          code = code.replace('{children}', childrenCode)
        } else {
          code = code.replace('{children}', '')
        }
        
        return code
      } catch (error) {
        console.error('Error generating code for component:', component, error)
        return ''
      }
    })
    .filter(Boolean)
    .join('\n')
} 