"use client"

import { useState, useRef } from "react"
import DraftList from "@/components/draft/DraftList"
import DraftEditor from "@/components/draft/DraftEditor"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import type { NewsItem } from "@/types/draft"

export default function DraftsPage() {
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingDraft, setEditingDraft] = useState<NewsItem | undefined>(undefined)
  const [editingMediaId, setEditingMediaId] = useState<string | undefined>(undefined)
  const [refreshKey, setRefreshKey] = useState(0)
  const draftListRef = useRef<{ loadDrafts: () => void } | null>(null)

  const handleCreateDraft = () => {
    setEditingDraft(undefined)
    setEditingMediaId(undefined)
    setIsEditorOpen(true)
  }

  const handleEditDraft = (draft: NewsItem, mediaId: string) => {
    setEditingDraft(draft)
    setEditingMediaId(mediaId)
    setIsEditorOpen(true)
  }

  const handleSaveDraft = () => {
    setIsEditorOpen(false)
    // 刷新草稿列表
    if (draftListRef.current) {
      draftListRef.current.loadDrafts()
    } else {
      setRefreshKey((prev) => prev + 1)
    }
  }

  return (
    <div className="container mx-auto py-6 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <Button onClick={handleCreateDraft}>
          <Plus className="w-4 h-4 mr-2" />
          新建草稿
        </Button>
      </div>

      <DraftList
        key={refreshKey}
        ref={draftListRef}
        onEditDraft={handleEditDraft}
      />

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
          <DraftEditor
            initialDraft={editingDraft}
            mediaId={editingMediaId}
            onSave={handleSaveDraft}
            onCancel={() => setIsEditorOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

