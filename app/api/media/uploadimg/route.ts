import { NextResponse } from "next/server"
import { handleTokenRequest } from "@/lib/server/accessToken"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("media") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // 验证文件格式和大小
    if (!file.type.match(/^image\/(jpeg|png)$/)) {
      return NextResponse.json({ error: "Invalid file format" }, { status: 400 })
    }

    if (file.size > 1024 * 1024) { // 1MB
      return NextResponse.json({ error: "File too large" }, { status: 400 })
    }

    const tokenResponse = await handleTokenRequest()

    if ("errcode" in tokenResponse) {
      return NextResponse.json(
        { "errcode": tokenResponse.errcode, "errmsg": tokenResponse.errmsg },
        { status: 200 }
      )
    }

    const accessToken = tokenResponse.access_token
    const uploadUrl = `https://api.weixin.qq.com/cgi-bin/media/uploadimg?access_token=${accessToken}`

    const wxFormData = new FormData()
    wxFormData.append("media", file)

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
    console.error("Error uploading image:", error)
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    )
  }
} 