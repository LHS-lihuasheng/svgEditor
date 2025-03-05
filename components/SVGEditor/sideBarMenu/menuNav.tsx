"use client"

import { useCallback } from "react"
import { cn } from "@/lib/utils"
import { Boxes, ImageIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { usePanel } from "@/contexts/PanelContext"

interface NavButtonProps {
  id: string
  label: string
  icon: any
  currentActiveTab: string
  handleTabChange: (tab: 'components' | 'assets') => void
}

function NavButton({ id, label, icon: Icon, currentActiveTab, handleTabChange }: NavButtonProps) {
  return (
    <button
      key={id}
      className={cn(
        "h-12 flex items-center justify-center hover:bg-gray-100 transition-colors",
        currentActiveTab === id && "bg-gray-100"
      )}
      onClick={() => handleTabChange(id as 'components' | 'assets')}
      title={label}
    >
      <Icon className={cn(
        "h-5 w-5 transition-colors",
        currentActiveTab === id ? "text-primary" : "text-muted-foreground"
      )} />
    </button>
  )
}

export function NavBar() {
  const { isMenuBarOpen, toggleMenuBar, activeTab, setActiveTab } = usePanel()

  const navButtons: { id: string, icon: any, label: string }[] = [
    {
      id: 'components',
      icon: Boxes,
      label: '组件库'
    },
    {
      id: 'assets',
      icon: ImageIcon,
      label: '素材管理'
    }
  ]

  // 修改按钮点击处理逻辑
  const handleTabChange = useCallback((tab: 'components' | 'assets') => {
    // 如果点击的是当前已激活的标签页，则切换侧边栏状态
    if (tab === activeTab) {
      toggleMenuBar()
      return
    }

    // 如果当前是收起状态，先展开侧边栏
    if (!isMenuBarOpen) {
      toggleMenuBar()
    }
    // 稍后切换标签页保证动画效果
    setTimeout(() => setActiveTab(tab), 50)
  }, [isMenuBarOpen, setActiveTab, activeTab])

  return (
    <div className="w-12 border-r flex flex-col">
      {/* 侧边栏按钮 */}
      {navButtons.map(({ id, icon, label }) => (
        <NavButton
          key={id}
          id={id}
          label={label}
          icon={icon}
          currentActiveTab={activeTab}
          handleTabChange={handleTabChange}
        />
      ))}

      {/* 侧边栏折叠按钮 */}
      <button
        className="mt-auto h-12 flex items-center justify-center hover:bg-gray-100 border-t"
        onClick={toggleMenuBar}
      >
        {isMenuBarOpen ? (
          <ChevronLeft className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
    </div>
  )
}

