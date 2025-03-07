import type { NewsItem as DraftNewsItem } from "@/types/draft"

export interface NewsItem extends Omit<DraftNewsItem, "url"> {
  url: string
}

export type DraftItem = {
  media_id: string
  content: {
    news_item: NewsItem[]
  }
  update_time: number
}

export type DraftResponse = {
  total_count: number
  item_count: number
  item: DraftItem[]
  error?: string
}

export async function fetchDrafts(offset = 0, count = 20, no_content = 0): Promise<DraftResponse> {
  try {
    const response = await fetch("/api/drafts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ offset, count, no_content }),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch drafts")
    }

    return response.json()
  } catch (error) {
    console.error("Error fetching drafts:", error)
    throw error
  }
}

export async function createDraft(drafts: DraftNewsItem[]): Promise<{ media_id: string }> {
  try {
    const response = await fetch("/api/drafts/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ articles: drafts }),
    })

    if (!response.ok) {
      throw new Error("Failed to create draft")
    }

    return response.json()
  } catch (error) {
    console.error("Error creating draft:", error)
    throw error
  }
}

export async function updateDraft(
  mediaId: string,
  index: number,
  draft: DraftNewsItem,
): Promise<{ errcode: number; errmsg: string }> {
  try {
    const response = await fetch("/api/drafts/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ media_id: mediaId, index, articles: draft }),
    })

    if (!response.ok) {
      throw new Error("Failed to update draft")
    }

    return response.json()
  } catch (error) {
    console.error("Error updating draft:", error)
    throw error
  }
}

export async function getDraft(mediaId: string): Promise<NewsItem> {
  try {
    const response = await fetch("/api/drafts/get", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ media_id: mediaId }),
    })

    if (!response.ok) {
      throw new Error("Failed to get draft")
    }

    return response.json()
  } catch (error) {
    console.error("Error getting draft:", error)
    throw error
  }
}

export async function deleteDraft(mediaId: string): Promise<{ errcode: number; errmsg: string }> {
  try {
    const response = await fetch("/api/drafts/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ media_id: mediaId }),
    })

    if (!response.ok) {
      throw new Error("Failed to delete draft")
    }

    return response.json()
  } catch (error) {
    console.error("Error deleting draft:", error)
    throw error
  }
}

// 上传永久素材
export async function uploadMaterial(
  file: File,
  type: "image" | "thumb" | "video" | "voice",
  description?: string
): Promise<{ media_id: string; url?: string }> {
  const formData = new FormData()
  formData.append("media", file)

  if (type === "video" && description) {
    formData.append("description", description)
  }

  const response = await fetch(`/api/material/add?type=${type}`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error("Failed to upload material")
  }

  return response.json()
}

