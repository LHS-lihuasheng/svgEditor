import { NextResponse } from "next/server"

const WECHAT_API_BASE = "https://api.weixin.qq.com/cgi-bin"
const APPID = process.env.NEXT_PUBLIC_WECHAT_APPID
const SECRET = process.env.NEXT_PUBLIC_WECHAT_SECRET

let accessToken: string | null = null
let expirationTime: number | null = null

async function getAccessToken(): Promise<string> {
  if (accessToken && expirationTime && Date.now() < expirationTime) {
    return accessToken
  }

  try {
    const response = await fetch(
      `${WECHAT_API_BASE}/token?grant_type=client_credential&appid=${APPID}&secret=${SECRET}`
    )
    const data: AccessTokenResponse | AccessTokenError = await response.json()

    if ("errcode" in data) {
      throw new Error(`Failed to get access token: ${data.errmsg}`)
    }

    accessToken = data.access_token
    expirationTime = Date.now() + (data.expires_in - 300) * 1000
    return accessToken
  } catch (error) {
    console.error("Error fetching access token:", error)
    throw error
  }
}

export async function GET() {
  try {
    const token = await getAccessToken()
    return NextResponse.json({
      access_token: token,
      expires_in: expirationTime ? Math.round((expirationTime - Date.now()) / 1000) : 7200
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get access token" },
      { status: 500 }
    )
  }
}
