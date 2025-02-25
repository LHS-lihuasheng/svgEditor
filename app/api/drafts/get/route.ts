import { NextResponse } from "next/server"
import { handleTokenRequest } from "@/lib/server/accessToken"

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
    const { media_id } = await request.json()

    const response = await fetch(`https://api.weixin.qq.com/cgi-bin/draft/get?access_token=${accessToken}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ media_id }),
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in get draft API:", error)
    return NextResponse.json({ error: "Failed to get draft" }, { status: 500 })
  }
}

