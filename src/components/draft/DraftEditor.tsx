"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useMessage } from '@/contexts/MessageContext'
import { createDraft, updateDraft, uploadMaterial } from "@/lib/api"
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
  // 在组件内部
  const { tip } = useMessage()
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

    return initialDraft || defaultDraft
  })

  const {
    originalImage,
    setOriginalImage,
    croppedImages,
    crops,
    isCropDialogOpen,
    setIsCropDialogOpen,
    handleCropComplete,
  } = useImageCrop(null, undefined)

  const [accessToken, setAccessToken] = useState<string | null>(null)
  const { value: cachedToken, setValue: setCachedToken } = useLocalStorage<{ token: string, expiry: number } | null>("accessToken", null)

  useEffect(() => {
    if (cachedToken && cachedToken.expiry > Date.now()) {
      setAccessToken(cachedToken.token)
      return
    }

    const fetchToken = async () => {
      try {
        const response = await fetch('/api/token')

        if (!response.ok) {
          // 请求失败，HTTP 状态码非 2xx
          const errorData = await response.json()
          tip(`获取访问令牌失败: ${errorData.message || '请稍后重试'}`)
          setAccessToken(null)
          return
        }

        const data = await response.json()

        // 检查微信 API 返回的错误码
        if (data.errcode) {
          tip(`微信 API 错误: ${data.errmsg} (错误码: ${data.errcode})`)
          setAccessToken(null)
          return
        }

        // 成功获取 token
        setAccessToken(data.access_token)
        setCachedToken({
          token: data.access_token,
          expiry: Date.now() + (data.expires_in - 300) * 1000
        })
      } catch (err) {
        console.error("获取访问令牌失败:", err)
        tip('网络请求失败，无法获取微信访问令牌')
        setAccessToken(null)
      }
    }

    fetchToken()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setDraft(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSwitchChange = (name: string) => (checked: boolean) => {
    setDraft(prev => ({
      ...prev,
      [name]: checked ? 1 : 0
    }))
  }

  const handleImageSelect = (file: File) => {
    const fileUrl = URL.createObjectURL(file)
    setOriginalImage({
      file,
      url: fileUrl
    })
    setIsCropDialogOpen(true)
  }

  const handleCropCompleted = async (result: { crops: CropState; images: CroppedImages }) => {
    // 从第一个Base64图像创建File对象以上传
    try {
      const base64Crop = result.images.crop235 || result.images.crop11
      if (!base64Crop) return

      // 将base64转换为Blob
      const fetchRes = await fetch(base64Crop)
      const blob = await fetchRes.blob()

      // 创建File对象
      const file = new File([blob], "cover.jpg", { type: "image/jpeg" })

      // 上传图片并获取media_id
      const mediaId = await handleCoverImageUpload(file)

      if (mediaId) {
        // 如果上传成功，更新草稿状态
        setDraft(prev => ({
          ...prev,
          thumb_media_id: mediaId
        }))
      }
    } catch (error) {
      console.error("处理裁剪图片失败:", error)
      tip('处理裁剪图片失败')
    }
  }

  const handleSave = useCallback(async () => {
    if (!accessToken || !draft.title || !draft.content || !draft.thumb_media_id) {
      tip('请填写标题、内容并上传封面图片')
      return
    }

    try {
      if (mediaId) {
        await updateDraft(mediaId, index, draft)
      } else {
        await createDraft([draft])
      }
      onSave()
    } catch (error) {
      console.error("Error saving draft:", error)
      tip('保存草稿失败，请稍后重试')
    }
  }, [draft, mediaId, index, accessToken, onSave, tip])

  const handleCancel = () => {
    onCancel()
  }

  const handleContentImageUpload = async (file: File) => {
    try {
      const { media_id, url } = await uploadMaterial(file, "image")
      return url
    } catch (error) {
      console.error("Error uploading content image:", error)
      tip('上传内容图片失败')
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
      tip('上传封面图片失败')
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

