"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Search, SlidersHorizontal } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SlideComponentPreview from "./SlideComponentPreview"

const tools = [
  {
    id: "slide-layout",
    name: "左右滑动布局",
    icon: SlidersHorizontal,
    component: SlideComponentPreview,
    defaultProps: {
      type: "slide",
      elements: [],
      activeIndex: 0,
    },
  },
  // ... other tools
]

export default function ToolPanel({ onAddComponent }) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleDragStart = (tool) => (event) => {
    event.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        ...tool.defaultProps,
        id: `${tool.id}-${Date.now()}`,
      }),
    )
  }

  return (
    <div className="w-80 border-r bg-gray-50">
      <div className="p-4">
        <Tabs defaultValue="all">
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">
              全部
            </TabsTrigger>
            <TabsTrigger value="my" className="flex-1">
              我的
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜索组件..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="p-4">
          {tools
            .filter((tool) => tool.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((tool) => (
              <div
                key={tool.id}
                draggable
                onDragStart={handleDragStart(tool)}
                onClick={() => onAddComponent(tool.defaultProps)}
                className="mb-4 cursor-pointer"
              >
                <div className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <tool.icon className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">{tool.name}</span>
                  </div>
                  {tool.component && <tool.component />}
                </div>
              </div>
            ))}
        </div>
      </ScrollArea>
    </div>
  )
}

