import { NextResponse } from "next/server"
import { getAccessToken } from "@/lib/accessToken"

const MAX_SIZES = {
  image: 10 * 1024 * 1024, // 10MB
  voice: 2 * 1024 * 1024,  // 2MB
  video: 10 * 1024 * 1024, // 10MB
  thumb: 64 * 1024,        // 64KB
}

const ALLOWED_TYPES = {
  image: ["image/jpeg", "image/png", "image/gif", "image/bmp"],
  voice: ["audio/mp3", "audio/wma", "audio/wav", "audio/amr"],
  video: ["video/mp4"],
  thumb: ["image/jpeg"],
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") as "image" | "voice" | "video" | "thumb"

    if (!type || !Object.keys(MAX_SIZES).includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    const formData = await request.formData()
    const file = formData.get("media") as File
    const description = formData.get("description")

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // 验证文件格式和大小
    if (!ALLOWED_TYPES[type].includes(file.type)) {
      return NextResponse.json({ error: "Invalid file format" }, { status: 400 })
    }

    if (file.size > MAX_SIZES[type]) {
      return NextResponse.json({ error: "File too large" }, { status: 400 })
    }

    const token = await getAccessToken()
    const uploadUrl = `https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=${token}&type=${type}`

    const wxFormData = new FormData()
    wxFormData.append("media", file)
    
    if (type === "video" && description) {
      wxFormData.append("description", description)
    }

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: wxFormData,
    })

    const data = await response.json()

    if (data.errcode) {
      throw new Error(data.errmsg)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error uploading material:", error)
    return NextResponse.json(
      { error: "Failed to upload material" },
      { status: 500 }
    )
  }
} 