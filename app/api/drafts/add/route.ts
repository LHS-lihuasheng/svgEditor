import { NextResponse } from "next/server"
import { getAccessToken } from "@/lib/accessToken"

export async function POST(request: Request) {
  try {
    const accessToken = await getAccessToken()
    const { articles } = await request.json()

    const response = await fetch(`https://api.weixin.qq.com/cgi-bin/draft/add?access_token=${accessToken}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ articles }),
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in add draft API:", error)
    return NextResponse.json({ error: "Failed to add draft" }, { status: 500 })
  }
}

