import { prisma } from "../../db/prisma";
import crypto from "crypto";

/**
 * サインアップ処理
 * @param email - メールアドレス
 * @param password - パスワード
 * @returns 生成されたアカウント情報
 */
export async function createAccount(email: string, password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha256")
    .toString("hex");

  return prisma.account.create({
    data: {
      email: email,
      Password: {
        create: {
          hash: hash,
          salt: salt,
        },
      },
    },
  });
}
