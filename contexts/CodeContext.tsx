"use client"

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { generateCode } from '@/utils/code-generator'
import { useEditor } from './EditorContext'

// 定义上下文类型
interface CodeContextType {
  code: string                // 生成的代码
  regenerateCode: () => void  // 重新生成代码的方法
  isGenerating: boolean       // 是否正在生成代码
}

// 创建上下文
const CodeContext = createContext<CodeContextType | undefined>(undefined)

// 提供者组件
export function CodeProvider({ children }: { children: ReactNode }) {
  const { components } = useEditor()
  const [code, setCode] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState<boolean>(false)

  // 重新生成代码的方法
  const regenerateCode = useCallback(() => {
    setIsGenerating(true)
    try {
      const generatedCode = generateCode(components)
      setCode(generatedCode)
    } catch (error) {
      console.error('代码生成失败:', error)
    } finally {
      setIsGenerating(false)
    }
  }, [components])

  // 当组件变化时自动重新生成代码
  useEffect(() => {
    regenerateCode()
  }, [components, regenerateCode])

  return (
    <CodeContext.Provider
      value={{
        code,
        regenerateCode,
        isGenerating,
      }}
    >
      {children}
    </CodeContext.Provider>
  )
}

// 自定义 hook，用于访问代码上下文
export function useCode() {
  const context = useContext(CodeContext)
  if (context === undefined) {
    throw new Error('useCode must be used within a CodeProvider')
  }
  return context
} 