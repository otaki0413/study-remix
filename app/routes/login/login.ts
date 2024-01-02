import crypto from "crypto";
import { prisma } from "../../db/prisma";

/**
 * ログイン処理
 * @param email - メールアドレス
 * @param password - パスワード
 * @returns ユーザーID
 */
export async function login(email: string, password: string) {
  // メールアドレスに一致するユーザー取得
  const user = await prisma.account.findUnique({
    where: {
      email: email,
    },
    include: {
      Password: true,
    },
  });

  // ユーザーの存在とパスワード有無チェック
  if (!user || !user.Password) {
    return false;
  }

  // パスワードのハッシュ化
  const hash = crypto
    .pbkdf2Sync(password, user.Password.salt, 1000, 64, "sha256")
    .toString("hex");

  // データベース内のハッシュと比較
  if (hash !== user.Password.hash) {
    return false;
  }

  return user.id;
}
