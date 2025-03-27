import type { TokenResponse, ErrorResponse, TokenCache } from "@/types/APIResponse"

const APPID = process.env.NEXT_PUBLIC_WECHAT_APPID
const SECRET = process.env.NEXT_PUBLIC_WECHAT_SECRET

// 服务器内存缓存
let tokenCache: TokenCache = {
    token: null,
    expiresAt: null
};

/**
 * 从微信服务器获取新 token
 */
async function fetchAccessToken(): Promise<TokenResponse | ErrorResponse> {
    try {
        const response = await fetch(
            `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${SECRET}`,
            {
                cache: "no-store",
            }
        );
        const data = await response.json() as TokenResponse | ErrorResponse;

        if ("errcode" in data) return data;

        // 计算过期时间（提前5分钟过期）
        const expiresAt = Date.now() + (data.expires_in - 300) * 1000;
        
        // 更新服务器内存缓存
        tokenCache = {
            token: data.access_token,
            expiresAt
        };

        return data;
    } catch (error) {
        console.error("获取微信 access token 失败:", error);
        throw error;
    }
}

/**
 * 获取令牌剩余有效期（秒）
 */
export function getTokenExpiresIn(): number {
    if (!tokenCache.expiresAt) return 0;
    return Math.max(0, Math.floor((tokenCache.expiresAt - Date.now()) / 1000));
}

/**
 * 获取有效的 access token
 * 在服务器端使用内存缓存
 */
export async function handleTokenRequest(): Promise<TokenResponse | ErrorResponse> {
    // 检查服务器内存缓存是否有效
    if (tokenCache.token && tokenCache.expiresAt && Date.now() < tokenCache.expiresAt) {
        return {
            access_token: tokenCache.token,
            expires_in: getTokenExpiresIn()
        };
    }
    
    // 内存缓存无效，获取新 token
    return await fetchAccessToken();
}