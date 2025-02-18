import { useState } from 'react'
import { Button } from "@/components/ui/button"
import type { Component } from '@/types/svg-editor'

interface GroupManagerProps {
  components: Component[]
  onGroup: (componentIds: string[], groupId: string) => void
}

export function GroupManager({ components, onGroup }: GroupManagerProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const handleCreateGroup = () => {
    const groupId = `group-${Date.now()}`
    onGroup(selectedIds, groupId)
    setSelectedIds([])
  }

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        className="w-full"
        onClick={handleCreateGroup}
        disabled={selectedIds.length < 2}
      >
        创建新组 ({selectedIds.length}个选中)
      </Button>
      
      <div className="space-y-2">
        {components.map(component => (
          <div 
            key={component.id}
            className={`p-2 rounded cursor-pointer hover:bg-accent ${
              selectedIds.includes(component.id) ? 'bg-accent' : ''
            }`}
            onClick={() => setSelectedIds(prev => 
              prev.includes(component.id) 
                ? prev.filter(id => id !== component.id) 
                : [...prev, component.id]
            )}
          >
            {component.type} - {component.id}
          </div>
        ))}
      </div>
    </div>
  )
} 