/**
 * メールアドレスとパスワードのバリデーション
 * @param email - メールアドレス
 * @param password - パスワード
 * @returns エラーメッセージを格納したオブジェクト、またはnull
 */
export function validate(email: string, password: string) {
  const errors: { email?: string; password?: string } = {};

  if (!email) {
    errors.email = "Email is required.";
  } else if (!email.includes("@")) {
    errors.email = "Please enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  }

  return Object.keys(errors).length ? errors : null;
}
