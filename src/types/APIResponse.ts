export type ErrorResponse = {
    errcode: number
    errmsg: string
}

export type TokenResponse = {
    access_token: string
    expires_in: number
}

export type TokenCache = {
    token: string | null;
    expiresAt: number | null;
}

