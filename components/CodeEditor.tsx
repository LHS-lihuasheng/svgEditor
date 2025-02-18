import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Component } from '@/types/svg-editor'

interface CodeEditorProps {
  component: Component
  isOpen: boolean
  onClose: () => void
  onSave: (updatedCode: string) => void
}

export function CodeEditor({ component, isOpen, onClose, onSave }: CodeEditorProps) {
  const [code, setCode] = useState(component.code || '')

  useEffect(() => {
    setCode(component.code || '')
  }, [component.code])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>编辑组件代码</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="font-mono min-h-[300px]"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button onClick={() => {
              onSave(code)
              onClose()
            }}>
              保存
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 