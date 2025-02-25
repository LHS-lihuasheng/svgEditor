"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { createDraft, updateDraft, uploadMaterial } from "@/lib/api"
import { useDraftCache } from "@/hooks/useDraftCache"
import { useImageCrop } from "@/hooks/useImageCrop"
import { CoverImageUploader } from "./CoverImageUploader"
import type { NewsItem, CropState, CroppedImages } from "@/types/draft"
import { useLocalStorage } from "@/hooks/useLocalStorage"

interface DraftEditorProps {
  initialDraft?: NewsItem
  mediaId?: string
  index?: number
  onSave: () => void
  onCancel: () => void
}

export default function DraftEditor({
  initialDraft,
  mediaId,
  index = 0,
  onSave,
  onCancel
}: DraftEditorProps) {
  const { cache, updateCache, clearCache } = useDraftCache(mediaId)
  const [draft, setDraft] = useState<NewsItem>(() => {
    const defaultDraft = {
      article_type: "news",
      title: "",
      author: "",
      digest: "",
      content: "",
      content_source_url: "",
      thumb_media_id: "",
      need_open_comment: 0,
      only_fans_can_comment: 0,
      show_cover_pic: 0,
      url: "",
    }

    return cache || initialDraft || defaultDraft
  })

  const {
    originalImage,
    setOriginalImage,
    croppedImages,
    crops,
    isCropDialogOpen,
    setIsCropDialogOpen,
    handleCropComplete,
  } = useImageCrop(cache?.originalImage || null, cache?.crops)

  const [accessToken, setAccessToken] = useState<string | null>(null)
  const { value: cachedToken, setValue: setCachedToken } = useLocalStorage<{ token: string, expiry: number } | null>("accessToken", null)

  useEffect(() => {
    const fetchToken = async () => {
      if (cachedToken && cachedToken.expiry > Date.now()) {
        setAccessToken(cachedToken.token)
        return
      }

      try {
        const response = await fetch('/api/token')
        const data = await response.json()

        if (!data.error && !data.errcode) {
          setAccessToken(data.access_token)
          setCachedToken({
            token: data.access_token,
            expiry: Date.now() + (data.expires_in - 300) * 1000
          })
        }
      } catch (err) {
        console.error("获取访问令牌失败:", err)
      }
    }

    fetchToken()
  }, [cachedToken, setCachedToken])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const updatedDraft = { ...draft, [name]: value }
    setDraft(updatedDraft)
    updateCache(updatedDraft)
  }

  const handleSwitchChange = (name: string) => (checked: boolean) => {
    const updatedDraft = { ...draft, [name]: checked ? 1 : 0 }
    setDraft(updatedDraft)
    updateCache(updatedDraft)
  }

  const handleImageSelect = (imageUrl: string) => {
    setOriginalImage(imageUrl)
    updateCache({ originalImage: imageUrl })
    setIsCropDialogOpen(true)
  }

  const handleCropCompleted = useCallback((result: { crops: CropState; images: CroppedImages }) => {
    const updates = handleCropComplete(result)
    setDraft(prev => ({ ...prev, ...updates }))
    updateCache(updates)
  }, [handleCropComplete, updateCache])

  const handleSave = useCallback(async () => {
    if (!accessToken || !draft.title || !draft.content || !draft.thumb_media_id) {
      return
    }

    try {
      if (mediaId) {
        await updateDraft(mediaId, index, draft)
      } else {
        await createDraft([draft])
      }
      clearCache()
      onSave()
    } catch (error) {
      console.error("Error saving draft:", error)
    }
  }, [draft, mediaId, index, accessToken, onSave, clearCache])

  const handleCancel = () => {
    clearCache()
    onCancel()
  }

  const handleContentImageUpload = async (file: File) => {
    try {
      const { media_id, url } = await uploadMaterial(file, "image")
      return url
    } catch (error) {
      console.error("Error uploading content image:", error)
      return null
    }
  }

  const handleCoverImageUpload = async (file: File) => {
    try {
      const { media_id, url } = await uploadMaterial(file, "image")
      setDraft(prev => ({
        ...prev,
        thumb_media_id: media_id
      }))
      return url
    } catch (error) {
      console.error("Error uploading cover image:", error)
      return null
    }
  }

  return (
    <div className="space-y-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <div>
        <Label htmlFor="title">标题</Label>
        <Input id="title" name="title" value={draft.title} onChange={handleInputChange} />
      </div>
      <div>
        <Label htmlFor="author">作者</Label>
        <Input id="author" name="author" value={draft.author} onChange={handleInputChange} />
      </div>
      <div>
        <Label htmlFor="digest">摘要</Label>
        <Textarea
          id="digest"
          name="digest"
          value={draft.digest}
          onChange={handleInputChange}
          placeholder="不填写将自动提取正文前54个字"
        />
      </div>
      <div>
        <Label htmlFor="content">正文内容</Label>
        <Textarea
          id="content"
          name="content"
          value={draft.content}
          onChange={handleInputChange}
          maxLength={20000}
        />
      </div>
      <CoverImageUploader
        originalImage={originalImage}
        croppedImages={croppedImages}
        crops={crops}
        isCropDialogOpen={isCropDialogOpen}
        onImageSelect={handleImageSelect}
        onImageUpload={handleCoverImageUpload}
        onCropDialogClose={() => setIsCropDialogOpen(false)}
        onCropComplete={handleCropCompleted}
        initialCrops={cache?.cropState}
        maxSize={10 * 1024 * 1024}
        acceptedFormats={["image/jpeg", "image/png", "image/gif", "image/bmp"]}
      />
      <div className="flex items-center space-x-2">
        <Switch
          id="need_open_comment"
          checked={draft.need_open_comment === 1}
          onCheckedChange={handleSwitchChange("need_open_comment")}
        />
        <Label htmlFor="need_open_comment">开启评论</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="only_fans_can_comment"
          checked={draft.only_fans_can_comment === 1}
          onCheckedChange={handleSwitchChange("only_fans_can_comment")}
        />
        <Label htmlFor="only_fans_can_comment">仅粉丝可评论</Label>
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handleCancel}>
          取消
        </Button>
        <Button onClick={handleSave}>保存</Button>
      </div>
    </div>
  )
}

