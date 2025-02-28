"use client"

import { useCallback } from "react"
import { cn } from "@/lib/utils"
import { Boxes, ImageIcon, Settings, ChevronLeft, ChevronRight } from "lucide-react"

interface NavBarProps {
  isOpen: boolean
  activeTab: 'components' | 'parameters' | 'assets'
  onTabChange: (tab: 'components' | 'parameters' | 'assets') => void
  onToggle: () => void
}

export function NavBar({ activeTab, onTabChange, isOpen, onToggle }: NavBarProps) {
  const buttons = [
    {
      id: 'components',
      icon: Boxes,
      label: '组件库'
    },
    {
      id: 'parameters',
      icon: Settings,
      label: '参数设置'
    },
    {
      id: 'assets',
      icon: ImageIcon,
      label: '素材管理'
    }
  ]

  // 修改按钮点击处理逻辑
  const handleTabChange = useCallback((tab: 'components' | 'assets' | 'parameters') => {
    // 如果点击的是当前已激活的标签页，则切换侧边栏状态
    if (tab === activeTab) {
      onToggle()
      return
    }

    // 如果当前是收起状态，先展开侧边栏
    if (!isOpen) {
      onToggle()
    }
    // 稍后切换标签页保证动画效果
    setTimeout(() => onTabChange(tab), 50)
  }, [isOpen, onToggle, onTabChange, activeTab])

  return (
    <div className="w-12 border-r flex flex-col">
      {buttons.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          className={cn(
            "h-12 flex items-center justify-center hover:bg-gray-100 transition-colors",
            activeTab === id && "bg-gray-100"
          )}
          onClick={() => handleTabChange(id as 'components' | 'assets' | 'parameters')}
          title={label}
        >
          <Icon className={cn(
            "h-5 w-5 transition-colors",
            activeTab === id ? "text-primary" : "text-muted-foreground"
          )} />
        </button>
      ))}
      <button
        className="mt-auto h-12 flex items-center justify-center hover:bg-gray-100 border-t"
        onClick={onToggle}
      >
        {isOpen ? (
          <ChevronLeft className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
    </div>
  )
} 