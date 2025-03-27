import { NextResponse } from "next/server"
import { handleTokenRequest } from "@/lib/server/accessToken"

const WECHAT_API_BASE = "https://api.weixin.qq.com/cgi-bin"

export async function POST(request: Request) {
  try {
    const tokenResponse = await handleTokenRequest()

    if ("errcode" in tokenResponse) {
      return NextResponse.json(
        { "errcode": tokenResponse.errcode, "errmsg": tokenResponse.errmsg },
        { status: 200 }
      )
    }

    const accessToken = tokenResponse.access_token
    const { offset, count, no_content } = await request.json()

    const response = await fetch(`${WECHAT_API_BASE}/draft/batchget?access_token=${accessToken}`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        offset: Number(offset) || 0,
        count: Math.min(Number(count) || 20, 20), // Ensure count doesn't exceed API limit
        no_content: Number(no_content) || 0,
      }),
    })

    const data = await response.json()

    if (data.errcode) {
      throw new Error(`WeChat API Error: ${data.errmsg}`)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in drafts API:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch drafts" },
      { status: 500 },
    )
  }
}

