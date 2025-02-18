import type { NewsItem } from "@/types/draft"

const WECHAT_API_BASE = "https://api.weixin.qq.com/cgi-bin"

// 获取草稿列表
export async function fetchDraftList(offset = 0, count = 20) {
  const response = await fetch("/api/drafts/list", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ offset, count }),
  })
  return response.json()
}

// 获取单个草稿
export async function fetchDraft(mediaId: string) {
  const response = await fetch("/api/drafts/get", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ media_id: mediaId }),
  })
  return response.json()
}

// 新建草稿
export async function createDraft(articles: NewsItem[]) {
  const response = await fetch("/api/drafts/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ articles }),
  })
  return response.json()
}

// 更新草稿
export async function updateDraft(mediaId: string, index: number, article: NewsItem) {
  const response = await fetch("/api/drafts/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      media_id: mediaId,
      index,
      articles: article,
    }),
  })
  return response.json()
}

// 删除草稿
export async function deleteDraft(mediaId: string) {
  const response = await fetch("/api/drafts/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ media_id: mediaId }),
  })
  return response.json()
}

// 获取草稿总数
export async function getDraftCount() {
  const response = await fetch("/api/drafts/count")
  return response.json()
}

