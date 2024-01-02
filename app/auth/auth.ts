import { createCookie, redirect } from "@remix-run/node";

let secret = process.env.COOKIE_SECRET || "default";
if (secret === "default") {
  console.warn(
    "🚨 No COOKIE_SECRET environment variable set, using default. The app is insecure in production.",
  );
  secret = "default-secret";
}

/**
 * クッキーの作成
 * https://remix.run/docs/en/main/utils/cookies#createcookie
 */
const cookie = createCookie("auth", {
  secrets: [secret],
  maxAge: 30 * 24 * 60 * 60, // クッキー期限(30days)
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
});

/**
 * リクエストからクッキーを解析して、ユーザーIDを取得する
 * @param request - Requestオブジェクト
 * @returns ユーザーID、クッキーが存在しない場合は null
 */
export async function getAuthFromRequest(
  request: Request,
): Promise<string | null> {
  const userId = await cookie.parse(request.headers.get("Cookie"));
  return userId ?? null;
}

/**
 * レスポンスヘッダーに生成したクッキーをセットする
 * @param response - Responseオブジェクト
 * @param userId - ユーザーID
 * @returns Responseオブジェクト
 */
export async function setAuthOnResponse(
  response: Response,
  userId: string,
): Promise<Response> {
  const header = await cookie.serialize(userId);
  response.headers.append("Set-Cookie", header);
  return response;
}

/**
 * ユーザーが認証済みであるかをチェックする
 * @param request - Requestオブジェクト
 * @returns ユーザーID
 */
export async function requireAuthCookie(request: Request) {
  const userId = await getAuthFromRequest(request);
  if (!userId) {
    throw redirect("/login", {
      headers: {
        "Set-Cookie": await cookie.serialize("", {
          maxAge: 0,
        }),
      },
    });
  }
  return userId;
}
