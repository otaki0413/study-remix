/**
 * メールアドレスとパスワードのバリデーション
 * @param email - メールアドレス
 * @param password - パスワード
 * @returns エラーメッセージを格納したオブジェクト、またはnull
 */
export function validate(email: string, password: string) {
  // エラーメッセージを格納するためのオブジェクト
  const errors: { email?: string; password?: string } = {};

  // メールアドレスのバリデーション
  if (!email) {
    errors.email = "Email is required.";
  } else if (!email.includes("@")) {
    errors.email = "Please enter a valid email address.";
  }

  // パスワードのバリデーション
  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < 6) {
    errors.password = "Password must be as least 6 characters.";
  }

  return Object.keys(errors).length ? errors : null;
}
