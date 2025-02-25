"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchDrafts, type DraftItem, deleteDraft, getDraft, type NewsItem } from "@/lib/api"
import { formatDistanceToNow } from "date-fns"
import { Eye, Pencil, Trash, RefreshCw } from "lucide-react"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { QRCodeSVG } from "qrcode.react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function DraftList() {
  const [drafts, setDrafts] = useState<DraftItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const { value: cachedDrafts, setValue: setCachedDrafts } = useLocalStorage<DraftItem[]>("cachedDrafts", [])
  const { value: cachedToken, setValue: setCachedToken } = useLocalStorage<{ token: string, expiry: number } | null>("accessToken", null)
  const [previewDraft, setPreviewDraft] = useState<NewsItem | null>(null)

  // 获取访问令牌
  useEffect(() => {
    const fetchToken = async () => {
      // 先检查本地缓存的token是否有效
      if (cachedToken && cachedToken.expiry > Date.now()) {
        setAccessToken(cachedToken.token)
        return
      }

      try {
        const response = await fetch('/api/token')
        const data = await response.json()
        
        if (response.ok) {
          setAccessToken(data.access_token)
          // 计算过期时间并缓存token
          const expiryTime = Date.now() + (data.expires_in * 1000) // 正确计算过期时间
          setCachedToken({
            token: data.access_token,
            expiry: expiryTime
          })
          setTokenError(null)
        } else {
          setTokenError(data.error || '获取访问令牌失败')
          setAccessToken(null)
          setCachedToken(null)
        }
      } catch (err) {
        setTokenError(err instanceof Error ? err.message : '获取访问令牌失败')
        setAccessToken(null)
        setCachedToken(null)
      }
    }

    fetchToken()

    // 使用空依赖数组，确保该effect仅在组件挂载时运行一次
  }, [])

  // 可以添加另一个useEffect来监听cachedToken的变化
  useEffect(() => {
    if (cachedToken && cachedToken.expiry > Date.now()) {
      setAccessToken(cachedToken.token)
    }
  }, [cachedToken])

  const loadDrafts = useCallback(
    async (forceRefresh = false) => {
      if (!accessToken) return

      try {
        setLoading(true)
        setError(null)

        // 如果不强制刷新且有缓存，使用缓存
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
    [accessToken, cachedDrafts, setCachedDrafts],
  )

  useEffect(() => {
    if (accessToken) {
      loadDrafts()
    }
  }, [loadDrafts, accessToken])

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
    return <div>错误：无法获取访问令牌。{tokenError}</div>
  }

  if (!accessToken) {
    return <>
      <AlertDialog>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>无法访问</AlertDialogTitle>
            <AlertDialogDescription>
              无法获取访问令牌，请稍后再试
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction>确认</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
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

