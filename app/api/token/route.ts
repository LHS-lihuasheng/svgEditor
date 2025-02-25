import { handleTokenRequest } from "@/lib/server/accessToken"

export const GET = async () => {
    const result = await handleTokenRequest()
    return Response.json(result)
}
