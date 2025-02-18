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
    const response = await fetch(
      `${WECHAT_API_BASE}/token?grant_type=client_credential&appid=${APPID}&secret=${SECRET}`,
    )
    const data: AccessTokenResponse | AccessTokenError = await response.json()

    if ("errcode" in data) {
      throw new Error(`Failed to get access token: ${data.errmsg}`)
    }

    accessToken = data.access_token
    expirationTime = Date.now() + (data.expires_in - 300) * 1000 // Subtract 5 minutes for safety

    return accessToken
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

