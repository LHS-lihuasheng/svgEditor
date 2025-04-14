"use client"

import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchDrafts, type DraftItem, deleteDraft, getDraft, type NewsItem } from "@/lib/api"
import { formatDistanceToNow } from "date-fns"
import { Eye, Pencil, Trash, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { QRCodeSVG } from "qrcode.react"
import { useMessage } from '@/contexts/MessageContext'

interface DraftListProps {
  onEditDraft?: (draft: NewsItem, mediaId: string) => void
}

const DraftList = forwardRef<{ loadDrafts: () => void }, DraftListProps>(({ onEditDraft }, ref) => {
  const [drafts, setDrafts] = useState<DraftItem[]>([])
  const [loading, setLoading] = useState(true)
  const [previewDraft, setPreviewDraft] = useState<NewsItem | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const { tip } = useMessage()

  // 加载草稿列表
  const loadDrafts = async () => {
    try {
      setLoading(true)
      const response = await fetchDrafts(0, 10)

      if ("error" in response) {
        throw new Error(response.error)
      }

      if ("errcode" in response) {
        throw new Error(`微信API错误: ${response.errmsg} (错误码: ${response.errcode})`)
      }

      setDrafts(response.item || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "获取草稿列表失败"
      tip(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // 暴露加载函数给父组件
  useImperativeHandle(ref, () => ({
    loadDrafts
  }))

  // 删除草稿
  const handleDeleteDraft = async (mediaId: string) => {
    try {
      const response = await deleteDraft(mediaId)

      if (response.errcode) {
        tip(`删除草稿失败: ${response.errmsg} (错误码: ${response.errcode})`)
        return
      }

      toast.success("草稿已成功删除")
      loadDrafts()
    } catch (error) {
      tip("删除草稿失败，请稍后重试")
      console.error("Error deleting draft:", error)
    } finally {
      setConfirmDelete(null)
    }
  }

  // 预览草稿
  const handlePreviewDraft = async (mediaId: string) => {
    try {
      const draft = await getDraft(mediaId)

      if ("errcode" in draft) {
        tip(`获取草稿预览失败: ${draft.errmsg} (错误码: ${draft.errcode})`)
        return
      }

      setPreviewDraft(draft)
    } catch (error) {
      tip("获取草稿预览失败，请稍后重试")
      console.error("Error getting draft preview:", error)
    }
  }

  // 编辑草稿
  const handleEditDraft = async (mediaId: string) => {
    try {
      const draft = await getDraft(mediaId)

      if ("errcode" in draft) {
        tip(`获取草稿失败: ${draft.errmsg} (错误码: ${draft.errcode})`)
        return
      }

      if (onEditDraft) {
        onEditDraft(draft, mediaId)
      }
    } catch (error) {
      tip("获取草稿失败，请稍后重试")
      console.error("Error getting draft for edit:", error)
    }
  }

  // 组件挂载时加载草稿列表
  useEffect(() => {
    console.log("加载草稿列表")
    loadDrafts()
    console.log("草稿列表加载完成")
  }, [])

  return (
    <Card>
      <div className="p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">草稿列表</h2>
        <Button onClick={loadDrafts} disabled={loading}>
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
            Array(5).fill(0).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
              </TableRow>
            ))
          ) : drafts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                暂无草稿
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
                  <Button variant="ghost" size="icon" onClick={() => handleEditDraft(draft.media_id)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setConfirmDelete(draft.media_id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* 预览对话框 */}
      {previewDraft && (
        <Dialog open={!!previewDraft} onOpenChange={() => setPreviewDraft(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>草稿预览</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <h2 className="text-xl font-bold">{previewDraft.title}</h2>
              <p className="text-sm text-gray-500">作者: {previewDraft.author || '未指定'}</p>
              <div className="mt-4" dangerouslySetInnerHTML={{ __html: previewDraft.content }} />
              {previewDraft.url && (
                <div className="mt-4">
                  <p>预览链接：</p>
                  <a href={previewDraft.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {previewDraft.url}
                  </a>
                  <div className="mt-2 flex justify-center">
                    <QRCodeSVG value={previewDraft.url} size={200} />
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* 删除确认对话框 */}
      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              此操作无法撤销，确定要删除此草稿吗？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>取消</Button>
            <Button variant="destructive" onClick={() => confirmDelete && handleDeleteDraft(confirmDelete)}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
})

DraftList.displayName = "DraftList"

export default DraftList