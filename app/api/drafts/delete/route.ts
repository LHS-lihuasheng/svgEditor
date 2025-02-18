import { NextResponse } from "next/server"
import { getAccessToken } from "@/lib/accessToken"

export async function POST(request: Request) {
  try {
    const accessToken = await getAccessToken()
    const { media_id } = await request.json()

    const response = await fetch(`https://api.weixin.qq.com/cgi-bin/draft/delete?access_token=${accessToken}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ media_id }),
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in delete draft API:", error)
    return NextResponse.json({ error: "Failed to delete draft" }, { status: 500 })
  }
}

