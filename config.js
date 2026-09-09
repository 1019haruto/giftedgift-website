// サイト共通の設定ファイル
// Apps Scriptのデプロイで取得したURLと、管理者ページのパスワードをここに設定してください。

const SITE_CONFIG = {
  // 例: "https://script.google.com/macros/s/AKfycb.../exec"
  SUBMISSION_ENDPOINT: "https://script.google.com/macros/s/AKfycbzwttIqRin12N8pKyaSLH7Esi2br07XT-UfNm52y6dCs4eoeqgpLZFcSMgLDnhCqQYSXg/exec",

  // 管理者パスワードはここには書きません（公開ファイルなので誰でも読めてしまいます）。
  // admin-dashboard.html で入力したパスワードをそのままApps Scriptに送って認証します。
  // Apps Script側のSECRETは admin-dashboard.html で入力する値と同じにしてください。

  // LINEログインチャネルのチャネルID（チャネルシークレットではありません。これは公開情報です）
  LINE_LOGIN_CHANNEL_ID: "2011523364",

  // LINE Developersの「コールバックURL」に登録したものと同じURL（Apps ScriptのWebアプリURL）
  LINE_LOGIN_REDIRECT_URI: "https://script.google.com/macros/s/AKfycbzwttIqRin12N8pKyaSLH7Esi2br07XT-UfNm52y6dCs4eoeqgpLZFcSMgLDnhCqQYSXg/exec",
};
