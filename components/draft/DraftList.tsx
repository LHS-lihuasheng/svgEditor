"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchDrafts, type DraftItem, deleteDraft, getDraft, type NewsItem } from "@/lib/api"
import { formatDistanceToNow } from "date-fns"
import { Eye, Pencil, Trash, RefreshCw } from "lucide-react"
import { useAccessToken } from "@/lib/accessToken"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { QRCodeSVG } from "qrcode.react"

export default function DraftList() {
  const [drafts, setDrafts] = useState<DraftItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { token, error: tokenError } = useAccessToken()
  const { value: cachedDrafts, setValue: setCachedDrafts } = useLocalStorage<DraftItem[]>("cachedDrafts", [])
  const [previewDraft, setPreviewDraft] = useState<NewsItem | null>(null)

  const loadDrafts = useCallback(
    async (forceRefresh = false) => {
      if (!token) return

      try {
        setLoading(true)
        setError(null)

        if (!forceRefresh && cachedDrafts.length > 0) {
          setDrafts(cachedDrafts)
          setLoading(false)
          return
        }

        const response = await fetchDrafts(0, 10)

        if ("error" in response) {
          throw new Error(response.error)
        }

        const newDrafts = response.item || []
        setDrafts(newDrafts)
        setCachedDrafts(newDrafts)
      } catch (err) {
        setError(err instanceof Error ? err.message : "获取草稿列表失败")
      } finally {
        setLoading(false)
      }
    },
    [token, cachedDrafts, setCachedDrafts],
  )

  useEffect(() => {
    if (token) {
      loadDrafts()
    }
  }, [loadDrafts, token])

  const handleRefresh = () => {
    loadDrafts(true)
  }

  const handleDeleteDraft = async (mediaId: string) => {
    try {
      await deleteDraft(mediaId)
      toast.success("草稿已成功删除")
      loadDrafts(true) // 强制刷新列表
    } catch (error) {
      toast.error("删除草稿失败")
      console.error("Error deleting draft:", error)
    }
  }

  const handlePreviewDraft = async (mediaId: string) => {
    try {
      const draft = await getDraft(mediaId)
      setPreviewDraft(draft)
    } catch (error) {
      toast.error("获取草稿预览失败")
      console.error("Error getting draft preview:", error)
    }
  }

  if (tokenError) {
    return <div>错误：无法获取访问令牌。请稍后再试。</div>
  }

  if (!token) {
    return <div>正在加载访问令牌...</div>
  }

  return (
    <Card>
      <div className="p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">草稿列表</h2>
        <Button onClick={handleRefresh} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          刷新
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>标题</TableHead>
            <TableHead>类型</TableHead>
            <TableHead>作者</TableHead>
            <TableHead>更新时间</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array(10)
              .fill(0)
              .map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-[250px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                </TableRow>
              ))
          ) : drafts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                {error ? "加载失败" : "暂无草稿"}
              </TableCell>
            </TableRow>
          ) : (
            drafts.map((draft) => (
              <TableRow key={draft.media_id}>
                <TableCell className="font-medium">{draft.content.news_item[0].title}</TableCell>
                <TableCell>{draft.content.news_item[0].article_type === "news" ? "图文" : "图片"}</TableCell>
                <TableCell>{draft.content.news_item[0].author || "-"}</TableCell>
                <TableCell>{formatDistanceToNow(draft.update_time * 1000, { addSuffix: true })}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handlePreviewDraft(draft.media_id)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteDraft(draft.media_id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {previewDraft && (
        <Dialog open={!!previewDraft} onOpenChange={() => setPreviewDraft(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>草稿预览</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <h2 className="text-xl font-bold">{previewDraft.title}</h2>
              <p className="text-sm text-gray-500">作者: {previewDraft.author}</p>
              <div className="mt-4" dangerouslySetInnerHTML={{ __html: previewDraft.content }} />
              {previewDraft.url && (
                <div className="mt-4">
                  <p>预览链接：</p>
                  <a
                    href={previewDraft.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {previewDraft.url}
                  </a>
                  <div className="mt-2">
                    <QRCodeSVG value={previewDraft.url} />
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  )
}

