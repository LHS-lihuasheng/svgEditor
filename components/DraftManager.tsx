"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { fetchDrafts, type DraftItem } from "@/lib/api"
import { formatDistanceToNow } from "date-fns"
import { ChevronLeft, ChevronRight, Eye, Pencil, Trash, AlertCircle, RefreshCcw } from "lucide-react"

export default function DraftManager() {
  const [drafts, setDrafts] = useState<DraftItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [offset, setOffset] = useState(0)
  const [total, setTotal] = useState(0)
  const [selectedDraft, setSelectedDraft] = useState<DraftItem | null>(null)
  const count = 10 // Items per page

  const loadDrafts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetchDrafts(offset, count)

      if ("error" in response) {
        throw new Error(response.error)
      }

      setDrafts(response.item || [])
      setTotal(response.total_count || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取草稿列表失败")
    } finally {
      setLoading(false)
    }
  }, [offset])

  useEffect(() => {
    loadDrafts()
  }, [loadDrafts])

  const handleNextPage = () => {
    if (offset + count < total) {
      setOffset(offset + count)
    }
  }

  const handlePrevPage = () => {
    if (offset - count >= 0) {
      setOffset(offset - count)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">草稿管理</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadDrafts} disabled={loading}>
            <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            刷新
          </Button>
          <Button>新建草稿</Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>错误</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
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
              Array(count)
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
                  <TableCell>
                    <Badge variant={draft.content.news_item[0].article_type === "news" ? "default" : "secondary"}>
                      {draft.content.news_item[0].article_type === "news" ? "图文" : "图片"}
                    </Badge>
                  </TableCell>
                  <TableCell>{draft.content.news_item[0].author || "-"}</TableCell>
                  <TableCell>{formatDistanceToNow(draft.update_time * 1000, { addSuffix: true })}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedDraft(draft)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between p-4">
          <div className="text-sm text-muted-foreground">共 {total} 条记录</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevPage} disabled={offset === 0 || loading}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">第 {Math.floor(offset / count) + 1} 页</span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextPage}
              disabled={offset + count >= total || loading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={!!selectedDraft} onOpenChange={() => setSelectedDraft(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>草稿预览</DialogTitle>
          </DialogHeader>
          {selectedDraft && (
            <div className="space-y-4">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={selectedDraft.content.news_item[0].url || "/placeholder.svg"}
                  alt={selectedDraft.content.news_item[0].title}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold">{selectedDraft.content.news_item[0].title}</h3>
              {selectedDraft.content.news_item[0].digest && (
                <p className="text-muted-foreground">{selectedDraft.content.news_item[0].digest}</p>
              )}
              <div
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{
                  __html: selectedDraft.content.news_item[0].content,
                }}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedDraft(null)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

