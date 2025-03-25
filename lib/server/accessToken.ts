const APPID = process.env.NEXT_PUBLIC_WECHAT_APPID
const SECRET = process.env.NEXT_PUBLIC_WECHAT_SECRET

export type AccessTokenResponse = {
    access_token: string
    expires_in: number
}

export type AccessTokenError = {
    errcode: number
    errmsg: string
}

// 保存token和过期时间
let accessToken: string | null = null
let expirationTime: number | null = null

/**
 * 请求微信接口获取token
 * 请求成功，更新token和过期时间并返回
 * 请求失败，返回错误信息
 */
async function fetchAccessToken(): Promise<AccessTokenResponse | AccessTokenError> {
    try {
        console.log("请求微信接口获取token")
        const response = await fetch(
            `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${SECRET}`
        )
        const data: AccessTokenResponse | AccessTokenError = await response.json()
        console.log("data", data)

        if ("errcode" in data) return data

        accessToken = (data as AccessTokenResponse).access_token
        expirationTime = Date.now() + ((data as AccessTokenResponse).expires_in - 300) * 1000 // 提前5分钟过期

        return data
    } catch (error) {
        console.error("Error fetching access token:", error)
        throw error
    }
}

/**
 * 获取当前令牌的剩余有效期（秒）
 */
export function getTokenExpiresIn(): number {
    if (!expirationTime) return 0
    const remainingTime = Math.max(0, expirationTime - Date.now())
    return Math.floor(remainingTime / 1000)
}

/**
 * API路由处理函数
 * 返回请求结果
 */
export async function handleTokenRequest(): Promise<AccessTokenResponse | AccessTokenError> {
    try {
        // 存在token且未过期，直接返回
        if (accessToken && expirationTime && Date.now() < expirationTime) {
            console.log("accessToken", accessToken)
            return ({
                access_token: accessToken,
                expires_in: getTokenExpiresIn()
            })
        }

        const result = await fetchAccessToken()
        return result
    } catch (error) {
        throw error
    }
}

