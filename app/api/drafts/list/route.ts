import { NextResponse } from "next/server"
import { getAccessToken } from "@/lib/accessToken"

export async function POST(request: Request) {
  try {
    const accessToken = await getAccessToken()
    const { offset, count } = await request.json()

    const response = await fetch(`https://api.weixin.qq.com/cgi-bin/draft/batchget?access_token=${accessToken}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ offset, count }),
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch drafts" }, { status: 500 })
  }
}

