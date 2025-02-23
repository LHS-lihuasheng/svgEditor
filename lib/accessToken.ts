"use client"

import { useState, useEffect } from "react"

const WECHAT_API_BASE = "https://api.weixin.qq.com/cgi-bin"
const APPID = process.env.NEXT_PUBLIC_WECHAT_APPID
const SECRET = process.env.NEXT_PUBLIC_WECHAT_SECRET

interface AccessTokenResponse {
  access_token: string
  expires_in: number
}

interface AccessTokenError {
  errcode: number
  errmsg: string
}

let accessToken: string | null = null
let expirationTime: number | null = null

export async function getAccessToken(): Promise<string> {
  if (accessToken && expirationTime && Date.now() < expirationTime) {
    return accessToken
  }

  try {
    // 修改为调用本地API路由
    const response = await fetch('/api/token')
    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to get access token')
    }

    accessToken = result.access_token
    // 使用API返回的过期时间（单位秒转换为毫秒）
    expirationTime = Date.now() + result.expires_in * 1000

    return accessToken as string
  } catch (error) {
    console.error("Error fetching access token:", error)
    throw error
  }
}

export function useAccessToken() {
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isMounted = true
    let refreshInterval: NodeJS.Timeout

    const fetchToken = async () => {
      try {
        const newToken = await getAccessToken()
        if (isMounted) {
          setToken(newToken)
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Failed to fetch access token"))
        }
      }
    }

    fetchToken()

    refreshInterval = setInterval(fetchToken, 60 * 60 * 1000) // Refresh every hour

    return () => {
      isMounted = false
      clearInterval(refreshInterval)
    }
  }, [])

  return { token, error }
}

